import { 
  Journey, 
  Zone, 
  InterventionOption, 
  AccessibilityProfile, 
  RouteOption, 
  NotificationItem,
  RiskZone,
  ConflictEvent,
  SafeJourneyComparisonOption,
  LiveJourneyStage
} from '../types';

export const TCR_TO_FXEC_JOURNEY: Journey = {
  id: 'J-TCR-FXEC-2026',
  title: 'Thoothukudi Airport ➔ Francis Xavier Engineering College, Tirunelveli',
  userType: 'student',
  origin: 'Thoothukudi Airport (TCR), Vagaikulam',
  destination: 'Francis Xavier Engineering College, Vannarpettai, Tirunelveli',
  departureTime: '08:15 AM',
  arrivalTime: '09:33 AM',
  totalDurationMinutes: 78,
  travelDurationMinutes: 38,
  waitingDurationMinutes: 19,
  walkingDurationMinutes: 15,
  transferCount: 2,
  estimatedCostInr: 45,
  frictionScore: 76,
  frictionLevel: 'HIGH',
  simulation: true,
  frictionBreakdown: {
    waitingBurden: 29,
    transferBurden: 18,
    walkingBurden: 11,
    timeBurden: 14,
    costBurden: 6,
    accessibilityBurden: 14,
    reliabilityBurden: 8
  },
  primaryBottleneck: {
    segmentId: 'seg-vagaikulam-wait',
    title: 'Vagaikulam Airport Highway Feeder Delay',
    location: 'Vagaikulam NH 138 Highway Stop (Thoothukudi Dist)',
    affectedSegment: 'Airport Terminal Exit ➔ TNSTC Tirunelveli Express Bus',
    currentWaitMinutes: 16,
    expectedWaitMinutes: 5,
    excessWaitMinutes: 11,
    confidence: 'Empirical Regional Transit Model (96% confidence)',
    insight: 'Passengers arriving at Thoothukudi Airport must walk 400m to the highway and endure an unscheduled 16-minute wait for passing Tirunelveli-bound express buses. In addition, crossing the Vannarpettai 4-lane bypass to enter FX Engineering College introduces high pedestrian friction.',
    recommendation: 'Deploy a scheduled direct electric airport shuttle connecting Thoothukudi Airport terminal directly to Vannarpettai / FXEC campus and Tirunelveli Junction.'
  },
  segments: [
    {
      id: 'seg-tcr-walk',
      name: 'Airport Terminal Concourse Walk',
      mode: 'walking',
      durationMinutes: 6,
      expectedMinutes: 5,
      excessMinutes: 1,
      distanceKm: 0.4,
      frictionContribution: 'low',
      description: 'Walk from Arrivals Baggage Belt to Airport Outer Gate',
      startTime: '08:15 AM',
      endTime: '08:21 AM',
      location: 'Thoothukudi Airport Terminal',
      stepFree: true
    },
    {
      id: 'seg-vagaikulam-wait',
      name: 'NH 138 Highway Bus Connection Wait',
      mode: 'waiting',
      durationMinutes: 16,
      expectedMinutes: 5,
      excessMinutes: 11,
      frictionContribution: 'high',
      description: 'Unscheduled roadside wait for passing Tirunelveli-bound TNSTC bus',
      startTime: '08:21 AM',
      endTime: '08:37 AM',
      location: 'Vagaikulam Highway Stop (NH 138)',
      stepFree: false
    },
    {
      id: 'seg-nh138-bus',
      name: 'TNSTC Express Highway Transit via Vallanadu',
      mode: 'bus',
      durationMinutes: 35,
      expectedMinutes: 32,
      excessMinutes: 3,
      distanceKm: 34.5,
      costInr: 35,
      frictionContribution: 'low',
      description: '4-lane NH 138 highway transit passing Vallanadu and Thamirabarani bridge',
      startTime: '08:37 AM',
      endTime: '09:12 AM',
      location: 'NH 138 Corridor (Thoothukudi ➔ Tirunelveli)',
      stepFree: true
    },
    {
      id: 'seg-vannarpettai-transfer',
      name: 'Vannarpettai Bypass Road Transfer & Road Crossing',
      mode: 'transfer',
      durationMinutes: 12,
      expectedMinutes: 6,
      excessMinutes: 6,
      distanceKm: 0.5,
      costInr: 0,
      frictionContribution: 'moderate',
      description: 'Disembarking at Vannarpettai flyover bus stop and navigating heavy bypass traffic',
      startTime: '09:12 AM',
      endTime: '09:24 AM',
      location: 'Vannarpettai Flyover Junction',
      stepFree: false
    },
    {
      id: 'seg-fxec-walk',
      name: 'Last-Mile Walk to Francis Xavier Engg College',
      mode: 'walking',
      durationMinutes: 9,
      expectedMinutes: 8,
      excessMinutes: 1,
      distanceKm: 0.75,
      costInr: 10,
      frictionContribution: 'low',
      description: 'Pedestrian walkway along 103/G2 Bypass Road into FXEC Main Campus',
      startTime: '09:24 AM',
      endTime: '09:33 AM',
      location: 'Bypass Road, Vannarpettai, Tirunelveli',
      stepFree: true
    }
  ]
};

