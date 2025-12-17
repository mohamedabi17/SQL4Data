# €4.99 Micro-SaaS Pricing Model - Implementation Guide

## Overview
This implementation adds a complete €4.99/month micro-SaaS pricing model to sql4Data with strict usage limits, Stripe payments, and automatic subscription management.

## Pricing Structure

### Monthly Plan: **€4.99/month**
- Billed monthly
- Cancel anytime
- All premium features

### Yearly Plan: **€49.90/year** (Best Value ⭐)
- Equals **€4.15/month**
- **Save 2 months** compared to monthly
- Default selection for better conversion

## Usage Limits

### Free Tier
- ✅ 3 AI feedback requests per day
- ✅ Access to basic exercises
- ✅ Progress tracking
- ❌ Limited hints

### Premium Tier (€4.99)
- ✅ "Unlimited" AI feedback (50/day fair use limit)
- ✅ All 100+ exercises
- ✅ Unlimited hints
- ✅ View all solutions
- ✅ Ad-free experience
- ✅ Priority support

### Fair Use Policy
Premium users who hit 50 AI requests/day see:
> "You're on fire! You've hit the fair usage limit for today. (50/50)"

This prevents API abuse while appearing unlimited to normal users.

---

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Run Database Migration
```bash
# Connect to your PostgreSQL database
psql -U sql4data_user -d sql4data_db -f migration_add_users.sql
```

Or manually run the migration:
```sql
CREATE TABLE users (...);  -- See migration_add_users.sql
```

#### Configure Stripe

1. **Get Stripe Keys**: https://dashboard.stripe.com/apikeys
   - Copy Secret Key (`sk_test_...`)
   - Copy Publishable Key (`pk_test_...`)

2. **Create Products in Stripe Dashboard**:
   - Go to: https://dashboard.stripe.com/products
   
   **Monthly Product:**
   - Name: "SQL4Data Premium - Monthly"
   - Price: €4.99
   - Billing: Recurring monthly
   - Copy Price ID (`price_...`)
   
   **Yearly Product:**
   - Name: "SQL4Data Premium - Yearly"
   - Price: €49.90
   - Billing: Recurring yearly
   - Copy Price ID (`price_...`)

3. **Set up Webhook**:
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "+ Add endpoint"
   - URL: `https://yourdomain.com/api/payment/webhook`
   - Events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy Webhook Secret (`whsec_...`)

#### Update `.env` File
```bash
# Add to backend/.env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_MONTHLY=price_your_monthly_id
STRIPE_PRICE_YEARLY=price_your_yearly_id
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend Setup

The pricing page is already updated with:
- ✅ Default to yearly plan (better conversion)
- ✅ €4.15/mo display with crossed-out €4.99
- ✅ "2 Months Free" badge
- ✅ Responsive design

#### Test the Pricing Page
```bash
npm run dev
# Click "Upgrade to Premium" in header
```

### 3. Testing Payment Flow

#### Test Mode (Stripe Test Keys)
Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- Any future expiry date, any CVC

#### Test Workflow:
1. Click "Get Premium" button
2. Enter test email and card
3. Complete checkout
4. User is upgraded to premium tier
5. Check database: `subscription_tier = 'premium'`
6. Test AI feedback (should allow 50/day)

### 4. Webhook Testing (Local Development)

Use Stripe CLI to forward webhooks:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local backend
stripe listen --forward-to localhost:8001/api/payment/webhook

# Copy webhook secret and update .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Production Deployment

#### Backend
1. Set production Stripe keys (live keys start with `pk_live_` and `sk_live_`)
2. Update webhook URL to production domain
3. Set `FRONTEND_URL` to production URL
4. Enable automatic tax in Stripe Dashboard (for EU VAT)

#### Stripe Dashboard Settings
- Enable Customer Portal: https://dashboard.stripe.com/settings/billing/portal
- Allow customers to:
  - ✅ Update payment method
  - ✅ Cancel subscription
  - ✅ View invoices
  - ❌ Change plan (lock them into €4.99 pricing)

---

## API Endpoints

### Payment Endpoints

#### Create Checkout Session
```http
POST /api/payment/create-checkout-session
Content-Type: application/json

{
  "email": "user@example.com",
  "billing_cycle": "yearly"
}
```

Response:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### Create Customer Portal Session
```http
POST /api/payment/create-portal-session
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Get Subscription Status
```http
GET /api/payment/subscription-status?email=user@example.com
```

