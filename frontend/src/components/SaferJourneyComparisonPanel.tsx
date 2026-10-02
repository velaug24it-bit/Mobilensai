import React, { useState } from 'react';
import { 
  GitCompare, 
  Clock, 
  Footprints, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Layers,
  Accessibility
} from 'lucide-react';
import { SAFER_JOURNEY_OPTIONS } from '../data/mockData';
import { SafeJourneyComparisonOption } from '../types';

interface SaferJourneyComparisonPanelProps {
  onSelectRoute?: (route: SafeJourneyComparisonOption) => void;
}

export const SaferJourneyComparisonPanel: React.FC<SaferJourneyComparisonPanelProps> = ({
  onSelectRoute
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ROUTE-B');

  const selectedRoute = SAFER_JOURNEY_OPTIONS.find(r => r.id === selectedRouteId) || SAFER_JOURNEY_OPTIONS[0];

  return (
    <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <GitCompare className="w-3 h-3" />
              Multi-Objective Trade-Off Engine
            </span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Safer Journey & Multi-Route Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparently compare speed vs. walking distance vs. road safety exposure. No single route is labeled universally "best".
          </p>
        </div>

        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          ⚖️ Choose based on your personal priorities
        </div>
      </div>

      {/* Route Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAFER_JOURNEY_OPTIONS.map(opt => {
          const isSelected = selectedRouteId === opt.id;
          const isElevatedRisk = opt.riskExposure === 'Elevated';

          return (
            <div
              key={opt.id}
              onClick={() => {
                setSelectedRouteId(opt.id);
                if (onSelectRoute) onSelectRoute(opt);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 relative ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400/60 shadow-xl shadow-cyan-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Badge & Title */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${opt.badgeColor}`}>
                  {opt.badge}
                </span>
                {isSelected && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Selected
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  {opt.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {opt.description}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[9px] text-slate-400 block">Total Time</span>
                  <strong className="text-white font-mono text-xs">{opt.durationMinutes} min</strong>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[9px] text-slate-400 block">Walking</span>
                  <strong className="text-cyan-400 font-mono text-xs">{opt.walkingMinutes} min</strong>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[9px] text-slate-400 block">Friction</span>
                  <strong className="text-rose-400 font-mono text-xs">{opt.frictionScore}/100</strong>
                </div>
              </div>

              {/* Road Risk Indicator Pill */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Road Safety Exposure:</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                  isElevatedRisk 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {opt.riskExposure}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route In-Depth Trade-Off Detail */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Active Choice: <strong className="text-white">{selectedRoute.title}</strong>
          </span>
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            {selectedRoute.highlights.map((h, i) => (
              <span key={i} className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{h}</span>
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onSelectRoute) onSelectRoute(selectedRoute);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 flex-shrink-0"
        >
          <span>Confirm This Route</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
