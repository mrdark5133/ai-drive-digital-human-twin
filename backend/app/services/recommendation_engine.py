from typing import List, Dict, Any, Optional
from app.schemas.analytics import RecommendationItem

class RecommendationEngine:
    """
    Generates data-driven, personalized lifestyle recommendations (Do & Avoid)
    based on physiological features and detected risk factors.
    """

    def generate_recommendations(self, features: Dict[str, Any]) -> List[RecommendationItem]:
        items: List[RecommendationItem] = []
        rec_id = 1

        avg_sleep = features.get("avg_sleep_hours", 7.5)
        sleep_debt = features.get("sleep_debt_hours", 0.0)
        avg_steps = features.get("avg_steps", 6000)
        exercise_days = features.get("active_days_ratio", 0.5) * 7.0
        smoking = features.get("daily_smoking_avg", 0.0)
        alcohol = features.get("daily_alcohol_avg", 0.0)
        late_meals = features.get("late_night_meal_ratio", 0.0)
        bmi = features.get("bmi", 22.0)

        # -----------------------------
        # 1. WHAT YOU CAN DO (Type: DO)
        # -----------------------------
        
        # Sleep Recommendation
        if sleep_debt > 0.5 or avg_sleep < 6.8:
            items.append(RecommendationItem(
                id=rec_id,
                type="do",
                category="Sleep & Circadian",
                icon="moon",
                title="Restore Consistent Sleep Window",
                recommendation=f"Your average sleep is {avg_sleep}h. Prioritize a 7.5h restorative window tonight by initiating a screen-free wind down 45 minutes before bedtime.",
                priority="high"
            ))
            rec_id += 1
        else:
            items.append(RecommendationItem(
                id=rec_id,
                type="do",
                category="Sleep & Circadian",
                icon="sparkles",
                title="Maintain Optimal Sleep Routine",
                recommendation="Your sleep duration is in a healthy range. Continue anchoring your bedtime and wake-up times within ±30 minutes to preserve circadian rhythm.",
                priority="medium"
            ))
            rec_id += 1

        # Activity Recommendation
        if avg_steps < 6000:
            target_steps = int(min(8000, avg_steps + 1500))
            items.append(RecommendationItem(
                id=rec_id,
                type="do",
                category="Physical Movement",
                icon="footprints",
                title="Gradually Increase Daily Walking",
                recommendation=f"Your current daily average is {int(avg_steps):,} steps. Incorporate a brisk 15-minute post-lunch or evening walk to reach {target_steps:,} steps today.",
                priority="high" if avg_steps < 4000 else "medium"
            ))
            rec_id += 1
        else:
            items.append(RecommendationItem(
                id=rec_id,
                type="do",
                category="Physical Movement",
                icon="activity",
                title="Sustain Cardiovascular Movement",
                recommendation=f"Great job maintaining {int(avg_steps):,} steps/day. Add 20 minutes of moderate aerobic or bodyweight exercise to further condition your heart.",
                priority="medium"
            ))
            rec_id += 1

        # Nutrition / Meal Timing
        if late_meals > 0.2:
            items.append(RecommendationItem(
                id=rec_id,
                type="do",
                category="Nutrition & Metabolism",
                icon="utensils",
                title="Align Evening Meal Timings",
                recommendation="Aim to conclude dinner at least 2.5 to 3 hours before sleep. This prevents nighttime glycemic spikes and supports deep REM recovery.",
                priority="high"
            ))
            rec_id += 1
        else:
            items.append(RecommendationItem(
                id=rec_id,
                type="do",
                category="Nutrition & Metabolism",
                icon="salad",
                title="Optimize Whole Food & Hydration Intake",
                recommendation="Prioritize fiber-rich vegetables, lean proteins, and drink 2.5 to 3 liters of water throughout the day to support cellular metabolism.",
                priority="low"
            ))
            rec_id += 1

        # Periodic checkups
        items.append(RecommendationItem(
            id=rec_id,
            type="do",
            category="Preventive Care",
            icon="heart-pulse",
            title="Periodic Preventative Health Checkups",
            recommendation="Consider scheduling regular blood pressure, lipid profile, and fasting glucose screenings with your physician for longitudinal health tracking.",
            priority="low"
        ))
        rec_id += 1

        # ----------------------------------------
        # 2. THINGS TO REDUCE / AVOID (Type: AVOID)
        # ----------------------------------------

        # Smoking
        if smoking > 0:
            items.append(RecommendationItem(
                id=rec_id,
                type="avoid",
                category="Cardiopulmonary Strain",
                icon="cigarette-off",
                title="Reduce Daily Smoking Frequency",
                recommendation=f"Recorded smoking load is {smoking} times/day. Each reduction significantly relieves pulmonary oxidative stress and lowers arterial stiffness.",
                priority="high"
            ))
            rec_id += 1

        # Alcohol
        if alcohol > 0:
            items.append(RecommendationItem(
                id=rec_id,
                type="avoid",
                category="Hepatic & Sleep Disruption",
                icon="wine-off",
                title="Limit Evening Alcohol Intake",
                recommendation="Alcohol disrupts REM sleep architecture and elevates resting heart rate throughout the night. Avoid drinking within 4 hours of sleeping.",
                priority="high" if alcohol > 1 else "medium"
            ))
            rec_id += 1

        # Sedentary / Sitting
        if exercise_days < 2.0 or avg_steps < 5000:
            items.append(RecommendationItem(
                id=rec_id,
                type="avoid",
                category="Sedentary Risk",
                icon="sofa",
                title="Avoid Prolonged Continuous Inactivity",
                recommendation="Break up prolonged sitting sessions (> 60 minutes) with 2 minutes of active stretching or pacing to maintain microvascular blood circulation.",
                priority="medium"
            ))
            rec_id += 1

        # Irregular sleep
        if features.get("sleep_consistency_std", 0) > 0.8:
            items.append(RecommendationItem(
                id=rec_id,
                type="avoid",
                category="Circadian Disruption",
                icon="clock-alert",
                title="Avoid Drastic Bedtime Fluctuations",
                recommendation="Shifting bedtime by more than 90 minutes between weekdays and weekends induces social jetlag and elevates metabolic stress.",
                priority="medium"
            ))
            rec_id += 1

        return items

recommendation_engine = RecommendationEngine()
