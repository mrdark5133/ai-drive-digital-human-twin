from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date

class RiskIndicator(BaseModel):
    category: str              # Cardiovascular, Metabolic, Respiratory, Lifestyle
    risk_level: str            # Low, Moderate, Elevated
    score: float               # 0.0 - 1.0 or percentage
    color: str
    explanation: str
    key_drivers: List[str]

class WeekOverWeekMetric(BaseModel):
    metric_name: str
    unit: str
    previous_week: float
    current_week: float
    change_value: float
    change_direction: str      # up, down, stable
    is_positive_trend: bool

class WeekOverWeekAnalysis(BaseModel):
    is_available: bool
    message: str
    metrics: List[WeekOverWeekMetric]
    ai_context_explanation: str
    overall_health_score_change: float

class TrendDataPoint(BaseModel):
    date: str
    heart_rate_est: Optional[float] = None
    sleep_hours: Optional[float] = None
    weight: Optional[float] = None
    steps: Optional[int] = None
    health_score: Optional[float] = None
    risk_score: Optional[float] = None

class HealthTrendsResponse(BaseModel):
    timeframe: str             # 7d, 30d, 90d
    data_points: List[TrendDataPoint]

class RecommendationItem(BaseModel):
    id: int
    type: str                  # do or avoid
    category: str
    icon: str
    title: str
    recommendation: str
    priority: str

class MealTimingAlert(BaseModel):
    needs_alert: bool
    meal_type: Optional[str] = None
    usual_time: Optional[str] = None
    message: Optional[str] = None

class HealthcareFacility(BaseModel):
    id: str
    name: str
    facility_type: str         # Hospital, Specialty Clinic, Diagnostic Center
    specialist_type: str       # Cardiologist, Pulmonologist, Endocrinologist, Nutritionist, General Physician
    address: str
    distance_km: float
    rating: float
    phone: str
    matching_reason: str
