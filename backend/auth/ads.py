"""
Ads and daily limits management for SQL4DATA
Safe, rewarded ads only - NO popups, NO redirects
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional
import pytz

from database import get_db
from auth.models import (
    User, DailyLimit, AdUnlock, 
    FREE_USER_LIMITS, AD_UNLOCK_REWARDS, PREMIUM_SOFT_LIMIT
)
from auth.jwt_handler import get_current_user, security

ads_router = APIRouter(prefix="/api/ads", tags=["Ads & Limits"])


class UnlockRequest(BaseModel):
    """Request to unlock features by watching an ad"""
    unlock_type: str  # ai_feedback, hints_level3, solution_reveals
    ad_unit_completed: bool = True


class UnlockResponse(BaseModel):
    """Response after unlocking features"""
    success: bool
    unlock_type: str
    amount_unlocked: int
    new_limit: int
    message: str


class LimitsResponse(BaseModel):
    """Current daily limits for user"""
    is_premium: bool
    ai_feedback: dict
    hints_level3: dict
    solution_reveals: dict
    ads_watched_today: int
    resets_at: str  # ISO timestamp


async def get_user_local_date(user: User) -> date:
    """Get current date in user's timezone"""
    try:
        tz = pytz.timezone(user.timezone)
    except:
        tz = pytz.UTC
    
    return datetime.now(tz).date()


async def get_or_create_daily_limit(
    db: AsyncSession, 
    user: User
) -> DailyLimit:
    """Get or create today's daily limit record for user"""
    today = await get_user_local_date(user)
    
    result = await db.execute(
        select(DailyLimit)
        .where(DailyLimit.user_id == user.id)
        .where(DailyLimit.limit_date == today)
    )
    daily_limit = result.scalar_one_or_none()
    
    if not daily_limit:
        # Create new daily limit record
        daily_limit = DailyLimit(
            user_id=user.id,
            limit_date=today,
            ai_feedback_limit=FREE_USER_LIMITS["ai_feedback"],
            hints_level3_limit=FREE_USER_LIMITS["hints_level3"],
            solution_reveals_limit=FREE_USER_LIMITS["solution_reveals"]
        )
        db.add(daily_limit)
        await db.commit()
        await db.refresh(daily_limit)
    
    return daily_limit


def get_reset_time(user: User) -> str:
    """Get next reset time (midnight in user's timezone)"""
    try:
        tz = pytz.timezone(user.timezone)
    except:
        tz = pytz.UTC
    
    now = datetime.now(tz)
    tomorrow = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = tomorrow.replace(day=now.day + 1)
    
    return tomorrow.isoformat()


@ads_router.get("/limits", response_model=LimitsResponse)
async def get_daily_limits(
    db: AsyncSession = Depends(get_db),
    credentials = Depends(security)
):
    """
    Get current daily limits for the authenticated user
    Premium users have unlimited access
    """
    user = await get_current_user(credentials, db)
    
    if not user:
        # Anonymous user - return default limits
        return LimitsResponse(
            is_premium=False,
            ai_feedback={"used": 0, "limit": FREE_USER_LIMITS["ai_feedback"], "available": FREE_USER_LIMITS["ai_feedback"]},
            hints_level3={"used": 0, "limit": FREE_USER_LIMITS["hints_level3"], "available": FREE_USER_LIMITS["hints_level3"]},
            solution_reveals={"used": 0, "limit": FREE_USER_LIMITS["solution_reveals"], "available": FREE_USER_LIMITS["solution_reveals"]},
            ads_watched_today=0,
            resets_at=datetime.utcnow().replace(hour=0, minute=0, second=0).isoformat() + "Z"
        )
    
    # Premium users have unlimited access
    if user.is_premium:
        return LimitsResponse(
            is_premium=True,
            ai_feedback={"used": 0, "limit": -1, "available": -1},  # -1 = unlimited
            hints_level3={"used": 0, "limit": -1, "available": -1},
            solution_reveals={"used": 0, "limit": -1, "available": -1},
            ads_watched_today=0,
            resets_at="never"
        )
    
    # Free user - get actual limits
    daily_limit = await get_or_create_daily_limit(db, user)
    
    # Count ads watched today
    today = await get_user_local_date(user)
    result = await db.execute(
        select(AdUnlock)
        .where(AdUnlock.user_id == user.id)
        .where(AdUnlock.watched_at >= datetime.combine(today, datetime.min.time()))
    )
    ads_watched = len(result.scalars().all())
    
    return LimitsResponse(
        is_premium=False,
        ai_feedback={
            "used": daily_limit.ai_feedback_used,
            "limit": daily_limit.ai_feedback_limit,
            "available": max(0, daily_limit.ai_feedback_limit - daily_limit.ai_feedback_used)
        },
        hints_level3={
            "used": daily_limit.hints_level3_used,
            "limit": daily_limit.hints_level3_limit,
            "available": max(0, daily_limit.hints_level3_limit - daily_limit.hints_level3_used)
        },
        solution_reveals={
            "used": daily_limit.solution_reveals_used,
            "limit": daily_limit.solution_reveals_limit,
            "available": max(0, daily_limit.solution_reveals_limit - daily_limit.solution_reveals_used)
        },
        ads_watched_today=ads_watched,
        resets_at=get_reset_time(user)
    )


