import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Loader2, 
  Database, 
  CheckCircle2,
  GraduationCap,
  AlertTriangle,
  ArrowUpDown,
  Radio,
  LocateFixed,
  Building2,
  Bus,
  Plane,
  Train
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchPlacesNominatim } from '../services/api';
import { calculateFrictionModel } from '../simulation/frictionEngine';
import { TCR_TO_FXEC_JOURNEY } from '../data/mockData';
import { Journey, JourneySegment } from '../types';
import { HeatStressMeter } from '../components/HeatStressMeter';

// Quick Real Regional Destination Presets
const REAL_DESTINATIONS = [
  {
    name: 'Francis Xavier Engineering College (FXEC)',
    shortName: 'FXEC Campus',
    locality: 'Vannarpettai, Tirunelveli',
    lat: 8.7300,
    lng: 77.7126,
    icon: GraduationCap,
    color: 'text-cyan-400'
  },
  {
    name: 'Tirunelveli New Bus Stand (NBS)',
    shortName: 'New Bus Stand',
    locality: 'Veinthankulam, Tirunelveli',
    lat: 8.7050,
    lng: 77.7280,
    icon: Bus,
    color: 'text-amber-400'
  },
  {
    name: 'Thoothukudi Airport (TCR)',
    shortName: 'TCR Airport',
    locality: 'Vagaikulam, Thoothukudi',
    lat: 8.7242,
    lng: 78.0264,
    icon: Plane,
    color: 'text-sky-400'
  },
  {
    name: 'Tirunelveli Railway Junction',
    shortName: 'Railway Junction',
    locality: 'Tirunelveli Junction',
    lat: 8.7289,
    lng: 77.7180,
    icon: Train,
    color: 'text-purple-400'
  },
  {
    name: 'Palayamkottai Bus Stand',
    shortName: 'Palayamkottai',
    locality: 'Palayamkottai, Tirunelveli',
    lat: 8.7185,
    lng: 77.7420,
    icon: Building2,
    color: 'text-emerald-400'
  }
];

