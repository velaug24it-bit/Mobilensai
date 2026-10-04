import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NearbyPlace, PlaceCategory, CityAccessAudit } from '../types/places';
import { 
  fetchNearbyPlaces, 
  fetchPlaceCategories, 
  searchNearbyPlacesQuery, 
  addPlaceToActiveJourney,
  fetchCityAccessAudit 
} from '../services/api';
import { PLACE_CATEGORIES, FALLBACK_PLACES } from '../data/placesData';
import { NearbyMap } from '../components/NearbyMap';
import { NearbyPlaceCard } from '../components/NearbyPlaceCard';
import { PlaceDetailModal } from '../components/PlaceDetailModal';
import { IHaveTimeBanner } from '../components/IHaveTimeBanner';
import { EmergencyModeModal } from '../components/EmergencyModeModal';
import { HackathonNearbyWalkthrough } from '../components/HackathonNearbyWalkthrough';
import { 
  Search, 
  MapPin, 
  Filter, 
  Compass, 
  AlertTriangle, 
  Sparkles, 
  Accessibility, 
  Clock, 
  TrendingUp, 
  Navigation, 
  Layers, 
  Bus, 
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Crosshair,
  Route
} from 'lucide-react';

export const MobilityNearbyPage: React.FC = () => {
  const { currentLocation, currentJourney, departureHour, heatStressLevel, heatMultiplier } = useApp();

  // Location Anchors along the chosen journey corridor
  const ANCHOR_PRESETS = [
    { 
      id: 'entire_journey', 
      label: '🛣️ Throughout Entire Journey (All Stops)', 
      lat: 8.7275, 
      lng: 77.8500, 
      context: 'corridor', 
      badge: 'Full Corridor' 
    },
    { 
      id: 'origin', 
      label: '🛫 Origin: Thoothukudi Airport (TCR)', 
      lat: 8.7242, 
      lng: 78.0265, 
      context: 'home',
      badge: 'Airport Terminal'
    },
    { 
      id: 'bus_stop', 
      label: '🚌 Stop 1: Vagaikulam Feeder (NH 138)', 
      lat: 8.7258, 
      lng: 77.9850, 
      context: 'bus_stop',
      badge: 'Feeder Stop'
    },
    { 
      id: 'corridor', 
      label: '🛣️ Stop 2: Vallanadu Highway & Toll', 
      lat: 8.7275, 
      lng: 77.8820, 
      context: 'corridor',
      badge: 'Midway Highway'
    },
    { 
      id: 'bridge', 
      label: '🌊 Stop 3: Thamirabarani River Bridge', 
      lat: 8.7292, 
      lng: 77.7855, 
      context: 'corridor',
      badge: 'River Link'
    },
    { 
      id: 'station', 
      label: '🚆 Stop 4: Tirunelveli Junction Hub', 
      lat: 8.7280, 
      lng: 77.7180, 
      context: 'station',
      badge: 'Railway Hub'
    },
    { 
      id: 'destination', 
      label: '🎓 Stop 5: FXEC Campus Gate (Vannarpettai)', 
      lat: 8.7300, 
      lng: 77.7126, 
      context: 'destination',
      badge: 'Destination Gate'
    },
    { 
      id: 'current_gps', 
      label: '📍 My Current GPS Location', 
      lat: currentLocation.lat || 8.7258, 
      lng: currentLocation.lng || 77.9850, 
      context: 'home',
      badge: 'Live GPS'
    },
  ];

  // Corridor segments for interactive milestone filtering
  const CORRIDOR_SEGMENTS = [
    { id: 'all', label: 'All Journey Stops', countMatch: '' },
    { id: 'origin', label: '🛫 TCR Airport', countMatch: 'Thoothukudi Airport' },
    { id: 'bus_stop', label: '🚌 Vagaikulam Feeder', countMatch: 'Vagaikulam' },
    { id: 'midway', label: '🛣️ Vallanadu Toll', countMatch: 'Vallanadu' },
    { id: 'bridge', label: '🌊 Thamirabarani Bridge', countMatch: 'Thamirabarani' },
    { id: 'station', label: '🚆 Tirunelveli Jn', countMatch: 'Tirunelveli Junction' },
    { id: 'destination', label: '🎓 FXEC Campus Gate', countMatch: 'FXEC' },
  ];

  const [activeAnchor, setActiveAnchor] = useState(ANCHOR_PRESETS[0]);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [categories, setCategories] = useState<PlaceCategory[]>(PLACE_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [places, setPlaces] = useState<NearbyPlace[]>(FALLBACK_PLACES);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  // Filters
  const [filterAccessibleOnly, setFilterAccessibleOnly] = useState<boolean>(false);
  const [filterOpenNowOnly, setFilterOpenNowOnly] = useState<boolean>(false);
  const [filterMax500m, setFilterMax500m] = useState<boolean>(false);
  const [filterAlongJourney, setFilterAlongJourney] = useState<boolean>(false);
  const [filterLowRiskOnly, setFilterLowRiskOnly] = useState<boolean>(false);
  const [radiusMeters, setRadiusMeters] = useState<number>(45000);

  // Live Bus simulation anchor
  const [busEtaMinutes, setBusEtaMinutes] = useState<number>(12);
  const [busRouteName, setBusRouteName] = useState<string>('Bus 12A / Route 15');

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);

  // City Planner View (Section 21)
  const [showPlannerAudit, setShowPlannerAudit] = useState<boolean>(false);
  const [cityAudit, setCityAudit] = useState<CityAccessAudit | null>(null);

  // Notifications / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Categories on mount
  useEffect(() => {
    fetchPlaceCategories().then(cats => {
      if (cats && cats.length > 0) setCategories(cats);
    });
    fetchCityAccessAudit('ZONE-17').then(audit => {
      if (audit) setCityAudit(audit);
    });
  }, []);

  // Fetch places whenever anchor, category, query, or emergency filters change
  useEffect(() => {
    setLoading(true);
    const isCorridor = activeAnchor.id === 'entire_journey';
    fetchNearbyPlaces({
      lat: activeAnchor.lat,
      lng: activeAnchor.lng,
      radius_meters: isCorridor ? 45000 : radiusMeters,
      along_corridor: isCorridor,
      scope: isCorridor ? 'entire_journey' : activeAnchor.id,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      query: searchQuery.trim() || undefined,
      accessible_only: filterAccessibleOnly,
      open_now_only: filterOpenNowOnly,
      bus_eta_min: busEtaMinutes,
      limit: 50
    }).then(res => {
      setPlaces(res);
      if (res.length > 0 && !selectedPlace) {
        setSelectedPlace(res[0]);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, [activeAnchor, selectedCategory, radiusMeters, filterAccessibleOnly, filterOpenNowOnly, busEtaMinutes]);

  // Handle Natural Language Search Submission
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    const res = await searchNearbyPlacesQuery(searchQuery, activeAnchor.lat, activeAnchor.lng);
    setPlaces(res);
    if (res.length > 0) setSelectedPlace(res[0]);
    setLoading(false);
  };

  // Filtered places according to secondary checkboxes and selected segment
  const displayedPlaces = useMemo(() => {
    return places.filter(p => {
      if (selectedSegment !== 'all') {
        const seg = CORRIDOR_SEGMENTS.find(s => s.id === selectedSegment);
        if (seg && seg.countMatch) {
          const segName = p.corridor_segment || '';
          const addressName = p.address || '';
          const placeName = p.name || '';
          if (!segName.includes(seg.countMatch) && !addressName.includes(seg.countMatch) && !placeName.includes(seg.countMatch)) {
            return false;
          }
        }
      }
      if (filterMax500m && (p.distance_meters || 0) > 500) return false;
      if (filterLowRiskOnly && p.risk_zone_warning) return false;
      if (filterAlongJourney && p.context_anchor !== 'corridor' && p.context_anchor !== 'bus_stop') return false;
      return true;
    });
  }, [places, selectedSegment, filterMax500m, filterLowRiskOnly, filterAlongJourney]);

  // Add stop to active journey action
  const handleAddToJourney = async (place: NearbyPlace) => {
    const res = await addPlaceToActiveJourney(place.id);
    if (res && res.status === 'success') {
      setToastMessage(`✓ Added "${place.name}" as waypoint! Journey recalculated: +${res.recalculated_journey.additional_walking_minutes}m walk, new friction: ${res.recalculated_journey.new_friction_score}.`);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleOpenDetails = (place: NearbyPlace) => {
    setSelectedPlace(place);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-5 pb-16 font-sans animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[1500] max-w-md p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-inner">
            <Compass className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-white tracking-tight">Mobility Nearby</h1>
              <span className="text-[11px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                Journey Essentials
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full">
                🟡 Demo Simulation Dataset
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Showing places throughout your journey:</span>
              <strong className="text-cyan-300 font-semibold">{currentJourney?.title || `${currentJourney?.origin || 'Thoothukudi Airport'} ➔ ${currentJourney?.destination || 'Francis Xavier Engineering College'}`}</strong>
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hackathon Walkthrough */}
          <button
            onClick={() => setIsWalkthroughOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Hackathon Demo Flow (11 Steps)</span>
          </button>

          {/* Emergency Mode Button */}
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-950/40 transition-all hover:scale-105 animate-pulse"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>🚨 Emergency Nearby</span>
          </button>

          {/* City Planner Audit View Toggle */}
          <button
            onClick={() => setShowPlannerAudit(!showPlannerAudit)}
            className={`text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors border ${
              showPlannerAudit
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{showPlannerAudit ? 'Hide Planner Audit' : 'City Planner View'}</span>
          </button>
        </div>
      </div>

      {/* Context-Aware Location Anchors (Section 3) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Context Anchor: Where Are You In Your Journey?</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Active: <strong className="text-cyan-400">{activeAnchor.label}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ANCHOR_PRESETS.map((anchor) => {
            const isAct = activeAnchor.id === anchor.id;
            return (
              <button
                key={anchor.id}
                onClick={() => setActiveAnchor(anchor)}
                className={`text-xs font-bold px-3 py-2 rounded-xl border whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  isAct 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/40' 
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <Crosshair className={`w-3.5 h-3.5 ${isAct ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{anchor.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* "I Have Time" Smart Transit Countdown Banner (Section 5) */}
      <IHaveTimeBanner
        busEtaMin={busEtaMinutes}
        busRouteName={busRouteName}
        nearbyPlaces={displayedPlaces}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onSelectPlace={(p) => {
          setSelectedPlace(p);
          setIsDetailModalOpen(true);
        }}
      />

      {/* Search & Category Filter Section */}
      <div className="space-y-3">
        {/* Natural Language Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='What do you need? (e.g. "I need medicine", "hospital", "petrol station", "ATM", "toilet", "coffee")'
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-2xl py-3.5 pl-11 pr-24 text-sm text-white placeholder-slate-500 shadow-lg focus:outline-none transition-colors"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-colors shadow"
          >
            Search
          </button>
        </form>

        {/* Category Carousel (19 Categories) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl border whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            ★ All Essentials ({places.length})
          </button>

          {categories.map((cat) => {
            const isAct = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl border whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isAct
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Badges (Section 26) */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <button
            onClick={() => setFilterAlongJourney(!filterAlongJourney)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              filterAlongJourney
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Along My Journey</span>
          </button>

          <button
            onClick={() => setFilterOpenNowOnly(!filterOpenNowOnly)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              filterOpenNowOnly
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Open Now</span>
          </button>

          <button
            onClick={() => setFilterMax500m(!filterMax500m)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              filterMax500m
                ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span>&lt; 500m Radius</span>
          </button>

          <button
            onClick={() => setFilterAccessibleOnly(!filterAccessibleOnly)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              filterAccessibleOnly
                ? 'bg-teal-600/30 text-teal-300 border-teal-500'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span>Accessible Only (♿)</span>
          </button>

          <button
            onClick={() => setFilterLowRiskOnly(!filterLowRiskOnly)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              filterLowRiskOnly
                ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Low Risk Route</span>
          </button>

          {/* Reset Filters */}
          {(filterAlongJourney || filterOpenNowOnly || filterMax500m || filterAccessibleOnly || filterLowRiskOnly || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setFilterAlongJourney(false);
                setFilterOpenNowOnly(false);
                setFilterMax500m(false);
                setFilterAccessibleOnly(false);
                setFilterLowRiskOnly(false);
                setSearchQuery('');
              }}
              className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 ml-auto font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* City Planner Audit View (Section 21) */}
      {showPlannerAudit && cityAudit && (
        <div className="p-5 rounded-3xl bg-slate-900/95 border-2 border-blue-500/50 shadow-2xl text-slate-100 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">City Intelligence: Essential Service Accessibility Audit</h3>
                <span className="text-xs text-blue-300">{cityAudit.zone_name}</span>
              </div>
            </div>
            <span className="text-xs font-black uppercase text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-lg">
              🟡 Simulated District Model
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Nearest Hospital</span>
              <strong className="text-lg font-black text-rose-400">{cityAudit.nearest_hospital_km} km</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Deficit threshold: &gt; 1.5km</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Nearest Pharmacy</span>
              <strong className="text-lg font-black text-emerald-400">{cityAudit.nearest_pharmacy_km * 1000} m</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">High availability</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Transit Stop</span>
              <strong className="text-lg font-black text-cyan-400">{cityAudit.nearest_transit_m} m</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">NH 138 Feeder Bay</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Emergency Station</span>
              <strong className="text-lg font-black text-amber-400">{cityAudit.nearest_emergency_km} km</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Response lag ~7m</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-1.5">
            <strong className="text-blue-300 font-bold block">Planning Vulnerability Diagnostic:</strong>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              {cityAudit.vulnerability_notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Journey Corridor Milestone Progression Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Route className="w-4 h-4 text-cyan-400" />
            <span>Journey Corridor Milestones ({displayedPlaces.length} places along route)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {selectedSegment === 'all' ? 'Displaying places across all stops from Airport to FXEC' : `Filtering stops near ${CORRIDOR_SEGMENTS.find(s => s.id === selectedSegment)?.label}`}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CORRIDOR_SEGMENTS.map(seg => {
            const isAct = selectedSegment === seg.id;
            const count = seg.id === 'all' 
              ? places.length 
              : places.filter(p => (p.corridor_segment || '').includes(seg.countMatch) || (p.address || '').includes(seg.countMatch) || (p.name || '').includes(seg.countMatch)).length;
            return (
              <button
                key={seg.id}
                onClick={() => setSelectedSegment(seg.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all shrink-0 flex items-center gap-2 ${
                  isAct
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <span>{seg.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isAct ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Interactive Map + Places List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Interactive Map */}
        <div className="lg:col-span-7 space-y-3">
          <NearbyMap
            places={displayedPlaces}
            selectedPlace={selectedPlace}
            anchorLocation={{ lat: activeAnchor.lat, lng: activeAnchor.lng, label: activeAnchor.label }}
            destinationLocation={{ lat: 8.7300, lng: 77.7126, label: 'Francis Xavier Engineering College (FXEC)' }}
            radiusMeters={radiusMeters}
            onSelectPlace={(p) => setSelectedPlace(p)}
            onOpenDetails={handleOpenDetails}
            onAddToJourney={handleAddToJourney}
          />

          {/* Quick Corridor Guidance Strip */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tap any marker to inspect walking minutes, dwell estimates, and detour friction impact.</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-mono shrink-0 ml-2">MobiLens GIS</span>
          </div>
        </div>

        {/* Right: Places List Grid */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nearby Places ({displayedPlaces.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Sorted by walking distance
            </span>
          </div>

          <div className="space-y-3 max-h-[570px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-500">
                <span className="inline-block w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
                <p>Querying multi-modal corridor places...</p>
              </div>
            ) : displayedPlaces.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-500 bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                <p>No places found matching the selected filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setFilterMax500m(false);
                    setFilterAlongJourney(false);
                  }}
                  className="mt-3 text-cyan-400 font-bold hover:underline"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              displayedPlaces.map((place) => (
                <NearbyPlaceCard
                  key={place.id}
                  place={place}
                  isSelected={selectedPlace?.id === place.id}
                  onSelect={(p) => setSelectedPlace(p)}
                  onOpenDetails={handleOpenDetails}
                  onAddToJourney={handleAddToJourney}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Place Details Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToJourney={handleAddToJourney}
        userLocation={{ lat: activeAnchor.lat, lng: activeAnchor.lng }}
        destinationLocation={{ lat: 8.7300, lng: 77.7126 }}
        busEtaMin={busEtaMinutes}
      />

      {/* Emergency Mode Modal */}
      <EmergencyModeModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        places={places}
        onSelectPlace={(p) => {
          setSelectedPlace(p);
          setIsEmergencyModalOpen(false);
          setIsDetailModalOpen(true);
        }}
      />

      {/* Hackathon Demo Flow Walkthrough Modal */}
      <HackathonNearbyWalkthrough
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onApplyScenarioStop={(pharmacyName, extraMin, frictionDelta) => {
          setToastMessage(`✓ Applied scenario: "${pharmacyName}" added (+${extraMin}m detour, +${frictionDelta} friction pts) with zero downstream transfer risk.`);
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />
    </div>
  );
};
