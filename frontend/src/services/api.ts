import { Zone, Journey, RiskZone, ConflictEvent, VideoAnalysisResult } from '../types';

const API_BASE = 'http://localhost:8000/api';

export interface DashboardResponse {
  kpis: {
    peopleAnalyzed: number;
    journeysAnalyzed: number;
    averageJourneyMin: number;
    averageFriction: number;
    highFrictionZones: number;
    interventionsSimulated: number;
  };
  systemStatus: string;
  simulationMode: boolean;
  connectedDatabase: string;
  dataNote: string;
}

export async function fetchDashboardData(): Promise<DashboardResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using local mock data:', err);
    return null;
  }
}

export async function fetchZones(city?: string): Promise<Zone[]> {
  try {
    const url = city && city !== 'all' ? `${API_BASE}/zones?city=${encodeURIComponent(city)}` : `${API_BASE}/zones`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch zones');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Using local zones fallback:', err);
    return [];
  }
}

export async function saveJourneyToMongo(journey: Partial<Journey>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/journey/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(journey)
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save journey to MongoDB:', err);
    return false;
  }
}

export async function reverseGeocodeNominatim(lat: number, lng: number): Promise<{ name: string; city: string }> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    if (res.ok) {
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.state_district || data.address?.state || 'Local Zone';
      const name = data.display_name?.split(',')[0] || `${city} Area`;
      return { name, city };
    }
  } catch (e) {
    console.warn('Reverse geocode error:', e);
  }
  return { name: `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`, city: 'Detected Location' };
}

export async function searchPlacesNominatim(query: string): Promise<Array<{ display_name: string; lat: string; lon: string }>> {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`, {
      headers: { 'Accept-Language': 'en' }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Place search error:', e);
  }
  return [];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    district?: string;
    organization?: string;
  };
  token: string;
  features: Array<{
    id: string;
    title: string;
    route: string;
    icon: string;
    badge: string;
    benefit: string;
    description: string;
  }>;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    return await res.json();
  } catch (err: any) {
    console.warn('Login request failed:', err.message);
    throw err;
  }
}

export async function signupUser(userData: {
  name: string;
  email: string;
  password: string;
  role: string;
  district?: string;
  organization?: string;
}): Promise<AuthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Sign up failed');
    }
    return await res.json();
  } catch (err: any) {
    console.warn('Signup request failed:', err.message);
    throw err;
  }
}

export async function fetchRoleFeatures(role: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/features/${encodeURIComponent(role)}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Fetch features error:', err);
  }
  return null;
}

export async function fetchReports() {
  try {
    const res = await fetch(`${API_BASE}/reports`);
    if (res.ok) {
      const data = await res.json();
      return data.reports || [];
    }
  } catch (err) {
    console.warn('Failed to fetch reports from backend:', err);
  }
  return [];
}

export async function createReport(reportData: any) {
  try {
    const res = await fetch(`${API_BASE}/reports/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to create report:', err);
  }
  return null;
}

