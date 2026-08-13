import React from 'react';
import {
  Activity,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Heart,
  Moon,
  Dumbbell,
  Brain,
  CheckCircle2
} from 'lucide-react';
import { HumanDigitalTwinCanvas } from '../components/3d/HumanDigitalTwinCanvas';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  onGetStarted: () => void;
  onExploreTwin: () => void;
}

export const LandingPage: React.FC<Props> = ({ onGetStarted, onExploreTwin }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <div className="w-full min-h-screen space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 lg:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Vision & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Generation Preventive Healthcare AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t('app.tagline').split('.')[0]}.{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                {t('app.tagline').split('.')[1] || 'Prevent'}.
              </span>{' '}
              <span className="text-slate-100">
                {t('app.tagline').split('.')[2] || 'Improve.'}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('app.hero_desc')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 group"
              >
                <span>{t('app.get_started')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreTwin}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-sm transition flex items-center justify-center space-x-2"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>{t('app.explore_twin')}</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero medical jargon</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>6 Indian languages</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Circadian pattern AI</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Holographic Twin Showcase with Floating Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* 3D Canvas Viewport */}
            <div className="w-full max-w-md h-[460px] relative rounded-3xl overflow-hidden glass-panel-glow p-2">
              <HumanDigitalTwinCanvas />

              {/* Floating Health Card 1: Heart */}
              <div className="absolute top-6 -left-3 sm:-left-6 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-rose-500/40 backdrop-blur-md shadow-xl flex items-center space-x-2.5 animate-float pointer-events-none">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Heart Resilience</span>
                  <span className="text-xs font-bold text-white">92% Optimal</span>
                </div>
              </div>

              {/* Floating Health Card 2: Sleep */}
              <div className="absolute bottom-16 -right-2 sm:-right-4 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-indigo-500/40 backdrop-blur-md shadow-xl flex items-center space-x-2.5 animate-float [animation-delay:1.5s] pointer-events-none">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Circadian Sleep</span>
                  <span className="text-xs font-bold text-white">7.5h Restored</span>
                </div>
              </div>

              {/* Floating Health Card 3: Overall Score */}
              <div className="absolute top-1/2 -right-4 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md shadow-xl flex items-center space-x-2.5 animate-float [animation-delay:0.8s] pointer-events-none">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs">
                  87
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Health Score</span>
                  <span className="text-xs font-bold text-cyan-300">87 / 100</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Your Digital Twin Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            User Health Data → Digital Twin → AI Analysis → Risk Prediction → Context-Aware Comparison → Health Trends → Personalized Recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl glass-card-interactive space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Daily Health Vector</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Log daily sleep times, steps, exercise duration, natural meal descriptions, and lifestyle habits seamlessly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl glass-card-interactive space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Context-Aware AI Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Analyzes cross-factor correlations between sleep shifts, activity changes, and habit fluctuations week-over-week.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl glass-card-interactive space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Actionable Prevention</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Receive prioritized Do/Avoid recommendations, smart meal timing prompts in your language, and nearby clinical specialists.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
