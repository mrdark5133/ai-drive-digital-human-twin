import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  SlidersHorizontal,
  Activity,
  Heart,
  Moon,
  Scale,
  Footprints,
  Sparkles,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDigitalTwin } from '../context/DigitalTwinContext';
import { analyticsApi } from '../api/endpoints';
import { HealthTrendsResponse, TrendDataPoint } from '../types';

export const AnalyticsPage: React.FC = () => {
  const { t } = useLanguage();
  const { weeklyAnalysis, twinState } = useDigitalTwin();

  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [activeMetric, setActiveMetric] = useState<'health_score' | 'sleep' | 'steps' | 'heart_rate'>('health_score');
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await analyticsApi.getTrends(timeframe);
        setTrends(res.data_points);
        if (res.data_points.length > 0) {
          setHoveredPoint(res.data_points[res.data_points.length - 1]);
        }
      } catch (e) {
        console.error('Failed to load trends', e);
      }
    };
    fetchTrends();
  }, [timeframe]);

  // Compute SVG chart coordinates dynamically
  const getMetricValue = (pt: TrendDataPoint, metric: string): number => {
    switch (metric) {
      case 'health_score': return pt.health_score || 85;
      case 'sleep': return pt.sleep_hours || 7.0;
      case 'steps': return pt.steps || 5000;
      case 'heart_rate': return pt.heart_rate_est || 70;
      default: return pt.health_score || 85;
    }
  };

  const getMetricUnit = (metric: string): string => {
    switch (metric) {
      case 'health_score': return '/ 100';
      case 'sleep': return 'hrs';
      case 'steps': return 'steps';
      case 'heart_rate': return 'bpm';
      default: return '';
    }
  };

  const values = trends.map(pt => getMetricValue(pt, activeMetric));
  const minVal = Math.min(...(values.length ? values : [0]));
  const maxVal = Math.max(...(values.length ? values : [100]));
  const range = maxVal - minVal || 1;

  const chartHeight = 200;
  const chartWidth = 700;

  const points = trends.map((pt, idx) => {
    const x = (idx / Math.max(1, trends.length - 1)) * (chartWidth - 60) + 30;
    const val = getMetricValue(pt, activeMetric);
    const y = chartHeight - ((val - minVal) / range) * (chartHeight - 50) - 25;
    return { x, y, pt, val };
  });

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaStr = points.length > 0
    ? `${points[0].x},${chartHeight} ${polylineStr} ${points[points.length - 1].x},${chartHeight}`
    : '';

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Multi-Dimensional AI Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Context-Aware Predictive Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Cross-factor pattern analysis and time-series physiological trends.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
          {(['7d', '30d', '90d'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition uppercase ${
                timeframe === tf
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Week-over-Week Comparative Analysis Matrix */}
      <div className="p-6 rounded-2xl glass-panel space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Week-over-Week Physiological Dynamics</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Comparative Baseline Engine</span>
        </div>

        {weeklyAnalysis && weeklyAnalysis.is_available ? (
          <div className="space-y-6">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Physiological Metric</th>
                    <th className="py-3 px-4">Previous Observation</th>
                    <th className="py-3 px-4">Current Observation</th>
                    <th className="py-3 px-4">Net Shift</th>
                    <th className="py-3 px-4">Biomarker Direction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {weeklyAnalysis.metrics.map(m => (
                    <tr key={m.metric_name} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">{m.metric_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{m.previous_week} {m.unit}</td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">{m.current_week} {m.unit}</td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        <span className={m.change_direction === 'up' ? (m.is_positive_trend ? 'text-emerald-400' : 'text-rose-400') : (m.is_positive_trend ? 'text-emerald-400' : 'text-rose-400')}>
                          {m.change_direction === 'up' ? `+${m.change_value}` : `-${m.change_value}`} {m.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.is_positive_trend
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {m.is_positive_trend ? 'Positive Adaptation' : 'Deconditioning Load'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Narrative Explanation */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-indigo-300 block mb-0.5">
                  AI Context-Aware Multi-Factor Synthesis:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  "{weeklyAnalysis.ai_context_explanation}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center text-xs text-slate-400">
            {weeklyAnalysis?.message || 'Logging 2 or more daily health entries unlocks full week-over-week comparative telemetry.'}
          </div>
        )}
      </div>

      {/* Interactive Time-Series Charts Section */}
      <div className="p-6 rounded-2xl glass-panel space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>Interactive Physiological Trends</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover over points to inspect dated biometric readings
            </p>
          </div>

          {/* Metric Tab Selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'health_score', label: 'Health Score', icon: Activity, color: 'text-cyan-400' },
              { id: 'sleep', label: 'Sleep Trend', icon: Moon, color: 'text-indigo-400' },
              { id: 'steps', label: 'Daily Steps', icon: Footprints, color: 'text-emerald-400' },
              { id: 'heart_rate', label: 'Est. Heart Rate', icon: Heart, color: 'text-rose-400' }
            ].map(m => {
              const Icon = m.icon;
              const isSelected = activeMetric === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hovered Point Inspector Banner */}
        {hoveredPoint && (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white">{hoveredPoint.date}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-slate-400 mr-1">Active Reading:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {getMetricValue(hoveredPoint, activeMetric)} {getMetricUnit(activeMetric)}
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-slate-400 mr-1">Sleep:</span>
                <span className="font-mono text-indigo-300">{hoveredPoint.sleep_hours}h</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-slate-400 mr-1">Steps:</span>
                <span className="font-mono text-emerald-300">{hoveredPoint.steps?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* SVG Time-Series Chart */}
        <div className="relative w-full overflow-hidden pt-4 pb-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-56 overflow-visible"
          >
            <defs>
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0.25, 0.5, 0.75].map((factor, i) => (
              <line
                key={i}
                x1="20"
                y1={chartHeight * factor}
                x2={chartWidth - 20}
                y2={chartHeight * factor}
                stroke="#1E293B"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Area Fill */}
            {points.length > 1 && (
              <polygon
                points={areaStr}
                fill="url(#chartGlow)"
              />
            )}

            {/* Line */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="#06B6D4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />
            )}

            {/* Interactive Data Dots */}
            {points.map((p, i) => (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p.pt)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="#070B14"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  className="hover:r-7 transition-all"
                />
                <text
                  x={p.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {p.pt.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};
