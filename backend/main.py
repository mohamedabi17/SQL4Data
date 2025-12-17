from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
import logging

from config import get_settings
from database import get_db, Base, async_engine
from schemas import (
    ExecuteQueryRequest,
    ExecuteQueryResponse,
    ExplainErrorRequest,
    ExplainErrorResponse,
    TaskListResponse,
    TaskResponse
)
from query_executor import query_executor
from ai_explainer import ai_explainer
from models import Task, UserQueryExecution

# Import auth modules
from auth.oauth import oauth_router
from auth.ads import ads_router
from auth.progress import progress_router
from auth.models import User, Subscription, DailyLimit, AdUnlock, UserProgress, UserStats

# Import payment router
from payment_router import router as payment_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SQL4Data API",
    description="Backend API for SQL Training Platform focused on Data Engineering",
    version="1.0.0"
)

settings = get_settings()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routers
app.include_router(oauth_router)
app.include_router(ads_router)
app.include_router(progress_router)
app.include_router(payment_router)


@app.on_event("startup")
async def startup():
    """Initialize database tables on startup"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified (including auth tables)")
    
    # Seed initial tasks if empty
    async with AsyncSession(async_engine) as session:
        result = await session.execute(select(Task))
        tasks = result.scalars().all()
        if not tasks:
            await seed_tasks(session)
            logger.info("Initial tasks seeded")


@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown"""
    query_executor.close()
    await async_engine.dispose()
    logger.info("Database connections closed")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SQL4Data API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test database connection
        async with AsyncSession(async_engine) as session:
            await session.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "database": "connected",
            "ai_service": "available" if ai_explainer.model else "disabled"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")


