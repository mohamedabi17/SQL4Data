# Render Environment Variables

**CRITICAL**: Add these environment variables in your Render dashboard for the backend service.

## Database
```
DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_LA8RudkFf7Oz@ep-hidden-cake-a4uvf3ug-pooler.us-east-1.aws.neon.tech/neondb
DATABASE_URL_SYNC=postgresql://neondb_owner:npg_LA8RudkFf7Oz@ep-hidden-cake-a4uvf3ug-pooler.us-east-1.aws.neon.tech/neondb
READONLY_DATABASE_URL=postgresql://neondb_owner:npg_LA8RudkFf7Oz@ep-hidden-cake-a4uvf3ug-pooler.us-east-1.aws.neon.tech/neondb
```

## API Keys
```
GEMINI_API_KEY=AIzaSyDxqB2ZKPy2mBkstAKkhqirMK95FBPHD8Q
```

## OAuth
```
GOOGLE_CLIENT_ID=558222113032-q9e9rq85qb0rfcur61pdssk2ib6k231d.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

## JWT
```
JWT_SECRET=your-super-secret-production-jwt-key-min-32-characters-long
JWT_ALGORITHM=HS256
```

## URLs (UPDATE THESE WITH YOUR ACTUAL VERCEL URL)
```
FRONTEND_URL=https://your-vercel-app.vercel.app
API_URL=https://sql4data-2.onrender.com
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

## Stripe (ADD YOUR PRODUCTION KEYS)
```
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_PRICE_MONTHLY=price_YOUR_MONTHLY_PRICE_ID
STRIPE_PRICE_YEARLY=price_YOUR_YEARLY_PRICE_ID
```

## Environment
```
ENVIRONMENT=production
DEBUG=false
```

## Security
```
MAX_QUERY_LENGTH=5000
QUERY_TIMEOUT_SECONDS=30
```

---

## How to add these in Render:
1. Go to https://dashboard.render.com/
2. Select your backend service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Copy-paste each variable (one at a time)
6. Click "Save Changes"
7. Render will automatically redeploy

**Important**: Make sure to update `FRONTEND_URL` and `ALLOWED_ORIGINS` with your actual Vercel URL!
