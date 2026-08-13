from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    auth_provider = Column(String(50), default="email")  # email, google, apple, phone
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(50), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    language = Column(String(10), default="en")  # en, ta, hi, te, ml, kn
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    daily_records = relationship("DailyHealthRecord", back_populates="user", cascade="all, delete-orphan", order_by="DailyHealthRecord.date")
    meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan", order_by="Meal.date")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan", order_by="Prediction.prediction_date")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    health_scores = relationship("HealthScore", back_populates="user", cascade="all, delete-orphan", order_by="HealthScore.date")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
