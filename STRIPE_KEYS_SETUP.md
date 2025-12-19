# 🔐 URGENT: Add Stripe Keys to Render

## ✅ What I Fixed

1. **Removed secrets from git** - Your Stripe API keys are no longer in the repository
2. **Added `.env` to `.gitignore`** - Environment files won't be committed anymore
3. **Created `.env.local`** - Your real keys are here (not committed)
4. **Successfully pushed to GitHub** - No more blocked pushes!

---

## ⚠️ CRITICAL NEXT STEP

Your Stripe keys are now in `/backend/.env.local` (local only). You MUST add them to Render as environment variables for your backend to work in production.

---

## 🚀 Add Stripe Keys to Render

### Step 1: Go to Render Dashboard

1. Visit: https://dashboard.render.com
2. Click on your **backend service** (sql4data-2 or similar)
3. Click the **"Environment"** tab on the left

### Step 2: Add These Environment Variables

Click **"Add Environment Variable"** for each:

#### Stripe Secret Key
```
Key: STRIPE_SECRET_KEY
Value: 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
```

#### Stripe Publishable Key
```
Key: STRIPE_PUBLISHABLE_KEY
Value: pk_live_51MLF5JG3tobHtbH8V1T3SmFrX6CnZu3LSAzGSi0xMtO896oLzTUPsACHSlsIFG87yg82Txsfn6VLHEwn4HvHAaQO002KvRSxOX
```

#### Webhook Secret (get from Stripe)
```
Key: STRIPE_WEBHOOK_SECRET
Value: whsec_YOUR_ACTUAL_WEBHOOK_SECRET
```

#### Monthly Price ID (get from Stripe)
```
Key: STRIPE_PRICE_MONTHLY
Value: price_YOUR_MONTHLY_PRICE_ID
```

#### Yearly Price ID (get from Stripe)
```
Key: STRIPE_PRICE_YEARLY  
Value: price_YOUR_YEARLY_PRICE_ID
```

### Step 3: Save and Redeploy

1. Click **"Save Changes"**
2. Render will automatically redeploy your backend
3. Wait 2-5 minutes for deployment to complete
4. Check the logs for any errors

---

## 🔍 Get Missing Stripe Values

### Webhook Secret

**For Production (Render):**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Enter endpoint URL: `https://sql4data-2.onrender.com/api/payment/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

### Price IDs

1. Go to: https://dashboard.stripe.com/products
2. If you don't have products yet, create them:

   **Monthly Product:**
   - Click **"+ Add product"**
   - Name: SQL4Data Premium Monthly
   - Price: 4.99 EUR
   - Billing: Monthly, Recurring
   - Save and copy the **Price ID** (starts with `price_`)

   **Yearly Product:**
   - Click **"+ Add product"**
   - Name: SQL4Data Premium Yearly
   - Price: 49.90 EUR
   - Billing: Yearly, Recurring
   - Save and copy the **Price ID** (starts with `price_`)

---

## 🔒 Security Best Practices

### ✅ What's Secure Now

- ✅ `.env` files are in `.gitignore`
- ✅ Secrets are only in Render environment variables
- ✅ Local development uses `.env.local` (not committed)
- ✅ GitHub won't accept commits with secrets

### 📋 Environment Variable Checklist

**Local Development** (in `/backend/.env.local`):
- [x] STRIPE_SECRET_KEY
- [x] STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_WEBHOOK_SECRET (add after creating webhook)
- [ ] STRIPE_PRICE_MONTHLY (add after creating product)
- [ ] STRIPE_PRICE_YEARLY (add after creating product)

**Render Production** (add to Environment tab):
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] STRIPE_PRICE_MONTHLY
- [ ] STRIPE_PRICE_YEARLY

---

## 🧪 Test After Setup

1. **Check backend is running:**
   ```bash
   curl https://sql4data-2.onrender.com/health
   ```

2. **Test on your website:**
   - Go to https://sql-4-data.vercel.app/
   - Log in
   - Click "Upgrade to Premium"
   - Click "Get Started"
   - Should redirect to Stripe checkout ✅

3. **Use test card if in test mode:**
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ```

---

## ⚠️ Important Note

Your keys start with `sk_live_` and `pk_live_` which means they are **LIVE/PRODUCTION keys**. 

**For testing, you should use TEST keys instead:**
- Test Secret: starts with `sk_test_`
- Test Publishable: starts with `pk_test_`

Get test keys from: https://dashboard.stripe.com/test/apikeys

Switch to live keys only when you're ready to accept real payments!

---

## 🆘 If You Have Issues

1. **Backend not starting:**
   - Check Render logs for errors
   - Verify all env vars are set correctly
   - Make sure keys don't have extra spaces

2. **Still getting 404:**
   - Wait for Render deployment to complete
   - Check the endpoint exists: `/api/payment/create-checkout-session`
   - View API docs: https://sql4data-2.onrender.com/docs

3. **Stripe errors:**
   - Verify keys are valid (copy again from Stripe)
   - Make sure product/price IDs exist
   - Check webhook secret is correct

---

## 📚 Files Overview

- **`.gitignore`** - Now includes `.env` files ✅
- **`backend/.env`** - Template with placeholders (safe to commit) ✅
- **`backend/.env.local`** - Your real keys (NOT committed) ✅
- **Render Environment Variables** - Production keys (TODO: add them) ⚠️

---

## ✅ Summary

1. ✅ Git is now secure - no secrets committed
2. ✅ Code pushed successfully to GitHub
3. ⚠️ **ACTION REQUIRED**: Add Stripe keys to Render environment variables
4. ⏳ Create webhook endpoint in Stripe Dashboard
5. ⏳ Create products and get price IDs
6. ⏳ Test the subscription flow

**Your local development will work** once you have all values in `.env.local`

**Your production deployment will work** once you add all values to Render

---

🎉 **You're almost there!** Just add the environment variables to Render and you'll be accepting payments!
