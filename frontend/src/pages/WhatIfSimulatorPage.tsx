import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WhatIfParams } from '../types';

export const WhatIfSimulatorPage: React.FC = () => {
  const { whatIfParams, setWhatIfParams, whatIfResult, runWhatIfCalculation } = useApp();
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationStep, setCalculationStep] = useState('');

  const handleRunSimulation = () => {
    setIsCalculating(true);
    const steps = [
      'Analyzing multi-modal journeys...',
      'Isolating connection transfer bottlenecks...',
      'Simulating transit network frequency adjustments...',
      'Computing human friction composite index...',
      'Synthesizing final scenario delta...'
    ];

    steps.forEach((text, idx) => {
      setTimeout(() => {
        setCalculationStep(text);
      }, idx * 250);
    });

    setTimeout(() => {
      runWhatIfCalculation();
      setIsCalculating(false);
      setCalculationStep('');
    }, 1300);
  };

  const handleReset = () => {
    setWhatIfParams({
      busFrequencyPerHour: 4,
      trainFrequencyPerHour: 3,
      avgTransferWaitMinutes: 19,
      walkingConnectionMinutes: 20,
      feederAvailabilityPct: 20,
      scheduleSyncPct: 15,
      accessibilityLevelPct: 40
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Parametric Sandbox
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            What-If Mobility Simulator
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            "Change one part of the network and see how the journey could change." Test frequency, headway synchronization, and feeder levers in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Slider Panel */}
        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Transit Network Levers
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Real-time Parameters</span>
          </div>

          {/* Slider 1: Bus Frequency */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300">City Bus Frequency</span>
              <span className="text-cyan-400 font-mono">{whatIfParams.busFrequencyPerHour} buses/hour</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={whatIfParams.busFrequencyPerHour}
              onChange={(e) => setWhatIfParams(p => ({ ...p, busFrequencyPerHour: Number(e.target.value) }))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 bus/hr</span>
              <span>Headway: {Math.round(60 / whatIfParams.busFrequencyPerHour)}m</span>
              <span>20 buses/hr</span>
            </div>
          </div>

          {/* Slider 2: Train Frequency */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300">Suburban Train Frequency</span>
              <span className="text-cyan-400 font-mono">{whatIfParams.trainFrequencyPerHour} trains/hour</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={whatIfParams.trainFrequencyPerHour}
              onChange={(e) => setWhatIfParams(p => ({ ...p, trainFrequencyPerHour: Number(e.target.value) }))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 train/hr</span>
              <span>Headway: {Math.round(60 / whatIfParams.trainFrequencyPerHour)}m</span>
              <span>20 trains/hr</span>
            </div>
          </div>

          {/* Slider 3: Transfer Wait Buffer */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300">Baseline Transfer Wait Delay</span>
              <span className="text-rose-400 font-mono">{whatIfParams.avgTransferWaitMinutes} min</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={whatIfParams.avgTransferWaitMinutes}
              onChange={(e) => setWhatIfParams(p => ({ ...p, avgTransferWaitMinutes: Number(e.target.value) }))}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0 min (Instant)</span>
              <span>Current: 19m</span>
              <span>30 min</span>
            </div>
          </div>

          {/* Slider 4: Walking Connection */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300">Walking Connection Time</span>
              <span className="text-slate-300 font-mono">{whatIfParams.walkingConnectionMinutes} min</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={whatIfParams.walkingConnectionMinutes}
              onChange={(e) => setWhatIfParams(p => ({ ...p, walkingConnectionMinutes: Number(e.target.value) }))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Slider 5: Schedule Synchronization Lever */}
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-cyan-300">Schedule Synchronization</span>
              <span className="text-cyan-400 font-mono">{whatIfParams.scheduleSyncPct}% Synced</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={whatIfParams.scheduleSyncPct}
              onChange={(e) => setWhatIfParams(p => ({ ...p, scheduleSyncPct: Number(e.target.value) }))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              High synchronization closes arrival-to-departure windows and prevents missed rail transfers.
            </p>
          </div>

          {/* Slider 6: Feeder Availability & Toggle */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300">Feeder Shuttle Availability</span>
              <span className="text-emerald-400 font-mono">{whatIfParams.feederAvailabilityPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={whatIfParams.feederAvailabilityPct}
              onChange={(e) => setWhatIfParams(p => ({ ...p, feederAvailabilityPct: Number(e.target.value) }))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Slider 7: Accessibility Level */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300">Station Accessibility (Ramps/Lifts)</span>
              <span className="text-purple-400 font-mono">{whatIfParams.accessibilityLevelPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={whatIfParams.accessibilityLevelPct}
              onChange={(e) => setWhatIfParams(p => ({ ...p, accessibilityLevelPct: Number(e.target.value) }))}
              className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Infrastructure Discrete Toggles (Section 21) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase text-cyan-400 block tracking-wider">
              Physical & Timetable Policy Toggles
            </span>

            {/* Toggle 1: Bus Stop Location */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-200 font-bold block">Bus Stop Location</span>
                <span className="text-[10px] text-slate-400">Current Bay vs Relocated Closer to Rail Concourse</span>
              </div>
              <button
                type="button"
                onClick={() => setWhatIfParams(p => ({
                  ...p,
                  walkingConnectionMinutes: p.walkingConnectionMinutes <= 8 ? 20 : 6
                }))}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors border ${
                  whatIfParams.walkingConnectionMinutes <= 8
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {whatIfParams.walkingConnectionMinutes <= 8 ? '✓ Concourse Ramp (-14m)' : 'Current Highway Shoulder'}
              </button>
            </div>

            {/* Toggle 2: Protected Crossing */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-200 font-bold block">Protected Pedestrian Crossing</span>
                <span className="text-[10px] text-slate-400">Raised zebra crossing & pedestrian green phase</span>
              </div>
              <button
                type="button"
                onClick={() => setWhatIfParams(p => ({
                  ...p,
                  accessibilityLevelPct: p.accessibilityLevelPct >= 80 ? 40 : 90
                }))}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors border ${
                  whatIfParams.accessibilityLevelPct >= 80
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {whatIfParams.accessibilityLevelPct >= 80 ? '✓ Protected Signal' : 'No Signal (Unprotected)'}
              </button>
            </div>

            {/* Toggle 3: Schedule Synchronization */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-200 font-bold block">Timetable Synchronization</span>
                <span className="text-[10px] text-slate-400">Bus arrival retimed by 6m to meet train window</span>
              </div>
              <button
                type="button"
                onClick={() => setWhatIfParams(p => ({
                  ...p,
                  scheduleSyncPct: p.scheduleSyncPct >= 70 ? 15 : 95,
                  avgTransferWaitMinutes: p.scheduleSyncPct >= 70 ? 19 : 4
                }))}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors border ${
                  whatIfParams.scheduleSyncPct >= 70
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {whatIfParams.scheduleSyncPct >= 70 ? '✓ SYNCED (ON)' : 'UNSYNCHRONIZED (OFF)'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={isCalculating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Simulating Network Dynamics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>RUN WHAT-IF SIMULATION</span>
              </>
            )}
          </button>
        </div>


        {/* Results Output Panel */}
        <div className="lg:col-span-6 space-y-6">
          {/* Animated step display if calculating */}
          {isCalculating && (
            <div className="bg-[#111827] border border-cyan-500/40 rounded-3xl p-8 text-center animate-pulse">
              <Activity className="w-8 h-8 text-cyan-400 mx-auto animate-spin" />
              <h4 className="text-sm font-bold text-white mt-3">{calculationStep}</h4>
              <p className="text-xs text-slate-400 mt-1">Executing deterministic mobility equations</p>
            </div>
          )}

          {/* Results Comparison Box */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Scenario Output Matrix
                </span>
                <h3 className="text-lg font-bold text-white">Simulated Network Impact</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Active Scenario
              </span>
            </div>

            {/* Current vs Simulated Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* CURRENT */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30">
                <span className="text-xs font-bold uppercase text-slate-400">Baseline Journey</span>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400">Average Duration</span>
                    <div className="text-2xl font-mono font-bold text-white">
                      {whatIfResult.baselineJourneyMin} min
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Mobility Friction</span>
                    <div className="text-2xl font-mono font-bold text-rose-400">
                      {whatIfResult.baselineFriction}/100
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Transfer Wait</span>
                    <div className="text-xl font-mono font-bold text-rose-400">
                      {whatIfResult.baselineWaitMin} min
                    </div>
                  </div>
                </div>
              </div>

              {/* AFTER SIMULATION */}
              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 glow-cyan">
                <span className="text-xs font-bold uppercase text-emerald-400">After Simulation</span>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-300">Average Duration</span>
                    <div className="text-2xl font-mono font-bold text-emerald-400">
                      {whatIfResult.simulatedJourneyMin} min
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-300">Mobility Friction</span>
                    <div className="text-2xl font-mono font-bold text-emerald-400">
                      {whatIfResult.simulatedFriction}/100
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-300">Transfer Wait</span>
                    <div className="text-xl font-mono font-bold text-emerald-400">
                      {whatIfResult.simulatedWaitMin} min
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Change Delta Highlights */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Journey Delta</span>
                <div className="text-xl font-mono font-black text-cyan-300 mt-1">
                  {whatIfResult.journeyDeltaMin} min
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Friction Delta</span>
                <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                  {whatIfResult.frictionDeltaPoints} pts
                </div>
              </div>
            </div>

            {/* Key Drivers Identified */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-300">Key Simulation Drivers:</span>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                {whatIfResult.keyDrivers.map((driver, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800/80 text-center text-[10px] text-slate-500 italic">
              "Simulated scenario — not a real-world prediction."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
