import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Route, 
  Clock, 
  Gauge, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  TrendingDown, 
  AlertTriangle, 
  Play, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  ChevronRight,
  Compass
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { useApp } from '../context/AppContext';
import { CITY_KPI_DATA, TOP_PROBLEMS, HOURLY_FRICTION_DATA, ZONE_COMPARISON_DATA } from '../data/mockData';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadDemoJourney, selectZoneById, startHackathonDemo } = useApp();

  const handleLaunchDemoJourney = () => {
    loadDemoJourney();
    navigate('/analyzer');
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Hero Welcome Command Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#131D31] to-[#0E1729] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                Mobility Intelligence Center • Prototype Simulation Operational
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              See the journey <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">beyond the vehicle</span>.
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              We don't just measure how vehicles move across traffic lanes. We measure how difficult it is for people to move door-to-door, identify transfer bottlenecks, and simulate smart interventions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleLaunchDemoJourney}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              <span>Analyze Demo Journey</span>
            </button>

            <button
              type="button"
              onClick={startHackathonDemo}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-current" />
              <span>Run Hackathon Walkthrough</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>* All metrics displayed represent prototype simulation data for analytical evaluation</span>
          <span className="text-cyan-400 font-mono">Realtime Engine Ready</span>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="People Analyzed"
          value="18,420"
          subtitle="Simulated daily travelers"
          icon={Users}
          accentColor="cyan"
        />
        <MetricCard
          title="Journeys Analyzed"
          value="42,816"
          subtitle="Multi-modal itineraries"
          icon={Route}
          accentColor="purple"
        />
        <MetricCard
          title="Average Journey"
          value="51"
          unit="min"
          subtitle="Door-to-door average"
          icon={Clock}
          accentColor="amber"
        />
        <MetricCard
          title="Average Friction"
          value="63"
          unit="/100"
          subtitle="Prototype composite index"
          icon={Gauge}
          accentColor="rose"
        />
        <MetricCard
          title="High-Friction Zones"
          value="8"
          unit="zones"
          subtitle="Transfer & gap hotspots"
          icon={MapPin}
          accentColor="rose"
        />
        <MetricCard
          title="Interventions Tested"
          value="1,248"
          subtitle="Simulated policies"
          icon={Sparkles}
          accentColor="emerald"
        />
      </div>

      {/* Top Mobility Problems Ranked */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Top Systemic Mobility Burdens
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked breakdown of friction sources identified across city passenger journeys
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            * Click any category to inspect affected zones
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
          {TOP_PROBLEMS.map((prob) => (
            <div
              key={prob.id}
              onClick={() => {
                selectZoneById(prob.zone);
                navigate('/map');
              }}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-cyan-400 font-bold">#{prob.id}</span>
                  <span className="text-xs font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    {prob.percentage}%
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {prob.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {prob.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-cyan-400 font-medium">Hotspot: {prob.zone}</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Friction Curve */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Diurnal Mobility Friction Surge
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Composite friction score peaks during 08:00 - 09:30 AM transfer pinch points
              </p>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Peak: 82/100
            </span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_FRICTION_DATA}>
                <defs>
                  <linearGradient id="frictionColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[20, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="friction" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#frictionColor)" name="Friction Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Friction by Zone Bar Chart */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Friction Burden by Transit Zone
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sector 17 Interchange incurs severe transfer delays compared to Metro Purple line
              </p>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              6 Monitored Zones
            </span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ZONE_COMPARISON_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="zone" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="friction" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Friction Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
