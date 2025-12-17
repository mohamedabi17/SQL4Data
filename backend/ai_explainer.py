import google.generativeai as genai
from typing import List, Optional
import json
from config import get_settings

settings = get_settings()


class AIExplainer:
    """Handles AI-powered explanations for SQL errors using Google Gemini"""
    
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Use the latest Gemini Pro model
            self.model = genai.GenerativeModel('models/gemini-pro-latest')
        else:
            self.model = None
    
    async def explain_query_error(
        self,
        user_query: str,
        task_description: str,
        error_message: Optional[str],
        expected_result_sample: Optional[List[dict]],
        schema_info: str
    ) -> tuple[str, List[str], List[str]]:
        """
        Generate pedagogical explanation for SQL query errors
        
        Returns:
            Tuple of (explanation, hints, suggested_concepts)
        """
        if not self.model:
            return self._fallback_explanation(error_message)
        
        try:
            system_instruction = """You are an expert SQL tutor for Data Engineering students. 
Your role is to help students learn by:
1. Explaining what went wrong in their query WITHOUT giving the answer
2. Providing hints that guide them to the solution
3. Suggesting SQL concepts they should review

Be encouraging and pedagogical. Focus on learning, not just correcting."""

            user_prompt = f"""A student is working on this SQL task:

Task Description: {task_description}

Their Query:
{user_query}

Database Schema:
{schema_info}

{f"Error Message: {error_message}" if error_message else "Their query executed but returned incorrect results."}

{f"Expected Result (first 3 rows): {expected_result_sample[:3]}" if expected_result_sample else ""}

Provide:
1. A brief explanation of what's wrong (without giving the solution)
2. 3-5 specific hints to guide them
3. 2-3 SQL concepts they should review

Format your response as JSON:
{{
  "explanation": "...",
  "hints": ["hint1", "hint2", ...],
  "concepts": ["concept1", "concept2", ...]
}}
"""

            response = self.model.generate_content(
                f"{system_instruction}\n\n{user_prompt}",
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=800,
                )
            )
            
            # Extract JSON from response
            result_text = response.text.strip()
            
            # Handle markdown code blocks if present
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            
            result = json.loads(result_text.strip())
            
            return (
                result.get("explanation", ""),
                result.get("hints", []),
                result.get("concepts", [])
            )
        
        except Exception as e:
            print(f"AI Explanation error: {e}")
            return self._fallback_explanation(error_message)
    
    def _fallback_explanation(self, error_message: Optional[str]) -> tuple[str, List[str], List[str]]:
        """Fallback explanation when AI is not available"""
        if error_message:
            if "syntax" in error_message.lower():
                return (
                    "There's a syntax error in your SQL query. Check your SQL statement carefully.",
                    [
                        "Review SQL SELECT syntax",
                        "Check for missing commas or parentheses",
                        "Verify table and column names are correct",
                        "Make sure you're using proper SQL keywords"
                    ],
                    ["SQL Syntax", "SELECT Statement", "SQL Keywords"]
                )
            elif "column" in error_message.lower() or "relation" in error_message.lower():
                return (
                    "Your query references a column or table that doesn't exist.",
                    [
                        "Double-check the column names in your SELECT clause",
                        "Verify the table names in your FROM clause",
                        "Check if you need to use table aliases",
                        "Review the database schema"
                    ],
                    ["Database Schema", "Table Relations", "Column Names"]
                )
        
        return (
            "Your query didn't produce the expected results. Review the task requirements carefully.",
            [
                "Check if you're selecting the correct columns",
                "Verify your WHERE conditions",
                "Review JOIN conditions if using multiple tables",
                "Check GROUP BY and aggregation functions",
                "Verify the ORDER BY clause if sorting is required"
            ],
            ["SELECT", "WHERE", "JOIN", "GROUP BY", "Aggregation"]
        )


# Singleton instance
ai_explainer = AIExplainer()
