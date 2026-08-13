from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.models.health_record import DailyHealthRecord
from app.models.meal import Meal
from app.models.health_score import HealthScore
from app.schemas.digital_twin import DigitalTwinState, HealthScoreBreakdown
from app.schemas.profile import UserProfileResponse
from app.services.feature_engineering import extract_features
from app.services.health_score_engine import health_score_engine
from app.utils.security import get_current_user

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin"])

@router.get("", response_model=DigitalTwinState)
def get_digital_twin_state(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    records = db.query(DailyHealthRecord).filter(
        DailyHealthRecord.user_id == current_user.id
    ).order_by(DailyHealthRecord.date.asc()).all()
    meals = db.query(Meal).filter(Meal.user_id == current_user.id).all()

    days_tracked = len(records)
    features = extract_features(records, profile, meals)
    breakdown, organs = health_score_engine.compute_scores(features)

    # Save today's computed score in health_scores table if records exist
    if records:
        today = date.today()
        existing_score = db.query(HealthScore).filter(
            HealthScore.user_id == current_user.id,
            HealthScore.date == today
        ).first()
        if not existing_score:
            new_score = HealthScore(
                user_id=current_user.id,
                date=today,
                overall_score=breakdown.overall_score,
                heart_score=breakdown.heart,
                respiratory_score=breakdown.respiratory,
                mental_score=breakdown.mental,
                sleep_score=breakdown.sleep,
                fitness_score=breakdown.fitness
            )
            db.add(new_score)
            db.commit()

    profile_resp = UserProfileResponse.model_validate(profile) if profile else None
    last_date = records[-1].date if records else None
    has_sufficient = days_tracked >= 1

    if days_tracked == 0:
        summary = "Your Digital Twin is ready to initialize. Complete Day 1 health and lifestyle data to activate personalized physiological modeling."
    elif days_tracked < 7:
        summary = f"Digital Twin active (Day {days_tracked} of baseline calibration). AI models are learning your circadian and physical habits."
    else:
        summary = f"Full Digital Twin operational across {days_tracked} days of historical monitoring. Context-aware predictive modeling active."

    return DigitalTwinState(
        user_id=current_user.id,
        profile=profile_resp,
        days_tracked=days_tracked,
        health_score=breakdown,
        organs=organs,
        last_updated=last_date,
        has_sufficient_data=has_sufficient,
        status_summary=summary
    )

@router.get("/health-score", response_model=HealthScoreBreakdown)
def get_health_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    records = db.query(DailyHealthRecord).filter(
        DailyHealthRecord.user_id == current_user.id
    ).all()
    meals = db.query(Meal).filter(Meal.user_id == current_user.id).all()

    features = extract_features(records, profile, meals)
    breakdown, _ = health_score_engine.compute_scores(features)
    return breakdown
