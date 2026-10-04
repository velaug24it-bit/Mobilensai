import math
import os
import logging
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any, Tuple
from app.places.models import (
    PlaceItem, 
    PlaceCategory, 
    DetourAnalysis, 
    CityAccessAuditResponse
)
from app.places.mock_data import CATEGORIES_LIST, DEMO_PLACES_LIST

logger = logging.getLogger("mobilens.places.provider")

def haversine_distance_m(lat1: float, lng1: float, lat2: float, lng2: float) -> int:
    """Computes great-circle distance between two points in meters."""
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return int(R * c)

def point_to_segment_distance_m(p_lat: float, p_lng: float, s1_lat: float, s1_lng: float, s2_lat: float, s2_lng: float) -> int:
    """Calculates perpendicular or nearest distance from point to a line segment in meters."""
    # Approximate equirectangular projection for local segment
    avg_lat = math.radians((s1_lat + s2_lat) / 2.0)
    x = (p_lng - s1_lng) * math.cos(avg_lat) * 111320
    y = (p_lat - s1_lat) * 110540
    dx = (s2_lng - s1_lng) * math.cos(avg_lat) * 111320
    dy = (s2_lat - s1_lat) * 110540

    seg_len_sq = dx * dx + dy * dy
    if seg_len_sq == 0:
        return haversine_distance_m(p_lat, p_lng, s1_lat, s1_lng)

    t = max(0.0, min(1.0, (x * dx + y * dy) / seg_len_sq))
    proj_x = t * dx
    proj_y = t * dy
    return int(math.sqrt((x - proj_x) ** 2 + (y - proj_y) ** 2))

class PlacesProvider(ABC):
    """Abstract provider interface for multi-modal places search."""

    @abstractmethod
    async def get_categories(self) -> List[PlaceCategory]:
        pass

    @abstractmethod
    async def search_nearby(
        self,
        lat: float,
        lng: float,
        radius_meters: int = 2500,
        category: Optional[str] = None,
        query: Optional[str] = None,
        is_emergency: bool = False,
        accessible_only: bool = False,
        open_now_only: bool = False,
        bus_eta_min: Optional[int] = None,
        along_corridor: bool = False,
        scope: Optional[str] = None,
        limit: int = 50
    ) -> List[PlaceItem]:
        pass

    @abstractmethod
    async def get_place_details(self, place_id: str) -> Optional[PlaceItem]:
        pass

    @abstractmethod
    async def search_along_route(
        self,
        route_points: List[List[float]],
        category: Optional[str] = None,
        max_corridor_deviation_m: int = 600,
        limit: int = 25
    ) -> List[PlaceItem]:
        pass

    @abstractmethod
    async def calculate_detour(
        self,
        place_id: str,
        current_lat: float,
        current_lng: float,
        destination_lat: float,
        destination_lng: float,
        bus_eta_minutes: Optional[int] = None,
        base_friction: int = 48,
        base_duration_min: int = 45
    ) -> DetourAnalysis:
        pass

    @abstractmethod
    async def audit_city_accessibility(self, zone_code: str = "ZONE-17") -> CityAccessAuditResponse:
        pass


