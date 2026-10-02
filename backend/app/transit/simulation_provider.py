"""
MobiLens AI — Simulated Transit Provider
Realistic moving bus simulation with interpolation, ETAs, delays, and stop arrivals.
Clearly marked as DEMO SIMULATION.
"""

import math
import datetime
from typing import List, Dict, Any, Optional
from app.transit.provider import (
    TransitProvider,
    Route,
    Stop,
    VehiclePosition,
    StopArrival
)

# 18 Realistic Stops across Local Tamil Nadu and Metro Corridors
SIMULATED_STOPS: List[Stop] = [
    # Route 15 (NH 138 Corridor: TCR Airport -> FXEC Tirunelveli)
    Stop(id="STOP-TCR-01", name="Thoothukudi Airport (TCR)", code="TCR-AIR", lat=8.7242, lng=78.0264, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=True),
    Stop(id="STOP-VAG-02", name="Vagaikulam Feeder Stop", code="VAG-02", lat=8.7258, lng=77.9850, wheelchair_accessible=False, has_shelter=False, is_transfer_hub=True),
    Stop(id="STOP-VAL-03", name="Vallanadu Highway Junction", code="VAL-03", lat=8.7275, lng=77.8820, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=False),
    Stop(id="STOP-THM-04", name="Thamirabarani River Bridge", code="THM-04", lat=8.7290, lng=77.7850, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=False),
    Stop(id="STOP-VAN-05", name="Vannarpettai Bypass (FXEC Gate)", code="FXEC-05", lat=8.7300, lng=77.7126, wheelchair_accessible=True, has_shelter=False, is_transfer_hub=True),
    Stop(id="STOP-NBS-06", name="Tirunelveli New Bus Stand", code="NBS-06", lat=8.7050, lng=77.7280, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=True),

    # Route 12A (Urban Express Corridor)
    Stop(id="STOP-GND-01", name="Gandhipuram Central Terminal", code="GND-01", lat=11.0168, lng=76.9680, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=True),
    Stop(id="STOP-CRC-02", name="Cross Cut Road", code="CRC-02", lat=11.0120, lng=76.9620, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=False),
    Stop(id="STOP-RSP-03", name="RS Puram West", code="RSP-03", lat=11.0080, lng=76.9510, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=False),
    Stop(id="STOP-TWN-04", name="Town Hall Plaza", code="TWN-04", lat=10.9980, lng=76.9600, wheelchair_accessible=False, has_shelter=False, is_transfer_hub=True),
    Stop(id="STOP-RLY-05", name="Railway Station Junction", code="RLY-05", lat=8.7289, lng=77.7180, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=True),
    Stop(id="STOP-UKK-06", name="Ukkadam Bus Terminal", code="UKK-06", lat=10.9850, lng=76.9620, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=True),

    # Route 21 & Route 7B & Route 33 stops
    Stop(id="STOP-COL-07", name="Collectorate Complex", code="COL-07", lat=8.7260, lng=77.7250, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=False),
    Stop(id="STOP-PAL-08", name="Palayamkottai Bus Stand", code="PAL-08", lat=8.7185, lng=77.7420, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=True),
    Stop(id="STOP-MED-09", name="Medical College Ground", code="MED-09", lat=8.7120, lng=77.7480, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=False),
    Stop(id="STOP-VNE-10", name="Vannarpettai East Ramp", code="VNE-10", lat=8.7310, lng=77.7160, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=False),
    Stop(id="STOP-FXR-11", name="FXEC Main Campus Step-Free Ramp", code="FXR-11", lat=8.7295, lng=77.7118, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=False),
    Stop(id="STOP-PER-12", name="Perumalpuram Terminal", code="PER-12", lat=8.6980, lng=77.7340, wheelchair_accessible=True, has_shelter=True, is_transfer_hub=False),
]

STOPS_BY_ID = {s.id: s for s in SIMULATED_STOPS}

