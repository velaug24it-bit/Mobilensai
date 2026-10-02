import React from 'react';
import { Bell, X, AlertTriangle, Sparkles, Footprints, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationPanel: React.FC = () => {
  const { 
    isNotificationOpen, 
    setIsNotificationOpen, 
    notifications, 
    markNotificationRead,
    selectZoneById 
  } = useApp();

  if (!isNotificationOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'insight': return Sparkles;
      case 'journey': return Footprints;
      default: return CheckCircle2;
    }
  };

  const getTheme = (type: string) => {
    switch (type) {
      case 'alert': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'insight': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'journey': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="absolute top-16 right-4 z-[9900] w-80 sm:w-96 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Mobility Activity Notifications
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setIsNotificationOpen(false)}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-slate-800/80 max-h-[380px] overflow-y-auto mt-2">
        {notifications.map((item) => {
          const Icon = getIcon(item.type);
          const theme = getTheme(item.type);

          return (
            <div
              key={item.id}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.zoneId) selectZoneById(item.zoneId);
              }}
              className={`p-3 transition-colors cursor-pointer rounded-xl ${
                item.read ? 'opacity-60 hover:opacity-100 hover:bg-slate-800/40' : 'bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`p-1.5 rounded-lg border flex-shrink-0 ${theme}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {item.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
