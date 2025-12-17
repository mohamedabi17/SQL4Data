import pandas as pd
import sqlalchemy
from sqlalchemy import text, create_engine
from typing import Tuple, List, Dict, Any
import time
import re
from config import get_settings

settings = get_settings()


class QueryExecutor:
    """Handles safe SQL query execution and result comparison"""
    
    def __init__(self):
        # Create read-only connection
        self.readonly_engine = create_engine(
            settings.READONLY_DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"options": "-c statement_timeout=30000"}
        )
    
    def execute_query(self, query: str) -> Tuple[pd.DataFrame, str, int]:
        """
        Execute a SQL query safely in read-only mode
        
        Returns:
            Tuple of (DataFrame, error_message, execution_time_ms)
        """
        start_time = time.time()
        error_message = None
        df = pd.DataFrame()
        
        try:
            # Additional safety check
            self._validate_query_safety(query)
            
            # Execute query with read-only user
            with self.readonly_engine.connect() as conn:
                # Set transaction to read-only
                conn.execute(text("SET TRANSACTION READ ONLY"))
                result = conn.execute(text(query))
                
                # Fetch all results
                rows = result.fetchall()
                columns = result.keys()
                
                # Convert to DataFrame
                df = pd.DataFrame(rows, columns=columns)
                
                # Rollback transaction (even though read-only)
                conn.execute(text("ROLLBACK"))
                
        except sqlalchemy.exc.ProgrammingError as e:
            error_message = f"SQL Syntax Error: {str(e)}"
        except sqlalchemy.exc.OperationalError as e:
            error_message = f"Database Error: {str(e)}"
        except sqlalchemy.exc.DataError as e:
            error_message = f"Data Error: {str(e)}"
        except Exception as e:
            error_message = f"Execution Error: {str(e)}"
        
        execution_time = int((time.time() - start_time) * 1000)
        
        return df, error_message, execution_time
    
    def _validate_query_safety(self, query: str):
        """Additional validation for query safety"""
        query_upper = query.upper()
        
        # Block dangerous keywords
        dangerous_patterns = [
            r'\bDROP\b',
            r'\bDELETE\b',
            r'\bUPDATE\b',
            r'\bINSERT\b',
            r'\bALTER\b',
            r'\bCREATE\b',
            r'\bTRUNCATE\b',
            r'\bGRANT\b',
            r'\bREVOKE\b',
            r'\bEXEC\b',
            r'\bEXECUTE\b',
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, query_upper):
                raise ValueError(f"Dangerous SQL operation detected. Only SELECT queries are allowed.")
        
        # Query must contain SELECT
        if 'SELECT' not in query_upper:
            raise ValueError("Query must be a SELECT statement")
    
    def compare_results(
        self,
        user_df: pd.DataFrame,
        expected_df: pd.DataFrame
    ) -> Tuple[bool, str]:
        """
        Compare two DataFrames for equality
        
        Returns:
            Tuple of (is_equal, difference_message)
        """
        try:
            # Check if both are empty
            if user_df.empty and expected_df.empty:
                return True, "Both queries returned empty results (correct)"
            
            # Check row counts
            if len(user_df) != len(expected_df):
                return False, f"Row count mismatch: Your query returned {len(user_df)} rows, expected {len(expected_df)} rows"
            
            # Check column counts
            if len(user_df.columns) != len(expected_df.columns):
                return False, f"Column count mismatch: Your query returned {len(user_df.columns)} columns, expected {len(expected_df.columns)} columns"
            
            # Normalize column names (case-insensitive comparison)
            user_cols = [col.lower() for col in user_df.columns]
            expected_cols = [col.lower() for col in expected_df.columns]
            
            # Check column names (order matters for SELECT *)
            if user_cols != expected_cols:
                missing = set(expected_cols) - set(user_cols)
                extra = set(user_cols) - set(expected_cols)
                msg = "Column name mismatch. "
                if missing:
                    msg += f"Missing columns: {missing}. "
                if extra:
                    msg += f"Extra columns: {extra}. "
                return False, msg
            
            # Rename user columns to match expected (for comparison)
            column_mapping = dict(zip(user_df.columns, expected_df.columns))
            user_df_normalized = user_df.rename(columns=column_mapping)
            
            # Sort both DataFrames by all columns for comparison (order-independent)
            try:
                user_sorted = user_df_normalized.sort_values(
                    by=list(user_df_normalized.columns)
                ).reset_index(drop=True)
                expected_sorted = expected_df.sort_values(
                    by=list(expected_df.columns)
                ).reset_index(drop=True)
            except TypeError:
                # If sorting fails (e.g., mixed types), compare without sorting
                user_sorted = user_df_normalized.reset_index(drop=True)
                expected_sorted = expected_df.reset_index(drop=True)
            
            # Compare DataFrames
            try:
                pd.testing.assert_frame_equal(
                    user_sorted,
                    expected_sorted,
                    check_dtype=False,  # Allow type differences (e.g., int vs float)
                    check_exact=False,  # Allow small floating point differences
                    rtol=1e-5
                )
                return True, "Results match perfectly!"
            except AssertionError as e:
                # Find specific differences
                diff_rows = []
                for idx in range(min(len(user_sorted), len(expected_sorted))):
                    if not user_sorted.iloc[idx].equals(expected_sorted.iloc[idx]):
                        diff_rows.append(idx)
                
                if diff_rows:
                    sample_idx = diff_rows[0]
                    return False, f"Data mismatch in row {sample_idx + 1}. Check your query logic."
                else:
                    return False, "Results don't match. Check data types and value formatting."
        
        except Exception as e:
            return False, f"Comparison error: {str(e)}"
    
    def dataframe_to_dict(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Convert DataFrame to list of dictionaries for JSON response"""
        # Replace NaN with None for JSON serialization
        df_clean = df.where(pd.notnull(df), None)
        return df_clean.to_dict(orient='records')
    
    def close(self):
        """Close database connections"""
        self.readonly_engine.dispose()


# Singleton instance
query_executor = QueryExecutor()