# 5 Routes
SIMULATED_ROUTES: List[Route] = [
    Route(
        id="ROUTE-15",
        short_name="15",
        long_name="TCR Airport ➔ FXEC Engineering Corridor",
        route_type="bus",
        color="#06b6d4",
        text_color="#ffffff",
        stops=[STOPS_BY_ID["STOP-TCR-01"], STOPS_BY_ID["STOP-VAG-02"], STOPS_BY_ID["STOP-VAL-03"], STOPS_BY_ID["STOP-THM-04"], STOPS_BY_ID["STOP-VAN-05"], STOPS_BY_ID["STOP-NBS-06"]]
    ),
    Route(
        id="ROUTE-12A",
        short_name="12A",
        long_name="Gandhipuram ➔ RS Puram ➔ Junction Express",
        route_type="bus",
        color="#3b82f6",
        text_color="#ffffff",
        stops=[STOPS_BY_ID["STOP-GND-01"], STOPS_BY_ID["STOP-CRC-02"], STOPS_BY_ID["STOP-RSP-03"], STOPS_BY_ID["STOP-TWN-04"], STOPS_BY_ID["STOP-RLY-05"], STOPS_BY_ID["STOP-UKK-06"]]
    ),
    Route(
        id="ROUTE-21",
        short_name="21",
        long_name="Railway Junction ➔ Palayamkottai Metro Link",
        route_type="bus",
        color="#8b5cf6",
        text_color="#ffffff",
        stops=[STOPS_BY_ID["STOP-RLY-05"], STOPS_BY_ID["STOP-COL-07"], STOPS_BY_ID["STOP-PAL-08"], STOPS_BY_ID["STOP-MED-09"]]
    ),
    Route(
        id="ROUTE-7B",
        short_name="7B-EV",
        long_name="Accessible Low-Floor Electric Feeder (FXEC Campus)",
        route_type="bus",
        color="#10b981",
        text_color="#ffffff",
        stops=[STOPS_BY_ID["STOP-TCR-01"], STOPS_BY_ID["STOP-VAL-03"], STOPS_BY_ID["STOP-VNE-10"], STOPS_BY_ID["STOP-FXR-11"], STOPS_BY_ID["STOP-PAL-08"]]
    ),
    Route(
        id="ROUTE-33",
        short_name="33",
        long_name="Suburban Rail Connector ➔ New Bus Stand",
        route_type="bus",
        color="#f59e0b",
        text_color="#ffffff",
        stops=[STOPS_BY_ID["STOP-RLY-05"], STOPS_BY_ID["STOP-VAN-05"], STOPS_BY_ID["STOP-PER-12"], STOPS_BY_ID["STOP-NBS-06"]]
    ),
]

for r in SIMULATED_ROUTES:
    r.waypoints = [[s.lat, s.lng] for s in r.stops]

ROUTES_BY_ID = {r.id: r for r in SIMULATED_ROUTES}

class InternalVehicleState:
    def __init__(self, vehicle_id: str, label: str, route_id: str, progress: float, speed_kmh: float, direction: str):
        self.vehicle_id = vehicle_id
        self.label = label
        self.route_id = route_id
        self.progress = progress  # 0.0 to 1.0 along the route's stop segments
        self.speed_kmh = speed_kmh
        self.direction = direction
        self.delay_minutes = 0
        self.crowding_level = "Moderate"
        self.is_paused = False

