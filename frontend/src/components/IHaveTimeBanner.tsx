import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { NearbyPlace } from '../types/places';

interface IHaveTimeBannerProps {
  busEtaMin: number;
  busRouteName: string;
  nearbyPlaces: NearbyPlace[];
  onSelectCategory: (cat: string) => void;
  onSelectPlace: (place: NearbyPlace) => void;
}

export const IHaveTimeBanner: React.FC<IHaveTimeBannerProps> = ({
  busEtaMin,
  busRouteName,
  nearbyPlaces,
  onSelectCategory,
  onSelectPlace
}) => {
  // Filter top feasible recommendations
  const feasiblePlaces = nearbyPlaces
    .filter(p => p.has_time_verdict === 'Likely feasible' && ['pharmacy', 'toilet', 'atm', 'food_water'].includes(p.category))
    .slice(0, 3);

  const tightOrRiskyPlaces = nearbyPlaces
    .filter(p => p.has_time_verdict === 'Not recommended' || p.has_time_verdict === 'Tight buffer')
    .slice(0, 1);

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/50 border border-cyan-500/40 shadow-xl text-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">"I Have Time" Smart Transit Advisor</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-800">
                {busRouteName} in ~{busEtaMin} min
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              You have approximately <strong className="text-white">{busEtaMin} minutes</strong> before your bus arrives at this platform.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 italic">
          *Walking feasibility estimated; timing is not guaranteed.
        </div>
      </div>

      {/* Recommended Feasible Nearby Stalls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {feasiblePlaces.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectPlace(p)}
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-800">
                {p.category_label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {p.distance_meters}m · ~{p.walking_minutes}m walk
              </span>
            </div>
            <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
              {p.name}
            </h5>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Likely feasible (~{p.time_window_minutes}m)</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
        ))}

        {tightOrRiskyPlaces.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectPlace(p)}
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-rose-500/30 opacity-80 hover:opacity-100 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-rose-400 bg-rose-950/70 px-1.5 py-0.2 rounded border border-rose-800">
                {p.category_label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {p.distance_meters}m
              </span>
            </div>
            <h5 className="text-xs font-bold text-white group-hover:text-rose-300 truncate">
              {p.name}
            </h5>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Not recommended (~{p.time_window_minutes}m)</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
