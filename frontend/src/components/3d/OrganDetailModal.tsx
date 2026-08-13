import React from 'react';
import { X, Activity, ShieldAlert, Sparkles, CheckCircle2, Heart, Wind, Brain, Utensils, Moon, Dumbbell } from 'lucide-react';
import { OrganStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  organKey: string | null;
  organ: OrganStatus | null;
  onClose: () => void;
}

export const OrganDetailModal: React.FC<Props> = ({ organKey, organ, onClose }) => {
  const { t } = useLanguage();
  if (!organKey || !organ) return null;

  const getIcon = (key: string) => {
    switch (key) {
      case 'heart': return <Heart className="w-6 h-6 text-rose-400" />;
      case 'respiratory': return <Wind className="w-6 h-6 text-cyan-400" />;
      case 'brain': return <Brain className="w-6 h-6 text-purple-400" />;
      case 'digestive': return <Utensils className="w-6 h-6 text-amber-400" />;
      case 'sleep': return <Moon className="w-6 h-6 text-indigo-400" />;
      case 'fitness': return <Dumbbell className="w-6 h-6 text-emerald-400" />;
      default: return <Activity className="w-6 h-6 text-cyan-400" />;
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Moderate': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Elevated': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden"
        style={{ boxShadow: `0 0 40px ${organ.color}33` }}
      >
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: organ.color }} />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              {getIcon(organKey)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{organ.name}</h3>
              <span className="text-xs text-slate-400">Digital Twin Anatomical Analysis</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Risk Badge */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">Efficiency Score</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold text-white">{organ.score}%</span>
              <span className="text-xs font-semibold text-cyan-400">Optimal</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${organ.score}%`, backgroundColor: organ.color }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
            <span className="text-xs text-slate-400 block">AI Estimated Risk</span>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeColor(organ.ai_risk_indicator)}`}>
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                {organ.ai_risk_indicator} Risk Indicator
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Non-diagnostic assessment</span>
          </div>
        </div>

        {/* Summary Description */}
        <p className="text-sm text-slate-300 mb-4 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
          {organ.summary}
        </p>

        {/* Contributing Factors */}
        {organ.contributing_factors && organ.contributing_factors.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Observed Behavioral Factors
            </h4>
            <div className="space-y-1.5">
              {organ.contributing_factors.map((factor, idx) => (
                <div key={idx} className="flex items-start text-xs text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-md border border-slate-700/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 mr-2 flex-shrink-0" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {organ.recommendations && organ.recommendations.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Targeted Twin Recommendations
            </h4>
            <div className="space-y-1.5">
              {organ.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start text-xs text-slate-300 bg-cyan-950/20 px-3 py-1.5 rounded-md border border-cyan-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold transition"
          >
            Close Organ View
          </button>
        </div>
      </div>
    </div>
  );
};
