# 🚀 Free Deployment Guide

## Complete FREE hosting stack for SQL4Data

### Total Cost: **€0/month** 🎉

---

## 📦 Services Overview

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Neon** | PostgreSQL Database | 0.5 GB storage, always on |
| **Render** | Backend (Docker) | 750 hours/month, auto-sleep |
| **Vercel** | Frontend (React) | 100 GB bandwidth, unlimited sites |

---

## 🔧 Step-by-Step Deployment

### 1️⃣ Database Setup (Neon) - 5 minutes

**Create Database:**
1. Go to https://neon.tech and sign up
2. Click "Create Project"
3. Name: `sql4data-db`
4. Region: Choose closest to you
5. PostgreSQL version: 15
6. Click "Create Project"

**Get Connection String:**
```
postgresql://username:password@hostname/database?sslmode=require
```

**Run Migration:**
1. In Neon dashboard → SQL Editor
2. Open `backend/migration_add_users.sql`
3. Copy all SQL and paste into editor
4. Click "Run Query"
5. ✅ Tables created!

---

### 2️⃣ Backend Setup (Render) - 10 minutes

**Create Web Service:**
1. Go to https://render.com and sign up
2. Connect your GitHub account
3. Click "New +" → "Web Service"
4. Select your `sql-trainer` repository
5. Configure:
   - **Name:** `sql4data-backend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Instance Type:** Free

**Environment Variables:**
Click "Advanced" → "Add Environment Variable"

```bash
# Database
DATABASE_URL=<paste Neon connection string>

# Security
SECRET_KEY=<generate random 32 chars>
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth  
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google AI
GEMINI_API_KEY=your_gemini_api_key

# Stripe (test mode)
STRIPE_API_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app
```

**Deploy:**
1. Click "Create Web Service"
2. Wait 5-10 minutes for Docker build
3. Copy your URL: `https://sql4data-backend.onrender.com`
4. ✅ Backend live!

**⚠️ Note:** Free tier sleeps after 15 min inactivity (~30s wake time)

---

### 3️⃣ Frontend Setup (Vercel) - 5 minutes

**Update Configuration:**
1. Edit `.env.production`:
```bash
VITE_API_URL=https://sql4data-backend.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

**Deploy:**
```bash
# Install Vercel CLI (if not already)
npm install -g vercel

# Login
npx vercel login

# Deploy to production
npx vercel --prod
```

**Follow prompts:**
- Setup and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? `sql4data`
- Directory? `.` (root)
- Override settings? **N**

**Result:**
```
✅ Production: https://sql4data.vercel.app
```

---

### 4️⃣ Final Configuration

**Update Backend CORS:**
1. In Render dashboard → sql4data-backend → Environment
2. Update `ALLOWED_ORIGINS`:
```
https://sql4data.vercel.app,http://localhost:5173
```
3. Update `FRONTEND_URL`:
```
https://sql4data.vercel.app
```
4. Click "Save Changes" (triggers redeploy)

**Update OAuth Redirects:**
- **Google Console:** Add `https://sql4data.vercel.app/auth/google/callback`
- **GitHub Settings:** Add `https://sql4data.vercel.app/auth/github/callback`

**Configure Stripe Webhook:**
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://sql4data-backend.onrender.com/api/payments/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.*`
4. Copy webhook secret → Update `STRIPE_WEBHOOK_SECRET` in Render

---

## ✅ Testing Checklist

1. **Frontend loads:** https://sql4data.vercel.app
2. **Backend health:** https://sql4data-backend.onrender.com/health
3. **Google login:** Works and redirects
4. **GitHub login:** Works and redirects
5. **SQL tasks:** Load and execute
6. **AI feedback:** 3 free attempts per day
7. **Stripe checkout:** Test card `4242 4242 4242 4242`
8. **Subscription:** Upgrades to 50 attempts/day

---

## 🎯 Quick Deploy Script

Use the automated script:

```bash
./deploy-free.sh
```

This script:
- ✅ Checks git status
- ✅ Updates .env.production
- ✅ Deploys to Vercel
- ✅ Provides next steps

---

## 📊 Free Tier Limits

### Neon (Database)
- ✅ 0.5 GB storage
- ✅ 1 project
- ✅ Always on
- ⚠️ Enough for ~10k users

### Render (Backend)
- ✅ 750 hours/month (always on = 720 hours)
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ ~30 sec cold start

### Vercel (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited sites
- ✅ Always on
- ✅ Edge CDN (fast!)

---

## 🔄 Updating Your App

**Backend Changes:**
```bash
git add backend/
git commit -m "Update backend"
git push origin main
# Render auto-deploys from GitHub
```

**Frontend Changes:**
```bash
git add .
git commit -m "Update frontend"
git push origin main
npx vercel --prod
```

---

## 🚀 Scaling Later

When you outgrow free tiers:

### Phase 1: Stay Free Longer
- Optimize Render: Add health check to prevent sleep
- Neon: Upgrade to 3 GB ($19/mo)

### Phase 2: Modest Growth
- Render: Starter ($7/mo) - no sleep, more RAM
- Keep Neon + Vercel free

### Phase 3: Real Traffic
- Railway ($5/mo base + usage)
- Or Render Professional ($25/mo)
- Neon Scale ($69/mo)

---

## 🐛 Troubleshooting

**Backend doesn't respond:**
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Wait 30s for cold start wake

**CORS errors:**
- Check ALLOWED_ORIGINS includes Vercel URL
- No trailing slashes in URLs
- Redeploy backend after env changes

**OAuth fails:**
- Verify redirect URIs match exactly
- Check client IDs/secrets are correct
- Ensure HTTPS URLs (no HTTP in production)

**Stripe webhook fails:**
- Endpoint must be exact URL + `/api/payments/webhook`
- Webhook secret must match Render env var
- Test with Stripe CLI: `stripe listen --forward-to`

---

## 🎉 You're Live!

Your app is now running on:
- **Frontend:** https://sql4data.vercel.app
- **Backend:** https://sql4data-backend.onrender.com
- **Database:** Neon PostgreSQL

**Total cost: €0/month** 🎊

Share it, get feedback, and scale when needed!
