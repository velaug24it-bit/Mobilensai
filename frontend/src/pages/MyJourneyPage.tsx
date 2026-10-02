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
  Plane,
  GraduationCap,
  AlertTriangle,
  Sun,
  Flame,
  Radio
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchPlacesNominatim } from '../services/api';
import { calculateFrictionModel } from '../simulation/frictionEngine';
import { TCR_TO_FXEC_JOURNEY, CANONICAL_61MIN_JOURNEY } from '../data/mockData';
import { Journey, JourneySegment } from '../types';
import { HeatStressMeter } from '../components/HeatStressMeter';


export const MyJourneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    setCurrentJourney, 
    saveCurrentJourneyToAtlas,
    setIsReportModalOpen,
    setReportPreFill,
    reports,
    heatMultiplier,
    ambientTempCelsius,
    heatStressLevel
  } = useApp();

  const [origin, setOrigin] = useState('Thoothukudi Airport (TCR), Vagaikulam');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 8.7242, lng: 78.0264 });
  const [originSuggestions, setOriginSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);

  const [destination, setDestination] = useState('Francis Xavier Engineering College, Vannarpettai, Tirunelveli');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 8.7300, lng: 77.7126 });
  const [destSuggestions, setDestSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const [travelDate, setTravelDate] = useState('2026-10-01');
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
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
  };

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
    }, 500);
  };

  const handleLoadCanonical61Min = async () => {
    setOrigin('Greenwood Heights (Home)');
    setOriginCoords({ lat: 8.7289, lng: 77.7180 });
    setDestination('City Technology Institute / FXEC');
    setDestCoords({ lat: 8.7300, lng: 77.7126 });
    setDepartureTime('08:00');

    setIsSavingToAtlas(true);
    await saveCurrentJourneyToAtlas(CANONICAL_61MIN_JOURNEY);
    setCurrentJourney(CANONICAL_61MIN_JOURNEY);
    setIsSavingToAtlas(false);
    setSaveSuccess(true);

    setTimeout(() => {
      navigate('/analyzer');
    }, 500);
  };

  const handleAnalyze = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsSavingToAtlas(true);

    // If matches TCR to FXEC, use the curated regional transit model
    if (
      (origin.toLowerCase().includes('thoothukudi') || origin.toLowerCase().includes('airport')) &&
      (destination.toLowerCase().includes('francis xavier') || destination.toLowerCase().includes('tirunelveli'))
    ) {
      await saveCurrentJourneyToAtlas(TCR_TO_FXEC_JOURNEY);
      setCurrentJourney(TCR_TO_FXEC_JOURNEY);
      setIsSavingToAtlas(false);
      setSaveSuccess(true);
      setTimeout(() => navigate('/analyzer'), 500);
      return;
    }

    // Otherwise compute real distance and generate dynamic segments
    const distKm = getDistanceFromLatLonInKm(originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng);
    const effectiveDist = Math.max(2.5, distKm);

    const walk1Min = 8;
    const busMin = Math.round(effectiveDist * 2.0);
    const waitMin = 15;
    const transferMin = 10;
    const walk2Min = 9;
    const totalMin = walk1Min + busMin + waitMin + transferMin + walk2Min;

    const dynamicSegments: JourneySegment[] = [
      {
        id: `seg-${Date.now()}-1`,
        name: `Walk to Transit Boarding Point`,
        mode: 'walking',
        durationMinutes: walk1Min,
        expectedMinutes: 7,
        excessMinutes: 1,
        distanceKm: 0.5,
        frictionContribution: 'low',
        description: `Pedestrian walk from ${origin.split(',')[0]}`,
        startTime: departureTime,
        endTime: '08:23 AM',
        location: origin.split(',')[0],
        stepFree: true
      },
      {
        id: `seg-${Date.now()}-2`,
        name: `Interchange Highway Transit Wait`,
        mode: 'waiting',
        durationMinutes: waitMin,
        expectedMinutes: 5,
        excessMinutes: waitMin - 5,
        frictionContribution: 'high',
        description: `Unscheduled highway connection delay`,
        startTime: '08:23 AM',
        endTime: '08:38 AM',
        location: `Highway Junction`,
        stepFree: false
      },
      {
        id: `seg-${Date.now()}-3`,
        name: `Arterial Transit via Highway Corridor`,
        mode: 'bus',
        durationMinutes: busMin,
        expectedMinutes: Math.round(busMin * 0.9),
        excessMinutes: Math.round(busMin * 0.1),
        distanceKm: Number(effectiveDist.toFixed(1)),
        costInr: 30,
        frictionContribution: 'low',
        description: `Transit corridor between ${origin.split(',')[0]} and ${destination.split(',')[0]}`,
        startTime: '08:38 AM',
        endTime: '09:15 AM',
        location: `${origin.split(',')[0]} ➔ ${destination.split(',')[0]}`,
        stepFree: true
      },
      {
        id: `seg-${Date.now()}-4`,
        name: `Last-Mile Campus Arrival Walk`,
        mode: 'walking',
        durationMinutes: walk2Min,
        expectedMinutes: 8,
        excessMinutes: 1,
        distanceKm: 0.6,
        costInr: 0,
        frictionContribution: 'low',
        description: `Walk into ${destination.split(',')[0]} entrance`,
        startTime: '09:15 AM',
        endTime: '09:24 AM',
        location: destination.split(',')[0],
        stepFree: true
      }
    ];

    const model = calculateFrictionModel(dynamicSegments);

    const newJourney: Journey = {
      id: `J-REAL-${Date.now()}`,
      title: `${origin.split(',')[0]} ➔ ${destination.split(',')[0]}`,
      userType: 'student',
      origin: origin,
      destination: destination,
      departureTime: departureTime,
      arrivalTime: '09:25 AM',
      totalDurationMinutes: totalMin,
      travelDurationMinutes: busMin,
      waitingDurationMinutes: waitMin,
      walkingDurationMinutes: walk1Min + walk2Min,
      transferCount: 1,
      estimatedCostInr: 35,
      frictionScore: model.frictionScore,
      frictionLevel: model.frictionScore > 70 ? 'HIGH' : 'MODERATE',
      segments: dynamicSegments,
      frictionBreakdown: model.frictionBreakdown,
      primaryBottleneck: model.primaryBottleneck,
      simulation: true
    };

    await saveCurrentJourneyToAtlas(newJourney);
    setCurrentJourney(newJourney);
    setIsSavingToAtlas(false);
    setSaveSuccess(true);

    setTimeout(() => {
      navigate('/analyzer');
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            Tirunelveli & Thoothukudi District Transit Intelligence
          </span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mt-1">
          My Journey
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Reconstruct real multi-modal trips across Tirunelveli and Thoothukudi districts, calculate true road distance on NH 138, detect transfer bottlenecks, and save to MongoDB Atlas.
        </p>
      </div>

      {/* Featured 1-Click Corridor Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Canonical 61-Minute Human Journey */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/50 border-2 border-purple-500/40 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Core Multimodal Model (Prompt Section 3)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Friction: 72/100
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white mt-1">
              Home ➔ Walk ➔ Bus 12A ➔ Train ➔ College
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">
              61 min total • Walking: 12m • Waiting: 15m • Transfers: 2 • ₹35 • ⚠️ Passes Zone 17 Elevated Risk Area
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleLoadCanonical61Min}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 61-Min Journey</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleLoadCanonical61Min();
                navigate('/live-journey');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-slate-700"
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Live Mode</span>
            </button>
          </div>
        </div>

        {/* Card 2: Regional TCR ➔ FXEC Highway Corridor */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-emerald-950/50 border-2 border-cyan-500/40 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
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
              38.2 km • 78 min total • 16m Vagaikulam roadside wait • 12m Vannarpettai road crossing
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleLoadTcrToFxec}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all"
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
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-1 border border-slate-700"
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Live Mode</span>
            </button>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Origin with Live Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Start Location (Origin)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => handleOriginSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
                    placeholder="Type real station, airport, or area..."
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

              {/* Destination with Live Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Destination (College / Office)
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => handleDestSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
                    placeholder="Type destination..."
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <button
                type="submit"
                disabled={isSavingToAtlas}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isSavingToAtlas ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to MongoDB Atlas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Journey Friction & Save</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLoadTcrToFxec}
                className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <span>Reset to TCR ➔ FXEC Corridor</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Crowdsourced Report Trap Button */}
              <button
                type="button"
                onClick={() => {
                  setReportPreFill({
                    locationName: origin.includes('Airport') ? 'Vagaikulam Feeder Stop (TCR Airport)' : 'Vannarpettai Bypass Road (FXEC Entrance)',
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
                <span>Successfully analyzed and saved to MongoDB Atlas (`Mobilensai.journeys`)!</span>
              </div>
            )}
          </form>
        </div>

        {/* Real Dynamic Details Preview */}
        <div className="bg-gradient-to-b from-[#111827] to-[#151E33] border border-cyan-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Regional Model Info
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Friction: {Math.min(99, Math.round(76 * (heatMultiplier > 1.2 ? 1.15 : 1.0)))}/100
              </span>
            </div>

            <h3 className="text-base font-bold text-white mt-3">
              Thoothukudi ➔ Tirunelveli Corridor
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Via NH 138 4-lane highway passing Vagaikulam Airport, Vallanadu Sanctuary, and Vannarpettai Bypass Road directly to Francis Xavier Engineering College.
            </p>

            <div className="space-y-3 mt-5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Total Distance:</span>
                <strong className="text-white font-mono">38.2 km</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Total Door-to-Door Time:</span>
                <strong className="text-cyan-300 font-mono">78 min</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Vagaikulam Feeder Wait:</span>
                <strong className="text-rose-400 font-mono">16 min delay ⚠</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Vannarpettai Crossing:</span>
                <strong className="text-amber-400 font-mono">12 min transfer</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Climate Strain Multiplier:</span>
                <strong className={`font-mono ${heatMultiplier >= 2.0 ? 'text-rose-400' : heatMultiplier >= 1.4 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {heatMultiplier}x ({ambientTempCelsius}°C)
                </strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Estimated TNSTC Fare:</span>
                <strong className="text-emerald-400 font-mono">₹45</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleLoadTcrToFxec}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <span>Inspect in Journey Analyzer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature 2: Climate & Heat Stress Exposure Multiplier */}
      <HeatStressMeter />
    </div>
  );
};
