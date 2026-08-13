from typing import Dict, Any, List
from app.schemas.analytics import RiskIndicator

class AIRiskEngine:
    """
    Predictive Multi-System Risk Estimator.
    NOTE: Transparent risk scoring based on physiological guidelines and machine-learned weights.
    Strictly educational and non-diagnostic.
    """

    def predict_risks(self, features: Dict[str, Any]) -> List[RiskIndicator]:
        indicators: List[RiskIndicator] = []

        # 1. Cardiovascular Risk
        cardio_score = self._compute_cardiovascular_risk(features)
        cardio_level = self._classify_risk_level(cardio_score)
        cardio_drivers, cardio_exp = self._explain_cardio(features, cardio_level, cardio_score)
        indicators.append(RiskIndicator(
            category="Cardiovascular",
            risk_level=cardio_level,
            score=round(cardio_score, 2),
            color=self._get_risk_color(cardio_level),
            explanation=cardio_exp,
            key_drivers=cardio_drivers
        ))

        # 2. Metabolic Strain
        metabolic_score = self._compute_metabolic_risk(features)
        metabolic_level = self._classify_risk_level(metabolic_score)
        metabolic_drivers, metabolic_exp = self._explain_metabolic(features, metabolic_level, metabolic_score)
        indicators.append(RiskIndicator(
            category="Metabolic",
            risk_level=metabolic_level,
            score=round(metabolic_score, 2),
            color=self._get_risk_color(metabolic_level),
            explanation=metabolic_exp,
            key_drivers=metabolic_drivers
        ))

        # 3. Respiratory Stress
        resp_score = self._compute_respiratory_risk(features)
        resp_level = self._classify_risk_level(resp_score)
        resp_drivers, resp_exp = self._explain_respiratory(features, resp_level, resp_score)
        indicators.append(RiskIndicator(
            category="Respiratory",
            risk_level=resp_level,
            score=round(resp_score, 2),
            color=self._get_risk_color(resp_level),
            explanation=resp_exp,
            key_drivers=resp_drivers
        ))

        # 4. Lifestyle & Sleep Strain
        lifestyle_score = self._compute_lifestyle_risk(features)
        lifestyle_level = self._classify_risk_level(lifestyle_score)
        lifestyle_drivers, lifestyle_exp = self._explain_lifestyle(features, lifestyle_level, lifestyle_score)
        indicators.append(RiskIndicator(
            category="Lifestyle",
            risk_level=lifestyle_level,
            score=round(lifestyle_score, 2),
            color=self._get_risk_color(lifestyle_level),
            explanation=lifestyle_exp,
            key_drivers=lifestyle_drivers
        ))

        return indicators

    def _classify_risk_level(self, score: float) -> str:
        if score < 0.35:
            return "Low"
        elif score < 0.65:
            return "Moderate"
        else:
            return "Elevated"

    def _get_risk_color(self, level: str) -> str:
        if level == "Low":
            return "#10B981"  # Emerald Green
        elif level == "Moderate":
            return "#F59E0B"  # Amber Yellow
        else:
            return "#EF4444"  # Rose Red

    def _compute_cardiovascular_risk(self, f: Dict[str, Any]) -> float:
        score = 0.15  # Baseline
        # Steps impact (< 5000 adds risk, > 8000 reduces risk)
        avg_steps = f.get("avg_steps", 6000)
        if avg_steps < 4000:
            score += 0.22
        elif avg_steps < 6500:
            score += 0.10
        elif avg_steps > 9000:
            score -= 0.08

        # Smoking
        smoking = f.get("daily_smoking_avg", 0)
        if smoking > 0:
            score += min(0.35, 0.12 + (smoking * 0.04))

        # BMI
        bmi = f.get("bmi", 22)
        if bmi >= 30:
            score += 0.20
        elif bmi >= 25:
            score += 0.10
        elif bmi < 18.5:
            score += 0.05

        # Sleep debt
        sleep_debt = f.get("sleep_debt_hours", 0)
        if sleep_debt > 1.5:
            score += 0.12

        return max(0.05, min(0.95, score))

    def _compute_metabolic_risk(self, f: Dict[str, Any]) -> float:
        score = 0.18
        bmi = f.get("bmi", 22)
        if bmi >= 30:
            score += 0.25
        elif bmi >= 25:
            score += 0.14

        # Late night meals & irregular timing
        late_ratio = f.get("late_night_meal_ratio", 0)
        if late_ratio > 0.3:
            score += 0.18
        elif late_ratio > 0.1:
            score += 0.08

        reg_score = f.get("meal_time_regularity_score", 85)
        if reg_score < 60:
            score += 0.15
        elif reg_score < 75:
            score += 0.08

        # Physical activity
        active_ratio = f.get("active_days_ratio", 0.5)
        if active_ratio < 0.3:
            score += 0.15
        elif active_ratio > 0.6:
            score -= 0.08

        return max(0.05, min(0.95, score))

    def _compute_respiratory_risk(self, f: Dict[str, Any]) -> float:
        score = 0.12
        smoking = f.get("daily_smoking_avg", 0)
        if smoking > 5:
            score += 0.55
        elif smoking > 0:
            score += 0.30

        # Exercise helps respiratory resilience
        avg_ex = f.get("avg_exercise_mins", 0)
        if avg_ex < 15:
            score += 0.10
        elif avg_ex > 35:
            score -= 0.08

        return max(0.05, min(0.95, score))

    def _compute_lifestyle_risk(self, f: Dict[str, Any]) -> float:
        score = 0.15
        sleep = f.get("avg_sleep_hours", 7.5)
        if sleep < 6.0:
            score += 0.28
        elif sleep < 7.0:
            score += 0.14
        
        sleep_std = f.get("sleep_consistency_std", 0.5)
        if sleep_std > 1.2:
            score += 0.12

        alcohol = f.get("daily_alcohol_avg", 0)
        if alcohol > 2:
            score += 0.25
        elif alcohol > 0:
            score += 0.10

        steps = f.get("avg_steps", 6000)
        if steps < 4000:
            score += 0.15

        return max(0.05, min(0.95, score))

    def _explain_cardio(self, f: Dict[str, Any], level: str, score: float) -> tuple[List[str], str]:
        drivers = []
        if f.get("avg_steps", 0) < 5000:
            drivers.append("Daily step volume below aerobic conditioning threshold")
        if f.get("daily_smoking_avg", 0) > 0:
            drivers.append(f"Recorded smoking frequency ({f.get('daily_smoking_avg')} times/day)")
        if f.get("bmi", 0) >= 25:
            drivers.append(f"Elevated BMI indicator ({f.get('bmi')})")
        if f.get("sleep_debt_hours", 0) > 1.0:
            drivers.append(f"Sleep recovery deficit of {f.get('sleep_debt_hours')}h")

        if not drivers:
            drivers = ["Consistent physical movement", "Non-smoker status", "Restorative sleep"]
            exp = "Your cardiovascular risk indicator is estimated at a low level, supported by adequate daily activity and healthy lifestyle indicators."
        elif level == "Low":
            exp = "Your cardiovascular baseline appears stable. Sustaining brisk walking and regular sleep will support continued cardiovascular health."
        elif level == "Moderate":
            exp = f"Estimated moderate cardiovascular load detected, primarily influenced by {', '.join(drivers[:2]).lower()}."
        else:
            exp = f"Elevated cardiovascular strain indicators observed due to combined {', '.join(drivers[:3]).lower()}. Consider proactive lifestyle modifications and discussing your routine with a doctor."
        return drivers, exp

    def _explain_metabolic(self, f: Dict[str, Any], level: str, score: float) -> tuple[List[str], str]:
        drivers = []
        if f.get("late_night_meal_ratio", 0) > 0.2:
            drivers.append("Frequent late-evening meal intake (after 9:30 PM)")
        if f.get("meal_time_regularity_score", 100) < 70:
            drivers.append("High variation in daily meal timings")
        if f.get("bmi", 0) >= 25:
            drivers.append(f"BMI ratio ({f.get('bmi')})")
        if f.get("active_days_ratio", 0) < 0.3:
            drivers.append("Low weekly exercise cadence")

        if not drivers:
            drivers = ["Consistent meal windows", "Active metabolic expenditure"]
            exp = "Metabolic indicators show balanced energy expenditure and steady meal rhythm."
        elif level == "Low":
            exp = "Your metabolic profile reflects consistent eating intervals and moderate daily activity."
        elif level == "Moderate":
            exp = f"Metabolic efficiency indicator is moderate, influenced by {', '.join(drivers[:2]).lower()}."
        else:
            exp = f"Notable metabolic strain markers detected. Irregular meal timings combined with {drivers[0].lower()} may impact circadian metabolic efficiency."
        return drivers, exp

    def _explain_respiratory(self, f: Dict[str, Any], level: str, score: float) -> tuple[List[str], str]:
        drivers = []
        smoking = f.get("daily_smoking_avg", 0)
        if smoking > 0:
            drivers.append(f"Active smoking frequency ({smoking} occurrences/day)")
        if f.get("avg_exercise_mins", 0) < 15:
            drivers.append("Minimal aerobic pulmonary stimulus")

        if not drivers:
            drivers = ["Zero smoking recorded", "Regular lung ventilation through exercise"]
            exp = "Respiratory function indicators show healthy pulmonary baseline with no smoking exposure."
        elif level == "Low":
            exp = "Respiratory health parameters are favorable with low environmental and behavioral strain."
        elif level == "Moderate":
            exp = f"Moderate respiratory load noted, associated with {', '.join(drivers).lower()}."
        else:
            exp = f"Elevated respiratory risk indicators identified due to {drivers[0].lower()}. Reducing exposure and consulting a healthcare specialist is advised."
        return drivers, exp

    def _explain_lifestyle(self, f: Dict[str, Any], level: str, score: float) -> tuple[List[str], str]:
        drivers = []
        if f.get("avg_sleep_hours", 0) < 6.5:
            drivers.append(f"Reduced sleep duration ({f.get('avg_sleep_hours')}h/night average)")
        if f.get("sleep_consistency_std", 0) > 1.0:
            drivers.append("Irregular bedtime and wake-up schedule")
        if f.get("daily_alcohol_avg", 0) > 0:
            drivers.append(f"Alcohol intake frequency ({f.get('daily_alcohol_avg')} units/day)")

        if not drivers:
            drivers = ["Optimal sleep duration (7-8h)", "Stable circadian schedule", "Balanced lifestyle"]
            exp = "Lifestyle and restorative sleep patterns are within optimal restorative ranges."
        else:
            exp = f"Lifestyle strain is classified as {level.lower()} based on {', '.join(drivers).lower()}."
        return drivers, exp

ai_risk_engine = AIRiskEngine()
