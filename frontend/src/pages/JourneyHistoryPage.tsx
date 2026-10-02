import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  TrendingDown, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Calendar, 
  Zap, 
  BarChart3, 
  Navigation,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { PERSONAL_HISTORY_DATA, TCR_TO_FXEC_JOURNEY } from '../data/mockData';

export const JourneyHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentJourney } = useApp();

  const savedJourneys = [
    {
      id: 'J-TCR-FXEC-2026',
      title: 'TCR Airport ➔ FXEC Engineering Corridor',
      origin: 'Thoothukudi Airport (TCR), Vagaikulam',
      destination: 'Francis Xavier Engineering College, Vannarpettai',
      date: 'Today, Oct 02 • 08:15 AM',
      durationMinutes: 78,
      walkingMinutes: 15,
      waitingMinutes: 19,
      frictionScore: 76,
      riskLevel: 'Highway Mid-block Crossing',
      primaryBottleneck: 'Vagaikulam 16-min Roadside Wait',
      costInr: 45,
      journeyRef: TCR_TO_FXEC_JOURNEY
    },
    {
      id: 'J-PAL-FXEC-2026',
      title: 'Palayamkottai ➔ FXEC Campus Express',
      origin: 'Palayamkottai Bus Stand, Tirunelveli',
      destination: 'Francis Xavier Engineering College, Vannarpettai',
      date: 'Yesterday, Oct 01 • 08:30 AM',
      durationMinutes: 28,
      walkingMinutes: 8,
      waitingMinutes: 6,
      frictionScore: 39,
      riskLevel: 'Low Risk (Sheltered Corridor)',
      primaryBottleneck: 'Minor Signal Delay at North Bypass',
      costInr: 20,
      journeyRef: TCR_TO_FXEC_JOURNEY
    },
    {
      id: 'J-NBS-FXEC-2026',
      title: 'Tirunelveli New Bus Stand (NBS) ➔ FXEC Route',
      origin: 'Tirunelveli New Bus Stand (NBS)',
      destination: 'Francis Xavier Engineering College, Vannarpettai',
      date: 'Sep 30 • 08:10 AM',
      durationMinutes: 34,
      walkingMinutes: 9,
      waitingMinutes: 8,
      frictionScore: 44,
      riskLevel: 'Moderate Crossing Risk',
      primaryBottleneck: 'Vannarpettai East Highway Crossing',
      costInr: 25,
      journeyRef: TCR_TO_FXEC_JOURNEY
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <History className="w-3 h-3" />
              Commute Audit Trail
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              🔵 LOGGED JOURNEYS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Journey History & Friction Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Review door-to-door trips, track how schedule delays influenced your daily mobility friction, and replay optimized routes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/my-journey')}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Navigation className="w-4 h-4" />
          <span>Plan New Journey</span>
        </button>
      </div>

      {/* 5-Day Friction Score Trend Chart */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              <span>Multi-Day Commute Friction Dynamics</span>
            </h3>
            <p className="text-xs text-slate-400">Tracking daily prototype friction index vs wasted waiting minutes</p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            Average Friction: <strong>69/100</strong>
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PERSONAL_HISTORY_DATA}>
              <defs>
                <linearGradient id="frictionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="friction" name="Mobility Friction Index" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#frictionGrad)" />
              <Area type="monotone" dataKey="waitingMin" name="Waiting Minutes" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#waitGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Saved / Historical Trips List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <span>Recorded Passenger Trips ({savedJourneys.length})</span>
        </h3>

        <div className="space-y-3">
          {savedJourneys.map(item => (
            <div 
              key={item.id} 
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {item.date}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Cost: ₹{item.costInr}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">
                  {item.title}
                </h4>

                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                  <span className="text-slate-300">{item.origin}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-300">{item.destination}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Total: <strong className="text-white">{item.durationMinutes} min</strong></span>
                  <span>Walking: <strong className="text-cyan-400">{item.walkingMinutes} min</strong></span>
                  <span>Waiting: <strong className="text-amber-400">{item.waitingMinutes} min</strong></span>
                  <span>Risk: <strong className="text-rose-400">{item.riskLevel}</strong></span>
                </div>
              </div>

              {/* Friction Badge & Action */}
              <div className="flex items-center gap-4 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Friction Index</span>
                  <span className="text-2xl font-black text-rose-400 font-mono">
                    {item.frictionScore}<span className="text-xs text-slate-500 font-normal">/100</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentJourney(item.journeyRef);
                    navigate('/live-journey');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all border border-slate-700 hover:border-cyan-400 flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Track Live</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