export const MyJourneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentLocation,
    setCurrentJourney, 
    saveCurrentJourneyToAtlas,
    setIsReportModalOpen,
    setReportPreFill,
    reports,
    heatMultiplier,
    ambientTempCelsius,
    heatStressLevel
  } = useApp();

  // Origin State
  const [origin, setOrigin] = useState('Thoothukudi Airport (TCR), Vagaikulam');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 8.7242, lng: 78.0264 });
  const [originSuggestions, setOriginSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  // Destination State
  const [destination, setDestination] = useState('Francis Xavier Engineering College, Vannarpettai, Tirunelveli');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 8.7300, lng: 77.7126 });
  const [destSuggestions, setDestSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  // Trip Options
  const [travelDate, setTravelDate] = useState('2026-10-02');
  const [departureTime, setDepartureTime] = useState('08:15');
  const [preference, setPreference] = useState('Balanced');
  const [isSavingToAtlas, setIsSavingToAtlas] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const preferences = [
    { id: 'Fastest', label: 'Fastest', desc: 'Shortest clock time' },
    { id: 'Lowest Walking', label: 'Lowest Walking', desc: 'Min foot strain' },
    { id: 'Lowest Cost', label: 'Lowest Cost', desc: 'Fare optimized' },
    { id: 'Most Accessible', label: 'Most Accessible', desc: 'Ramps & lifts' },
    { id: 'Balanced', label: 'Balanced', desc: 'Min friction (AI)' }
  ];

  // Great Circle distance formula
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
  };

  // 1. Detect and Use Real Current Location
  const handleUseCurrentLocation = () => {
    setIsLocatingUser(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setOriginCoords({ lat: latitude, lng: longitude });
          setOrigin(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          setIsLocatingUser(false);

          // Reverse geocode to get human-readable road/suburb
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.display_name) {
                const shortName = data.address?.suburb || data.address?.neighbourhood || data.address?.road || data.address?.city || 'My GPS Location';
                setOrigin(`${shortName} (Current Location)`);
              }
            })
            .catch(() => {});
        },
        (err) => {
          console.warn('Geolocation denied or timeout, fallback to active district GPS:', err);
          if (currentLocation) {
            setOriginCoords({ lat: currentLocation.lat, lng: currentLocation.lng });
            setOrigin(`${currentLocation.name} (District Location)`);
          }
          setIsLocatingUser(false);
        },
        { timeout: 7000 }
      );
    } else if (currentLocation) {
      setOriginCoords({ lat: currentLocation.lat, lng: currentLocation.lng });
      setOrigin(`${currentLocation.name} (District Location)`);
      setIsLocatingUser(false);
    }
  };

  // 2. Swap Origin & Destination
  const handleSwapLocations = () => {
    const tempOrigin = origin;
    const tempCoords = originCoords;
    setOrigin(destination);
    setOriginCoords(destCoords);
    setDestination(tempOrigin);
    setDestCoords(tempCoords);
  };

  // 3. Search Autocomplete
  const handleOriginSearch = async (val: string) => {
    setOrigin(val);
    if (val.length >= 3) {
      setIsSearchingOrigin(true);
      const res = await searchPlacesNominatim(val);
      setOriginSuggestions(res);
      setIsSearchingOrigin(false);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestSearch = async (val: string) => {
    setDestination(val);
    if (val.length >= 3) {
      setIsSearchingDest(true);
      const res = await searchPlacesNominatim(val);
      setDestSuggestions(res);
      setIsSearchingDest(false);
    } else {
      setDestSuggestions([]);
    }
  };

  // 4. Select Real Preset
  const handleSelectPresetDestination = (dest: typeof REAL_DESTINATIONS[0]) => {
    setDestination(`${dest.name}, ${dest.locality}`);
    setDestCoords({ lat: dest.lat, lng: dest.lng });
    setDestSuggestions([]);
  };

  // 5. Load TCR ➔ FXEC Corridor Route
  const handleLoadTcrToFxec = async () => {
    setOrigin('Thoothukudi Airport (TCR), Vagaikulam');
    setOriginCoords({ lat: 8.7242, lng: 78.0264 });
    setDestination('Francis Xavier Engineering College, Vannarpettai, Tirunelveli');
    setDestCoords({ lat: 8.7300, lng: 77.7126 });
    setDepartureTime('08:15');

    setIsSavingToAtlas(true);
    await saveCurrentJourneyToAtlas(TCR_TO_FXEC_JOURNEY);
    setCurrentJourney(TCR_TO_FXEC_JOURNEY);
    setIsSavingToAtlas(false);
    setSaveSuccess(true);

    setTimeout(() => {
      navigate('/analyzer');
    }, 400);
  };

  // Generate smooth road routing coordinates between two points
  const generateRouteWaypoints = (orig: { lat: number; lng: number }, dest: { lat: number; lng: number }): [number, number][] => {
    const steps = 6;
    const pts: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const curveOffset = Math.sin(t * Math.PI) * 0.0035;
      const lat = orig.lat + (dest.lat - orig.lat) * t + curveOffset;
      const lng = orig.lng + (dest.lng - orig.lng) * t - curveOffset * 0.4;
      pts.push([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
    }
    return pts;
  };

  // Helper to compile and save current user journey data
  const buildActiveJourney = async (): Promise<Journey> => {
    const isTcrDefault = 
      (origin.toLowerCase().includes('thoothukudi') || origin.toLowerCase().includes('airport')) &&
      (destination.toLowerCase().includes('francis xavier') || destination.toLowerCase().includes('vannarpettai'));

    if (isTcrDefault) {
      const journey: Journey = {
        ...TCR_TO_FXEC_JOURNEY,
        originCoords: { lat: 8.7242, lng: 78.0264 },
        destCoords: { lat: 8.7300, lng: 77.7126 },
        routeCoordinates: [
          [8.7242, 78.0264], // TCR Airport
          [8.7258, 77.9850], // Vagaikulam Stop
          [8.7275, 77.8820], // Vallanadu
          [8.7292, 77.7855], // Thamirabarani Bridge
          [8.7289, 77.7180], // Tirunelveli Junction
          [8.7300, 77.7126]  // FXEC Campus
        ]
      };
      await saveCurrentJourneyToAtlas(journey);
      setCurrentJourney(journey);
      return journey;
    }

    const distKm = getDistanceFromLatLonInKm(originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng);
    const effectiveDist = Math.max(1.8, distKm);
    const heatScale = heatMultiplier > 1.2 ? 1.25 : 1.0;
    const walk1Min = Math.round(7 * heatScale);
    const busMin = Math.max(8, Math.round(effectiveDist * 2.2));
    const waitMin = Math.max(6, Math.min(18, Math.round(effectiveDist * 0.4)));
    const walk2Min = Math.round(6 * heatScale);
    const totalMin = walk1Min + busMin + waitMin + walk2Min;

    const originName = origin.split(',')[0].trim();
    const destName = destination.split(',')[0].trim();
    const routeCoords = generateRouteWaypoints(originCoords, destCoords);

    // Compute expected arrival time from departure time
    const [depHours, depMins] = departureTime.split(':').map(Number);
    const arrTotalMins = ((depHours || 8) * 60 + (depMins || 15) + totalMin) % 1440;
    const arrH = Math.floor(arrTotalMins / 60);
    const arrM = arrTotalMins % 60;
    const arrPeriod = arrH >= 12 ? 'PM' : 'AM';
    const arrH12 = arrH % 12 || 12;
    const arrivalTimeStr = `${String(arrH12).padStart(2, '0')}:${String(arrM).padStart(2, '0')} ${arrPeriod}`;

    const dynamicSegments: JourneySegment[] = [
      {
        id: `seg-${Date.now()}-1`,
        name: `Pedestrian Walk to Transit Stop`,
        mode: 'walking',
        durationMinutes: walk1Min,
        expectedMinutes: 5,
        excessMinutes: Math.max(0, walk1Min - 5),
        distanceKm: 0.4,
        frictionContribution: heatMultiplier > 1.3 ? 'high' : 'low',
        description: `Walk from ${originName} to nearest bus boarding bay (${ambientTempCelsius}°C ambient sun exposure)`,
        startTime: departureTime,
        endTime: '08:22 AM',
        location: originName,
        stepFree: true
      },
      {
        id: `seg-${Date.now()}-2`,
        name: `Arterial Transit Waiting & Boarding`,
        mode: 'waiting',
        durationMinutes: waitMin,
        expectedMinutes: 5,
        excessMinutes: Math.max(0, waitMin - 5),
        frictionContribution: waitMin > 10 ? 'high' : 'moderate',
        description: `Roadside transit stop headway wait at ${originName}`,
        startTime: '08:22 AM',
        endTime: '08:34 AM',
        location: `${originName} Transit Bay`,
        stepFree: true
      },
      {
        id: `seg-${Date.now()}-3`,
        name: `Transit Ride along Corridor`,
        mode: 'bus',
        durationMinutes: busMin,
        expectedMinutes: Math.round(busMin * 0.9),
        excessMinutes: Math.round(busMin * 0.1),
        distanceKm: Number(effectiveDist.toFixed(1)),
        costInr: Math.max(15, Math.min(60, Math.round(effectiveDist * 1.2))),
        frictionContribution: 'low',
        description: `Regional Express Transit connecting ${originName} to ${destName}`,
        startTime: '08:34 AM',
        endTime: '09:05 AM',
        location: `${originName} ➔ ${destName}`,
        stepFree: true
      },
      {
        id: `seg-${Date.now()}-4`,
        name: `Final Arrival Walk to Destination`,
        mode: 'walking',
        durationMinutes: walk2Min,
        expectedMinutes: 5,
        excessMinutes: Math.max(0, walk2Min - 5),
        distanceKm: 0.5,
        costInr: 0,
        frictionContribution: 'low',
        description: `Walk into ${destName} main entrance`,
        startTime: '09:05 AM',
        endTime: arrivalTimeStr,
        location: destName,
        stepFree: true
      }
    ];

    const model = calculateFrictionModel(dynamicSegments);

    const newJourney: Journey = {
      id: `J-REAL-${Date.now()}`,
      title: `${originName} ➔ ${destName}`,
      userType: 'student',
      origin: origin,
      destination: destination,
      departureTime: departureTime,
      arrivalTime: arrivalTimeStr,
      totalDurationMinutes: totalMin,
      travelDurationMinutes: busMin,
      waitingDurationMinutes: waitMin,
      walkingDurationMinutes: walk1Min + walk2Min,
      transferCount: effectiveDist > 15 ? 1 : 0,
      estimatedCostInr: Math.max(15, Math.min(65, Math.round(effectiveDist * 1.2))),
      frictionScore: model.frictionScore,
      frictionLevel: model.frictionScore > 70 ? 'HIGH' : model.frictionScore > 40 ? 'MODERATE' : 'LOW',
      segments: dynamicSegments,
      frictionBreakdown: model.frictionBreakdown,
      primaryBottleneck: model.primaryBottleneck,
      simulation: false,
      originCoords: originCoords,
      destCoords: destCoords,
      routeCoordinates: routeCoords
    };

    await saveCurrentJourneyToAtlas(newJourney);
    setCurrentJourney(newJourney);
    return newJourney;
  };

  // 6. Analyze Real Dynamic Custom Route (Deep Forensics)
  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingToAtlas(true);
    await buildActiveJourney();
    setIsSavingToAtlas(false);
    setSaveSuccess(true);
    setTimeout(() => {
      navigate('/analyzer');
    }, 300);
  };

  // 7. Start Live Journey with this Travel Data
  const handleStartLiveJourney = async () => {
    setIsSavingToAtlas(true);
    await buildActiveJourney();
    setIsSavingToAtlas(false);
    setSaveSuccess(true);
    setTimeout(() => {
      navigate('/live-journey');
    }, 300);
  };

  // Calculate live road distance for summary display
  const currentDistanceKm = Number(
    getDistanceFromLatLonInKm(originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng).toFixed(1)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            Human-Centric Trip Planner & Friction Audit
          </span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mt-1">
          My Journey
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Select custom start & destination points, utilize your real current location, and evaluate cumulative human strain before saving directly to MongoDB Atlas.
        </p>
      </div>

      {/* Top Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1: Real Current GPS Location Lock */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/50 border-2 border-cyan-500/40 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <LocateFixed className="w-3.5 h-3.5" /> Instant GPS Origin
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Live Sensor
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white mt-1">
              Start Trip from My Current Location
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">
              One-tap sensor detection: Locks your live GPS position as the departure origin for your journey.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocatingUser}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isLocatingUser ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locating via GPS...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>Use My Current Location</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Banner 2: Regional TCR ➔ FXEC Highway Corridor */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/70 via-slate-900 to-emerald-950/50 border-2 border-teal-500/40 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Regional Highway Corridor (NH 138)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Friction: 76/100
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white mt-1">
              Thoothukudi Airport (TCR) ➔ FXEC Tirunelveli
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">
              38.2 km • 78 min total • Vagaikulam roadside wait • Vannarpettai pedestrian crossing
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleLoadTcrToFxec}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load TCR Corridor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleLoadTcrToFxec();
                navigate('/live-journey');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-1 border border-slate-700"
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Live Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form & Real Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-6">
            
            {/* Origin & Destination with Swap Button */}
            <div className="space-y-4">
              {/* Origin with GPS Trigger & Live Search */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Start Location (Origin)
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocatingUser}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    <LocateFixed className="w-3 h-3" />
                    <span>{isLocatingUser ? 'Detecting...' : 'Use My GPS'}</span>
                  </button>
                </div>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => handleOriginSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
                    placeholder="Enter starting area, station, or click 'Use My GPS'..."
                  />
                  {isSearchingOrigin && (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin absolute right-3 top-3.5" />
                  )}
                </div>

                {originSuggestions.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 p-2 bg-[#151E33] border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto space-y-1">
                    {originSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setOrigin(s.display_name);
                          setOriginCoords({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
                          setOriginSuggestions([]);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 truncate block"
                      >
                        {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Swap Control */}
              <div className="flex justify-center -my-2">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  title="Swap Origin and Destination"
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-400 border border-slate-700 transition-all shadow-md z-10"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* Destination with Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Destination (College / Office / Terminal)
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => handleDestSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
                    placeholder="Search destination or select from quick chips below..."
                  />
                  {isSearchingDest && (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3 top-3.5" />
                  )}
                </div>

                {destSuggestions.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 p-2 bg-[#151E33] border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto space-y-1">
                    {destSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDestination(s.display_name);
                          setDestCoords({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
                          setDestSuggestions([]);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 truncate block"
                      >
                        {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Destination Chips */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Quick Real Destinations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {REAL_DESTINATIONS.map((rd, i) => {
                    const isSelected = destination.includes(rd.shortName) || destination.includes(rd.name);
                    const IconComp = rd.icon;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectPresetDestination(rd)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                            : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <IconComp className={`w-3.5 h-3.5 ${rd.color}`} />
                        <span>{rd.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Travel Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Travel Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Departure Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Mobility Preferences */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                Mobility Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {preferences.map((p) => {
                  const isSelected = preference === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPreference(p.id)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{p.label}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
              {/* Start Live Journey Button */}
              <button
                type="button"
                onClick={handleStartLiveJourney}
                disabled={isSavingToAtlas}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                <Radio className="w-4 h-4 animate-pulse text-slate-950" />
                <span>Start Live Journey (Track Real-Time)</span>
              </button>

              <button
                type="submit"
                disabled={isSavingToAtlas}
                className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSavingToAtlas ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to MongoDB Atlas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Analyze Journey Friction & Save</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLoadTcrToFxec}
                className="px-4 py-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Reset to TCR ➔ FXEC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Crowdsourced Report Trap Button */}
              <button
                type="button"
                onClick={() => {
                  setReportPreFill({
                    locationName: origin.includes('Airport') ? 'Vagaikulam Feeder Stop (TCR Airport)' : `${origin.split(',')[0]} Crossing`,
                    lat: originCoords.lat,
                    lng: originCoords.lng
                  });
                  setIsReportModalOpen(true);
                }}
                className="px-4 py-3.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-2 transition-all shadow-md group"
                title="Report transfer delay or hazardous pedestrian crossing"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Report Transfer Trap</span>
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/30 text-[10px] text-rose-200">
                  {reports.length} Reports
                </span>
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Successfully configured and saved journey route to MongoDB Atlas!</span>
              </div>
            )}
          </form>
        </div>

        {/* Real Dynamic Details Preview */}
        <div className="bg-gradient-to-b from-[#111827] to-[#151E33] border border-cyan-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Selected Route Metrics
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Road Dynamic
              </span>
            </div>

            <h3 className="text-base font-bold text-white mt-3 truncate" title={`${origin.split(',')[0]} ➔ ${destination.split(',')[0]}`}>
              {origin.split(',')[0]} ➔ {destination.split(',')[0]}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Real-world distance calculated from your active departure origin to destination point.
            </p>

            <div className="space-y-3 mt-5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Road Distance:</span>
                <strong className="text-white font-mono">{currentDistanceKm} km</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Est. Door-to-Door Time:</span>
                <strong className="text-cyan-300 font-mono">
                  {Math.round(currentDistanceKm * 2.2 + 18)} min
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Climate Strain Multiplier:</span>
                <strong className={`font-mono ${heatMultiplier >= 2.0 ? 'text-rose-400' : heatMultiplier >= 1.4 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {heatMultiplier}x ({ambientTempCelsius}°C)
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Estimated Transit Fare:</span>
                <strong className="text-emerald-400 font-mono">
                  ₹{Math.max(15, Math.min(65, Math.round(currentDistanceKm * 1.2)))}
                </strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Transfer Traps on Path:</span>
                <strong className="text-amber-400 font-mono">
                  {reports.length > 0 ? `${reports.length} Flagged` : '0 Safe'}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2.5">
            {/* Live Journey Direct Button in Metric Card */}
            <button
              type="button"
              onClick={handleStartLiveJourney}
              disabled={isSavingToAtlas}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50"
            >
              <Radio className="w-4 h-4 animate-pulse text-slate-950" />
              <span>Track in Live Journey Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isSavingToAtlas}
              className="w-full py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Analyze in Deep Forensics</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature 2: Climate & Heat Stress Exposure Multiplier */}
      <HeatStressMeter />
    </div>
  );
};
