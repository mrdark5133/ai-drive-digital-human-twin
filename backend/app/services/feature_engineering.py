from typing import List, Dict, Any, Optional
import numpy as np
from datetime import date, timedelta
from app.models.health_record import DailyHealthRecord
from app.models.meal import Meal
from app.models.profile import UserProfile

def parse_time_to_minutes(time_str: Optional[str]) -> Optional[int]:
    """Parse time strings like '11:30 PM' or '8:30 AM' to minutes from midnight."""
    if not time_str:
        return None
    try:
        cleaned = time_str.strip().upper()
        # Parse 12h format
        parts = cleaned.split()
        if len(parts) == 2:
            time_part, meridian = parts
            h, m = map(int, time_part.split(":"))
            if meridian == "PM" and h != 12:
                h += 12
            elif meridian == "AM" and h == 12:
                h = 0
            return h * 60 + m
        elif len(parts) == 1 and ":" in parts[0]:
            h, m = map(int, parts[0].split(":"))
            return h * 60 + m
    except Exception:
        return None
    return None

def calculate_sleep_duration_from_times(sleep_time: Optional[str], wake_time: Optional[str]) -> Optional[float]:
    """Calculate sleep duration in hours from 12-hour or 24-hour time strings."""
    t1 = parse_time_to_minutes(sleep_time)
    t2 = parse_time_to_minutes(wake_time)
    if t1 is None or t2 is None:
        return None
    
    if t2 >= t1:
        diff_minutes = t2 - t1
    else:
        # Crosses midnight (e.g. 11:30 PM to 6:30 AM)
        diff_minutes = (1440 - t1) + t2
    return round(diff_minutes / 60.0, 1)

def extract_features(
    records: List[DailyHealthRecord],
    profile: Optional[UserProfile] = None,
    meals: Optional[List[Meal]] = None
) -> Dict[str, Any]:
    """
    Extract aggregated statistical and physiological features from historical data.
    """
    if not records:
        # Default baseline features if new user
        bmi = profile.bmi if profile else 22.5
        age = profile.age if profile else 28
        return {
            "days_count": 0,
            "avg_sleep_hours": 7.5,
            "sleep_consistency_std": 0.5,
            "sleep_debt_hours": 0.0,
            "avg_steps": 6500,
            "active_days_ratio": 0.5,
            "avg_exercise_mins": 30.0,
            "daily_smoking_avg": 0.0,
            "daily_alcohol_avg": 0.0,
            "bmi": bmi,
            "age": age,
            "late_night_meal_ratio": 0.1,
            "meal_time_regularity_score": 85.0
        }

    days_count = len(records)
    
    # 1. Sleep Features
    sleep_durations = [r.sleep_duration for r in records if r.sleep_duration is not None and r.sleep_duration > 0]
    if not sleep_durations:
        sleep_durations = [7.0]
    
    avg_sleep = float(np.mean(sleep_durations))
    sleep_std = float(np.std(sleep_durations)) if len(sleep_durations) > 1 else 0.4
    # Ideal sleep is 7.0 - 8.5 hours
    sleep_debt = max(0.0, 7.5 - avg_sleep) if avg_sleep < 7.0 else 0.0

    # 2. Activity Features
    steps_list = [r.steps for r in records if r.steps is not None]
    avg_steps = float(np.mean(steps_list)) if steps_list else 5000.0
    
    exercise_days = sum(1 for r in records if r.exercise or (r.exercise_duration and r.exercise_duration > 0))
    active_days_ratio = exercise_days / float(days_count) if days_count > 0 else 0.0
    
    exercise_durations = [r.exercise_duration for r in records if r.exercise_duration is not None]
    avg_exercise_mins = float(np.mean(exercise_durations)) if exercise_durations else 0.0

    # 3. Habits (Smoking & Alcohol)
    smoking_counts = [r.smoking_frequency for r in records if r.smoking and r.smoking_frequency is not None]
    daily_smoking_avg = float(np.mean(smoking_counts)) if smoking_counts else 0.0
    
    alcohol_counts = [r.alcohol_frequency for r in records if r.alcohol and r.alcohol_frequency is not None]
    daily_alcohol_avg = float(np.mean(alcohol_counts)) if alcohol_counts else 0.0

    # 4. Profile features
    bmi = profile.bmi if profile and profile.bmi > 0 else 23.0
    age = profile.age if profile else 30

    # 5. Meal Regularity & Late Night Eating
    late_night_count = 0
    total_meals = 0
    meal_times_mins = []

    if meals:
        for m in meals:
            total_meals += 1
            t_min = parse_time_to_minutes(m.meal_time)
            if t_min is not None:
                meal_times_mins.append(t_min)
                # After 9:30 PM (1350 mins)
                if t_min >= 1290 or t_min <= 300:
                    late_night_count += 1
    
    late_night_meal_ratio = (late_night_count / float(total_meals)) if total_meals > 0 else 0.1
    meal_time_std = float(np.std(meal_times_mins)) if len(meal_times_mins) > 2 else 45.0
    # Regularity score (higher is better, out of 100)
    meal_time_regularity_score = max(40.0, min(100.0, 100.0 - (meal_time_std / 2.0)))

    return {
        "days_count": days_count,
        "avg_sleep_hours": round(avg_sleep, 2),
        "sleep_consistency_std": round(sleep_std, 2),
        "sleep_debt_hours": round(sleep_debt, 2),
        "avg_steps": round(avg_steps, 0),
        "active_days_ratio": round(active_days_ratio, 2),
        "avg_exercise_mins": round(avg_exercise_mins, 1),
        "daily_smoking_avg": round(daily_smoking_avg, 1),
        "daily_alcohol_avg": round(daily_alcohol_avg, 1),
        "bmi": round(bmi, 1),
        "age": age,
        "late_night_meal_ratio": round(late_night_meal_ratio, 2),
        "meal_time_regularity_score": round(meal_time_regularity_score, 1)
    }
