from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserProfileCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., min_length=1, max_length=20)
    height: float = Field(..., ge=50, le=280, description="Height in cm")
    weight: float = Field(..., ge=20, le=300, description="Weight in kg")
    place: str = Field(..., min_length=2, max_length=100, description="City / Region")

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    place: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    age: int
    gender: str
    height: float
    weight: float
    place: str
    bmi: float
    updated_at: datetime

    class Config:
        from_attributes = True