class DemoPlacesProvider(PlacesProvider):
    """
    High-fidelity resilient provider with realistic simulation data,
    detour friction modeling, and optional live OSM fallback.
    """

    def __init__(self):
        self.places: List[PlaceItem] = list(DEMO_PLACES_LIST)
        self.categories: List[PlaceCategory] = list(CATEGORIES_LIST)
        self.enable_live_osm = os.getenv("ENABLE_LIVE_OSM_PLACES", "false").lower() == "true"

    async def get_categories(self) -> List[PlaceCategory]:
        return self.categories

    def _normalize_query(self, query: str) -> Optional[str]:
        q = query.lower().strip()
        # Intent classification mappings
        if any(w in q for w in ["medicine", "pharmacy", "chemist", "tablet", "drug", "bandage"]):
            return "pharmacy"
        if any(w in q for w in ["hospital", "doctor", "clinic", "casualty", "icu", "emergency medical"]):
            return "hospital"
        if any(w in q for w in ["food", "eat", "lunch", "dinner", "breakfast", "meal", "tiffin", "mess", "canteen"]):
            return "restaurant"
        if any(w in q for w in ["fuel", "petrol", "diesel", "gas", "bunk"]):
            return "fuel"
        if any(w in q for w in ["toilet", "restroom", "washroom", "bathroom", "urinal", "loo"]):
            return "toilet"
        if any(w in q for w in ["atm", "cash", "money", "withdraw"]):
            return "atm"
        if any(w in q for w in ["ev", "charging", "charger", "electric"]):
            return "ev_charging"
        if any(w in q for w in ["police", "cop", "security", "thief", "accident report"]):
            return "police"
        if any(w in q for w in ["fire", "flame", "smoke"]):
            return "fire_station"
        if any(w in q for w in ["water", "drink", "mineral water"]):
            return "food_water"
        if any(w in q for w in ["coffee", "tea", "cafe"]):
            return "cafe"
        if any(w in q for w in ["repair", "puncture", "mechanic", "tyre"]):
            return "vehicle_repair"
        if any(w in q for w in ["park", "parking", "garage"]):
            return "parking"
        if any(w in q for w in ["bus", "bus stop", "stand"]):
            return "bus_stop"
        if any(w in q for w in ["train", "railway", "rail"]):
            return "railway_station"
        return None

    def _calculate_time_verdict(self, walking_min: int, bus_eta_min: Optional[int], category: str) -> Tuple[Optional[str], Optional[int]]:
        if bus_eta_min is None or bus_eta_min <= 0:
            return None, None
        
        # Category-dependent dwell/visit estimation
        visit_dwell_map = {
            "pharmacy": 5,
            "toilet": 4,
            "atm": 3,
            "food_water": 3,
            "cafe": 12,
            "restaurant": 25,
            "grocery": 10,
            "fuel": 6,
            "hospital": 35,
            "police": 30
        }
        dwell_min = visit_dwell_map.get(category, 6)
        round_trip_min = (walking_min * 2) + dwell_min

        if round_trip_min <= bus_eta_min - 2:
            verdict = "Likely feasible"
        elif round_trip_min <= bus_eta_min:
            verdict = "Tight buffer"
        else:
            verdict = "Not recommended"

        return verdict, round_trip_min

    async def search_nearby(
        self,
        lat: float,
        lng: float,
        radius_meters: int = 5000,
        category: Optional[str] = None,
        query: Optional[str] = None,
        is_emergency: bool = False,
        accessible_only: bool = False,
        open_now_only: bool = False,
        bus_eta_min: Optional[int] = None,
        along_corridor: bool = False,
        scope: Optional[str] = None,
        limit: int = 50
    ) -> List[PlaceItem]:
        results: List[PlaceItem] = []
        normalized_cat = self._normalize_query(query) if query else None
        target_cat = category or normalized_cat

        # Journey Corridor Milestones across the entire route
        CORRIDOR_MILESTONES = [
            {"id": "origin", "name": "Thoothukudi Airport (TCR)", "lat": 8.7242, "lng": 78.0265},
            {"id": "bus_stop", "name": "Vagaikulam Feeder Stop", "lat": 8.7258, "lng": 77.9850},
            {"id": "midway", "name": "Vallanadu Highway Midway", "lat": 8.7275, "lng": 77.8820},
            {"id": "bridge", "name": "Thamirabarani River Bridge", "lat": 8.7292, "lng": 77.7855},
            {"id": "station", "name": "Tirunelveli Junction", "lat": 8.7280, "lng": 77.7180},
            {"id": "destination", "name": "FXEC Campus Gate (Vannarpettai)", "lat": 8.7300, "lng": 77.7126},
        ]

        is_corridor_mode = along_corridor or scope == "entire_journey" or radius_meters >= 30000

        for item in self.places:
            # Emergency filter
            if is_emergency and item.category not in ["hospital", "pharmacy", "police", "fire_station"]:
                continue

            # Category filter
            if target_cat and target_cat != "all" and item.category != target_cat:
                continue

            # Text query fallback if no exact category match
            if query and not target_cat:
                q_lower = query.lower()
                if q_lower not in item.name.lower() and q_lower not in item.address.lower() and q_lower not in item.category_label.lower():
                    continue

            # Accessibility filter
            if accessible_only and not item.accessibility.step_free_entrance and not item.accessibility.wheelchair_ramp:
                continue

            # Open now filter
            if open_now_only and not item.is_open:
                continue

            if is_corridor_mode:
                # Find nearest milestone along the corridor route
                nearest_m = min(CORRIDOR_MILESTONES, key=lambda m: haversine_distance_m(item.lat, item.lng, m["lat"], m["lng"]))
                dist = haversine_distance_m(item.lat, item.lng, nearest_m["lat"], nearest_m["lng"])

                # Include places within 4.5km lateral buffer of corridor milestones
                if dist <= 4500:
                    walk_min = max(1, int(dist / 80))
                    drive_min = max(1, int(dist / 500))
                    verdict, round_trip = self._calculate_time_verdict(walk_min, bus_eta_min, item.category)

                    enriched = item.model_copy(update={
                        "distance_meters": dist,
                        "walking_minutes": walk_min,
                        "driving_minutes": drive_min,
                        "has_time_verdict": verdict,
                        "time_window_minutes": round_trip,
                        "corridor_segment": item.corridor_segment or nearest_m["name"]
                    })
                    results.append(enriched)
            else:
                # Standard radial proximity from chosen point
                dist = haversine_distance_m(lat, lng, item.lat, item.lng)
                if dist <= radius_meters:
                    walk_min = max(1, int(dist / 80))
                    drive_min = max(1, int(dist / 500))
                    verdict, round_trip = self._calculate_time_verdict(walk_min, bus_eta_min, item.category)

                    enriched = item.model_copy(update={
                        "distance_meters": dist,
                        "walking_minutes": walk_min,
                        "driving_minutes": drive_min,
                        "has_time_verdict": verdict,
                        "time_window_minutes": round_trip
                    })
                    results.append(enriched)

        if is_corridor_mode:
            # Sort sequentially along the journey corridor from Origin (East, higher lng) to Destination (West, lower lng)
            results.sort(key=lambda x: x.lng, reverse=True)
        else:
            # Sort by distance from chosen anchor
            results.sort(key=lambda x: x.distance_meters or 999999)

        return results[:limit]

    async def get_place_details(self, place_id: str) -> Optional[PlaceItem]:
        for p in self.places:
            if p.id == place_id:
                return p
        return None

    async def search_along_route(
        self,
        route_points: List[List[float]],
        category: Optional[str] = None,
        max_corridor_deviation_m: int = 700,
        limit: int = 25
    ) -> List[PlaceItem]:
        if not route_points or len(route_points) < 2:
            return []

        corridor_matches: List[Tuple[int, PlaceItem]] = []

        for item in self.places:
            if category and category != "all" and item.category != category:
                continue

            # Find minimum distance to any route segment
            min_dist_to_route = 9999999
            for i in range(len(route_points) - 1):
                p1 = route_points[i]
                p2 = route_points[i + 1]
                dist_seg = point_to_segment_distance_m(item.lat, item.lng, p1[0], p1[1], p2[0], p2[1])
                if dist_seg < min_dist_to_route:
                    min_dist_to_route = dist_seg

            if min_dist_to_route <= max_corridor_deviation_m:
                enriched = item.model_copy(update={
                    "distance_meters": min_dist_to_route,
                    "walking_minutes": max(1, int(min_dist_to_route / 80))
                })
                corridor_matches.append((min_dist_to_route, enriched))

        corridor_matches.sort(key=lambda x: x[0])
        return [match[1] for match in corridor_matches[:limit]]

    async def calculate_detour(
        self,
        place_id: str,
        current_lat: float,
        current_lng: float,
        destination_lat: float,
        destination_lng: float,
        bus_eta_minutes: Optional[int] = None,
        base_friction: int = 48,
        base_duration_min: int = 45
    ) -> DetourAnalysis:
        place = await self.get_place_details(place_id)
        if not place:
            return DetourAnalysis()

        # Direct journey distance vs triangle journey (current -> place -> destination)
        direct_dist = haversine_distance_m(current_lat, current_lng, destination_lat, destination_lng)
        leg1 = haversine_distance_m(current_lat, current_lng, place.lat, place.lng)
        leg2 = haversine_distance_m(place.lat, place.lng, destination_lat, destination_lng)
        detour_dist_total = leg1 + leg2
        extra_meters = max(80, detour_dist_total - direct_dist)

        extra_walk_min = max(2, int(extra_meters / 80))
        dwell_time = 5 if place.category in ["pharmacy", "atm", "toilet"] else 12
        extra_total_min = extra_walk_min + dwell_time

        # Mobility friction impact calculation (extra walk burden + time burden)
        friction_points = min(25, int(extra_walk_min * 0.9 + dwell_time * 0.4))
        new_friction = min(100, base_friction + friction_points)

        severity: str = "Small detour"
        if extra_total_min > 18 or friction_points > 14:
            severity = "Large detour"
        elif extra_total_min > 9 or friction_points > 6:
            severity = "Moderate detour"

        warning = None
        if bus_eta_minutes and (extra_walk_min * 2 + dwell_time) > bus_eta_minutes:
            warning = "⚠️ This stop may exceed your available bus arrival window and increase transfer risk."

        risk_warning = None
        if place.risk_zone_warning:
            risk_warning = f"Notice: {place.risk_zone_warning}. Alternative lower-risk path available (+2 min)."

        return DetourAnalysis(
            original_duration_min=base_duration_min,
            detour_duration_min=base_duration_min + extra_total_min,
            extra_time_min=extra_total_min,
            extra_distance_meters=extra_meters,
            original_friction_score=base_friction,
            detour_friction_score=new_friction,
            friction_impact_pts=friction_points,
            detour_severity=severity,  # type: ignore
            transfer_risk_warning=warning,
            walking_route_risk=risk_warning
        )

    async def audit_city_accessibility(self, zone_code: str = "ZONE-17") -> CityAccessAuditResponse:
        # Zone 17 / Vagaikulam - Thoothukudi highway district essential service analysis
        return CityAccessAuditResponse(
            zone_code=zone_code,
            zone_name="Zone 17: Vagaikulam Airport Transit Corridor",
            nearest_hospital_km=1.8,
            nearest_pharmacy_km=0.18,
            nearest_transit_m=120,
            nearest_emergency_km=2.1,
            overall_access_rating="Moderate (Gaps in Emergency Trauma & Pedestrian Connectivity)",
            vulnerability_notes=[
                "High reliance on highway-side pharmacies; lacks rapid municipal 24/7 pediatric care within 1 km.",
                "Unsheltered pedestrian walking path across NH 138 introduces friction for elderly and wheelchair citizens.",
                "Public e-toilets present at terminal but absent at intermediate unscheduled highway stops."
            ],
            simulated=True
        )

# Global singleton
places_provider: PlacesProvider = DemoPlacesProvider()
