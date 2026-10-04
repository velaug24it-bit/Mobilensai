export type CategoryGroupId = 'emergency' | 'medical' | 'sustenance' | 'mobility' | 'financial' | 'civic';

export interface PlaceCategory {
  id: string;
  label: string;
  icon: string;
  group: CategoryGroupId;
  description: string;
  popular?: boolean;
  is_emergency?: boolean;
}

export interface AccessibilityDetails {
  step_free_entrance: boolean;
  accessible_restroom?: boolean;
  tactile_paving?: boolean;
  braille_signage?: boolean;
  wheelchair_ramp?: boolean;
  elevator_available?: boolean;
  summary: string;
}

export interface EVDetails {
  connector_types: string[];
  power_kw: number;
  total_ports: number;
  available_ports: number;
  pricing_per_kwh?: string;
}

export interface DetourAnalysisResult {
  original_duration_min: number;
  detour_duration_min: number;
  extra_time_min: number;
  extra_distance_meters: number;
  original_friction_score: number;
  detour_friction_score: number;
  friction_impact_pts: number;
  detour_severity: 'Small detour' | 'Moderate detour' | 'Large detour';
  transfer_risk_warning?: string | null;
  walking_route_risk?: string | null;
}

export type TimeFeasibility = 'Likely feasible' | 'Tight buffer' | 'Not recommended';
export type VerificationBadge = 'LIVE_VERIFIED' | 'ESTIMATED' | 'DEMO' | 'USER_REPORTED';

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  category_label: string;
  category_group: string;
  icon: string;
  lat: number;
  lng: number;
  address: string;
  distance_meters?: number;
  walking_minutes?: number;
  driving_minutes?: number;
  status: string;
  is_open: boolean;
  opening_hours?: string;
  phone?: string;
  website?: string;
  accessibility: AccessibilityDetails;
  ev_info?: EVDetails;
  rating?: number;
  reviews_count?: number;
  source: string;
  verification_status: VerificationBadge;
  context_anchor?: 'home' | 'bus_stop' | 'corridor' | 'station' | 'destination';
  corridor_segment?: string;
  detour_impact?: DetourAnalysisResult;
  risk_zone_warning?: string | null;
  has_time_verdict?: TimeFeasibility;
  time_window_minutes?: number;
}

export interface CityAccessAudit {
  zone_code: string;
  zone_name: string;
  nearest_hospital_km: number;
  nearest_pharmacy_km: number;
  nearest_transit_m: number;
  nearest_emergency_km: number;
  overall_access_rating: string;
  vulnerability_notes: string[];
  simulated: boolean;
}
