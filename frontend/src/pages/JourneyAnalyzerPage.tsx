import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  SlidersHorizontal, 
  Clock, 
  RotateCcw, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { JourneySegmentDetail } from '../components/JourneySegmentDetail';
import { FrictionGauge } from '../components/FrictionGauge';
import { FrictionBreakdown } from '../components/FrictionBreakdown';
import { AIBottleneckCard } from '../components/AIBottleneckCard';
import { HeatStressMeter } from '../components/HeatStressMeter';
import { WhyDifficultWhyRiskyPanel } from '../components/WhyDifficultWhyRiskyPanel';
import { SaferJourneyComparisonPanel } from '../components/SaferJourneyComparisonPanel';

export const JourneyAnalyzerPage: React.FC = () => {

  const navigate = useNavigate();
  const { 
    currentJourney, 
    selectedSegmentId, 
    setSelectedSegmentId, 
    loadDemoJourney,
    setIsReportModalOpen,
    setReportPreFill,
    heatMultiplier,
    ambientTempCelsius
  } = useApp();

  const activeSegment = 
    currentJourney.segments.find(s => s.id === selectedSegmentId) || 
    currentJourney.segments.find(s => s.mode === 'waiting') || 
    currentJourney.segments[0];

  const handleSimulate = () => {
    navigate('/interventions');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Core Analytical Engine
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Journey Analyzer
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Multi-modal journey reconstruction, friction component decomposition, and automated bottleneck detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setReportPreFill({
                locationName: activeSegment?.location || 'Vagaikulam Feeder Stop, NH 138',
                lat: 8.7242,
                lng: 78.0264
              });
              setIsReportModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Crowdsource report this bottleneck to municipal authorities"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Flag This Trap</span>
          </button>

          <button
            type="button"
            onClick={loadDemoJourney}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            onClick={handleSimulate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simulate Interventions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 5 Quick Journey Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Duration</span>
          <div className="text-2xl font-mono font-black text-white mt-1">
            {currentJourney.totalDurationMinutes} <span className="text-xs text-slate-400 font-normal">min</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold uppercase text-slate-400">Transit Motion Time</span>
          <div className="text-2xl font-mono font-black text-cyan-300 mt-1">
            {currentJourney.travelDurationMinutes} <span className="text-xs text-slate-400 font-normal">min</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-rose-500/30 rounded-2xl p-4 bg-rose-500/5">
          <span className="text-[10px] font-bold uppercase text-rose-400">Dead Waiting Time</span>
          <div className="text-2xl font-mono font-black text-rose-400 mt-1 flex items-baseline gap-1">
            {currentJourney.waitingDurationMinutes} <span className="text-xs text-rose-400/80 font-normal">min ⚠</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold uppercase text-slate-400">Walking Burden</span>
          <div className="text-2xl font-mono font-black text-slate-200 mt-1">
            {currentJourney.walkingDurationMinutes} <span className="text-xs text-slate-400 font-normal">min</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold uppercase text-slate-400">Estimated Cost</span>
          <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
            ₹{currentJourney.estimatedCostInr}
          </div>
        </div>
      </div>

      {/* Major Feature 1: Horizontal Journey Timeline */}
      <JourneyTimeline
        segments={currentJourney.segments}
        selectedSegmentId={selectedSegmentId}
        onSelectSegment={setSelectedSegmentId}
        origin={currentJourney.origin}
        destination={currentJourney.destination}
        departureTime={currentJourney.departureTime}
        arrivalTime={currentJourney.arrivalTime}
      />

      {/* Major Feature 2: AI Bottleneck Detection Insight Card */}
      <AIBottleneckCard
        bottleneck={currentJourney.primaryBottleneck}
        onSimulateIntervention={handleSimulate}
      />

      {/* Middle Grid: Segment Inspector & Gauge + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Selected Segment Detailed Inspector */}
        <div className="lg:col-span-6 space-y-6">
          <JourneySegmentDetail
            segment={activeSegment}
            onSimulateIntervention={handleSimulate}
          />
        </div>

        {/* Right: Friction Gauge & Breakdown */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Gauge card */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 text-center">
              Prototype Mobility Friction Index
            </h4>
            <span className="text-[10px] text-amber-400/80 mb-3 text-center italic">
              Demonstration Metric • Not Scientifically Validated
            </span>
            <FrictionGauge
              score={currentJourney.frictionScore}
              level={currentJourney.frictionLevel}
              size="lg"
            />
          </div>

          {/* Breakdown bars */}
          <div className="flex-1">
            <FrictionBreakdown breakdown={currentJourney.frictionBreakdown} />
          </div>
        </div>
      </div>

      {/* Major Feature 3: "Why is my journey difficult?" & "Why is my journey risky?" */}
      <WhyDifficultWhyRiskyPanel
        onSimulateIntervention={handleSimulate}
        onExploreSaferRoute={() => {
          const el = document.getElementById('safer-comparison-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Major Feature 4: Safer Journey Comparison with Transparent Trade-Offs */}
      <div id="safer-comparison-section">
        <SaferJourneyComparisonPanel
          onSelectRoute={(route) => {
            navigate('/live-journey');
          }}
        />
      </div>

      {/* Climate & Heat Stress Multiplier */}
      <HeatStressMeter />


      {/* Bottom Next Step Call-To-Action Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/20 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="text-xs text-slate-300">
            <strong>Next step in the hackathon workflow:</strong> Take this detected 19-minute transfer bottleneck and simulate timetable synchronization and feeder interventions.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSimulate}
          className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center gap-1.5"
        >
          <span>Proceed to Intervention Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
