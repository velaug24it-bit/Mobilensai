"""
MobiLens AI — Road Safety & Mobility Risk Engine
Integrates the previous MobiShield concept directly into MobiLens AI.
Analyzes road-user interactions, trajectory conflicts, and mobility risk exposure.
Strictly non-predictive: Provides analytical risk indicators, NOT accident predictions.
"""

import math
import uuid
import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class RiskZone(BaseModel):
    id: str
    code: str
    name: str
    risk_level: str  # Low, Moderate, High, Elevated
    risk_score: int  # 0 to 100
    lat: float
    lng: float
    radius_meters: int = 400
    observed_conflicts: int = 18
    pedestrian_exposure: str = "High"  # Low, Moderate, High, Severe
    bus_stop_nearby: bool = True
    bus_stop_name: str = "Central Bus Stop"
    crossing_type: str = "Unprotected Mid-Block Crossing"
    peak_period: str = "08:00–09:00 AM"
    primary_factor: str = "Pedestrian-vehicle interaction"
    secondary_factor: str = "Sudden deceleration near bus discharge bay"
    recommended_interventions: List[str] = []
    disclaimer: str = "Demo / Simulated Data — analytical risk indicators"

class ConflictEvent(BaseModel):
    id: str
    zone_id: str
    timestamp: str
    conflict_type: str  # "Vehicle-Pedestrian Proximity", "Trajectory Crossing", "Sudden Braking Near Stop", "Unprotected Jaywalk Conflict"
    severity: str       # "MODERATE", "HIGH", "ELEVATED"
    object_a_type: str  # "Pedestrian", "Two-Wheeler", "Cyclist"
    object_a_speed_kmh: float
    object_b_type: str  # "Bus", "Car", "Heavy Truck"
    object_b_speed_kmh: float
    time_to_collision_sec: Optional[float] = 1.4  # TTC analytical indicator
    post_encroachment_time_sec: Optional[float] = 1.1  # PET indicator
    minimum_distance_meters: float = 1.8
    location_desc: str
    lat: float
    lng: float

class TrajectoryPoint(BaseModel):
    x: float
    y: float
    timestamp_ms: int

class TrackedRoadObject(BaseModel):
    object_id: int
    object_class: str  # Person, Bus, Car, Motorcycle, Bicycle, Truck
    confidence: float
    current_box: List[float]  # [x, y, width, height] normalized
    trajectory: List[List[float]]
    speed_kmh: float
    heading_deg: float
    in_conflict: bool = False
    conflict_reason: Optional[str] = None

class VideoAnalysisResult(BaseModel):
    analysis_id: str
    source_name: str
    video_duration_seconds: float
    total_objects_detected: int
    pedestrians_count: int
    vehicles_count: int
    motorcycles_count: int
    bicycles_count: int
    trucks_count: int
    potential_conflict_events: int
    high_risk_interactions: int
    min_time_to_collision_sec: float
    avg_post_encroachment_time_sec: float
    sudden_braking_events: int
    risk_indicator_rating: str  # Low, Moderate, Elevated, High
    primary_risk_driver: str
    key_conflict_events: List[Dict[str, Any]]
    frame_samples: List[Dict[str, Any]]
    recommended_mitigations: List[str]
    is_prototype: bool = True
    disclaimer: str = "Prototype / Demo Analysis — analytical indicators only. Not an accident prediction."

