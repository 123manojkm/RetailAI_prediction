from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    username: str = Field(..., description="Username or email")
    password: str = Field(..., min_length=4, description="Plaintext password")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    role: Optional[str] = None
    username: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "user"


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
