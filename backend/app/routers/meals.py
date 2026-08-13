from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.meal import Meal
from app.schemas.health import MealItemCreate, MealItemResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/meals", tags=["Meals"])

@router.post("", response_model=MealItemResponse)
def log_meal(
    req: MealItemCreate,
    target_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log_date = target_date or date.today()
    meal = Meal(
        user_id=current_user.id,
        date=log_date,
        meal_type=req.meal_type.lower().strip(),
        food_description=req.food_description.strip(),
        meal_time=req.meal_time.strip()
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal

@router.get("/today", response_model=List[MealItemResponse])
def get_today_meals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date == today
    ).all()
    return meals

@router.get("/history", response_model=List[MealItemResponse])
def get_meals_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id
    ).order_by(Meal.date.desc(), Meal.created_at.desc()).limit(limit).all()
    return meals
