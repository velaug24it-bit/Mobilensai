export type FrictionLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface JourneySegment {
  id: string;
  name: string;
  mode: 'walking' | 'bus' | 'waiting' | 'transfer' | 'train' | 'auto';
  durationMinutes: number;
  expectedMinutes?: number;
  excessMinutes?: number;
  distanceKm?: number;
  costInr?: number;
  frictionContribution: 'low' | 'moderate' | 'high';
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  stepFree?: boolean;
}

export interface FrictionBreakdown {
  waitingBurden: number;       // e.g. 28%
  transferBurden: number;      // e.g. 17%
  walkingBurden: number;       // e.g. 9%
  timeBurden: number;          // e.g. 12%
  costBurden: number;          // e.g. 6%
  accessibilityBurden: number; // e.g. 6%
  reliabilityBurden: number;   // e.g. 5%
}

export interface PrimaryBottleneck {
  segmentId: string;
  title: string;
  location: string;
  affectedSegment: string;
  currentWaitMinutes: number;
  expectedWaitMinutes: number;
  excessWaitMinutes: number;
  confidence: string;
  insight: string;
  recommendation: string;
}

export interface Journey {
  id: string;
  title: string;
  userType: 'student' | 'commuter' | 'elderly' | 'wheelchair' | 'parent';
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  totalDurationMinutes: number;
  travelDurationMinutes: number;
  waitingDurationMinutes: number;
  walkingDurationMinutes: number;
  transferCount: number;
  estimatedCostInr: number;
  frictionScore: number; // 0 - 100
  frictionLevel: FrictionLevel;
  segments: JourneySegment[];
  frictionBreakdown: FrictionBreakdown;
  primaryBottleneck: PrimaryBottleneck;
  simulation: boolean;
}

export interface InterventionOption {
  id: string;
  title: string;
  type: 'sync' | 'feeder' | 'bus' | 'relocate' | 'pedestrian';
  description: string;
  estimatedComplexity: 'Low' | 'Medium' | 'High';
  estimatedCost: 'Low' | 'Medium' | 'High';
  simulatedFrictionReductionPct: number;
  simulatedTimeReductionMin: number;
  affectedPopulationDaily: number;
  implementationCategory: string;
  afterFrictionScore: number;
  afterDurationMinutes: number;
  afterWaitingMinutes: number;
  afterTransfers: number;
  aiRecommendationSummary: string;
  isRecommended?: boolean;
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  frictionScore: number;
  level: 'low' | 'moderate' | 'high' | 'severe';
  lat: number;
  lng: number;
  radiusMeters: number;
  affectedDaily: number;
  avgJourneyMinutes: number;
  avgWaitMinutes: number;
  avgTransfers: number;
  walkingBurdenKm: number;
  mainIssue: string;
  peakPeriod: string;
  secondaryIssue: string;
  interventionsAvailable: number;
}

export interface AccessibilityProfile {
  id: string;
  name: string;
  persona: string;
  iconName: string;
  journeyMinutes: number;
  accessibilityFriction: number;
  walkingBurdenKm: number;
  transferBurden: number;
  bottleneckReason: string;
  alternativeRouteName: string;
  alternativeMinutes: number;
  alternativeFriction: number;
  details: string;
}

export interface WhatIfParams {
  busFrequencyPerHour: number;
  trainFrequencyPerHour: number;
  avgTransferWaitMinutes: number;
  walkingConnectionMinutes: number;
  feederAvailabilityPct: number;
  scheduleSyncPct: number;
  accessibilityLevelPct: number;
}

export interface SimulationResult {
  baselineJourneyMin: number;
  baselineFriction: number;
  baselineWaitMin: number;
  simulatedJourneyMin: number;
  simulatedFriction: number;
  simulatedWaitMin: number;
  journeyDeltaMin: number;
  frictionDeltaPoints: number;
  waitDeltaMin: number;
  keyDrivers: string[];
}

export interface NotificationItem {
  id: string;
  type: 'alert' | 'insight' | 'journey' | 'simulation';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  zoneId?: string;
}

