import React from 'react';
import { TransitStop, StopArrival, TransitVehicle } from '../services/api';
import { Clock, Footprints, Sparkles, Navigation, Users, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

interface SmartBusStopPanelProps {
  stop: TransitStop | null;
  arrivals: StopArrival[];
  vehicles: TransitVehicle[];
  selectedBusId: string | null;
  onSelectBus: (arrival: StopArrival) => void;
  onCheckCatchability: (vehicle: TransitVehicle, stop: TransitStop) => void;
  onUseForJourney: (arrival: StopArrival) => void;
  isPlannedStop: boolean;
}

export const SmartBusStopPanel: React.FC<SmartBusStopPanelProps> = ({
  stop,
  arrivals,
  vehicles,
  selectedBusId,
  onSelectBus,
  onCheckCatchability,
  onUseForJourney,
  isPlannedStop
}) => {
  if (!stop) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <p className="text-sm font-semibold">Select any bus stop on the map to inspect live departures and accessibility details.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
              Smart Transit Stop
            </span>
            {isPlannedStop && (
              <span className="text-[10px] bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-700">
                Your Planned Stop
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-white mt-0.5">{stop.stop_name}</h3>
          <p className="text-xs text-slate-400">Zone: {stop.zone_id} • Shelter: {stop.shelter_type}</p>
        </div>

        {/* Accessibility Tag */}
        <div className="text-right">
          {stop.is_accessible ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 px-2 py-1 rounded-lg">
              <span>♿</span> Step-Free Access
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-1 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> High Curb (Assist Needed)
            </span>
          )}
        </div>
      </div>

      {/* Next Approaching Buses List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
            Approaching Buses ({arrivals.length})
          </span>
          <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
            🟡 Simulated Live Feed
          </span>
        </div>

        {arrivals.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center bg-slate-950/40 rounded-xl">
            No approaching buses detected on this corridor in the next 30 minutes.
          </p>
        ) : (
          <div className="space-y-2.5">
            {arrivals.map(arr => {
              const matchedVehicle = vehicles.find(v => v.vehicle_id === arr.vehicle_id);
              const isSelected = selectedBusId === arr.vehicle_id;

              return (
                <div
                  key={arr.vehicle_id}
                  onClick={() => onSelectBus(arr)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-cyan-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded shadow">
                        🚌 {arr.route_short_name}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          To {arr.headsign}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {arr.vehicle_id}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-amber-400 block">
                        {arr.eta_minutes} min
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {arr.distance_km} km away
                      </span>
                    </div>
                  </div>

                  {/* Crowding & Delay Row */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Crowding:</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                        arr.crowding === 'Low' ? 'bg-emerald-950 text-emerald-300' :
                        arr.crowding === 'Moderate' ? 'bg-amber-950 text-amber-300' :
                        'bg-rose-950 text-rose-300'
                      }`}>
                        {arr.crowding} (Est.)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {arr.delay_minutes > 0 ? (
                        <span className="text-rose-400 font-bold text-[10px]">
                          +{arr.delay_minutes}m Delay
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold text-[10px]">
                          On Schedule
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800/60">
                    {matchedVehicle && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCheckCatchability(matchedVehicle, stop);
                        }}
                        className="flex-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <Footprints className="w-3.5 h-3.5" />
                        Can I Catch It?
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUseForJourney(arr);
                      }}
                      className="flex-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all border border-slate-700"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Use for Journey
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