export const DEMO_JOURNEY: Journey = TCR_TO_FXEC_JOURNEY;

export const INTERVENTION_OPTIONS: InterventionOption[] = [
  {
    id: 'int-tcr-shuttle',
    title: 'Direct TCR Airport ➔ Tirunelveli Electric Feeder Shuttle',
    type: 'feeder',
    description: 'Deploy dedicated 30-minute scheduled electric shuttles connecting Thoothukudi Airport arrivals directly to Vannarpettai / FXEC and Tirunelveli Junction.',
    estimatedComplexity: 'Low',
    estimatedCost: 'Low',
    simulatedFrictionReductionPct: 45,
    simulatedTimeReductionMin: 22,
    affectedPopulationDaily: 2800,
    implementationCategory: 'Airport Multi-Modal Connection Service',
    afterFrictionScore: 38,
    afterDurationMinutes: 56,
    afterWaitingMinutes: 4,
    afterTransfers: 1,
    isRecommended: true,
    aiRecommendationSummary: 'Eliminates the 16-minute Vagaikulam roadside wait and bypass transfer risk, providing direct campus-to-terminal travel.'
  },
  {
    id: 'int-sync',
    title: 'Flight-Arrival Schedule Synchronization',
    type: 'sync',
    description: 'Synchronize TNSTC Tirunelveli-Thoothukudi express bus departures with IndiGo & SpiceJet arrival banks at TCR Airport.',
    estimatedComplexity: 'Low',
    estimatedCost: 'Low',
    simulatedFrictionReductionPct: 38,
    simulatedTimeReductionMin: 14,
    affectedPopulationDaily: 2100,
    implementationCategory: 'Timetable Harmonization & Signaling',
    afterFrictionScore: 44,
    afterDurationMinutes: 62,
    afterWaitingMinutes: 5,
    afterTransfers: 2,
    isRecommended: false,
    aiRecommendationSummary: 'Ensures an express bus is idling at the Vagaikulam gate within 5 minutes of passenger deplaning.'
  },
  {
    id: 'int-vannarpettai-skywalk',
    title: 'Vannarpettai Bypass Pedestrian Signal & Skywalk',
    type: 'pedestrian',
    description: 'Install traffic-calmed pelican crossing and covered overpass on Vannarpettai Bypass Road outside Francis Xavier Engineering College.',
    estimatedComplexity: 'Medium',
    estimatedCost: 'Medium',
    simulatedFrictionReductionPct: 26,
    simulatedTimeReductionMin: 8,
    affectedPopulationDaily: 4200,
    implementationCategory: 'Urban Pedestrian Safety Infrastructure',
    afterFrictionScore: 54,
    afterDurationMinutes: 68,
    afterWaitingMinutes: 12,
    afterTransfers: 2,
    isRecommended: false,
    aiRecommendationSummary: 'Protects student commuters crossing the busy 4-lane Tirunelveli bypass highway.'
  }
];

