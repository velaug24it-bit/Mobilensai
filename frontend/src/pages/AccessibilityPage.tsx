import React, { useState } from 'react';
import { 
  Accessibility, 
  User, 
  HeartHandshake, 
  Baby, 
  EyeOff, 
  Clock, 
  Footprints, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ACCESSIBILITY_PROFILES } from '../data/mockData';
import { AccessibilityProfile } from '../types';

export const AccessibilityPage: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<AccessibilityProfile>(ACCESSIBILITY_PROFILES[1]); // Wheelchair default

  const getIcon = (name: string) => {
    switch (name) {
      case 'User': return User;
      case 'Accessibility': return Accessibility;
      case 'HeartHandshake': return HeartHandshake;
      case 'Baby': return Baby;
      case 'EyeOff': return EyeOff;
      default: return User;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Inclusive Mobility Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Inclusive Mobility & Equity Analyzer
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Demonstrating that the exact same physical transit network creates radically disparate friction burdens depending on human physical ability.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
          Equity-Weighted Model
        </span>
      </div>

      {/* Persona Selection Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ACCESSIBILITY_PROFILES.map((prof) => {
          const Icon = getIcon(prof.iconName);
          const isSelected = selectedProfile.id === prof.id;

          return (
            <button
              key={prof.id}
              type="button"
              onClick={() => setSelectedProfile(prof)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-lg scale-102 ring-1 ring-cyan-400'
                  : 'bg-[#111827] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-mono font-bold ${
                  prof.accessibilityFriction > 60 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {prof.accessibilityFriction}/100
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-3">{prof.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{prof.persona}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Profile Detailed Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Burden Metrics */}
        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Persona Profile
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">{selectedProfile.name}</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              selectedProfile.accessibilityFriction > 60
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              Friction: {selectedProfile.accessibilityFriction}/100
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {selectedProfile.details}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Journey Duration
              </span>
              <div className="text-2xl font-mono font-bold text-white mt-1">
                {selectedProfile.journeyMinutes} min
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-blue-400" /> Walk Burden
              </span>
              <div className="text-2xl font-mono font-bold text-white mt-1">
                {selectedProfile.walkingBurdenKm} km
              </div>
            </div>
          </div>

          {/* Bottleneck alert for this profile */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase text-rose-400">
                  Critical Accessibility Bottleneck
                </span>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  {selectedProfile.bottleneckReason}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Alternative Accessible Routing */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#111827] via-[#141C30] to-[#111827] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">AI Accessible Alternative</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Recommended Divert
              </span>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Optimized Route Recommendation
              </span>
              <h4 className="text-base font-bold text-white mt-1">
                {selectedProfile.alternativeRouteName}
              </h4>
            </div>

            {/* Before vs Alternative Comparison */}
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Original Route</span>
                <div className="mt-2 text-sm text-slate-300">
                  Time: <strong className="text-rose-400 font-mono">{selectedProfile.journeyMinutes} min</strong>
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  Friction: <strong className="text-rose-400 font-mono">{selectedProfile.accessibilityFriction}</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Accessible Route</span>
                <div className="mt-2 text-sm text-slate-200">
                  Time: <strong className="text-emerald-400 font-mono">{selectedProfile.alternativeMinutes} min</strong>
                </div>
                <div className="mt-1 text-sm text-slate-200">
                  Friction: <strong className="text-emerald-400 font-mono">{selectedProfile.alternativeFriction}</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[#0B0F19]/60 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulated Impact:</span>
              </div>
              Bypasses the broken overbridge elevator at Station B and reroutes through Station C's ramped skywalk, saving {selectedProfile.journeyMinutes - selectedProfile.alternativeMinutes} minutes and reducing friction by {selectedProfile.accessibilityFriction - selectedProfile.alternativeFriction} points.
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 italic">
            * Inclusive mobility metrics are prototype simulation estimates.
          </div>
        </div>
      </div>
    </div>
  );
};
