import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  GitCompare, 
  RotateCcw, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INTERVENTION_OPTIONS } from '../data/mockData';
import { InterventionComparison } from '../components/InterventionComparison';
import { BeforeAfterComparison } from '../components/BeforeAfterComparison';

export const AIInterventionsPage: React.FC = () => {
  const { 
    currentJourney, 
    afterJourney, 
    selectedIntervention, 
    setSelectedIntervention 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'comparison' | 'before_after'>('comparison');

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Core Intervention Simulator
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            AI Intervention Engine
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            "Don't just identify the problem. Test what could improve it." Simulate multi-policy interventions and measure human friction reduction before physical deployment.
          </p>
        </div>

        {/* View mode toggle tabs */}
        <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Matrix & Simulation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('before_after')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'before_after'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>Before vs After Screen</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'comparison' ? (
        <InterventionComparison
          interventions={INTERVENTION_OPTIONS}
          selectedIntervention={selectedIntervention}
          onSelectIntervention={(opt) => setSelectedIntervention(opt)}
          onViewBeforeAfter={() => setActiveTab('before_after')}
          currentFriction={currentJourney.frictionScore}
          currentDuration={currentJourney.totalDurationMinutes}
        />
      ) : (
        <BeforeAfterComparison
          beforeJourney={currentJourney}
          afterJourney={afterJourney}
          intervention={selectedIntervention}
        />
      )}
    </div>
  );
};