# Comprehensive Mock Risk Zones
DEFAULT_RISK_ZONES: List[RiskZone] = [
    RiskZone(
        id="ZONE-RISK-17",
        code="ZONE 17",
        name="Sector 17 Central Interchange & Concourse",
        risk_level="Elevated",
        risk_score=84,
        lat=8.7289,
        lng=77.7180,
        radius_meters=450,
        observed_conflicts=23,
        pedestrian_exposure="Severe",
        bus_stop_nearby=True,
        bus_stop_name="Railway Station Bus Loop Bay 3",
        crossing_type="Unprotected 4-Lane Arterial Crossing",
        peak_period="08:00–09:00 AM",
        primary_factor="Pedestrian-vehicle interaction during bus-to-train transfers",
        secondary_factor="High-speed auto rickshaw turning conflicts",
        recommended_interventions=[
            "Install raised grade-separated zebra crossing with pedestrian signal",
            "Relocate bus alighting bay 120m closer to rail concourse entrance",
            "Introduce 30 km/h traffic calming speed table"
        ]
    ),
    RiskZone(
        id="ZONE-RISK-07",
        code="ZONE 07",
        name="Vannarpettai Bypass Road & College Gate",
        risk_level="High",
        risk_score=76,
        lat=8.7300,
        lng=77.7126,
        radius_meters=380,
        observed_conflicts=19,
        pedestrian_exposure="High",
        bus_stop_nearby=True,
        bus_stop_name="Vannarpettai Bypass Stop",
        crossing_type="Divided Highway Mid-Block Crossing",
        peak_period="08:15–09:15 AM",
        primary_factor="Students crossing highway against 65 km/h intercity traffic",
        secondary_factor="Absence of signalized pedestrian crossing or skywalk",
        recommended_interventions=[
            "Construct covered foot-overbridge (FOB) with ramp access",
            "Install pedestrian actuated pelican traffic signals",
            "Erect continuous median anti-jaywalking pedestrian guard rails"
        ]
    ),
    RiskZone(
        id="ZONE-RISK-04",
        code="ZONE 04",
        name="NH 138 Vagaikulam Airport Junction",
        risk_level="Moderate",
        risk_score=58,
        lat=8.7258,
        lng=77.9850,
        radius_meters=500,
        observed_conflicts=11,
        pedestrian_exposure="Moderate",
        bus_stop_nearby=True,
        bus_stop_name="Vagaikulam Feeder Stop",
        crossing_type="Rural Highway Shoulder",
        peak_period="11:30 AM–01:00 PM",
        primary_factor="Unsheltered roadside waiting with heavy freight vehicle proximity",
        secondary_factor="High-speed truck slipstream exposure",
        recommended_interventions=[
            "Install curbed setback passenger waiting shelter",
            "Add high-visibility solar blinker warning lights",
            "Designate segregated passenger boarding slip lane"
        ]
    ),
    RiskZone(
        id="ZONE-RISK-01",
        code="ZONE 01",
        name="Palayamkottai South Terminal Approach",
        risk_level="Low",
        risk_score=28,
        lat=8.7185,
        lng=77.7420,
        radius_meters=300,
        observed_conflicts=4,
        pedestrian_exposure="Low",
        bus_stop_nearby=True,
        bus_stop_name="Palayamkottai Depo Gate",
        crossing_type="Signalized Crosswalk with Refuge Island",
        peak_period="05:30–06:30 PM",
        primary_factor="Minor turning motorcycle friction",
        secondary_factor="Adequate physical pedestrian refuge",
        recommended_interventions=[
            "Refresh tactile blister paving at curb ramps",
            "Optimize cycle time of pedestrian green phase"
        ]
    )
]

DEFAULT_CONFLICTS: List[ConflictEvent] = [
    ConflictEvent(
        id="CONF-101",
        zone_id="ZONE-RISK-17",
        timestamp="08:24:12 AM",
        conflict_type="Vehicle-Pedestrian Proximity",
        severity="ELEVATED",
        object_a_type="Pedestrian (Commuter)",
        object_a_speed_kmh=4.5,
        object_b_type="Bus (Express 12A)",
        object_b_speed_kmh=32.0,
        time_to_collision_sec=1.3,
        post_encroachment_time_sec=0.9,
        minimum_distance_meters=1.4,
        location_desc="Zone 17 Junction Pedestrian Crosswalk Entry",
        lat=8.7289,
        lng=77.7180
    ),
    ConflictEvent(
        id="CONF-102",
        zone_id="ZONE-RISK-07",
        timestamp="08:42:05 AM",
        conflict_type="Unprotected Jaywalk Conflict",
        severity="HIGH",
        object_a_type="Pedestrian (Student)",
        object_a_speed_kmh=5.2,
        object_b_type="Two-Wheeler (Motorcycle)",
        object_b_speed_kmh=48.0,
        time_to_collision_sec=1.6,
        post_encroachment_time_sec=1.2,
        minimum_distance_meters=1.1,
        location_desc="Vannarpettai Bypass Median Cut FXEC Approach",
        lat=8.7302,
        lng=77.7130
    ),
    ConflictEvent(
        id="CONF-103",
        zone_id="ZONE-RISK-17",
        timestamp="08:18:30 AM",
        conflict_type="Sudden Braking Near Stop",
        severity="HIGH",
        object_a_type="Pedestrian (Elderly)",
        object_a_speed_kmh=3.2,
        object_b_type="Car (Sedan)",
        object_b_speed_kmh=41.0,
        time_to_collision_sec=1.8,
        post_encroachment_time_sec=1.4,
        minimum_distance_meters=2.2,
        location_desc="Station Concourse North Bus Drop Bay",
        lat=8.7285,
        lng=77.7175
    ),
    ConflictEvent(
        id="CONF-104",
        zone_id="ZONE-RISK-04",
        timestamp="12:15:22 PM",
        conflict_type="Heavy Vehicle Slipstream Proximity",
        severity="MODERATE",
        object_a_type="Pedestrian (Waiting Commuter)",
        object_a_speed_kmh=0.0,
        object_b_type="Heavy Truck (Multi-Axle)",
        object_b_speed_kmh=64.0,
        time_to_collision_sec=2.2,
        post_encroachment_time_sec=1.8,
        minimum_distance_meters=1.9,
        location_desc="NH 138 Vagaikulam Uncovered Shoulder",
        lat=8.7258,
        lng=77.9850
    )
]

