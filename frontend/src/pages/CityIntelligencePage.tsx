import React, { useState } from 'react';
import { 
  Layers, 
  Users, 
  Clock, 
  ArrowRightLeft, 
  Footprints, 
  Coins, 
  MapPin, 
  Filter, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { HOURLY_FRICTION_DATA, ZONE_COMPARISON_DATA } from '../data/mockData';

export const CityIntelligencePage: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | '30d'>('today');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const waitingVsWalkingData = [
    { zone: 'Zone 17', waitingMin: 19, walkingMin: 22, transfers: 3 },
    { zone: 'Zone 07', waitingMin: 15, walkingMin: 18, transfers: 2 },
    { zone: 'Zone 12', waitingMin: 13, walkingMin: 15, transfers: 2 },
    { zone: 'Zone 04', waitingMin: 9, walkingMin: 12, transfers: 1 },
    { zone: 'Zone 09', waitingMin: 7, walkingMin: 10, transfers: 1 },
    { zone: 'Zone 01', waitingMin: 4, walkingMin: 7, transfers: 1 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Transport Planner Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            City Mobility Intelligence
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Macro-level systemic friction diagnostics, multi-modal transfer bottlenecks, and population impact analytics.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time range */}
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1">
            {(['today', '7d', '30d'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  timeFilter === t
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'today' ? 'Today' : t === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          {/* Zone filter select */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
          >
            <option value="all">All Zones</option>
            <option value="zone-17">Zone 17 (Sector 17)</option>
            <option value="zone-07">Zone 07 (North Gateway)</option>
            <option value="zone-04">Zone 04 (Tech Corridor)</option>
            <option value="zone-01">Zone 01 (Purple Spine)</option>
          </select>
        </div>
      </div>

      {/* Top Planner KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard
          title="Daily Travelers"
          value="18,420"
          subtitle="Unique active riders"
          icon={Users}
          accentColor="cyan"
        />
        <MetricCard
          title="Journeys Analyzed"
          value="42,816"
          subtitle="Multi-segment trips"
          icon={Layers}
          accentColor="purple"
        />
        <MetricCard
          title="Avg Transfer Wait"
          value="14.2"
          unit="min"
          subtitle="Connection delay norm"
          icon={Clock}
          accentColor="rose"
        />
        <MetricCard
          title="Avg Transfers"
          value="2.1"
          unit="modal"
          subtitle="Vehicle change count"
          icon={ArrowRightLeft}
          accentColor="amber"
        />
        <MetricCard
          title="Walking Burden"
          value="1.8"
          unit="km"
          subtitle="First/last mile average"
          icon={Footprints}
          accentColor="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diurnal Friction Surge */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Friction & Waiting by Hour of Day
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Correlation between peak transfer waiting and composite friction spikes
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Peak Surge: 08:30 AM</span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HOURLY_FRICTION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="friction" stroke="#EF4444" strokeWidth={3} name="Friction Score (/100)" />
                <Line type="monotone" dataKey="waitingMin" stroke="#06B6D4" strokeWidth={2} name="Avg Wait (Minutes)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waiting vs Walking Burden by Zone */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Waiting vs Walking Burden by Zone
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of dead waiting minutes against pedestrian exertion
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400">Zone 17 Bottleneck</span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitingVsWalkingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="zone" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="waitingMin" fill="#EF4444" radius={[6, 6, 0, 0]} name="Transfer Wait (min)" />
                <Bar dataKey="walkingMin" fill="#14B8A6" radius={[6, 6, 0, 0]} name="Walking Strain (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Transit Corridor Spotlight (Connecting Live Bus Tracking to City Planning) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-900/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                  Live Transit Feeder & Bottleneck Intelligence
                </span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800 font-mono">
                  Aggregated GTFS-RT Analytics
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                Spotlight: High-Friction Bus Stop — Vagaikulam / Zone 17 Transfer Node
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/live-journey"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span>View Moving Buses</span>
              <span className="text-xs">&rarr;</span>
            </a>
            <a
              href="/interventions"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate AI Policy</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Simulated Average Wait</span>
            <span className="text-lg font-black text-rose-400 mt-1 block">18 min</span>
            <span className="text-[10px] text-slate-500">Unsynchronized Headways</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Transfer Failure Rate</span>
            <span className="text-lg font-black text-amber-400 mt-1 block">23.4%</span>
            <span className="text-[10px] text-slate-500">Missed Connecting Departures</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Peak Congestion Window</span>
            <span className="text-lg font-black text-indigo-300 mt-1 block">08:00 – 09:30</span>
            <span className="text-[10px] text-slate-500">Morning Commuter Rush</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Friction Reduction Potential</span>
            <span className="text-lg font-black text-emerald-400 mt-1 block">-43%</span>
            <span className="text-[10px] text-slate-500">Via Schedule Synchronization</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-900/40 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <span>
            <strong>AI Recommended Intervention:</strong> Synchronize feeder route 7B with trunk line 15 departure windows to eliminate the 18-minute platform wait.
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Simulated scenario — not a real-world prediction.</span>
        </div>
      </div>

      {/* Zone Diagnostic Ranking Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Transit District Friction Diagnostics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identified policy intervention opportunities sorted by severity
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Prototype Analytical Feed</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-3 px-3">Zone Code & Name</th>
                <th className="py-3 px-3">Friction Score</th>
                <th className="py-3 px-3">Avg Wait</th>
                <th className="py-3 px-3">Walk Burden</th>
                <th className="py-3 px-3">Daily Riders</th>
                <th className="py-3 px-3">Main Friction Driver</th>
                <th className="py-3 px-3">Recommended Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ZONE_COMPARISON_DATA.map((z) => (
                <tr key={z.zone} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-white">{z.zone}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      z.friction >= 80 ? 'bg-rose-500/20 text-rose-300' :
                      z.friction >= 65 ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {z.friction}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-rose-400">{z.waiting} min</td>
                  <td className="py-3.5 px-3 font-mono text-slate-300">{z.walkingKm} km</td>
                  <td className="py-3.5 px-3 font-mono text-purple-300">{z.affected.toLocaleString()}</td>
                  <td className="py-3.5 px-3 text-slate-300">
                    {z.zone === 'Zone 17' ? 'Unsynchronized bus-to-rail transfer' : 
                     z.zone === 'Zone 07' ? 'Disconnected industrial last-mile' : 
                     'Pedestrian crossing barrier'}
                  </td>
                  <td className="py-3.5 px-3 text-cyan-300 font-medium">
                    {z.zone === 'Zone 17' ? 'Schedule Synchronization' : 
                     z.zone === 'Zone 07' ? 'Deploy Micro-Feeders' : 
                     'Build Pedestrian Refuge'}
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
