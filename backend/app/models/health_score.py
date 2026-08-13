from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base

class HealthScore(Base):
    __tablename__ = "health_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date = Column(Date, default=date.today, index=True)
    
    overall_score = Column(Float, default=85.0)       # 0 - 100
    heart_score = Column(Float, default=90.0)         # 0 - 100 (%)
    respiratory_score = Column(Float, default=88.0)   # 0 - 100 (%)
    mental_score = Column(Float, default=80.0)        # 0 - 100 (%)
    sleep_score = Column(Float, default=75.0)         # 0 - 100 (%)
    fitness_score = Column(Float, default=85.0)       # 0 - 100 (%)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="health_scores")
