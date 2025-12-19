# Subscription 404 Error - Root Cause & Fix

## 🔍 Root Cause

The "Not Found" error occurred because:

1. **Frontend was calling**: `/api/stripe/create-checkout-session`
2. **But deployed backend only has**: `/api/payment/create-checkout-session`

### Why the Mismatch?

- The updated code with `stripe_router` (from `auth/stripe_payment.py`) exists in your **local files**
- But this updated code **has NOT been deployed to Render yet**
- Render is still running the older version with only `payment_router`

---

## ✅ Quick Fix Applied

Changed the frontend to use the **existing deployed endpoint**:

### What Changed:

1. **Endpoint URL**: 
   - ❌ Old: `/api/stripe/create-checkout-session`
   - ✅ New: `/api/payment/create-checkout-session`

2. **Authentication**:
   - ❌ Old: Used JWT Bearer token
   - ✅ New: Sends user email directly (as deployed endpoint expects)

3. **Request Body**:
   - ✅ Kept: `{ billing_cycle: "monthly" | "yearly" }`
   - ✅ Added: `{ email: user.email }`

4. **Response Field**:
   - ✅ Now checks both `data.url` and `data.checkout_url`

---

## 🚀 Testing Now

The subscription should now work with these changes:

```typescript
// ✅ Now uses deployed endpoint
fetch(`${apiUrl}/api/payment/create-checkout-session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: user.email,  // From authenticated user
    billing_cycle: billingCycle  // "monthly" or "yearly"
  })
})
```

---

## 🔄 Deploying the Updated Backend (Optional)

If you want to use the newer `stripe_router` endpoint with JWT authentication:

### 1. Verify Changes Are Committed

```bash
git status
git add backend/main.py
git commit -m "Add stripe_router to main.py"
git push origin main
```

### 2. Render Will Auto-Deploy

- Render watches your GitHub repo
- It will automatically deploy when you push
- Check: https://dashboard.render.com → Your backend service → Events

### 3. Wait for Deployment

- Usually takes 2-5 minutes
- Check the logs for any errors
- Verify deployment is "Live"

### 4. Update Frontend (if using new endpoint)

Once the backend is deployed with `stripe_router`, you can optionally switch to:

```typescript
// Option: Use JWT-authenticated endpoint
fetch(`${apiUrl}/api/stripe/create-checkout-session`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    billing_cycle: billingCycle
  })
})
```

---

## 🧪 Test the Fix

### 1. Rebuild & Deploy Frontend

```bash
npm run build
git add .
git commit -m "Fix subscription endpoint to use deployed API"
git push origin main
```

Vercel will auto-deploy the frontend.

### 2. Test Payment Flow

1. Go to: https://sql-4-data.vercel.app/
2. **Log in** (very important!)
3. Click "Upgrade to Premium"
4. Select Monthly or Yearly
5. Click "Get Started"
6. Should redirect to Stripe Checkout ✅

### 3. Use Stripe Test Card

```
Card: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123
ZIP: 12345
```

---

## ⚠️ Important Notes

### Current Stripe Configuration

Check your `/backend/.env` file - I noticed:

```env
STRIPE_SECRET_KEY=mk_1MLF5gG3tobHtbH82HzFgjMc
STRIPE_PUBLISHABLE_KEY=mk_1MLF5OG3tobHtbH83SKLi7us
```

**These don't look like valid Stripe keys!**

Stripe keys should start with:
- Secret Key: `sk_test_...` (test mode) or `sk_live_...` (live mode)
- Publishable Key: `pk_test_...` (test mode) or `pk_live_...` (live mode)

### Get Real Stripe Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy the correct keys
3. Update your `.env` file
4. **Add them to Render environment variables** (very important!)

---

## 📋 Deployment Checklist

### Frontend (Vercel)
- [x] Updated endpoint to `/api/payment/create-checkout-session`
- [x] Using user email from auth context
- [x] Build successful
- [ ] Push to GitHub
- [ ] Vercel auto-deploys

### Backend (Render)
- [ ] Stripe keys configured in Render environment
- [ ] Get real Stripe API keys (not `mk_...`)
- [ ] Create products in Stripe Dashboard
- [ ] Update STRIPE_PRICE_MONTHLY and STRIPE_PRICE_YEARLY
- [ ] Backend deployed and running
- [ ] Check `/docs` endpoint shows payment routes

---

## 🔍 Verify Deployment

### Check Backend Endpoints

```bash
# Should return 200 OK
curl https://sql4data-2.onrender.com/health

# Should show API documentation
curl https://sql4data-2.onrender.com/docs
```

### Check Frontend

```bash
# Should return your app
curl https://sql-4-data.vercel.app/
```

---

## 🆘 If Still Getting 404

1. **Check browser console** for exact error
2. **Verify API URL** in frontend env:
   ```
   VITE_API_URL=https://sql4data-2.onrender.com
   ```
3. **Check Render logs**:
   - Go to Render dashboard
   - Click your backend service
   - Check "Logs" tab
4. **Verify Stripe keys** are set in Render
5. **Test endpoint directly**:
   ```bash
   curl -X POST https://sql4data-2.onrender.com/api/payment/create-checkout-session \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","billing_cycle":"monthly"}'
   ```

---

## ✅ Summary

**Problem**: Frontend called `/api/stripe/...` but backend only had `/api/payment/...`

**Solution**: Updated frontend to use the existing deployed endpoint

**Status**: ✅ Fixed - Ready to test

**Next**: Get valid Stripe API keys and configure them in Render

---

**The subscription checkout should now work!** 🎉
