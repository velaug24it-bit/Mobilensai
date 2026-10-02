import React from 'react';
import { Sparkles, AlertTriangle, ArrowRight, Lightbulb, CheckCircle, ArrowUpRight } from 'lucide-react';
import { PrimaryBottleneck } from '../types';

interface AIBottleneckCardProps {
  bottleneck: PrimaryBottleneck;
  onSimulateIntervention: () => void;
}

export const AIBottleneckCard: React.FC<AIBottleneckCardProps> = ({
  bottleneck,
  onSimulateIntervention
}) => {
  return (
    <div className="bg-gradient-to-br from-[#111827] via-[#151D30] to-[#111827] border-2 border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              AI Journey Insight
            </span>
            <h3 className="text-base font-bold text-white">Primary Bottleneck Detected</h3>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          {bottleneck.confidence}
        </span>
      </div>

      {/* Main insight headline */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <p className="text-sm font-medium text-slate-200 leading-relaxed">
          <span className="text-rose-400 font-bold">"{bottleneck.title}": </span>
          {bottleneck.insight}
        </p>
      </div>

      {/* Bottleneck parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-xl bg-[#1E293B]/50 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Critical Location</span>
          <p className="text-xs font-bold text-white mt-1 truncate">{bottleneck.location}</p>
        </div>

        <div className="p-3 rounded-xl bg-[#1E293B]/50 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Affected Segment</span>
          <p className="text-xs font-bold text-cyan-300 mt-1 truncate">{bottleneck.affectedSegment}</p>
        </div>

        <div className="p-3 rounded-xl bg-[#1E293B]/50 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Current Wait</span>
          <p className="text-sm font-mono font-bold text-rose-400 mt-1">
            {bottleneck.currentWaitMinutes} min
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#1E293B]/50 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Excess Above Norm</span>
          <p className="text-sm font-mono font-bold text-rose-400 mt-1">
            +{bottleneck.excessWaitMinutes} min <span className="text-[10px] text-slate-400">(Norm: {bottleneck.expectedWaitMinutes}m)</span>
          </p>
        </div>
      </div>

      {/* Recommendation and Action */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Simulated Recommendation
            </span>
            <p className="text-xs text-slate-300 mt-0.5">
              {bottleneck.recommendation}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSimulateIntervention}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 flex-shrink-0"
        >
          <span>Simulate Intervention</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
