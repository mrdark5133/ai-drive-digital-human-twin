from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.models.health_record import DailyHealthRecord
from app.models.meal import Meal
from app.schemas.analytics import RecommendationItem
from app.services.feature_engineering import extract_features
from app.services.recommendation_engine import recommendation_engine
from app.utils.security import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationItem])
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    records = db.query(DailyHealthRecord).filter(DailyHealthRecord.user_id == current_user.id).all()
    meals = db.query(Meal).filter(Meal.user_id == current_user.id).all()

    features = extract_features(records, profile, meals)
    return recommendation_engine.generate_recommendations(features)
