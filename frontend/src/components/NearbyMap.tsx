import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NearbyPlace } from '../types/places';
import { CATEGORY_COLOR_MAP } from '../data/placesData';
import { Footprints, Navigation, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';

interface NearbyMapProps {
  places: NearbyPlace[];
  selectedPlace: NearbyPlace | null;
  anchorLocation: { lat: number; lng: number; label: string };
  destinationLocation?: { lat: number; lng: number; label: string };
  radiusMeters?: number;
  onSelectPlace: (place: NearbyPlace) => void;
  onOpenDetails: (place: NearbyPlace) => void;
  onAddToJourney?: (place: NearbyPlace) => void;
}

interface CorridorMilestone {
  id: string;
  name: string;
  shortLabel: string;
  lat: number;
  lng: number;
  type: 'origin' | 'bus_stop' | 'midway' | 'bridge' | 'station' | 'destination';
}

export const JOURNEY_CORRIDOR_MILESTONES: CorridorMilestone[] = [
  { id: 'origin', name: 'Thoothukudi Airport (TCR)', shortLabel: '🛫 TCR Airport', lat: 8.7242, lng: 78.0265, type: 'origin' },
  { id: 'bus_stop', name: 'Vagaikulam Feeder Stop', shortLabel: '🚌 Vagaikulam Feeder', lat: 8.7258, lng: 77.9850, type: 'bus_stop' },
  { id: 'midway', name: 'Vallanadu Highway Midway', shortLabel: '🛣️ Vallanadu Toll', lat: 8.7275, lng: 77.8820, type: 'midway' },
  { id: 'bridge', name: 'Thamirabarani River Bridge', shortLabel: '🌊 Thamirabarani Bridge', lat: 8.7292, lng: 77.7855, type: 'bridge' },
  { id: 'station', name: 'Tirunelveli Junction Hub', shortLabel: '🚆 Tirunelveli Jn', lat: 8.7280, lng: 77.7180, type: 'station' },
  { id: 'destination', name: 'FXEC Campus Gate (Vannarpettai)', shortLabel: '🎓 FXEC Campus', lat: 8.7300, lng: 77.7126, type: 'destination' },
];

export const CORRIDOR_POLYLINE_POINTS: [number, number][] = JOURNEY_CORRIDOR_MILESTONES.map(m => [m.lat, m.lng]);

// Controller to smoothly pan & zoom or fit full corridor bounds
const MapBoundsController: React.FC<{
  selectedPlace: NearbyPlace | null;
  anchorLocation: { lat: number; lng: number };
  places: NearbyPlace[];
  isCorridorMode: boolean;
}> = ({ selectedPlace, anchorLocation, places, isCorridorMode }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace) {
      map.flyTo([selectedPlace.lat, selectedPlace.lng], 16, { duration: 0.8 });
    } else if (isCorridorMode || places.length > 5) {
      const allCoords: [number, number][] = [
        ...CORRIDOR_POLYLINE_POINTS,
        ...places.map(p => [p.lat, p.lng] as [number, number])
      ];
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
      }
    } else {
      map.flyTo([anchorLocation.lat, anchorLocation.lng], 14, { duration: 0.8 });
    }
  }, [selectedPlace, isCorridorMode, anchorLocation.lat, anchorLocation.lng, places.length, map]);

  return null;
};

// SVG icon generator for map markers
const getCategorySvg = (cat: string, color: string) => {
  switch (cat) {
    case 'hospital':
      return `<path d="M12 6v12m-6-6h12" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'pharmacy':
      return `<path d="M10.5 20.5l10-10a4.95 4.95 0 10-7-7l-10 10a4.95 4.95 0 107 7z M8.5 8.5l7 7" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
    case 'restaurant':
      return `<path d="M18 2v6a3 3 0 01-3 3 3 3 0 01-3-3V2m0 9v11m-6-16v18" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
    case 'fuel':
      return `<path d="M3 22V4a2 2 0 012-2h6a2 2 0 012 2v18M13 10h4a2 2 0 012 2v3a2 2 0 002 2h0a2 2 0 002-2V9a2 2 0 00-2-2h-1" stroke="${color}" stroke-width="2"/>`;
    case 'toilet':
      return `<path d="M9 6a3 3 0 106 0 3 3 0 00-6 0zm-2 8h10v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6z" stroke="${color}" stroke-width="2"/>`;
    case 'atm':
      return `<rect x="2" y="5" width="20" height="14" rx="2" stroke="${color}" stroke-width="2"/><line x1="2" y1="10" x2="22" y2="10" stroke="${color}" stroke-width="2"/>`;
    case 'ev_charging':
      return `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'police':
      return `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="${color}" stroke-width="2"/>`;
    case 'fire_station':
      return `<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" stroke="${color}" stroke-width="2"/>`;
    default:
      return `<circle cx="12" cy="12" r="6" stroke="${color}" stroke-width="2"/>`;
  }
};