export async function upvoteReport(reportId: string) {
  try {
    const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(reportId)}/upvote`, {
      method: 'POST'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to upvote report:', err);
  }
  return null;
}

// ==========================================
// LIVE TRANSIT & JOURNEY INTELLIGENCE APIS
// ==========================================

export interface TransitVehicle {
  vehicle_id: string;
  route_id: string;
  route_short_name: string;
  route_color: string;
  headsign: string;
  lat: number;
  lng: number;
  speed_kmh: number;
  bearing_deg: number;
  next_stop_id: string;
  next_stop_name: string;
  stops_remaining: number;
  eta_next_stop_min: number;
  distance_from_user_km: number;
  delay_minutes: number;
  status: string;
  crowding_level: 'Low' | 'Moderate' | 'High' | 'Very High';
  is_accessible: boolean;
  last_updated: string;
}

export interface TransitStop {
  stop_id: string;
  stop_name: string;
  lat: number;
  lng: number;
  zone_id: string;
  routes_served: string[];
  is_accessible: boolean;
  shelter_type: string;
}

export interface TransitRoute {
  route_id: string;
  short_name: string;
  long_name: string;
  route_type: string;
  color: string;
  frequency_min: number;
  stops: TransitStop[];
  waypoints: [number, number][];
}

export interface StopArrival {
  route_id: string;
  route_short_name: string;
  vehicle_id: string;
  headsign: string;
  eta_minutes: number;
  scheduled_time: string;
  delay_minutes: number;
  distance_km: number;
  crowding: string;
  is_accessible: boolean;
  status: string;
}

export interface CatchabilityResult {
  can_catch: boolean;
  verdict: 'HIGH CHANCE' | 'TIGHT BUFFER' | 'HIGH RISK';
  user_walking_distance_m: number;
  user_walking_time_min: number;
  bus_eta_min: number;
  buffer_min: number;
  explanation: string;
  calculation_breakdown: {
    distance_meters: number;
    walking_speed_kmh: number;
    weather_multiplier: number;
    user_mode: string;
    gross_walking_min: number;
    bus_eta_min: number;
    safety_margin_min: number;
  };
  next_available_bus?: {
    route: string;
    vehicle_id: string;
    eta_min: number;
    headsign: string;
  };
}

export interface RecoveryAlternative {
  option_id: string;
  label: string;
  strategy: string;
  estimated_arrival: string;
  walking_distance_m: number;
  walking_time_min: number;
  cost_inr: number;
  waiting_min: number;
  transfers: number;
  mobility_friction_index: number;
  transfer_risk: 'Low' | 'Moderate' | 'High';
  recommended: boolean;
}

export interface TransferRiskResult {
  risk_level: 'Low' | 'Moderate' | 'High';
  buffer_minutes: number;
  message: string;
  bus_arrival_min: number;
  connection_departure_min: number;
  transfer_walk_min: number;
  alternatives: RecoveryAlternative[];
}

export interface LiveTransitBundle {
  status: string;
  data_mode: string;
  vehicles: TransitVehicle[];
  routes: TransitRoute[];
  stops: TransitStop[];
}

export async function fetchLiveTransit(): Promise<LiveTransitBundle | null> {
  try {
    const res = await fetch(`${API_BASE}/transit/live`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Live transit fetch error:', err);
  }
  return null;
}

export async function fetchStopArrivals(stopId: string): Promise<StopArrival[]> {
  try {
    const res = await fetch(`${API_BASE}/transit/arrivals/${encodeURIComponent(stopId)}`);
    if (res.ok) {
      const data = await res.json();
      return data.arrivals || [];
    }
  } catch (err) {
    console.warn('Arrivals fetch error:', err);
  }
  return [];
}

export async function checkCatchability(params: {
  user_lat: number;
  user_lng: number;
  stop_lat: number;
  stop_lng: number;
  bus_eta_min: number;
  user_mode?: string;
  weather_multiplier?: number;
}): Promise<CatchabilityResult | null> {
  try {
    const res = await fetch(`${API_BASE}/journey/catchability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const data = await res.json();
      const raw = data.result;
      if (raw) {
        const buffer = raw.buffer_min !== undefined ? raw.buffer_min : (raw.time_buffer_min !== undefined ? raw.time_buffer_min : (params.bus_eta_min - 7));
        const walkDist = raw.user_walking_distance_m ?? raw.walking_distance_m ?? 550;
        const walkTime = raw.user_walking_time_min ?? raw.walking_time_min ?? 7;
        const verdict = raw.verdict || (buffer >= 4 ? 'HIGH CHANCE' : buffer >= 0 ? 'TIGHT BUFFER' : 'HIGH RISK');
        const explanation = raw.explanation || raw.recommendation || (buffer < 0 ? '⚠️ HIGH CATCH RISK: Walking time exceeds bus arrival ETA. You may miss this bus.' : 'You can comfortably catch this bus.');
        
        return {
          can_catch: raw.can_catch ?? (buffer >= 0),
          verdict: verdict as any,
          user_walking_distance_m: walkDist,
          user_walking_time_min: walkTime,
          bus_eta_min: raw.bus_eta_min ?? params.bus_eta_min,
          buffer_min: buffer,
          explanation: explanation,
          calculation_breakdown: {
            distance_meters: walkDist,
            walking_speed_kmh: raw.calculation_breakdown?.walking_speed_kmh ?? 4.8,
            weather_multiplier: raw.calculation_breakdown?.weather_multiplier ?? (params.weather_multiplier || 1.0),
            user_mode: params.user_mode || 'walking',
            gross_walking_min: walkTime,
            bus_eta_min: params.bus_eta_min,
            safety_margin_min: buffer
          },
          next_available_bus: {
            route: raw.next_alternative_bus?.route || raw.next_available_bus?.route || '12A',
            vehicle_id: raw.next_available_bus?.vehicle_id || '12A-108',
            eta_min: raw.next_alternative_bus?.next_bus_eta_minutes || raw.next_available_bus?.eta_min || 17,
            headsign: raw.next_available_bus?.headsign || 'Gandhipuram Central'
          }
        };
      }
    }
  } catch (err) {
    console.warn('Catchability check error:', err);
  }

  // Guaranteed fallback for Demo Simulation
  const dist = 550;
  const walkTime = 7;
  const buffer = params.bus_eta_min - walkTime;
  return {
    can_catch: buffer >= 0,
    verdict: buffer >= 4 ? 'HIGH CHANCE' : buffer >= 0 ? 'TIGHT BUFFER' : 'HIGH RISK',
    user_walking_distance_m: dist,
    user_walking_time_min: walkTime,
    bus_eta_min: params.bus_eta_min,
    buffer_min: buffer,
    explanation: buffer < 0 
      ? '⚠️ HIGH CATCH RISK: Estimated walking time is 7 min, but bus arrives in 5 min. You may miss this bus.'
      : 'You can catch this bus with a comfortable safety margin.',
    calculation_breakdown: {
      distance_meters: dist,
      walking_speed_kmh: 4.8,
      weather_multiplier: params.weather_multiplier || 1.0,
      user_mode: params.user_mode || 'walking',
      gross_walking_min: walkTime,
      bus_eta_min: params.bus_eta_min,
      safety_margin_min: buffer
    },
    next_available_bus: {
      route: '12A',
      vehicle_id: '12A-108',
      eta_min: 17,
      headsign: 'Gandhipuram Central'
    }
  };
}

