import React from 'react';
import { Activity, Globe, Bell, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDigitalTwin } from '../../context/DigitalTwinContext';
import { SupportedLanguage } from '../../types';

interface Props {
  onOpenLanguageModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ onOpenLanguageModal, activeTab, setActiveTab }) => {
  const { isAuthenticated, email, phone, logout, profile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { twinState, mealAlert } = useDigitalTwin();

  const daysCount = twinState?.days_tracked || 1;

  const languagesList: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'kn', label: 'ಕನ್ನಡ' }
  ];

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo & Tag */}
      <div 
        onClick={() => setActiveTab(isAuthenticated ? 'dashboard' : 'landing')}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all">
          <Activity className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              DIGITAL TWIN
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
              AI-CORE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">Predictive Life Modeling</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        {/* Day Progression Badge (if authenticated) */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-cyan-500/30 text-xs text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('nav.day_badge')} {daysCount}</span>
          </div>
        )}

        {/* Smart Meal Notification indicator if alert present */}
        {mealAlert?.needs_alert && (
          <button
            onClick={() => setActiveTab('daily_health')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs animate-bounce"
            title={mealAlert.message}
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-medium">Meal Reminder</span>
          </button>
        )}

        {/* Language Switcher Dropdown / Modal Trigger */}
        <div className="relative flex items-center">
          <button
            onClick={onOpenLanguageModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase font-semibold">{language}</span>
          </button>
        </div>

        {/* User Identity / Logout */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
            >
              <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-medium truncate max-w-[120px]">
                {profile?.name || email?.split('@')[0] || phone || 'My Profile'}
              </span>
            </button>
            <button
              onClick={logout}
              title={t('nav.logout')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700 text-slate-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('auth')}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            {t('nav.login')}
          </button>
        )}
      </div>
    </header>
  );
};
