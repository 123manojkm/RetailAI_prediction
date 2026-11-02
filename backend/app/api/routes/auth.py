from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.core.security import (
    create_access_token,
    get_current_user,
    verify_password,
)
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate user with username/email and password, returning a JWT bearer access token.
    """
    logger.info(f"Login attempt for user: {login_data.username}")
    stmt = select(User).where(
        or_(
            User.username == login_data.username,
            User.email == login_data.username,
        )
    )
    user = db.execute(stmt).scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.password_hash):
        logger.warning(f"Failed login attempt for user: {login_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        logger.warning(f"Login attempt for deactivated user: {login_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive",
        )

    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.username,
        expires_delta=expires,
        extra_claims={"role": user.role, "user_id": user.id},
    )

    logger.info(f"User authenticated successfully: {user.username} (role: {user.role})")
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        role=user.role,
        username=user.username,
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Retrieve profile details of the currently authenticated user.
    """
    return UserResponse.model_validate(current_user)
