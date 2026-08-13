from typing import List, Optional
from datetime import date, timedelta
from app.models.health_record import DailyHealthRecord
from app.models.profile import UserProfile
from app.schemas.analytics import WeekOverWeekAnalysis, WeekOverWeekMetric
from app.services.feature_engineering import extract_features
from app.services.health_score_engine import health_score_engine

class ContextAnalyticsEngine:
    """
    Analyzes multi-factor week-over-week health and lifestyle dynamics.
    Synthesizes holistic cross-factor context explanations.
    """

    def analyze_week_over_week(
        self,
        records: List[DailyHealthRecord],
        profile: Optional[UserProfile] = None
    ) -> WeekOverWeekAnalysis:
        if len(records) < 2:
            return WeekOverWeekAnalysis(
                is_available=False,
                message="Your Digital Twin is currently learning from your daily health patterns. Continue entering your daily information to unlock personalized week-over-week comparative insights.",
                metrics=[],
                ai_context_explanation="Not enough historical data for a week-over-week comparison yet. At least 2-7 days of daily records will activate deep comparative analytics.",
                overall_health_score_change=0.0
            )

        # Sort records chronologically
        sorted_records = sorted(records, key=lambda r: r.date)
        
        # Split into two periods: current week (last up to 7 records) vs previous week (prior up to 7 records)
        n = len(sorted_records)
        if n >= 14:
            current_week_records = sorted_records[-7:]
            prev_week_records = sorted_records[-14:-7]
        elif n >= 7:
            current_week_records = sorted_records[-(n // 2):]
            prev_week_records = sorted_records[:-(n // 2)]
        else:
            mid = n // 2
            current_week_records = sorted_records[mid:]
            prev_week_records = sorted_records[:mid]

        feat_curr = extract_features(current_week_records, profile)
        feat_prev = extract_features(prev_week_records, profile)

        score_curr, _ = health_score_engine.compute_scores(feat_curr)
        score_prev, _ = health_score_engine.compute_scores(feat_prev)

        metrics: List[WeekOverWeekMetric] = []

        # 1. Sleep Duration
        curr_sleep = feat_curr.get("avg_sleep_hours", 7.0)
        prev_sleep = feat_prev.get("avg_sleep_hours", 7.0)
        diff_sleep = round(curr_sleep - prev_sleep, 1)
        metrics.append(WeekOverWeekMetric(
            metric_name="Sleep Duration",
            unit="hrs/night",
            previous_week=prev_sleep,
            current_week=curr_sleep,
            change_value=abs(diff_sleep),
            change_direction="up" if diff_sleep > 0.1 else ("down" if diff_sleep < -0.1 else "stable"),
            is_positive_trend=diff_sleep >= -0.1
        ))

        # 2. Exercise Days
        curr_ex_days = sum(1 for r in current_week_records if r.exercise or (r.exercise_duration and r.exercise_duration > 0))
        prev_ex_days = sum(1 for r in prev_week_records if r.exercise or (r.exercise_duration and r.exercise_duration > 0))
        diff_ex = curr_ex_days - prev_ex_days
        metrics.append(WeekOverWeekMetric(
            metric_name="Exercise Frequency",
            unit="days",
            previous_week=float(prev_ex_days),
            current_week=float(curr_ex_days),
            change_value=float(abs(diff_ex)),
            change_direction="up" if diff_ex > 0 else ("down" if diff_ex < 0 else "stable"),
            is_positive_trend=diff_ex >= 0
        ))

        # 3. Walking Steps
        curr_steps = feat_curr.get("avg_steps", 5000)
        prev_steps = feat_prev.get("avg_steps", 5000)
        diff_steps = round(curr_steps - prev_steps, 0)
        metrics.append(WeekOverWeekMetric(
            metric_name="Daily Walking Steps",
            unit="steps",
            previous_week=prev_steps,
            current_week=curr_steps,
            change_value=abs(diff_steps),
            change_direction="up" if diff_steps > 150 else ("down" if diff_steps < -150 else "stable"),
            is_positive_trend=diff_steps >= -150
        ))

        # 4. Smoking Frequency
        curr_smoking = sum(r.smoking_frequency or 0 for r in current_week_records if r.smoking)
        prev_smoking = sum(r.smoking_frequency or 0 for r in prev_week_records if r.smoking)
        diff_smoking = curr_smoking - prev_smoking
        metrics.append(WeekOverWeekMetric(
            metric_name="Smoking Occurrences",
            unit="times/week",
            previous_week=float(prev_smoking),
            current_week=float(curr_smoking),
            change_value=float(abs(diff_smoking)),
            change_direction="up" if diff_smoking > 0 else ("down" if diff_smoking < 0 else "stable"),
            is_positive_trend=diff_smoking <= 0
        ))

        # 5. Overall Health Score
        score_diff = round(score_curr.overall_score - score_prev.overall_score, 1)
        metrics.append(WeekOverWeekMetric(
            metric_name="Health Score",
            unit="points",
            previous_week=score_prev.overall_score,
            current_week=score_curr.overall_score,
            change_value=abs(score_diff),
            change_direction="up" if score_diff > 0.5 else ("down" if score_diff < -0.5 else "stable"),
            is_positive_trend=score_diff >= 0
        ))

        # Generate Contextual AI Explanation of Cross-Factor Relationships
        ai_explanation = self._generate_context_narrative(
            diff_sleep=diff_sleep,
            diff_ex=diff_ex,
            diff_steps=diff_steps,
            diff_smoking=diff_smoking,
            score_diff=score_diff,
            curr_sleep=curr_sleep,
            curr_steps=curr_steps
        )

        return WeekOverWeekAnalysis(
            is_available=True,
            message="Comparative analysis complete across previous and current observation windows.",
            metrics=metrics,
            ai_context_explanation=ai_explanation,
            overall_health_score_change=score_diff
        )

    def _generate_context_narrative(
        self,
        diff_sleep: float,
        diff_ex: int,
        diff_steps: float,
        diff_smoking: int,
        score_diff: float,
        curr_sleep: float,
        curr_steps: float
    ) -> str:
        observations = []
        
        # Sleep changes
        if diff_sleep <= -0.5:
            mins = int(abs(diff_sleep) * 60)
            observations.append(f"your average sleep decreased by {mins} minutes")
        elif diff_sleep >= 0.5:
            mins = int(diff_sleep * 60)
            observations.append(f"your sleep duration improved by {mins} minutes")

        # Activity changes
        if diff_steps < -500 or diff_ex < 0:
            observations.append("your physical activity and step volume reduced")
        elif diff_steps > 500 or diff_ex > 0:
            observations.append("your daily physical activity and workout frequency increased")

        # Smoking changes
        if diff_smoking > 0:
            observations.append(f"your smoking frequency increased by {diff_smoking} times")
        elif diff_smoking < 0:
            observations.append(f"your smoking frequency decreased by {abs(diff_smoking)} times")

        if not observations:
            return "Your lifestyle and health parameters remained highly consistent between the two observation periods, maintaining steady physiological equilibrium."

        joined_obs = ", while ".join(observations[:2])
        if len(observations) > 2:
            joined_obs += f", and {observations[2]}"

        if score_diff < -1.0:
            return f"Based on your recent lifestyle dynamics, {joined_obs}. These combined physiological factors may be contributing to the {abs(score_diff)} point decrease in your overall health score."
        elif score_diff > 1.0:
            return f"Great progress! {joined_obs.capitalize()}. These combined positive habits are supporting the {score_diff} point improvement in your Digital Twin health score."
        else:
            return f"Over the recent period, {joined_obs}. Your overall health score remained relatively stable with minor shifts across organ sub-metrics."

context_analytics_engine = ContextAnalyticsEngine()
