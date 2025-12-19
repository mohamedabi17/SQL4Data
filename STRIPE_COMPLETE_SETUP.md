# Complete Stripe Integration Setup for SQL4Data

## 🎯 Overview
This guide will help you set up Stripe payments for your SQL4Data platform with the €4.99 micro-SaaS pricing model.

**Pricing:**
- Monthly: €4.99/month
- Yearly: €49.90/year (€4.15/month - save 2 months)

---

## 📋 Step 1: Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up for a Stripe account
3. Complete the verification process
4. Switch to **Test Mode** for development (toggle in top right)

---

## 🔑 Step 2: Get Your API Keys

1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key token"

3. Add them to your `/backend/.env` file:
```env
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

---

## 💰 Step 3: Create Products and Prices

### Create Monthly Subscription (€4.99/month)

1. Go to [https://dashboard.stripe.com/test/products](https://dashboard.stripe.com/test/products)
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: SQL4Data Premium Monthly
   - **Description**: Monthly subscription to SQL4Data premium features
   - **Pricing model**: Standard pricing
   - **Price**: 4.99
   - **Currency**: EUR (€)
   - **Billing period**: Monthly
   - **Recurring**
4. Click **"Save product"**
5. Copy the **Price ID** (starts with `price_...`)
6. Add to `.env`:
```env
STRIPE_PRICE_MONTHLY=price_YOUR_MONTHLY_PRICE_ID
```

### Create Yearly Subscription (€49.90/year)

1. Click **"+ Add product"** again
2. Fill in:
   - **Name**: SQL4Data Premium Yearly
   - **Description**: Yearly subscription to SQL4Data premium features (save 2 months)
   - **Pricing model**: Standard pricing
   - **Price**: 49.90
   - **Currency**: EUR (€)
   - **Billing period**: Yearly
   - **Recurring**
3. Click **"Save product"**
4. Copy the **Price ID** (starts with `price_...`)
5. Add to `.env`:
```env
STRIPE_PRICE_YEARLY=price_YOUR_YEARLY_PRICE_ID
```

---

## 🪝 Step 4: Set Up Webhooks (For Production)

Webhooks allow Stripe to notify your backend when payments succeed/fail.

### Local Development (using Stripe CLI)

1. Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

2. Login to Stripe CLI:
```bash
stripe login
```

3. Forward webhooks to your local backend:
```bash
stripe listen --forward-to http://localhost:8001/api/stripe/webhook
```

4. This will give you a webhook signing secret (starts with `whsec_...`)
5. Add to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Production Deployment

1. Go to [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"+ Add endpoint"**
3. Enter your endpoint URL:
   ```
   https://sql4data-2.onrender.com/api/stripe/webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add to your Render environment variables

---

## 🔧 Step 5: Update Backend Environment Variables

Your `/backend/.env` should now look like this:

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://sql4data_user:sql4data_password@postgres:5432/sql4data_db
DATABASE_URL_SYNC=postgresql://sql4data_user:sql4data_password@postgres:5432/sql4data_db
READONLY_DATABASE_URL=postgresql://readonly_user:readonly_password@postgres:5432/sql4data_db

# Google Gemini API Key
GEMINI_API_KEY=AIzaSyDxqB2ZKPy2mBkstAKkhqirMK95FBPHD8Q

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://sql-4-data.vercel.app/

# Environment
ENVIRONMENT=development
DEBUG=true

# Security
MAX_QUERY_LENGTH=5000
QUERY_TIMEOUT_SECONDS=30

# OAuth Configuration
GOOGLE_CLIENT_ID=558222113032-q9e9rq85qb0rfcur61pdssk2ib6k231d.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# JWT Configuration
JWT_SECRET=sql4data-super-secret-jwt-key-change-in-production-min-32-chars
JWT_ALGORITHM=HS256

# Frontend/API URLs
FRONTEND_URL=https://sql-4-data.vercel.app/
API_URL=https://sql4data-2.onrender.com

# ===== STRIPE CONFIGURATION =====
# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY

