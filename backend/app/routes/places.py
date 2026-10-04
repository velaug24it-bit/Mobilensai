import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from app.places.models import (
    PlaceItem, 
    PlaceCategory, 
    DetourCalculationRequest, 
    DetourAnalysis, 
    AddToJourneyRequest, 
    RouteSearchRequest,
    CityAccessAuditResponse
)
from app.places.provider import places_provider

logger = logging.getLogger("mobilens.places.router")
router = APIRouter(prefix="/api/places", tags=["Mobility Nearby & Journey Essentials"])

@router.get("/categories", response_model=List[PlaceCategory])
async def get_categories():
    """Returns all supported mobility essentials categories with icons and metadata."""
    return await places_provider.get_categories()

@router.get("/nearby")
async def get_nearby_places(
    lat: float = Query(..., description="User or anchor latitude"),
    lng: float = Query(..., description="User or anchor longitude"),
    radius_meters: int = Query(3500, description="Search radius in meters"),
    category: Optional[str] = Query(None, description="Category filter id e.g. pharmacy, hospital, restaurant"),
    query: Optional[str] = Query(None, description="Natural language search term"),
    is_emergency: bool = Query(False, description="Emergency mode filter"),
    accessible_only: bool = Query(False, description="Filter for barrier-free/accessible places"),
    open_now_only: bool = Query(False, description="Filter places open now"),
    bus_eta_min: Optional[int] = Query(None, description="Current bus arrival ETA for 'I Have Time' calculation"),
    along_corridor: bool = Query(False, description="Search throughout entire journey corridor"),
    scope: Optional[str] = Query(None, description="Scope e.g. 'entire_journey' or specific waypoint"),
    limit: int = Query(50, description="Max results")
):
    """
    Finds context-aware nearby essential places near current location, 
    bus stop, or journey waypoint with estimated walking times and feasibility.
    """
    try:
        results = await places_provider.search_nearby(
            lat=lat,
            lng=lng,
            radius_meters=radius_meters,
            category=category,
            query=query,
            is_emergency=is_emergency,
            accessible_only=accessible_only,
            open_now_only=open_now_only,
            bus_eta_min=bus_eta_min,
            along_corridor=along_corridor,
            scope=scope,
            limit=limit
        )
        return {
            "status": "success",
            "count": len(results),
            "anchor": {"lat": lat, "lng": lng},
            "radius_meters": radius_meters,
            "data_source_mode": "DEMO_SIMULATION",
            "disclaimer": "Simulated places dataset for mobility intelligence testing. Not an emergency dispatch service.",
            "places": results
        }
    except Exception as e:
        logger.error(f"Error fetching nearby places: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_places(
    q: str = Query(..., description="Query e.g. 'I need medicine', 'food', 'petrol'"),
    lat: float = Query(8.7258),
    lng: float = Query(77.9850),
    radius_meters: int = Query(5000)
):
    """Natural-language search for mobility essentials."""
    results = await places_provider.search_nearby(
        lat=lat,
        lng=lng,
        radius_meters=radius_meters,
        query=q
    )
    return {
        "status": "success",
        "query": q,
        "count": len(results),
        "places": results
    }

@router.get("/details/{place_id}", response_model=PlaceItem)
async def get_place_details(place_id: str):
    """Retrieves full metadata for a specific place."""
    place = await places_provider.get_place_details(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place

@router.post("/route-search")
async def search_places_along_route(payload: RouteSearchRequest):
    """Searches for places along a multi-modal transit corridor."""
    results = await places_provider.search_along_route(
        route_points=payload.route_points,
        category=payload.categories[0] if payload.categories else None,
        max_corridor_deviation_m=payload.max_corridor_deviation_m
    )
    return {
        "status": "success",
        "count": len(results),
        "places": results
    }

@router.post("/detour-analysis", response_model=DetourAnalysis)
async def analyze_place_detour(req: DetourCalculationRequest):
    """
    Calculates exact detour impact: extra walking distance, added minutes, 
    mobility friction score change (+pts), and transfer risk buffer impact.
    """
    analysis = await places_provider.calculate_detour(
        place_id=req.place_id,
        current_lat=req.current_lat,
        current_lng=req.current_lng,
        destination_lat=req.destination_lat,
        destination_lng=req.destination_lng,
        bus_eta_minutes=req.bus_eta_minutes,
        base_friction=req.journey_friction_score or 48,
        base_duration_min=req.journey_duration_min or 45
    )
    return analysis

@router.post("/add-to-journey")
async def add_place_to_journey(req: AddToJourneyRequest):
    """
    Inserts place into active journey sequence, recalculates friction score,
    transfers, walking burden, and alerts if transfer buffer is compromised.
    """
    place = await places_provider.get_place_details(req.place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    # Generate synthetic journey segment update
    new_segment = {
        "id": f"seg-waypoint-{place.id}",
        "name": f"Waypoint Stop: {place.name}",
        "mode": "walking",
        "durationMinutes": place.walking_minutes or 5,
        "description": f"Essential stop at {place.category_label} ({place.address})",
        "frictionContribution": "moderate",
        "location": place.name,
        "stepFree": place.accessibility.step_free_entrance
    }

    return {
        "status": "success",
        "message": f"Added '{place.name}' to active journey route.",
        "added_place": place,
        "new_segment": new_segment,
        "recalculated_journey": {
            "additional_walking_minutes": (place.walking_minutes or 4) * 2,
            "additional_friction_pts": 7,
            "new_friction_score": 55,
            "transfer_risk_warning": "⚠️ Adding this stop decreases your train transfer buffer from 8m to 3m."
        }
    }

@router.get("/city-access-audit", response_model=CityAccessAuditResponse)
async def get_city_access_audit(zone_code: str = Query("ZONE-17")):
    """Essential-service accessibility audit for transit planners."""
    return await places_provider.audit_city_accessibility(zone_code=zone_code)