export async function checkTransferRisk(params: {
  first_leg_eta_min: number;
  transfer_walk_min: number;
  connection_departure_min: number;
  bus_delay_min: number;
}): Promise<TransferRiskResult | null> {
  try {
    const res = await fetch(`${API_BASE}/journey/transfer-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const data = await res.json();
      return data.result;
    }
  } catch (err) {
    console.warn('Transfer risk check error:', err);
  }
  return null;
}

export async function simulateBusDelay(vehicleId: string, delayMinutes: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/transit/simulate-delay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_id: vehicleId, delay_minutes: delayMinutes })
    });
    return res.ok;
  } catch (err) {
    console.warn('Simulate delay error:', err);
    return false;
  }
}

export async function resetTransitDemo(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/transit/reset-demo`, {
      method: 'POST'
    });
    return res.ok;
  } catch (err) {
    console.warn('Reset demo error:', err);
    return false;
  }
}

export async function recalculateDisruptedJourney(params: {
  current_bus_id: string;
  current_delay_min: number;
  destination: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/journey/recalculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.recovery_alternatives) {
        const mapped = data.recovery_alternatives.map((a: any, idx: number) => ({
          option_id: a.option_id || a.id || `ALT-${idx}`,
          label: a.label || a.name || `Alternative ${idx + 1}`,
          strategy: a.strategy || a.summary || a.type || 'Intermodal Adjustment',
          estimated_arrival: a.estimated_arrival || a.eta_destination || (idx === 1 ? 'On Time (08:52 AM)' : '+18 min late'),
          walking_distance_m: a.walking_distance_m || (typeof a.walking_distance === 'string' ? parseInt(a.walking_distance) : 400),
          walking_time_min: a.walking_time_min || (idx === 2 ? 2 : idx === 1 ? 5 : 8),
          waiting_min: a.waiting_min || (idx === 0 ? 15 : idx === 1 ? 3 : 2),
          cost_inr: a.cost_inr || (idx === 1 ? 45 : 35),
          transfers: a.transfers ?? (idx === 2 ? 0 : 1),
          mobility_friction_index: a.mobility_friction_index || a.friction_score || (idx === 1 ? 38 : idx === 2 ? 24 : 68),
          transfer_risk: (a.transfer_risk?.includes('Low') || a.transfer_risk?.includes('None')) ? 'Low' :
                         (a.transfer_risk?.includes('Mod') ? 'Moderate' : 'High'),
          recommended: idx === 1 || a.recommended === true
        }));
        return { ...data, recovery_alternatives: mapped };
      }
      return data;
    }
  } catch (err) {
    console.warn('Recalculate journey error:', err);
  }

  // Reliable offline fallback alternatives
  return {
    status: 'success',
    data_mode: 'DEMO_SIMULATION',
    current_delay: params.current_delay_min,
    is_disrupted: params.current_delay_min >= 4,
    recovery_alternatives: [
      {
        option_id: 'ALT-B',
        label: 'Route 15 Express Bypass Shuttle',
        strategy: 'Board incoming Express Shuttle at highway slip road to bypass city delays.',
        estimated_arrival: 'On Time (08:52 AM)',
        walking_distance_m: 350,
        walking_time_min: 4,
        waiting_min: 3,
        cost_inr: 45,
        transfers: 1,
        mobility_friction_index: 38,
        transfer_risk: 'Low',
        recommended: true
      },
      {
        option_id: 'ALT-C',
        label: 'Direct Campus EV Feeder Shuttle',
        strategy: 'Hop onto simulated direct feeder shuttle linking terminal directly to campus gate.',
        estimated_arrival: '12 min early (08:42 AM)',
        walking_distance_m: 120,
        walking_time_min: 2,
        waiting_min: 2,
        cost_inr: 40,
        transfers: 0,
        mobility_friction_index: 24,
        transfer_risk: 'Low',
        recommended: false
      },
      {
        option_id: 'ALT-D',
        label: 'Switch Transfer to Vallanadu Hub',
        strategy: 'Transfer at the sheltered Vallanadu depot rather than the highway shoulder.',
        estimated_arrival: '+6 min late (08:58 AM)',
        walking_distance_m: 450,
        walking_time_min: 6,
        waiting_min: 8,
        cost_inr: 38,
        transfers: 1,
        mobility_friction_index: 46,
        transfer_risk: 'Moderate',
        recommended: false
      },
      {
        option_id: 'ALT-A',
        label: 'Stay on Current Delayed Bus',
        strategy: 'Accept delay and wait for subsequent train/feeder connection at the junction.',
        estimated_arrival: '+18 min late (09:10 AM)',
        walking_distance_m: 600,
        walking_time_min: 8,
        waiting_min: 15,
        cost_inr: 35,
        transfers: 2,
        mobility_friction_index: 68,
        transfer_risk: 'High',
        recommended: false
      }
    ]
  };
}

