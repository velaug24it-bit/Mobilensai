import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  TrendingDown, 
  Clock, 
  History, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { PERSONAL_HISTORY_DATA } from '../data/mockData';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Longitudinal Metrics
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Mobility Analytics & Trends
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            "Is your journey becoming easier?" Track personal commute friction evolution, transfer consistency, and intervention benefits.
          </p>
        </div>

        <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1">
          {(['daily', 'weekly', 'monthly'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                timeRange === r
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Trend Line Chart */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Weekly Commute Friction & Delay Variance
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fluctuations in friction score vs transfer waiting minutes along the Home ➔ College corridor
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">5-Day Rolling Average</span>
        </div>

        <div className="h-72 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PERSONAL_HISTORY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="friction" stroke="#EF4444" strokeWidth={3} name="Friction Score (/100)" />
              <Line type="monotone" dataKey="waitingMin" stroke="#06B6D4" strokeWidth={2} name="Waiting (min)" />
              <Line type="monotone" dataKey="durationMin" stroke="#8B5CF6" strokeWidth={2} name="Total Duration (min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Personal Journey History Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Personal Journey History
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">5 Logged Records</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Commute Route</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Waiting Segment</th>
                <th className="py-3 px-3">Friction Score</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {PERSONAL_HISTORY_DATA.map((entry) => (
                <tr key={entry.date} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 font-medium text-white">{entry.day}, {entry.date}</td>
                  <td className="py-3.5 px-3 text-slate-300 font-medium">{entry.route}</td>
                  <td className="py-3.5 px-3 font-mono text-cyan-300">{entry.durationMin} min</td>
                  <td className="py-3.5 px-3 font-mono text-rose-400">{entry.waitingMin} min</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      entry.friction > 70 ? 'bg-rose-500/20 text-rose-300' :
                      entry.friction > 50 ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {entry.friction}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-emerald-400 font-bold">Logged</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
