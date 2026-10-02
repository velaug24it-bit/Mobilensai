"""
MobiLens AI — Transit Provider Abstraction Layer
Supports standard public transit feed models (GTFS & GTFS-Realtime compatible).
Allows transparent swapping between Simulated Demo Provider and live GTFS-RT APIs.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# GTFS / Transit Data Models
class Stop(BaseModel):
    id: str
    name: str
    code: Optional[str] = None
    lat: float
    lng: float
    wheelchair_accessible: bool = True
    zone_id: Optional[str] = None
    has_shelter: bool = True
    is_transfer_hub: bool = False
    stop_id: Optional[str] = None
    stop_name: Optional[str] = None
    is_accessible: Optional[bool] = None
    shelter_type: Optional[str] = "Covered Shelter"
    routes_served: List[str] = []

    def __init__(self, **data):
        if "stop_id" not in data and "id" in data:
            data["stop_id"] = data["id"]
        if "stop_name" not in data and "name" in data:
            data["stop_name"] = data["name"]
        if "is_accessible" not in data and "wheelchair_accessible" in data:
            data["is_accessible"] = data["wheelchair_accessible"]
        super().__init__(**data)

class Route(BaseModel):
    id: str
    short_name: str
    long_name: str
    route_type: str = "bus"  # bus, tram, rail
    color: str = "#06b6d4"
    text_color: str = "#ffffff"
    stops: List[Stop] = []
    waypoints: List[List[float]] = []
    route_id: Optional[str] = None

    def __init__(self, **data):
        if "route_id" not in data and "id" in data:
            data["route_id"] = data["id"]
        super().__init__(**data)

class VehiclePosition(BaseModel):
    vehicle_id: str
    label: str
    route_id: str
    route_name: str
    route_short_name: str = "Bus"
    route_color: str = "#06b6d4"
    headsign: str = ""
    lat: float
    lng: float
    bearing: float = 0.0
    speed_kmh: float = 28.0
    current_stop_id: Optional[str] = None
    next_stop_id: str
    next_stop_name: str
    stops_away: int = 2
    eta_minutes: int = 5
    scheduled_eta_minutes: int = 5
    delay_minutes: int = 0
    crowding_level: str = "Moderate"  # Low, Moderate, High, Very High
    is_delayed: bool = False
    direction: str = "Eastbound"
    last_updated: str = ""

class StopArrival(BaseModel):
    route_id: str
    route_name: str
    vehicle_id: str
    stop_id: str
    stop_name: str
    eta_minutes: int
    scheduled_time: str
    estimated_time: str
    delay_minutes: int = 0
    distance_km: float = 1.2
    crowding: str = "Moderate"
    is_delayed: bool = False

class CatchabilityResult(BaseModel):
    can_catch: bool
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    walking_distance_m: int
    walking_time_min: int
    bus_eta_min: int
    time_buffer_min: int
    recommendation: str
    calculation_breakdown: Dict[str, Any]
    next_alternative_bus: Optional[Dict[str, Any]] = None

class TransferRiskResult(BaseModel):
    transfer_risk: str  # LOW, MODERATE, HIGH, CRITICAL
    first_leg_arrival: str
    walking_transfer_min: int
    second_leg_departure: str
    available_buffer_min: int
    is_disrupted: bool
    alert_message: Optional[str] = None
    alternatives: List[Dict[str, Any]] = []

class TransitProvider(ABC):
    """
    Abstract Transit Provider for MobiLens AI.
    Any live feed (GTFS-RT, SIRI, proprietary GPS) implements these methods.
    """
    @abstractmethod
    def get_routes(self) -> List[Route]:
        pass

    @abstractmethod
    def get_route(self, route_id: str) -> Optional[Route]:
        pass

    @abstractmethod
    def get_stops(self) -> List[Stop]:
        pass

    @abstractmethod
    def get_stop(self, stop_id: str) -> Optional[Stop]:
        pass

    @abstractmethod
    def get_vehicles(self) -> List[VehiclePosition]:
        pass

    @abstractmethod
    def get_vehicle_positions(self) -> List[VehiclePosition]:
        pass

    @abstractmethod
    def get_vehicle_position(self, vehicle_id: str) -> Optional[VehiclePosition]:
        pass

    @abstractmethod
    def get_arrivals(self, stop_id: str) -> List[StopArrival]:
        pass

    @abstractmethod
    def get_trip_updates(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def step_simulation(self) -> None:
        """Advance simulated moving vehicles along their trajectories"""
        pass

