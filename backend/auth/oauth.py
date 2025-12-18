"""
OAuth authentication routes for SQL4DATA
Supports Google and GitHub social login
Uses python-social-auth patterns adapted for FastAPI
"""

import httpx
from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional
import secrets

from database import get_db
from config import get_settings
from auth.models import User, OAuthProvider, SubscriptionTier
from auth.jwt_handler import create_access_token, create_refresh_token

settings = get_settings()

# Security scheme for protected endpoints
security = HTTPBearer(auto_error=False)

oauth_router = APIRouter(prefix="/auth", tags=["Authentication"])

# OAuth Configuration (should be in environment variables)
OAUTH_CONFIG = {
    "google": {
        "client_id": getattr(settings, 'GOOGLE_CLIENT_ID', ''),
        "client_secret": getattr(settings, 'GOOGLE_CLIENT_SECRET', ''),
        "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "userinfo_url": "https://www.googleapis.com/oauth2/v2/userinfo",
        "scopes": ["email", "profile"],
    },
    "github": {
        "client_id": getattr(settings, 'GITHUB_CLIENT_ID', ''),
        "client_secret": getattr(settings, 'GITHUB_CLIENT_SECRET', ''),
        "authorize_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "userinfo_url": "https://api.github.com/user",
        "scopes": ["user:email"],
    }
}

# Store for OAuth state tokens (in production, use Redis)
oauth_states: dict = {}


@oauth_router.get("/login/{provider}")
async def oauth_login(provider: str, redirect_uri: Optional[str] = None):
    """
    Initiate OAuth login flow
    
    Redirects user to provider's authorization page
    """
    if provider not in OAUTH_CONFIG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider: {provider}"
        )
    
    config = OAUTH_CONFIG[provider]
    
    if not config["client_id"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{provider} OAuth not configured. Please add {provider.upper()}_CLIENT_ID and {provider.upper()}_CLIENT_SECRET to your .env file."
        )
    
    # Generate state token for CSRF protection
    state = secrets.token_urlsafe(32)
    oauth_states[state] = {
        "provider": provider,
        "redirect_uri": redirect_uri or "https://sql-4-data.vercel.app/",
        "created_at": datetime.utcnow()
    }
    
    # Build authorization URL
    callback_url = f"{settings.API_URL if hasattr(settings, 'API_URL') else 'http://localhost:8000,https://sql4data-2.onrender.com'}/auth/callback/{provider}"
    
    params = {
        "client_id": config["client_id"],
        "redirect_uri": callback_url,
        "scope": " ".join(config["scopes"]),
        "response_type": "code",
        "state": state,
    }
    
    if provider == "google":
        params["access_type"] = "offline"
        params["prompt"] = "consent"
    
    # Build URL with query params
    auth_url = config["authorize_url"] + "?" + "&".join(
        f"{k}={v}" for k, v in params.items()
    )
    
    return {"auth_url": auth_url, "state": state}


@oauth_router.post("/dev-login")
async def dev_login(db: AsyncSession = Depends(get_db)):
    """
    Development-only login endpoint
    Creates or uses a test user for development without OAuth
    
    WARNING: This should be disabled in production!
    """
    if getattr(settings, 'ENVIRONMENT', 'development') != 'development':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dev login only available in development mode"
        )
    
    # Find or create dev user
    result = await db.execute(
        select(User).where(User.email == "dev@sql4data.local")
    )
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            email="dev@sql4data.local",
            username="dev_user",
            full_name="Development User",
            avatar_url=None,
            provider=OAuthProvider.GITHUB,
            provider_id="dev_12345",
            subscription_tier=SubscriptionTier.FREE,
            gdpr_consent=True,
            gdpr_consent_date=datetime.utcnow(),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Create tokens
    access_token = create_access_token({"user_id": user.id, "email": user.email})
    refresh_token = create_refresh_token(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "is_premium": user.subscription_tier == SubscriptionTier.PREMIUM,
            "subscription_tier": user.subscription_tier.value,
        }
    }


