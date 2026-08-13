from datetime import date, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.profile import UserProfile
from app.models.health_record import DailyHealthRecord
from app.models.meal import Meal
from app.models.health_score import HealthScore
from app.services.feature_engineering import extract_features
from app.services.health_score_engine import health_score_engine

def seed_demo_history(user_id: int, db: Session, days: int = 14) -> int:
    """
    Seeds realistic 14-day longitudinal health journey showing a lifestyle transition.
    Week 1: High steps (7,200), good sleep (7.4h), regular meals, low smoking (0-1).
    Week 2: Busy work period - lower sleep (6.4h), fewer steps (4,900), skipped workouts, slight smoking (2/day).
    This immediately demonstrates the Week-over-Week context comparison!
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return 0

    # Ensure profile exists
    if not user.profile:
        profile = UserProfile(
            user_id=user_id,
            name="Alex Morgan",
            age=29,
            gender="Male",
            height=176.0,
            weight=72.5,
            place="Chennai"
        )
        db.add(profile)
        db.commit()

    # Clear existing daily records & meals for a clean demo seed
    db.query(Meal).filter(Meal.user_id == user_id).delete()
    db.query(DailyHealthRecord).filter(DailyHealthRecord.user_id == user_id).delete()
    db.query(HealthScore).filter(HealthScore.user_id == user_id).delete()
    db.commit()

    today = date.today()

    # Define 14-day lifestyle progression
    day_templates = [
        # --- WEEK 1: Active & Well-Rested (Days 1 to 7) ---
        {"sleep_t": "11:00 PM", "wake_t": "06:45 AM", "sleep_d": 7.75, "ex": True, "ex_t": "Brisk Walking", "ex_d": 40, "walk": True, "walk_d": 45, "steps": 7600, "smoke": False, "smoke_f": 0, "alc": False, "alc_f": 0},
        {"sleep_t": "11:15 PM", "wake_t": "06:30 AM", "sleep_d": 7.25, "ex": True, "ex_t": "Gym Workout", "ex_d": 45, "walk": True, "walk_d": 35, "steps": 8100, "smoke": False, "smoke_f": 0, "alc": False, "alc_f": 0},
        {"sleep_t": "11:30 PM", "wake_t": "07:00 AM", "sleep_d": 7.50, "ex": False, "ex_t": "", "ex_d": 0, "walk": True, "walk_d": 40, "steps": 6900, "smoke": False, "smoke_f": 0, "alc": False, "alc_f": 0},
        {"sleep_t": "11:00 PM", "wake_t": "06:30 AM", "sleep_d": 7.50, "ex": True, "ex_t": "Cycling", "ex_d": 35, "walk": True, "walk_d": 30, "steps": 7200, "smoke": False, "smoke_f": 0, "alc": False, "alc_f": 0},
        {"sleep_t": "11:45 PM", "wake_t": "07:15 AM", "sleep_d": 7.50, "ex": True, "ex_t": "Yoga", "ex_d": 30, "walk": True, "walk_d": 30, "steps": 6800, "smoke": False, "smoke_f": 0, "alc": False, "alc_f": 0},
        {"sleep_t": "12:00 AM", "wake_t": "08:00 AM", "sleep_d": 8.00, "ex": True, "ex_t": "Outdoor Run", "ex_d": 45, "walk": True, "walk_d": 50, "steps": 8900, "smoke": False, "smoke_f": 0, "alc": False, "alc_f": 0},
        {"sleep_t": "11:15 PM", "wake_t": "06:45 AM", "sleep_d": 7.50, "ex": False, "ex_t": "", "ex_d": 0, "walk": True, "walk_d": 35, "steps": 6500, "smoke": False, "smoke_f": 0, "alc": False, "alc_f": 0},

        # --- WEEK 2: Work Deadlines, Slightly Deconditioned (Days 8 to 14) ---
        {"sleep_t": "12:30 AM", "wake_t": "06:30 AM", "sleep_d": 6.00, "ex": False, "ex_t": "", "ex_d": 0, "walk": True, "walk_d": 25, "steps": 5100, "smoke": True, "smoke_f": 2, "alc": False, "alc_f": 0},
        {"sleep_t": "01:00 AM", "wake_t": "06:45 AM", "sleep_d": 5.75, "ex": False, "ex_d": 0, "walk": True, "walk_d": 20, "steps": 4600, "smoke": True, "smoke_f": 3, "alc": False, "alc_f": 0},
        {"sleep_t": "12:45 AM", "wake_t": "07:00 AM", "sleep_d": 6.25, "ex": True, "ex_t": "Quick Walk", "ex_d": 20, "walk": True, "walk_d": 25, "steps": 5300, "smoke": True, "smoke_f": 1, "alc": False, "alc_f": 0},
        {"sleep_t": "01:15 AM", "wake_t": "06:30 AM", "sleep_d": 5.25, "ex": False, "ex_d": 0, "walk": False, "walk_d": 15, "steps": 4100, "smoke": True, "smoke_f": 2, "alc": True, "alc_f": 1},
        {"sleep_t": "12:30 AM", "wake_t": "06:45 AM", "sleep_d": 6.25, "ex": False, "ex_d": 0, "walk": True, "walk_d": 25, "steps": 4800, "smoke": True, "smoke_f": 2, "alc": False, "alc_f": 0},
        {"sleep_t": "01:30 AM", "wake_t": "08:15 AM", "sleep_d": 6.75, "ex": True, "ex_t": "Gym", "ex_d": 30, "walk": True, "walk_d": 30, "steps": 5800, "smoke": True, "smoke_f": 1, "alc": True, "alc_f": 1},
        {"sleep_t": "12:15 AM", "wake_t": "06:45 AM", "sleep_d": 6.50, "ex": False, "ex_d": 0, "walk": True, "walk_d": 25, "steps": 4900, "smoke": True, "smoke_f": 1, "alc": False, "alc_f": 0},
    ]

    meal_presets = [
        ("breakfast", "2 Idli, sambar and coconut chutney", "08:30 AM"),
        ("lunch", "Brown rice, dal tadka, curd and mixed vegetable poriyal", "01:15 PM"),
        ("snack", "Green tea, roasted almonds and walnuts", "05:00 PM"),
        ("dinner", "2 Multigrain phulkas with paneer sabzi and fresh salad", "08:45 PM"),
    ]

    records_created = 0
    for idx, tmpl in enumerate(day_templates):
        record_date = today - timedelta(days=(13 - idx))
        
        record = DailyHealthRecord(
            user_id=user_id,
            date=record_date,
            sleep_time=tmpl["sleep_t"],
            wake_time=tmpl["wake_t"],
            sleep_duration=tmpl["sleep_d"],
            exercise=tmpl["ex"],
            exercise_type=tmpl.get("ex_t"),
            exercise_duration=tmpl["ex_d"],
            walking=tmpl["walk"],
            walking_duration=tmpl["walk_d"],
            steps=tmpl["steps"],
            smoking=tmpl["smoke"],
            smoking_frequency=tmpl["smoke_f"],
            alcohol=tmpl["alc"],
            alcohol_frequency=tmpl["alc_f"]
        )
        db.add(record)
        
        # Add 4 daily meals
        for m_type, desc, m_time in meal_presets:
            meal = Meal(
                user_id=user_id,
                date=record_date,
                meal_type=m_type,
                food_description=desc,
                meal_time=m_time
            )
            db.add(meal)

        records_created += 1

    db.commit()
    return records_created
