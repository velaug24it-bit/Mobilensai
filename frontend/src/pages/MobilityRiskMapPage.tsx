import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  Video, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  User, 
  Bus, 
  Car, 
  Info,
  Clock,
  ArrowRight,
  TrendingDown,
  Navigation
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_RISK_ZONES, MOCK_CONFLICT_EVENTS } from '../data/mockData';
import { RiskZone, ConflictEvent, VideoAnalysisResult, CVObjectTrack } from '../types';
import { fetchRiskZones, fetchRecentConflicts, analyzeTrafficVideo } from '../services/api';

// Custom Map Marker Icons
const createPulseIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-risk-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background-color: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: ${color}; display: flex; align-items: center; justify-content: center; color: #020617; font-weight: 900; font-size: 10px; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          ${label}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const riskLevelColors: Record<string, string> = {
  Elevated: '#f43f5e', // rose-500
  High: '#f97316',     // orange-500
  Moderate: '#f59e0b', // amber-500
  Low: '#10b981'       // emerald-500
};

export const MobilityRiskMapPage: React.FC = () => {
  const { currentLocation } = useApp();
  const [riskZones, setRiskZones] = useState<RiskZone[]>(MOCK_RISK_ZONES);
  const [conflicts, setConflicts] = useState<ConflictEvent[]>(MOCK_CONFLICT_EVENTS);
  const [selectedZone, setSelectedZone] = useState<RiskZone>(MOCK_RISK_ZONES[0]);
  const [selectedConflict, setSelectedConflict] = useState<ConflictEvent | null>(MOCK_CONFLICT_EVENTS[0]);

  // Layer Toggles
  const [showZones, setShowZones] = useState(true);
  const [showConflicts, setShowConflicts] = useState(true);
  const [showPedestrianExposure, setShowPedestrianExposure] = useState(true);
  const [showBusStopProximity, setShowBusStopProximity] = useState(true);

  // Computer Vision Studio State
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'junction_crossing' | 'bus_bay_jaywalk' | 'suburban_arterial'>('junction_crossing');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysisResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Interactive CV Canvas Player simulation
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlayingCanvas, setIsPlayingCanvas] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Map center coordinates
  const mapCenter: [number, number] = [selectedZone.lat, selectedZone.lng];

  useEffect(() => {
    fetchRiskZones().then(zones => {
      if (zones && zones.length > 0) setRiskZones(zones);
    });
    fetchRecentConflicts().then(confs => {
      if (confs && confs.length > 0) setConflicts(confs);
    });
  }, []);

  // Run CV Video Analysis
  const handleRunCVAnalysis = async (presetOverride?: string, customFile?: File) => {
    setIsProcessingVideo(true);
    try {
      const result = await analyzeTrafficVideo({
        preset: presetOverride || selectedPreset,
        file: customFile || uploadedFile || undefined
      });
      if (result) {
        setVideoAnalysis(result);
        setCurrentFrameIdx(0);
        setIsPlayingCanvas(true);
      }
    } catch (e) {
      console.warn('Error running CV analysis:', e);
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Canvas Drawing Loop for Trajectory Tracking & Conflicts
  useEffect(() => {
    if (!videoAnalysis || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frames = videoAnalysis.frame_samples;
    if (!frames || frames.length === 0) return;

    let frameTimer: any;
    if (isPlayingCanvas) {
      frameTimer = setInterval(() => {
        setCurrentFrameIdx(prev => (prev + 1) % frames.length);
      }, 1600);
    }

    const currentSample = frames[currentFrameIdx] || frames[0];

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Simulated Road Surface
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Road Lanes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.45);
    ctx.lineTo(canvas.width, canvas.height * 0.45);
    ctx.moveTo(0, canvas.height * 0.75);
    ctx.lineTo(canvas.width, canvas.height * 0.75);
    ctx.stroke();

    // Crosswalk Zebra Pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let x = canvas.width * 0.35; x <= canvas.width * 0.50; x += 18) {
      ctx.fillRect(x, canvas.height * 0.35, 10, canvas.height * 0.45);
    }

    // Bus Stop Bay
    ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.fillRect(canvas.width * 0.18, canvas.height * 0.28, canvas.width * 0.22, canvas.height * 0.22);
    ctx.strokeRect(canvas.width * 0.18, canvas.height * 0.28, canvas.width * 0.22, canvas.height * 0.22);
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText('BUS BAY 3', canvas.width * 0.19, canvas.height * 0.33);

    // Draw Tracked Objects & Motion Vectors
    currentSample.objects.forEach(obj => {
      const bx = obj.box[0] * canvas.width;
      const by = obj.box[1] * canvas.height;
      const bw = obj.box[2] * canvas.width;
      const bh = obj.box[3] * canvas.height;

      const isConflict = obj.conflict;
      const strokeColor = isConflict ? '#f43f5e' : obj.class === 'Person' ? '#10b981' : '#38bdf8';

      // Object Bounding Box
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isConflict ? 2.5 : 1.5;
      ctx.strokeRect(bx, by, bw, bh);

      // Trajectory Motion Vector Arrow
      const vx = obj.vector[0] * canvas.width * 2.5;
      const vy = obj.vector[1] * canvas.height * 2.5;
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2, by + bh / 2);
      ctx.lineTo(bx + bw / 2 + vx, by + bh / 2 + vy);
      ctx.stroke();

      // Label Pill
      ctx.fillStyle = isConflict ? 'rgba(244, 63, 94, 0.9)' : 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(bx, by - 16, Math.max(70, bw + 20), 15);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`${obj.class} #${obj.id} (${obj.speed} km/h)`, bx + 3, by - 5);

      // Conflict Alert Callout
      if (isConflict && obj.tag) {
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(obj.tag, bx, by + bh + 16);
      }
    });

    return () => {
      if (frameTimer) clearInterval(frameTimer);
    };
  }, [videoAnalysis, currentFrameIdx, isPlayingCanvas]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Mobility Risk Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              🟡 DEMO SIMULATION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Road Safety & Mobility Risk Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Analyzing road-user interactions, trajectory conflicts, and pedestrian exposure. Identifying areas with elevated mobility risk indicators without predicting individual accidents.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsCVModalOpen(true);
              if (!videoAnalysis) handleRunCVAnalysis('junction_crossing');
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all transform hover:scale-105"
          >
            <Video className="w-4 h-4 fill-current" />
            <span>Computer Vision Risk Studio</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Diagnostics Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Leaflet Interactive Map */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Map Layer Controls Bar */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Safety Layers:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowZones(!showZones)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                  showZones ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Risk Zones ({riskZones.length})
              </button>

              <button
                type="button"
                onClick={() => setShowConflicts(!showConflicts)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                  showConflicts ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                Near-Miss Conflicts ({conflicts.length})
              </button>

              <button
                type="button"
                onClick={() => setShowPedestrianExposure(!showPedestrianExposure)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                  showPedestrianExposure ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pedestrian Exposure
              </button>

              <button
                type="button"
                onClick={() => setShowBusStopProximity(!showBusStopProximity)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                  showBusStopProximity ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Bus Stop Bays
              </button>
            </div>
          </div>

          {/* Leaflet Map Box */}
          <div className="relative h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              className="z-10"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Render Risk Zones as Glowing Buffer Radii */}
              {showZones && riskZones.map(zone => {
                const color = riskLevelColors[zone.risk_level] || '#f97316';
                const isSelected = selectedZone.id === zone.id;
                return (
                  <React.Fragment key={zone.id}>
                    <Circle
                      center={[zone.lat, zone.lng]}
                      radius={zone.radius_meters}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: isSelected ? 0.35 : 0.18,
                        weight: isSelected ? 3 : 1.5,
                        dashArray: isSelected ? undefined : '4, 4'
                      }}
                      eventHandlers={{
                        click: () => setSelectedZone(zone)
                      }}
                    >
                      <Popup className="dark-popup">
                        <div className="p-2 space-y-1 text-slate-900">
                          <strong className="block font-bold text-xs">{zone.code}: {zone.name}</strong>
                          <div className="text-[11px] text-slate-700">Risk Indicator: <span className="font-bold text-rose-600">{zone.risk_level} ({zone.risk_score}/100)</span></div>
                          <div className="text-[10px] text-slate-600">Simulated Conflicts: <strong>{zone.observed_conflicts}</strong></div>
                          <div className="text-[10px] text-slate-600">Primary Factor: {zone.primary_factor}</div>
                        </div>
                      </Popup>
                    </Circle>

                    <Marker
                      position={[zone.lat, zone.lng]}
                      icon={createPulseIcon(color, zone.code.replace('ZONE ', ''))}
                      eventHandlers={{
                        click: () => setSelectedZone(zone)
                      }}
                    />
                  </React.Fragment>
                );
              })}

              {/* Render Near-Miss Conflict Points */}
              {showConflicts && conflicts.map(conf => (
                <Marker
                  key={conf.id}
                  position={[conf.lat, conf.lng]}
                  icon={L.divIcon({
                    className: 'conflict-marker',
                    html: `
                      <div style="background-color: #f43f5e; color: #ffffff; padding: 2px 6px; border-radius: 6px; font-weight: 800; font-size: 10px; border: 1.5px solid #ffffff; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.6);">
                        ⚠️ ${conf.object_a_type.split(' ')[0]} ⇄ ${conf.object_b_type.split(' ')[0]}
                      </div>
                    `,
                    iconSize: [80, 24],
                    iconAnchor: [40, 12]
                  })}
                  eventHandlers={{
                    click: () => {
                      setSelectedConflict(conf);
                      const matching = riskZones.find(z => z.id === conf.zone_id);
                      if (matching) setSelectedZone(matching);
                    }
                  }}
                >
                  <Popup>
                    <div className="p-2 text-slate-900 text-xs">
                      <strong className="block text-rose-600 font-bold">{conf.conflict_type}</strong>
                      <div>TTC: <strong>{conf.time_to_collision_sec}s</strong> | PET: <strong>{conf.post_encroachment_time_sec}s</strong></div>
                      <div>Min Proximity: <strong>{conf.minimum_distance_meters}m</strong></div>
                      <div className="text-[10px] text-slate-600 mt-1">{conf.location_desc}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] space-y-1.5 shadow-xl">
              <span className="font-bold text-slate-200 block mb-1">Mobility Risk Indicator Legend</span>
              <div className="flex items-center gap-2 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Elevated Risk (Score 80–100)</span>
              </div>
              <div className="flex items-center gap-2 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>High Risk (Score 65–79)</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Moderate Risk (Score 40–64)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Low Risk (Score &lt; 40)</span>
              </div>
              <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-800 italic">
                Analytical indicators — not an accident prediction
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Zone Detail & Interaction Analytics */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Zone Detail Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  Selected Hotspot Area
                </span>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedZone.code}: {selectedZone.name}</span>
                </h2>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  selectedZone.risk_level === 'Elevated' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  selectedZone.risk_level === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {selectedZone.risk_level} Risk
                </span>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Score: <strong className="text-white">{selectedZone.risk_score}</strong>/100
                </div>
              </div>
            </div>

            {/* Diagnostic Metrics Matrix */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Observed Conflicts</span>
                <span className="text-lg font-black text-white">{selectedZone.observed_conflicts}</span>
                <span className="text-[10px] text-slate-500 block">Near-miss events</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Pedestrian Exposure</span>
                <span className="text-lg font-black text-rose-400">{selectedZone.pedestrian_exposure}</span>
                <span className="text-[10px] text-slate-500 block">High crossing flow</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Bus Stop Nearby</span>
                <span className="text-sm font-bold text-white truncate block">
                  {selectedZone.bus_stop_nearby ? 'Yes' : 'No'}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">{selectedZone.bus_stop_name}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Peak Risk Period</span>
                <span className="text-sm font-bold text-white block">{selectedZone.peak_period}</span>
                <span className="text-[10px] text-slate-500 block">Rush hour surge</span>
              </div>
            </div>

            {/* Qualitative Factor Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                Primary Contributing Factor:
              </span>
              <p className="text-slate-200 font-medium leading-relaxed">
                {selectedZone.primary_factor}
              </p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                Secondary: {selectedZone.secondary_factor}
              </div>
            </div>

            {/* AI Generated Risk Mitigation Options */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Targeted AI Safety Interventions
              </span>
              <div className="space-y-1.5">
                {selectedZone.recommended_interventions.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Near-Miss Conflict Event Highlight */}
          {selectedConflict && (
            <div className="p-4 rounded-2xl bg-[#1e1528] border border-purple-500/30 shadow-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-purple-300 tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Detailed Conflict Event ({selectedConflict.id})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{selectedConflict.timestamp}</span>
              </div>

              <div className="text-xs text-white font-bold">
                {selectedConflict.conflict_type}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">TTC Estimate</span>
                  <strong className="text-amber-400 text-xs font-mono">{selectedConflict.time_to_collision_sec}s</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">PET Margin</span>
                  <strong className="text-cyan-400 text-xs font-mono">{selectedConflict.post_encroachment_time_sec}s</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">Min Distance</span>
                  <strong className="text-rose-400 text-xs font-mono">{selectedConflict.minimum_distance_meters}m</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 italic">
                "{selectedConflict.object_a_type} crossing trajectory with {selectedConflict.object_b_type} at {selectedConflict.location_desc}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Computer Vision Video Risk Analysis Studio Modal */}
      {isCVModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-5xl rounded-3xl bg-[#0f172a] border border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Prototype Video Analytics Pipeline
                  </span>
                  <span className="text-xs text-amber-400 font-mono">
                    YOLO + ByteTrack Trajectory Simulator
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  Computer Vision Road-User Interaction Studio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCVModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Video Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preset Scenarios */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">1. Select Preset Traffic Clip:</span>
                <select
                  value={selectedPreset}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setSelectedPreset(val);
                    setUploadedFile(null);
                    setUploadedFileName(null);
                    handleRunCVAnalysis(val);
                  }}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="junction_crossing">Junction Crosswalk Conflict (Bus vs Pedestrian)</option>
                  <option value="bus_bay_jaywalk">Bus Bay Jaywalking (Sudden Deceleration)</option>
                  <option value="suburban_arterial">Suburban Multi-Modal Arterial (Mixed Fleet)</option>
                </select>
              </div>

              {/* Upload Custom Video */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">2. Or Upload Road / CCTV Video:</span>
                <label className="flex items-center justify-center p-2 rounded-lg bg-slate-950 border border-dashed border-slate-700 hover:border-cyan-400 cursor-pointer text-xs text-slate-300 transition-colors">
                  <Upload className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                  <span className="truncate">{uploadedFileName || 'Choose MP4 / WebM'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/mov"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setUploadedFile(file);
                        setUploadedFileName(file.name);
                        handleRunCVAnalysis(undefined, file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Trigger Analysis Button */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-300">3. Run Analytical Engine:</span>
                <button
                  type="button"
                  onClick={() => handleRunCVAnalysis()}
                  disabled={isProcessingVideo}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center justify-center gap-2"
                >
                  {isProcessingVideo ? 'Processing Pipeline...' : 'Process Video Trajectories'}
                </button>
              </div>
            </div>

            {/* Video Analysis Results & Canvas Player */}
            {videoAnalysis && (
              <div className="space-y-4">
                {/* Canvas Display with Live Trajectories */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center">
                  <canvas
                    ref={canvasRef}
                    width={720}
                    height={340}
                    className="w-full max-h-[360px] object-cover"
                  />

                  {/* Play/Pause & Frame Scrubbing Controls */}
                  <div className="w-full p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs px-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPlayingCanvas(!isPlayingCanvas)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                      >
                        {isPlayingCanvas ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Frame Sample {currentFrameIdx + 1} of {videoAnalysis.frame_samples.length} (Playback Speed: 1.0x)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/40">
                        {videoAnalysis.risk_indicator_rating} Risk Indicator
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Min TTC: {videoAnalysis.min_time_to_collision_sec}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analytical Metrics Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Objects Tracked</span>
                    <strong className="text-lg font-black text-white">{videoAnalysis.total_objects_detected}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Pedestrians</span>
                    <strong className="text-lg font-black text-emerald-400">{videoAnalysis.pedestrians_count}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Vehicles & Buses</span>
                    <strong className="text-lg font-black text-cyan-400">{videoAnalysis.vehicles_count}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Two-Wheelers</span>
                    <strong className="text-lg font-black text-purple-400">{videoAnalysis.motorcycles_count}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Potential Conflicts</span>
                    <strong className="text-lg font-black text-amber-400">{videoAnalysis.potential_conflict_events}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">High-Risk Events</span>
                    <strong className="text-lg font-black text-rose-400">{videoAnalysis.high_risk_interactions}</strong>
                  </div>
                </div>

                {/* Conflict Log List */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-slate-300 block">
                    Flagged Trajectory Conflict Moments:
                  </span>
                  <div className="space-y-2">
                    {videoAnalysis.key_conflict_events.map((evt, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              {evt.severity}
                            </span>
                            <strong className="text-white">{evt.event_title}</strong>
                            <span className="text-slate-400 font-mono text-[10px]">T+{evt.time_offset_sec}s</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-1">{evt.indicator}</p>
                        </div>
                        <div className="text-right text-[11px] font-mono text-slate-300 flex-shrink-0">
                          <div>TTC: <strong className="text-amber-400">{evt.time_to_collision_sec}s</strong></div>
                          <div>PET: <strong className="text-cyan-400">{evt.post_encroachment_time_sec}s</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer Alert */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                  {videoAnalysis.disclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
