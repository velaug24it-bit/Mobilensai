"""
MobiLens AI — Transit Transfer Risk & Catchability Engine
Connects live vehicle positions to Human Mobility Friction.
Provides 'Can I Catch This Bus?' calculations and Journey Disruption recovery options.
"""

import math
from typing import Dict, Any, List, Optional
from app.transit.provider import CatchabilityResult, TransferRiskResult

def calculate_haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    R = 6371000  # meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return int(R * c)

def evaluate_catchability(
    user_lat: float,
    user_lng: float,
    stop_lat: float,
    stop_lng: float,
    bus_eta_min: int,
    user_mode: str = "walking", # walking, wheelchair, running
    weather_multiplier: float = 1.0
) -> CatchabilityResult:
    dist_m = calculate_haversine_distance_m(user_lat, user_lng, stop_lat, stop_lng)
    
    # Speed assumptions
    # Normal walk: 80 m/min (~4.8 km/h)
    # Wheelchair: 55 m/min (~3.3 km/h)
    # Brisk / Running: 130 m/min (~7.8 km/h)
    speed_m_per_min = 55 if user_mode == "wheelchair" else 80
    
    # Weather multiplier extends walking time if extreme heat or heavy rain
    effective_speed = max(35, speed_m_per_min / weather_multiplier)
    walk_min = max(1, int(math.ceil(dist_m / effective_speed)))

    buffer_min = bus_eta_min - walk_min

    if buffer_min >= 4:
        risk_level = "LOW"
        can_catch = True
        rec = f"Comfortable connection. You will reach the stop {buffer_min} minutes before the bus."
    elif buffer_min >= 1:
        risk_level = "MODERATE"
        can_catch = True
        rec = f"Tight catch! Walk at a steady pace. You have approximately {buffer_min} minute buffer."
    elif buffer_min == 0:
        risk_level = "HIGH"
        can_catch = True
        rec = "High Risk: Bus and you will arrive at the exact same minute. Fast walk required."
    else:
        risk_level = "CRITICAL"
        can_catch = False
        rec = f"You will likely miss this bus by {abs(buffer_min)} minutes. Proceed to next scheduled service."

    breakdown = {
        "user_to_stop_distance_meters": dist_m,
        "effective_walking_speed_m_per_min": round(effective_speed, 1),
        "estimated_walking_time_minutes": walk_min,
        "bus_current_eta_minutes": bus_eta_min,
        "calculated_safety_buffer_minutes": buffer_min,
        "weather_fatigue_penalty": f"+{int((weather_multiplier - 1.0) * 100)}%" if weather_multiplier > 1.0 else "None",
        "data_notice": "Simulated live transit estimation — prototype calculation"
    }

    next_alt = {
        "route": "15 Express / 12A",
        "next_bus_eta_minutes": bus_eta_min + 14,
        "next_bus_label": "Next Scheduled Service",
        "additional_wait_minutes": 14
    }

    return CatchabilityResult(
        can_catch=can_catch,
        risk_level=risk_level,
        walking_distance_m=dist_m,
        walking_time_min=walk_min,
        bus_eta_min=bus_eta_min,
        time_buffer_min=buffer_min,
        recommendation=rec,
        calculation_breakdown=breakdown,
        next_alternative_bus=next_alt
    )

def evaluate_transfer_risk(
    first_leg_eta_min: int,
    transfer_walk_min: int,
    connection_departure_min: int, # minutes from now
    bus_delay_min: int = 0
) -> TransferRiskResult:
    """
    Evaluates connection feasibility:
    Arrival of bus (eta + delay) + transfer walk vs. Train / Connecting bus departure.
    """
    effective_arrival_min = first_leg_eta_min + bus_delay_min
    ready_for_transfer_min = effective_arrival_min + transfer_walk_min
    available_buffer = connection_departure_min - ready_for_transfer_min

    is_disrupted = available_buffer < 2

    if available_buffer >= 6:
        risk = "LOW"
        msg = f"Safe connection. You have a {available_buffer}-minute buffer before connection departs."
    elif available_buffer >= 2:
        risk = "MODERATE"
        msg = f"Moderate buffer ({available_buffer} min). Proceed promptly across transfer walkway."
    elif available_buffer >= 0:
        risk = "HIGH"
        msg = "High Transfer Risk! Your bus delay leaves almost zero transfer margin."
    else:
        risk = "CRITICAL"
        msg = f"Transfer Failure: You will miss the connection by {abs(available_buffer)} minutes due to vehicle delay."

    alternatives = [
        {
            "id": "ALT-A",
            "name": "Stay on Current Delayed Bus",
            "type": "Wait & Delay",
            "eta_destination": "+18 min late",
            "walking_distance": "600 m",
            "cost_inr": 35,
            "friction_score": 68,
            "transfer_risk": "High (Missed Train)",
            "summary": "Accept delay and wait for the subsequent train service at the junction."
        },
        {
            "id": "ALT-B",
            "name": "Take Route 15 Rapid Bypass Shuttle",
            "type": "Express Transfer",
            "eta_destination": "On Time (08:52 AM)",
            "walking_distance": "350 m",
            "cost_inr": 45,
            "friction_score": 38,
            "transfer_risk": "Low (Syncs with Train)",
            "summary": "Board passing express bus at highway junction to bypass local city stop delays."
        },
        {
            "id": "ALT-C",
            "name": "Direct Campus EV Feeder Shuttle",
            "type": "Intervention Option",
            "eta_destination": "12 min early (08:42 AM)",
            "walking_distance": "120 m",
            "cost_inr": 40,
            "friction_score": 24,
            "transfer_risk": "None (Direct Service)",
            "summary": "Hop onto simulated direct feeder shuttle linking terminal directly to FXEC gate."
        },
        {
            "id": "ALT-D",
            "name": "Switch Transfer Point to Vallanadu Hub",
            "type": "Reroute",
            "eta_destination": "+6 min late",
            "walking_distance": "450 m",
            "cost_inr": 38,
            "friction_score": 46,
            "transfer_risk": "Moderate",
            "summary": "Transfer at the sheltered Vallanadu depot rather than the highway shoulder."
        }
    ]

    return TransferRiskResult(
        transfer_risk=risk,
        first_leg_arrival=f"+{effective_arrival_min} min",
        walking_transfer_min=transfer_walk_min,
        second_leg_departure=f"+{connection_departure_min} min",
        available_buffer_min=available_buffer,
        is_disrupted=is_disrupted,
        alert_message=msg,
        alternatives=alternatives
    )
