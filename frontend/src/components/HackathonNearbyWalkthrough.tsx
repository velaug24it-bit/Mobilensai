import React, { useState } from 'react';
import { 
  X, 
  Play, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Footprints, 
  TrendingUp, 
  Bus, 
  Clock, 
  Pill, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface HackathonNearbyWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenarioStop?: (pharmacyName: string, extraMin: number, frictionDelta: number) => void;
}

export const HackathonNearbyWalkthrough: React.FC<HackathonNearbyWalkthroughProps> = ({
  isOpen,
  onClose,
  onApplyScenarioStop
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  if (!isOpen) return null;

  const totalSteps = 11;

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Hackathon Demo Flow: Transit + Essentials Decision</h3>
                <span className="text-[10px] font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live Bus • Journey Timing • Detour Friction • Real-Time Decision Support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mb-5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Dynamic Step Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {currentStep === 1 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Step 1: Commuter Journey Active</span>
              <h4 className="text-lg font-black text-white">User Embarks on Multi-modal Journey</h4>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>HOME ➔ BUS STOP ➔ BUS 12A ➔ TRAIN ➔ COLLEGE</span>
                <span className="text-emerald-400 font-bold">● Active Tracking</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The commuter starts Live Journey mode at Thoothukudi Airport / Vagaikulam Feeder Stop, en route to Francis Xavier Engineering College (FXEC).
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Step 2: Real-time Transit Telemetry</span>
              <h4 className="text-lg font-black text-white">Live Bus Arrival Feed</h4>
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Bus className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Bus 12A / Route 15</h5>
                    <span className="text-xs text-slate-400">Approaching Vagaikulam Feeder Platform</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">12 min</span>
                  <span className="text-[10px] text-slate-400 block">Live ETA</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                MobiLens tracks transit vehicles in real-time. The commuter has a 12-minute window at the bus stop.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Step 3: User Opens Nearby</span>
              <h4 className="text-lg font-black text-white">"What Essential Services Are Near Me?"</h4>
              <p className="text-xs text-slate-300">
                Instead of a generic directory, MobiLens recognizes context: the user is currently waiting at a bus platform with an active departure countdown.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs text-cyan-300">
                📍 Context Anchor Activated: <strong className="text-white">Near Vagaikulam Bus Platform</strong>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Step 4: Nearby Results Discovered</span>
              <h4 className="text-lg font-black text-white">Candidate Essential Services</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Pharmacy</span>
                  <p className="font-bold text-white mt-0.5">Apollo Pharmacy</p>
                  <span className="text-cyan-400 text-xs font-bold">180 m away</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">Restaurant</span>
                  <p className="font-bold text-white mt-0.5">Saravana Bhavan</p>
                  <span className="text-cyan-400 text-xs font-bold">250 m away</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Public Toilet</span>
                  <p className="font-bold text-white mt-0.5">TNSTC Restroom</p>
                  <span className="text-cyan-400 text-xs font-bold">300 m away</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-blue-500/30">
                  <span className="text-[10px] text-blue-400 font-bold uppercase">ATM</span>
                  <p className="font-bold text-white mt-0.5">SBI 24/7 ATM</p>
                  <span className="text-cyan-400 text-xs font-bold">350 m away</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Step 5: User Selects Apollo Pharmacy</span>
              <h4 className="text-lg font-black text-white">Target Stop Chosen: Medicine Purchase</h4>
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-bold text-white">Apollo Pharmacy — Vagaikulam</h5>
                  <span className="text-slate-400">180 meters • Step-free access</span>
                </div>
                <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Selected
                </span>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Step 6: "I Have Time" Feasibility Math</span>
              <h4 className="text-lg font-black text-white">Algorithm Dwell & Walk Calculation</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Walk To</span>
                  <strong className="text-white text-sm">3 min</strong>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Visit Dwell</span>
                  <strong className="text-white text-sm">5 min</strong>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Return Walk</span>
                  <strong className="text-white text-sm">3 min</strong>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Total Budget</span>
                  <strong className="text-cyan-400 text-sm">11 min</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Total: 11 min</strong> vs Bus ETA <strong>12 min</strong></span>
                </div>
                <span className="font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                  🟢 Likely Feasible
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                *MobiLens clearly states "Likely feasible" rather than "Guaranteed" to avoid false safety assumptions.
              </p>
            </div>
          )}

          {currentStep === 7 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Step 7: Commuter Adds Stop to Journey</span>
              <h4 className="text-lg font-black text-white">Dynamic Journey Re-planning</h4>
              <p className="text-xs text-slate-300">
                User taps <strong className="text-cyan-400 font-bold">"Add to Journey"</strong>. The multi-modal sequence updates to include the pharmacy stop:
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
                HOME ➔ BUS STOP ➔ [PHARMACY] ➔ BUS 12A ➔ TRAIN ➔ COLLEGE
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Step 8: Mobility Friction Engine Recalculation</span>
              <h4 className="text-lg font-black text-white">Friction Score & Duration Impact</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Journey Duration</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-slate-400 line-through">45 min</span>
                    <span className="text-lg font-black text-amber-400">56 min</span>
                    <span className="text-[10px] text-amber-400">(+11m)</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Mobility Friction Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-slate-400 line-through">48</span>
                    <span className="text-lg font-black text-rose-400">57 /100</span>
                    <span className="text-[10px] text-rose-400">(+9 pts)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-rose-400 tracking-wider">Step 9: Transfer Risk Warning Triggered</span>
              <h4 className="text-lg font-black text-white">Downstream Buffer Compromised</h4>
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-bold mb-0.5">⚠️ Downstream Connection Threatened</strong>
                  <span>Adding this 11-minute detour reduces your train connection buffer at Tirunelveli Junction from 8 min to 2 min. Any traffic slowdown on NH 138 may cause a missed connection.</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 10 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Step 10: Smart Alternative Recommended</span>
              <h4 className="text-lg font-black text-white">MobiLens Identifies Lower-Friction Alternative</h4>
              <p className="text-xs text-slate-300">
                MobiLens analyzes pharmacies along the entire journey path and finds one directly at the destination gate:
              </p>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-white">Thulasi Pharmacy (Vannarpettai Bypass)</h5>
                  <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Recommended Alternative
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 text-[11px] pt-1">
                  <span>Location: <strong className="text-slate-200">At FXEC Campus Gate</strong></span>
                  <span>Extra Detour: <strong className="text-emerald-400">+4 min (vs +11m)</strong></span>
                  <span>Friction Impact: <strong className="text-emerald-400">+2 pts (vs +9)</strong></span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 11 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">Step 11: Optimized Commute Decision</span>
              <h4 className="text-lg font-black text-white">Seamless Human-Centric Decision Achieved!</h4>
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/50 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>The user boards Bus 12A on time with zero platform anxiety.</span>
                </div>
                <p className="text-slate-300 pl-7">
                  Medicine purchase is rescheduled seamlessly at the destination gate (FXEC North Arch) without risking the Tirunelveli Junction train transfer.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Decision Pillars Demonstrated:</span>
                <span className="text-cyan-400 font-bold">Live Bus + Nearby Services + Detour Friction + Transfer Risk</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-bold py-2 px-3.5 rounded-xl border border-slate-700 transition-colors"
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onApplyScenarioStop) onApplyScenarioStop('Thulasi Pharmacy', 4, 2);
                  onClose();
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
              >
                <span>Apply Scenario to Journey</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
