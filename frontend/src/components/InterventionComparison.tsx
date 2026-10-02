import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  TrendingDown, 
  Clock, 
  Users, 
  Zap, 
  Layers, 
  Award,
  ChevronRight
} from 'lucide-react';
import { InterventionOption } from '../types';

interface InterventionComparisonProps {
  interventions: InterventionOption[];
  selectedIntervention: InterventionOption;
  onSelectIntervention: (int: InterventionOption) => void;
  onViewBeforeAfter: () => void;
  currentFriction?: number;
  currentDuration?: number;
}

export const InterventionComparison: React.FC<InterventionComparisonProps> = ({
  interventions,
  selectedIntervention,
  onSelectIntervention,
  onViewBeforeAfter,
  currentFriction = 78,
  currentDuration = 90
}) => {
  const recommended = interventions.find(i => i.isRecommended) || interventions[0];

  return (
    <div className="space-y-6">
      {/* Top AI Recommendation Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-teal-950/40 to-slate-900 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Award className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Optimal Intervention Recommendation
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {recommended.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              -{recommended.simulatedFrictionReductionPct}% Friction Impact
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              -{recommended.simulatedTimeReductionMin} Min Journey
            </span>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-200 leading-relaxed">
          {recommended.aiRecommendationSummary}
        </p>

        {/* Quick Delta Comparison Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Mobility Friction</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm line-through text-slate-500">{currentFriction}</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xl font-mono font-bold text-emerald-400">{recommended.afterFrictionScore}</span>
              <span className="text-xs font-semibold text-emerald-400">(-{currentFriction - recommended.afterFrictionScore} pts)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Duration</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm line-through text-slate-500">{currentDuration}m</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xl font-mono font-bold text-cyan-300">{recommended.afterDurationMinutes}m</span>
              <span className="text-xs font-semibold text-emerald-400">(-{currentDuration - recommended.afterDurationMinutes}m)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Transfer Waiting</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm line-through text-slate-500">19m</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xl font-mono font-bold text-emerald-400">{recommended.afterWaitingMinutes}m</span>
              <span className="text-xs font-semibold text-emerald-400">(-15m)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">People Benefitted</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-mono font-bold text-purple-300">{recommended.affectedPopulationDaily.toLocaleString()}</span>
              <span className="text-xs text-slate-400">/day</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onViewBeforeAfter}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <span>View Before vs After Experience</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-wider">
              Intervention Options Comparison Matrix
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulated scenario tests across operational, capital, and schedule interventions
            </p>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            * All values are prototype simulation estimates
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-3 px-3">Intervention Policy</th>
                <th className="py-3 px-3">Complexity</th>
                <th className="py-3 px-3">Time Saved</th>
                <th className="py-3 px-3">Friction Reduction</th>
                <th className="py-3 px-3">Daily People</th>
                <th className="py-3 px-3">Implementation Category</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {interventions.map((option) => {
                const isSelected = selectedIntervention.id === option.id;
                const isRec = option.isRecommended;

                return (
                  <tr
                    key={option.id}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'
                    }`}
                    onClick={() => onSelectIntervention(option)}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {isRec && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        )}
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {option.title}
                            {isRec && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                AI CHOICE
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 line-clamp-1">{option.description}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        option.estimatedComplexity === 'Low' ? 'bg-emerald-500/20 text-emerald-300' :
                        option.estimatedComplexity === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {option.estimatedComplexity}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                      -{option.simulatedTimeReductionMin} min
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      -{option.simulatedFrictionReductionPct}%
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-300">
                      {option.affectedPopulationDaily.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {option.implementationCategory}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIntervention(option);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Test'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