export const MOCK_ZONES: Zone[] = [
  {
    id: 'zone-tn-fxec',
    code: 'ZONE TN-01',
    name: 'Francis Xavier Engineering College & Vannarpettai Bypass',
    frictionScore: 76,
    level: 'high',
    lat: 8.7300,
    lng: 77.7126,
    radiusMeters: 1100,
    affectedDaily: 3400,
    avgJourneyMinutes: 48,
    avgWaitMinutes: 14,
    avgTransfers: 2,
    walkingBurdenKm: 1.6,
    mainIssue: 'Bypass 4-lane highway pedestrian crossing barrier & bus stop drop-off gap',
    peakPeriod: '08:15 – 09:30 AM',
    secondaryIssue: 'Lack of signalized pedestrian crosswalk from Vannarpettai flyover to FXEC gate',
    interventionsAvailable: 4
  },
  {
    id: 'zone-tn-junction',
    code: 'ZONE TN-02',
    name: 'Tirunelveli Railway Junction & Old Bus Stand Interchange',
    frictionScore: 83,
    level: 'severe',
    lat: 8.7302,
    lng: 77.7025,
    radiusMeters: 1400,
    affectedDaily: 6800,
    avgJourneyMinutes: 62,
    avgWaitMinutes: 19,
    avgTransfers: 3,
    walkingBurdenKm: 2.2,
    mainIssue: 'Multi-Modal Transfer Delay between Broad Gauge Rail & TNSTC City Buses',
    peakPeriod: '08:00 – 10:00 AM',
    secondaryIssue: 'Narrow staircase footbridges connecting rail platforms with bus bays',
    interventionsAvailable: 5
  },
  {
    id: 'zone-th-airport',
    code: 'ZONE TH-01',
    name: 'Thoothukudi Airport (Vagaikulam) Transit Gateway',
    frictionScore: 74,
    level: 'high',
    lat: 8.7242,
    lng: 78.0264,
    radiusMeters: 1800,
    affectedDaily: 1850,
    avgJourneyMinutes: 55,
    avgWaitMinutes: 16,
    avgTransfers: 2,
    walkingBurdenKm: 1.8,
    mainIssue: 'Airport Terminal to NH 138 Vagaikulam highway bus feeder gap',
    peakPeriod: '08:00 – 09:30 AM / 03:00 – 04:30 PM',
    secondaryIssue: 'No scheduled electric shuttle connecting TCR airport arrivals to Tirunelveli express buses',
    interventionsAvailable: 4
  },
  {
    id: 'zone-tn-palayamkottai',
    code: 'ZONE TN-03',
    name: 'Palayamkottai Central Bus Stand & Market Concourse',
    frictionScore: 64,
    level: 'moderate',
    lat: 8.7186,
    lng: 77.7342,
    radiusMeters: 1200,
    affectedDaily: 4100,
    avgJourneyMinutes: 45,
    avgWaitMinutes: 12,
    avgTransfers: 2,
    walkingBurdenKm: 1.4,
    mainIssue: 'Arterial road congestion and crowded bus platform queuing',
    peakPeriod: '08:30 – 10:00 AM',
    secondaryIssue: 'Narrow sidewalks obstructed by commercial vending stalls',
    interventionsAvailable: 3
  },
  {
    id: 'zone-th-vallanadu',
    code: 'ZONE TH-02',
    name: 'Vallanadu Highway Junction (NH 138 Mid-Point)',
    frictionScore: 58,
    level: 'moderate',
    lat: 8.7305,
    lng: 77.8924,
    radiusMeters: 1600,
    affectedDaily: 1900,
    avgJourneyMinutes: 44,
    avgWaitMinutes: 13,
    avgTransfers: 1,
    walkingBurdenKm: 1.2,
    mainIssue: 'Rural feeder connection gaps and unshaded waiting stands',
    peakPeriod: '07:30 – 09:00 AM',
    secondaryIssue: 'High-speed highway traffic hazard for pedestrians boarding buses',
    interventionsAvailable: 3
  },
  {
    id: 'zone-th-harbour',
    code: 'ZONE TH-03',
    name: 'Thoothukudi Old Bus Stand & V.O.C. Port Road',
    frictionScore: 72,
    level: 'high',
    lat: 8.7984,
    lng: 78.1482,
    radiusMeters: 1500,
    affectedDaily: 5100,
    avgJourneyMinutes: 52,
    avgWaitMinutes: 15,
    avgTransfers: 2,
    walkingBurdenKm: 2.0,
    mainIssue: 'Port heavy trailer logistics traffic conflicting with passenger transit',
    peakPeriod: '08:00 – 10:00 AM',
    secondaryIssue: 'Irregular town bus frequency to coastal educational and commercial hubs',
    interventionsAvailable: 4
  }
];

export const ACCESSIBILITY_PROFILES: AccessibilityProfile[] = [
  {
    id: 'prof-std',
    name: 'Standard Commuter',
    persona: 'Able-bodied engineering student',
    iconName: 'User',
    journeyMinutes: 78,
    accessibilityFriction: 34,
    walkingBurdenKm: 1.15,
    transferBurden: 18,
    bottleneckReason: 'Vannarpettai bypass road crossing without pedestrian signal',
    alternativeRouteName: 'Direct campus bus stop at Vannarpettai South Gate',
    alternativeMinutes: 72,
    alternativeFriction: 28,
    details: 'Easily navigates bus boarding, roadside waits, and 9-minute bypass walk.'
  },
  {
    id: 'prof-wheelchair',
    name: 'Wheelchair Commuter',
    persona: 'Motorized wheelchair passenger',
    iconName: 'Accessibility',
    journeyMinutes: 104,
    accessibilityFriction: 82,
    walkingBurdenKm: 2.4,
    transferBurden: 52,
    bottleneckReason: 'Vagaikulam highway bus stop has no raised curb or low-floor bus ramp. Vannarpettai highway bypass has high curbs and no ramped pedestrian overpass.',
    alternativeRouteName: 'Direct low-floor accessible taxi van via NH 138',
    alternativeMinutes: 52,
    alternativeFriction: 42,
    details: 'Severe accessibility friction caused by high-floor TNSTC buses and unramped 4-lane highway medians.'
  }
];

