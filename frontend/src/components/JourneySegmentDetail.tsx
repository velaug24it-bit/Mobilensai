import React from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle2, XCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { JourneySegment } from '../types';

interface JourneySegmentDetailProps {
  segment: JourneySegment;
  onSimulateIntervention?: () => void;
}

export const JourneySegmentDetail: React.FC<JourneySegmentDetailProps> = ({
  segment,
  onSimulateIntervention
}) => {
  const isHighFriction = segment.frictionContribution === 'high';
  const expected = segment.expectedMinutes ?? 5;
  const excess = segment.excessMinutes ?? Math.max(0, segment.durationMinutes - expected);

  return (
    <div className={`bg-[#111827] border ${isHighFriction ? 'border-rose-500/40 glow-red' : 'border-slate-800'} rounded-2xl p-6 shadow-xl transition-all`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isHighFriction ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Segment Inspector
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                isHighFriction ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 
                segment.frictionContribution === 'moderate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {segment.frictionContribution} Friction
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mt-0.5">{segment.name}</h4>
          </div>
        </div>

        {onSimulateIntervention && isHighFriction && (
          <button
            type="button"
            onClick={onSimulateIntervention}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Intervention
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5">
        <div className="bg-[#1E293B]/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400">Recorded Duration</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {segment.durationMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
        </div>

        <div className="bg-[#1E293B]/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400">Scheduled / Expected</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {expected} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
        </div>

        <div className={`rounded-xl p-3.5 border ${excess > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#1E293B]/60 border-slate-800'}`}>
          <span className="text-[11px] font-medium text-slate-400">Excess Delay Burden</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${excess > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            +{excess} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
        </div>

        <div className="bg-[#1E293B]/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400">Accessibility State</span>
          <div className="flex items-center gap-1.5 text-sm font-semibold mt-2">
            {segment.stepFree ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Step-free ramp</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span className="text-rose-400">Staircase / Inaccessible</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span><strong className="text-slate-200">Location:</strong> {segment.location}</span>
        </div>
        <div className="flex items-start gap-2 text-slate-300">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span><strong className="text-slate-200">Journey Context:</strong> {segment.description}</span>
        </div>
      </div>
    </div>
  );
};
