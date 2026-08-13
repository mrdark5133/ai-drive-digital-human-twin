from typing import Dict, Any, Tuple
from app.schemas.digital_twin import OrganStatus, HealthScoreBreakdown

class HealthScoreEngine:
    """
    Transparent physiological sub-score and overall health score calculation.
    """

    def compute_scores(self, features: Dict[str, Any]) -> Tuple[HealthScoreBreakdown, Dict[str, OrganStatus]]:
        # 1. Sleep Score (0 - 100)
        avg_sleep = features.get("avg_sleep_hours", 7.5)
        sleep_std = features.get("sleep_consistency_std", 0.4)
        sleep_score = 90.0
        # Optimal is 7.5 - 8.5
        if avg_sleep < 7.0:
            sleep_score -= (7.0 - avg_sleep) * 20.0
        elif avg_sleep > 9.0:
            sleep_score -= (avg_sleep - 9.0) * 10.0
        if sleep_std > 0.8:
            sleep_score -= (sleep_std - 0.8) * 15.0
        sleep_score = max(35.0, min(99.0, round(sleep_score, 1)))

        # 2. Fitness Score (0 - 100)
        avg_steps = features.get("avg_steps", 6000)
        active_ratio = features.get("active_days_ratio", 0.5)
        avg_ex = features.get("avg_exercise_mins", 30)
        
        step_score = min(100.0, (avg_steps / 8500.0) * 80.0)
        ex_score = min(100.0, (active_ratio * 50.0) + (min(avg_ex, 60.0) / 60.0 * 50.0))
        fitness_score = round((step_score * 0.5) + (ex_score * 0.5), 1)
        fitness_score = max(35.0, min(98.0, fitness_score))

        # 3. Respiratory Score (0 - 100)
        smoking = features.get("daily_smoking_avg", 0)
        resp_score = 95.0
        if smoking > 0:
            resp_score -= min(50.0, 15.0 + (smoking * 5.0))
        if avg_ex < 15:
            resp_score -= 5.0
        resp_score = max(30.0, min(98.0, round(resp_score, 1)))

        # 4. Heart Score (0 - 100)
        heart_score = 94.0
        if avg_steps < 5000:
            heart_score -= 10.0
        if smoking > 0:
            heart_score -= min(25.0, 8.0 + (smoking * 3.0))
        if features.get("bmi", 22) >= 28:
            heart_score -= 8.0
        if features.get("sleep_debt_hours", 0) > 1.0:
            heart_score -= 5.0
        heart_score = max(40.0, min(98.0, round(heart_score, 1)))

        # 5. Mental / Neuro-Cognitive Score (0 - 100)
        # Driven by sleep restoration, routine regularity, exercise endorphins
        mental_score = 85.0
        if avg_sleep < 6.5:
            mental_score -= 14.0
        if sleep_std > 1.0:
            mental_score -= 8.0
        if fitness_score > 75:
            mental_score += 5.0
        if features.get("daily_alcohol_avg", 0) > 1:
            mental_score -= 10.0
        mental_score = max(35.0, min(97.0, round(mental_score, 1)))

        # Composite Overall Score (weighted average)
        overall = (
            (heart_score * 0.25) +
            (resp_score * 0.18) +
            (sleep_score * 0.22) +
            (fitness_score * 0.20) +
            (mental_score * 0.15)
        )
        overall_score = round(max(30.0, min(99.0, overall)), 1)

        breakdown = HealthScoreBreakdown(
            overall_score=overall_score,
            heart=heart_score,
            respiratory=resp_score,
            mental=mental_score,
            sleep=sleep_score,
            fitness=fitness_score
        )

        # Build detailed Organ status cards for 3D body viewer
        organs = self._build_organ_statuses(breakdown, features)
        return breakdown, organs

    def _build_organ_statuses(self, b: HealthScoreBreakdown, f: Dict[str, Any]) -> Dict[str, OrganStatus]:
        return {
            "heart": OrganStatus(
                name="Heart & Cardiovascular",
                score=b.heart,
                status="optimal" if b.heart >= 88 else ("good" if b.heart >= 75 else "attention"),
                color="#EF4444",
                ai_risk_indicator="Low" if b.heart >= 85 else ("Moderate" if b.heart >= 70 else "Elevated"),
                summary="Cardiovascular capacity and vascular health indicators based on daily activity, habits, and rest.",
                contributing_factors=[
                    f"Daily Average Steps: {int(f.get('avg_steps', 0)):,}",
                    f"Aerobic Exercise Ratio: {int(f.get('active_days_ratio', 0)*100)}%",
                    f"Recorded Smoking Load: {f.get('daily_smoking_avg', 0)}/day"
                ],
                recommendations=[
                    "Aim for 7,500+ daily steps to stimulate coronary blood flow",
                    "Maintain steady hydration to support blood viscosity"
                ]
            ),
            "respiratory": OrganStatus(
                name="Lungs & Respiratory",
                score=b.respiratory,
                status="optimal" if b.respiratory >= 88 else ("good" if b.respiratory >= 75 else "attention"),
                color="#06B6D4",
                ai_risk_indicator="Low" if b.respiratory >= 85 else ("Moderate" if b.respiratory >= 70 else "Elevated"),
                summary="Pulmonary efficiency and oxygenation resilience.",
                contributing_factors=[
                    f"Smoking Frequency: {f.get('daily_smoking_avg', 0)} times/day",
                    f"Cardio Duration: {f.get('avg_exercise_mins', 0)} mins/session"
                ],
                recommendations=[
                    "Practice deep diaphragm breathing exercises for 5 mins daily",
                    "Limit exposure to smoke and particulate air pollution"
                ]
            ),
            "brain": OrganStatus(
                name="Brain & Cognitive Wellbeing",
                score=b.mental,
                status="optimal" if b.mental >= 85 else ("good" if b.mental >= 72 else "attention"),
                color="#8B5CF6",
                ai_risk_indicator="Low" if b.mental >= 80 else ("Moderate" if b.mental >= 68 else "Elevated"),
                summary="Cognitive restoration, stress resilience, and circadian balance.",
                contributing_factors=[
                    f"Sleep Restorative Duration: {f.get('avg_sleep_hours', 0)} hrs",
                    f"Circadian Regularity Score: {f.get('meal_time_regularity_score', 0)}/100"
                ],
                recommendations=[
                    "Maintain a consistent wind-down routine 45 mins before bedtime",
                    "Reduce screen exposure in the final hour before sleep"
                ]
            ),
            "digestive": OrganStatus(
                name="Metabolic & Digestive",
                score=round((b.overall_score + b.fitness) / 2.0, 1),
                status="optimal" if b.overall_score >= 82 else "good",
                color="#F59E0B",
                ai_risk_indicator="Low" if f.get("late_night_meal_ratio", 0) < 0.2 else "Moderate",
                summary="Circadian digestive rhythm, nutrient timing, and metabolic energy efficiency.",
                contributing_factors=[
                    f"Late Night Meals Ratio: {int(f.get('late_night_meal_ratio', 0)*100)}%",
                    f"Meal Timing Consistency: {f.get('meal_time_regularity_score', 0)}%"
                ],
                recommendations=[
                    "Avoid heavy meals within 2.5 hours of bedtime",
                    "Space meals 4 to 5 hours apart for optimal glucose management"
                ]
            ),
            "sleep": OrganStatus(
                name="Sleep & Circadian Clock",
                score=b.sleep,
                status="optimal" if b.sleep >= 85 else ("good" if b.sleep >= 70 else "attention"),
                color="#6366F1",
                ai_risk_indicator="Low" if b.sleep >= 80 else ("Moderate" if b.sleep >= 65 else "Elevated"),
                summary="Restorative sleep cycles, sleep debt index, and schedule consistency.",
                contributing_factors=[
                    f"Average Sleep: {f.get('avg_sleep_hours', 0)} hours",
                    f"Calculated Sleep Debt: {f.get('sleep_debt_hours', 0)} hours",
                    f"Bedtime Variability: ±{int(f.get('sleep_consistency_std', 0)*60)} mins"
                ],
                recommendations=[
                    "Target 7 to 8.5 hours of uninterrupted rest nightly",
                    "Keep bedroom temperature cool and dark"
                ]
            ),
            "fitness": OrganStatus(
                name="Musculoskeletal & Fitness",
                score=b.fitness,
                status="optimal" if b.fitness >= 85 else ("good" if b.fitness >= 70 else "attention"),
                color="#10B981",
                ai_risk_indicator="Low" if b.fitness >= 80 else ("Moderate" if b.fitness >= 65 else "Elevated"),
                summary="Physical conditioning, muscular endurance, and active mobility.",
                contributing_factors=[
                    f"Average Steps: {int(f.get('avg_steps', 0)):,}",
                    f"Weekly Workout Cadence: {int(f.get('active_days_ratio', 0)*7)} days/week"
                ],
                recommendations=[
                    "Incorporate resistance or brisk interval walking 3-4 days/week",
                    "Take brief 2-minute standing breaks every hour during work"
                ]
            )
        }

health_score_engine = HealthScoreEngine()