class SimulatedTransitProvider(TransitProvider):
    def __init__(self):
        self.routes = SIMULATED_ROUTES
        self.stops = SIMULATED_STOPS
        
        # 9 Simulated Buses with diverse starting positions
        self._vehicles: Dict[str, InternalVehicleState] = {
            # Route 15 buses (TCR -> FXEC corridor)
            "BUS-15-01": InternalVehicleState("BUS-15-01", "TN-72-N-1840 (Exp 15)", "ROUTE-15", progress=0.15, speed_kmh=45.0, direction="Westbound to FXEC"),
            "BUS-15-02": InternalVehicleState("BUS-15-02", "TN-72-N-1844 (Exp 15)", "ROUTE-15", progress=0.68, speed_kmh=42.0, direction="Eastbound to Airport"),
            
            # Route 12A buses
            "BUS-12A-01": InternalVehicleState("BUS-12A-01", "12A-104 (City Express)", "ROUTE-12A", progress=0.32, speed_kmh=28.0, direction="Southbound to Ukkadam"),
            "BUS-12A-02": InternalVehicleState("BUS-12A-02", "12A-108 (City Express)", "ROUTE-12A", progress=0.74, speed_kmh=30.0, direction="Northbound to Gandhipuram"),
            "BUS-12A-03": InternalVehicleState("BUS-12A-03", "12A-112 (City Express)", "ROUTE-12A", progress=0.08, speed_kmh=26.0, direction="Southbound to Ukkadam"),

            # Route 21 buses
            "BUS-21-01": InternalVehicleState("BUS-21-01", "TN-72-N-2101 (Route 21)", "ROUTE-21", progress=0.45, speed_kmh=32.0, direction="To Palayamkottai"),
            "BUS-21-02": InternalVehicleState("BUS-21-02", "TN-72-N-2105 (Route 21)", "ROUTE-21", progress=0.85, speed_kmh=30.0, direction="To Railway Station"),

            # Route 7B EV Shuttle
            "EV-7B-01": InternalVehicleState("EV-7B-01", "TN-72-EV-01 (Low-Floor Feeder)", "ROUTE-7B", progress=0.55, speed_kmh=38.0, direction="Westbound to FXEC Ramp"),

            # Route 33
            "BUS-33-01": InternalVehicleState("BUS-33-01", "TN-72-N-3301 (Connector)", "ROUTE-33", progress=0.25, speed_kmh=35.0, direction="To New Bus Stand"),
        }

    def get_routes(self) -> List[Route]:
        return self.routes

    def get_route(self, route_id: str) -> Optional[Route]:
        return ROUTES_BY_ID.get(route_id)

    def get_stops(self) -> List[Stop]:
        return self.stops

    def get_stop(self, stop_id: str) -> Optional[Stop]:
        return STOPS_BY_ID.get(stop_id)

    def set_vehicle_delay(self, vehicle_id: str, delay_minutes: int):
        if vehicle_id in self._vehicles:
            self._vehicles[vehicle_id].delay_minutes = delay_minutes
            if delay_minutes > 4:
                self._vehicles[vehicle_id].crowding_level = "High"

    def step_simulation(self) -> None:
        """Advance vehicles smoothly along route polyline"""
        for v in self._vehicles.values():
            if v.is_paused:
                continue
            # Step progress (simulating 5 seconds of transit motion)
            increment = 0.015 * (v.speed_kmh / 30.0)
            v.progress = (v.progress + increment) % 1.0

    def _interpolate_vehicle_position(self, v: InternalVehicleState) -> VehiclePosition:
        route = ROUTES_BY_ID.get(v.route_id, self.routes[0])
        stops = route.stops
        num_segments = len(stops) - 1
        if num_segments <= 0:
            s = stops[0]
            return VehiclePosition(
                vehicle_id=v.vehicle_id,
                label=v.label,
                route_id=v.route_id,
                route_name=route.short_name,
                lat=s.lat,
                lng=s.lng,
                next_stop_id=s.id,
                next_stop_name=s.name,
                last_updated=datetime.datetime.utcnow().isoformat()
            )

        segment_float = v.progress * num_segments
        seg_idx = int(segment_float)
        seg_idx = min(seg_idx, num_segments - 1)
        sub_progress = segment_float - seg_idx

        s_from = stops[seg_idx]
        s_to = stops[seg_idx + 1]

        # Linear coordinate interpolation
        cur_lat = s_from.lat + (s_to.lat - s_from.lat) * sub_progress
        cur_lng = s_from.lng + (s_to.lng - s_from.lng) * sub_progress

        # Calculate bearing
        d_lat = s_to.lat - s_from.lat
        d_lng = s_to.lng - s_from.lng
        bearing = (math.degrees(math.atan2(d_lng, d_lat)) + 360) % 360

        # Remaining stops & ETA to next stop
        stops_away = num_segments - seg_idx
        # Distance to next stop in km approx
        dist_to_next = math.sqrt(d_lat**2 + d_lng**2) * 111.0 * (1.0 - sub_progress)
        base_eta = max(1, int(round((dist_to_next / max(15.0, v.speed_kmh)) * 60)))
        total_eta = base_eta + v.delay_minutes

        return VehiclePosition(
            vehicle_id=v.vehicle_id,
            label=v.label,
            route_id=v.route_id,
            route_name=f"Route {route.short_name}",
            route_short_name=route.short_name,
            route_color=route.color,
            headsign=route.long_name,
            lat=round(cur_lat, 5),
            lng=round(cur_lng, 5),
            bearing=round(bearing, 1),
            speed_kmh=v.speed_kmh,
            current_stop_id=s_from.id,
            next_stop_id=s_to.id,
            next_stop_name=s_to.name,
            stops_away=stops_away,
            eta_minutes=total_eta,
            scheduled_eta_minutes=base_eta,
            delay_minutes=v.delay_minutes,
            crowding_level=v.crowding_level,
            is_delayed=v.delay_minutes > 2,
            direction=v.direction,
            last_updated=datetime.datetime.utcnow().isoformat()
        )

    def get_vehicles(self) -> List[VehiclePosition]:
        return [self._interpolate_vehicle_position(v) for v in self._vehicles.values()]

    def get_vehicle_position(self, vehicle_id: str) -> Optional[VehiclePosition]:
        v = self._vehicles.get(vehicle_id)
        if not v:
            return None
        return self._interpolate_vehicle_position(v)

    def get_arrivals(self, stop_id: str) -> List[StopArrival]:
        target_stop = STOPS_BY_ID.get(stop_id)
        if not target_stop:
            return []

        arrivals: List[StopArrival] = []
        now = datetime.datetime.now()

        for r in self.routes:
            stop_ids = [s.id for s in r.stops]
            if stop_id in stop_ids:
                stop_idx = stop_ids.index(stop_id)
                # Find matching vehicles on this route
                for v in self._vehicles.values():
                    if v.route_id == r.id:
                        pos = self._interpolate_vehicle_position(v)
                        # Estimate minutes until reaching target_stop
                        num_segs = len(r.stops) - 1
                        veh_seg_idx = int(v.progress * num_segs)
                        if stop_idx >= veh_seg_idx:
                            segs_to_go = stop_idx - veh_seg_idx
                            est_minutes = max(1, segs_to_go * 4 + v.delay_minutes)
                        else:
                            # Looped / next cycle
                            est_minutes = max(1, (len(r.stops) - veh_seg_idx + stop_idx) * 4 + v.delay_minutes)

                        sched_time = (now + datetime.timedelta(minutes=max(1, est_minutes - v.delay_minutes))).strftime("%I:%M %p")
                        est_time = (now + datetime.timedelta(minutes=est_minutes)).strftime("%I:%M %p")

                        arrivals.append(StopArrival(
                            route_id=r.id,
                            route_name=f"Bus {r.short_name}",
                            vehicle_id=v.label,
                            stop_id=stop_id,
                            stop_name=target_stop.name,
                            eta_minutes=est_minutes,
                            scheduled_time=sched_time,
                            estimated_time=est_time,
                            delay_minutes=v.delay_minutes,
                            distance_km=round(est_minutes * 0.45, 1),
                            crowding=v.crowding_level,
                            is_delayed=v.delay_minutes > 2
                        ))

        # Sort by nearest ETA
        arrivals.sort(key=lambda a: a.eta_minutes)
        return arrivals

    def get_vehicle_positions(self) -> List[VehiclePosition]:
        return self.get_vehicles()

    def get_trip_updates(self) -> List[Dict[str, Any]]:
        updates = []
        for v in self._vehicles.values():
            if v.delay_minutes > 0:
                updates.append({
                    "vehicle_id": v.vehicle_id,
                    "route_id": v.route_id,
                    "delay_seconds": v.delay_minutes * 60,
                    "delay_minutes": v.delay_minutes,
                    "crowding_level": v.crowding_level,
                    "status": "DELAYED" if v.delay_minutes >= 4 else "SLIGHT_DELAY"
                })
        return updates

# Global Singleton Instance of Simulated Transit Provider
transit_engine = SimulatedTransitProvider()

