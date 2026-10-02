import React from 'react';
import { TransitVehicle, TransitStop } from '../services/api';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ArrowDown, 
  Train, 
  GraduationCap, 
  Footprints,
  Radio
} from 'lucide-react';

interface LiveJourneyTimelineProps {
  currentStage: 'walking_to_stop' | 'waiting_for_bus' | 'on_bus' | 'transferring' | 'arrived';
  originName: string;
  busStopName: string;
  vehicle: TransitVehicle | null;
  destinationName: string;
  isDelayed: boolean;
  delayMinutes: number;
  transferRiskLevel: 'Low' | 'Moderate' | 'High';
}

export const LiveJourneyTimeline: React.FC<LiveJourneyTimelineProps> = ({
  currentStage,
  originName,
  busStopName,
  vehicle,
  destinationName,
  isDelayed,
  delayMinutes,
  transferRiskLevel
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
            <Radio className="w-4 h-4" />
          </span>
          Live Multimodal Journey Timeline
        </h3>
        <span className="text-xs text-slate-400 font-mono">Stage: {currentStage.replace(/_/g, ' ')}</span>
      </div>

      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {/* Stage 1: Origin */}
        <div className="relative group">
          <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Origin</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-800">
                ✓ Departed
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">{originName || 'Home / TCR Terminal'}</h4>
            <p className="text-xs text-slate-400">Walked 520m (6 min) to nearest transit boarding stop</p>
          </div>
        </div>

        {/* Stage 2: Bus Stop Boarding */}
        <div className="relative group">
          <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">Transit Boarding Stop</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded font-semibold border border-cyan-800">
                ● Waiting at Platform
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">{busStopName || 'Vagaikulam / Gandhipuram Stop'}</h4>
            <p className="text-xs text-slate-400">
              Sheltered platform • Approaching {vehicle ? `Bus ${vehicle.route_short_name}` : 'Route 15'}
            </p>
          </div>
        </div>

        {/* Stage 3: Live Bus In Transit */}
        <div className="relative group">
          <div className={`absolute -left-[27px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${
            isDelayed 
              ? 'bg-rose-500/20 border-2 border-rose-400 text-rose-400 animate-pulse' 
              : 'bg-indigo-500/20 border-2 border-indigo-400 text-indigo-400'
          }`}>
            <span className="text-xs">🚌</span>
          </div>
          <div className={`p-3.5 rounded-xl border transition-all ${
            isDelayed 
              ? 'bg-rose-950/20 border-rose-500/40' 
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white font-black text-xs px-2 py-0.5 rounded">
                  {vehicle ? vehicle.route_short_name : '15'}
                </span>
                <span className="text-sm font-bold text-white">
                  {vehicle ? `Bus ${vehicle.route_short_name} (${vehicle.vehicle_id})` : 'Express Feeder'}
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isDelayed ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
              }`}>
                {isDelayed ? `+${delayMinutes}m Delayed` : 'On Schedule'}
              </span>
            </div>

            {/* Vehicle Micro-Stops Track */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Current Location</span>
                <span className="font-bold text-slate-200 truncate block">
                  {vehicle?.next_stop_name || 'Approaching Stop'}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Distance to Stop</span>
                <span className="font-bold text-cyan-400 block">
                  {vehicle?.distance_from_user_km || '1.8'} km
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Arriving In</span>
                <span className={`font-bold block ${isDelayed ? 'text-rose-400' : 'text-amber-400'}`}>
                  {vehicle?.eta_next_stop_min || 4} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage 4: Connecting Transfer (Train / Feeder) */}
        <div className="relative group">
          <div className={`absolute -left-[27px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${
            transferRiskLevel === 'High'
              ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-400'
              : 'bg-sky-500/20 border-2 border-sky-400 text-sky-400'
          }`}>
            <Train className="w-3.5 h-3.5" />
          </div>
          <div className={`p-3 rounded-xl border ${
            transferRiskLevel === 'High'
              ? 'bg-rose-950/20 border-rose-500/40'
              : 'bg-slate-950/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-sky-400 uppercase tracking-wider block">
                  Intermodal Connection
                </span>
                <h4 className="text-sm font-bold text-white">Tirunelveli Junction Feeder / Train</h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-300 block">Departure: 08:32 AM</span>
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                  transferRiskLevel === 'High' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
                }`}>
                  {transferRiskLevel} Risk
                </span>
              </div>
            </div>

            {transferRiskLevel === 'High' && (
              <p className="text-xs text-rose-300 mt-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                Bus delay creates a negative buffer. Consider recalculating alternative route.
              </p>
            )}
          </div>
        </div>

        {/* Stage 5: Final Destination */}
        <div className="relative group">
          <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-purple-400">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-400 uppercase tracking-wider">Destination</span>
              <span className="text-xs text-slate-400">ETA 08:54 AM</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">{destinationName || 'Francis Xavier Engineering College (FXEC)'}</h4>
            <p className="text-xs text-slate-400">Final walk leg 300m via campus north gate</p>
          </div>
        </div>
      </div>
    </div>
  );
};
