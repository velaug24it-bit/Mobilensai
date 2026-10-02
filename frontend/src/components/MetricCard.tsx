import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  accentColor = 'cyan'
}) => {
  const colorMap = {
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      glow: 'hover:border-cyan-500/40'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'hover:border-emerald-500/40'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'hover:border-amber-500/40'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: 'hover:border-rose-500/40'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      glow: 'hover:border-purple-500/40'
    }
  };

  const currentTheme = colorMap[accentColor];

  return (
    <div className={`bg-[#111827] border ${currentTheme.border} ${currentTheme.glow} rounded-2xl p-5 shadow-lg shadow-black/30 transition-all duration-300 relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
      
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {title}
          </span>
          <div className="flex items-baseline mt-2 gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </div>
        </div>

        <div className={`p-3 rounded-xl ${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
        {subtitle && (
          <span className="text-slate-400 truncate max-w-[70%]">
            {subtitle}
          </span>
        )}
        {change && (
          <span className={`font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'} ml-auto`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
