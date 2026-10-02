import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, AlertTriangle, Layers, Info, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MobilityMap } from '../components/MobilityMap';
import { Zone } from '../types';

export const MobilityFrictionMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedZone, setSelectedZone, loadDemoJourney } = useApp();

  const handleSimulateForZone = (zone: Zone) => {
    setSelectedZone(zone);
    loadDemoJourney();
    navigate('/interventions');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Spatial Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Mobility Friction Map
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            "Where people experience mobility friction." Unlike vehicle congestion maps, this layer indexes pedestrian delays, transfer gaps, and inaccessible transit hubs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            Focus Hotspot: <strong className="text-rose-400">{selectedZone.code} ({selectedZone.name})</strong>
          </div>
        </div>
      </div>

      {/* Main Map Canvas */}
      <MobilityMap
        selectedZone={selectedZone}
        onSelectZone={(zone) => setSelectedZone(zone)}
        onSimulateForZone={handleSimulateForZone}
      />

      {/* Bottom Context Banner */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Click on any zone marker to inspect average transfer waits, walk burdens, and simulate targeted policy remedies.</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Leaflet OpenStreetMap Tile Provider
        </span>
      </div>
    </div>
  );
};
