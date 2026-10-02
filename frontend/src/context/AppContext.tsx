import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Journey, 
  InterventionOption, 
  Zone, 
  WhatIfParams, 
  SimulationResult, 
  NotificationItem,
  CitizenReport
} from '../types';
import { 
  TCR_TO_FXEC_JOURNEY, 
  INTERVENTION_OPTIONS, 
  MOCK_ZONES, 
  NOTIFICATIONS_DATA 
} from '../data/mockData';
import { 
  applyInterventionToJourney, 
  simulateWhatIf 
} from '../simulation/frictionEngine';
import { 
  fetchDashboardData, 
  fetchZones, 
  saveJourneyToMongo,
  fetchReports,
  createReport,
  upvoteReport
} from '../services/api';

export type UserRole = 'citizen' | 'planner' | 'accessibility' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district?: string;
  organization?: string;
}

export interface LocationInfo {
  name: string;
  city: string;
  lat: number;
  lng: number;
  isLiveGPS: boolean;
}

interface AppContextType {
  // Auth & Roles
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: (u: UserProfile) => void;
  userEmail: string;
  logout: () => void;
  showAllTools: boolean;
  setShowAllTools: (val: boolean) => void;

  // Real Dynamic Location
  currentLocation: LocationInfo;
  setCurrentLocation: (loc: LocationInfo) => void;
  selectCityLocation: (city: string, lat: number, lng: number, name?: string) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;

  // Journeys & Analysis
  currentJourney: Journey;
  setCurrentJourney: (j: Journey) => void;
  selectedSegmentId: string | null;
  setSelectedSegmentId: (id: string | null) => void;
  loadDemoJourney: () => void;
  resetJourney: () => void;
  saveCurrentJourneyToAtlas: (j: Journey) => Promise<boolean>;

  // Interventions & Simulation
  selectedIntervention: InterventionOption;
  setSelectedIntervention: (int: InterventionOption) => void;
  afterJourney: Journey;
  
  // Zones & Map
  zones: Zone[];
  selectedZone: Zone;
  setSelectedZone: (z: Zone) => void;
  selectZoneById: (id: string) => void;

  // What-If
  whatIfParams: WhatIfParams;
  setWhatIfParams: React.Dispatch<React.SetStateAction<WhatIfParams>>;
  whatIfResult: SimulationResult;
  runWhatIfCalculation: () => void;

  // Demo & Presentation
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  isHackathonDemoRunning: boolean;
  hackathonStep: number;
  startHackathonDemo: () => void;
  stopHackathonDemo: () => void;
  nextHackathonStep: () => void;
  prevHackathonStep: () => void;
  isPresentationMode: boolean;
  setIsPresentationMode: (val: boolean) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (val: boolean) => void;

  // AI Assistant
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (val: boolean) => void;
  chatMessages: { role: 'user' | 'assistant'; text: string; time: string }[];
  sendAIMessage: (text: string) => void;

  // Crowdsourced Citizen Reports
  reports: CitizenReport[];
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportPreFill: { locationName: string; lat: number; lng: number } | null;
  setReportPreFill: (data: { locationName: string; lat: number; lng: number } | null) => void;
  addReport: (rep: Partial<CitizenReport>) => Promise<boolean>;
  upvoteReportAction: (id: string) => Promise<void>;

  // Heat Stress & Climate Multiplier
  departureHour: number;
  setDepartureHour: (h: number) => void;
  isShadedRouteActive: boolean;
  setIsShadedRouteActive: (val: boolean) => void;
  heatMultiplier: number;
  ambientTempCelsius: number;
  heatStressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

