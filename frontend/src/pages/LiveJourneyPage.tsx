import React, { useState, useEffect, useRef } from 'react';
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
import { 
  Radio, 
  Footprints, 
  AlertTriangle, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  Navigation, 
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  INITIAL_STOPS, 
  INITIAL_ROUTES, 
  INITIAL_VEHICLES, 
  INITIAL_ARRIVALS 
} from '../data/transitMockData';

export const LiveJourneyPage: React.FC = () => {
  const { currentLocation, role, currentUser } = useApp();
  const [weather] = useState({ temp: 33, rain_mm: 0, conditions: 'Sunny / Hot' });

  // Transit Data State (Pre-populated for instantaneous zero-latency rendering)
  const [vehicles, setVehicles] = useState<TransitVehicle[]>(INITIAL_VEHICLES);
  const [routes, setRoutes] = useState<TransitRoute[]>(INITIAL_ROUTES);
  const [stops, setStops] = useState<TransitStop[]>(INITIAL_STOPS);
  const [loading, setLoading] = useState<boolean>(false);

  // Active Journey Tracking State
  const [selectedVehicle, setSelectedVehicle] = useState<TransitVehicle | null>(INITIAL_VEHICLES[0]);
  const [selectedStop, setSelectedStop] = useState<TransitStop | null>(INITIAL_STOPS[1]);
  const [arrivals, setArrivals] = useState<StopArrival[]>(INITIAL_ARRIVALS);
  
  // Journey Simulation Metrics
  const [journeyStatus, setJourneyStatus] = useState<'on_schedule' | 'tight' | 'disrupted'>('on_schedule');
  const [frictionScore, setFrictionScore] = useState<number>(31);
  const [transferRisk, setTransferRisk] = useState<'Low' | 'Moderate' | 'High'>('Low');
  const [simulatedDelay, setSimulatedDelay] = useState<number>(0);
  const [recoveryAlternatives, setRecoveryAlternatives] = useState<RecoveryAlternative[]>([]);

  // Catchability Modal State
  const [isCatchModalOpen, setIsCatchModalOpen] = useState<boolean>(false);
  const [catchResult, setCatchResult] = useState<CatchabilityResult | null>(null);
  const [isCatchLoading, setIsCatchLoading] = useState<boolean>(false);

  // Demo auto-stepper timer
  const pollingRef = useRef<any>(null);

  // User Origin Location (Defaults to TCR Airport or current GPS)
  const userLat = currentLocation?.lat || 8.723;
  const userLng = currentLocation?.lng || 78.026;
  const userLocationObj = {
    lat: userLat,
    lng: userLng,
    label: currentLocation?.city?.toLowerCase().includes('tirunelveli') || currentUser?.district?.toLowerCase().includes('tirunelveli')
      ? 'Tirunelveli Departure' 
      : 'Thoothukudi Airport (TCR) Origin'
  };

  // 1. Initial Load of Transit Data
  const loadTransitData = async () => {
    try {
      const bundle = await fetchLiveTransit();
      if (bundle) {
        setVehicles(bundle.vehicles || []);
        setRoutes(bundle.routes || []);
        setStops(bundle.stops || []);

        // Default select nearest stop along active corridor
        if (bundle.stops && bundle.stops.length > 0) {
          const defaultStop = bundle.stops.find(s => s.stop_id.includes('VAG') || s.stop_id.includes('TCR')) || bundle.stops[0];
          setSelectedStop(defaultStop);
          loadArrivals(defaultStop.stop_id);
        }

        // Default select corridor bus (Bus 15)
        if (bundle.vehicles && bundle.vehicles.length > 0) {
          const defaultVehicle = bundle.vehicles.find(v => v.route_short_name === '15' || v.route_id === 'ROUTE-15') || bundle.vehicles[0];
          setSelectedVehicle(defaultVehicle);
        }
      }
    } catch (e) {
      console.warn('Failed to load transit bundle:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadArrivals = async (stopId: string) => {
    const arrs = await fetchStopArrivals(stopId);
    setArrivals(arrs);
  };

  useEffect(() => {
    loadTransitData();

    // Start live updates polling (every 3.5s for smooth vehicle motion)
    pollingRef.current = setInterval(async () => {
      try {
        const bundle = await fetchLiveTransit();
        if (bundle?.vehicles) {
          setVehicles(bundle.vehicles);
          // Keep active vehicle telemetry fresh
          if (selectedVehicle) {
            const updated = bundle.vehicles.find(v => v.vehicle_id === selectedVehicle.vehicle_id);
            if (updated) setSelectedVehicle(updated);
          }
        }
      } catch (err) {
        // silent fail
      }
    }, 3500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Update arrivals when stop changes
  const handleSelectStop = (stop: TransitStop) => {
    setSelectedStop(stop);
    loadArrivals(stop.stop_id);
  };

  const handleSelectVehicle = (vehicle: TransitVehicle) => {
    setSelectedVehicle(vehicle);
    // Find stop closest to this vehicle
    const matchedStop = stops.find(s => s.stop_id === vehicle.next_stop_id);
    if (matchedStop) {
      setSelectedStop(matchedStop);
      loadArrivals(matchedStop.stop_id);
    }
  };

  // 2. "Can I Catch This Bus?" Calculator Trigger
  const handleCheckCatchability = async (vehicle: TransitVehicle, stop: TransitStop) => {
    setIsCatchModalOpen(true);
    setIsCatchLoading(true);
    try {
      const weatherMultiplier = weather?.rain_mm && weather.rain_mm > 0 ? 1.25 : 1.0;
      const res = await checkCatchability({
        user_lat: userLat,
        user_lng: userLng,
        stop_lat: stop.lat,
        stop_lng: stop.lng,
        bus_eta_min: vehicle.eta_next_stop_min || 5,
        user_mode: role === 'accessibility' ? 'wheelchair' : 'walking',
        weather_multiplier: weatherMultiplier
      });
      setCatchResult(res);
    } catch (e) {
      console.warn('Error evaluating catchability:', e);
    } finally {
      setIsCatchLoading(false);
    }
  };

  // 3. Simulate Bus Delay (+6 min)
  const handleSimulateDelay = async () => {
    const targetVehicleId = selectedVehicle?.vehicle_id || 'BUS-15-01';
    const delayAmt = 6;
    await simulateBusDelay(targetVehicleId, delayAmt);
    setSimulatedDelay(delayAmt);
    setJourneyStatus('disrupted');
    setTransferRisk('High');
    setFrictionScore(62); // elevated via penalty breakdown

    // Trigger recalculation of 4 alternatives
    const recalc = await recalculateDisruptedJourney({
      current_bus_id: targetVehicleId,
      current_delay_min: delayAmt,
      destination: 'Francis Xavier Engineering College (FXEC)'
    });

    if (recalc?.recovery_alternatives) {
      setRecoveryAlternatives(recalc.recovery_alternatives);
    }

    // Refresh vehicle state
    const bundle = await fetchLiveTransit();
    if (bundle?.vehicles) setVehicles(bundle.vehicles);
  };

  // 4. Reset Simulation
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

  // 5. Select Alternative Recovery Option
  const handleSelectAlternative = (alt: RecoveryAlternative) => {
    setJourneyStatus('on_schedule');
    setTransferRisk(alt.transfer_risk);
    setFrictionScore(alt.mobility_friction_index);
    setRecoveryAlternatives([]);
    setSimulatedDelay(0);
  };

  // 6. Use Bus for Journey
  const handleUseBusForJourney = (arrivalOrVehicle: any) => {
    const vId = arrivalOrVehicle.vehicle_id;
    const found = vehicles.find(v => v.vehicle_id === vId);
    if (found) setSelectedVehicle(found);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner with Demo Simulation & Quick Hackathon Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                Live Journey Mode
              </h1>
              <span className="text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                🟡 DEMO SIMULATION
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Human-centric real-time transit intelligence: Connects live bus GPS directly to your multimodal journey friction.
            </p>
          </div>
        </div>

        {/* Hackathon Quick Flow Triggers */}
        <div className="flex items-center gap-2">
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
            onClick={journeyStatus === 'disrupted' ? handleResetSimulation : handleSimulateDelay}
            className={`text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition-all ${
              journeyStatus === 'disrupted'
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
            }`}
          >
            {journeyStatus === 'disrupted' ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Reset Simulation</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Simulate Delay (+6m)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prominent Live Journey Status Card */}
      <LiveJourneyStatusCard
        status={journeyStatus}
        currentLocationName={selectedStop ? selectedStop.stop_name : 'Vagaikulam / Gandhipuram Stop'}
        activeVehicle={selectedVehicle}
        nearestStop={selectedStop}
        busEtaMin={selectedVehicle ? selectedVehicle.eta_next_stop_min : 4}
        expectedArrivalTime={journeyStatus === 'disrupted' ? '09:07 AM (Delayed)' : '08:54 AM'}
        frictionScore={frictionScore}
        transferRiskLevel={transferRisk}
        walkingRemainingMeters={520}
        delayMinutes={simulatedDelay}
        onSimulateDelay={handleSimulateDelay}
        onResetSimulation={handleResetSimulation}
        onOpenCatchability={() => selectedVehicle && selectedStop && handleCheckCatchability(selectedVehicle, selectedStop)}
      />

      {/* Disruption Recovery Alternatives (Shown when delay is simulated) */}
      {journeyStatus === 'disrupted' && (
        <DisruptionAlternativesPanel
          alternatives={recoveryAlternatives}
          onSelectAlternative={handleSelectAlternative}
          currentDelay={simulatedDelay}
        />
      )}

      {/* Main Grid: Interactive Map (Left 7 Cols) + Smart Stop & Timeline (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Live Leaflet Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Transit Tracking Map
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Active Vehicles: <strong className="text-cyan-400">{vehicles.length}</strong> • Stops: <strong className="text-cyan-400">{stops.length}</strong>
            </span>
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

          {/* Quick instructions pill */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
            <span>💡 Click any moving bus icon to view live speed, route, and catchability. Click stops to view upcoming arrivals.</span>
            <span className="text-[10px] text-cyan-400 font-mono">GTFS-RT Protocol Simulator</span>
          </div>
        </div>

        {/* Right Column: Smart Bus Stop View & Multimodal Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Smart Bus Stop Panel */}
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

          {/* Live Multimodal Journey Timeline */}
          <LiveJourneyTimeline
            currentStage="waiting_for_bus"
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

      {/* "Can I Catch This Bus?" Transparent Calculation Modal */}
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
    </div>
  );
};
