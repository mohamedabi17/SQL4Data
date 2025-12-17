"""
Usage Limits Middleware for SQL Trainer
Implements daily usage tracking for AI feedback requests
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from auth.models import User

# Usage limits configuration
FREE_TIER_DAILY_LIMIT = 3
PREMIUM_TIER_DAILY_LIMIT = 50


def reset_daily_usage_if_needed(user: User) -> None:
    """
    Reset daily usage count if it's a new day
    """
    if not user.last_usage_reset:
        user.last_usage_reset = datetime.now(timezone.utc)
        user.daily_ai_usage_count = 0
        return
    
    now = datetime.now(timezone.utc)
    last_reset = user.last_usage_reset.replace(tzinfo=timezone.utc) if user.last_usage_reset.tzinfo is None else user.last_usage_reset
    
    # Check if it's a new day
    if now.date() > last_reset.date():
        user.daily_ai_usage_count = 0
        user.last_usage_reset = now


def check_ai_usage_limit(user: User, db: Session) -> dict:
    """
    Check if user has reached their daily AI usage limit
    Returns: dict with 'allowed', 'remaining', 'limit', 'tier', 'reset_in_hours'
    """
    # Reset usage if it's a new day
    reset_daily_usage_if_needed(user)
    db.commit()
    
    tier = user.subscription_tier.value if hasattr(user.subscription_tier, 'value') else str(user.subscription_tier)
    limit = PREMIUM_TIER_DAILY_LIMIT if tier == "premium" else FREE_TIER_DAILY_LIMIT
    current_usage = user.daily_ai_usage_count or 0
    remaining = max(0, limit - current_usage)
    
    # Calculate hours until reset (midnight)
    now = datetime.now(timezone.utc)
    midnight = datetime.combine(now.date(), datetime.min.time()).replace(tzinfo=timezone.utc)
    next_midnight = midnight + timedelta(days=1)
    reset_in_hours = (next_midnight - now).seconds // 3600
    
    return {
        "allowed": current_usage < limit,
        "remaining": remaining,
        "limit": limit,
        "current": current_usage,
        "tier": tier,
        "reset_in_hours": reset_in_hours,
        "is_premium": tier == "premium"
    }


def increment_ai_usage(user: User, db: Session) -> None:
    """
    Increment the user's daily AI usage count
    """
    user.daily_ai_usage_count = (user.daily_ai_usage_count or 0) + 1
    db.commit()


def get_or_create_user(email: str, db: Session) -> User:
    """
    Get existing user or create a new one
    """
    from auth.models import SubscriptionTier
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            subscription_tier=SubscriptionTier.FREE,
            daily_ai_usage_count=0,
            last_usage_reset=datetime.now(timezone.utc)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def check_premium_status(user: User) -> bool:
    """
    Check if user has active premium subscription
    """
    tier = user.subscription_tier.value if hasattr(user.subscription_tier, 'value') else str(user.subscription_tier)
    
    if tier != "premium":
        return False
    
    if user.subscription_status not in ["active", "trialing"]:
        return False
    
    # Check if subscription has expired
    if user.subscription_end_date:
        if datetime.now(timezone.utc) > user.subscription_end_date.replace(tzinfo=timezone.utc):
            return False
    
    return True
