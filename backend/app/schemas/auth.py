from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserSignupRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    auth_provider: str = "email"  # email, google, apple, phone
    language: Optional[str] = "en"

class UserLoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    auth_provider: str = "email"

class SocialAuthRequest(BaseModel):
    provider: str  # google, apple, phone
    token: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = "en"

class PhoneOtpRequest(BaseModel):
    phone: str

class PhoneVerifyRequest(BaseModel):
    phone: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: Optional[str] = None
    phone: Optional[str] = None
    language: str
    has_profile: bool
    has_day1_data: bool

class LanguageUpdateRequest(BaseModel):
    language: str
