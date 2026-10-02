import React from 'react';
import { Footprints, Bus, Clock, Train, ArrowRight, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { JourneySegment } from '../types';

interface JourneyTimelineProps {
  segments: JourneySegment[];
  selectedSegmentId: string | null;
  onSelectSegment: (id: string) => void;
  origin?: string;
  destination?: string;
  departureTime?: string;
  arrivalTime?: string;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  segments,
  selectedSegmentId,
  onSelectSegment,
  origin = 'Home',
  destination = 'College',
  departureTime = '07:42 AM',
  arrivalTime = '09:12 AM'
}) => {
  const getModeIcon = (mode: JourneySegment['mode']) => {
    switch (mode) {
      case 'walking': return Footprints;
      case 'bus': return Bus;
      case 'waiting': return Clock;
      case 'transfer': return Footprints;
      case 'train': return Train;
      default: return Footprints;
    }
  };

  const getFrictionStyle = (contribution: JourneySegment['frictionContribution']) => {
    switch (contribution) {
      case 'high':
        return {
          bg: 'bg-rose-500/10 hover:bg-rose-500/20',
          border: 'border-rose-500/50',
          ring: 'ring-2 ring-rose-500/40',
          badge: 'bg-rose-500 text-white',
          text: 'text-rose-400',
          label: 'High Friction'
        };
      case 'moderate':
        return {
          bg: 'bg-amber-500/10 hover:bg-amber-500/20',
          border: 'border-amber-500/50',
          ring: 'ring-2 ring-amber-500/30',
          badge: 'bg-amber-500 text-slate-900',
          text: 'text-amber-400',
          label: 'Moderate'
        };
      case 'low':
      default:
        return {
          bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
          border: 'border-emerald-500/40',
          ring: 'ring-1 ring-emerald-500/30',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
          text: 'text-emerald-400',
          label: 'Normal Flow'
        };
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            Human Journey Reconstruction
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
            <span>{origin}</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="text-cyan-300">{destination}</span>
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Depart: <strong className="text-white">{departureTime}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-2">
            Arrive: <strong className="text-white">{arrivalTime}</strong>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 mb-6 text-xs text-slate-400">
        <span className="text-slate-500 font-medium">Friction status:</span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal Flow
        </span>
        <span className="flex items-center gap-1.5 text-amber-400 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate Friction
        </span>
        <span className="flex items-center gap-1.5 text-rose-400 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" /> High Burden / Bottleneck
        </span>
      </div>

      {/* Horizontal Interactive Timeline Scroll */}
      <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin">
        <div className="flex items-center gap-3 min-w-max">
          {/* Start node */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 text-xs font-bold shadow-lg shadow-cyan-500/20">
              ORIG
            </div>
            <span className="text-[11px] font-semibold text-slate-300 mt-2">Home</span>
            <span className="text-[10px] text-slate-500">{departureTime}</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

          {/* Segment cards */}
          {segments.map((segment) => {
            const Icon = getModeIcon(segment.mode);
            const style = getFrictionStyle(segment.frictionContribution);
            const isSelected = selectedSegmentId === segment.id;
            const isHighFriction = segment.frictionContribution === 'high';

            return (
              <React.Fragment key={segment.id}>
                <button
                  type="button"
                  onClick={() => onSelectSegment(segment.id)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer min-w-[170px] relative ${
                    isSelected ? 'ring-2 ring-cyan-400 border-cyan-400 bg-slate-800/90 shadow-lg scale-105 z-10' : `${style.border} ${style.bg}`
                  }`}
                >
                  {isHighFriction && (
                    <span className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-md flex items-center gap-1 animate-bounce">
                      <AlertTriangle className="w-3 h-3" /> Bottleneck
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${isHighFriction ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-cyan-300'} border border-slate-700/60`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white">
                      {segment.durationMinutes} min
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {segment.name}
                  </span>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px]">
                    <span className="text-slate-400 capitalize">{segment.mode}</span>
                    <span className={`font-semibold ${style.text}`}>
                      {segment.frictionContribution.toUpperCase()}
                    </span>
                  </div>
                </button>

                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              </React.Fragment>
            );
          })}

          {/* End node */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-500/20">
              DEST
            </div>
            <span className="text-[11px] font-semibold text-slate-300 mt-2">College</span>
            <span className="text-[10px] text-slate-500">{arrivalTime}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-right">
        <span className="text-[11px] text-slate-500 italic">
          * Click on any segment to inspect delay sources and friction mechanics
        </span>
      </div>
    </div>
  );
};