def analyze_journey_risk_exposure(walking_segments: List[Dict[str, Any]], zones: List[RiskZone] = None) -> Dict[str, Any]:
    """
    Evaluates whether the user's door-to-door walking segments intersect high-risk zones.
    """
    if zones is None:
        zones = DEFAULT_RISK_ZONES

    flagged_segments = []
    overall_exposure = "Low"
    max_score = 0

    for seg in walking_segments:
        seg_name = seg.get("name", "Walking Leg")
        seg_dist = seg.get("distanceMeters", 350)
        seg_loc = seg.get("location", "")

        # Check proximity to known elevated risk zones
        matching_zone = None
        for z in zones:
            if z.risk_level in ["High", "Elevated"]:
                # Match by location keywords or zone proximity
                if any(w.lower() in seg_loc.lower() or w.lower() in seg_name.lower() 
                       for w in ["station", "bypass", "transfer", "interchange", "vagaikulam", "central"]):
                    matching_zone = z
                    break

        if matching_zone:
            if matching_zone.risk_score > max_score:
                max_score = matching_zone.risk_score
                overall_exposure = matching_zone.risk_level

            flagged_segments.append({
                "segment_name": seg_name,
                "walking_distance_m": seg_dist,
                "risk_exposure": matching_zone.risk_level,
                "risk_score": matching_zone.risk_score,
                "zone_name": matching_zone.name,
                "zone_code": matching_zone.code,
                "primary_factor": matching_zone.primary_factor,
                "conflict_notice": "Your walking path crosses an area with elevated vehicle-pedestrian conflict indicators.",
                "mitigation": matching_zone.recommended_interventions[0] if matching_zone.recommended_interventions else "Use protected pedestrian pathway"
            })

    safer_alternative = {
        "title": "Safer Pathway via Station Concourse Ramp",
        "description": "Detours through the signalized footway instead of the uncontrolled roadway crosswalk.",
        "walking_distance_m": 420,
        "additional_walk_min": 2,
        "risk_exposure": "Lower (Protected)",
        "friction_score_impact": "-12 points",
        "trade_off_summary": "Adds 2 minutes of walking time, but avoids the elevated vehicle-pedestrian conflict zone."
    }

    return {
        "overall_risk_exposure": overall_exposure if flagged_segments else "Low",
        "has_elevated_risk": len(flagged_segments) > 0,
        "flagged_segments_count": len(flagged_segments),
        "flagged_segments": flagged_segments,
        "safer_alternative_available": len(flagged_segments) > 0,
        "safer_alternative": safer_alternative if flagged_segments else None,
        "disclaimer": "Analytical risk indicator based on road-user interaction patterns — not an accident prediction."
    }

