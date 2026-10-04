import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  fetchLiveTransit, 
  fetchStopArrivals, 
  checkCatchability, 
  simulateBusDelay, 
  resetTransitDemo, 
  recalculateDisruptedJourney,
  TransitVehicle, 
  TransitRoute, 
  TransitStop, 
  StopArrival, 
  CatchabilityResult, 
  RecoveryAlternative 
} from '../services/api';
import { LiveTransitMap } from '../components/LiveTransitMap';
import { LiveJourneyStatusCard } from '../components/LiveJourneyStatusCard';
import { LiveJourneyTimeline } from '../components/LiveJourneyTimeline';
import { SmartBusStopPanel } from '../components/SmartBusStopPanel';
import { CanICatchBusModal } from '../components/CanICatchBusModal';
import { DisruptionAlternativesPanel } from '../components/DisruptionAlternativesPanel';
import { JourneyEssentialsDrawer } from '../components/JourneyEssentialsDrawer';
import { 
  Radio, 
  Footprints, 
  AlertTriangle, 
  RotateCcw, 
  Zap, 
  Clock,
  Timer,
  Thermometer,
  Users,
  Activity,
  TrendingUp,
  Bus,
  Gauge,
  CheckCircle2 as CheckCircle2Icon,
  MapPin as MapPinIcon,
  Compass,
  Hospital,
  Pill,
  Utensils,
  Bath,
  Fuel,
  CreditCard
} from 'lucide-react';
import { 
  INITIAL_STOPS, 
  INITIAL_ROUTES, 
  INITIAL_VEHICLES, 
  INITIAL_ARRIVALS 
} from '../data/transitMockData';

// Journey stages - use lucide icon names, NOT emoji (encoding corruption risk)
const JOURNEY_STAGES = [
  { id: 'departed',        label: 'Departed', iconKey: 'home',    color: '#22c55e' },
  { id: 'walking_to_stop', label: 'Walking',  iconKey: 'walk',    color: '#f59e0b' },
  { id: 'waiting_for_bus', label: 'At Stop',  iconKey: 'stop',    color: '#06b6d4' },
  { id: 'on_bus',          label: 'On Bus',   iconKey: 'bus',     color: '#6366f1' },
  { id: 'transferring',    label: 'Transfer', iconKey: 'refresh', color: '#f97316' },
  { id: 'arrived',         label: 'Arrived',  iconKey: 'check',   color: '#22c55e' },
];


// Crowding color map
function crowdingColor(level: string) {
  if (level === 'High' || level === 'Full') return '#ef4444';
  if (level === 'Moderate' || level === 'Medium') return '#f59e0b';
  return '#22c55e';
}
function crowdingPct(level: string) {
  if (level === 'High' || level === 'Full') return 90;
  if (level === 'Moderate' || level === 'Medium') return 55;
  return 25;
}

