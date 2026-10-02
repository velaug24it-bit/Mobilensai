import React from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  TrendingDown, 
  Clock, 
  Users, 
  Layers, 
  MapPin, 
  ShieldCheck, 
  Bus, 
  Train, 
  Footprints, 
  AlertTriangle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PresentationMode: React.FC = () => {
  const { 
    isPresentationMode, 
    setIsPresentationMode, 
    currentJourney, 
    afterJourney, 
    selectedIntervention 
  } = useApp();

  if (!isPresentationMode) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-[#070A11] text-slate-100 flex flex-col p-6 overflow-y-auto">
      {/* Presentation Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/30">
            ML
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>MOBILENS AI</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                EXECUTIVE PROJECTOR VIEW
              </span>
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Human-Centric Mobility Intelligence & Intervention Simulator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Hackathon Pitch Active
          </div>
          <button
            type="button"
            onClick={() => setIsPresentationMode(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid Presentation */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 my-6 flex-1">
        {/* Left Column: Side KPI Panel */}
        <div className="xl:col-span-1 space-y-4 flex flex-col justify-between">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">City Network Intelligence</span>
            <div className="space-y-4 mt-4">
              <div>
                <span className="text-xs text-slate-400">People Analyzed</span>
                <div className="text-3xl font-black font-mono text-white">18,420</div>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">Journeys Reconstructed</span>
                <div className="text-3xl font-black font-mono text-cyan-300">42,816</div>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">Avg Mobility Friction</span>
                <div className="text-3xl font-black font-mono text-amber-400">63 <span className="text-xs text-slate-400">/ 100</span></div>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">High-Friction Zones</span>
                <div className="text-3xl font-black font-mono text-rose-400">8 Hotspots</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#111827] to-[#1E293B] border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">The Problem Statement</span>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed italic">
              "We don't just measure how vehicles move. We measure how difficult it is for people to move."
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Buses and trains can look connected on a GIS map, while passengers experience 19 minutes of dead connection wait.
            </p>
          </div>
        </div>

        {/* Center/Right 3 Columns: Central Journey & Before vs After Comparison */}
        <div className="xl:col-span-3 space-y-6 flex flex-col justify-between">
          {/* Side by side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
            {/* Before Box */}
            <div className="bg-[#111827] border-2 border-rose-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                    <h3 className="font-extrabold text-white text-base">BEFORE: Sector 17 Transfer Bottleneck</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300">
                    Friction 78/100
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                    <span>First-Mile Walk</span>
                    <strong className="text-slate-300">12 min</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                    <span>City Bus #42 Transit</span>
                    <strong className="text-slate-300">22 min</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/50 flex justify-between text-rose-300 font-bold">
                    <span>Missed Train Platform Wait</span>
                    <span className="bg-rose-950 px-2 py-0.5 rounded">19 min ⚠</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Suburban Rail Transit</span>
                    <strong className="text-slate-300">20 min</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Campus Walk</span>
                    <strong className="text-slate-300">8 min</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Clock Time: <strong className="text-white">90 min</strong></span>
                <span className="text-slate-400">Wasted Wait: <strong className="text-rose-400">19 min</strong></span>
              </div>
            </div>

            {/* After Box */}
            <div className="bg-[#111827] border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <h3 className="font-extrabold text-white text-base">AFTER: AI Schedule Synchronization</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300">
                    Friction 46/100 (-43%)
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                    <span>First-Mile Walk</span>
                    <strong className="text-slate-300">12 min</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                    <span>City Bus #42 (Retimed 6m)</span>
                    <strong className="text-slate-300">22 min</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex justify-between text-emerald-300 font-bold">
                    <span>Synchronized Seamless Boarding</span>
                    <span className="bg-emerald-950 px-2 py-0.5 rounded">4 min wait ✓</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Suburban Rail Transit</span>
                    <strong className="text-slate-300">20 min</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Campus Walk</span>
                    <strong className="text-slate-300">8 min</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Clock Time: <strong className="text-emerald-400">75 min</strong> (-15 min)</span>
                <span className="text-slate-400">Reclaimed Wait: <strong className="text-emerald-400">4 min</strong> (-15m)</span>
              </div>
            </div>
          </div>

          {/* Bottom AI Insight Statement Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-teal-950/40 border border-cyan-500/30 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  AI Hackathon Verdict & Policy Insight
                </span>
                <p className="text-sm font-semibold text-slate-100 mt-1">
                  "Zone 17's primary simulated bottleneck is transfer waiting. Schedule synchronization produced the largest simulated friction reduction (-43%) in the current scenario while requiring zero civil capital expenditure."
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-xs text-slate-400">Implementation Complexity:</span>
              <div className="text-sm font-bold text-emerald-400">Low Complexity (Software/Timetable)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/60">
        MobiLens AI Prototype Demonstration • Built for Hackathon Excellence
      </div>
    </div>
  );
};
