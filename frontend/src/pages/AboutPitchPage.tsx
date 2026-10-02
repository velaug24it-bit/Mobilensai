import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Footprints, 
  Bus, 
  Train, 
  Clock, 
  TrendingDown, 
  Layers, 
  Sliders, 
  ShieldCheck, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPitchPage: React.FC = () => {
  const { startHackathonDemo } = useApp();

  const steps = [
    { num: '01', title: 'Capture Journey', desc: 'Ingest multi-modal trip traces, GPS signals, and simulated timetable schedules.' },
    { num: '02', title: 'Reconstruct Journey', desc: 'Deconstruct continuous trips into walking, waiting, transit, transfer, and dwell phases.' },
    { num: '03', title: 'Calculate Friction', desc: 'Compute component burdens: waiting, transfers, walking distance, fare cost, and accessibility.' },
    { num: '04', title: 'Find Bottleneck', desc: 'AI isolates the disproportionate delay chokepoint (e.g., the 19-minute missed transfer trap).' },
    { num: '05', title: 'Simulate Intervention', desc: 'Test policy interventions: schedule window synchronization, feeder shuttles, and station ramps.' },
    { num: '06', title: 'Measure Impact', desc: 'Quantify simulated friction reduction, reclaimed minutes, and affected daily rider counts.' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn py-4">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          The Hackathon Pitch & Philosophy
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          "See the journey <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">beyond the vehicle</span>."
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          "Transportation networks are usually measured through vehicles, routes and traffic. MobiLens measures the experience of the person travelling through that network."
        </p>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={startHackathonDemo}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Interactive Hackathon Demo</span>
          </button>
        </div>
      </div>

      {/* The Core Pitch Statement */}
      <div className="bg-[#111827] border-2 border-cyan-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider text-cyan-400">
            The Pitch
          </h2>
          <div className="space-y-4 mt-4 text-sm text-slate-200 leading-relaxed">
            <p>
              Most transportation systems ask:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 italic">
              <li>How fast are the vehicles moving?</li>
              <li>How congested are the roads?</li>
              <li>How many buses are operating?</li>
            </ul>
            <p className="font-semibold text-white">
              MobiLens asks a different question:
            </p>
            <blockquote className="pl-4 border-l-4 border-cyan-400 text-base font-bold text-cyan-300">
              "How difficult is it for a person to complete their journey?"
            </blockquote>
            <p>
              By reconstructing journeys and measuring waiting, transfers, walking, cost, and accessibility burdens, MobiLens identifies hidden mobility friction and allows planners to simulate potential interventions before spending millions on physical infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* Problem Section: Connected Infrastructure != Connected Journey */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">
            "Connected infrastructure does not always mean a connected journey."
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
            Both individuals below technically have access to public transportation, but their lived mobility reality is profoundly divergent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Person A */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400">PERSON A (Direct Transit Corridor)</span>
              <span className="text-xs font-mono font-bold text-emerald-400">25 Minutes</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-300 overflow-x-auto py-2">
              <span className="font-semibold text-white">HOME</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span>Walk (6m)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-emerald-400 font-bold">Bus (15m)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-white">COLLEGE</span>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Low friction: single reliable vehicle, minimal waiting, and shaded direct walking paths.
            </p>
          </div>

          {/* Person B */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/40 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-rose-400">PERSON B (Unsynchronized Interchange)</span>
              <span className="text-xs font-mono font-bold text-rose-400">58 Minutes</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-300 overflow-x-auto py-2">
              <span className="font-semibold text-white">HOME</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span>Walk</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span>Auto</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-rose-400 font-bold">Wait (19m)</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span>Bus</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span>Train</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="font-semibold text-white">COLLEGE</span>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              High friction: fragmented headways, multiple modal handoffs, and excessive platform waiting.
            </p>
          </div>
        </div>
      </div>

      {/* 6-Step Workflow */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider text-center mb-8">
          How MobiLens Works: The 6-Step Engine
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((st) => (
            <div key={st.num} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-2xl font-mono font-black text-cyan-400">{st.num}</span>
                <h4 className="text-base font-bold text-white mt-1">{st.title}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Data Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-500 text-center leading-relaxed">
        <strong>Important Hackathon Data Disclaimer:</strong> All friction indexes, population affected numbers, journey minutes, and financial/complexity ratings are simulated prototype estimates produced by our deterministic local analytical model. They do not constitute certified municipal municipal transit statistics.
      </div>
    </div>
  );
};
