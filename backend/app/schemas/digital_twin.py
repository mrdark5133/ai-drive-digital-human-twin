from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date
from app.schemas.profile import UserProfileResponse

class OrganStatus(BaseModel):
    name: str                  # Heart, Respiratory, Brain/Mental, Digestive/Metabolic, Sleep, Fitness
    score: float               # 0 - 100 (%)
    status: str                # optimal, good, attention, warning
    color: str                 # hex or tailwind class
    ai_risk_indicator: str     # Low, Moderate, Elevated
    summary: str
    contributing_factors: List[str]
    recommendations: List[str]

class HealthScoreBreakdown(BaseModel):
    overall_score: float
    heart: float
    respiratory: float
    mental: float
    sleep: float
    fitness: float

class DigitalTwinState(BaseModel):
    user_id: int
    profile: Optional[UserProfileResponse] = None
    days_tracked: int
    health_score: HealthScoreBreakdown
    organs: Dict[str, OrganStatus]
    last_updated: Optional[date] = None
    has_sufficient_data: bool
    status_summary: str
