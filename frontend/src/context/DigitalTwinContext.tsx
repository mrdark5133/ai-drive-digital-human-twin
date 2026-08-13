import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  DigitalTwinState,
  OrganStatus,
  RiskIndicator,
  WeekOverWeekAnalysis,
  RecommendationItem,
  MealTimingAlert,
  HealthcareFacility
} from '../types';
import {
  digitalTwinApi,
  analyticsApi,
  recommendationsApi,
  healthcareApi
} from '../api/endpoints';
import { useAuth } from './AuthContext';

interface DigitalTwinContextType {
  twinState: DigitalTwinState | null;
  selectedOrganKey: string | null;
  selectedOrgan: OrganStatus | null;
  setSelectedOrganKey: (key: string | null) => void;
  predictions: RiskIndicator[];
  weeklyAnalysis: WeekOverWeekAnalysis | null;
  recommendations: RecommendationItem[];
  mealAlert: MealTimingAlert | null;
  healthcareFacilities: HealthcareFacility[];
  isLoading: boolean;
  refreshAll: () => Promise<void>;
  seedDemo: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const DigitalTwinContext = createContext<DigitalTwinContextType | undefined>(undefined);

export const DigitalTwinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, hasProfile } = useAuth();
  
  const [twinState, setTwinState] = useState<DigitalTwinState | null>(null);
  const [selectedOrganKey, setSelectedOrganKey] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<RiskIndicator[]>([]);
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<WeekOverWeekAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [mealAlert, setMealAlert] = useState<MealTimingAlert | null>(null);
  const [healthcareFacilities, setHealthcareFacilities] = useState<HealthcareFacility[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedOrgan = (twinState && selectedOrganKey && twinState.organs[selectedOrganKey])
    ? twinState.organs[selectedOrganKey]
    : null;

  const refreshAll = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [
        stateData,
        predData,
        wowData,
        recData,
        alertData,
        facData
      ] = await Promise.allSettled([
        digitalTwinApi.getTwinState(),
        analyticsApi.getPredictions(),
        analyticsApi.getWeeklyAnalysis(),
        recommendationsApi.getRecommendations(),
        analyticsApi.getMealAlert(),
        healthcareApi.getNearbyHealthcare()
      ]);

      if (stateData.status === 'fulfilled') setTwinState(stateData.value);
      if (predData.status === 'fulfilled') setPredictions(predData.value);
      if (wowData.status === 'fulfilled') setWeeklyAnalysis(wowData.value);
      if (recData.status === 'fulfilled') setRecommendations(recData.value);
      if (alertData.status === 'fulfilled') setMealAlert(alertData.value);
      if (facData.status === 'fulfilled') setHealthcareFacilities(facData.value);
    } catch (error) {
      console.error('Error refreshing Digital Twin context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, hasProfile]);

  const seedDemo = async () => {
    setIsLoading(true);
    try {
      await analyticsApi.seedDemoData();
      await refreshAll();
    } catch (e) {
      console.error('Failed to seed demo data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllData = async () => {
    setIsLoading(true);
    try {
      await analyticsApi.resetData();
      await refreshAll();
    } catch (e) {
      console.error('Failed to reset data', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DigitalTwinContext.Provider
      value={{
        twinState,
        selectedOrganKey,
        selectedOrgan,
        setSelectedOrganKey,
        predictions,
        weeklyAnalysis,
        recommendations,
        mealAlert,
        healthcareFacilities,
        isLoading,
        refreshAll,
        seedDemo,
        resetAllData
      }}
    >
      {children}
    </DigitalTwinContext.Provider>
  );
};

export const useDigitalTwin = () => {
  const context = useContext(DigitalTwinContext);
  if (!context) {
    throw new Error('useDigitalTwin must be used within a DigitalTwinProvider');
  }
  return context;
};