export const SAFE_ROUTE_OPTIONS: RouteOption[] = [
  {
    id: 'route-tcr-fxec-balanced',
    name: 'Route 1: NH 138 Express + Vannarpettai Walk',
    tag: 'AI RECOMMENDED',
    durationMinutes: 78,
    frictionScore: 48,
    walkingKm: 1.15,
    costInr: 45,
    transfers: 1,
    accessibilityRating: 'B+ (Paved sidewalks)',
    summary: 'Direct TNSTC highway express via Vallanadu to Vannarpettai, followed by a shaded 9-min walk to Francis Xavier Engineering College.',
    isRecommended: true
  },
  {
    id: 'route-tcr-fxec-fastest',
    name: 'Route 2: Airport Taxi / Auto via NH 138 Direct',
    tag: 'FASTEST (DIRECT VEHICLE)',
    durationMinutes: 44,
    frictionScore: 24,
    walkingKm: 0.1,
    costInr: 650,
    transfers: 0,
    accessibilityRating: 'A+ (Door-to-door)',
    summary: 'Door-to-door direct vehicle transit along 38 km NH 138 with zero transfer waiting or road crossing friction.'
  },
  {
    id: 'route-tcr-fxec-junction',
    name: 'Route 3: Via Tirunelveli Railway Junction Hub',
    tag: 'MULTI-MODAL HUB',
    durationMinutes: 92,
    frictionScore: 78,
    walkingKm: 1.8,
    costInr: 40,
    transfers: 2,
    accessibilityRating: 'C (Crowded platform)',
    summary: 'Bus into Tirunelveli Junction central bus stand followed by local town bus to Vannarpettai. Incurs significant interchange delay.'
  }
];

export const NOTIFICATIONS_DATA: NotificationItem[] = [
  {
    id: 'notif-tcr-1',
    type: 'alert',
    title: 'High Friction Alert — Tirunelveli Junction',
    message: 'Tirunelveli Junction Interchange exceeded threshold (Score 83). Peak rail-to-bus transfer waiting.',
    timestamp: '5m ago',
    read: false,
    zoneId: 'zone-tn-junction'
  },
  {
    id: 'notif-tcr-2',
    type: 'insight',
    title: 'AI Corridor Recommendation',
    message: 'Direct TCR Airport-to-FXEC Electric Feeder Shuttle reduces travel friction by 45% on NH 138.',
    timestamp: '20m ago',
    read: false
  },
  {
    id: 'notif-tcr-3',
    type: 'journey',
    title: 'Tirunelveli-Thoothukudi Corridor Loaded',
    message: 'Active route: Thoothukudi Airport (TCR) to Francis Xavier Engineering College, Vannarpettai.',
    timestamp: '45m ago',
    read: true
  }
];

export const CITY_KPI_DATA = {
  peopleAnalyzed: 14820,
  journeysAnalyzed: 36410,
  averageJourneyMin: 48,
  averageFriction: 61,
  highFrictionZones: 6,
  interventionsSimulated: 980,
  systemStatus: 'Live MongoDB Atlas Connected',
  dataNote: 'Tirunelveli & Thoothukudi District Transit Network'
};

export const TOP_PROBLEMS = [
  { id: 1, title: 'Highway Feeder Waiting', percentage: 36, description: 'Lack of scheduled feeder bus at Vagaikulam airport gate', zone: 'ZONE TH-01' },
  { id: 2, title: 'Multi-Modal Rail Transfer Delay', percentage: 26, description: 'Staircase overbridge congestion at Tirunelveli Junction', zone: 'ZONE TN-02' },
  { id: 3, title: 'Bypass Road Crossing Hazard', percentage: 18, description: '4-lane Vannarpettai highway barrier outside FXEC campus', zone: 'ZONE TN-01' },
  { id: 4, title: 'Last-Mile Rural Gaps', percentage: 12, description: 'Unconnected villages along Vallanadu Thamirabarani belt', zone: 'ZONE TH-02' },
  { id: 5, title: 'Port Freight Congestion', percentage: 8, description: 'Heavy trailer logistics conflicts at Thoothukudi Old Bus Stand', zone: 'ZONE TH-03' }
];

