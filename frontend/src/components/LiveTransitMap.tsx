import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TransitVehicle, TransitRoute, TransitStop } from '../services/api';
import { Navigation, Info, Users, ShieldAlert, Sparkles, Footprints, AlertTriangle } from 'lucide-react';

interface LiveTransitMapProps {
  vehicles: TransitVehicle[];
  routes: TransitRoute[];
  stops: TransitStop[];
  selectedVehicle: TransitVehicle | null;
  selectedStop: TransitStop | null;
  userLocation: { lat: number; lng: number; label: string };
  onSelectVehicle: (vehicle: TransitVehicle) => void;
  onSelectStop: (stop: TransitStop) => void;
  onCheckCatchability?: (vehicle: TransitVehicle, stop: TransitStop) => void;
  onUseBusForJourney?: (vehicle: TransitVehicle) => void;
}

// Map center helper
const MapCenterController: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 13 }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center[0], center[1], zoom, map]);
  return null;
};

const LiveTransitMapInner: React.FC<LiveTransitMapProps> = ({
  vehicles,
  routes,
  stops,
  selectedVehicle,
  selectedStop,
  userLocation,
  onSelectVehicle,
  onSelectStop,
  onCheckCatchability,
  onUseBusForJourney
}) => {
  const safeRoutes = routes || [];
  const safeVehicles = vehicles || [];
  const safeStops = stops || [];
  
  // Center along the user's NH 138 corridor (TCR Airport to FXEC Tirunelveli)
  const corridorCenterLat = 8.727;
  const corridorCenterLng = 77.869;

  // Default to the user's active journey corridor so irrelevant city buses are not crammed
  const [activeRouteFilter, setActiveRouteFilter] = useState<string>('my_corridor');
  const [mapCenter, setMapCenter] = useState<[number, number]>([corridorCenterLat, corridorCenterLng]);
  const [zoomLevel, setZoomLevel] = useState<number>(11);

  // Filter routes and vehicles cleanly according to user's active journey
  const displayedRoutes = activeRouteFilter === 'my_corridor'
    ? safeRoutes.filter(r => r.route_id === 'ROUTE-15' || (r as any).id === 'ROUTE-15' || r.route_id === 'ROUTE-7B' || (r as any).id === 'ROUTE-7B')
    : activeRouteFilter === 'all'
    ? safeRoutes
    : safeRoutes.filter(r => r.route_id === activeRouteFilter || (r as any).id === activeRouteFilter);

  const displayedVehicles = activeRouteFilter === 'my_corridor'
    ? safeVehicles.filter(v => v.route_id === 'ROUTE-15' || v.route_id === 'ROUTE-7B' || v.route_short_name === '15' || v.route_short_name === '7B' || v.route_short_name === '7B-EV')
    : activeRouteFilter === 'all'
    ? safeVehicles 
    : safeVehicles.filter(v => v.route_id === activeRouteFilter || v.route_short_name === activeRouteFilter);

  const displayedStops = activeRouteFilter === 'my_corridor'
    ? safeStops.filter(s => {
        const sid = s.stop_id || (s as any).id || '';
        return (
          s.routes_served?.some(r => r === '15' || r === '7B' || r.includes('15') || r.includes('7B')) ||
          sid.startsWith('STOP-TCR') || sid.startsWith('STOP-VAG') || sid.startsWith('STOP-VAL') || 
          sid.startsWith('STOP-VAN') || sid.startsWith('STOP-THM') || sid.startsWith('STOP-NBS')
        );
      })
    : safeStops;

  // Ultra-clean compact bus marker pill — avoids crowding/congestion on the map
  const createBusIcon = (v: TransitVehicle, isSelected: boolean) => {
    const delayMin = v.delay_minutes ?? 0;
    const isDelayed = delayMin > 0;
    const borderRing = isSelected ? 'ring-2 ring-cyan-300 scale-110' : '';
    const routeShort = v.route_short_name || (v.route_id ? v.route_id.replace('ROUTE-', '') : '15');
    const etaMin = v.eta_next_stop_min ?? (v as any).eta_minutes ?? 4;
    const routeColor = v.route_color || (routeShort === '15' ? '#06b6d4' : routeShort.includes('7B') ? '#10b981' : '#8b5cf6');

    return L.divIcon({
      className: 'live-bus-div-icon',
      iconSize: [70, 28],
      iconAnchor: [35, 14],
      html: `
        <div class="cursor-pointer transition-all duration-200 ${borderRing}">
          <div style="background-color: #0b0f19; border: 2px solid ${routeColor};"
               class="px-2 py-0.5 rounded-full shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
            <span class="text-xs">🚌</span>
            <span style="color: ${routeColor};" class="text-xs font-black tracking-tight">
              ${routeShort}
            </span>
            <span class="text-[10px] font-bold text-white tracking-tight">
              ${etaMin}m
            </span>
            <span class="w-1.5 h-1.5 rounded-full ${isDelayed ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}"></span>
          </div>
        </div>
      `
    });
  };

  // Bus Stop DivIcon
  const createStopIcon = (stop: TransitStop, isSelected: boolean) => {
    return L.divIcon({
      className: 'live-stop-div-icon',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      html: `
        <div class="relative group cursor-pointer flex items-center justify-center">
          <div class="w-4 h-4 rounded-full bg-slate-900 border-2 ${isSelected ? 'border-amber-400 scale-125' : 'border-sky-400'} flex items-center justify-center shadow-lg transition-transform hover:scale-125">
            <div class="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
          </div>
          ${stop.is_accessible ? '<span class="absolute -top-1.5 -right-1.5 text-[8px] bg-indigo-600 text-white rounded-full w-3 h-3 flex items-center justify-center shadow">♿</span>' : ''}
        </div>
      `
    });
  };

  // User GPS Pin DivIcon
  const userGpsIcon = L.divIcon({
    className: 'live-user-div-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 rounded-full bg-cyan-500/20 animate-ping absolute"></div>
        <div class="w-6 h-6 rounded-full bg-cyan-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px]">
          🚶
        </div>
      </div>
    `
  });

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950">
      {/* Simulation Banner & Route Filters Header */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Simulation Notice Badge */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-xs font-black text-amber-300 tracking-wide">
            🟡 DEMO SIMULATION
          </span>
          <span className="text-[11px] text-slate-400 border-l border-slate-700 pl-2 hidden sm:inline">
            Active Corridor: TCR ➔ FXEC
          </span>
        </div>

        {/* Right: Route Switcher & Center to Me */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 p-1 rounded-xl shadow-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => {
                setActiveRouteFilter('my_corridor');
                setMapCenter([corridorCenterLat, corridorCenterLng]);
                setZoomLevel(11);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                activeRouteFilter === 'my_corridor'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🎯 My Route (TCR ➔ FXEC)</span>
            </button>
            <button
              onClick={() => {
                setActiveRouteFilter('ROUTE-15');
                setMapCenter([corridorCenterLat, corridorCenterLng]);
                setZoomLevel(11);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                activeRouteFilter === 'ROUTE-15'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Bus 15
            </button>
            <button
              onClick={() => {
                setActiveRouteFilter('ROUTE-7B');
                setMapCenter([8.728, 77.78]);
                setZoomLevel(12);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                activeRouteFilter === 'ROUTE-7B'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Feeder 7B
            </button>
            <button
              onClick={() => {
                setActiveRouteFilter('all');
                setMapCenter([corridorCenterLat, corridorCenterLng]);
                setZoomLevel(10);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                activeRouteFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Buses ({safeVehicles.length})
            </button>
          </div>

          {/* Quick Center to User */}
          <button
            onClick={() => {
              setMapCenter([userLocation.lat, userLocation.lng]);
              setZoomLevel(14);
            }}
            title="Center on My Departure Location"
            className="pointer-events-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black p-2 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-1 text-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My GPS</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapCenterController center={mapCenter} zoom={zoomLevel} />
        
        {/* OpenStreetMap Standard Tiles — Free, Reliable, No Watermark */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polylines (Robust position extraction) */}
        {displayedRoutes.map((r, idx) => {
          const rId = r.route_id || (r as any).id || `polyline-${idx}`;
          const coords: [number, number][] = (r.waypoints && Array.isArray(r.waypoints) && r.waypoints.length >= 2)
            ? r.waypoints
            : (r.stops && Array.isArray(r.stops) && r.stops.length >= 2)
            ? r.stops.map(s => [s.lat, s.lng] as [number, number])
            : [];

          if (!coords || coords.length < 2) return null;

          return (
            <Polyline
              key={rId}
              positions={coords}
              pathOptions={{
                color: r.color || '#06b6d4',
                weight: activeRouteFilter === rId || activeRouteFilter === 'my_corridor' ? 4.5 : 2.5,
                opacity: 0.9,
                dashArray: rId.includes('7B') ? '6, 8' : undefined
              }}
            />
          );
        })}

        {/* User GPS Pin */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userGpsIcon}>
          <Popup className="custom-transit-popup">
            <div className="p-2 text-slate-900">
              <div className="flex items-center gap-1.5 font-bold text-cyan-700 text-sm">
                <span>📍</span>
                <span>{userLocation.label}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Your live journey departure origin.
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Transit Stops (Filtered cleanly to active route) */}
        {displayedStops.map((stop, idx) => {
          const sId = stop.stop_id || (stop as any).id || `stop-${idx}`;
          const isSelected = selectedStop ? (selectedStop.stop_id === sId || (selectedStop as any).id === sId) : false;
          return (
            <Marker
              key={sId}
              position={[stop.lat, stop.lng]}
              icon={createStopIcon(stop, isSelected)}
              eventHandlers={{
                click: () => onSelectStop(stop)
              }}
            >
              <Popup className="custom-transit-popup">
                <div className="p-2.5 text-slate-900 min-w-[210px]">
                  <div className="flex items-center justify-between border-b pb-1.5 mb-1.5">
                    <span className="font-black text-slate-800 text-sm">{stop.stop_name}</span>
                    {stop.is_accessible && (
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        ♿ Accessible
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-700">Shelter:</span> {stop.shelter_type || 'Platform Canopy'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Routes:</span> {(stop.routes_served || []).join(', ') || 'Feeder & Express Lines'}
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectStop(stop)}
                    className="mt-2.5 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    View Stop Departures &rarr;
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Moving Buses */}
        {displayedVehicles.map(vehicle => {
          const isSelected = selectedVehicle?.vehicle_id === vehicle.vehicle_id;
          return (
            <Marker
              key={vehicle.vehicle_id}
              position={[vehicle.lat, vehicle.lng]}
              icon={createBusIcon(vehicle, isSelected)}
              eventHandlers={{
                click: () => onSelectVehicle(vehicle)
              }}
            >
              <Popup className="custom-transit-popup">
                <div className="p-2.5 text-slate-900 min-w-[240px]">
                  <div className="flex items-center justify-between border-b pb-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span style={{ backgroundColor: vehicle.route_color }} className="text-white text-xs font-black px-1.5 py-0.5 rounded">
                        {vehicle.route_short_name}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">{vehicle.vehicle_id}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      vehicle.delay_minutes > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {vehicle.delay_minutes > 0 ? `+${vehicle.delay_minutes}m Late` : 'On Schedule'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1 mb-2">
                    <div>
                      <span className="font-semibold">Heading:</span> {vehicle.headsign}
                    </div>
                    <div>
                      <span className="font-semibold">Next Stop:</span> {vehicle.next_stop_name} ({vehicle.eta_next_stop_min} min)
                    </div>
                    <div>
                      <span className="font-semibold">Distance from you:</span> {vehicle.distance_from_user_km} km
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Crowding:</span>
                      <span className={`text-[10px] font-bold px-1.5 rounded ${
                        vehicle.crowding_level === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                        vehicle.crowding_level === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {vehicle.crowding_level} (Est.)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1 border-t">
                    {onCheckCatchability && selectedStop && (
                      <button
                        onClick={() => onCheckCatchability(vehicle, selectedStop)}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        <Footprints className="w-3.5 h-3.5" />
                        Can I Catch This Bus?
                      </button>
                    )}
                    {onUseBusForJourney && (
                      <button
                        onClick={() => onUseBusForJourney(vehicle)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Use for My Journey
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Selected Bus Quick Card (Bottom Left) */}
      {selectedVehicle && (
        <div className="absolute bottom-4 left-4 z-[1000] max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                style={{ backgroundColor: selectedVehicle.route_color }} 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md"
              >
                {selectedVehicle.route_short_name}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">Bus {selectedVehicle.route_short_name}</h4>
                  <span className="text-xs text-slate-400 font-mono">({selectedVehicle.vehicle_id})</span>
                </div>
                <p className="text-xs text-slate-300">To {selectedVehicle.headsign}</p>
              </div>
            </div>
            <button
              onClick={() => onSelectVehicle(selectedVehicle)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 my-3 text-center">
            <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase block">Next Stop</span>
              <span className="text-xs font-black text-cyan-300 truncate block">{selectedVehicle.next_stop_name}</span>
            </div>
            <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase block">Distance</span>
              <span className="text-xs font-black text-emerald-400 block">{selectedVehicle.distance_from_user_km} km</span>
            </div>
            <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase block">Next ETA</span>
              <span className="text-xs font-black text-amber-400 block">{selectedVehicle.eta_next_stop_min} min</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCheckCatchability && selectedStop && (
              <button
                onClick={() => onCheckCatchability(selectedVehicle, selectedStop)}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
              >
                <Footprints className="w-4 h-4" />
                Can I Catch This Bus?
              </button>
            )}
            {onUseBusForJourney && (
              <button
                onClick={() => onUseBusForJourney(selectedVehicle)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Select Bus
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

class LiveMapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('LiveTransitMap caught error:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[620px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <span className="text-3xl">🗺️</span>
          <h4 className="text-sm font-bold text-white">Live Transit Map Loading</h4>
          <p className="text-xs text-slate-400 max-w-sm">
            Updating GPS coordinates and route tracks from the real-time simulation engine.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
          >
            Refresh Map View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const LiveTransitMap: React.FC<LiveTransitMapProps> = (props) => (
  <LiveMapErrorBoundary>
    <LiveTransitMapInner {...props} />
  </LiveMapErrorBoundary>
);
