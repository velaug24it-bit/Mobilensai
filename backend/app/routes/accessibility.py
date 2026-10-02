from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["accessibility"])

PROFILES = [
    {
        "id": "prof-std",
        "name": "Standard Passenger",
        "persona": "Able-bodied commuter",
        "journeyMinutes": 42,
        "accessibilityFriction": 28,
        "walkingBurdenKm": 1.3,
        "alternativeRouteName": "Standard Route via Metro Platform 1",
        "alternativeMinutes": 42,
        "alternativeFriction": 28,
        "bottleneckReason": "Minor stairs congestion"
    },
    {
        "id": "prof-wheelchair",
        "name": "Wheelchair User",
        "persona": "Motorized wheelchair passenger",
        "journeyMinutes": 61,
        "accessibilityFriction": 72,
        "walkingBurdenKm": 2.4,
        "alternativeRouteName": "Accessible Route via Station C (Elevators)",
        "alternativeMinutes": 49,
        "alternativeFriction": 41,
        "bottleneckReason": "Station B has no step-free connection or working elevator. Forced 800m detour to surface level."
    }
]

@router.get("/accessibility")
async def get_accessibility_profiles() -> List[Dict[str, Any]]:
    return PROFILES

@router.post("/accessibility/analyze")
async def analyze_accessibility(payload: Dict[str, Any]) -> Dict[str, Any]:
    prof_id = payload.get("profileId", "prof-wheelchair")
    for p in PROFILES:
        if p["id"] == prof_id:
            return p
    return PROFILES[0]