export const HOURLY_FRICTION_DATA = [
  { hour: '06:00', friction: 34, waitingMin: 5, journeys: 950 },
  { hour: '07:00', friction: 52, waitingMin: 10, journeys: 2400 },
  { hour: '08:00', friction: 76, waitingMin: 18, journeys: 5600 },
  { hour: '09:00', friction: 79, waitingMin: 20, journeys: 5900 },
  { hour: '10:00', friction: 62, waitingMin: 13, journeys: 3900 },
  { hour: '11:00', friction: 48, waitingMin: 8, journeys: 2200 },
  { hour: '12:00', friction: 44, waitingMin: 7, journeys: 2100 },
  { hour: '13:00', friction: 45, waitingMin: 8, journeys: 2300 },
  { hour: '14:00', friction: 51, waitingMin: 9, journeys: 2500 },
  { hour: '15:00', friction: 58, waitingMin: 11, journeys: 3100 },
  { hour: '16:00', friction: 66, waitingMin: 14, journeys: 4200 },
  { hour: '17:00', friction: 75, waitingMin: 17, journeys: 5400 },
  { hour: '18:00', friction: 78, waitingMin: 19, journeys: 5800 },
  { hour: '19:00', friction: 69, waitingMin: 15, journeys: 4600 },
  { hour: '20:00', friction: 52, waitingMin: 10, journeys: 3100 },
  { hour: '21:00', friction: 38, waitingMin: 6, journeys: 1800 }
];

export const ZONE_COMPARISON_DATA = [
  { zone: 'Tirunelveli Jnc', friction: 83, waiting: 19, walkingKm: 2.2, affected: 6800 },
  { zone: 'FXEC / Vannarpettai', friction: 76, waiting: 14, walkingKm: 1.6, affected: 3400 },
  { zone: 'Thoothukudi Airport', friction: 74, waiting: 16, walkingKm: 1.8, affected: 1850 },
  { zone: 'Thoothukudi Port', friction: 72, waiting: 15, walkingKm: 2.0, affected: 5100 },
  { zone: 'Palayamkottai Stand', friction: 64, waiting: 12, walkingKm: 1.4, affected: 4100 },
  { zone: 'Vallanadu Highway', friction: 58, waiting: 13, walkingKm: 1.2, affected: 1900 }
];

export const PERSONAL_HISTORY_DATA = [
  { day: 'Mon', date: 'Sep 27', route: 'TCR Airport ➔ FXEC Tirunelveli', durationMin: 76, friction: 74, waitingMin: 18 },
  { day: 'Tue', date: 'Sep 28', route: 'TCR Airport ➔ FXEC Tirunelveli', durationMin: 72, friction: 68, waitingMin: 14 },
  { day: 'Wed', date: 'Sep 29', route: 'TCR Airport ➔ FXEC Tirunelveli', durationMin: 65, friction: 58, waitingMin: 10 },
  { day: 'Thu', date: 'Sep 30', route: 'TCR Airport ➔ FXEC Tirunelveli', durationMin: 81, friction: 79, waitingMin: 21 },
  { day: 'Today', date: 'Oct 01', route: 'TCR Airport ➔ FXEC Tirunelveli (Live)', durationMin: 78, friction: 76, waitingMin: 19 }
];

