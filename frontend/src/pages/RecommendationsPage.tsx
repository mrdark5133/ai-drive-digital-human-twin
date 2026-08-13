import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Footprints,
  Activity,
  Utensils,
  HeartPulse,
  Cigarette,
  Wine,
  ClockAlert,
  Armchair,
  Filter
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDigitalTwin } from '../context/DigitalTwinContext';
import { RecommendationItem } from '../types';

export const RecommendationsPage: React.FC = () => {
  const { t } = useLanguage();
  const { recommendations, twinState } = useDigitalTwin();
  const [filterType, setFilterType] = useState<'all' | 'do' | 'avoid'>('all');

  const filteredItems = recommendations.filter(r => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  const getRecIcon = (category: string, type: string) => {
    if (type === 'avoid') {
      if (category.toLowerCase().includes('smoke') || category.toLowerCase().includes('cardio')) return <Cigarette className="w-5 h-5 text-rose-400" />;
      if (category.toLowerCase().includes('alcohol')) return <Wine className="w-5 h-5 text-rose-400" />;
      if (category.toLowerCase().includes('circadian') || category.toLowerCase().includes('clock')) return <ClockAlert className="w-5 h-5 text-amber-400" />;
      return <Armchair className="w-5 h-5 text-rose-400" />;
    } else {
      if (category.toLowerCase().includes('sleep')) return <Moon className="w-5 h-5 text-indigo-400" />;
      if (category.toLowerCase().includes('movement') || category.toLowerCase().includes('walk')) return <Footprints className="w-5 h-5 text-emerald-400" />;
      if (category.toLowerCase().includes('nutrition')) return <Utensils className="w-5 h-5 text-amber-400" />;
      return <HeartPulse className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Targeted Lifestyle Optimization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('dashboard.recommends_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Personalized physiological recommendations engineered directly from your daily biometric patterns.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
          {[
            { id: 'all', label: 'All Protocols' },
            { id: 'do', label: t('dashboard.do_this') },
            { id: 'avoid', label: t('dashboard.avoid_this') }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === f.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`p-6 rounded-2xl glass-card-interactive border flex flex-col justify-between space-y-4 ${
              item.type === 'avoid'
                ? 'border-rose-500/20 bg-gradient-to-b from-rose-950/10 to-slate-900/80'
                : 'border-cyan-500/20 bg-gradient-to-b from-cyan-950/10 to-slate-900/80'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl border ${
                    item.type === 'avoid'
                      ? 'bg-rose-950/40 border-rose-500/30'
                      : 'bg-cyan-950/40 border-cyan-500/30'
                  }`}>
                    {getRecIcon(item.category, item.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadge(item.priority)}`}>
                  {item.priority} Priority
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                {item.recommendation}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400">Target Category</span>
              <span className={`font-semibold flex items-center space-x-1 ${
                item.type === 'avoid' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {item.type === 'avoid' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    <span>Reduce / Avoid</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Positive Action</span>
                  </>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
