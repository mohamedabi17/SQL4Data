"""
Payment Router - Handles Stripe Checkout and Webhooks
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
import stripe

from database import get_db
from auth.models import User, SubscriptionTier
from stripe_integration import (
    create_checkout_session,
    create_customer_portal_session,
    verify_webhook_signature,
)

router = APIRouter(prefix="/api/payment", tags=["payment"])


@router.post("/create-checkout-session")
async def create_payment_session(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a Stripe Checkout session for subscription
    """
    try:
        body = await request.json()
        email = body.get("email")
        billing_cycle = body.get("billing_cycle", "yearly")  # Default to yearly
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Validate billing cycle
        if billing_cycle not in ["monthly", "yearly"]:
            billing_cycle = "yearly"
        
        # Get or create user
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                email=email,
                subscription_tier=SubscriptionTier.FREE,
                daily_ai_usage_count=0,
                last_usage_reset=datetime.now(timezone.utc)
            )
            db.add(user)
            await db.commit()
        
        # Create Stripe checkout session
        session = create_checkout_session(email, billing_cycle)
        
        return JSONResponse({
            "sessionId": session.id,
            "url": session.url
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-portal-session")
async def create_portal(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a Stripe Customer Portal session for managing subscription
    """
    try:
        body = await request.json()
        email = body.get("email")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Get user
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user or not user.stripe_customer_id:
            raise HTTPException(status_code=404, detail="No subscription found")
        
        # Create portal session
        portal = create_customer_portal_session(user.stripe_customer_id)
        
        return JSONResponse({"url": portal.url})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Stripe webhooks for subscription events
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = verify_webhook_signature(payload, sig_header)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Handle different event types
    event_type = event["type"]
    data = event["data"]["object"]
    
    if event_type == "checkout.session.completed":
        # Payment successful - activate subscription
        await handle_checkout_completed(data, db)
        
    elif event_type == "customer.subscription.created":
        # Subscription created
        await handle_subscription_created(data, db)
        
    elif event_type == "customer.subscription.updated":
        # Subscription updated (e.g., plan change)
        await handle_subscription_updated(data, db)
        
    elif event_type == "customer.subscription.deleted":
        # Subscription cancelled
        await handle_subscription_deleted(data, db)
        
    elif event_type == "invoice.payment_failed":
        # Payment failed
        await handle_payment_failed(data, db)
    
    return JSONResponse({"status": "success"})


async def handle_checkout_completed(session, db: AsyncSession):
    """Handle successful checkout"""
    email = session.get("customer_email") or session["metadata"].get("email")
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if user:
        user.stripe_customer_id = customer_id
        user.stripe_subscription_id = subscription_id
        user.subscription_tier = SubscriptionTier.PREMIUM
        user.subscription_status = "active"
        await db.commit()


async def handle_subscription_created(subscription, db: AsyncSession):
    """Handle subscription creation"""
    customer_id = subscription.get("customer")
    subscription_id = subscription.get("id")
    status = subscription.get("status")
    current_period_end = subscription.get("current_period_end")
    
    result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
    user = result.scalar_one_or_none()
    
    if user:
        user.stripe_subscription_id = subscription_id
        user.subscription_tier = SubscriptionTier.PREMIUM
        user.subscription_status = status
        user.subscription_end_date = datetime.fromtimestamp(current_period_end, tz=timezone.utc)
        await db.commit()


async def handle_subscription_updated(subscription, db: AsyncSession):
    """Handle subscription update"""
    customer_id = subscription.get("customer")
    status = subscription.get("status")
    current_period_end = subscription.get("current_period_end")
    
    result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
    user = result.scalar_one_or_none()
    
    if user:
        user.subscription_status = status
        user.subscription_end_date = datetime.fromtimestamp(current_period_end, tz=timezone.utc)
        
        # Downgrade if subscription is cancelled/unpaid
        if status not in ["active", "trialing"]:
            user.subscription_tier = SubscriptionTier.FREE
        
        await db.commit()


async def handle_subscription_deleted(subscription, db: AsyncSession):
    """Handle subscription cancellation"""
    customer_id = subscription.get("customer")
    
    result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
    user = result.scalar_one_or_none()
    
    if user:
        user.subscription_tier = SubscriptionTier.FREE
        user.subscription_status = "cancelled"
        user.subscription_end_date = datetime.now(timezone.utc)
        await db.commit()


async def handle_payment_failed(invoice, db: AsyncSession):
    """Handle failed payment"""
    customer_id = invoice.get("customer")
    
    result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
    user = result.scalar_one_or_none()
    
    if user:
        user.subscription_status = "past_due"
        await db.commit()


@router.get("/subscription-status")
async def get_subscription_status(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's subscription status
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        return JSONResponse({
            "tier": "free",
            "status": "inactive",
            "isPremium": False
        })
    
    tier = user.subscription_tier.value if hasattr(user.subscription_tier, 'value') else str(user.subscription_tier)
    
    is_premium = (
        tier == "premium" and
        user.subscription_status in ["active", "trialing"] and
        (not user.subscription_end_date or user.subscription_end_date > datetime.now(timezone.utc))
    )
    
    return JSONResponse({
        "tier": tier,
        "status": user.subscription_status,
        "isPremium": is_premium,
        "endDate": user.subscription_end_date.isoformat() if user.subscription_end_date else None
    })
