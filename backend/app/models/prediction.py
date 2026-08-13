from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    prediction_date = Column(Date, default=date.today, index=True)
    
    risk_category = Column(String(100), nullable=False)  # Cardiovascular, Metabolic, Respiratory, Lifestyle
    risk_level = Column(String(50), nullable=False)      # Low, Moderate, Elevated, High
    risk_score = Column(Float, nullable=False)           # 0.0 - 1.0 or 0 - 100
    prediction = Column(String(255), nullable=False)     # Summary title
    explanation = Column(Text, nullable=False)           # Contextual justification / reasoning
    model_version = Column(String(50), default="ai_twin_v1.0")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="predictions")
