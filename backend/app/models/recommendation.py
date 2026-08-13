from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date = Column(Date, default=date.today, index=True)
    
    type = Column(String(50), default="do")              # "do" (What you can do) or "avoid" (Things to reduce/avoid)
    category = Column(String(100), nullable=False)       # Nutrition, Sleep, Activity, Hydration, Habits, Medical
    icon = Column(String(50), default="sparkles")        # icon identifier
    title = Column(String(200), nullable=False)
    recommendation = Column(Text, nullable=False)
    priority = Column(String(20), default="medium")      # high, medium, low
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="recommendations")
