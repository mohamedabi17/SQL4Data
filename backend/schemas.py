from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime


class ExecuteQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000)
    task_id: int = Field(..., gt=0)
    
    @validator('query')
    def validate_query(cls, v):
        """Basic SQL injection prevention"""
        dangerous_keywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE', 'EXEC']
        query_upper = v.upper()
        
        for keyword in dangerous_keywords:
            if keyword in query_upper:
                raise ValueError(f"Dangerous SQL keyword detected: {keyword}. Only SELECT queries are allowed.")
        
        return v.strip()


class ExecuteQueryResponse(BaseModel):
    is_correct: bool
    user_data: List[Dict[str, Any]]
    expected_data: List[Dict[str, Any]]
    user_columns: List[str]
    expected_columns: List[str]
    error_message: Optional[str] = None
    execution_time_ms: Optional[int] = None
    row_count: int
    expected_row_count: int


class ExplainErrorRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000)
    task_id: int = Field(..., gt=0)
    error_message: Optional[str] = None
    expected_result_sample: Optional[List[Dict[str, Any]]] = None


class ExplainErrorResponse(BaseModel):
    explanation: str
    hints: List[str]
    suggested_concepts: List[str]


class TaskResponse(BaseModel):
    task_id: int
    title: str
    description: str
    difficulty: str
    category: str
    database_schema: str
    tables_involved: List[str]
    
    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    categories: List[str]
    difficulties: List[str]
