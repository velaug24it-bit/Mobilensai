import React from 'react';
import { 
  Sun, 
  Flame, 
  Clock, 
  TreePine, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles,
  Info,
  Thermometer,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HeatStressMeter: React.FC = () => {
  const { 
    departureHour, 
    setDepartureHour, 
    isShadedRouteActive, 
    setIsShadedRouteActive,
    ambientTempCelsius,
    heatMultiplier,
    heatStressLevel
  } = useApp();

  // Format hour float to readable 12h time string (e.g. 7.5 -> 7:30 AM)
  const formatHourString = (hourFloat: number): string => {
    const hours = Math.floor(hourFloat);
    const minutes = Math.round((hourFloat - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
  };

  const getLevelBadge = () => {
    switch (heatStressLevel) {
      case 'EXTREME':
        return {
          label: 'Extreme Solar Strain (38°C+)',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          gaugeColor: 'from-orange-500 via-rose-500 to-red-600',
          advice: 'Critical dehydration risk on unshaded NH 138. Walking fatigue elevated by +115%.'
        };
      case 'HIGH':
        return {
          label: 'High Heat Exposure (34°C - 37°C)',
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          gaugeColor: 'from-amber-500 to-orange-500',
          advice: 'Direct sun exposure accelerates walking fatigue. Shaded transfer recommended.'
        };
      case 'MODERATE':
        return {
          label: 'Moderate Warmth (30°C - 33°C)',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          gaugeColor: 'from-teal-500 to-amber-500',
          advice: 'Noticeable heat strain during highway waits.'
        };
      default:
        return {
          label: 'Mild Morning Weather (26°C - 29°C)',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          gaugeColor: 'from-cyan-500 to-emerald-400',
          advice: 'Optimal travel conditions with low physical strain.'
        };
    }
  };

  const levelInfo = getLevelBadge();

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-2xl border ${
            heatStressLevel === 'EXTREME' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' :
            heatStressLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
            'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Heat Stress & Sun Exposure Multiplier
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelInfo.bg}`}>
                {levelInfo.label.split('(')[0].trim()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tamil Nadu climate factor: Walking and waiting fatigue fluctuates dynamically with temperature.
            </p>
          </div>
        </div>

        {/* Live Ambient Temperature Pill */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1.5 justify-end">
            <Thermometer className="w-4 h-4 text-rose-400" />
            <span className="text-lg font-black text-white">{ambientTempCelsius}°C</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Tirunelveli-Thoothukudi</span>
        </div>
      </div>

      {/* Interactive Time Slider */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Departure Time of Day:
          </span>
          <span className="font-extrabold text-cyan-300 text-sm bg-cyan-950/40 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
            {formatHourString(departureHour)}
          </span>
        </div>

        <input 
          type="range"
          min="6.0"
          max="20.0"
          step="0.5"
          value={departureHour}
          onChange={(e) => setDepartureHour(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>6:00 AM (Cool)</span>
          <span>10:00 AM</span>
          <span className="text-rose-400 font-bold">1:30 PM (Peak Sun)</span>
          <span>5:00 PM</span>
          <span>8:00 PM (Dusk)</span>
        </div>
      </div>

      {/* Visual Multiplier Gauge & Shaded Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
        
        {/* Fatigue Multiplier Value */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Physical Fatigue Multiplier
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-2xl font-black ${
                heatMultiplier >= 2.0 ? 'text-rose-400' :
                heatMultiplier >= 1.4 ? 'text-orange-400' :
                'text-emerald-400'
              }`}>
                {heatMultiplier}x
              </span>
              <span className="text-[11px] text-slate-400">
                {heatMultiplier > 1.0 ? `(+${Math.round((heatMultiplier - 1) * 100)}% Strain)` : '(Baseline)'}
              </span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Tree-Canopy / Shaded Path Toggle */}
        <button
          type="button"
          onClick={() => setIsShadedRouteActive(!isShadedRouteActive)}
          className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
            isShadedRouteActive
              ? 'bg-emerald-950/20 border-emerald-500/50 text-white shadow-md shadow-emerald-950/30'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${isShadedRouteActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              <TreePine className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Shaded Tree Canopy</div>
              <div className="text-[10px] text-slate-400">Cuts heat strain by -35%</div>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isShadedRouteActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
          }`}>
            {isShadedRouteActive ? 'ACTIVE' : 'OFF'}
          </span>
        </button>

      </div>

      {/* Regional Ground Truth Advice */}
      <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
        heatStressLevel === 'EXTREME'
          ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
          : 'bg-slate-900/90 border-slate-800 text-slate-300'
      }`}>
        <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
          heatStressLevel === 'EXTREME' ? 'text-rose-400' : 'text-amber-400'
        }`} />
        <div className="space-y-0.5">
          <div className="font-semibold text-white">
            Corridor Heat Advisory: {levelInfo.advice}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            At {formatHourString(departureHour)} ({ambientTempCelsius}°C), travelers on the <strong>NH 138 corridor</strong> between <strong>Thoothukudi Airport</strong> and <strong>FXEC Tirunelveli</strong> suffer increased dehydration while waiting at unshaded Vagaikulam stop.
          </p>
        </div>
      </div>

    </div>
  );
};
