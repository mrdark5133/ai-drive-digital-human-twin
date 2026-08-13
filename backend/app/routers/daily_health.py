from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.health_record import DailyHealthRecord
from app.models.meal import Meal
from app.schemas.health import DailyHealthCreate, DailyHealthResponse, MealItemResponse
from app.services.feature_engineering import calculate_sleep_duration_from_times
from app.utils.security import get_current_user

router = APIRouter(prefix="/daily-health", tags=["Daily Health Records"])

@router.post("", response_model=DailyHealthResponse)
def submit_daily_health(
    req: DailyHealthCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = req.date or date.today()

    # Calculate sleep duration automatically if times given
    calculated_duration = req.sleep_duration
    if (not calculated_duration or calculated_duration == 0) and req.sleep_time and req.wake_time:
        calculated_duration = calculate_sleep_duration_from_times(req.sleep_time, req.wake_time)

    # Check if record for this date already exists
    record = db.query(DailyHealthRecord).filter(
        DailyHealthRecord.user_id == current_user.id,
        DailyHealthRecord.date == target_date
    ).first()

    if record:
        # Update existing day record
        record.sleep_time = req.sleep_time
        record.wake_time = req.wake_time
        record.sleep_duration = calculated_duration
        record.exercise = req.exercise
        record.exercise_type = req.exercise_type
        record.exercise_duration = req.exercise_duration
        record.walking = req.walking
        record.walking_duration = req.walking_duration
        record.steps = req.steps
        record.smoking = req.smoking
        record.smoking_frequency = req.smoking_frequency
        record.alcohol = req.alcohol
        record.alcohol_frequency = req.alcohol_frequency
        record.updated_at = datetime.utcnow()
    else:
        # Create new record
        record = DailyHealthRecord(
            user_id=current_user.id,
            date=target_date,
            sleep_time=req.sleep_time,
            wake_time=req.wake_time,
            sleep_duration=calculated_duration,
            exercise=req.exercise,
            exercise_type=req.exercise_type,
            exercise_duration=req.exercise_duration,
            walking=req.walking,
            walking_duration=req.walking_duration,
            steps=req.steps,
            smoking=req.smoking,
            smoking_frequency=req.smoking_frequency,
            alcohol=req.alcohol,
            alcohol_frequency=req.alcohol_frequency
        )
        db.add(record)

    # Process meals if provided in the payload
    if req.meals:
        # Clear existing meals for this date to avoid duplicates
        db.query(Meal).filter(
            Meal.user_id == current_user.id,
            Meal.date == target_date
        ).delete()

        for m in req.meals:
            meal_record = Meal(
                user_id=current_user.id,
                date=target_date,
                meal_type=m.meal_type.lower().strip(),
                food_description=m.food_description.strip(),
                meal_time=m.meal_time.strip()
            )
            db.add(meal_record)

    db.commit()
    db.refresh(record)

    # Fetch meals for response
    day_meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date == target_date
    ).all()

    resp_meals = [
        MealItemResponse(
            id=m.id,
            user_id=m.user_id,
            date=m.date,
            meal_type=m.meal_type,
            food_description=m.food_description,
            meal_time=m.meal_time,
            created_at=m.created_at
        ) for m in day_meals
    ]

    return DailyHealthResponse(
        id=record.id,
        user_id=record.user_id,
        date=record.date,
        sleep_time=record.sleep_time,
        wake_time=record.wake_time,
        sleep_duration=record.sleep_duration,
        exercise=record.exercise,
        exercise_type=record.exercise_type,
        exercise_duration=record.exercise_duration,
        walking=record.walking,
        walking_duration=record.walking_duration,
        steps=record.steps,
        smoking=record.smoking,
        smoking_frequency=record.smoking_frequency,
        alcohol=record.alcohol,
        alcohol_frequency=record.alcohol_frequency,
        created_at=record.created_at,
        meals=resp_meals
    )

@router.get("/today", response_model=Optional[DailyHealthResponse])
def get_today_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    record = db.query(DailyHealthRecord).filter(
        DailyHealthRecord.user_id == current_user.id,
        DailyHealthRecord.date == today
    ).first()

    if not record:
        return None

    day_meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date == today
    ).all()

    resp_meals = [
        MealItemResponse(
            id=m.id,
            user_id=m.user_id,
            date=m.date,
            meal_type=m.meal_type,
            food_description=m.food_description,
            meal_time=m.meal_time,
            created_at=m.created_at
        ) for m in day_meals
    ]

    return DailyHealthResponse(
        id=record.id,
        user_id=record.user_id,
        date=record.date,
        sleep_time=record.sleep_time,
        wake_time=record.wake_time,
        sleep_duration=record.sleep_duration,
        exercise=record.exercise,
        exercise_type=record.exercise_type,
        exercise_duration=record.exercise_duration,
        walking=record.walking,
        walking_duration=record.walking_duration,
        steps=record.steps,
        smoking=record.smoking,
        smoking_frequency=record.smoking_frequency,
        alcohol=record.alcohol,
        alcohol_frequency=record.alcohol_frequency,
        created_at=record.created_at,
        meals=resp_meals
    )

@router.get("/history", response_model=List[DailyHealthResponse])
def get_health_history(
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(DailyHealthRecord).filter(
        DailyHealthRecord.user_id == current_user.id
    ).order_by(DailyHealthRecord.date.desc()).limit(limit).all()

    response = []
    for r in records:
        day_meals = db.query(Meal).filter(
            Meal.user_id == current_user.id,
            Meal.date == r.date
        ).all()
        resp_meals = [
            MealItemResponse(
                id=m.id,
                user_id=m.user_id,
                date=m.date,
                meal_type=m.meal_type,
                food_description=m.food_description,
                meal_time=m.meal_time,
                created_at=m.created_at
            ) for m in day_meals
        ]
        response.append(DailyHealthResponse(
            id=r.id,
            user_id=r.user_id,
            date=r.date,
            sleep_time=r.sleep_time,
            wake_time=r.wake_time,
            sleep_duration=r.sleep_duration,
            exercise=r.exercise,
            exercise_type=r.exercise_type,
            exercise_duration=r.exercise_duration,
            walking=r.walking,
            walking_duration=r.walking_duration,
            steps=r.steps,
            smoking=r.smoking,
            smoking_frequency=r.smoking_frequency,
            alcohol=r.alcohol,
            alcohol_frequency=r.alcohol_frequency,
            created_at=r.created_at,
            meals=resp_meals
        ))

    return response
