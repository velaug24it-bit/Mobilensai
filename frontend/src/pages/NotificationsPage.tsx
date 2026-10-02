import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Radio, 
  ShieldAlert, 
  CloudRain, 
  Train, 
  Settings, 
  Volume2,
  Trash2,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'transit' | 'risk' | 'weather'>('all');

  // Notification Configuration Preferences
  const [config, setConfig] = useState({
    busApproaching: true,
    busDelays: true,
    transferRiskAlerts: true,
    roadRiskZones: true,
    weatherFriction: true,
    quietHours: false,
    audioAlert: false
  });

  const sampleNotifications = [
    {
      id: 'notif-bus-1',
      type: 'transit',
      icon: Radio,
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      title: 'Bus 12A is 2 stops away',
      message: 'Vehicle 12A-104 is 1.4 km away from Greenwood South Stop. Estimated arrival in 5 minutes.',
      timestamp: '2 mins ago',
      read: false
    },
    {
      id: 'notif-delay-1',
      type: 'transit',
      icon: AlertTriangle,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      title: 'Bus Delay Detected (+6 min)',
      message: 'Bus 15 encountered arterial junction congestion. ETA revised from 08:20 AM to 08:26 AM.',
      timestamp: '8 mins ago',
      read: false
    },
    {
      id: 'notif-transfer-1',
      type: 'transit',
      icon: Train,
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      title: 'Transfer Risk Elevated: Tight Train Buffer',
      message: 'Due to current bus delay, your platform transfer buffer for the 08:32 suburban train is now only 2 minutes.',
      timestamp: '14 mins ago',
      read: true
    },
    {
      id: 'notif-risk-1',
      type: 'risk',
      icon: ShieldAlert,
      iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      title: 'Elevated Mobility Risk Warning',
      message: 'Your walking connection crosses Zone 17 (High vehicle-pedestrian conflict zone). An alternative sheltered ramp is available.',
      timestamp: '25 mins ago',
      read: true
    },
    {
      id: 'notif-weather-1',
      type: 'weather',
      icon: CloudRain,
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      title: 'Weather Impact on Walking Friction',
      message: 'Ambient heat index (38°C) increases walking fatigue penalty by +14%. Consider boarding air-conditioned feeder 7B.',
      timestamp: '1 hour ago',
      read: true
    }
  ];

  const filteredNotifs = sampleNotifications.filter(n => {
    if (selectedFilter === 'all') return true;
    return n.type === selectedFilter;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Bell className="w-3 h-3" />
              Live Journey Alerts
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              ANTI-SPAM SMART DISPATCH
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Journey Notifications & Alert Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Proactive alerts for bus arrivals, delay recalculations, transfer risks, and elevated road hazards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total Unread:</span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/40">
            2 Alerts
          </span>
        </div>
      </div>

      {/* Main Grid: Alerts List + Preferences Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notification Feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'transit', label: 'Transit & Delays' },
              { id: 'risk', label: 'Road Safety' },
              { id: 'weather', label: 'Weather & Heat' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedFilter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List of Notification Cards */}
          <div className="space-y-3">
            {filteredNotifs.map(n => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 shadow-lg ${
                    !n.read 
                      ? 'bg-slate-900/90 border-cyan-500/40' 
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${n.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Notification Configuration Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Smart Notification Rules</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-800/50">
                <span className="text-slate-300">Bus 2 stops away & approaching</span>
                <input
                  type="checkbox"
                  checked={config.busApproaching}
                  onChange={e => setConfig({ ...config, busApproaching: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-800/50">
                <span className="text-slate-300">Bus delays & rescheduled ETA</span>
                <input
                  type="checkbox"
                  checked={config.busDelays}
                  onChange={e => setConfig({ ...config, busDelays: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-800/50">
                <span className="text-slate-300">Transfer risk increased warnings</span>
                <input
                  type="checkbox"
                  checked={config.transferRiskAlerts}
                  onChange={e => setConfig({ ...config, transferRiskAlerts: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-800/50">
                <span className="text-slate-300">Elevated road safety zones alert</span>
                <input
                  type="checkbox"
                  checked={config.roadRiskZones}
                  onChange={e => setConfig({ ...config, roadRiskZones: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-800/50">
                <span className="text-slate-300">Weather & extreme heat friction</span>
                <input
                  type="checkbox"
                  checked={config.weatherFriction}
                  onChange={e => setConfig({ ...config, weatherFriction: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              💡 MobiLens suppresses redundant location pings to maintain a zero-spam experience.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
