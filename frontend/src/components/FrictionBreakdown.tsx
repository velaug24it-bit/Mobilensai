import React from 'react';
import { FrictionBreakdown as BreakdownType } from '../types';
import { Clock, ArrowRightLeft, Footprints, Hourglass, Coins, Accessibility, ShieldCheck } from 'lucide-react';

interface FrictionBreakdownProps {
  breakdown: BreakdownType;
  showWeightsInfo?: boolean;
}

export const FrictionBreakdown: React.FC<FrictionBreakdownProps> = ({
  breakdown,
  showWeightsInfo = true
}) => {
  const items = [
    {
      label: 'Waiting burden',
      value: breakdown.waitingBurden,
      icon: Clock,
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      description: 'Headway gaps & connection delay'
    },
    {
      label: 'Transfer burden',
      value: breakdown.transferBurden,
      icon: ArrowRightLeft,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      description: 'Modal changes & stair climbs'
    },
    {
      label: 'Time burden',
      value: breakdown.timeBurden,
      icon: Hourglass,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-400',
      description: 'Total journey clock time penalty'
    },
    {
      label: 'Walking burden',
      value: breakdown.walkingBurden,
      icon: Footprints,
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      description: 'First/last-mile pedestrian distance'
    },
    {
      label: 'Cost burden',
      value: breakdown.costBurden,
      icon: Coins,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      description: 'Multi-modal fare sum'
    },
    {
      label: 'Accessibility',
      value: breakdown.accessibilityBurden,
      icon: Accessibility,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      description: 'Level transitions & step-free paths'
    },
    {
      label: 'Reliability',
      value: breakdown.reliabilityBurden,
      icon: ShieldCheck,
      color: 'bg-teal-500',
      textColor: 'text-teal-400',
      description: 'Schedule deviation buffer'
    }
  ];

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Friction Breakdown Analysis
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Component contributions to total mobility burden
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300">
          Normalized %
        </span>
      </div>

      <div className="space-y-4 mt-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${item.textColor}`} />
                  <span className="font-semibold text-slate-200">{item.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`font-mono font-bold text-sm ${item.textColor}`}>
                    {item.value}%
                  </span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="h-2 w-full bg-[#1E293B] rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(100, Math.max(4, item.value))}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                <span>{item.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showWeightsInfo && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Formula: Configurable prototype weighting model</span>
          <span className="text-cyan-400 font-mono text-[10px]">v1.2-beta</span>
        </div>
      )}
    </div>
  );
};