export interface RouteOption {
  id: string;
  name: string;
  tag: string;
  durationMinutes: number;
  frictionScore: number;
  walkingKm: number;
  costInr: number;
  transfers: number;
  accessibilityRating: string;
  summary: string;
  isRecommended?: boolean;
}

export interface CitizenReport {
  id: string;
  locationName: string;
  district: string;
  category: 'excessive_wait' | 'dangerous_crossing' | 'extreme_heat_no_shade' | 'broken_ramp' | 'unscheduled_delay';
  severity: 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  coordinates: { lat: number; lng: number };
  reportedBy: string;
  upvotes: number;
  timestamp: string;
  status: string;
}

export interface RiskZone {
  id: string;
  code: string;
  name: string;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Elevated';
  risk_score: number;
  lat: number;
  lng: number;
  radius_meters: number;
  observed_conflicts: number;
  pedestrian_exposure: 'Low' | 'Moderate' | 'High' | 'Severe';
  bus_stop_nearby: boolean;
  bus_stop_name: string;
  crossing_type: string;
  peak_period: string;
  primary_factor: string;
  secondary_factor: string;
  recommended_interventions: string[];
  disclaimer: string;
}

export interface ConflictEvent {
  id: string;
  zone_id: string;
  timestamp: string;
  conflict_type: string;
  severity: 'MODERATE' | 'HIGH' | 'ELEVATED';
  object_a_type: string;
  object_a_speed_kmh: number;
  object_b_type: string;
  object_b_speed_kmh: number;
  time_to_collision_sec?: number;
  post_encroachment_time_sec?: number;
  minimum_distance_meters: number;
  location_desc: string;
  lat: number;
  lng: number;
}

export interface CVObjectTrack {
  id: number;
  class: string;
  box: [number, number, number, number];
  vector: [number, number];
  speed: number;
  conflict?: boolean;
  tag?: string;
}

export interface CVFrameSample {
  frame_idx: number;
  timestamp_sec: number;
  conflict_active?: boolean;
  objects: CVObjectTrack[];
}

export interface VideoAnalysisResult {
  analysis_id: string;
  source_name: string;
  video_duration_seconds: number;
  total_objects_detected: number;
  pedestrians_count: number;
  vehicles_count: number;
  motorcycles_count: number;
  bicycles_count: number;
  trucks_count: number;
  potential_conflict_events: number;
  high_risk_interactions: number;
  min_time_to_collision_sec: number;
  avg_post_encroachment_time_sec: number;
  sudden_braking_events: number;
  risk_indicator_rating: 'Low' | 'Moderate' | 'Elevated' | 'High';
  primary_risk_driver: string;
  key_conflict_events: Array<{
    time_offset_sec: number;
    event_title: string;
    time_to_collision_sec: number;
    post_encroachment_time_sec: number;
    actors: string;
    severity: string;
    indicator: string;
  }>;
  frame_samples: CVFrameSample[];
  recommended_mitigations: string[];
  is_prototype: boolean;
  disclaimer: string;
}

export interface SafeJourneyComparisonOption {
  id: string;
  title: string;
  badge: 'FASTEST' | 'LOWEST FRICTION' | 'LOWEST WALKING' | 'LOWEST COST' | 'ACCESSIBLE' | 'LOWER RISK EXPOSURE';
  badgeColor: string;
  durationMinutes: number;
  walkingMinutes: number;
  walkingKm: number;
  frictionScore: number;
  riskExposure: 'Low' | 'Moderate' | 'Elevated';
  transfers: number;
  costInr: number;
  stepFree: boolean;
  description: string;
  highlights: string[];
  isRecommended?: boolean;
}

export interface LiveJourneyStage {
  id: string;
  title: string;
  stageName: string;
  mode: 'home' | 'walk' | 'bus_stop' | 'bus' | 'train' | 'destination';
  status: 'completed' | 'active' | 'upcoming';
  etaMinutes?: number;
  departureTime?: string;
  detail: string;
  location: string;
  riskIndicator?: 'Low' | 'Elevated';
}