def run_cv_video_analysis(filename: str, duration_sec: float = 24.0) -> VideoAnalysisResult:
    """
    Modular Computer Vision Video Safety Pipeline Simulator.
    Conceptually executes: Video -> Detection -> Tracking -> Trajectories -> Conflicts -> Risk Indicators.
    """
    total_objs = 34
    peds = 12
    vehs = 16
    motos = 4
    bikes = 2
    trucks = 2
    conflicts = 4
    high_risks = 2

    key_events = [
        {
            "time_offset_sec": 4.2,
            "event_title": "Pedestrian Crosswalk Near-Miss Conflict",
            "time_to_collision_sec": 1.3,
            "post_encroachment_time_sec": 0.9,
            "actors": "Pedestrian ID #07 vs Express Bus ID #14",
            "severity": "ELEVATED",
            "indicator": "Minimum proximity 1.4m while bus approaching at 32 km/h"
        },
        {
            "time_offset_sec": 11.8,
            "event_title": "Sudden Deceleration at Bus Stop Bay",
            "time_to_collision_sec": 1.7,
            "post_encroachment_time_sec": 1.4,
            "actors": "Two-Wheeler ID #22 vs Pedestrian ID #11",
            "severity": "HIGH",
            "indicator": "Sudden braking deceleration (-4.2 m/s²) to avoid embarking passenger"
        },
        {
            "time_offset_sec": 18.5,
            "event_title": "Unprotected Mid-Block Jaywalk Trajectory",
            "time_to_collision_sec": 2.1,
            "post_encroachment_time_sec": 1.8,
            "actors": "Pedestrian ID #19 vs Commercial Sedan ID #03",
            "severity": "MODERATE",
            "indicator": "Trajectory crossing angle 82° with 2.1s clearance margin"
        }
    ]

    # Pre-calculated sample frames for drawing on canvas
    frame_samples = [
        {
            "frame_idx": 12,
            "timestamp_sec": 1.0,
            "objects": [
                {"id": 7, "class": "Person", "box": [0.35, 0.62, 0.05, 0.12], "vector": [0.01, -0.02], "speed": 4.5},
                {"id": 14, "class": "Bus", "box": [0.20, 0.40, 0.22, 0.25], "vector": [0.03, 0.00], "speed": 34.0},
                {"id": 3, "class": "Car", "box": [0.55, 0.48, 0.12, 0.14], "vector": [-0.02, 0.01], "speed": 42.0},
                {"id": 22, "class": "Motorcycle", "box": [0.72, 0.52, 0.06, 0.10], "vector": [-0.03, 0.00], "speed": 38.0}
            ]
        },
        {
            "frame_idx": 45,
            "timestamp_sec": 4.2,
            "conflict_active": True,
            "objects": [
                {"id": 7, "class": "Person", "box": [0.38, 0.55, 0.05, 0.12], "vector": [0.01, -0.01], "speed": 4.2, "conflict": True, "tag": "⚠️ TTC: 1.3s"},
                {"id": 14, "class": "Bus", "box": [0.32, 0.42, 0.22, 0.25], "vector": [0.02, 0.00], "speed": 28.0, "conflict": True, "tag": "Sudden Braking"},
                {"id": 3, "class": "Car", "box": [0.48, 0.49, 0.12, 0.14], "vector": [-0.02, 0.01], "speed": 39.0},
                {"id": 22, "class": "Motorcycle", "box": [0.65, 0.53, 0.06, 0.10], "vector": [-0.02, 0.00], "speed": 36.0}
            ]
        },
        {
            "frame_idx": 85,
            "timestamp_sec": 8.0,
            "objects": [
                {"id": 7, "class": "Person", "box": [0.42, 0.48, 0.05, 0.12], "vector": [0.01, -0.01], "speed": 4.8},
                {"id": 14, "class": "Bus", "box": [0.45, 0.44, 0.22, 0.25], "vector": [0.01, 0.00], "speed": 18.0},
                {"id": 11, "class": "Person", "box": [0.60, 0.65, 0.05, 0.11], "vector": [-0.01, -0.02], "speed": 3.8}
            ]
        }
    ]

    return VideoAnalysisResult(
        analysis_id=f"CV-{uuid.uuid4().hex[:8]}",
        source_name=filename,
        video_duration_seconds=duration_sec,
        total_objects_detected=total_objs,
        pedestrians_count=peds,
        vehicles_count=vehs,
        motorcycles_count=motos,
        bicycles_count=bikes,
        trucks_count=trucks,
        potential_conflict_events=conflicts,
        high_risk_interactions=high_risks,
        min_time_to_collision_sec=1.3,
        avg_post_encroachment_time_sec=1.37,
        sudden_braking_events=3,
        risk_indicator_rating="Elevated",
        primary_risk_driver="High pedestrian crossing exposure directly adjacent to active bus maneuvering envelope",
        key_conflict_events=key_events,
        frame_samples=frame_samples,
        recommended_mitigations=[
            "Designate physical physical curb extensions (bulb-outs) to shorten pedestrian crossing width",
            "Introduce dedicated bus bay taper markings to prevent trailing vehicle sudden-braking conflicts",
            "Relocate primary pedestrian desire line 25 meters away from bus entrance acceleration curve"
        ]
    )