@ads_router.post("/unlock", response_model=UnlockResponse)
async def unlock_feature(
    request: UnlockRequest,
    db: AsyncSession = Depends(get_db),
    credentials = Depends(security)
):
    """
    Unlock additional features by watching a rewarded ad
    
    SAFE AD POLICY:
    - User must explicitly click to watch
    - No auto-playing ads
    - No popups or redirects
    - Educational-safe content only (Google AdSense filtered)
    
    Valid unlock_types:
    - ai_feedback: +3 AI explanations
    - hints_level3: +2 advanced hints
    - solution_reveals: +1 solution reveal
    """
    user = await get_current_user(credentials, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to unlock features"
        )
    
    # Premium users don't need to watch ads
    if user.is_premium:
        return UnlockResponse(
            success=True,
            unlock_type=request.unlock_type,
            amount_unlocked=0,
            new_limit=-1,
            message="Premium users have unlimited access"
        )
    
    # Validate unlock type
    if request.unlock_type not in AD_UNLOCK_REWARDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid unlock type. Valid types: {list(AD_UNLOCK_REWARDS.keys())}"
        )
    
    # Verify ad was actually watched
    if not request.ad_unit_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ad must be completed to unlock features"
        )
    
    # Get/create daily limit
    daily_limit = await get_or_create_daily_limit(db, user)
    
    # Calculate unlock amount
    unlock_amount = AD_UNLOCK_REWARDS[request.unlock_type]
    
    # Apply unlock based on type
    if request.unlock_type == "ai_feedback":
        daily_limit.ai_feedback_limit += unlock_amount
        new_limit = daily_limit.ai_feedback_limit
    elif request.unlock_type == "hints_level3":
        daily_limit.hints_level3_limit += unlock_amount
        new_limit = daily_limit.hints_level3_limit
    else:  # solution_reveals
        daily_limit.solution_reveals_limit += unlock_amount
        new_limit = daily_limit.solution_reveals_limit
    
    # Record the ad unlock
    ad_unlock = AdUnlock(
        user_id=user.id,
        unlock_type=request.unlock_type,
        unlock_amount=unlock_amount,
        ad_provider="google_adsense",
        ad_unit_id="ca-pub-5191559835894663"  # SQL4DATA AdSense publisher ID
    )
    db.add(ad_unlock)
    
    await db.commit()
    
    return UnlockResponse(
        success=True,
        unlock_type=request.unlock_type,
        amount_unlocked=unlock_amount,
        new_limit=new_limit,
        message=f"Unlocked {unlock_amount} additional {request.unlock_type.replace('_', ' ')}!"
    )


@ads_router.post("/use/{feature_type}")
async def use_feature(
    feature_type: str,
    db: AsyncSession = Depends(get_db),
    credentials = Depends(security)
):
    """
    Record usage of a limited feature
    Called when user uses AI feedback, level 3 hint, or solution reveal
    """
    user = await get_current_user(credentials, db)
    
    # Anonymous users or premium users - allow without tracking
    if not user or user.is_premium:
        return {"success": True, "remaining": -1}
    
    # Validate feature type
    if feature_type not in ["ai_feedback", "hints_level3", "solution_reveals"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid feature type"
        )
    
    daily_limit = await get_or_create_daily_limit(db, user)
    
    # Check if user has remaining uses
    if feature_type == "ai_feedback":
        if daily_limit.ai_feedback_used >= daily_limit.ai_feedback_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Daily AI feedback limit reached. Watch an ad to unlock more!"
            )
        daily_limit.ai_feedback_used += 1
        remaining = daily_limit.ai_feedback_limit - daily_limit.ai_feedback_used
        
    elif feature_type == "hints_level3":
        if daily_limit.hints_level3_used >= daily_limit.hints_level3_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Daily level 3 hints limit reached. Watch an ad to unlock more!"
            )
        daily_limit.hints_level3_used += 1
        remaining = daily_limit.hints_level3_limit - daily_limit.hints_level3_used
        
    else:  # solution_reveals
        if daily_limit.solution_reveals_used >= daily_limit.solution_reveals_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Daily solution reveals limit reached. Watch an ad to unlock more!"
            )
        daily_limit.solution_reveals_used += 1
        remaining = daily_limit.solution_reveals_limit - daily_limit.solution_reveals_used
    
    await db.commit()
    
    return {"success": True, "remaining": remaining}
