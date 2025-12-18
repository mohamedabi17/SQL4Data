"""
Stripe Payment Integration for €4.99 Micro-SaaS Model
"""
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# €4.99 Pricing Model
STRIPE_PRICE_MONTHLY = os.getenv("STRIPE_PRICE_MONTHLY")  # €4.99/month
STRIPE_PRICE_YEARLY = os.getenv("STRIPE_PRICE_YEARLY")    # €49.90/year

# Success and cancel URLs
SUCCESS_URL = os.getenv("FRONTEND_URL", "https://sql-4-data.vercel.app/") + "/payment/success"
CANCEL_URL = os.getenv("FRONTEND_URL", "https://sql-4-data.vercel.app/") + "/payment/cancelled"


def create_checkout_session(email: str, billing_cycle: str = "yearly"):
    """
    Create a Stripe Checkout session for subscription
    
    Args:
        email: User's email address
        billing_cycle: "monthly" or "yearly" (default: yearly for better conversion)
    
    Returns:
        Stripe checkout session object
    """
    price_id = STRIPE_PRICE_YEARLY if billing_cycle == "yearly" else STRIPE_PRICE_MONTHLY
    
    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=email,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url=SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=CANCEL_URL,
            metadata={
                "email": email,
                "plan": billing_cycle,
            },
            allow_promotion_codes=True,  # Allow discount codes
            billing_address_collection="auto",
            automatic_tax={"enabled": True},  # Auto-calculate EU VAT
        )
        return checkout_session
    except Exception as e:
        raise Exception(f"Failed to create checkout session: {str(e)}")


def create_customer_portal_session(customer_id: str):
    """
    Create a Stripe Customer Portal session for managing subscription
    """
    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=os.getenv("FRONTEND_URL", "https://sql-4-data.vercel.app/    ") + "/profile",
        )
        return portal_session
    except Exception as e:
        raise Exception(f"Failed to create portal session: {str(e)}")


def verify_webhook_signature(payload: bytes, sig_header: str):
    """
    Verify Stripe webhook signature for security
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        return event
    except ValueError:
        raise Exception("Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise Exception("Invalid signature")
