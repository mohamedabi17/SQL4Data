"""
User Progress API routes for SQL4DATA
Handles saving and loading user's task progress
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel
import json

from database import get_db
from auth.models import User, UserProgress, UserStats
from auth.jwt_handler import verify_token

progress_router = APIRouter(prefix="/api/progress", tags=["Progress"])

# Security scheme
security = HTTPBearer(auto_error=False)


# Pydantic models for request/response
class TaskProgressUpdate(BaseModel):
    task_id: str
    database_id: str
    is_completed: bool = False
    score: int = 0
    xp_earned: int = 0
    attempts: int = 0
    hints_used: int = 0
    solution_revealed: bool = False
    best_query: Optional[str] = None
    execution_time_ms: Optional[float] = None


class BulkProgressUpdate(BaseModel):
    progress: List[TaskProgressUpdate]


class UserStatsUpdate(BaseModel):
    total_xp: int = 0
    total_score: int = 0
    tasks_completed: int = 0
    tasks_attempted: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    level: int = 1
    badges: List[str] = []


async def get_user_from_token(
    credentials: HTTPAuthorizationCredentials,
    db: AsyncSession
) -> User:
    """Extract and validate user from JWT token"""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    payload = verify_token(credentials.credentials)
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@progress_router.get("/")
async def get_user_progress(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get all progress for the authenticated user
    Returns task completions and overall stats
    """
    user = await get_user_from_token(credentials, db)
    
    # Get all progress records
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user.id)
    )
    progress_records = result.scalars().all()
    
    # Get user stats
    stats_result = await db.execute(
        select(UserStats).where(UserStats.user_id == user.id)
    )
    stats = stats_result.scalar_one_or_none()
    
    progress_list = [
        {
            "task_id": p.task_id,
            "database_id": p.database_id,
            "is_completed": p.is_completed,
            "completed_at": p.completed_at.isoformat() if p.completed_at else None,
            "score": p.score,
            "xp_earned": p.xp_earned,
            "attempts": p.attempts,
            "hints_used": p.hints_used,
            "solution_revealed": p.solution_revealed,
            "best_query": p.best_query,
            "execution_time_ms": p.execution_time_ms,
        }
        for p in progress_records
    ]
    
    stats_data = None
    if stats:
        stats_data = {
            "total_xp": stats.total_xp,
            "total_score": stats.total_score,
            "tasks_completed": stats.tasks_completed,
            "tasks_attempted": stats.tasks_attempted,
            "current_streak": stats.current_streak,
            "longest_streak": stats.longest_streak,
            "level": stats.level,
            "badges": json.loads(stats.badges) if stats.badges else [],
        }
    
    return {
        "progress": progress_list,
        "stats": stats_data
    }


@progress_router.post("/task")
async def save_task_progress(
    progress_data: TaskProgressUpdate,
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Save progress for a single task
    Creates or updates the progress record
    """
    user = await get_user_from_token(credentials, db)
    
    # Check if progress exists
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user.id,
            UserProgress.task_id == progress_data.task_id
        )
    )
    progress = result.scalar_one_or_none()
    
    if progress:
        # Update existing progress
        progress.is_completed = progress_data.is_completed or progress.is_completed
        progress.score = max(progress.score, progress_data.score)
        progress.xp_earned = max(progress.xp_earned, progress_data.xp_earned)
        progress.attempts = progress_data.attempts
        progress.hints_used = max(progress.hints_used, progress_data.hints_used)
        progress.solution_revealed = progress.solution_revealed or progress_data.solution_revealed
        
        if progress_data.best_query:
            progress.best_query = progress_data.best_query
        if progress_data.execution_time_ms:
            if not progress.execution_time_ms or progress_data.execution_time_ms < progress.execution_time_ms:
                progress.execution_time_ms = progress_data.execution_time_ms
        
        if progress_data.is_completed and not progress.completed_at:
            progress.completed_at = datetime.utcnow()
    else:
        # Create new progress record
        progress = UserProgress(
            user_id=user.id,
            task_id=progress_data.task_id,
            database_id=progress_data.database_id,
            is_completed=progress_data.is_completed,
            completed_at=datetime.utcnow() if progress_data.is_completed else None,
            score=progress_data.score,
            xp_earned=progress_data.xp_earned,
            attempts=progress_data.attempts,
            hints_used=progress_data.hints_used,
            solution_revealed=progress_data.solution_revealed,
            best_query=progress_data.best_query,
            execution_time_ms=progress_data.execution_time_ms,
        )
        db.add(progress)
    
    await db.commit()
    await db.refresh(progress)
    
    return {
        "success": True,
        "task_id": progress.task_id,
        "is_completed": progress.is_completed
    }


@progress_router.post("/bulk")
async def save_bulk_progress(
    bulk_data: BulkProgressUpdate,
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Save progress for multiple tasks at once
    Used for syncing local storage with server
    """
    user = await get_user_from_token(credentials, db)
    
    saved_count = 0
    for progress_data in bulk_data.progress:
        # Check if progress exists
        result = await db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user.id,
                UserProgress.task_id == progress_data.task_id
            )
        )
        progress = result.scalar_one_or_none()
        
        if progress:
            # Update existing - keep best values
            progress.is_completed = progress_data.is_completed or progress.is_completed
            progress.score = max(progress.score, progress_data.score)
            progress.xp_earned = max(progress.xp_earned, progress_data.xp_earned)
            progress.attempts = max(progress.attempts, progress_data.attempts)
            progress.hints_used = max(progress.hints_used, progress_data.hints_used)
            progress.solution_revealed = progress.solution_revealed or progress_data.solution_revealed
            
            if progress_data.best_query:
                progress.best_query = progress_data.best_query
            if progress_data.execution_time_ms:
                if not progress.execution_time_ms or progress_data.execution_time_ms < progress.execution_time_ms:
                    progress.execution_time_ms = progress_data.execution_time_ms
            
            if progress_data.is_completed and not progress.completed_at:
                progress.completed_at = datetime.utcnow()
        else:
            # Create new progress record
            progress = UserProgress(
                user_id=user.id,
                task_id=progress_data.task_id,
                database_id=progress_data.database_id,
                is_completed=progress_data.is_completed,
                completed_at=datetime.utcnow() if progress_data.is_completed else None,
                score=progress_data.score,
                xp_earned=progress_data.xp_earned,
                attempts=progress_data.attempts,
                hints_used=progress_data.hints_used,
                solution_revealed=progress_data.solution_revealed,
                best_query=progress_data.best_query,
                execution_time_ms=progress_data.execution_time_ms,
            )
            db.add(progress)
        
        saved_count += 1
    
    await db.commit()
    
    return {
        "success": True,
        "saved_count": saved_count
    }