export const NearbyMap: React.FC<NearbyMapProps> = ({
  places,
  selectedPlace,
  anchorLocation,
  destinationLocation,
  radiusMeters = 3000,
  onSelectPlace,
  onOpenDetails,
  onAddToJourney
}) => {
  const isCorridorMode = radiusMeters >= 30000 || anchorLocation.label.includes('Entire Journey');

  // Custom User/Anchor beacon icon
  const anchorIcon = L.divIcon({
    className: 'anchor-beacon-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(6, 182, 212, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 20px; height: 20px; border-radius: 50%; background: #06b6d4; border: 3px solid #0f172a; box-shadow: 0 0 12px #06b6d4; display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      </div>
    `
  });

  // Milestone Icon generator
  const createMilestoneIcon = (milestone: CorridorMilestone) => {
    const isEnd = milestone.type === 'destination' || milestone.type === 'origin';
    const bg = milestone.type === 'destination' 
      ? '#a855f7' 
      : milestone.type === 'origin' 
      ? '#06b6d4' 
      : milestone.type === 'station'
      ? '#3b82f6'
      : '#f59e0b';
    const border = milestone.type === 'destination' ? '#3b0764' : '#0f172a';

    return L.divIcon({
      className: 'milestone-pin-icon',
      iconSize: [110, 36],
      iconAnchor: [55, 34],
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
          <div style="
            background: ${bg};
            color: #ffffff;
            padding: 3px 8px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 800;
            border: 2px solid ${border};
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            white-space: nowrap;
            letter-spacing: -0.2px;
          ">
            ${milestone.shortLabel}
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${bg};"></div>
        </div>
      `
    });
  };

  // Custom Place marker
  const createPlaceIcon = (place: NearbyPlace, isSelected: boolean) => {
    const isEmerg = ['hospital', 'pharmacy', 'police', 'fire_station'].includes(place.category);
    const color = isEmerg ? '#f43f5e' : place.category === 'ev_charging' ? '#10b981' : place.category === 'fuel' ? '#f97316' : '#38bdf8';
    const ring = isSelected ? `box-shadow: 0 0 0 3px ${color}, 0 0 18px ${color}; transform: scale(1.22); z-index: 1000;` : '';

    return L.divIcon({
      className: 'nearby-place-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      html: `
        <div style="
          width: 34px; height: 34px;
          background: #090d16;
          border: 2px solid ${color};
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          ${ring}
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            ${getCategorySvg(place.category, color)}
          </svg>
        </div>
      `
    });
  };

  // Detour path polyline (Anchor or nearest stop -> Place)
  const detourLine: [number, number][] = selectedPlace
    ? [
        [selectedPlace.lat, selectedPlace.lng],
        [destinationLocation?.lat || 8.7300, destinationLocation?.lng || 77.7126]
      ]
    : [];

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <MapContainer
        center={[8.7275, 77.8500]}
        zoom={11}
        style={{ width: '100%', height: '100%', background: '#090d16' }}
        attributionControl={false}
      >
        <MapBoundsController
          selectedPlace={selectedPlace}
          anchorLocation={{ lat: anchorLocation.lat, lng: anchorLocation.lng }}
          places={places}
          isCorridorMode={isCorridorMode}
        />

        {/* OpenStreetMap Standard Tiles — 100% Free, Permanent, No Watermark, No API Key */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Full Journey Highway Corridor Polyline (Dashed Highway Transit Line) */}
        <Polyline
          positions={CORRIDOR_POLYLINE_POINTS}
          pathOptions={{
            color: '#06b6d4',
            weight: 5,
            dashArray: '8, 8',
            opacity: 0.85
          }}
        />

        {/* Inner Glow Line for High Visual Contrast */}
        <Polyline
          positions={CORRIDOR_POLYLINE_POINTS}
          pathOptions={{
            color: '#38bdf8',
            weight: 2,
            opacity: 0.95
          }}
        />

        {/* Search radius visualization only in localized single-anchor mode */}
        {!isCorridorMode && (
          <Circle
            center={[anchorLocation.lat, anchorLocation.lng]}
            radius={radiusMeters}
            pathOptions={{
              color: '#06b6d4',
              weight: 1.5,
              dashArray: '5, 8',
              fillColor: '#06b6d4',
              fillOpacity: 0.05
            }}
          />
        )}

        {/* Detour path visualization if place selected */}
        {selectedPlace && detourLine.length >= 2 && (
          <Polyline
            positions={detourLine}
            pathOptions={{
              color: '#f59e0b',
              weight: 3,
              dashArray: '5, 5',
              opacity: 0.9
            }}
          />
        )}

        {/* Journey Corridor Milestone Markers */}
        {JOURNEY_CORRIDOR_MILESTONES.map((m) => (
          <Marker
            key={`ms-${m.id}`}
            position={[m.lat, m.lng]}
            icon={createMilestoneIcon(m)}
          >
            <Popup className="mobi-popup">
              <div className="p-2 text-slate-100 font-sans text-xs">
                <span className="font-bold text-cyan-400 block uppercase tracking-wider text-[10px]">Journey Milestone</span>
                <p className="font-semibold text-white mt-0.5">{m.name}</p>
                <span className="text-[10px] text-slate-400 block mt-1">NH 138 Corridor Link</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Anchor Location Beacon if not in entire journey mode */}
        {!isCorridorMode && (
          <Marker position={[anchorLocation.lat, anchorLocation.lng]} icon={anchorIcon}>
            <Popup className="mobi-popup">
              <div className="p-2 text-slate-100 font-sans text-xs">
                <span className="font-bold text-cyan-400 block uppercase tracking-wider text-[10px]">Your Current Anchor</span>
                <p className="font-semibold text-white mt-0.5">{anchorLocation.label}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Places Markers Distributed Across the Route */}
        {places.map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createPlaceIcon(place, isSelected)}
              eventHandlers={{
                click: () => onSelectPlace(place)
              }}
            >
              <Popup className="mobi-popup">
                <div className="p-3 text-slate-100 font-sans min-w-[220px]">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
                      {place.category_label}
                    </span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${place.verification_status === 'LIVE_VERIFIED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                      {place.verification_status === 'LIVE_VERIFIED' ? '● VERIFIED' : '🟡 DEMO'}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white leading-tight">{place.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{place.address}</p>

                  {place.corridor_segment && (
                    <div className="mt-1 text-[10px] text-cyan-300 font-medium flex items-center gap-1">
                      <span>📍 Along: {place.corridor_segment}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1.5 my-2.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">From Stop</span>
                      <strong className="text-cyan-300 font-bold">{place.distance_meters ? `${place.distance_meters} m` : 'Near'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Walk Time</span>
                      <strong className="text-amber-300 font-bold">{place.walking_minutes ? `~${place.walking_minutes} min` : '2 min'}</strong>
                    </div>
                  </div>

                  {place.has_time_verdict && (
                    <div className="mb-2 text-[10px] font-semibold flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{place.has_time_verdict} before bus (~{place.time_window_minutes}m visit)</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onOpenDetails(place)}
                      className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {onAddToJourney && (
                      <button
                        onClick={() => onAddToJourney(place)}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-[10px] font-black py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-transform hover:scale-105 shadow"
                      >
                        <span>Add Stop</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend & Summary Pill */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-xl flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-white">Journey Corridor Essentials</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-[11px] text-slate-300">
          Showing <strong className="text-cyan-400">{places.length}</strong> places {isCorridorMode ? 'throughout entire route' : `within ${radiusMeters >= 1000 ? `${radiusMeters/1000} km` : `${radiusMeters} m`}`}
        </span>
      </div>
    </div>
  );
};
