# Authentication module for SQL4DATA
# Uses python-social-auth for OAuth providers

from .models import User, Subscription, AdUnlock, DailyLimit
from .jwt_handler import create_access_token, verify_token, get_current_user
from .oauth import oauth_router
from .ads import ads_router

__all__ = [
    "User",
    "Subscription", 
    "AdUnlock",
    "DailyLimit",
    "create_access_token",
    "verify_token",
    "get_current_user",
    "oauth_router",
    "ads_router",
]