// Canonical 61-Minute Multimodal Journey (Prompt Section 3 & 11)
export const CANONICAL_61MIN_JOURNEY: Journey = {
  id: 'J-CANONICAL-61MIN',
  title: 'Home ➔ Bus Stop ➔ Bus 12A ➔ Train ➔ College',
  userType: 'student',
  origin: 'Greenwood Heights (Home)',
  destination: 'City Technology Institute / FXEC',
  departureTime: '08:00 AM',
  arrivalTime: '09:01 AM',
  totalDurationMinutes: 61,
  travelDurationMinutes: 34,
  waitingDurationMinutes: 15,
  walkingDurationMinutes: 12,
  transferCount: 2,
  estimatedCostInr: 35,
  frictionScore: 72,
  frictionLevel: 'HIGH',
  simulation: true,
  frictionBreakdown: {
    waitingBurden: 18,
    walkingBurden: 14,
    transferBurden: 12,
    timeBurden: 10,
    costBurden: 5,
    accessibilityBurden: 5,
    reliabilityBurden: 8
  },
  primaryBottleneck: {
    segmentId: 'seg-bus-train-transfer',
    title: 'Bus to Train Transfer Mismatch',
    location: 'Sector 17 Central Interchange',
    affectedSegment: 'Bus 12A Alighting ➔ Platform 2 Suburban Train',
    currentWaitMinutes: 15,
    expectedWaitMinutes: 4,
    excessWaitMinutes: 11,
    confidence: 'Prototype analysis (94% confidence)',
    insight: 'Primary bottleneck is the Bus ➔ Train transfer wait at Sector 17. The 7-minute walking transfer combined with unsynchronized timetables causes 39% of journey delay.',
    recommendation: 'Synchronize Bus 12A arrival with Suburban Rail departure to reclaim 11 minutes.'
  },
  segments: [
    {
      id: 'seg-1-home-walk',
      name: 'Walk from Home to Bus Stop',
      mode: 'walking',
      durationMinutes: 7,
      expectedMinutes: 6,
      excessMinutes: 1,
      distanceKm: 0.55,
      costInr: 0,
      frictionContribution: 'low',
      description: 'Pedestrian walk through residential lane to roadside bus stop',
      startTime: '08:00 AM',
      endTime: '08:07 AM',
      location: 'Greenwood Residential Post',
      stepFree: true
    },
    {
      id: 'seg-2-bus-wait',
      name: 'Bus Stop Waiting',
      mode: 'waiting',
      durationMinutes: 5,
      expectedMinutes: 3,
      excessMinutes: 2,
      costInr: 0,
      frictionContribution: 'moderate',
      description: 'Waiting at curb for incoming Route 12A bus',
      startTime: '08:07 AM',
      endTime: '08:12 AM',
      location: 'Greenwood South Bus Stop',
      stepFree: true
    },
    {
      id: 'seg-3-bus-ride',
      name: 'Bus 12A to Central Hub',
      mode: 'bus',
      durationMinutes: 18,
      expectedMinutes: 16,
      excessMinutes: 2,
      distanceKm: 8.2,
      costInr: 15,
      frictionContribution: 'low',
      description: 'Urban feeder transit along arterial avenue to central interchange',
      startTime: '08:12 AM',
      endTime: '08:30 AM',
      location: 'Corridor Route 12A',
      stepFree: true
    },
    {
      id: 'seg-4-transfer-walk',
      name: 'Intermodal Transfer Walk & Crossing',
      mode: 'transfer',
      durationMinutes: 5,
      expectedMinutes: 4,
      excessMinutes: 1,
      distanceKm: 0.35,
      costInr: 0,
      frictionContribution: 'high',
      description: 'Walking connection crossing uncontrolled roadway to train station platform',
      startTime: '08:30 AM',
      endTime: '08:35 AM',
      location: 'Sector 17 Central Interchange (Elevated Risk Area)',
      stepFree: false
    },
    {
      id: 'seg-5-train-wait',
      name: 'Platform Train Headway Wait',
      mode: 'waiting',
      durationMinutes: 10,
      expectedMinutes: 3,
      excessMinutes: 7,
      costInr: 0,
      frictionContribution: 'high',
      description: 'Dead waiting on platform for next scheduled suburban train departure',
      startTime: '08:35 AM',
      endTime: '08:45 AM',
      location: 'Central Rail Platform 2',
      stepFree: true
    },
    {
      id: 'seg-6-train-ride',
      name: 'Suburban Rail to Campus Station',
      mode: 'train',
      durationMinutes: 11,
      expectedMinutes: 10,
      excessMinutes: 1,
      distanceKm: 9.4,
      costInr: 20,
      frictionContribution: 'low',
      description: 'High-capacity electric commuter rail to station concourse',
      startTime: '08:45 AM',
      endTime: '08:56 AM',
      location: 'Suburban Rail Line 1',
      stepFree: true
    },
    {
      id: 'seg-7-dest-walk',
      name: 'Campus Approach Walk',
      mode: 'walking',
      durationMinutes: 5,
      expectedMinutes: 5,
      excessMinutes: 0,
      distanceKm: 0.4,
      costInr: 0,
      frictionContribution: 'low',
      description: 'Last-mile pedestrian sidewalk to College Entrance Gate',
      startTime: '08:56 AM',
      endTime: '09:01 AM',
      location: 'College Campus Gate',
      stepFree: true
    }
  ]
};

// Canonical Live Journey Tracking Stages (Prompt Section 4)
export const CANONICAL_LIVE_STAGES: LiveJourneyStage[] = [
  {
    id: 'stage-home',
    title: 'HOME',
    stageName: 'Origin Departure',
    mode: 'home',
    status: 'completed',
    detail: 'Left origin on schedule',
    location: 'Greenwood Heights (Home)'
  },
  {
    id: 'stage-walk-stop',
    title: 'WALK TO BUS STOP',
    stageName: 'Walking Segment (350m)',
    mode: 'walk',
    status: 'completed',
    detail: 'Arrived at stop in 6 mins',
    location: 'Greenwood South Stop'
  },
  {
    id: 'stage-bus-stop',
    title: 'BUS STOP',
    stageName: 'Waiting at Stop',
    mode: 'bus_stop',
    status: 'active',
    etaMinutes: 5,
    detail: 'Route 12A is 1.4 km away (Approaching)',
    location: 'Bus Stop Bay 1'
  },
  {
    id: 'stage-bus',
    title: 'BUS 12A',
    stageName: 'Transit Leg',
    mode: 'bus',
    status: 'upcoming',
    etaMinutes: 5,
    detail: 'ETA 5 min — Vehicle 12A-104 on time',
    location: 'RS Puram ➔ Sector 17'
  },
  {
    id: 'stage-train',
    title: 'TRAIN',
    stageName: 'Suburban Rail Transfer',
    mode: 'train',
    status: 'upcoming',
    departureTime: '08:32 AM',
    detail: 'Platform 2 • Transfer buffer: 5 min',
    location: 'Sector 17 Station'
  },
  {
    id: 'stage-dest',
    title: 'COLLEGE',
    stageName: 'Campus Arrival',
    mode: 'destination',
    status: 'upcoming',
    departureTime: '08:54 AM',
    detail: 'Expected arrival 08:54 AM (On Time)',
    location: 'City Technology Institute'
  }
];

