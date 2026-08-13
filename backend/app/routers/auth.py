from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.models.health_record import DailyHealthRecord
from app.schemas.auth import (
    UserSignupRequest, UserLoginRequest, SocialAuthRequest,
    PhoneOtpRequest, PhoneVerifyRequest, TokenResponse, LanguageUpdateRequest
)
from app.utils.security import (
    verify_password, get_password_hash, create_access_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse)
def signup(req: UserSignupRequest, db: Session = Depends(get_db)):
    if not req.email and not req.phone:
        raise HTTPException(status_code=400, detail="Please provide either an email or a phone number.")
    
    if req.email:
        existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    if req.phone:
        existing = db.query(User).filter(User.phone == req.phone.strip()).first()
        if existing:
            raise HTTPException(status_code=400, detail="An account with this phone number already exists.")

    hashed_pw = get_password_hash(req.password) if req.password else None
    
    user = User(
        email=req.email.lower().strip() if req.email else None,
        phone=req.phone.strip() if req.phone else None,
        hashed_password=hashed_pw,
        auth_provider=req.auth_provider,
        language=req.language or "en"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        phone=user.phone,
        language=user.language,
        has_profile=False,
        has_day1_data=False
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = None
    if req.email:
        user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    elif req.phone:
        user = db.query(User).filter(User.phone == req.phone.strip()).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials. Account not found.")

    if user.hashed_password and req.password:
        if not verify_password(req.password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect password. Please try again.")

    user.last_login = datetime.utcnow()
    db.commit()

    has_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first() is not None
    has_day1 = db.query(DailyHealthRecord).filter(DailyHealthRecord.user_id == user.id).first() is not None
    
    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        phone=user.phone,
        language=user.language,
        has_profile=has_profile,
        has_day1_data=has_day1
    )

@router.post("/google", response_model=TokenResponse)
@router.post("/apple", response_model=TokenResponse)
@router.post("/social", response_model=TokenResponse)
def social_login(req: SocialAuthRequest, db: Session = Depends(get_db)):
    email = req.email.lower().strip() if req.email else f"{req.provider}_{req.phone or 'user'}@digitaltwin.ai"
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            email=email,
            phone=req.phone,
            auth_provider=req.provider,
            language=req.language or "en"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Auto create profile if name provided
        if req.name:
            profile = UserProfile(
                user_id=user.id,
                name=req.name,
                age=28,
                gender="Prefer not to say",
                height=172.0,
                weight=68.0,
                place="Chennai"
            )
            db.add(profile)
            db.commit()

    user.last_login = datetime.utcnow()
    db.commit()

    has_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first() is not None
    has_day1 = db.query(DailyHealthRecord).filter(DailyHealthRecord.user_id == user.id).first() is not None

    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        phone=user.phone,
        language=user.language,
        has_profile=has_profile,
        has_day1_data=has_day1
    )

@router.post("/phone/otp")
def send_phone_otp(req: PhoneOtpRequest):
    # Simulated secure SMS OTP generation for instant demo access
    return {
        "success": True,
        "message": f"OTP successfully sent to {req.phone}",
        "demo_otp": "123456"
    }

@router.post("/phone/verify", response_model=TokenResponse)
def verify_phone_otp(req: PhoneVerifyRequest, db: Session = Depends(get_db)):
    # Verify standard demo OTP or 6-digit OTP
    if req.otp != "123456" and len(req.otp) != 6:
        raise HTTPException(status_code=400, detail="Invalid OTP entered. Please try again.")

    phone = req.phone.strip()
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        user = User(
            phone=phone,
            email=f"phone_{phone[-4:]}@digitaltwin.ai",
            auth_provider="phone",
            language="en"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    user.last_login = datetime.utcnow()
    db.commit()

    has_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first() is not None
    has_day1 = db.query(DailyHealthRecord).filter(DailyHealthRecord.user_id == user.id).first() is not None

    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        phone=user.phone,
        language=user.language,
        has_profile=has_profile,
        has_day1_data=has_day1
    )

@router.get("/me", response_model=TokenResponse)
def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    has_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first() is not None
    has_day1 = db.query(DailyHealthRecord).filter(DailyHealthRecord.user_id == current_user.id).first() is not None
    token = create_access_token(subject=current_user.id)
    
    return TokenResponse(
        access_token=token,
        user_id=current_user.id,
        email=current_user.email,
        phone=current_user.phone,
        language=current_user.language,
        has_profile=has_profile,
        has_day1_data=has_day1
    )