@progress_router.post("/stats")
async def save_user_stats(
    stats_data: UserStatsUpdate,
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Save/update user statistics
    """
    user = await get_user_from_token(credentials, db)
    
    # Get or create stats
    result = await db.execute(
        select(UserStats).where(UserStats.user_id == user.id)
    )
    stats = result.scalar_one_or_none()
    
    if stats:
        # Update existing - keep best values
        stats.total_xp = max(stats.total_xp, stats_data.total_xp)
        stats.total_score = max(stats.total_score, stats_data.total_score)
        stats.tasks_completed = max(stats.tasks_completed, stats_data.tasks_completed)
        stats.tasks_attempted = max(stats.tasks_attempted, stats_data.tasks_attempted)
        stats.current_streak = stats_data.current_streak
        stats.longest_streak = max(stats.longest_streak, stats_data.longest_streak)
        stats.level = max(stats.level, stats_data.level)
        stats.last_activity_date = date.today()
        
        # Merge badges
        existing_badges = set(json.loads(stats.badges) if stats.badges else [])
        new_badges = existing_badges.union(set(stats_data.badges))
        stats.badges = json.dumps(list(new_badges))
    else:
        # Create new stats
        stats = UserStats(
            user_id=user.id,
            total_xp=stats_data.total_xp,
            total_score=stats_data.total_score,
            tasks_completed=stats_data.tasks_completed,
            tasks_attempted=stats_data.tasks_attempted,
            current_streak=stats_data.current_streak,
            longest_streak=stats_data.longest_streak,
            level=stats_data.level,
            last_activity_date=date.today(),
            badges=json.dumps(stats_data.badges),
        )
        db.add(stats)
    
    await db.commit()
    await db.refresh(stats)
    
    return {
        "success": True,
        "stats": {
            "total_xp": stats.total_xp,
            "total_score": stats.total_score,
            "tasks_completed": stats.tasks_completed,
            "level": stats.level,
        }
    }


@progress_router.get("/stats")
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get user statistics
    """
    user = await get_user_from_token(credentials, db)
    
    result = await db.execute(
        select(UserStats).where(UserStats.user_id == user.id)
    )
    stats = result.scalar_one_or_none()
    
    if not stats:
        return {
            "total_xp": 0,
            "total_score": 0,
            "tasks_completed": 0,
            "tasks_attempted": 0,
            "current_streak": 0,
            "longest_streak": 0,
            "level": 1,
            "badges": [],
        }
    
    return {
        "total_xp": stats.total_xp,
        "total_score": stats.total_score,
        "tasks_completed": stats.tasks_completed,
        "tasks_attempted": stats.tasks_attempted,
        "current_streak": stats.current_streak,
        "longest_streak": stats.longest_streak,
        "level": stats.level,
        "badges": json.loads(stats.badges) if stats.badges else [],
    }


@progress_router.delete("/reset")
async def reset_progress(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Reset all user progress (for testing or user request)
    """
    user = await get_user_from_token(credentials, db)
    
    # Delete all progress records
    await db.execute(
        UserProgress.__table__.delete().where(UserProgress.user_id == user.id)
    )
    
    # Reset stats
    result = await db.execute(
        select(UserStats).where(UserStats.user_id == user.id)
    )
    stats = result.scalar_one_or_none()
    
    if stats:
        stats.total_xp = 0
        stats.total_score = 0
        stats.tasks_completed = 0
        stats.tasks_attempted = 0
        stats.current_streak = 0
        stats.level = 1
        stats.badges = "[]"
    
    await db.commit()
    
    return {"success": True, "message": "Progress reset successfully"}