@oauth_router.get("/callback/{provider}")
async def oauth_callback(
    provider: str,
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle OAuth callback from provider
    
    Exchanges code for token, fetches user info, creates/updates user
    """
    # Verify state
    if state not in oauth_states:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state token"
        )
    
    state_data = oauth_states.pop(state)
    if state_data["provider"] != provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provider mismatch"
        )
    
    config = OAUTH_CONFIG[provider]
    callback_url = f"{settings.API_URL if hasattr(settings, 'API_URL') else 'http://localhost:8000'}/auth/callback/{provider}"
    
    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_data = {
            "client_id": config["client_id"],
            "client_secret": config["client_secret"],
            "code": code,
            "redirect_uri": callback_url,
            "grant_type": "authorization_code",
        }
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        
        import logging
        logging.info(f"Token exchange - URL: {config['token_url']}")
        logging.info(f"Token exchange - redirect_uri: {callback_url}")
        logging.info(f"Token exchange - client_id: {config['client_id']}")
        logging.info(f"Token exchange - client_secret length: {len(config['client_secret'])}")
        
        token_response = await client.post(
            config["token_url"],
            data=token_data,
            headers=headers
        )
        
        if token_response.status_code != 200:
            import logging
            logging.error(f"Token exchange failed: {token_response.status_code}")
            logging.error(f"Response: {token_response.text}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to get access token: {token_response.text}"
            )
        
        token_json = token_response.json()
        access_token = token_json.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token in response"
            )
        
        # Fetch user info
        user_headers = {"Authorization": f"Bearer {access_token}"}
        if provider == "github":
            user_headers["Accept"] = "application/vnd.github+json"
        
        user_response = await client.get(
            config["userinfo_url"],
            headers=user_headers
        )
        
        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info"
            )
        
        user_info = user_response.json()
        
        # For GitHub, we might need to fetch email separately
        if provider == "github" and not user_info.get("email"):
            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers=user_headers
            )
            if emails_response.status_code == 200:
                emails = emails_response.json()
                primary_email = next(
                    (e["email"] for e in emails if e.get("primary")),
                    emails[0]["email"] if emails else None
                )
                user_info["email"] = primary_email
    
    # Parse user info based on provider
    if provider == "google":
        email = user_info.get("email")
        full_name = user_info.get("name")
        avatar_url = user_info.get("picture")
        provider_id = user_info.get("id")
    else:  # github
        email = user_info.get("email")
        full_name = user_info.get("name") or user_info.get("login")
        avatar_url = user_info.get("avatar_url")
        provider_id = str(user_info.get("id"))
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by OAuth provider"
        )
    
    # Find or create user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if user:
        # Update existing user
        user.last_login = datetime.utcnow()
        user.avatar_url = avatar_url or user.avatar_url
        if not user.provider_id:
            user.provider = OAuthProvider(provider)
            user.provider_id = provider_id
    else:
        # Create new user
        user = User(
            email=email,
            username=email.split("@")[0],
            full_name=full_name,
            avatar_url=avatar_url,
            provider=OAuthProvider(provider),
            provider_id=provider_id,
            subscription_tier=SubscriptionTier.FREE,
            last_login=datetime.utcnow()
        )
        db.add(user)
    
    await db.commit()
    await db.refresh(user)
    
    # Create JWT token
    token_payload = {
        "user_id": user.id,
        "email": user.email,
        "is_premium": user.is_premium,
        "subscription_tier": user.subscription_tier.value
    }
    
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(user.id)
    
    # Redirect back to frontend with token
    frontend_url = state_data.get("redirect_uri", "https://sql-4-data.vercel.app/")
    redirect_url = f"{frontend_url}?token={access_token}&refresh={refresh_token}"
    
    return RedirectResponse(url=redirect_url)


@oauth_router.get("/me")
async def get_current_user_info(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current authenticated user's information"""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    from auth.jwt_handler import verify_token
    
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "is_premium": user.is_premium,
            "subscription_tier": user.subscription_tier.value,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "gdpr_consent": user.gdpr_consent
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


@oauth_router.post("/logout")
async def logout():
    """
    Logout user - client should clear tokens
    """
    return {"message": "Logged out successfully"}


from pydantic import BaseModel

class GDPRConsentRequest(BaseModel):
    consent: bool


@oauth_router.post("/gdpr-consent")
async def update_gdpr_consent(
    request: GDPRConsentRequest,
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update user's GDPR consent status"""
    consent = request.consent
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    from auth.jwt_handler import verify_token
    
    payload = verify_token(credentials.credentials)
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.gdpr_consent = consent
    user.gdpr_consent_date = datetime.utcnow() if consent else None
    
    await db.commit()
    
    return {"gdpr_consent": user.gdpr_consent}
