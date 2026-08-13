export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';

export interface UserProfile {
  id?: number;
  user_id?: number;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  place: string;
  bmi: number;
  updated_at?: string;
}

export interface MealItem {
  id?: number;
  user_id?: number;
  date?: string;
  meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  food_description: string;
  meal_time: string;
}

export interface DailyHealthRecord {
  id?: number;
  user_id?: number;
  date: string;
  sleep_time?: string;
  wake_time?: string;
  sleep_duration?: number;
  exercise: boolean;
  exercise_type?: string;
  exercise_duration: number;
  walking: boolean;
  walking_duration: number;
  steps: number;
  smoking: boolean;
  smoking_frequency: number;
  alcohol: boolean;
  alcohol_frequency: number;
  meals?: MealItem[];
}

export interface HealthScoreBreakdown {
  overall_score: number;
  heart: number;
  respiratory: number;
  mental: number;
  sleep: number;
  fitness: number;
}

export interface OrganStatus {
  name: string;
  score: number;
  status: 'optimal' | 'good' | 'attention' | 'warning';
  color: string;
  ai_risk_indicator: 'Low' | 'Moderate' | 'Elevated';
  summary: string;
  contributing_factors: string[];
  recommendations: string[];
}

export interface DigitalTwinState {
  user_id: number;
  profile: UserProfile | null;
  days_tracked: number;
  health_score: HealthScoreBreakdown;
  organs: Record<string, OrganStatus>;
  last_updated: string | null;
  has_sufficient_data: boolean;
  status_summary: string;
}

export interface RiskIndicator {
  category: string;
  risk_level: 'Low' | 'Moderate' | 'Elevated';
  score: number;
  color: string;
  explanation: string;
  key_drivers: string[];
}

export interface WeekOverWeekMetric {
  metric_name: string;
  unit: string;
  previous_week: number;
  current_week: number;
  change_value: number;
  change_direction: 'up' | 'down' | 'stable';
  is_positive_trend: boolean;
}

export interface WeekOverWeekAnalysis {
  is_available: boolean;
  message: string;
  metrics: WeekOverWeekMetric[];
  ai_context_explanation: string;
  overall_health_score_change: number;
}

export interface TrendDataPoint {
  date: string;
  heart_rate_est?: number;
  sleep_hours?: number;
  weight?: number;
  steps?: number;
  health_score?: number;
  risk_score?: number;
}

export interface HealthTrendsResponse {
  timeframe: string;
  data_points: TrendDataPoint[];
}

export interface RecommendationItem {
  id: number;
  type: 'do' | 'avoid';
  category: string;
  icon: string;
  title: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MealTimingAlert {
  needs_alert: boolean;
  meal_type?: string;
  usual_time?: string;
  message?: string;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  facility_type: string;
  specialist_type: string;
  address: string;
  distance_km: number;
  rating: number;
  phone: string;
  matching_reason: string;
}

export interface AuthState {
  token: string | null;
  userId: number | null;
  email: string | null;
  phone: string | null;
  language: SupportedLanguage;
  hasProfile: boolean;
  hasDay1Data: boolean;
  isAuthenticated: boolean;
}
