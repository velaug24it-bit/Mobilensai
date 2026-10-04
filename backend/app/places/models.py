from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class AccessibilityInfo(BaseModel):
    step_free_entrance: bool = True
    accessible_restroom: bool = False
    tactile_paving: bool = False
    braille_signage: bool = False
    wheelchair_ramp: bool = True
    elevator_available: bool = False
    summary: str = "Step-free street access"

class EVChargingInfo(BaseModel):
    connector_types: List[str] = ["CCS2", "Type 2 AC"]
    power_kw: int = 50
    total_ports: int = 4
    available_ports: int = 2
    pricing_per_kwh: Optional[str] = "₹18/kWh"

class DetourAnalysis(BaseModel):
    original_duration_min: int = 45
    detour_duration_min: int = 52
    extra_time_min: int = 7
    extra_distance_meters: int = 450
    original_friction_score: int = 48
    detour_friction_score: int = 55
    friction_impact_pts: int = 7
    detour_severity: Literal["Small detour", "Moderate detour", "Large detour"] = "Small detour"
    transfer_risk_warning: Optional[str] = None
    walking_route_risk: Optional[str] = None

class PlaceItem(BaseModel):
    id: str
    name: str
    category: str
    category_label: str
    category_group: str = "general" # emergency, medical, sustenance, mobility, financial, civic
    icon: str
    lat: float
    lng: float
    address: str
    distance_meters: Optional[int] = None
    walking_minutes: Optional[int] = None
    driving_minutes: Optional[int] = None
    status: str = "Open Now"
    is_open: bool = True
    opening_hours: Optional[str] = "08:00 AM - 10:00 PM"
    phone: Optional[str] = None
    website: Optional[str] = None
    accessibility: AccessibilityInfo = Field(default_factory=AccessibilityInfo)
    ev_info: Optional[EVChargingInfo] = None
    rating: Optional[float] = 4.3
    reviews_count: Optional[int] = 120
    source: str = "demo_simulation"
    verification_status: Literal["LIVE_VERIFIED", "ESTIMATED", "DEMO", "USER_REPORTED"] = "DEMO"
    context_anchor: Optional[str] = None # 'home', 'bus_stop', 'corridor', 'station', 'destination'
    corridor_segment: Optional[str] = None
    detour_impact: Optional[DetourAnalysis] = None
    risk_zone_warning: Optional[str] = None
    has_time_verdict: Optional[Literal["Likely feasible", "Tight buffer", "Not recommended"]] = None
    time_window_minutes: Optional[int] = None

class PlaceCategory(BaseModel):
    id: str
    label: str
    icon: str
    group: str
    description: str
    popular: bool = False
    is_emergency: bool = False

class DetourCalculationRequest(BaseModel):
    place_id: str
    current_lat: float
    current_lng: float
    destination_lat: float
    destination_lng: float
    bus_eta_minutes: Optional[int] = None
    journey_friction_score: Optional[int] = 48
    journey_duration_min: Optional[int] = 45

class AddToJourneyRequest(BaseModel):
    place_id: str
    journey_id: str = "current_active_journey"
    stop_position: Optional[str] = "before_destination" # 'after_origin', 'near_bus_stop', 'before_destination'

class RouteSearchRequest(BaseModel):
    route_points: List[List[float]] = [] # [[lat, lng], ...]
    categories: Optional[List[str]] = None
    max_corridor_deviation_m: int = 600

class CityAccessAuditResponse(BaseModel):
    zone_code: str
    zone_name: str
    nearest_hospital_km: float
    nearest_pharmacy_km: float
    nearest_transit_m: int
    nearest_emergency_km: float
    overall_access_rating: str
    vulnerability_notes: List[str]
    simulated: bool = True
