import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { useDigitalTwin } from './context/DigitalTwinContext';

import { MedicalDisclaimerBanner } from './components/layout/MedicalDisclaimerBanner';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { LanguageSelectorModal } from './components/onboarding/LanguageSelectorModal';
import { BasicProfileModal } from './components/onboarding/BasicProfileModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DailyLoggingPage } from './pages/DailyLoggingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { NearbyHealthcarePage } from './pages/NearbyHealthcarePage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const { isAuthenticated, hasProfile, hasDay1Data, profile } = useAuth();
  const { twinState } = useDigitalTwin();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isOnboardingFlow, setIsOnboardingFlow] = useState(false);

  // Manage First-time User vs Returning User Progression
  useEffect(() => {
    if (isAuthenticated) {
      if (!hasProfile && !profile) {
        // Step 1: Language -> Step 2: Basic Profile
        setShowProfileModal(true);
      } else if (!hasDay1Data && (!twinState || twinState.days_tracked === 0)) {
        // Step 3: Day 1 Daily Health Data Entry
        setActiveTab('daily_health');
      } else {
        // Returning user: go straight to dashboard
        if (activeTab === 'landing') {
          setActiveTab('dashboard');
        }
      }
    } else {
      // Unauthenticated: default to landing page and show auth
      setActiveTab('landing');
    }
  }, [isAuthenticated, hasProfile, hasDay1Data, twinState?.days_tracked]);

  // Handle "Get Started" from Landing Page
  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else if (!hasProfile && !profile) {
      setShowLanguageModal(true);
      setIsOnboardingFlow(true);
    } else if (!hasDay1Data && (!twinState || twinState.days_tracked === 0)) {
      setActiveTab('daily_health');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleExploreTwin = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (!hasProfile && !profile) {
      setShowLanguageModal(true);
      setIsOnboardingFlow(true);
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLanguageModalComplete = () => {
    if (isOnboardingFlow && !hasProfile) {
      setShowProfileModal(true);
      setIsOnboardingFlow(false);
    }
  };

  const handleProfileSuccess = () => {
    setShowProfileModal(false);
    // Move to Day 1 Health & Lifestyle logging
    setActiveTab('daily_health');
  };

  const renderActivePage = () => {
    // If not authenticated, always show Landing Page (Auth First requirement)
    if (!isAuthenticated) {
      return (
        <LandingPage
          onGetStarted={handleGetStarted}
          onExploreTwin={handleExploreTwin}
        />
      );
    }

    switch (activeTab) {
      case 'landing':
        return (
          <LandingPage
            onGetStarted={handleGetStarted}
            onExploreTwin={handleExploreTwin}
          />
        );
      case 'dashboard':
      case 'digital_twin':
      case 'predictions':
        return <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />;
      case 'daily_health':
        return <DailyLoggingPage onSaved={() => setActiveTab('dashboard')} />;
      case 'analytics':
      case 'trends':
        return <AnalyticsPage />;
      case 'recommendations':
        return <RecommendationsPage />;
      case 'healthcare':
        return <NearbyHealthcarePage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Universal Medical Disclaimer */}
      <MedicalDisclaimerBanner />

      {/* Main Navbar */}
      <Navbar
        onOpenLanguageModal={() => setShowLanguageModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* App Body with Sidebar & Main Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6">
        {/* Sidebar visible only when authenticated */}
        {isAuthenticated && (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* Content Viewport */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto max-w-full">
          {renderActivePage()}
        </main>
      </div>

      {/* Auth Modal (Gating login/signup/OAuth/OTP) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onComplete={handleLanguageModalComplete}
      />

      {/* Basic Profile Modal (First-time user only) */}
      <BasicProfileModal
        isOpen={showProfileModal}
        onSuccess={handleProfileSuccess}
      />
    </div>
  );
};
export default App;