  // System status
  backendStatus: string;
  databaseName: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial user from localStorage or default
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('mobilens_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: 'user-citizen-01',
      name: 'Velraj (Student / Commuter)',
      email: 'citizen@mobilens.ai',
      role: 'citizen',
      district: 'Tirunelveli',
      organization: 'Francis Xavier Engineering College'
    };
  });

  const [role, setRoleState] = useState<UserRole>(currentUser.role);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mobilens_auth') === 'true';
  });
  const [showAllTools, setShowAllTools] = useState<boolean>(false);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setCurrentUser(prev => {
      const updated = { ...prev, role: newRole };
      try {
        localStorage.setItem('mobilens_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSetCurrentUser = (u: UserProfile) => {
    setCurrentUser(u);
    setRoleState(u.role);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('mobilens_user', JSON.stringify(u));
      localStorage.setItem('mobilens_auth', 'true');
    } catch (e) {}
  };

  const logout = () => {
    setIsAuthenticated(false);
    const guestUser: UserProfile = {
      id: 'user-guest',
      name: 'Guest Commuter',
      email: 'guest@mobilens.ai',
      role: 'citizen',
      district: 'Tirunelveli',
      organization: 'Citizen Access'
    };
    setCurrentUser(guestUser);
    setRoleState('citizen');
    try {
      localStorage.removeItem('mobilens_auth');
      localStorage.removeItem('mobilens_user');
      localStorage.removeItem('mobilens_token');
    } catch (e) {}
  };

  const [currentJourney, setCurrentJourney] = useState<Journey>(TCR_TO_FXEC_JOURNEY);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>('seg-vagaikulam-wait');
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionOption>(INTERVENTION_OPTIONS[0]);
  
  // Default active location set to Tirunelveli - Thoothukudi Corridor
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>({
    name: 'Francis Xavier Engineering College, Vannarpettai',
    city: 'Tirunelveli',
    lat: 8.7300,
    lng: 77.7126,
    isLiveGPS: false
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Dynamic Zones from MongoDB Atlas
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [selectedZone, setSelectedZone] = useState<Zone>(MOCK_ZONES[0]);
  
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isHackathonDemoRunning, setIsHackathonDemoRunning] = useState<boolean>(false);
  const [hackathonStep, setHackathonStep] = useState<number>(1);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS_DATA);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);

  // Crowdsourced Reports State
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPreFill, setReportPreFill] = useState<{ locationName: string; lat: number; lng: number } | null>(null);

  // Heat Stress & Time of Day State (Tirunelveli & Thoothukudi Climate Model)
  const [departureHour, setDepartureHour] = useState<number>(8.0); // 8:00 AM default
  const [isShadedRouteActive, setIsShadedRouteActive] = useState<boolean>(false);

  // Temperature curve based on sun angle in South Tamil Nadu (26°C morning to 39°C midday)
  const ambientTempCelsius = Math.round(
    26 + 13 * Math.sin(((Math.max(6, Math.min(20, departureHour)) - 6) / 14) * Math.PI)
  );

  let rawMultiplier = 1.0;
  if (departureHour >= 11.5 && departureHour <= 15.5) {
    rawMultiplier = 2.15; // Peak midday solar strain
  } else if ((departureHour >= 9 && departureHour < 11.5) || (departureHour > 15.5 && departureHour <= 17.5)) {
    rawMultiplier = 1.4; // Moderate heat
  } else if (departureHour > 17.5) {
    rawMultiplier = 1.1; // Evening
  } else {
    rawMultiplier = 1.0; // Early morning
  }

  // Shaded canopy reduces physical heat strain by 35%
  const heatMultiplier = isShadedRouteActive 
    ? Math.max(1.0, Number((rawMultiplier * 0.65).toFixed(2)))
    : Number(rawMultiplier.toFixed(2));

  const heatStressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 
    ambientTempCelsius >= 37 ? 'EXTREME' :
    ambientTempCelsius >= 33 ? 'HIGH' :
    ambientTempCelsius >= 30 ? 'MODERATE' : 'LOW';

  const [backendStatus, setBackendStatus] = useState<string>('Live MongoDB Atlas Operational');
  const [databaseName, setDatabaseName] = useState<string>('Mobilensai');

  const addReport = async (rep: Partial<CitizenReport>): Promise<boolean> => {
    try {
      const res = await createReport({
        locationName: rep.locationName || 'Tirunelveli Transit Point',
        district: rep.district || 'Tirunelveli',
        category: rep.category || 'excessive_wait',
        severity: rep.severity || 'high',
        title: rep.title || 'Reported Transfer Bottleneck',
        description: rep.description || 'Reported by commuter via MobiLens AI app.',
        lat: rep.coordinates?.lat || 8.7300,
        lng: rep.coordinates?.lng || 77.7126,
        reportedBy: currentUser.name || 'Citizen Commuter'
      });
      if (res && res.report) {
        setReports(prev => [res.report, ...prev]);
        return true;
      }
    } catch (e) {
      console.warn('Error adding report:', e);
    }
    return false;
  };

  const upvoteReportAction = async (id: string): Promise<void> => {
    try {
      const res = await upvoteReport(id);
      if (res && res.success) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: res.upvotes } : r));
      }
    } catch (e) {
      console.warn('Error upvoting report:', e);
    }
  };

  // Load live data from MongoDB Atlas on mount
  useEffect(() => {
    fetchReports().then(reps => {
      if (reps && reps.length > 0) setReports(reps);
    });
    fetchDashboardData()
      .then(data => {
        if (data) {
          setBackendStatus(data.systemStatus || 'Live MongoDB Atlas Connected');
          setDatabaseName(data.connectedDatabase || 'Mobilensai');
        }
      })
      .catch(() => {
        setBackendStatus('Simulation Mode');
      });

    // Fetch zones from backend / MongoDB Atlas
    fetchZones()
      .then(dbZones => {
        if (dbZones && dbZones.length > 0) {
          setZones(dbZones);
          // Set FXEC or Tirunelveli zone as selected
          const fxecZone = dbZones.find(z => z.id.includes('fxec') || z.name.includes('Francis Xavier')) || dbZones[0];
          setSelectedZone(fxecZone);
        }
      })
      .catch(() => {});
  }, []);

  // When city changes, fetch city-specific zones from MongoDB
  const selectCityLocation = async (city: string, lat: number, lng: number, name?: string) => {
    setCurrentLocation({
      name: name || `${city} Transit Corridor`,
      city: city,
      lat: lat,
      lng: lng,
      isLiveGPS: false
    });

    try {
      const cityZones = await fetchZones(city);
      if (cityZones && cityZones.length > 0) {
        setZones(cityZones);
        const critical = cityZones.find(z => z.frictionScore >= 75) || cityZones[0];
        setSelectedZone(critical);
      }
    } catch (e) {
      console.warn('Error loading zones for city:', e);
    }
  };

  // Compute After Journey dynamically
  const [afterJourney, setAfterJourney] = useState<Journey>(() => 
    applyInterventionToJourney(TCR_TO_FXEC_JOURNEY, INTERVENTION_OPTIONS[0])
  );

  useEffect(() => {
    setAfterJourney(applyInterventionToJourney(currentJourney, selectedIntervention));
  }, [currentJourney, selectedIntervention]);

  // Save journey to MongoDB Atlas
  const saveCurrentJourneyToAtlas = async (j: Journey) => {
    const success = await saveJourneyToMongo(j);
    return success;
  };

  // What-If Simulator state
  const [whatIfParams, setWhatIfParams] = useState<WhatIfParams>({
    busFrequencyPerHour: 4,
    trainFrequencyPerHour: 3,
    avgTransferWaitMinutes: 16,
    walkingConnectionMinutes: 15,
    feederAvailabilityPct: 20,
    scheduleSyncPct: 20,
    accessibilityLevelPct: 35
  });

  const [whatIfResult, setWhatIfResult] = useState<SimulationResult>(() => 
    simulateWhatIf(TCR_TO_FXEC_JOURNEY, {
      busFrequencyPerHour: 4,
      trainFrequencyPerHour: 3,
      avgTransferWaitMinutes: 16,
      walkingConnectionMinutes: 15,
      feederAvailabilityPct: 20,
      scheduleSyncPct: 20,
      accessibilityLevelPct: 35
    })
  );

  const runWhatIfCalculation = () => {
    setWhatIfResult(simulateWhatIf(currentJourney, whatIfParams));
  };

  const loadDemoJourney = () => {
    setCurrentJourney(TCR_TO_FXEC_JOURNEY);
    setSelectedSegmentId('seg-vagaikulam-wait');
    setSelectedIntervention(INTERVENTION_OPTIONS[0]);
  };

  const resetJourney = () => {
    loadDemoJourney();
  };

  const selectZoneById = (id: string) => {
    const found = zones.find(z => z.id === id || z.code.toLowerCase().includes(id.toLowerCase()));
    if (found) setSelectedZone(found);
  };

  // Hackathon demo flow controller
  const startHackathonDemo = () => {
    setIsHackathonDemoRunning(true);
    setHackathonStep(1);
    loadDemoJourney();
  };

  const stopHackathonDemo = () => {
    setIsHackathonDemoRunning(false);
    setHackathonStep(1);
  };

  const nextHackathonStep = () => {
    setHackathonStep(prev => Math.min(18, prev + 1));
  };

  const prevHackathonStep = () => {
    setHackathonStep(prev => Math.max(1, prev - 1));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // AI Assistant Chat
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      role: 'assistant',
      text: "Vanakkam! I am MobiLens AI, analyzing human-centric mobility for Tirunelveli and Thoothukudi districts, Tamil Nadu. Ask: 'Where is my bus?', 'Can I catch the 12A?', 'Why did my friction increase?', or 'Show me a route with lower risk exposure.'",
      time: 'Just now'
    }
  ]);

  const sendAIMessage = (text: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user' as const, text, time: now };
    
    let reply = "MobiLens evaluates human burden across waiting, transfers, walking, cost, and accessibility in Tirunelveli & Thoothukudi districts.";
    const lower = text.toLowerCase();

    if (lower.includes('where is my bus') || lower.includes('bus location')) {
      reply = "🚌 [Simulated Live GPS Feed]: Bus 15 (BUS-15-01) is currently 1.8 km away heading towards Vagaikulam Stop (ETA 4 min, on schedule). Bus 12A (BUS-12A-01) is currently at RS Puram heading to Gandhipuram (ETA 5 min, 1.4 km away). You can track both moving in real-time under 'Live Journey'.";
    } else if (lower.includes('catch') || lower.includes('can i catch')) {
      reply = "🚶 Live Catchability Calculation: At standard walking pace (80 m/min, 4.8 km/h), walking 550m to the bus stop takes ~7 minutes. If Bus 12A ETA is 5 minutes, you face a -2 minute deficit (⚠️ HIGH CATCH RISK). 'You may miss this bus.' We recommend taking the subsequent Bus 12A arriving in 17 minutes. Click 'Can I Catch This Bus?' on Live Journey for the complete arithmetic.";
    } else if (lower.includes('next bus') || lower.includes('which bus comes next')) {
      reply = "🚌 Approaching Departures at your stop: 1) Bus 12A Express (ETA 5 min, On Time); 2) Feeder 7B (ETA 8 min, Low crowding); 3) Bus 12A Relief Service (ETA 17 min).";
    } else if (lower.includes('miss my train') || lower.includes('will i make my train') || lower.includes('transfer') || lower.includes('connection')) {
      reply = "🚆 Transfer Risk Engine: Bus arrival 08:20 + 5 min walking transfer vs Train departure 08:32 gives a 7-minute buffer (🟢 LOW RISK). However, if your bus is delayed by +6 min (arrival 08:26), you arrive at the platform at 08:31, leaving only 1 min buffer (🔴 HIGH TRANSFER RISK — Missed Train). MobiLens calculates 4 recovery alternatives to keep your commute on schedule.";
    } else if (lower.includes('why did my friction increase') || lower.includes('friction increase') || lower.includes('delay')) {
      reply = "📊 Friction Dynamics: When a +6 min delay occurs, the Prototype Mobility Friction Index increases from 72 to 86 (+14 points). Breakdown: Waiting burden penalty (+8 pts), Transfer connection failure hazard (+4 pts), and journey duration inflation (+2 pts). Selecting Alternative B (Rapid Bypass Shuttle) lowers friction back to 44.";
    } else if (lower.includes('elevated risk') || lower.includes('why is this route showing elevated risk') || lower.includes('risky')) {
      reply = "⚠️ Road Safety Exposure: This route crosses Zone 17 / Gandhipuram Crosswalk, where 23 near-miss conflicts have been observed. The primary conflict is unsignalized pedestrian crossing vs turning buses with Time-to-Collision (TTC) under 1.4 seconds. Protected crossing or an overpass is recommended.";
    } else if (lower.includes('less walking') || lower.includes('lower walking')) {
      reply = "🚶 Less Walking Alternative: We can route you via Route C (Feeder Shuttle + Low-Floor Bus). Total walking drops from 12 minutes (950m) down to 4 minutes (280m), although journey time is slightly longer (66m vs 61m). Check 'Safer Journey Comparison' in the Journey Analyzer for all trade-offs.";
    } else if (lower.includes('lower risk exposure') || lower.includes('safer route')) {
      reply = "🛡️ Lower Risk Route: Selecting Route B diverts the pedestrian leg through the sheltered station footbridge rather than crossing the arterial junction. Walking increases by 2 minutes, but friction drops from 72 to 51 and safety conflict exposure drops by 78%.";
    } else if (lower.includes('frequency') || lower.includes('what happens if bus frequency')) {
      reply = "⚙️ What-If Simulation: Increasing bus headway from 15 min to 8 min on Route 12A reduces average citizen wait time from 15 min to 6 min, reclaiming 9 minutes of human life per trip and cutting friction by 32%. Test this interactively in the 'What-If Simulator'.";
    } else if (lower.includes('how can this area be improved') || lower.includes('improved') || lower.includes('intervention')) {
      reply = "💡 Targeted AI Interventions for this corridor: 1) Schedule Synchronization between Bus 12A and Suburban Rail (-15m wait); 2) Raised Signalized Pedestrian Table at Zone 17 (-80% near-miss conflicts); 3) Sheltered Vagaikulam Feeder Concourse. Estimated city implementation cost: ₹8.5 Lakhs with 43% ROI in human time saved.";
    } else if (lower.includes('thoothukudi airport') || lower.includes('francis xavier') || lower.includes('tirunelveli') || lower.includes('tcr') || lower.includes('fxec')) {
      reply = "The 38.2 km journey from Thoothukudi Airport (TCR), Vagaikulam to Francis Xavier Engineering College, Vannarpettai, Tirunelveli incurs high friction (Score 76/100). The primary bottleneck is the 16-minute unscheduled roadside wait at Vagaikulam NH 138 junction after walking 400m from the terminal, combined with crossing the busy 4-lane Vannarpettai bypass road to enter the FXEC campus. A dedicated electric airport feeder shuttle cuts travel time by 22 minutes and drops friction to 38.";
    } else if (lower.includes('vannarpettai') || lower.includes('zone tn-01')) {
      reply = "Vannarpettai Bypass Road outside Francis Xavier Engineering College has a friction score of 76/100. High pedestrian crossing risk across the 4-lane highway and lack of sheltered bus bays create significant delay and safety burdens for students and faculty.";
    } else if (lower.includes('tirunelveli junction') || lower.includes('zone tn-02')) {
      reply = "Tirunelveli Railway Junction has severe friction (83/100). Commuters changing between broad-gauge trains and town buses face long staircase overbridge climbs and crowded platform queuing, affecting 6,800 daily travelers.";
    } else if (lower.includes('accessibility') || lower.includes('wheelchair')) {
      reply = "On this corridor, a wheelchair passenger incurs severe friction (82/100 vs 34 for standard commuters) due to high-floor TNSTC buses and absent ramped highway crossings. Our Accessible Route option routes exclusively through step-free elevators and kneeling EV buses.";
    }

    setChatMessages(prev => [
      ...prev,
      userMsg,
      { role: 'assistant', text: reply, time: 'Just now' }
    ]);
  };

  const userEmail = currentUser.email;

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      setIsAuthenticated,
      role,
      setRole,
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      userEmail,
      logout,
      showAllTools,
      setShowAllTools,
      currentLocation,
      setCurrentLocation,
      selectCityLocation,
      isLocationModalOpen,
      setIsLocationModalOpen,
      currentJourney,
      setCurrentJourney,
      selectedSegmentId,
      setSelectedSegmentId,
      loadDemoJourney,
      resetJourney,
      saveCurrentJourneyToAtlas,
      selectedIntervention,
      setSelectedIntervention,
      afterJourney,
      zones,
      selectedZone,
      setSelectedZone,
      selectZoneById,
      whatIfParams,
      setWhatIfParams,
      whatIfResult,
      runWhatIfCalculation,
      isDemoMode,
      setIsDemoMode,
      isHackathonDemoRunning,
      hackathonStep,
      startHackathonDemo,
      stopHackathonDemo,
      nextHackathonStep,
      prevHackathonStep,
      isPresentationMode,
      setIsPresentationMode,
      notifications,
      unreadCount,
      markNotificationRead,
      isNotificationOpen,
      setIsNotificationOpen,
      isAIAssistantOpen,
      setIsAIAssistantOpen,
      chatMessages,
      sendAIMessage,
      // Crowdsourced Reports
      reports,
      isReportModalOpen,
      setIsReportModalOpen,
      reportPreFill,
      setReportPreFill,
      addReport,
      upvoteReportAction,
      // Heat Stress & Time of Day
      departureHour,
      setDepartureHour,
      isShadedRouteActive,
      setIsShadedRouteActive,
      heatMultiplier,
      ambientTempCelsius,
      heatStressLevel,
      backendStatus,
      databaseName
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
