import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Activity, 
  Sliders, 
  Accessibility, 
  Tv, 
  ArrowRight,
  TrendingDown,
  Radio,
  ShieldAlert,
  Footprints,
  AlertTriangle,
  GitCompare,
  Layers,
  Clock
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { CANONICAL_61MIN_JOURNEY } from '../data/mockData';

export const HackathonDemoModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isHackathonDemoRunning,
    hackathonStep,
    nextHackathonStep,
    prevHackathonStep,
    stopHackathonDemo,
    setIsPresentationMode,
    setCurrentJourney
  } = useApp();

  if (!isHackathonDemoRunning) return null;

  // Exact 18-step Hackathon Golden Scenario (Prompt Section 34)
  const steps = [
    {
      step: 1,
      badge: 'Step 1 of 18 — Human Journey Creation',
      title: 'Create Multimodal Citizen Journey',
      description: 'The user creates a multi-modal journey: HOME ➔ WALK ➔ BUS STOP ➔ BUS 12A ➔ TRAIN ➔ WALK ➔ COLLEGE. MobiLens reconstructs the complete lived experience.',
      icon: Activity,
      stat: 'Door-to-Door Journey Initialized',
      page: '/my-journey',
      actionLabel: 'Go to Journey Creator'
    },
    {
      step: 2,
      badge: 'Step 2 of 18 — Friction & Burden Decomposition',
      title: 'MobiLens Calculates: 61 min, Friction 72/100',
      description: 'Journey Metrics: Total: 61 min | Walking: 12 min | Transit: 34 min | Waiting: 15 min | Transfers: 2 | Cost: ₹35. Prototype Mobility Friction Index: 72/100 (Waiting +18, Walking +14, Transfers +12, Reliability +10, Risk +8, Cost +5, Other +5).',
      icon: TrendingDown,
      stat: 'Friction: 72/100 (Prototype Index)',
      page: '/analyzer',
      actionLabel: 'Inspect in Analyzer'
    },
    {
      step: 3,
      badge: 'Step 3 of 18 — Live Journey Mode',
      title: 'Start Live Journey Mode',
      description: 'The user initiates the journey. MobiLens activates dynamic stage tracking: HOME (✓ Completed) ➔ WALK TO STOP (✓ Completed) ➔ BUS STOP (🟢 Waiting) ➔ BUS 12A (ETA 5 min) ➔ TRAIN (Departure 08:32) ➔ COLLEGE (Expected 08:54).',
      icon: Radio,
      stat: 'Live GPS Tracking Active',
      page: '/live-journey',
      actionLabel: 'Launch Live Journey'
    },
    {
      step: 4,
      badge: 'Step 4 of 18 — Live Transit Map',
      title: 'Show Bus 12A Moving on the Map',
      description: 'Bus 12A (Vehicle 12A-104) is 1.4 km away at RS Puram, next stop Gandhipuram, ETA 5 min, status: On Time. Moving in real-time along predefined route geometry.',
      icon: MapPin,
      stat: 'Bus 12A: 1.4 km away • ETA 5m',
      page: '/live-journey',
      actionLabel: 'View on Live Map'
    },
    {
      step: 5,
      badge: 'Step 5 of 18 — Catchability Engine',
      title: 'User Clicks "Can I Catch This Bus?"',
      description: 'MobiLens executes transparent arithmetic: Walking distance (520m) at 80m/min pace requires 6.5 min (~7 min) vs. Bus ETA of 5 min. Available safety buffer: -2 minutes.',
      icon: Footprints,
      stat: 'Walk Time: 7m vs Bus ETA: 5m',
      page: '/live-journey',
      actionLabel: 'Open Catchability Modal'
    },
    {
      step: 6,
      badge: 'Step 6 of 18 — Catchability Verdict',
      title: 'System Flags: ⚠️ High Catch Risk',
      description: '"You may miss this bus." MobiLens immediately presents the next scheduled bus on Route 12A (ETA 17 min) so the commuter does not run into live traffic in vain.',
      icon: AlertTriangle,
      stat: '⚠️ HIGH CATCH RISK — Next Bus: 17m',
      page: '/live-journey',
      actionLabel: 'Review Next Bus'
    },
    {
      step: 7,
      badge: 'Step 7 of 18 — Transit Disruption',
      title: 'Simulated Bus Delay Occurs (+6 Min)',
      description: 'Traffic congestion delays Bus 12A: Arrival pushes from 08:20 AM to 08:26 AM. The vehicle status turns amber/red on the map.',
      icon: Clock,
      stat: 'Bus Arrival: 08:20 ➔ 08:26 AM',
      page: '/live-journey',
      actionLabel: 'Trigger Simulation Delay'
    },
    {
      step: 8,
      badge: 'Step 8 of 18 — Connection Threat',
      title: 'Transfer Risk Changes: LOW ➔ HIGH',
      description: 'The connecting suburban train departs at 08:30 AM. With 5-min transfer walk required, the passenger will arrive at the platform at 08:31 AM — missing the train by 1 minute! Transfer buffer becomes negative.',
      icon: ShieldAlert,
      stat: '🔴 HIGH TRANSFER RISK — Missed Train',
      page: '/live-journey',
      actionLabel: 'Inspect Transfer Risk'
    },
    {
      step: 9,
      badge: 'Step 9 of 18 — Dynamic Recalculation',
      title: 'MobiLens Recalculates Entire Journey',
      description: 'Rather than just moving a vehicle dot, MobiLens dynamically updates the entire human journey: ETA extends to 09:22 AM, dead waiting increases, and friction spikes from 72 to 86.',
      icon: TrendingDown,
      stat: 'Friction Spikes: 72 ➔ 86 (+14 pts)',
      page: '/live-journey',
      actionLabel: 'See Recalculation'
    },
    {
      step: 10,
      badge: 'Step 10 of 18 — Disruption Recovery',
      title: 'Alternative Transit Options Presented',
      description: 'MobiLens immediately computes 4 recovery choices: Option B (Rapid Bypass Shuttle) or Option C (Campus EV Feeder) restores the connection and saves 18 minutes.',
      icon: Sparkles,
      stat: '4 Recovery Alternatives Ready',
      page: '/live-journey',
      actionLabel: 'View Alternatives'
    },
    {
      step: 11,
      badge: 'Step 11 of 18 — Road Safety Intelligence',
      title: 'Road Risk Layer Reveals Walking Danger',
      description: 'Opening the Mobility Risk Map reveals that the passenger transfer path crosses Zone 17 — an elevated risk corridor (Score 84) with 23 observed near-miss conflicts and severe pedestrian exposure.',
      icon: ShieldAlert,
      stat: 'Zone 17: Elevated Road Risk (84/100)',
      page: '/risk-map',
      actionLabel: 'Open Mobility Risk Map'
    },
    {
      step: 12,
      badge: 'Step 12 of 18 — Multi-Objective Trade-Off',
      title: 'MobiLens Presents Safer Alternative Route',
      description: 'Compare Route A (Fastest: 32m, walk 8m, friction 58, risk Elevated) vs Route B (Safer: 36m, walk 11m, friction 44, risk Lower via covered footbridge). Trade-offs shown transparently.',
      icon: GitCompare,
      stat: 'Route B: 44 Friction • Lower Risk',
      page: '/analyzer',
      actionLabel: 'Open Route Comparison'
    },
    {
      step: 13,
      badge: 'Step 13 of 18 — Commuter Selection',
      title: 'User Confirms Safer Route Choice',
      description: 'The user selects Route B. Walking an extra 2 minutes over the sheltered station overpass bypasses the arterial road hazard and reduces overall friction.',
      icon: CheckCircle2,
      stat: 'Route B Active • Commuter Safe',
      page: '/live-journey',
      actionLabel: 'Return to Live Journey'
    },
    {
      step: 14,
      badge: 'Step 14 of 18 — City Planner View',
      title: 'City Planner Inspects the Same Corridor',
      description: 'The planner opens City Intelligence for Zone 17: 4,210 daily commuters affected, average wait 19 min, 23 observed near-misses during the 08:00–09:00 AM rush.',
      icon: Layers,
      stat: '4,210 Commuters Trapped Daily',
      page: '/city-intelligence',
      actionLabel: 'Switch to City Planner'
    },
    {
      step: 15,
      badge: 'Step 15 of 18 — AI Bottleneck Detection',
      title: 'AI Pinpoints Systemic Bottleneck',
      description: 'The AI isolates the core flaw: Unsynchronized bus-train arrival window combined with pedestrian-vehicle trajectory crossing conflicts near Bus Bay 3.',
      icon: Sparkles,
      stat: 'Pinch Point: Bus Alighting ➔ Rail Gate',
      page: '/interventions',
      actionLabel: 'View AI Recommendation'
    },
    {
      step: 16,
      badge: 'Step 16 of 18 — What-If Simulator',
      title: 'Planner Opens What-If Sandbox',
      description: 'The planner adjusts policy sliders: Bus headway 10m ➔ 7m, Schedule synchronization OFF ➔ ON, and Protected pedestrian crossing No ➔ Yes.',
      icon: Sliders,
      stat: 'Parametric City Simulation Mode',
      page: '/simulator',
      actionLabel: 'Open What-If Simulator'
    },
    {
      step: 17,
      badge: 'Step 17 of 18 — Intervention Simulation',
      title: 'Simulate Schedule Sync + Protected Crossing',
      description: 'The simulation runs deterministically: Retiming Bus 12A arrival by 6 minutes and adding a raised signalized zebra crossing eliminates the 15-minute wait and cuts pedestrian risk by 80%.',
      icon: Activity,
      stat: 'Simulated Scenario — Deterministic Engine',
      page: '/simulator',
      actionLabel: 'Run Simulation'
    },
    {
      step: 18,
      badge: 'Step 18 of 18 — Before vs After',
      title: 'Measuring Real Human Time Reclaimed',
      description: 'CURRENT: Journey 68 min, Friction 82, Wait 19 min, Risk Elevated ➔ SIMULATED: Journey 53 min (-15 min), Friction 46 (-43%), Wait 4 min, Risk Lower. 4,210 citizens reclaim 15 minutes every morning!',
      icon: CheckCircle2,
      stat: '15 Min Reclaimed per Citizen Daily!',
      page: '/interventions',
      actionLabel: 'View Before vs After'
    }
  ];

  const current = steps[hackathonStep - 1] || steps[0];
  const CurrentIcon = current.icon;

  const handleNext = () => {
    if (hackathonStep < steps.length) {
      nextHackathonStep();
      const nextStepObj = steps[hackathonStep];
      if (nextStepObj && nextStepObj.page) {
        navigate(nextStepObj.page);
      }
    } else {
      stopHackathonDemo();
      setIsPresentationMode(true);
    }
  };

  const handlePrev = () => {
    if (hackathonStep > 1) {
      prevHackathonStep();
      const prevStepObj = steps[hackathonStep - 2];
      if (prevStepObj && prevStepObj.page) {
        navigate(prevStepObj.page);
      }
    }
  };

  const handleJumpToPage = () => {
    if (current.page) {
      if (current.step <= 2) {
        setCurrentJourney(CANONICAL_61MIN_JOURNEY);
      }
      navigate(current.page);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0f172a] border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/20 relative overflow-hidden text-white">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={stopHackathonDemo}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Exit walkthrough"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
            <CurrentIcon className="w-3.5 h-3.5" />
            {current.badge}
          </span>
          <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
            🟡 DEMO SCENARIO
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {current.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          {current.description}
        </p>

        {/* Highlighted Metric Callout */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-200">{current.stat}</span>
          </div>

          <button
            type="button"
            onClick={handleJumpToPage}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 flex items-center gap-1"
          >
            <span>{current.actionLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Progress Bar (18 steps) */}
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Scenario Progress</span>
            <span>{hackathonStep} / {steps.length}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${(hackathonStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handlePrev}
            disabled={hackathonStep === 1}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleJumpToPage}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-colors"
            >
              Open Active Screen
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all transform hover:scale-105"
            >
              <span>{hackathonStep === steps.length ? 'Finish & Launch Pitch Mode' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
