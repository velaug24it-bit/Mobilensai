import React from 'react';
import { NearbyPlace } from '../types/places';
import { 
  X, 
  AlertTriangle, 
  Phone, 
  Navigation, 
  Hospital, 
  Pill, 
  Shield, 
  Flame, 
  ExternalLink,
  MapPin
} from 'lucide-react';

interface EmergencyModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: NearbyPlace[];
  onSelectPlace: (place: NearbyPlace) => void;
}

export const EmergencyModeModal: React.FC<EmergencyModeModalProps> = ({
  isOpen,
  onClose,
  places,
  onSelectPlace
}) => {
  if (!isOpen) return null;

  // Filter emergency services
  const emergencyPlaces = places
    .filter(p => ['hospital', 'pharmacy', 'police', 'fire_station'].includes(p.category))
    .sort((a, b) => (a.distance_meters || 9999) - (b.distance_meters || 9999));

  const getEmergencyIcon = (cat: string) => {
    switch (cat) {
      case 'hospital': return <Hospital className="w-5 h-5 text-rose-400" />;
      case 'pharmacy': return <Pill className="w-5 h-5 text-emerald-400" />;
      case 'police': return <Shield className="w-5 h-5 text-purple-400" />;
      case 'fire_station': return <Flame className="w-5 h-5 text-red-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 shadow-2xl text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Emergency Title Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                Priority Emergency Mode
              </span>
              <span className="text-xs font-mono text-slate-400">Nearest Facilities Active</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Emergency Nearby Services
            </h2>
          </div>
        </div>

        {/* Critical Statutory Disclaimer */}
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/60 text-xs text-rose-200 mb-6 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
            <Phone className="w-4 h-4 animate-bounce" />
            <span>Emergency Helplines (Toll-Free, 24/7):</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <a href="tel:108" className="bg-rose-600 hover:bg-rose-500 text-white font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow">
              <span>Ambulance: 108</span>
            </a>
            <a href="tel:112" className="bg-slate-800 hover:bg-slate-700 text-white font-black px-3 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700">
              <span>National Emergency: 112</span>
            </a>
            <a href="tel:100" className="bg-slate-800 hover:bg-slate-700 text-white font-black px-3 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700">
              <span>Police: 100</span>
            </a>
            <a href="tel:101" className="bg-slate-800 hover:bg-slate-700 text-white font-black px-3 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700">
              <span>Fire Rescue: 101</span>
            </a>
          </div>
          <p className="text-[11px] text-rose-300/80 italic mt-2">
            MobiLens AI is an intelligence simulator and transit decision support platform — NOT a municipal emergency dispatch provider. In case of immediate physical or life danger, dial 108/112 directly.
          </p>
        </div>

        {/* Emergency Services Listing */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Nearest Medical, Pharmacy & Public Safety Stations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emergencyPlaces.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      {getEmergencyIcon(p.category)}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400">{p.category_label}</span>
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{p.name}</h4>
                    </div>
                  </div>
                  <span className="text-xs font-black text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900">
                    {p.distance_meters} m
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{p.address}</span>
                </p>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800 text-slate-400">
                  <span>Walking: <strong className="text-white">~{p.walking_minutes} min</strong></span>
                  <span>Driving: <strong className="text-white">~{p.driving_minutes} min</strong></span>
                  <span className="text-emerald-400 font-bold">{p.status || '24/7'}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {p.phone && (
                    <a
                      href={`tel:${p.phone}`}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Facility</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`, '_blank');
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
