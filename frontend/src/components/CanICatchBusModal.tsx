import React from 'react';
import { CatchabilityResult, TransitVehicle, TransitStop } from '../services/api';
import { AlertCircle, CheckCircle2, Clock, Footprints, ShieldAlert, Sparkles, X, ArrowRight, Umbrella } from 'lucide-react';

interface CanICatchBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CatchabilityResult | null;
  loading: boolean;
  vehicle: TransitVehicle | null;
  stop: TransitStop | null;
  userMode: string;
  onSelectNextBus?: (busInfo: any) => void;
}

export const CanICatchBusModal: React.FC<CanICatchBusModalProps> = ({
  isOpen,
  onClose,
  result,
  loading,
  vehicle,
  stop,
  userMode,
  onSelectNextBus
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-white overflow-hidden">
        {/* Background glow according to risk */}
        {result && (
          <div 
            className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
              result.verdict === 'HIGH CHANCE' ? 'bg-emerald-500' :
              result.verdict === 'TIGHT BUFFER' ? 'bg-amber-500' : 'bg-rose-500'
            }`} 
          />
        )}

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Can I Catch This Bus?
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-normal">
                  Transparent Arithmetic
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Target: {vehicle ? `Bus ${vehicle.route_short_name} (${vehicle.vehicle_id})` : 'Selected Bus'} at {stop?.stop_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-cyan-300">Calculating walk distance & transit ETA...</p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Main Verdict Card */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 ${
              result.verdict === 'HIGH CHANCE' 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                : result.verdict === 'TIGHT BUFFER'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}>
              <div className="p-3 rounded-xl bg-slate-900/60 shadow">
                {result.verdict === 'HIGH CHANCE' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : result.verdict === 'TIGHT BUFFER' ? (
                  <Clock className="w-8 h-8 text-amber-400" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-rose-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full tracking-wider uppercase ${
                    result.verdict === 'HIGH CHANCE' ? 'bg-emerald-500 text-slate-950' :
                    result.verdict === 'TIGHT BUFFER' ? 'bg-amber-400 text-slate-950' :
                    'bg-rose-500 text-white'
                  }`}>
                    {result.verdict}
                  </span>
                  <span className="text-xs text-slate-400">
                    Buffer: <strong className="text-white">{result.buffer_min > 0 ? `+${result.buffer_min}` : result.buffer_min} min</strong>
                  </span>
                </div>
                <p className="text-sm font-bold text-white mt-1">
                  {result.explanation}
                </p>
              </div>
            </div>

            {/* Step-by-Step Transparent Calculation Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5">
              <div className="font-bold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span>MATHEMATICAL BREAKDOWN</span>
                <span className="text-[10px] text-cyan-400 font-mono">Real-time Haversine + Pace</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Walking Distance</span>
                  <span className="font-bold text-white text-sm">{result.user_walking_distance_m} m</span>
                  <span className="text-[10px] text-slate-500 block">To {stop?.stop_name}</span>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Your Walking Time</span>
                  <span className="font-bold text-amber-300 text-sm">{result.user_walking_time_min} minutes</span>
                  <span className="text-[10px] text-slate-500 block">Pace: {result.calculation_breakdown.walking_speed_kmh} km/h ({userMode})</span>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Bus Current ETA</span>
                  <span className="font-bold text-cyan-300 text-sm">{result.bus_eta_min} minutes</span>
                  <span className="text-[10px] text-slate-500 block">Route {vehicle?.route_short_name}</span>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Safety Margin Buffer</span>
                  <span className={`font-bold text-sm ${result.buffer_min >= 2 ? 'text-emerald-400' : result.buffer_min >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {result.buffer_min} minutes
                  </span>
                  <span className="text-[10px] text-slate-500 block">ETA - Walk Time</span>
                </div>
              </div>

              {/* Weather factor adjustment notice */}
              {result.calculation_breakdown.weather_multiplier > 1.0 && (
                <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-500/30 text-[11px]">
                  <Umbrella className="w-3.5 h-3.5" />
                  <span>Weather Friction adjustment applied: +{Math.round((result.calculation_breakdown.weather_multiplier - 1) * 100)}% walking time delay due to rain/heat exposure.</span>
                </div>
              )}
            </div>

            {/* Next Available Bus Fallback (If tight or missed) */}
            {result.next_available_bus && (
              <div className="bg-gradient-to-r from-slate-800/90 to-slate-900 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Next Guaranteed Service</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="bg-cyan-500 text-slate-950 text-xs font-black px-1.5 py-0.5 rounded">
                      Bus {result.next_available_bus.route}
                    </span>
                    <span className="text-xs text-white font-bold">
                      Arrives in <strong className="text-cyan-400">{result.next_available_bus.eta_min} min</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Headsign: {result.next_available_bus.headsign}</span>
                </div>
                {onSelectNextBus && (
                  <button
                    onClick={() => {
                      onSelectNextBus(result.next_available_bus);
                      onClose();
                    }}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <span>Catch Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-500 text-center">
              🟡 Prototype calculation based on simulated transit feed and average walking pace. Real conditions (signals, road crossing) may vary.
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No calculation data available.</p>
        )}

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
