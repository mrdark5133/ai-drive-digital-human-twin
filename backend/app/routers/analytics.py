from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.models.health_record import DailyHealthRecord
from app.models.meal import Meal
from app.schemas.analytics import (
    RiskIndicator, WeekOverWeekAnalysis, HealthTrendsResponse,
    TrendDataPoint, MealTimingAlert
)
from app.services.feature_engineering import extract_features
from app.services.ai_risk_engine import ai_risk_engine
from app.services.context_analytics import context_analytics_engine
from app.services.meal_intelligence import meal_intelligence_service
from app.services.seed_service import seed_demo_history
from app.utils.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["AI Predictive Analytics & Trends"])

@router.get("/predictions", response_model=List[RiskIndicator])
def get_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    records = db.query(DailyHealthRecord).filter(DailyHealthRecord.user_id == current_user.id).all()
    meals = db.query(Meal).filter(Meal.user_id == current_user.id).all()

    features = extract_features(records, profile, meals)
    risks = ai_risk_engine.predict_risks(features)
    return risks

@router.get("/weekly-analysis", response_model=WeekOverWeekAnalysis)
def get_weekly_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    records = db.query(DailyHealthRecord).filter(
        DailyHealthRecord.user_id == current_user.id
    ).order_by(DailyHealthRecord.date.asc()).all()

    return context_analytics_engine.analyze_week_over_week(records, profile)

@router.get("/health-trends", response_model=HealthTrendsResponse)
def get_health_trends(
    timeframe: str = "7d",  # 7d, 30d, 90d
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    days = 7
    if timeframe == "30d":
        days = 30
    elif timeframe == "90d":
        days = 90

    cutoff_date = date.today() - timedelta(days=days)
    records = db.query(DailyHealthRecord).filter(
        DailyHealthRecord.user_id == current_user.id,
        DailyHealthRecord.date >= cutoff_date
    ).order_by(DailyHealthRecord.date.asc()).all()

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    base_weight = profile.weight if profile else 70.0

    data_points: List[TrendDataPoint] = []

    if records:
        for r in records:
            # Estimate resting HR from activity, smoking, sleep
            hr_est = 68.0
            if r.steps and r.steps < 4000: hr_est += 4.0
            if r.smoking: hr_est += (r.smoking_frequency or 1) * 2.0
            if r.sleep_duration and r.sleep_duration < 6.5: hr_est += 3.0
            if r.exercise: hr_est -= 2.0

            # Estimate day health score
            day_score = 88.0
            if r.sleep_duration and r.sleep_duration < 6.5: day_score -= 8.0
            if r.steps and r.steps < 5000: day_score -= 6.0
            if r.smoking: day_score -= min(15.0, (r.smoking_frequency or 1) * 3.0)
            if r.exercise: day_score += 4.0
            day_score = max(40.0, min(98.0, day_score))

            data_points.append(TrendDataPoint(
                date=r.date.strftime("%b %d"),
                heart_rate_est=round(hr_est, 1),
                sleep_hours=r.sleep_duration or 7.0,
                weight=round(base_weight, 1),
                steps=r.steps or 0,
                health_score=round(day_score, 1),
                risk_score=round(100.0 - day_score, 1)
            ))
    else:
        # If no records yet, provide single baseline point
        data_points.append(TrendDataPoint(
            date=date.today().strftime("%b %d"),
            heart_rate_est=72.0,
            sleep_hours=7.5,
            weight=round(base_weight, 1),
            steps=5000,
            health_score=85.0,
            risk_score=15.0
        ))

    return HealthTrendsResponse(timeframe=timeframe, data_points=data_points)

@router.get("/meal-alert", response_model=MealTimingAlert)
def get_meal_alert(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    historical_meals = db.query(Meal).filter(Meal.user_id == current_user.id).all()
    today_meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date == date.today()
    ).all()

    return meal_intelligence_service.analyze_meal_schedule(
        historical_meals=historical_meals,
        today_meals=today_meals,
        language=current_user.language or "en"
    )

@router.post("/seed-demo")
def seed_demo_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = seed_demo_history(current_user.id, db, days=14)
    return {
        "success": True,
        "message": f"Successfully seeded {count} days of realistic health, meal, and lifestyle history.",
        "days_seeded": count
    }

@router.post("/reset-data")
def reset_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Meal).filter(Meal.user_id == current_user.id).delete()
    db.query(DailyHealthRecord).filter(DailyHealthRecord.user_id == current_user.id).delete()
    db.commit()
    return {"success": True, "message": "User health logs reset successfully."}
