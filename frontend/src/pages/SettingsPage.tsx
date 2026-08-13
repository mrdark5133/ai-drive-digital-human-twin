import React, { useState } from 'react';
import { Globe, Settings, Database, Trash2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDigitalTwin } from '../context/DigitalTwinContext';
import { settingsApi } from '../api/endpoints';
import { SupportedLanguage } from '../types';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { updateUserStatus } = useAuth();
  const { seedDemo, resetAllData, isLoading } = useDigitalTwin();

  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const languagesList: { code: SupportedLanguage; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
  ];

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    setLanguage(lang);
    try {
      await settingsApi.updateLanguage(lang);
      updateUserStatus({ language: lang });
      setBannerMsg(`Application language updated to ${lang.toUpperCase()}`);
      setTimeout(() => setBannerMsg(null), 3000);
    } catch (e) {
      console.error('Could not save language', e);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset your health records? This will clear historical daily logs.')) {
      await resetAllData();
      setBannerMsg('Daily health logs reset.');
      setTimeout(() => setBannerMsg(null), 3000);
    }
  };

  const handleSeed = async () => {
    await seedDemo();
    setBannerMsg('14-Day realistic simulation dataset seeded successfully!');
    setTimeout(() => setBannerMsg(null), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">System Settings</h1>
            <p className="text-xs text-slate-400">Application localization, model preferences, and telemetry storage.</p>
          </div>
        </div>
      </div>

      {bannerMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{bannerMsg}</span>
        </div>
      )}

      {/* Language Preferences Card */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-white">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>{t('language.select_title')}</span>
        </div>
        <p className="text-xs text-slate-400">
          All forms, notifications, AI insights, and anatomical labels will automatically render in your chosen language.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {languagesList.map(item => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => handleLanguageChange(item.code)}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="font-bold text-sm block text-white">{item.nativeName}</span>
                  <span className="text-[11px] text-slate-400">{item.name}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulation & Data Management Card */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-white">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Simulation & Historical Data Management</span>
        </div>
        <p className="text-xs text-slate-400">
          Load or reset simulated longitudinal health trajectories for testing and academic demonstration.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>14-Day Health Simulation</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Generates a realistic 14-day sequence showing an active week transitioning to a busy deconditioned week.
              </p>
            </div>
            <button
              onClick={handleSeed}
              disabled={isLoading}
              className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
            >
              {isLoading ? 'Processing...' : 'Load 14-Day Simulation'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Reset Health Logs</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Clears daily health entries to test the first-time onboarding progression from Day 1.
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="w-full py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition"
            >
              Reset Data to Day 1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
