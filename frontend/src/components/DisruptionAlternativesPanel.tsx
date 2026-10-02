import React from 'react';
import { RecoveryAlternative } from '../services/api';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Footprints, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';

interface DisruptionAlternativesPanelProps {
  alternatives: RecoveryAlternative[];
  onSelectAlternative: (alt: RecoveryAlternative) => void;
  currentDelay: number;
}

export const DisruptionAlternativesPanel: React.FC<DisruptionAlternativesPanelProps> = ({
  alternatives,
  onSelectAlternative,
  currentDelay
}) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="w-full bg-slate-900/95 border-2 border-rose-500/60 rounded-2xl p-5 shadow-2xl text-white space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Alert Header */}
      <div className="flex items-start justify-between border-b border-rose-900/50 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-rose-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                ⚠️ JOURNEY DISRUPTION DETECTED
              </span>
              <span className="text-xs text-rose-300 font-mono">
                Delay: +{currentDelay} minutes
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Your bus delay threatens your intermodal connection. Recalculated 4 recovery options:
            </h3>
          </div>
        </div>
      </div>

      {/* 4 Recovery Alternatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {alternatives.map((alt) => {
          const isRec = alt.recommended;

          return (
            <div
              key={alt.option_id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isRec
                  ? 'bg-slate-950/80 border-cyan-400/80 ring-1 ring-cyan-400/40 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">{alt.label}</span>
                    {isRec && (
                      <span className="text-[10px] font-black bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <Sparkles className="w-3 h-3" /> BEST RECOVERY
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    alt.transfer_risk === 'Low' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    alt.transfer_risk === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {alt.transfer_risk} Transfer Risk
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium mb-3">
                  {alt.strategy}
                </p>

                {/* Key Metrics Pill Grid */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] mb-3">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 block uppercase">ETA</span>
                    <span className="font-bold text-white">{alt.estimated_arrival}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 block uppercase">Walk</span>
                    <span className="font-bold text-slate-200">{alt.walking_time_min}m</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 block uppercase">Wait</span>
                    <span className="font-bold text-amber-400">{alt.waiting_min}m</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 block uppercase">Friction</span>
                    <span className={`font-black ${alt.mobility_friction_index < 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {alt.mobility_friction_index}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectAlternative(alt)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  isRec
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <span>Switch to {alt.label.split(':')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
