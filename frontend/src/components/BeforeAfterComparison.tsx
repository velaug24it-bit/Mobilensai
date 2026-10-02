import React from 'react';
import { 
  ArrowRight, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Footprints, 
  Bus, 
  Train, 
  ArrowRightLeft,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Journey, InterventionOption } from '../types';

interface BeforeAfterProps {
  beforeJourney: Journey;
  afterJourney: Journey;
  intervention: InterventionOption;
}

export const BeforeAfterComparison: React.FC<BeforeAfterProps> = ({
  beforeJourney,
  afterJourney,
  intervention
}) => {
  const frictionSaved = beforeJourney.frictionScore - afterJourney.frictionScore;
  const timeSaved = beforeJourney.totalDurationMinutes - afterJourney.totalDurationMinutes;
  const waitSaved = beforeJourney.waitingDurationMinutes - afterJourney.waitingDurationMinutes;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06B6D4', '#14B8A6', '#10B981']
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Impact Summary Hero */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/50 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-widest">
                Intervention Applied
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Mode: {intervention.title}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Simulated Journey Transformation
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              By removing the unsynchronized transfer bottleneck, passenger delay drops dramatically without requiring costly physical infrastructure.
            </p>
          </div>

          <button
            type="button"
            onClick={triggerCelebration}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Celebrate Impact
          </button>
        </div>

        {/* 4 Large Before/After Delta Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-[#0B0F19]/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Mobility Friction</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg line-through text-slate-500 font-mono">{beforeJourney.frictionScore}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              <span className="text-3xl font-mono font-black text-emerald-400">{afterJourney.frictionScore}</span>
            </div>
            <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-{frictionSaved} points reduction</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19]/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Journey Time</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg line-through text-slate-500 font-mono">{beforeJourney.totalDurationMinutes}m</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
              <span className="text-3xl font-mono font-black text-cyan-300">{afterJourney.totalDurationMinutes}m</span>
            </div>
            <div className="mt-2 text-xs font-bold text-cyan-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-{timeSaved} min saved</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19]/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Transfer Waiting</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg line-through text-slate-500 font-mono">{beforeJourney.waitingDurationMinutes}m</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              <span className="text-3xl font-mono font-black text-emerald-400">{afterJourney.waitingDurationMinutes}m</span>
            </div>
            <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-{waitSaved} min wasted eliminated</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19]/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Affected Population</span>
            <div className="mt-2">
              <span className="text-3xl font-mono font-black text-purple-300">
                {intervention.affectedPopulationDaily.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 ml-1">daily riders</span>
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-400">
              {intervention.implementationCategory}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Visual Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BEFORE CONTAINER */}
        <div className="bg-[#111827] border border-rose-500/30 rounded-2xl p-6 shadow-xl relative">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <h3 className="font-extrabold text-white text-base">BEFORE INTERVENTION</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Friction {beforeJourney.frictionScore}/100
            </span>
          </div>

          <div className="space-y-3 mt-4">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Footprints className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">First-Mile Walk</span>
              </div>
              <span className="text-xs font-mono text-slate-400">12 min</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bus className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">City Bus #42 Transit</span>
              </div>
              <span className="text-xs font-mono text-slate-400">22 min</span>
            </div>

            {/* THE RED BOTTLENECK */}
            <div className="p-3 rounded-xl bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-between relative shadow-lg glow-red">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                <div>
                  <span className="text-xs font-bold text-white">Central Hub Missed Train Wait</span>
                  <p className="text-[10px] text-rose-300">Train departed 2 min before arrival</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/80 px-2 py-1 rounded">
                19 min wait ⚠
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200">Footbridge Transfer</span>
              </div>
              <span className="text-xs font-mono text-slate-400">7 min</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Train className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Suburban Rail Transit</span>
              </div>
              <span className="text-xs font-mono text-slate-400">20 min</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Footprints className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Last-Mile Walk to Campus</span>
              </div>
              <span className="text-xs font-mono text-slate-400">8 min</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between">
            <span>Total Journey: <strong className="text-white">{beforeJourney.totalDurationMinutes} min</strong></span>
            <span>Total Waiting: <strong className="text-rose-400">{beforeJourney.waitingDurationMinutes} min</strong></span>
          </div>
        </div>

        {/* AFTER CONTAINER */}
        <div className="bg-[#111827] border border-emerald-500/40 rounded-2xl p-6 shadow-xl relative glow-cyan">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <h3 className="font-extrabold text-white text-base">AFTER INTERVENTION</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Friction {afterJourney.frictionScore}/100
            </span>
          </div>

          <div className="space-y-3 mt-4">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Footprints className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">First-Mile Walk</span>
              </div>
              <span className="text-xs font-mono text-slate-400">12 min</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bus className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">City Bus #42 Transit (Retimed)</span>
              </div>
              <span className="text-xs font-mono text-slate-400">22 min</span>
            </div>

            {/* RESOLVED BOTTLENECK */}
            <div className="p-3 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-between relative shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-white">Synchronized Direct Rail Boarding</span>
                  <p className="text-[10px] text-emerald-300">Seamless timetable window alignment</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-1 rounded">
                4 min wait ✓
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">Level Transfer Corridor</span>
              </div>
              <span className="text-xs font-mono text-slate-400">5 min</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Train className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Suburban Rail Transit</span>
              </div>
              <span className="text-xs font-mono text-slate-400">20 min</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Footprints className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Last-Mile Walk to Campus</span>
              </div>
              <span className="text-xs font-mono text-slate-400">8 min</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between">
            <span>Total Journey: <strong className="text-emerald-400">{afterJourney.totalDurationMinutes} min</strong> (-{timeSaved}m)</span>
            <span>Total Waiting: <strong className="text-emerald-400">{afterJourney.waitingDurationMinutes} min</strong> (-{waitSaved}m)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
