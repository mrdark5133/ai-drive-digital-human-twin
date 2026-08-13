from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base

class DailyHealthRecord(Base):
    __tablename__ = "daily_health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date = Column(Date, default=date.today, index=True)
    
    # Sleep data
    sleep_time = Column(String(20), nullable=True)  # e.g., "11:30 PM"
    wake_time = Column(String(20), nullable=True)   # e.g., "06:30 AM"
    sleep_duration = Column(Float, nullable=True)   # in hours, e.g. 7.0
    
    # Exercise data
    exercise = Column(Boolean, default=False)
    exercise_type = Column(String(100), nullable=True)  # Walking, Running, Gym, Yoga, Cycling, etc.
    exercise_duration = Column(Integer, default=0)       # in minutes
    
    # Walking / Activity data
    walking = Column(Boolean, default=False)
    walking_duration = Column(Integer, default=0)        # in minutes
    steps = Column(Integer, default=0)
    
    # Lifestyle habits (Smoking & Alcohol)
    smoking = Column(Boolean, default=False)
    smoking_frequency = Column(Integer, default=0)       # times per day
    
    alcohol = Column(Boolean, default=False)
    alcohol_frequency = Column(Integer, default=0)       # units / drinks per day

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="daily_records")
