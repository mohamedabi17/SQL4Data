"""
User, Subscription, and Ad tracking models for SQL4DATA
Supports freemium model with ad-based unlocks
"""

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, 
    ForeignKey, Enum, Float, Date
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import enum

from database import Base


class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PREMIUM = "premium"


class OAuthProvider(str, enum.Enum):
    GOOGLE = "google"
    GITHUB = "github"
    EMAIL = "email"


class User(Base):
    """
    User model supporting OAuth and local authentication
    Premium users bypass all limits and see no ads
    Includes Stripe subscription and AI usage tracking
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # OAuth fields
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), index=True)
    full_name = Column(String(200))
    avatar_url = Column(String(500))
    
    # Auth provider info
    provider = Column(Enum(OAuthProvider), default=OAuthProvider.EMAIL)
    provider_id = Column(String(255))  # OAuth provider's user ID
    
    # Subscription status
    subscription_tier = Column(
        Enum(SubscriptionTier), 
        default=SubscriptionTier.FREE,
        nullable=False
    )
    
    # Stripe integration (€4.99 Micro-SaaS)
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    subscription_status = Column(String(20), default="inactive")  # active, inactive, cancelled, past_due
    subscription_end_date = Column(DateTime(timezone=True), nullable=True)
    
    # AI Usage tracking (3/day free, 50/day premium)
    daily_ai_usage_count = Column(Integer, default=0)
    last_usage_reset = Column(DateTime(timezone=True), server_default=func.now())
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # User timezone for local time reset
    timezone = Column(String(50), default="UTC")
    
    # GDPR consent
    gdpr_consent = Column(Boolean, default=False)
    gdpr_consent_date = Column(DateTime(timezone=True))
    
    # Relationships
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    daily_limits = relationship("DailyLimit", back_populates="user")
    ad_unlocks = relationship("AdUnlock", back_populates="user")
    progress = relationship("UserProgress", back_populates="user")
    stats = relationship("UserStats", back_populates="user", uselist=False)
    
    @property
    def is_premium(self) -> bool:
        """Check if user has active premium subscription"""
        if self.subscription_tier == SubscriptionTier.PREMIUM:
            # Check Stripe subscription status
            if self.subscription_status in ["active", "trialing"]:
                # Check if subscription hasn't expired
                if not self.subscription_end_date or self.subscription_end_date > datetime.utcnow():
                    return True
            # Fallback to old subscription model
            if self.subscription and self.subscription.is_active:
                return True
        return False
    
    def __repr__(self):
        return f"<User {self.email} ({self.subscription_tier.value})>"


class Subscription(Base):
    """
    Premium subscription tracking
    Premium users: No ads, unlimited AI feedback, all features unlocked
    """
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Subscription details
    plan_name = Column(String(50), default="premium_monthly")
    price_paid = Column(Float)
    currency = Column(String(3), default="EUR")
    
    # Validity
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    
    # Payment info (for Stripe integration later)
    stripe_customer_id = Column(String(255))
    stripe_subscription_id = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="subscription")
    
    def __repr__(self):
        return f"<Subscription {self.plan_name} for user {self.user_id}>"


class DailyLimit(Base):
    """
    Track daily usage limits for free users
    Resets at midnight in user's local timezone
    Premium users: 50/day soft limit (fair use)
    """
    __tablename__ = "daily_limits"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Date for this limit record (user's local date)
    limit_date = Column(Date, nullable=False, index=True)
    
    # Usage counts
    ai_feedback_used = Column(Integer, default=0)
    hints_level3_used = Column(Integer, default=0)
    solution_reveals_used = Column(Integer, default=0)
    
    # Base limits (can be increased by watching ads)
    ai_feedback_limit = Column(Integer, default=3)  # Free: 3, Premium: 50
    hints_level3_limit = Column(Integer, default=3)
    solution_reveals_limit = Column(Integer, default=2)
    
    # Tracking fields for reset logic
    last_reset_time = Column(DateTime(timezone=True), server_default=func.now())
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="daily_limits")
    
    def can_use_ai_feedback(self, is_premium: bool = False) -> bool:
        """Check if user can use AI feedback (3 for free, 50 for premium)"""
        limit = PREMIUM_SOFT_LIMIT["ai_feedback"] if is_premium else self.ai_feedback_limit
        return self.ai_feedback_used < limit
    
    def can_use_hint_level3(self) -> bool:
        return self.hints_level3_used < self.hints_level3_limit
    
    def can_reveal_solution(self) -> bool:
        return self.solution_reveals_used < self.solution_reveals_limit
    
    def __repr__(self):
        return f"<DailyLimit user={self.user_id} date={self.limit_date}>"


class AdUnlock(Base):
    """
    Track ad watches for unlocking features
    Safe, rewarded ads only - user must click to watch
    """
    __tablename__ = "ad_unlocks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # What was unlocked
    unlock_type = Column(String(50), nullable=False)  # ai_feedback, hint_level3, solution_reveal
    unlock_amount = Column(Integer, default=1)
    
    # Ad details (for analytics)
    ad_provider = Column(String(50), default="google_adsense")
    ad_unit_id = Column(String(100))
    
    # Verification
    watched_at = Column(DateTime(timezone=True), server_default=func.now())
    verified = Column(Boolean, default=True)  # For fraud prevention
    
    # Relationships
    user = relationship("User", back_populates="ad_unlocks")
    
    def __repr__(self):
        return f"<AdUnlock {self.unlock_type} for user {self.user_id}>"


class UserProgress(Base):
    """
    Track user's progress on tasks/exercises
    Syncs with local storage when logged in
    """
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Task identification
    task_id = Column(String(100), nullable=False, index=True)  # e.g., "accounting_1"
    database_id = Column(String(50), nullable=False)  # e.g., "accounting"
    
    # Completion status
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    
    # Score/XP earned
    score = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    
    # Attempts tracking
    attempts = Column(Integer, default=0)
    hints_used = Column(Integer, default=0)
    solution_revealed = Column(Boolean, default=False)
    
    # Best solution (for review)
    best_query = Column(Text)
    execution_time_ms = Column(Float)
    
    # Timestamps
    first_attempted_at = Column(DateTime(timezone=True), server_default=func.now())
    last_attempted_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="progress")
    
    def __repr__(self):
        return f"<UserProgress user={self.user_id} task={self.task_id} completed={self.is_completed}>"


class UserStats(Base):
    """
    Aggregate user statistics
    Updated when progress changes
    """
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Overall stats
    total_xp = Column(Integer, default=0)
    total_score = Column(Integer, default=0)
    tasks_completed = Column(Integer, default=0)
    tasks_attempted = Column(Integer, default=0)
    
    # Streaks
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(Date)
    
    # Level/rank
    level = Column(Integer, default=1)
    
    # Badges (JSON array of badge IDs)
    badges = Column(Text, default="[]")  # JSON array
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="stats")
    
    def __repr__(self):
        return f"<UserStats user={self.user_id} xp={self.total_xp} level={self.level}>"


# Default daily limits for free users (3 AI feedbacks per day)
FREE_USER_LIMITS = {
    "ai_feedback": 3,
    "hints_level3": 3,
    "solution_reveals": 2,
}

# Premium soft limit (fair use policy - 50 per day)
PREMIUM_SOFT_LIMIT = {
    "ai_feedback": 50,  # Soft limit to prevent API abuse
}

# What watching an ad unlocks
AD_UNLOCK_REWARDS = {
    "ai_feedback": 3,      # +3 AI feedbacks
    "hints_level3": 2,     # +2 level 3 hints
    "solution_reveals": 1, # +1 solution reveal
}
