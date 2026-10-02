import React from 'react';
import { TransitVehicle, TransitStop } from '../services/api';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Footprints, 
  MapPin, 
  Radio, 
  Sparkles, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface LiveJourneyStatusCardProps {
  status: 'on_schedule' | 'tight' | 'disrupted';
  currentLocationName: string;
  activeVehicle: TransitVehicle | null;
  nearestStop: TransitStop | null;
  busEtaMin: number;
  expectedArrivalTime: string;
  frictionScore: number;
  transferRiskLevel: 'Low' | 'Moderate' | 'High';
  walkingRemainingMeters: number;
  delayMinutes: number;
  onSimulateDelay: () => void;
  onResetSimulation: () => void;
  onOpenCatchability: () => void;
}

export const LiveJourneyStatusCard: React.FC<LiveJourneyStatusCardProps> = ({
  status,
  currentLocationName,
  activeVehicle,
  nearestStop,
  busEtaMin,
  expectedArrivalTime,
  frictionScore,
  transferRiskLevel,
  walkingRemainingMeters,
  delayMinutes,
  onSimulateDelay,
  onResetSimulation,
  onOpenCatchability
}) => {
  const isDelayed = delayMinutes > 0 || status === 'disrupted';

  return (
    <div className={`w-full rounded-2xl border p-5 shadow-xl transition-all duration-300 backdrop-blur-md ${
      status === 'disrupted'
        ? 'bg-rose-950/25 border-rose-500/60 shadow-rose-950/40'
        : status === 'tight'
        ? 'bg-amber-950/25 border-amber-500/60 shadow-amber-950/40'
        : 'bg-slate-900/90 border-cyan-500/40 shadow-cyan-950/20'
    }`}>
      {/* Top Bar: Live Journey Header & Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-3.5 h-3.5 rounded-full ${
              status === 'disrupted' ? 'bg-rose-500 animate-ping' :
              status === 'tight' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
            }`}></div>
            <div className={`w-3.5 h-3.5 rounded-full absolute top-0 left-0 ${
              status === 'disrupted' ? 'bg-rose-500' :
              status === 'tight' ? 'bg-amber-400' : 'bg-emerald-400'
            }`}></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" /> LIVE JOURNEY MODE
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.2 rounded font-mono">
                Real-Time Tracking
              </span>
            </div>
            <h2 className="text-lg font-black text-white">
              {currentLocationName || 'Active Transit Corridor'}
            </h2>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow ${
            status === 'disrupted'
              ? 'bg-rose-500 text-white'
              : status === 'tight'
              ? 'bg-amber-400 text-slate-950'
              : 'bg-emerald-500 text-slate-950'
          }`}>
            {status === 'disrupted' ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ Journey Disruption
              </>
            ) : status === 'tight' ? (
              <>
                <Clock className="w-3.5 h-3.5" /> 🟡 Tight Connection
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> 🟢 On Schedule
              </>
            )}
          </span>

          {/* Simulate Delay & Reset Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={onSimulateDelay}
              title="Simulate a +6 min bus delay to test connection disruption and alternative recalculation"
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                isDelayed 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'bg-slate-700 hover:bg-slate-600 text-rose-300'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{isDelayed ? `Delayed (+${delayMinutes}m)` : 'Simulate Delay'}</span>
            </button>

            {isDelayed && (
              <button
                onClick={onResetSimulation}
                title="Reset simulation to on-time status"
                className="px-2 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Nearest Stop / Location */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold uppercase">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Stop</span>
          </div>
          <p className="text-sm font-bold text-white mt-1 truncate">
            {nearestStop ? nearestStop.stop_name : 'Detected Stop'}
          </p>
          <span className="text-[10px] text-slate-500">Boarding Point</span>
        </div>

        {/* Current Target Bus */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold uppercase">
            <span className="text-xs">🚌</span>
            <span>Target Bus</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm font-black text-white">
              {activeVehicle ? `Bus ${activeVehicle.route_short_name}` : 'Route 15'}
            </span>
            {activeVehicle?.delay_minutes ? (
              <span className="text-[10px] font-bold text-rose-400">
                +{activeVehicle.delay_minutes}m
              </span>
            ) : null}
          </div>
          <span className="text-[10px] text-slate-500 truncate block">
            ID: {activeVehicle?.vehicle_id || 'BUS-15-01'}
          </span>
        </div>

        {/* Bus ETA */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold uppercase">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Bus ETA</span>
          </div>
          <p className={`text-base font-black mt-1 ${isDelayed ? 'text-rose-400' : 'text-amber-400'}`}>
            {busEtaMin} min
          </p>
          <span className="text-[10px] text-slate-500">To Your Stop</span>
        </div>

        {/* Destination Arrival */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Expected Arrival</span>
          </div>
          <p className="text-sm font-black text-white mt-1">
            {expectedArrivalTime || '08:54 AM'}
          </p>
          <span className="text-[10px] text-slate-500">End-to-End Journey</span>
        </div>

        {/* Mobility Friction Score (Dynamically recalculated) */}
        <div className={`border rounded-xl p-3 transition-colors ${
          frictionScore > 50 
            ? 'bg-rose-950/30 border-rose-500/50' 
            : 'bg-slate-950/70 border-slate-800/90'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold uppercase">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>Friction Index</span>
            </div>
            <span className="text-[9px] text-slate-500">Prototype</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-base font-black ${
              frictionScore > 60 ? 'text-rose-400' : frictionScore > 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {frictionScore}
            </span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block">
            {isDelayed ? 'Elevated via Delay' : 'Baseline Corridor'}
          </span>
        </div>

        {/* Transfer Risk */}
        <div className={`border rounded-xl p-3 transition-colors ${
          transferRiskLevel === 'High'
            ? 'bg-rose-950/30 border-rose-500/50'
            : transferRiskLevel === 'Moderate'
            ? 'bg-amber-950/30 border-amber-500/50'
            : 'bg-emerald-950/30 border-emerald-500/50'
        }`}>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold uppercase">
            <AlertTriangle className={`w-3.5 h-3.5 ${
              transferRiskLevel === 'High' ? 'text-rose-400' :
              transferRiskLevel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
            }`} />
            <span>Transfer Risk</span>
          </div>
          <p className={`text-base font-black mt-1 ${
            transferRiskLevel === 'High' ? 'text-rose-400' :
            transferRiskLevel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {transferRiskLevel}
          </p>
          <span className="text-[10px] text-slate-400">
            {transferRiskLevel === 'High' ? 'Connection at risk' : 'Buffer sufficient'}
          </span>
        </div>
      </div>

      {/* Disruption Alert & Friction Penalty Details (Shown when delayed) */}
      {isDelayed && (
        <div className="mt-3.5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">⚠️ Connection Threat:</span> Bus delay of +{delayMinutes}m reduces transfer window to train/bus.
              <span className="text-rose-300 ml-1">Friction increased: Waiting (+8), Transfer Risk (+7), Duration (+4).</span>
            </div>
          </div>
          <button
            onClick={onOpenCatchability}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow"
          >
            <Footprints className="w-3.5 h-3.5" />
            Verify Catchability
          </button>
        </div>
      )}
    </div>
  );
};