Response:
```json
{
  "tier": "premium",
  "status": "active",
  "isPremium": true,
  "endDate": "2025-12-17T00:00:00Z"
}
```

### AI Feedback with Usage Limits

#### Explain Query Error
```http
POST /api/explain
Content-Type: application/json

{
  "task_id": 1,
  "query": "SELECT * FROM users",
  "error_message": "syntax error",
  "user_email": "user@example.com"
}
```

**Success Response (< limit):**
```json
{
  "explanation": "...",
  "hints": ["..."],
  "suggested_concepts": ["..."],
  "usage_remaining": 2,
  "usage_limit": 3
}
```

**Error Response (limit reached):**
```http
HTTP 429 Too Many Requests

{
  "detail": {
    "message": "Daily AI feedback limit reached (3/3)",
    "limit": 3,
    "remaining": 0,
    "tier": "free",
    "reset_in_hours": 8,
    "is_premium": false,
    "upgrade_message": "Upgrade to Premium for 50 AI feedbacks per day"
  }
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    subscription_tier VARCHAR(20) DEFAULT 'free',      -- 'free' or 'premium'
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_status VARCHAR(20) DEFAULT 'inactive', -- 'active', 'inactive', 'cancelled', 'past_due'
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    daily_ai_usage_count INTEGER DEFAULT 0,            -- Resets daily
    last_usage_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

---

## Frontend Integration Example

### Subscribe to Premium
```typescript
const handleSubscribe = async () => {
  const response = await fetch('http://localhost:8001/api/payment/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      billing_cycle: 'yearly' // or 'monthly'
    })
  });
  
  const { url } = await response.json();
  window.location.href = url; // Redirect to Stripe Checkout
};
```

### Check Usage Limits
```typescript
const checkUsageLimits = async () => {
  try {
    const response = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ /* ... */ })
    });
    
    if (response.status === 429) {
      const error = await response.json();
      showToast(error.detail.upgrade_message);
      // Show upgrade modal
    }
  } catch (error) {
    // Handle error
  }
};
```

---

## Conversion Optimization Tips

### Why €4.99 Works
1. **Psychological Pricing**: Under €5 feels much cheaper than €9.99
2. **Low Barrier**: Easy impulse purchase, no "think about it"
3. **High Volume**: Compensate with more customers
4. **Yearly Default**: 83% conversion to yearly = better LTV

### Upsell Strategies
- Show "2 Months Free" prominently
- Default to yearly plan
- Display crossed-out €4.99 when showing €4.15/mo
- Use scarcity: "Limited time offer"

### Usage Limit Psychology
- Free users see "3 per day" (clear limit)
- Premium users see "Unlimited" (actually 50)
- Premium toast at 50: "You're on fire!" (positive framing)
- Never show "50/50" to premium users upfront

---

## Monitoring & Analytics

### Key Metrics to Track
- **MRR (Monthly Recurring Revenue)**
- **Churn Rate** (target < 5%)
- **Free → Premium Conversion** (target > 5%)
- **Monthly → Yearly Conversion** (target > 70%)
- **Usage per tier** (prevent API abuse)

### Stripe Dashboard Metrics
- View MRR: https://dashboard.stripe.com/revenue
- Active subscriptions
- Failed payments (set up Dunning emails)
- Refund requests

---

## Troubleshooting

### Webhook Not Firing
```bash
# Test webhook locally
stripe trigger customer.subscription.created
```

### User Not Upgraded After Payment
- Check webhook logs in Stripe Dashboard
- Verify `stripe_customer_id` in database
- Check subscription status

### Usage Limits Not Resetting
- Verify `last_usage_reset` timestamp
- Check timezone handling (use UTC)
- Run: `SELECT * FROM users WHERE daily_ai_usage_count > 0;`

---

## Security Checklist
- ✅ Verify webhook signatures
- ✅ Use environment variables for keys
- ✅ Never expose secret keys in frontend
- ✅ Validate user email ownership
- ✅ Rate limit API endpoints
- ✅ Enable Stripe Radar (fraud prevention)

---

## Next Steps

1. **Set up Stripe account** and get API keys
2. **Run database migration** to add users table
3. **Configure environment variables** with Stripe keys
4. **Test payment flow** with test cards
5. **Deploy to production** with live Stripe keys
6. **Monitor conversions** and optimize pricing page
7. **Set up email notifications** for subscription events
8. **Add analytics** to track MRR and churn

---

## Support

For issues or questions:
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test Cards: https://stripe.com/docs/testing

---

**Your €4.99 micro-SaaS is ready to launch! 🚀**
