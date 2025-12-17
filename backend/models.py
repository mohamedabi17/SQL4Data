from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Date, ForeignKey, Boolean
from sqlalchemy.sql import func
from database import Base


class Task(Base):
    __tablename__ = "tasks"
    
    task_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False)  # beginner, intermediate, advanced, expert
    category = Column(String(50), nullable=False)  # select, join, subquery, cte, window, etc.
    database_schema = Column(String(50), nullable=False)  # music, ecommerce
    gold_query = Column(Text, nullable=False)  # The correct solution
    tables_involved = Column(Text)  # Comma-separated list of tables
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class UserQueryExecution(Base):
    __tablename__ = "user_query_executions"
    
    execution_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Links to auth.models.User
    task_id = Column(Integer, ForeignKey("tasks.task_id"), nullable=False)
    user_query = Column(Text, nullable=False)
    is_correct = Column(Integer, nullable=False)  # 0 = wrong, 1 = correct
    execution_time_ms = Column(Integer)
    error_message = Column(Text)
    ai_explanation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Note: Music Store and E-commerce tables are created via init.sql
# User model is in auth/models.py to avoid duplication

