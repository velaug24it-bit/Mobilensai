import React from 'react';
import { 
  HelpCircle, 
  AlertTriangle, 
  TrendingDown, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Footprints, 
  Radio, 
  CheckCircle2,
  Info
} from 'lucide-react';

interface WhyDifficultWhyRiskyPanelProps {
  onSimulateIntervention?: () => void;
  onExploreSaferRoute?: () => void;
}

export const WhyDifficultWhyRiskyPanel: React.FC<WhyDifficultWhyRiskyPanelProps> = ({
  onSimulateIntervention,
  onExploreSaferRoute
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Panel 1: "Why is my journey difficult?" */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                Friction Attribution AI
              </span>
              <h3 className="text-sm font-bold text-white">
                Why is my journey difficult?
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            Friction: 72/100
          </span>
        </div>

        {/* Breakdown Percentages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Dead Waiting Burden</span>
            </span>
            <strong className="text-rose-400 font-mono">39%</strong>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: '39%' }} />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Transfer Mismatch & Delay</span>
            </span>
            <strong className="text-orange-400 font-mono">24%</strong>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: '24%' }} />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Excessive Walking Burden</span>
            </span>
            <strong className="text-amber-400 font-mono">18%</strong>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }} />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>Fare & Multi-Modal Cost</span>
            </span>
            <strong className="text-cyan-400 font-mono">11%</strong>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '11%' }} />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Road-Risk Exposure</span>
            </span>
            <strong className="text-purple-400 font-mono">8%</strong>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '8%' }} />
          </div>
        </div>

        {/* Primary Bottleneck Callout */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
          <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
            Primary Bottleneck:
          </div>
          <div className="text-sm font-black text-white">
            BUS → TRAIN TRANSFER MISMATCH
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Bus 12A alights 7 minutes before train departure, but the walking transfer across Sector 17 leaves almost zero safety margin. Missing this connection triggers an unscheduled 15-minute platform wait.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended: Schedule synchronization</span>
          </div>
          {onSimulateIntervention && (
            <button
              type="button"
              onClick={onSimulateIntervention}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1"
            >
              <span>Simulate Fix</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Panel 2: "Why is my journey risky?" */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
                Road Safety Engine
              </span>
              <h3 className="text-sm font-bold text-white">
                Why is my journey risky?
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
            ⚠️ Elevated Mobility Risk
          </span>
        </div>

        {/* Risk Exposure Alert */}
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5 text-xs">
          <div className="font-bold text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Walking Segment Traverses Zone 17 Arterial Junction</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Your 350m transfer path crosses an unsignalized 4-lane roadway with frequent bus acceleration sweeps and high turning friction.
          </p>
        </div>

        {/* Contributing Indicators Checklist */}
        <div className="space-y-2 text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
            Contributing Safety Indicators:
          </span>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Vehicle-pedestrian trajectory interaction</span>
            <span className="text-rose-400 font-bold font-mono text-[11px]">TTC: 1.3s</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">High pedestrian exposure density</span>
            <span className="text-orange-400 font-bold font-mono text-[11px]">Severe Flow</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Unprotected mid-block crossing</span>
            <span className="text-amber-400 font-bold font-mono text-[11px]">No Signal</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Bus stop alighting slipstream proximity</span>
            <span className="text-purple-400 font-bold font-mono text-[11px]">1.8m Min Gap</span>
          </div>
        </div>

        {/* Action Button & Disclaimer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
          <div className="text-[10px] text-slate-500 italic max-w-xs">
            *Analytical indicators only — not an accident prediction.
          </div>
          {onExploreSaferRoute && (
            <button
              type="button"
              onClick={onExploreSaferRoute}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-colors flex items-center gap-1"
            >
              <span>Safer Route Alternative</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
