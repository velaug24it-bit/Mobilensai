import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Radio, 
  RotateCcw, 
  Sliders, 
  User, 
  CheckCircle2, 
  ShieldCheck, 
  CloudSun, 
  Footprints,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { resetTransitDemo } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { 
    isDemoMode, 
    setIsDemoMode, 
    backendStatus, 
    databaseName, 
    currentUser, 
    role, 
    setRole,
    departureHour,
    setDepartureHour
  } = useApp();

  const [walkingSpeedMode, setWalkingSpeedMode] = useState<'standard' | 'wheelchair' | 'brisk'>('standard');
  const [transitProvider, setTransitProvider] = useState<'simulated' | 'gtfs_rt'>('simulated');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDemo = async () => {
    setIsResetting(true);
    const ok = await resetTransitDemo();
    setIsResetting(false);
    if (ok) {
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Platform Configuration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            System & Simulator Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage transit data provider feeds, simulation parameters, walking calibrations, and database connection.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDemo}
          disabled={isResetting}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting...' : 'Reset Demo Simulation'}</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Demo transit feed reset to baseline schedules. Delays cleared.</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Transit Feed Provider Abstraction */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Transit Provider Layer</span>
              </h3>
              <p className="text-xs text-slate-400">Pluggable abstraction layer for GTFS / GTFS-Realtime and demo feeds</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              🟡 DEMO SIMULATION ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div 
              onClick={() => setTransitProvider('simulated')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                transitProvider === 'simulated'
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-white mb-1">
                <span>Simulated Transit Provider</span>
                {transitProvider === 'simulated' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-[11px] leading-relaxed">
                Autonomous 5-route, 9-bus continuous GPS interpolation with delay injection and catchability arithmetic. Works 100% offline.
              </p>
            </div>

            <div 
              onClick={() => setTransitProvider('gtfs_rt')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                transitProvider === 'gtfs_rt'
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-white mb-1">
                <span>GTFS-RT / Municipal Feed (Plug-in)</span>
                {transitProvider === 'gtfs_rt' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-[11px] leading-relaxed">
                Connect external GTFS Protocol Buffers endpoint (e.g. TNSTC live AVL feed). Falls back automatically to simulated mode if unreachable.
              </p>
            </div>
          </div>
        </div>

        {/* Human Journey Speed Calibration */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Footprints className="w-4 h-4 text-cyan-400" />
              <span>Pedestrian Walking Speed & Persona Profile</span>
            </h3>
            <p className="text-xs text-slate-400">Used for "Can I Catch This Bus?" safety margin and walking friction calculation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              { id: 'standard', label: 'Standard Walking', speed: '80 m/min (4.8 km/h)', desc: 'Standard adult walking pace' },
              { id: 'wheelchair', label: 'Wheelchair / Reduced Mobility', speed: '55 m/min (3.3 km/h)', desc: 'Step-free routes prioritized' },
              { id: 'brisk', label: 'Brisk Walk / Jog', speed: '110 m/min (6.6 km/h)', desc: 'Higher catchability buffer' }
            ].map(item => (
              <div
                key={item.id}
                onClick={() => setWalkingSpeedMode(item.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  walkingSpeedMode === item.id 
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-white' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-cyan-300 mb-0.5">{item.label}</div>
                <div className="font-mono text-[11px] text-slate-200">{item.speed}</div>
                <div className="text-[10px] text-slate-500 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Database & Cloud Connection Status */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Database & System Status</span>
            </h3>
            <span className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Connected Database</span>
              <strong className="text-white text-xs font-mono">{databaseName} (MongoDB Atlas)</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Backend Server Status</span>
              <strong className="text-cyan-400 text-xs">{backendStatus}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
