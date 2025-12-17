"""
Stripe payment integration for sql4Data
€4.99/month and €49.90/year pricing
"""

from fastapi import APIRouter, HTTPException, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional
import stripe
import logging

from database import get_db
from auth.models import User, Subscription, SubscriptionTier
from auth.jwt_handler import get_current_user
from config import get_settings

settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY

logger = logging.getLogger(__name__)

stripe_router = APIRouter(prefix="/api/stripe", tags=["Payments"])


class CheckoutSessionRequest(BaseModel):
    """Request to create a Stripe checkout session"""
    billing_cycle: str  # "monthly" or "yearly"


class CheckoutSessionResponse(BaseModel):
    """Response containing Stripe checkout URL"""
    checkout_url: str
    session_id: str


class SubscriptionStatus(BaseModel):
    """Current subscription status"""
    is_premium: bool
    plan_name: Optional[str]
    expires_at: Optional[str]
    cancel_at_period_end: bool = False


@stripe_router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    request: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a Stripe checkout session for subscription
    
    Pricing:
    - Monthly: €4.99/month
    - Yearly: €49.90/year (€4.15/month - 2 months free)
    """
    try:
        # Determine which price ID to use
        if request.billing_cycle == "monthly":
            price_id = settings.STRIPE_PRICE_MONTHLY
            plan_name = "premium_monthly"
        elif request.billing_cycle == "yearly":
            price_id = settings.STRIPE_PRICE_YEARLY
            plan_name = "premium_yearly"
        else:
            raise HTTPException(
                status_code=400, 
                detail="Invalid billing cycle. Must be 'monthly' or 'yearly'"
            )
        
        # Check if user already has a subscription
        existing_sub = await db.execute(
            select(Subscription).where(Subscription.user_id == current_user.id)
        )
        existing = existing_sub.scalar_one_or_none()
        
        if existing and existing.is_active:
            raise HTTPException(
                status_code=400,
                detail="You already have an active subscription"
            )
        
        # Create or retrieve Stripe customer
        if not current_user.subscription or not current_user.subscription.stripe_customer_id:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.full_name or current_user.username,
                metadata={
                    "user_id": str(current_user.id),
                    "username": current_user.username or ""
                }
            )
            customer_id = customer.id
        else:
            customer_id = current_user.subscription.stripe_customer_id
        
        # Create Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=f"{settings.FRONTEND_URL}/?payment=success&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/?payment=cancelled",
            metadata={
                "user_id": str(current_user.id),
                "plan_name": plan_name,
            },
            subscription_data={
                "metadata": {
                    "user_id": str(current_user.id),
                    "plan_name": plan_name,
                }
            },
            allow_promotion_codes=True,  # Allow discount codes
        )
        
        # Store customer ID if new
        if not current_user.subscription:
            new_sub = Subscription(
                user_id=current_user.id,
                plan_name=plan_name,
                stripe_customer_id=customer_id,
                is_active=False  # Will be activated by webhook
            )
            db.add(new_sub)
            await db.commit()
        elif not current_user.subscription.stripe_customer_id:
            current_user.subscription.stripe_customer_id = customer_id
            await db.commit()
        
        logger.info(f"Created checkout session for user {current_user.id}: {checkout_session.id}")
        
        return CheckoutSessionResponse(
            checkout_url=checkout_session.url,
            session_id=checkout_session.id
        )
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


@stripe_router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Stripe webhooks for subscription events
    
    Events handled:
    - checkout.session.completed: Activate subscription
    - customer.subscription.updated: Update subscription
    - customer.subscription.deleted: Cancel subscription
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        await handle_checkout_completed(session, db)
    
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        await handle_subscription_updated(subscription, db)
    
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        await handle_subscription_deleted(subscription, db)
    
    elif event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        await handle_payment_succeeded(invoice, db)
    
    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        await handle_payment_failed(invoice, db)
    
    return {"status": "success"}


async def handle_checkout_completed(session, db: AsyncSession):
    """Activate subscription after successful checkout"""
    user_id = int(session["metadata"]["user_id"])
    subscription_id = session["subscription"]
    
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        logger.error(f"User {user_id} not found for checkout session")
        return
    
    # Get subscription details from Stripe
    stripe_sub = stripe.Subscription.retrieve(subscription_id)
    
    # Calculate expiry date
    expires_at = datetime.fromtimestamp(stripe_sub.current_period_end)
    
    # Update or create subscription
    if user.subscription:
        user.subscription.stripe_subscription_id = subscription_id
        user.subscription.is_active = True
        user.subscription.started_at = datetime.utcnow()
        user.subscription.expires_at = expires_at
        user.subscription.plan_name = session["metadata"]["plan_name"]
    else:
        subscription = Subscription(
            user_id=user_id,
            plan_name=session["metadata"]["plan_name"],
            stripe_customer_id=session["customer"],
            stripe_subscription_id=subscription_id,
            is_active=True,
            started_at=datetime.utcnow(),
            expires_at=expires_at
        )
        db.add(subscription)
    
    # Update user tier
    user.subscription_tier = SubscriptionTier.PREMIUM
    
    await db.commit()
    logger.info(f"Activated premium subscription for user {user_id}")


async def handle_subscription_updated(subscription, db: AsyncSession):
    """Handle subscription updates (renewals, cancellations, etc.)"""
    subscription_id = subscription["id"]
    
    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
    )
    db_sub = result.scalar_one_or_none()
    
    if not db_sub:
        logger.warning(f"Subscription {subscription_id} not found in database")
        return
    
    # Update expiry date
    db_sub.expires_at = datetime.fromtimestamp(subscription["current_period_end"])
    
    # Update status
    if subscription["status"] == "active":
        db_sub.is_active = True
        db_sub.user.subscription_tier = SubscriptionTier.PREMIUM
    elif subscription["status"] in ["canceled", "unpaid", "past_due"]:
        db_sub.is_active = False
        db_sub.user.subscription_tier = SubscriptionTier.FREE
    
    await db.commit()
    logger.info(f"Updated subscription {subscription_id}")


async def handle_subscription_deleted(subscription, db: AsyncSession):
    """Handle subscription cancellation"""
    subscription_id = subscription["id"]
    
    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
    )
    db_sub = result.scalar_one_or_none()
    
    if not db_sub:
        return
    
    db_sub.is_active = False
    db_sub.user.subscription_tier = SubscriptionTier.FREE
    
    await db.commit()
    logger.info(f"Cancelled subscription {subscription_id}")


async def handle_payment_succeeded(invoice, db: AsyncSession):
    """Log successful payment"""
    logger.info(f"Payment succeeded for invoice {invoice['id']}")


async def handle_payment_failed(invoice, db: AsyncSession):
    """Handle failed payment"""
    logger.warning(f"Payment failed for invoice {invoice['id']}")


@stripe_router.get("/subscription-status", response_model=SubscriptionStatus)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current subscription status for user"""
    if not current_user.subscription:
        return SubscriptionStatus(is_premium=False, plan_name=None, expires_at=None)
    
    return SubscriptionStatus(
        is_premium=current_user.is_premium,
        plan_name=current_user.subscription.plan_name,
        expires_at=current_user.subscription.expires_at.isoformat() if current_user.subscription.expires_at else None,
        cancel_at_period_end=False  # TODO: Get from Stripe
    )


@stripe_router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel subscription (at end of billing period)"""
    if not current_user.subscription or not current_user.subscription.stripe_subscription_id:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    try:
        # Cancel at period end (don't immediately revoke access)
        stripe.Subscription.modify(
            current_user.subscription.stripe_subscription_id,
            cancel_at_period_end=True
        )
        
        logger.info(f"Scheduled cancellation for user {current_user.id}")
        
        return {"message": "Subscription will be cancelled at the end of the billing period"}
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error cancelling subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")
