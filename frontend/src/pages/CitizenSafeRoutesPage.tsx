import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Footprints, 
  Coins, 
  CheckCircle2, 
  Layers, 
  Zap,
  TrendingDown
} from 'lucide-react';
import { SAFE_ROUTE_OPTIONS } from '../data/mockData';
import { RouteOption } from '../types';

export const CitizenSafeRoutesPage: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption>(SAFE_ROUTE_OPTIONS[0]); // Route B default
  const [activePreference, setActivePreference] = useState('Lowest friction');

  const preferences = ['Fastest', 'Lowest friction', 'Lowest walking', 'Lowest cost', 'Most accessible'];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            Citizen Route Advisory
          </span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mt-1">
          Citizen Safe & Low-Friction Routes
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Trade off pure travel velocity against human cognitive and physical stress. Discover why a route that takes 5 minutes longer can be 50% less stressful.
        </p>
      </div>

      {/* Query Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Corridor</span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>City Technology Institute (College)</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span>Suburban Railway Station</span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex flex-wrap items-center gap-1.5">
            {preferences.map((pref) => (
              <button
                key={pref}
                type="button"
                onClick={() => setActivePreference(pref)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePreference === pref
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SAFE_ROUTE_OPTIONS.map((route) => {
          const isSelected = selectedRoute.id === route.id;
          const isRec = route.isRecommended;

          return (
            <div
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-gradient-to-b from-[#152035] to-[#111827] border-cyan-400 shadow-2xl ring-2 ring-cyan-400/40 scale-102'
                  : 'bg-[#111827] border-slate-800 hover:border-slate-700'
              }`}
            >
              {isRec && (
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {route.tag}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-[11px] font-mono text-slate-400">{route.accessibilityRating}</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                    route.frictionScore > 50 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    Friction: {route.frictionScore}/100
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3">{route.name}</h3>

                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400">Duration</span>
                    <div className="text-lg font-mono font-bold text-white mt-0.5">
                      {route.durationMinutes} min
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400">Walk Exertion</span>
                    <div className="text-lg font-mono font-bold text-slate-300 mt-0.5">
                      {route.walkingKm} km
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {route.summary}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-bold">₹{route.costInr} Fare</span>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Choose Route'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tradeoff Explanation Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#111827] to-slate-900 border border-cyan-500/30 flex items-center gap-4">
        <Zap className="w-8 h-8 text-cyan-400 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-white">The MobiLens Tradeoff Principle</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            "Route B adds 5 minutes of total duration, but reduces simulated mobility friction by 19 points by eliminating two frantic staircase transfers and unshaded walkways."
          </p>
        </div>
      </div>
    </div>
  );
};
