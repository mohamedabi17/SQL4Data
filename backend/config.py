import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://sql4data_user:sql4data_password@localhost:5432/sql4data_db"
    DATABASE_URL_SYNC: str = "postgresql://sql4data_user:sql4data_password@localhost:5432/sql4data_db"
    READONLY_DATABASE_URL: str = "postgresql://readonly_user:readonly_password@localhost:5432/sql4data_db"
    
    # API Keys
    GEMINI_API_KEY: str = ""
    
    # JWT Configuration
    JWT_SECRET: str = "sql4data-super-secret-key-change-in-production-123456789"
    JWT_ALGORITHM: str = "HS256"
    
    # OAuth - Google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # OAuth - GitHub
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    
    # AdSense
    ADSENSE_PUBLISHER_ID: str = "pub-5191559835894663"
    
    # Stripe Configuration
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # Stripe Price IDs (€4.99 model)
    STRIPE_PRICE_MONTHLY: str = "price_monthly_4_99_eur"  # Replace with actual Stripe Price ID
    STRIPE_PRICE_YEARLY: str = "price_yearly_49_90_eur"   # Replace with actual Stripe Price ID
    
    # API URL (for OAuth callbacks)
    API_URL: str = "http://localhost:8001"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    MAX_QUERY_LENGTH: int = 5000
    QUERY_TIMEOUT_SECONDS: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra env variables

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