export const LiveJourneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation, role, currentUser, departureHour, ambientTempCelsius, heatStressLevel, heatMultiplier } = useApp();
  
  // Live clock
  const [now, setNow] = useState(new Date());
  const [elapsedSec, setElapsedSec] = useState(0);
  const startTimeRef = useRef(Date.now());

  // Transit Data
  const [vehicles, setVehicles] = useState<TransitVehicle[]>(INITIAL_VEHICLES);
  const [routes, setRoutes] = useState<TransitRoute[]>(INITIAL_ROUTES);
  const [stops, setStops] = useState<TransitStop[]>(INITIAL_STOPS);
  const [loading, setLoading] = useState<boolean>(false);

  // Active Journey Tracking
  const [selectedVehicle, setSelectedVehicle] = useState<TransitVehicle | null>(INITIAL_VEHICLES[0]);
  const [selectedStop, setSelectedStop] = useState<TransitStop | null>(INITIAL_STOPS[1]);
  const [arrivals, setArrivals] = useState<StopArrival[]>(INITIAL_ARRIVALS);
  
  // Journey Stage
  const [currentStage, setCurrentStage] = useState<'departed' | 'walking_to_stop' | 'waiting_for_bus' | 'on_bus' | 'transferring' | 'arrived'>('waiting_for_bus');
  
  // Journey Simulation Metrics
  const [journeyStatus, setJourneyStatus] = useState<'on_schedule' | 'tight' | 'disrupted'>('on_schedule');
  const [frictionScore, setFrictionScore] = useState<number>(31);
  const [transferRisk, setTransferRisk] = useState<'Low' | 'Moderate' | 'High'>('Low');
  const [simulatedDelay, setSimulatedDelay] = useState<number>(0);
  const [recoveryAlternatives, setRecoveryAlternatives] = useState<RecoveryAlternative[]>([]);

  // Catchability Modal
  const [isCatchModalOpen, setIsCatchModalOpen] = useState<boolean>(false);
  const [catchResult, setCatchResult] = useState<CatchabilityResult | null>(null);
  const [isCatchLoading, setIsCatchLoading] = useState<boolean>(false);

  // Journey Essentials Drawer
  const [isEssentialsDrawerOpen, setIsEssentialsDrawerOpen] = useState<boolean>(false);

  const pollingRef = useRef<any>(null);

  const userLat = currentLocation?.lat || 8.723;
  const userLng = currentLocation?.lng || 78.026;
  const userLocationObj = {
    lat: userLat,
    lng: userLng,
    label: currentLocation?.city?.toLowerCase().includes('tirunelveli') || currentUser?.district?.toLowerCase().includes('tirunelveli')
      ? 'Tirunelveli Departure' 
      : 'Thoothukudi Airport (TCR) Origin'
  };

  // Derived metrics
  const walkMeters = 520;
  const walkMinutes = Math.ceil(walkMeters / 80);
  const busEta = selectedVehicle?.eta_next_stop_min ?? 4;
  const distanceKm = selectedVehicle?.distance_from_user_km ?? 1.8;
  const speedKmh = selectedVehicle?.speed_kmh ?? 42;
  const crowding = selectedVehicle?.crowding_level ?? 'Moderate';
  const isDelayed = simulatedDelay > 0 || journeyStatus === 'disrupted';
  const expectedArrival = isDelayed ? '09:07 AM (Delayed)' : '08:54 AM';

  // Friction breakdown - use iconKey (lucide), NOT emoji strings (encoding corruption risk)
  const frictionBreakdown = [
    { label: 'Wait Time',     value: isDelayed ? 22 : 8,                                         max: 30, color: '#f59e0b', iconKey: 'wait'  },
    { label: 'Heat Stress',   value: Math.round((heatMultiplier - 1) * 25 + 5),                   max: 25, color: '#ef4444', iconKey: 'heat'  },
    { label: 'Walking',       value: walkMinutes > 10 ? 14 : 6,                                   max: 20, color: '#f97316', iconKey: 'walk'  },
    { label: 'Crowding',      value: crowding === 'High' ? 12 : crowding === 'Moderate' ? 7 : 3,  max: 15, color: '#8b5cf6', iconKey: 'crowd' },
    { label: 'Transfer Risk', value: transferRisk === 'High' ? 14 : transferRisk === 'Moderate' ? 7 : 2, max: 15, color: '#ef4444', iconKey: 'risk' },
  ];
  const computedFriction = Math.min(100, frictionBreakdown.reduce((s, f) => s + f.value, 0));

  // Stage index for progress
  const stageIdx = JOURNEY_STAGES.findIndex(s => s.id === currentStage);

  // Live clock and elapsed timer
  useEffect(() => {
    const clockTick = setInterval(() => {
      setNow(new Date());
      setElapsedSec(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(clockTick);
  }, []);

  const loadTransitData = async () => {
    try {
      const bundle = await fetchLiveTransit();
      if (bundle) {
        setVehicles(bundle.vehicles || []);
        setRoutes(bundle.routes || []);
        setStops(bundle.stops || []);
        if (bundle.stops?.length > 0) {
          const defaultStop = bundle.stops.find(s => {
            const sid = s.stop_id || (s as any).id || '';
            return sid.includes('VAG') || sid.includes('TCR');
          }) || bundle.stops[0];
          if (defaultStop) { setSelectedStop(defaultStop); loadArrivals(defaultStop.stop_id || (defaultStop as any).id); }
        }
        if (bundle.vehicles?.length > 0) {
          const defaultVehicle = bundle.vehicles.find(v => v.route_short_name === '15' || v.route_id === 'ROUTE-15') || bundle.vehicles[0];
          setSelectedVehicle(defaultVehicle);
        }
      }
    } catch (e) {
      console.warn('Failed to load transit bundle:', e);
    } finally { setLoading(false); }
  };

  const loadArrivals = async (stopId: string) => {
    const arrs = await fetchStopArrivals(stopId);
    setArrivals(arrs);
  };

  useEffect(() => {
    loadTransitData();
    pollingRef.current = setInterval(async () => {
      try {
        const bundle = await fetchLiveTransit();
        if (bundle?.vehicles) {
          setVehicles(bundle.vehicles);
          if (selectedVehicle) {
            const updated = bundle.vehicles.find(v => v.vehicle_id === selectedVehicle.vehicle_id);
            if (updated) setSelectedVehicle(updated);
          }
        }
      } catch (err) {}
    }, 3500);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const handleSelectStop = (stop: TransitStop) => {
    setSelectedStop(stop);
    loadArrivals(stop.stop_id);
  };

  const handleSelectVehicle = (vehicle: TransitVehicle) => {
    setSelectedVehicle(vehicle);
    const matchedStop = stops.find(s => s.stop_id === vehicle.next_stop_id);
    if (matchedStop) { setSelectedStop(matchedStop); loadArrivals(matchedStop.stop_id); }
  };

  const handleCheckCatchability = async (vehicle: TransitVehicle, stop: TransitStop) => {
    setIsCatchModalOpen(true);
    setIsCatchLoading(true);
    try {
      const res = await checkCatchability({
        user_lat: userLat, user_lng: userLng,
        stop_lat: stop.lat, stop_lng: stop.lng,
        bus_eta_min: vehicle.eta_next_stop_min || 5,
        user_mode: role === 'accessibility' ? 'wheelchair' : 'walking',
        weather_multiplier: 1.0
      });
      setCatchResult(res);
    } catch (e) {} finally { setIsCatchLoading(false); }
  };

  const handleSimulateDelay = async () => {
    const targetVehicleId = selectedVehicle?.vehicle_id || 'BUS-15-01';
    const delayAmt = 6;
    await simulateBusDelay(targetVehicleId, delayAmt);
    setSimulatedDelay(delayAmt);
    setJourneyStatus('disrupted');
    setTransferRisk('High');
    setFrictionScore(86);
    const recalc = await recalculateDisruptedJourney({
      current_bus_id: targetVehicleId,
      current_delay_min: delayAmt,
      destination: 'Francis Xavier Engineering College (FXEC)'
    });
    if (recalc?.recovery_alternatives) setRecoveryAlternatives(recalc.recovery_alternatives);
    const bundle = await fetchLiveTransit();
    if (bundle?.vehicles) setVehicles(bundle.vehicles);
  };

  const handleResetSimulation = async () => {
    await resetTransitDemo();
    setSimulatedDelay(0);
    setJourneyStatus('on_schedule');
    setTransferRisk('Low');
    setFrictionScore(31);
    setRecoveryAlternatives([]);
    const bundle = await fetchLiveTransit();
    if (bundle?.vehicles) {
      setVehicles(bundle.vehicles);
      if (selectedVehicle) {
        const resetV = bundle.vehicles.find(v => v.vehicle_id === selectedVehicle.vehicle_id);
        if (resetV) setSelectedVehicle(resetV);
      }
    }
  };

  const handleSelectAlternative = (alt: RecoveryAlternative) => {
    setJourneyStatus('on_schedule');
    setTransferRisk(alt.transfer_risk);
    setFrictionScore(alt.mobility_friction_index);
    setRecoveryAlternatives([]);
    setSimulatedDelay(0);
  };

  const handleUseBusForJourney = (arrivalOrVehicle: any) => {
    const found = vehicles.find(v => v.vehicle_id === arrivalOrVehicle.vehicle_id);
    if (found) setSelectedVehicle(found);
  };

  const elapsedStr = `${String(Math.floor(elapsedSec / 60)).padStart(2, '0')}:${String(elapsedSec % 60).padStart(2, '0')}`;
  const heatColor = heatStressLevel === 'EXTREME' ? '#ef4444' : heatStressLevel === 'HIGH' ? '#f97316' : heatStressLevel === 'MODERATE' ? '#f59e0b' : '#22c55e';

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-300">

      {/* Top Header Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-500 ${
        isDelayed 
          ? 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/40 border-rose-500/60 shadow-rose-950/30' 
          : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-cyan-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${isDelayed ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'}`}>
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-white tracking-tight">Live Journey Mode</h1>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${isDelayed ? 'bg-rose-500 text-white' : 'bg-amber-400 text-slate-950'}`}>
                {isDelayed ? 'DISRUPTED' : 'DEMO'}
              </span>
              {/* Live Clock */}
              <span className="text-xs font-mono text-cyan-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-indigo-400" />
                {elapsedStr} elapsed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>{selectedStop?.stop_name || 'Vagaikulam NH-138 Junction'}</span>
              <span className="text-cyan-400 font-bold">&rarr;</span>
              <span>Francis Xavier Engineering College</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Journey Essentials Quick Access */}
          <button
            onClick={() => setIsEssentialsDrawerOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-cyan-500/40 shadow-lg transition-transform hover:scale-105"
          >
            <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>Journey Essentials</span>
          </button>

          {selectedVehicle && selectedStop && (
            <button
              onClick={() => handleCheckCatchability(selectedVehicle, selectedStop)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
            >
              <Footprints className="w-4 h-4" />
              <span>Can I Catch This Bus?</span>
            </button>
          )}
          <button
            onClick={isDelayed ? handleResetSimulation : handleSimulateDelay}
            className={`text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition-all ${
              isDelayed ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
            }`}
          >
            {isDelayed ? (
              <><RotateCcw className="w-4 h-4" /><span>Reset Simulation</span></>
            ) : (
              <><Zap className="w-4 h-4 text-amber-300" /><span>Simulate Delay (+6m)</span></>
            )}
          </button>
        </div>
      </div>

      {/* Quick-Access Journey Essentials Strip (Section 6) */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            Journey Essentials
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Near {selectedStop?.stop_name || 'Vagaikulam Feeder Stop'}:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setIsEssentialsDrawerOpen(true)}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
          >
            <Hospital className="w-3.5 h-3.5 text-rose-400" />
            <span>Emergency</span>
          </button>

          <button
            onClick={() => setIsEssentialsDrawerOpen(true)}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
          >
            <Pill className="w-3.5 h-3.5 text-emerald-400" />
            <span>Medicine (180m)</span>
          </button>

          <button
            onClick={() => setIsEssentialsDrawerOpen(true)}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>Food (250m)</span>
          </button>

          <button
            onClick={() => setIsEssentialsDrawerOpen(true)}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
          >
            <Bath className="w-3.5 h-3.5 text-cyan-400" />
            <span>Toilet (45m)</span>
          </button>

          <button
            onClick={() => setIsEssentialsDrawerOpen(true)}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition-colors"
          >
            <Fuel className="w-3.5 h-3.5 text-orange-400" />
            <span>Fuel / EV</span>
          </button>

          <button
            onClick={() => setIsEssentialsDrawerOpen(true)}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>ATM (95m)</span>
          </button>

          <button
            onClick={() => navigate('/nearby')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded transition-colors whitespace-nowrap"
          >
            View All &rarr;
          </button>
        </div>
      </div>


      {/* Journey Stage Progress Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Journey Stage Progress</span>
          <div className="flex items-center gap-1.5">
            {JOURNEY_STAGES.map((stage, i) => {
              const SIcon = stage.iconKey === 'home' ? Activity
                : stage.iconKey === 'walk' ? Footprints
                : stage.iconKey === 'stop' ? MapPinIcon
                : stage.iconKey === 'bus' ? Bus
                : stage.iconKey === 'refresh' ? RotateCcw
                : CheckCircle2Icon;
              return (
                <button
                  key={stage.id}
                  onClick={() => setCurrentStage(stage.id as any)}
                  title={stage.label}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
                  style={i === stageIdx
                    ? { backgroundColor: stage.color + '22', borderColor: stage.color, color: stage.color }
                    : i < stageIdx
                    ? { backgroundColor: '#22c55e22', borderColor: '#22c55e66', color: '#22c55e' }
                    : { backgroundColor: '#1e293b', borderColor: '#334155', color: '#475569' }
                  }
                >
                  <SIcon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center">
          {JOURNEY_STAGES.map((stage, i) => {
            const SIcon = stage.iconKey === 'home' ? Activity
              : stage.iconKey === 'walk' ? Footprints
              : stage.iconKey === 'stop' ? MapPinIcon
              : stage.iconKey === 'bus' ? Bus
              : stage.iconKey === 'refresh' ? RotateCcw
              : CheckCircle2Icon;
            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${i < stageIdx ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400' : i === stageIdx ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400 animate-pulse' : 'border-slate-700 bg-slate-800/50 text-slate-600'}`}>
                    {i < stageIdx ? <CheckCircle2Icon className="w-4 h-4" /> : <SIcon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-bold mt-1 whitespace-nowrap ${i === stageIdx ? 'text-cyan-300' : i < stageIdx ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {stage.label}
                  </span>
                </div>
                {i < JOURNEY_STAGES.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 mt-[-14px] transition-all duration-500 rounded-full"
                    style={{ backgroundColor: i < stageIdx ? '#22c55e' : '#1e293b' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Bus ETA */}
        <div className={`rounded-2xl p-4 border shadow-lg transition-all ${isDelayed ? 'bg-rose-950/30 border-rose-500/50' : 'bg-slate-900/90 border-amber-500/30'}`}>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Bus ETA</span>
          </div>
          <div className={`text-3xl font-black ${isDelayed ? 'text-rose-400' : 'text-amber-400'}`}>
            {isDelayed ? busEta + simulatedDelay : busEta}
            <span className="text-sm font-semibold ml-1">min</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
          <span className="text-[10px] text-slate-500 block mt-1">
            {selectedVehicle ? `Bus ${selectedVehicle.route_short_name}` : "Route 15"} • {distanceKm} km away
          </span>
          </span>
          {isDelayed && (
            <span className="text-[10px] text-rose-400 font-bold">+{simulatedDelay}m delay applied</span>
          )}
        </div>

        {/* Live Speed */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase mb-2">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span>Bus Speed</span>
          </div>
          <div className="text-3xl font-black text-indigo-400">
            {speedKmh}
            <span className="text-sm font-semibold ml-1">km/h</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
          <span className="text-[10px] text-slate-500 block mt-1">
            {selectedVehicle?.status || "On Time"} • {selectedVehicle?.next_stop_name || "Approaching Stop"}
          </span>
          </span>
        </div>

        {/* Heat Stress */}
        <div className="rounded-2xl p-4 border shadow-lg transition-all"
          style={{ backgroundColor: heatColor + '11', borderColor: heatColor + '44' }}>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase mb-2">
            <Thermometer className="w-3.5 h-3.5" style={{ color: heatColor }} />
            <span>Heat Stress</span>
          </div>
          <div className="text-2xl font-black" style={{ color: heatColor }}>
            {ambientTempCelsius}°C
          </div>
          <span className="text-[10px] font-bold mt-1 block" style={{ color: heatColor }}>
            {heatStressLevel} • {heatMultiplier}x
          </span>
          <div className="w-full h-1 rounded-full bg-slate-800 mt-2">
            <div className="h-full rounded-full transition-all duration-700" 
              style={{ width: `${Math.min(100, (ambientTempCelsius - 20) * 5)}%`, backgroundColor: heatColor }} />
          </div>
        </div>

        {/* Crowding Level */}
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase mb-2">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Crowding</span>
          </div>
          <div className="text-2xl font-black" style={{ color: crowdingColor(crowding) }}>
            {crowding}
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 mt-2">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${crowdingPct(crowding)}%`, backgroundColor: crowdingColor(crowding) }} />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">{crowdingPct(crowding)}% capacity</span>
        </div>

        {/* Friction Index */}
        <div className={`rounded-2xl p-4 border shadow-lg transition-all ${
          computedFriction > 60 ? 'bg-rose-950/30 border-rose-500/50' : 'bg-slate-900/90 border-slate-700'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase mb-2">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Friction</span>
          </div>
          <div className={`text-3xl font-black ${computedFriction > 60 ? 'text-rose-400' : computedFriction > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {computedFriction}
            <span className="text-sm font-semibold text-slate-400 ml-0.5">/100</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${computedFriction}%`, backgroundColor: computedFriction > 60 ? '#ef4444' : computedFriction > 40 ? '#f59e0b' : '#22c55e' }} />
          </div>
        </div>

        {/* Transfer Risk */}
        <div className={`rounded-2xl p-4 border shadow-lg transition-all ${
          transferRisk === 'High' ? 'bg-rose-950/30 border-rose-500/50 animate-pulse' :
          transferRisk === 'Moderate' ? 'bg-amber-950/30 border-amber-500/50' :
          'bg-emerald-950/20 border-emerald-500/30'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase mb-2">
            <AlertTriangle className={`w-3.5 h-3.5 ${transferRisk === 'High' ? 'text-rose-400' : transferRisk === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span>Transfer Risk</span>
          </div>
          <div className={`text-2xl font-black ${transferRisk === 'High' ? 'text-rose-400' : transferRisk === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>
            {transferRisk}
          </div>
          <span className="text-[10px] mt-1 block text-slate-400">
            {transferRisk === 'High' ? 'Connection threatened' : transferRisk === 'Moderate' ? 'Monitor buffer' : 'Buffer safe'}
          </span>
          <span className="text-[10px] text-slate-500 block">Next: Tirunelveli Jn • 08:32</span>
        </div>
      </div>

      {/* Friction Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="p-1 rounded bg-rose-500/20 text-rose-400"><TrendingUp className="w-4 h-4" /></span>
            Live Friction Breakdown
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Total:</span>
            <span className={`text-sm font-black ${computedFriction > 60 ? 'text-rose-400' : 'text-amber-400'}`}>{computedFriction}/100</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {frictionBreakdown.map((f) => {
            const FIcon = f.iconKey === 'wait' ? Clock
              : f.iconKey === 'heat' ? Thermometer
              : f.iconKey === 'walk' ? Footprints
              : f.iconKey === 'crowd' ? Users
              : AlertTriangle;
            return (
              <div key={f.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-slate-300 font-semibold">
                    <FIcon className="w-3 h-3 shrink-0" style={{ color: f.color }} />
                    {f.label}
                  </span>
                  <span className="font-black" style={{ color: f.color }}>{f.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(f.value / f.max) * 100}%`, backgroundColor: f.color }} />
                </div>
                <span className="text-[9px] text-slate-600 block text-right">/{f.max} pts</span>
              </div>
            );
          })}
        </div>

        {/* Disruption alert */}
        {isDelayed && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span><strong>+{simulatedDelay}m delay:</strong> Friction elevated. Wait burden +{simulatedDelay*2}pts. Connection window: -2min.</span>
            </div>
            <button
              onClick={() => selectedVehicle && selectedStop && handleCheckCatchability(selectedVehicle, selectedStop)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow"
            >
              <Footprints className="w-3.5 h-3.5" />
              Verify Catchability
            </button>
          </div>
        )}
      </div>

      {/* Disruption Alternatives */}
      {journeyStatus === 'disrupted' && (
        <DisruptionAlternativesPanel
          alternatives={recoveryAlternatives}
          onSelectAlternative={handleSelectAlternative}
          currentDelay={simulatedDelay}
        />
      )}

      {/* Main Grid: Map and Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Transit Tracking Map</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Bus className="w-3.5 h-3.5 text-cyan-400" /> Vehicles: <strong className="text-cyan-400">{vehicles.length}</strong></span>
              <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5 text-sky-400" /> Stops: <strong className="text-cyan-400">{stops.length}</strong></span>
              <span className="flex items-center gap-1"><Radio className="w-3.5 h-3.5 text-indigo-400" /> Routes: <strong className="text-cyan-400">{routes.length}</strong></span>
            </div>
          </div>

          <LiveTransitMap
            vehicles={vehicles}
            routes={routes}
            stops={stops}
            selectedVehicle={selectedVehicle}
            selectedStop={selectedStop}
            userLocation={userLocationObj}
            onSelectVehicle={handleSelectVehicle}
            onSelectStop={handleSelectStop}
            onCheckCatchability={handleCheckCatchability}
            onUseBusForJourney={handleUseBusForJourney}
          />

          {/* Live Vehicle Roster */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bus className="w-3.5 h-3.5 text-cyan-400" /> Active Vehicles on Corridor
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {vehicles.map(v => (
                <button
                  key={v.vehicle_id}
                  onClick={() => handleSelectVehicle(v)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left border transition-all text-xs ${
                    selectedVehicle?.vehicle_id === v.vehicle_id
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow shadow-cyan-950/30'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                    style={{ backgroundColor: v.route_color + '30', color: v.route_color, border: `2px solid ${v.route_color}55` }}>
                    {v.route_short_name}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white truncate">{v.vehicle_id}</span>
                      {v.delay_minutes > 0 && <span className="text-rose-400 font-bold text-[10px]">+{v.delay_minutes}m</span>}
                    </div>
                    <span className="text-slate-500 truncate block">{v.next_stop_name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-black block ${v.delay_minutes > 0 ? 'text-rose-400' : 'text-amber-400'}`}>{v.eta_next_stop_min}m</span>
                    <span className="text-[9px] text-slate-500">{v.speed_kmh} km/h</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-500 flex items-center justify-between">
            <span>Click any bus or stop on the map for live telemetry. Use <strong className="text-cyan-400">Can I Catch This Bus?</strong> for real-time walk math.</span>
            <span className="text-[10px] text-cyan-500 font-mono shrink-0 ml-2">GTFS-RT Sim</span>
          </div>
        </div>

        {/* Right: Smart Stop + Timeline */}
        <div className="lg:col-span-5 space-y-5">
          {/* Walking Distance Card */}
          <div className="bg-slate-900/90 border border-orange-500/30 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400"><Footprints className="w-4 h-4" /></span>
              <h4 className="text-sm font-bold text-white">Walking Leg</h4>
              <span className="ml-auto text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                {currentStage === 'walking_to_stop' ? 'ACTIVE' : currentStage === 'departed' ? 'NEXT' : 'DONE'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-800/60 rounded-xl p-2.5">
                <span className="text-lg font-black text-orange-400">{walkMeters}m</span>
                <span className="text-[10px] text-slate-400 block">Distance</span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5">
                <span className="text-lg font-black text-orange-400">{walkMinutes}m</span>
                <span className="text-[10px] text-slate-400 block">Duration</span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5">
                <span className="text-lg font-black" style={{ color: heatColor }}>{heatMultiplier}x</span>
                <span className="text-[10px] text-slate-400 block">Heat Load</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>Walk Progress</span>
                <span>{currentStage === 'waiting_for_bus' || stageIdx > 2 ? '100%' : currentStage === 'walking_to_stop' ? '50%' : '0%'}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-orange-500 transition-all duration-700"
                  style={{ width: stageIdx >= 3 ? '100%' : stageIdx === 2 ? '100%' : stageIdx === 1 ? '50%' : '0%' }} />
              </div>
            </div>
          </div>

          <SmartBusStopPanel
            stop={selectedStop}
            arrivals={arrivals}
            vehicles={vehicles}
            selectedBusId={selectedVehicle?.vehicle_id || null}
            onSelectBus={(arr) => handleUseBusForJourney(arr)}
            onCheckCatchability={handleCheckCatchability}
            onUseForJourney={(arr) => handleUseBusForJourney(arr)}
            isPlannedStop={true}
          />

          <LiveJourneyTimeline
            currentStage={currentStage}
            originName={userLocationObj.label}
            busStopName={selectedStop ? selectedStop.stop_name : 'Boarding Stop'}
            vehicle={selectedVehicle}
            destinationName="Francis Xavier Engineering College (FXEC)"
            isDelayed={simulatedDelay > 0}
            delayMinutes={simulatedDelay}
            transferRiskLevel={transferRisk}
          />
        </div>
      </div>

      {/* Can I Catch Bus Modal */}
      <CanICatchBusModal
        isOpen={isCatchModalOpen}
        onClose={() => setIsCatchModalOpen(false)}
        result={catchResult}
        loading={isCatchLoading}
        vehicle={selectedVehicle}
        stop={selectedStop}
        userMode={role === 'accessibility' ? 'wheelchair' : 'walking'}
        onSelectNextBus={(nextBus) => {
          const found = vehicles.find(v => v.route_short_name === nextBus.route);
          if (found) setSelectedVehicle(found);
        }}
      />

      {/* Journey Essentials Slide-out Drawer */}
      <JourneyEssentialsDrawer
        isOpen={isEssentialsDrawerOpen}
        onClose={() => setIsEssentialsDrawerOpen(false)}
        currentStopName={selectedStop ? selectedStop.stop_name : 'Vagaikulam Feeder Stop'}
        anchorLat={selectedStop ? selectedStop.lat : userLat}
        anchorLng={selectedStop ? selectedStop.lng : userLng}
        busEtaMin={isDelayed ? busEta + simulatedDelay : busEta}
        busRouteName={selectedVehicle ? `Bus ${selectedVehicle.route_short_name}` : 'Bus 12A'}
        onOpenFullNearbyPage={() => navigate('/nearby')}
      />
    </div>
  );
};