// Safer Journey Comparison (Prompt Section 17)
export const SAFER_JOURNEY_OPTIONS: SafeJourneyComparisonOption[] = [
  {
    id: 'ROUTE-A',
    title: 'Route A — Express Highway Corridor',
    badge: 'FASTEST',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    durationMinutes: 32,
    walkingMinutes: 8,
    walkingKm: 0.6,
    frictionScore: 58,
    riskExposure: 'Elevated',
    transfers: 1,
    costInr: 35,
    stepFree: false,
    description: 'Direct express bus with short clock time, but crosses the Zone 17 arterial roadway without a signalized pedestrian phase.',
    highlights: ['Shortest travel time (32 min)', 'Only 1 transfer', '⚠️ Traverses elevated vehicle-pedestrian conflict zone']
  },
  {
    id: 'ROUTE-B',
    title: 'Route B — Sheltered Footway & Rail Concourse',
    badge: 'LOWER RISK EXPOSURE',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    durationMinutes: 36,
    walkingMinutes: 11,
    walkingKm: 0.85,
    frictionScore: 44,
    riskExposure: 'Low',
    transfers: 1,
    costInr: 35,
    stepFree: true,
    isRecommended: true,
    description: 'Adds 4 minutes of walking time via the grade-separated station overpass and signalized crosswalk, reducing road-user conflict risk by 78%.',
    highlights: ['Lower mobility friction (44 vs 58)', 'Protected pedestrian overbridge', 'Zero arterial highway crossings', 'Full step-free accessibility']
  },
  {
    id: 'ROUTE-C',
    title: 'Route C — Direct Campus EV Feeder',
    badge: 'LOWEST WALKING',
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    durationMinutes: 38,
    walkingMinutes: 4,
    walkingKm: 0.25,
    frictionScore: 49,
    riskExposure: 'Moderate',
    transfers: 0,
    costInr: 45,
    stepFree: true,
    description: 'Door-to-door low-floor shuttle eliminating walking strain and intermodal transfers entirely.',
    highlights: ['Only 4 mins walking', 'Direct boarding with no transfer', 'Slightly higher ticket fare']
  },
  {
    id: 'ROUTE-D',
    title: 'Route D — Regular City Local Bus',
    badge: 'LOWEST COST',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    durationMinutes: 46,
    walkingMinutes: 14,
    walkingKm: 1.1,
    frictionScore: 64,
    riskExposure: 'Moderate',
    transfers: 2,
    costInr: 15,
    stepFree: false,
    description: 'Budget-friendly ordinary bus service with multiple intermediate stops and longer walking legs.',
    highlights: ['Subsidized fare (₹15)', 'Higher waiting and walking time', 'Frequent stops']
  },
  {
    id: 'ROUTE-E',
    title: 'Route E — 100% Step-Free Concourse Route',
    badge: 'ACCESSIBLE',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    durationMinutes: 40,
    walkingMinutes: 10,
    walkingKm: 0.7,
    frictionScore: 41,
    riskExposure: 'Low',
    transfers: 1,
    costInr: 35,
    stepFree: true,
    description: 'Certified ramp and elevator pathway audited for wheelchair users, strollers, and travelers with luggage.',
    highlights: ['100% step-free and elevator accessible', 'Tactile paving along walkway', 'Wide sidewalk clearance']
  }
];

