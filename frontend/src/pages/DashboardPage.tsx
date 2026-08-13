import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Wind,
  Brain,
  Moon,
  Dumbbell,
  Utensils,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Hospital,
  ChevronRight,
  CheckCircle2,
  Bell,
  RefreshCw,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { HumanDigitalTwinCanvas } from '../components/3d/HumanDigitalTwinCanvas';
import { OrganDetailModal } from '../components/3d/OrganDetailModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDigitalTwin } from '../context/DigitalTwinContext';

interface Props {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const {
    twinState,
    selectedOrganKey,
    selectedOrgan,
    setSelectedOrganKey,
    predictions,
    weeklyAnalysis,
    recommendations,
    mealAlert,
    healthcareFacilities,
    seedDemo,
    isLoading
  } = useDigitalTwin();

  const [demoLoadedBanner, setDemoLoadedBanner] = useState(false);

  const overallScore = twinState?.health_score?.overall_score || 85;
  const daysCount = twinState?.days_tracked || 1;

  const handleSeedClick = async () => {
    await seedDemo();
    setDemoLoadedBanner(true);
    setTimeout(() => setDemoLoadedBanner(false), 5000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Moderate': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Elevated': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Smart Meal Reminder Alert Banner (Contextual) */}
      {mealAlert?.needs_alert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 border border-amber-500/40 shadow-lg shadow-amber-950/30 flex items-center justify-between flex-wrap gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 animate-bounce">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                Smart Meal Intelligence
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-100">
                {mealAlert.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('daily_health')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5"
          >
            <span>Log Meal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Demo Seed Notification Alert */}
      {demoLoadedBanner && (
        <div className="p-4 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 text-xs sm:text-sm flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <span>{t('dashboard.demo_seeded_msg')}</span>
          </div>
        </div>
      )}

      {/* Dashboard Top Header & Overall Health Score Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-semibold mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>{t('dashboard.title')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('dashboard.greeting')}, {profile?.name || 'Explorer'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {twinState?.status_summary || 'Your Digital Twin is operational and monitoring your physiological dynamics.'}
          </p>
        </div>

        {/* Action button to load 14-day simulated health journey */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSeedClick}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-950/40"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{isLoading ? 'Simulating...' : t('dashboard.load_demo_data')}</span>
          </button>
        </div>
      </div>

      {/* Main Center Grid: 3D Holographic Twin & Organ Score Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive 3D Avatar (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative h-[480px] rounded-2xl overflow-hidden glass-panel-glow">
            {/* Health Score Overlay Top Left */}
            <div className="absolute top-4 left-4 z-10 p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md shadow-2xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {t('dashboard.health_score')}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-3xl font-black text-white font-mono">{overallScore}</span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>
              <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Calibrated (Day {daysCount})</span>
              </div>
            </div>

            {/* 3D Canvas */}
            <HumanDigitalTwinCanvas onSelectOrgan={(key) => setSelectedOrganKey(key)} />
          </div>

          <p className="text-center text-xs text-slate-400 italic">
            {t('dashboard.interactive_avatar_hint')}
          </p>
        </div>

        {/* Right Column: Physiological System Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="px-2 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>{t('dashboard.organ_breakdown')}</span>
            <span className="text-cyan-400">Tap for Deep AI Insights</span>
          </div>

          {/* Organ Score Item: Heart */}
          <div
            onClick={() => setSelectedOrganKey('heart')}
            className="p-3.5 rounded-xl glass-card-interactive cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('dashboard.heart')}</h4>
                <span className="text-[11px] text-slate-400">Cardiovascular output</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-rose-400">
                {twinState?.health_score?.heart || 92}%
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Organ Score Item: Respiratory */}
          <div
            onClick={() => setSelectedOrganKey('respiratory')}
            className="p-3.5 rounded-xl glass-card-interactive cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('dashboard.respiratory')}</h4>
                <span className="text-[11px] text-slate-400">Pulmonary efficiency</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-cyan-400">
                {twinState?.health_score?.respiratory || 89}%
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Organ Score Item: Mental */}
          <div
            onClick={() => setSelectedOrganKey('brain')}
            className="p-3.5 rounded-xl glass-card-interactive cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('dashboard.mental')}</h4>
                <span className="text-[11px] text-slate-400">Neuro-cognitive balance</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-purple-400">
                {twinState?.health_score?.mental || 81}%
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Organ Score Item: Sleep */}
          <div
            onClick={() => setSelectedOrganKey('sleep')}
            className="p-3.5 rounded-xl glass-card-interactive cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('dashboard.sleep')}</h4>
                <span className="text-[11px] text-slate-400">Circadian restoration</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-indigo-400">
                {twinState?.health_score?.sleep || 74}%
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Organ Score Item: Fitness */}
          <div
            onClick={() => setSelectedOrganKey('fitness')}
            className="p-3.5 rounded-xl glass-card-interactive cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('dashboard.fitness')}</h4>
                <span className="text-[11px] text-slate-400">Mobility & musculoskeletal</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-emerald-400">
                {twinState?.health_score?.fitness || 91}%
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: AI Predictive Analytics Risk Indicators */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white font-bold text-lg">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>{t('dashboard.ai_analytics_title')}</span>
          </div>
          <span className="text-xs text-slate-400">Estimated Multi-System Risk Indicators</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {predictions.length > 0 ? (
            predictions.map((risk) => (
              <div
                key={risk.category}
                className="p-4 rounded-2xl glass-card-interactive flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">{risk.category} Risk</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRiskBadge(risk.risk_level)}`}>
                      {risk.risk_level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {risk.explanation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Estimated Strain</span>
                  <span className="font-mono font-bold text-white">{Math.round(risk.score * 100)}%</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 p-6 rounded-2xl glass-panel text-center text-xs text-slate-400">
              Calibrating AI risk predictions. Log today's health entry or load simulation to see multi-system risks.
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Context-Aware Week-over-Week Analytics (Core Unique Requirement) */}
      <section className="p-6 rounded-2xl glass-panel space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
              <span>{t('dashboard.context_aware_title')}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('dashboard.prev_vs_curr')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View Full Trends</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Grid */}
        {weeklyAnalysis && weeklyAnalysis.is_available ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {weeklyAnalysis.metrics.map((m) => (
                <div key={m.metric_name} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-medium truncate">{m.metric_name}</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-base font-bold text-white">{m.current_week}</span>
                    <span className="text-[10px] text-slate-400">{m.unit}</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1.5 text-[11px] font-semibold">
                    {m.change_direction === 'up' ? (
                      <span className={m.is_positive_trend ? 'text-emerald-400' : 'text-rose-400 flex items-center'}>
                        ↑ {m.change_value} {m.unit}
                      </span>
                    ) : m.change_direction === 'down' ? (
                      <span className={m.is_positive_trend ? 'text-emerald-400 flex items-center' : 'text-rose-400 flex items-center'}>
                        ↓ {m.change_value} {m.unit}
                      </span>
                    ) : (
                      <span className="text-slate-400">Stable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Synergistic AI Narrative Explanation */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-indigo-300 block mb-0.5">
                  {t('dashboard.ai_insight')}
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  "{weeklyAnalysis.ai_context_explanation}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center text-xs text-slate-400">
            {weeklyAnalysis?.message || 'Your Digital Twin is currently learning your health patterns. Click "Load 14-Day Simulation Journey" above to immediately preview week-over-week comparative dynamics.'}
          </div>
        )}
      </section>

      {/* Section 4: Personalized Recommendations (What You Can Do / Avoid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{t('dashboard.recommends_title')}</span>
          </h2>
          <button
            onClick={() => onNavigate('recommendations')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Do This Card */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('dashboard.do_this')}</span>
            </h3>
            <div className="space-y-2">
              {recommendations.filter(r => r.type === 'do').slice(0, 3).map(rec => (
                <div key={rec.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                  <span className="font-bold text-white block mb-0.5">{rec.title}</span>
                  <p className="text-slate-300 leading-snug">{rec.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Avoid This Card */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{t('dashboard.avoid_this')}</span>
            </h3>
            <div className="space-y-2">
              {recommendations.filter(r => r.type === 'avoid').slice(0, 3).map(rec => (
                <div key={rec.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                  <span className="font-bold text-white block mb-0.5">{rec.title}</span>
                  <p className="text-slate-300 leading-snug">{rec.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Nearby Healthcare Teaser */}
      <section className="p-6 rounded-2xl glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t('dashboard.nearby_healthcare_title')}</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('dashboard.nearby_healthcare_desc')}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('healthcare')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5 flex-shrink-0"
        >
          <span>{t('dashboard.view_all_facilities')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Active Organ Inspection Modal */}
      <OrganDetailModal
        organKey={selectedOrganKey}
        organ={selectedOrgan}
        onClose={() => setSelectedOrganKey(null)}
      />
    </div>
  );
};
