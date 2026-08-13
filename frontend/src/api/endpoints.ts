import { apiRequest } from './client';
import {
  UserProfile,
  DailyHealthRecord,
  MealItem,
  DigitalTwinState,
  HealthScoreBreakdown,
  RiskIndicator,
  WeekOverWeekAnalysis,
  HealthTrendsResponse,
  RecommendationItem,
  MealTimingAlert,
  HealthcareFacility,
  SupportedLanguage
} from '../types';

export const authApi = {
  signup: (data: { email?: string; phone?: string; password?: string; language?: string }) =>
    apiRequest<any>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email?: string; phone?: string; password?: string }) =>
    apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  socialLogin: (data: { provider: string; email?: string; name?: string; phone?: string; language?: string }) =>
    apiRequest<any>('/auth/social', { method: 'POST', body: JSON.stringify(data) }),

  sendPhoneOtp: (phone: string) =>
    apiRequest<any>('/auth/phone/otp', { method: 'POST', body: JSON.stringify({ phone }) }),

  verifyPhoneOtp: (phone: string, otp: string) =>
    apiRequest<any>('/auth/phone/verify', { method: 'POST', body: JSON.stringify({ phone, otp }) }),

  getMe: () =>
    apiRequest<any>('/auth/me', { method: 'GET' })
};

export const profileApi = {
  getProfile: () =>
    apiRequest<UserProfile>('/profile', { method: 'GET' }),

  createProfile: (profile: Omit<UserProfile, 'id' | 'user_id' | 'bmi' | 'updated_at'>) =>
    apiRequest<UserProfile>('/profile', { method: 'POST', body: JSON.stringify(profile) }),

  updateProfile: (profile: Partial<UserProfile>) =>
    apiRequest<UserProfile>('/profile', { method: 'PUT', body: JSON.stringify(profile) })
};

export const healthApi = {
  submitDailyHealth: (data: Partial<DailyHealthRecord>) =>
    apiRequest<DailyHealthRecord>('/daily-health', { method: 'POST', body: JSON.stringify(data) }),

  getTodayHealth: () =>
    apiRequest<DailyHealthRecord | null>('/daily-health/today', { method: 'GET' }),

  getHistory: (limit = 30) =>
    apiRequest<DailyHealthRecord[]>(`/daily-health/history?limit=${limit}`, { method: 'GET' }),

  logMeal: (meal: Omit<MealItem, 'id' | 'user_id' | 'date'>) =>
    apiRequest<MealItem>('/meals', { method: 'POST', body: JSON.stringify(meal) }),

  getTodayMeals: () =>
    apiRequest<MealItem[]>('/meals/today', { method: 'GET' })
};

export const digitalTwinApi = {
  getTwinState: () =>
    apiRequest<DigitalTwinState>('/digital-twin', { method: 'GET' }),

  getHealthScore: () =>
    apiRequest<HealthScoreBreakdown>('/digital-twin/health-score', { method: 'GET' })
};

export const analyticsApi = {
  getPredictions: () =>
    apiRequest<RiskIndicator[]>('/analytics/predictions', { method: 'GET' }),

  getWeeklyAnalysis: () =>
    apiRequest<WeekOverWeekAnalysis>('/analytics/weekly-analysis', { method: 'GET' }),

  getTrends: (timeframe: '7d' | '30d' | '90d' = '7d') =>
    apiRequest<HealthTrendsResponse>(`/analytics/health-trends?timeframe=${timeframe}`, { method: 'GET' }),

  getMealAlert: () =>
    apiRequest<MealTimingAlert>('/analytics/meal-alert', { method: 'GET' }),

  seedDemoData: () =>
    apiRequest<any>('/analytics/seed-demo', { method: 'POST' }),

  resetData: () =>
    apiRequest<any>('/analytics/reset-data', { method: 'POST' })
};

export const recommendationsApi = {
  getRecommendations: () =>
    apiRequest<RecommendationItem[]>('/recommendations', { method: 'GET' })
};

export const healthcareApi = {
  getNearbyHealthcare: () =>
    apiRequest<HealthcareFacility[]>('/healthcare/nearby', { method: 'GET' })
};

export const settingsApi = {
  updateLanguage: (language: SupportedLanguage) =>
    apiRequest<any>('/settings/language', { method: 'PUT', body: JSON.stringify({ language }) }),

  getLanguage: () =>
    apiRequest<{ language: SupportedLanguage }>('/settings/language', { method: 'GET' })
};
