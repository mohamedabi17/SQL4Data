# Subscription & Checkout - Quick Reference

## ✅ What Was Fixed

### 1. **Backend Router Added**
- Added `stripe_router` from `auth/stripe_payment.py` to `main.py`
- Endpoint now available at: `/api/stripe/create-checkout-session`

### 2. **Frontend Updated**
- Fixed `billingPeriod` → `billingCycle` variable name
- Updated API endpoint from `/api/payments/...` to `/api/stripe/...`
- Changed request body parameter from `price_type` to `billing_cycle`
- Updated response field from `url` to `checkout_url`

### 3. **Environment Configuration**
- Added Stripe configuration to `/backend/.env`
- Updated `.env.example` with proper Stripe setup

---

## 🚀 Quick Start

### 1. Set Up Stripe (REQUIRED)

Follow the complete guide in **STRIPE_COMPLETE_SETUP.md**

**Quick steps:**
1. Create Stripe account: https://dashboard.stripe.com/register
2. Get API keys: https://dashboard.stripe.com/test/apikeys
3. Create 2 products:
   - Monthly: €4.99/month
   - Yearly: €49.90/year
4. Copy Price IDs to `.env`
5. Set up webhooks (Stripe CLI for local dev)

### 2. Update Backend .env

Edit `/backend/.env` and replace these placeholders:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET
STRIPE_PRICE_MONTHLY=price_YOUR_ACTUAL_MONTHLY_ID
STRIPE_PRICE_YEARLY=price_YOUR_ACTUAL_YEARLY_ID
```

### 3. Restart Backend

```bash
# If using Docker
docker-compose restart backend

# Or rebuild
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f backend
```

### 4. Test Payment Flow

1. Open your app: http://localhost:5173
2. **Log in** (required for checkout)
3. Click **"Upgrade to Premium"**
4. Select **Monthly** or **Yearly**
5. Click **"Get Started"**
6. Should redirect to Stripe Checkout
7. Use test card: `4242 4242 4242 4242`
8. Complete payment
9. Webhook activates subscription

---

## 🔍 How It Works

### User Journey

```
[User clicks "Get Started"]
         ↓
[Frontend sends POST to /api/stripe/create-checkout-session]
  - Headers: Authorization Bearer token
  - Body: { billing_cycle: "monthly" or "yearly" }
         ↓
[Backend creates Stripe Checkout Session]
  - Validates user is authenticated
  - Creates/retrieves Stripe customer
  - Generates checkout URL
         ↓
[Frontend redirects to Stripe Checkout]
  - User enters card details
  - Completes payment
         ↓
[Stripe sends webhook to /api/stripe/webhook]
  - Event: checkout.session.completed
  - Backend activates subscription
         ↓
[User redirected back with success]
  - Subscription is now active
  - Premium features unlocked
```

### API Endpoints

**Create Checkout Session**
```
POST /api/stripe/create-checkout-session
Authorization: Bearer <jwt_token>
Body: { "billing_cycle": "monthly" | "yearly" }

Response: {
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_..."
}
```

**Webhook Handler**
```
POST /api/stripe/webhook
Headers: stripe-signature
Body: Stripe event payload

Events:
- checkout.session.completed → Activate subscription
- customer.subscription.updated → Update subscription
- customer.subscription.deleted → Cancel subscription
- invoice.payment_succeeded → Renew subscription
- invoice.payment_failed → Handle failed payment
```

**Get Subscription Status**
```
GET /api/stripe/subscription
Authorization: Bearer <jwt_token>

Response: {
  "is_premium": true,
  "plan_name": "premium_monthly",
  "expires_at": "2025-01-19T...",
  "cancel_at_period_end": false
}
```

---

## 🧪 Testing

### Test Cards (Stripe Test Mode)

**Success:**
```
4242 4242 4242 4242
Expiry: Any future date (12/34)
CVC: Any 3 digits (123)
ZIP: Any (12345)
```

**Decline:**
```
4000 0000 0000 0002
```

**3D Secure Authentication:**
```
4000 0025 0000 3155
```

### Local Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local backend
stripe listen --forward-to http://localhost:8001/api/stripe/webhook

# Copy the webhook secret (whsec_...) to .env
```

---

## 🐛 Troubleshooting

### "404 Not Found" Error
✅ **FIXED** - stripe_router now included in main.py

### "Cannot find name 'billingPeriod'"
✅ **FIXED** - Changed to `billingCycle`

### "No checkout URL received"
- Check Stripe keys are set in `.env`
- Verify keys are correct (test mode vs live mode)
- Check backend logs for errors

### "User not authenticated"
- Make sure user is logged in
- Check JWT token in localStorage
- Verify token is being sent in Authorization header

### Webhook not triggering
- For local dev: Make sure `stripe listen` is running
- For production: Check webhook endpoint is accessible
- Verify webhook secret matches

### Payment succeeds but subscription not activated
- Check webhook events in Stripe Dashboard
- Verify webhook secret is correct
- Check backend logs for webhook errors

---

## 📊 Monitoring

### Stripe Dashboard (Test Mode)

- **Payments**: https://dashboard.stripe.com/test/payments
- **Subscriptions**: https://dashboard.stripe.com/test/subscriptions
- **Customers**: https://dashboard.stripe.com/test/customers
- **Events**: https://dashboard.stripe.com/test/events
- **Webhooks**: https://dashboard.stripe.com/test/webhooks
- **Logs**: https://dashboard.stripe.com/test/logs

### Backend Logs

```bash
# Docker
docker-compose logs -f backend | grep -i stripe

# Check for errors
docker-compose logs backend | grep -i error
```

---

## 🌐 Production Deployment

### Render Environment Variables

Add to your backend service:

```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... when ready)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... when ready)
STRIPE_WEBHOOK_SECRET=whsec_... (from production webhook)
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
```

### Vercel Environment Variables

Add to your frontend project:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=https://sql4data-2.onrender.com
```

Then redeploy both services.

---

## ✅ Complete Checklist

Backend:
- [x] stripe_router imported in main.py
- [x] stripe_router included in app.include_router()
- [ ] Stripe API keys added to .env
- [ ] Price IDs created and added to .env
- [ ] Webhook secret added to .env
- [ ] Backend restarted

Frontend:
- [x] API endpoint updated to /api/stripe/create-checkout-session
- [x] Request parameter changed to billing_cycle
- [x] Response field changed to checkout_url
- [x] billingCycle state variable fixed

Testing:
- [ ] User can log in
- [ ] Subscription page opens
- [ ] "Get Started" redirects to Stripe
- [ ] Test payment completes
- [ ] Webhook activates subscription
- [ ] User has premium access

---

## 📚 Related Files

- **Backend:**
  - `/backend/main.py` - Main app with router
  - `/backend/auth/stripe_payment.py` - Stripe integration
  - `/backend/auth/models.py` - User & Subscription models
  - `/backend/config.py` - Stripe configuration
  - `/backend/.env` - Environment variables

- **Frontend:**
  - `/src/components/SubscriptionPage/SubscriptionPage.tsx` - Subscription UI
  - `/src/contexts/AuthContext.tsx` - Authentication state

- **Documentation:**
  - `STRIPE_COMPLETE_SETUP.md` - Complete setup guide
  - `STRIPE_SETUP_GUIDE.md` - Original guide
  - This file - Quick reference

---

## 🎉 Done!

Your subscription system is now properly configured and ready to accept payments!

**Next Steps:**
1. Get your Stripe API keys
2. Create products and prices
3. Update .env file
4. Restart backend
5. Test with test card
6. Deploy to production when ready

Happy coding! 🚀
