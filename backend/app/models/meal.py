from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date = Column(Date, default=date.today, index=True)
    meal_type = Column(String(50), nullable=False)  # breakfast, lunch, snack, dinner
    food_description = Column(String(500), nullable=False)  # e.g., "2 idli and sambar"
    meal_time = Column(String(20), nullable=False)  # e.g., "08:30 AM"
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="meals")
