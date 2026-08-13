import React from 'react';
import {
  Home,
  Dna,
  BarChart3,
  Bot,
  TrendingUp,
  Apple,
  Lightbulb,
  Hospital,
  User,
  Settings,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('nav.digital_twin'), icon: Dna, badge: '3D' },
    { id: 'analytics', label: t('nav.analytics'), icon: BarChart3 },
    { id: 'predictions', label: t('nav.predictions'), icon: Bot },
    { id: 'trends', label: t('nav.trends'), icon: TrendingUp },
    { id: 'daily_health', label: t('nav.daily_health'), icon: Apple, highlight: true },
    { id: 'recommendations', label: t('nav.recommendations'), icon: Lightbulb },
    { id: 'healthcare', label: t('nav.healthcare'), icon: Hospital },
    { id: 'profile', label: t('nav.profile'), icon: User },
    { id: 'settings', label: t('nav.settings'), icon: Settings }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex-shrink-0 flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-60px)]">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">
          Navigation Control
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Futuristic Telemetry Card at Bottom */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 mt-4">
        <div className="flex items-center space-x-2 text-xs text-cyan-300 mb-1.5 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>Continuous Modeling</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          AI continuously updates your physiological vector after every daily health entry.
        </p>
      </div>
    </aside>
  );
};
