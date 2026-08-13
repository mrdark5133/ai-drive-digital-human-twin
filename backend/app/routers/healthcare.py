from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.models.health_record import DailyHealthRecord
from app.schemas.analytics import HealthcareFacility
from app.services.feature_engineering import extract_features
from app.services.ai_risk_engine import ai_risk_engine
from app.services.healthcare_locator import healthcare_locator_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/healthcare", tags=["Nearby Healthcare Facilities"])

@router.get("/nearby", response_model=List[HealthcareFacility])
def get_nearby_healthcare(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    records = db.query(DailyHealthRecord).filter(DailyHealthRecord.user_id == current_user.id).all()

    features = extract_features(records, profile)
    risks = ai_risk_engine.predict_risks(features)

    return healthcare_locator_service.find_nearby_healthcare(profile, risks)