@app.post("/api/execute", response_model=ExecuteQueryResponse)
async def execute_query(
    request: ExecuteQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Execute user's SQL query and compare with expected result
    
    - Runs query in read-only transaction
    - Compares result with gold standard query
    - Returns detailed comparison
    """
    try:
        # Get task details
        result = await db.execute(select(Task).where(Task.task_id == request.task_id))
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(status_code=404, detail=f"Task {request.task_id} not found")
        
        # Execute user query
        user_df, user_error, execution_time = query_executor.execute_query(request.query)
        
        if user_error:
            # Log failed execution
            execution_record = UserQueryExecution(
                task_id=request.task_id,
                user_query=request.query,
                is_correct=0,
                execution_time_ms=execution_time,
                error_message=user_error
            )
            db.add(execution_record)
            await db.commit()
            
            return ExecuteQueryResponse(
                is_correct=False,
                user_data=[],
                expected_data=[],
                user_columns=[],
                expected_columns=[],
                error_message=user_error,
                execution_time_ms=execution_time,
                row_count=0,
                expected_row_count=0
            )
        
        # Execute gold standard query
        expected_df, expected_error, _ = query_executor.execute_query(task.gold_query)
        
        if expected_error:
            logger.error(f"Gold query error for task {request.task_id}: {expected_error}")
            raise HTTPException(status_code=500, detail="Internal error: Gold query failed")
        
        # Compare results
        is_correct, comparison_msg = query_executor.compare_results(user_df, expected_df)
        
        # Convert DataFrames to dictionaries
        user_data = query_executor.dataframe_to_dict(user_df)
        expected_data = query_executor.dataframe_to_dict(expected_df)
        
        # Log execution
        execution_record = UserQueryExecution(
            task_id=request.task_id,
            user_query=request.query,
            is_correct=1 if is_correct else 0,
            execution_time_ms=execution_time,
            error_message=None if is_correct else comparison_msg
        )
        db.add(execution_record)
        await db.commit()
        
        return ExecuteQueryResponse(
            is_correct=is_correct,
            user_data=user_data,
            expected_data=expected_data,
            user_columns=list(user_df.columns),
            expected_columns=list(expected_df.columns),
            error_message=None if is_correct else comparison_msg,
            execution_time_ms=execution_time,
            row_count=len(user_df),
            expected_row_count=len(expected_df)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Execute query error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/api/explain", response_model=ExplainErrorResponse)
async def explain_error(
    request: ExplainErrorRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI-powered explanation for query errors
    
    - Analyzes user's query and error
    - Provides pedagogical hints
    - Suggests concepts to review
    - Enforces daily usage limits (3 for free, 50 for premium)
    """
    from usage_limits import check_ai_usage_limit, increment_ai_usage, get_or_create_user
    
    try:
        # Get or create user (you'll need to pass email from frontend)
        email = request.user_email if hasattr(request, 'user_email') else "anonymous@example.com"
        user = get_or_create_user(email, db)
        
        # Check usage limits
        usage_status = check_ai_usage_limit(user, db)
        
        if not usage_status["allowed"]:
            tier_name = "Premium" if usage_status["is_premium"] else "Free"
            raise HTTPException(
                status_code=429,
                detail={
                    "message": f"Daily AI feedback limit reached ({usage_status['current']}/{usage_status['limit']})",
                    "limit": usage_status["limit"],
                    "remaining": 0,
                    "tier": usage_status["tier"],
                    "reset_in_hours": usage_status["reset_in_hours"],
                    "is_premium": usage_status["is_premium"],
                    "upgrade_message": "Upgrade to Premium for 50 AI feedbacks per day" if not usage_status["is_premium"] else "You've reached the fair use limit. Resets at midnight."
                }
            )
        
        # Get task details
        result = await db.execute(select(Task).where(Task.task_id == request.task_id))
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(status_code=404, detail=f"Task {request.task_id} not found")
        
        # Get schema information for the relevant tables
        tables = task.tables_involved.split(',') if task.tables_involved else []
        schema_info = await get_schema_info(tables, db)
        
        # Get AI explanation
        explanation, hints, concepts = await ai_explainer.explain_query_error(
            user_query=request.query,
            task_description=task.description,
            error_message=request.error_message,
            expected_result_sample=request.expected_result_sample,
            schema_info=schema_info
        )
        
        # Increment usage count AFTER successful AI call
        increment_ai_usage(user, db)
        
        # Update the last execution record with AI explanation
        result = await db.execute(
            select(UserQueryExecution)
            .where(UserQueryExecution.task_id == request.task_id)
            .order_by(UserQueryExecution.created_at.desc())
            .limit(1)
        )
        last_execution = result.scalar_one_or_none()
        if last_execution:
            last_execution.ai_explanation = explanation
            await db.commit()
        
        # Get updated usage status
        usage_status_updated = check_ai_usage_limit(user, db)
        
        return ExplainErrorResponse(
            explanation=explanation,
            hints=hints,
            suggested_concepts=concepts,
            usage_remaining=usage_status_updated["remaining"],
            usage_limit=usage_status_updated["limit"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Explain error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/tasks", response_model=TaskListResponse)
async def get_tasks(
    category: str = None,
    difficulty: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of all SQL tasks with optional filtering
    
    - Filter by category (select, join, subquery, etc.)
    - Filter by difficulty (beginner, intermediate, advanced, expert)
    """
    try:
        query = select(Task)
        
        if category:
            query = query.where(Task.category == category)
        if difficulty:
            query = query.where(Task.difficulty == difficulty)
        
        query = query.order_by(Task.task_id)
        
        result = await db.execute(query)
        tasks = result.scalars().all()
        
        # Get unique categories and difficulties
        all_tasks_result = await db.execute(select(Task))
        all_tasks = all_tasks_result.scalars().all()
        
        categories = sorted(list(set(t.category for t in all_tasks)))
        difficulties = sorted(list(set(t.difficulty for t in all_tasks)))
        
        task_responses = [
            TaskResponse(
                task_id=task.task_id,
                title=task.title,
                description=task.description,
                difficulty=task.difficulty,
                category=task.category,
                database_schema=task.database_schema,
                tables_involved=task.tables_involved.split(',') if task.tables_involved else []
            )
            for task in tasks
        ]
        
        return TaskListResponse(
            tasks=task_responses,
            total=len(task_responses),
            categories=categories,
            difficulties=difficulties
        )
    
    except Exception as e:
        logger.error(f"Get tasks error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: AsyncSession = Depends(get_db)):
    """Get details for a specific task"""
    try:
        result = await db.execute(select(Task).where(Task.task_id == task_id))
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
        
        return TaskResponse(
            task_id=task.task_id,
            title=task.title,
            description=task.description,
            difficulty=task.difficulty,
            category=task.category,
            database_schema=task.database_schema,
            tables_involved=task.tables_involved.split(',') if task.tables_involved else []
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get task error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


async def get_schema_info(tables: list[str], db: AsyncSession) -> str:
    """Get schema information for specified tables"""
    try:
        schema_parts = []
        for table in tables:
            table = table.strip()
            query = text(f"""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = '{table}'
                ORDER BY ordinal_position
            """)
            result = await db.execute(query)
            columns = result.fetchall()
            
            if columns:
                schema_parts.append(f"\nTable: {table}")
                for col in columns:
                    schema_parts.append(f"  - {col[0]} ({col[1]}){' NULL' if col[2] == 'YES' else ''}")
        
        return '\n'.join(schema_parts)
    except Exception as e:
        logger.error(f"Schema info error: {e}")
        return "Schema information unavailable"


async def seed_tasks(db: AsyncSession):
    """Seed initial tasks from the existing task list"""
    # Sample tasks - you can expand this with all 78 tasks
    sample_tasks = [
        Task(
            task_id=1,
            title="Select all customers",
            description="Select all columns from the customers table",
            difficulty="beginner",
            category="select",
            database_schema="ecommerce",
            gold_query="SELECT * FROM customers;",
            tables_involved="customers"
        ),
        Task(
            task_id=2,
            title="Select customer names",
            description="Select first_name and last_name from customers",
            difficulty="beginner",
            category="select",
            database_schema="ecommerce",
            gold_query="SELECT first_name, last_name FROM customers;",
            tables_involved="customers"
        ),
        Task(
            task_id=3,
            title="Select all tracks",
            description="Select all columns from the tracks table",
            difficulty="beginner",
            category="select",
            database_schema="music",
            gold_query="SELECT * FROM tracks;",
            tables_involved="tracks"
        ),
        # Add more tasks here...
    ]
    
    db.add_all(sample_tasks)
    await db.commit()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
