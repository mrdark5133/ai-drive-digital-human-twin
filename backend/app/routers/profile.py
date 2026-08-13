from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.profile import UserProfileCreate, UserProfileUpdate, UserProfileResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("", response_model=UserProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not yet configured for this user.")
    return profile

@router.post("", response_model=UserProfileResponse)
def create_profile(
    req: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if existing:
        # Update existing rather than failing
        existing.name = req.name
        existing.age = req.age
        existing.gender = req.gender
        existing.height = req.height
        existing.weight = req.weight
        existing.place = req.place
        db.commit()
        db.refresh(existing)
        return existing

    profile = UserProfile(
        user_id=current_user.id,
        name=req.name.strip(),
        age=req.age,
        gender=req.gender,
        height=req.height,
        weight=req.weight,
        place=req.place.strip()
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.put("", response_model=UserProfileResponse)
def update_profile(
    req: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile does not exist. Please create it first.")

    if req.name is not None: profile.name = req.name.strip()
    if req.age is not None: profile.age = req.age
    if req.gender is not None: profile.gender = req.gender
    if req.height is not None: profile.height = req.height
    if req.weight is not None: profile.weight = req.weight
    if req.place is not None: profile.place = req.place.strip()

    db.commit()
    db.refresh(profile)
    return profile
