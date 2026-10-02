import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Zone } from '../types';
import { useApp } from '../context/AppContext';
import { Users, Clock, Footprints, ArrowRightLeft, Sparkles, Layers, Navigation } from 'lucide-react';

interface MobilityMapProps {
  selectedZone: Zone;
  onSelectZone: (zone: Zone) => void;
  onSimulateForZone: (zone: Zone) => void;
}

// Custom map recenter helper
const RecenterMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

export const MobilityMap: React.FC<MobilityMapProps> = ({
  selectedZone,
  onSelectZone,
  onSimulateForZone
}) => {
  const { 
    zones, 
    currentLocation, 
    reports, 
    setIsReportModalOpen, 
    setReportPreFill, 
    upvoteReportAction 
  } = useApp();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  const getZoneColor = (score: number) => {
    if (score >= 80) return '#EF4444'; // Red - Severe
    if (score >= 65) return '#F97316'; // Orange - High
    if (score >= 45) return '#F59E0B'; // Yellow/Amber - Moderate
    return '#10B981'; // Green - Low
  };

  const createReportIcon = (category: string, severity: string) => {
    const bg = severity === 'critical' ? '#EF4444' : severity === 'high' ? '#F97316' : '#F59E0B';
    const iconChar = category === 'extreme_heat_no_shade' ? '☀️' : category === 'dangerous_crossing' ? '⚠️' : category === 'broken_ramp' ? '♿' : '⏱️';
    return L.divIcon({
      className: 'custom-leaflet-report-marker',
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          cursor: pointer;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 9999px;
            background: ${bg};
            opacity: 0.35;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: relative;
            width: 26px;
            height: 26px;
            border-radius: 9999px;
            background: #0f172a;
            border: 2px solid ${bg};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          ">
            ${iconChar}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const createCustomIcon = (zone: Zone, isSelected: boolean) => {
    const color = getZoneColor(zone.frictionScore);
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          cursor: pointer;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 9999px;
            background: ${color};
            opacity: ${isSelected ? 0.4 : 0.2};
            animation: pulse 2s infinite;
          "></div>
          <div style="
            position: relative;
            background: #111827;
            border: 2px solid ${color};
            border-radius: 9999px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 800;
            font-family: monospace;
          ">
            ${zone.frictionScore}
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
  };

  // Icon for user's live GPS location
  const createGPSUserIcon = () => {
    return L.divIcon({
      className: 'custom-gps-marker',
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 9999px;
            background: #06B6D4;
            opacity: 0.35;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            background: #06B6D4;
            border: 3px solid #FFFFFF;
            border-radius: 9999px;
            width: 18px;
            height: 18px;
            box-shadow: 0 0 15px #06B6D4;
          "></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  const filteredZones = zones.filter(z => {
    if (cityFilter !== 'all' && (z as any).city && (z as any).city.toLowerCase() !== cityFilter.toLowerCase()) {
      return false;
    }
    if (filterLevel === 'all') return true;
    if (filterLevel === 'high' && z.frictionScore >= 70) return true;
    if (filterLevel === 'moderate' && z.frictionScore >= 45 && z.frictionScore < 70) return true;
    if (filterLevel === 'low' && z.frictionScore < 45) return true;
    return true;
  });

  return (
    <div className="relative w-full h-[640px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0B0F19]">
      {/* Map Control Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-[#111827]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl max-w-sm">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Live Friction Hotspots
          </h4>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Loaded from MongoDB Atlas for <strong className="text-cyan-300">{currentLocation.city}</strong>
        </p>

        {/* City Filter Pills */}
        <div className="flex flex-wrap gap-1 mt-2">
          {['all', 'Tirunelveli', 'Thoothukudi', 'Bengaluru', 'Chennai'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCityFilter(c)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all ${
                cityFilter.toLowerCase() === c.toLowerCase()
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Severity Filter Pills & Report Button */}
        <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-slate-800">
          <div className="flex gap-1">
            {['all', 'high', 'moderate', 'low'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterLevel(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all ${
                  filterLevel === f
                    ? 'bg-slate-700 text-cyan-300 border border-cyan-400/40'
                    : 'bg-slate-800/60 text-slate-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setReportPreFill({
                locationName: 'Tirunelveli - Thoothukudi Corridor',
                lat: currentLocation.lat,
                lng: currentLocation.lng
              });
              setIsReportModalOpen(true);
            }}
            className="px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center gap-1 transition-all"
          >
            <span>🚩 Report Trap</span>
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#111827]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-400">Friction Index</span>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-slate-300">Severe Friction (&gt; 80)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-slate-300">High Friction (65 - 79)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-300">Moderate (45 - 64)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-300">Low Friction (&lt; 45)</span>
        </div>
      </div>

      {/* Selected Zone Detail Flyout Card */}
      {selectedZone && (
        <div className="absolute top-4 right-4 z-[1000] w-80 bg-[#111827]/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-5 shadow-2xl transition-all">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                  {selectedZone.code}
                </span>
                <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                  selectedZone.frictionScore >= 80 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  selectedZone.frictionScore >= 65 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  Friction {selectedZone.frictionScore}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1 leading-snug">{selectedZone.name}</h3>
            </div>
          </div>

          <div className="space-y-2.5 mt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> People Affected:
              </span>
              <strong className="text-white font-mono">{selectedZone.affectedDaily.toLocaleString()}/day</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" /> Avg Transfer Wait:
              </span>
              <strong className="text-rose-400 font-mono">{selectedZone.avgWaitMinutes} min</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" /> Avg Transfers:
              </span>
              <strong className="text-white font-mono">{selectedZone.avgTransfers} transfers</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-blue-400" /> Walking Burden:
              </span>
              <strong className="text-white font-mono">{selectedZone.walkingBurdenKm} km</strong>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Primary Bottleneck:</span>
              <p className="text-xs font-semibold text-rose-300 mt-0.5">{selectedZone.mainIssue}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Peak: {selectedZone.peakPeriod}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={() => onSimulateForZone(selectedZone)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Simulate Zone Interventions
            </button>
          </div>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <RecenterMap lat={currentLocation.lat} lng={currentLocation.lng} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User GPS Pin if active */}
        {currentLocation.isLiveGPS && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={createGPSUserIcon()}
          >
            <Popup>
              <div className="p-1 text-slate-100">
                <strong className="text-cyan-400">Your Current Location</strong>
                <p className="text-xs text-slate-300 mt-0.5">{currentLocation.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {filteredZones.map((zone) => {
          const color = getZoneColor(zone.frictionScore);
          const isSelected = selectedZone?.id === zone.id;

          return (
            <React.Fragment key={zone.id}>
              {/* Friction Coverage Circle */}
              <Circle
                center={[zone.lat, zone.lng]}
                radius={zone.radiusMeters}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.28 : 0.12,
                  weight: isSelected ? 3 : 1.5,
                  dashArray: isSelected ? '4, 4' : undefined
                }}
                eventHandlers={{
                  click: () => onSelectZone(zone)
                }}
              />

              {/* Marker pin */}
              <Marker
                position={[zone.lat, zone.lng]}
                icon={createCustomIcon(zone, isSelected)}
                eventHandlers={{
                  click: () => onSelectZone(zone)
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-100">
                    <div className="font-bold text-sm text-cyan-300">{zone.code}: {zone.name}</div>
                    <div className="text-xs text-rose-400 mt-1">Friction Score: {zone.frictionScore}/100</div>
                    <div className="text-xs text-slate-400 mt-0.5">{zone.mainIssue}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Affected: {zone.affectedDaily.toLocaleString()} people/day</div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Crowdsourced Citizen Friction Trap Markers */}
        {reports.map((rep) => {
          if (!rep.coordinates?.lat || !rep.coordinates?.lng) return null;
          return (
            <Marker
              key={rep.id}
              position={[rep.coordinates.lat, rep.coordinates.lng]}
              icon={createReportIcon(rep.category, rep.severity)}
            >
              <Popup>
                <div className="p-1 text-slate-100 space-y-1.5 min-w-[210px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-orange-400">Citizen Alert</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      rep.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {rep.severity}
                    </span>
                  </div>
                  <strong className="text-xs text-white block leading-snug">{rep.title}</strong>
                  <p className="text-[11px] text-slate-300 leading-snug">{rep.description}</p>
                  <div className="pt-1.5 border-t border-slate-700/80 flex items-center justify-between text-[10px]">
                    <span className="text-cyan-400 truncate max-w-[120px] font-medium">{rep.locationName}</span>
                    <button
                      type="button"
                      onClick={() => upvoteReportAction(rep.id)}
                      className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold transition-colors"
                      title="Upvote to notify city planners"
                    >
                      👍 {rep.upvotes}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
