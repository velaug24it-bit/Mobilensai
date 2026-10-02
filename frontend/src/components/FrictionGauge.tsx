import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { FrictionLevel } from '../types';

interface FrictionGaugeProps {
  score: number; // 0 - 100
  level?: FrictionLevel;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const FrictionGauge: React.FC<FrictionGaugeProps> = ({
  score,
  level,
  size = 'lg',
  showSubtitle = true
}) => {
  // Determine color and status
  const computedLevel = level || (score > 70 ? 'HIGH' : score > 40 ? 'MODERATE' : 'LOW');
  
  const config = {
    HIGH: {
      color: '#EF4444',
      glow: 'glow-red',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      label: 'HIGH FRICTION',
      icon: ShieldAlert
    },
    CRITICAL: {
      color: '#DC2626',
      glow: 'glow-red',
      text: 'text-red-500',
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      label: 'CRITICAL FRICTION',
      icon: ShieldAlert
    },
    MODERATE: {
      color: '#F59E0B',
      glow: 'glow-amber',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      label: 'MODERATE FRICTION',
      icon: AlertTriangle
    },
    LOW: {
      color: '#10B981',
      glow: 'glow-cyan',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      label: 'LOW FRICTION',
      icon: ShieldCheck
    }
  }[computedLevel] || {
    color: '#06B6D4',
    glow: 'glow-cyan',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    label: 'CALCULATING',
    icon: ShieldCheck
  };

  const Icon = config.icon;

  // SVG Gauge calculations
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 10 : 8;
  const radius = size === 'lg' ? 84 : size === 'md' ? 64 : 44;
  const circumference = 2 * Math.PI * radius;
  // Use 240 degree arc gauge
  const arcLength = circumference * 0.75;
  const offset = arcLength - (score / 100) * arcLength;
  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className={`relative flex items-center justify-center ${config.glow}`}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="transform -rotate-90"
        >
          {/* Background circle track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="transparent"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Animated score arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="transparent"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <span className={`font-mono font-black tracking-tight ${config.text} ${
              size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl'
            }`}>
              {score}
            </span>
            <span className="text-sm font-semibold text-slate-500 ml-1">/100</span>
          </div>
          
          <div className={`mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${config.badge}`}>
            <Icon className="w-3 h-3" />
            <span>{config.label}</span>
          </div>
        </div>
      </div>

      {showSubtitle && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Prototype Mobility Friction Index
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
            Composite index measuring waiting, transfers, walking, and accessibility friction.
          </p>
        </div>
      )}
    </div>
  );
};