// Mock Road Risk Zones (Section 15)
export const MOCK_RISK_ZONES: RiskZone[] = [
  {
    id: 'ZONE-RISK-17',
    code: 'ZONE 17',
    name: 'Sector 17 Central Interchange & Concourse',
    risk_level: 'Elevated',
    risk_score: 84,
    lat: 8.7289,
    lng: 77.7180,
    radius_meters: 450,
    observed_conflicts: 23,
    pedestrian_exposure: 'Severe',
    bus_stop_nearby: true,
    bus_stop_name: 'Railway Station Bus Loop Bay 3',
    crossing_type: 'Unprotected 4-Lane Arterial Crossing',
    peak_period: '08:00–09:00 AM',
    primary_factor: 'Pedestrian-vehicle interaction during bus-to-train transfers',
    secondary_factor: 'High-speed auto rickshaw turning conflicts',
    recommended_interventions: [
      'Install raised grade-separated zebra crossing with pedestrian signal',
      'Relocate bus alighting bay 120m closer to rail concourse entrance',
      'Introduce 30 km/h traffic calming speed table'
    ],
    disclaimer: 'Demo / Simulated Data — analytical road safety risk indicators'
  },
  {
    id: 'ZONE-RISK-07',
    code: 'ZONE 07',
    name: 'Vannarpettai Bypass Road & College Gate',
    risk_level: 'High',
    risk_score: 76,
    lat: 8.7300,
    lng: 77.7126,
    radius_meters: 380,
    observed_conflicts: 19,
    pedestrian_exposure: 'High',
    bus_stop_nearby: true,
    bus_stop_name: 'Vannarpettai Bypass Stop',
    crossing_type: 'Divided Highway Mid-Block Crossing',
    peak_period: '08:15–09:15 AM',
    primary_factor: 'Students crossing highway against 65 km/h intercity traffic',
    secondary_factor: 'Absence of signalized pedestrian crossing or skywalk',
    recommended_interventions: [
      'Construct covered foot-overbridge (FOB) with ramp access',
      'Install pedestrian actuated pelican traffic signals',
      'Erect continuous median anti-jaywalking pedestrian guard rails'
    ],
    disclaimer: 'Demo / Simulated Data — analytical road safety risk indicators'
  },
  {
    id: 'ZONE-RISK-04',
    code: 'ZONE 04',
    name: 'NH 138 Vagaikulam Airport Junction',
    risk_level: 'Moderate',
    risk_score: 58,
    lat: 8.7258,
    lng: 77.9850,
    radius_meters: 500,
    observed_conflicts: 11,
    pedestrian_exposure: 'Moderate',
    bus_stop_nearby: true,
    bus_stop_name: 'Vagaikulam Feeder Stop',
    crossing_type: 'Rural Highway Shoulder',
    peak_period: '11:30 AM–01:00 PM',
    primary_factor: 'Unsheltered roadside waiting with heavy freight vehicle proximity',
    secondary_factor: 'High-speed truck slipstream exposure',
    recommended_interventions: [
      'Install curbed setback passenger waiting shelter',
      'Add high-visibility solar blinker warning lights',
      'Designate segregated passenger boarding slip lane'
    ],
    disclaimer: 'Demo / Simulated Data — analytical road safety risk indicators'
  },
  {
    id: 'ZONE-RISK-01',
    code: 'ZONE 01',
    name: 'Palayamkottai South Terminal Approach',
    risk_level: 'Low',
    risk_score: 28,
    lat: 8.7185,
    lng: 77.7420,
    radius_meters: 300,
    observed_conflicts: 4,
    pedestrian_exposure: 'Low',
    bus_stop_nearby: true,
    bus_stop_name: 'Palayamkottai Depo Gate',
    crossing_type: 'Signalized Crosswalk with Refuge Island',
    peak_period: '05:30–06:30 PM',
    primary_factor: 'Minor turning motorcycle friction',
    secondary_factor: 'Adequate physical pedestrian refuge',
    recommended_interventions: [
      'Refresh tactile blister paving at curb ramps',
      'Optimize cycle time of pedestrian green phase'
    ],
    disclaimer: 'Demo / Simulated Data — analytical road safety risk indicators'
  }
];

// Mock Conflict Events
export const MOCK_CONFLICT_EVENTS: ConflictEvent[] = [
  {
    id: 'CONF-101',
    zone_id: 'ZONE-RISK-17',
    timestamp: '08:24:12 AM',
    conflict_type: 'Vehicle-Pedestrian Proximity',
    severity: 'ELEVATED',
    object_a_type: 'Pedestrian (Commuter)',
    object_a_speed_kmh: 4.5,
    object_b_type: 'Bus (Express 12A)',
    object_b_speed_kmh: 32.0,
    time_to_collision_sec: 1.3,
    post_encroachment_time_sec: 0.9,
    minimum_distance_meters: 1.4,
    location_desc: 'Zone 17 Junction Pedestrian Crosswalk Entry',
    lat: 8.7289,
    lng: 77.7180
  },
  {
    id: 'CONF-102',
    zone_id: 'ZONE-RISK-07',
    timestamp: '08:42:05 AM',
    conflict_type: 'Unprotected Jaywalk Conflict',
    severity: 'HIGH',
    object_a_type: 'Pedestrian (Student)',
    object_a_speed_kmh: 5.2,
    object_b_type: 'Two-Wheeler (Motorcycle)',
    object_b_speed_kmh: 48.0,
    time_to_collision_sec: 1.6,
    post_encroachment_time_sec: 1.2,
    minimum_distance_meters: 1.1,
    location_desc: 'Vannarpettai Bypass Median Cut FXEC Approach',
    lat: 8.7302,
    lng: 77.7130
  }
];