// Road Safety & Mobility Risk API functions
export async function fetchRiskZones(): Promise<RiskZone[]> {
  try {
    const res = await fetch(`${API_BASE}/risk/zones`);
    if (res.ok) {
      const data = await res.json();
      return data.zones || [];
    }
  } catch (err) {
    console.warn('Fetch risk zones error:', err);
  }
  return [];
}

export async function fetchRecentConflicts(): Promise<ConflictEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/risk/conflicts`);
    if (res.ok) {
      const data = await res.json();
      return data.conflicts || [];
    }
  } catch (err) {
    console.warn('Fetch conflicts error:', err);
  }
  return [];
}

export async function analyzeJourneyRisk(segments: any[]): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/risk/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segments })
    });
    if (res.ok) {
      const data = await res.json();
      return data.result;
    }
  } catch (err) {
    console.warn('Analyze journey risk error:', err);
  }
  return null;
}

export async function analyzeTrafficVideo(params: { preset?: string; file?: File }): Promise<VideoAnalysisResult | null> {
  try {
    let res;
    if (params.file) {
      const formData = new FormData();
      formData.append('file', params.file);
      formData.append('preset', params.preset || 'junction_crossing');
      res = await fetch(`${API_BASE}/risk/video`, {
        method: 'POST',
        body: formData
      });
    } else {
      const formData = new FormData();
      formData.append('preset', params.preset || 'junction_crossing');
      res = await fetch(`${API_BASE}/risk/video`, {
        method: 'POST',
        body: formData
      });
    }
    if (res && res.ok) {
      const data = await res.json();
      return data.analysis;
    }
  } catch (err) {
    console.warn('Video analysis API error:', err);
  }
  return null;
}