# Get from: https://dashboard.stripe.com/test/webhooks (or Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Price IDs from: https://dashboard.stripe.com/test/products
STRIPE_PRICE_MONTHLY=price_YOUR_MONTHLY_PRICE_ID
STRIPE_PRICE_YEARLY=price_YOUR_YEARLY_PRICE_ID
```

---

## 🚀 Step 6: Deploy and Test

### Restart Your Backend

```bash
# If using Docker
docker-compose restart backend

# Or rebuild
docker-compose down
docker-compose up -d --build
```

### Test the Integration

1. **Log in to your app** (make sure you're authenticated)

2. **Click "Upgrade to Premium"**

3. **Select Monthly or Yearly plan**

4. **Click "Get Started"** - This should:
   - Create a Stripe Checkout session
   - Redirect you to Stripe's payment page

5. **Use Stripe Test Cards**:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Authentication**: `4000 0025 0000 3155`
   - Any future expiry date (e.g., 12/34)
   - Any 3-digit CVC (e.g., 123)
   - Any ZIP code

6. **Complete the payment**

7. **Webhook should activate your subscription**

---

## 🔍 Step 7: Monitor and Debug

### Check Stripe Dashboard

- **Payments**: [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
- **Subscriptions**: [https://dashboard.stripe.com/test/subscriptions](https://dashboard.stripe.com/test/subscriptions)
- **Events**: [https://dashboard.stripe.com/test/events](https://dashboard.stripe.com/test/events)
- **Logs**: [https://dashboard.stripe.com/test/logs](https://dashboard.stripe.com/test/logs)

### Check Backend Logs

```bash
# View logs
docker-compose logs -f backend

# Or on Render
# Go to your backend service → Logs tab
```

### Common Issues

**Error: "No checkout URL received"**
- Make sure Stripe keys are set in `.env`
- Check backend logs for Stripe errors
- Verify Price IDs are correct

**Error: "Failed to create checkout session"**
- Check if STRIPE_SECRET_KEY is set correctly
- Make sure you're using test mode keys during development
- Verify user is authenticated (check JWT token)

**Webhook not working**
- For local dev: Make sure Stripe CLI is running (`stripe listen`)
- For production: Check webhook endpoint is accessible
- Verify webhook secret matches

---

## 🌐 Step 8: Configure Production (Render + Vercel)

### Update Render Environment Variables

Go to your Render backend service → Environment tab:

```
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY (use test key for now)
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY (use test key for now)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET
STRIPE_PRICE_MONTHLY=price_YOUR_MONTHLY_PRICE_ID
STRIPE_PRICE_YEARLY=price_YOUR_YEARLY_PRICE_ID
```

### Update Vercel Environment Variables

Add these to your Vercel project:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY
VITE_API_URL=https://sql4data-2.onrender.com
```

Then redeploy:
```bash
git push origin main
```

---

## 📊 Step 9: Go Live with Real Payments

When ready to accept real payments:

1. **Complete Stripe account activation**
   - Add business details
   - Verify bank account

2. **Switch to Live Mode** in Stripe Dashboard

3. **Create live products** with the same prices (€4.99, €49.90)

4. **Update environment variables** with live keys:
   - Replace `sk_test_...` with `sk_live_...`
   - Replace `pk_test_...` with `pk_live_...`
   - Update webhook secret to live webhook secret

5. **Test thoroughly** before promoting to users

---

## ✅ Checklist

- [ ] Stripe account created
- [ ] API keys obtained (test mode)
- [ ] Monthly product created (€4.99)
- [ ] Yearly product created (€49.90)
- [ ] Price IDs added to `.env`
- [ ] Webhook configured (local or production)
- [ ] Backend restarted with new env vars
- [ ] Test payment successful with test card
- [ ] User subscription activated after payment
- [ ] Webhook events logged properly
- [ ] Production deployment configured (optional)

---

## 🆘 Need Help?

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe API Reference**: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- **Stripe Testing**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Stripe Support**: Available in dashboard chat

---

## 🎉 You're Done!

Your SQL4Data platform now has a complete payment system with:
- ✅ Stripe Checkout integration
- ✅ Monthly & Yearly subscriptions
- ✅ Webhook handling for automatic activation
- ✅ Secure payment processing
- ✅ Customer management

Users can now upgrade to premium and enjoy all the features! 🚀
