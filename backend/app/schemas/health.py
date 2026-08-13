from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class MealItemCreate(BaseModel):
    meal_type: str = Field(..., description="breakfast, lunch, snack, dinner")
    food_description: str = Field(..., min_length=2, max_length=500)
    meal_time: str = Field(..., description="e.g. 08:30 AM")

class MealItemResponse(BaseModel):
    id: int
    user_id: int
    date: date
    meal_type: str
    food_description: str
    meal_time: str
    created_at: datetime

    class Config:
        from_attributes = True

class DailyHealthCreate(BaseModel):
    date: Optional[date] = None
    # Sleep
    sleep_time: Optional[str] = None       # e.g. "11:30 PM"
    wake_time: Optional[str] = None        # e.g. "06:30 AM"
    sleep_duration: Optional[float] = None # Calculated automatically if not given
    # Exercise
    exercise: bool = False
    exercise_type: Optional[str] = None
    exercise_duration: int = 0
    # Walking / Activity
    walking: bool = False
    walking_duration: int = 0
    steps: int = 0
    # Habits
    smoking: bool = False
    smoking_frequency: int = 0
    alcohol: bool = False
    alcohol_frequency: int = 0
    # Meals for this day (optional combined submission)
    meals: Optional[List[MealItemCreate]] = None

class DailyHealthResponse(BaseModel):
    id: int
    user_id: int
    date: date
    sleep_time: Optional[str]
    wake_time: Optional[str]
    sleep_duration: Optional[float]
    exercise: bool
    exercise_type: Optional[str]
    exercise_duration: int
    walking: bool
    walking_duration: int
    steps: int
    smoking: bool
    smoking_frequency: int
    alcohol: bool
    alcohol_frequency: int
    created_at: datetime
    meals: Optional[List[MealItemResponse]] = None

    class Config:
        from_attributes = True
