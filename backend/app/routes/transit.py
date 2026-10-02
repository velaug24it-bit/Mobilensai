import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.transit.simulation_provider import transit_engine
from app.transit.risk_engine import evaluate_catchability, evaluate_transfer_risk

logger = logging.getLogger("mobilens.transit")
router = APIRouter(prefix="/api/transit", tags=["Live Transit & Bus Tracking"])

# Additional journey router endpoints mounted under /api/journey
journey_router = APIRouter(prefix="/api/journey", tags=["Live Journey Intelligence"])

class CatchabilityRequest(BaseModel):
    user_lat: float
    user_lng: float
    stop_lat: float
    stop_lng: float
    bus_eta_min: int
    user_mode: Optional[str] = "walking"
    weather_multiplier: Optional[float] = 1.0

class TransferRiskRequest(BaseModel):
    first_leg_eta_min: int
    transfer_walk_min: int = 5
    connection_departure_min: int = 15
    bus_delay_min: int = 0

class DelaySimulationRequest(BaseModel):
    vehicle_id: str
    delay_minutes: int

class RecalculateRequest(BaseModel):
    current_bus_id: str
    current_delay_min: int
    destination: str

@router.get("/routes")
async def get_routes():
    routes = transit_engine.get_routes()
    return {
        "status": "success",
        "data_mode": "DEMO_SIMULATION",
        "disclaimer": "Simulated live transit feed — prototype demonstration",
        "count": len(routes),
        "routes": routes
    }

@router.get("/routes/{route_id}")
async def get_route(route_id: str):
    route = transit_engine.get_route(route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return {"status": "success", "route": route}

@router.get("/stops")
async def get_stops():
    stops = transit_engine.get_stops()
    return {
        "status": "success",
        "data_mode": "DEMO_SIMULATION",
        "count": len(stops),
        "stops": stops
    }

@router.get("/stops/{stop_id}")
async def get_stop(stop_id: str):
    stop = transit_engine.get_stop(stop_id)
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    return {"status": "success", "stop": stop}

@router.get("/vehicles")
async def get_vehicles():
    # Advance simulated position slightly on query
    transit_engine.step_simulation()
    vehicles = transit_engine.get_vehicles()
    return {
        "status": "success",
        "data_mode": "DEMO_SIMULATION",
        "disclaimer": "Simulated live vehicle positions",
        "count": len(vehicles),
        "vehicles": vehicles
    }

@router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    v = transit_engine.get_vehicle_position(vehicle_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"status": "success", "vehicle": v}

@router.get("/vehicle-positions")
async def get_vehicle_positions():
    transit_engine.step_simulation()
    positions = transit_engine.get_vehicle_positions()
    return {
        "status": "success",
        "data_mode": "DEMO_SIMULATION",
        "count": len(positions),
        "positions": positions
    }

@router.get("/trip-updates")
async def get_trip_updates():
    updates = transit_engine.get_trip_updates()
    return {
        "status": "success",
        "data_mode": "DEMO_SIMULATION",
        "count": len(updates),
        "trip_updates": updates
    }

@router.get("/arrivals/{stop_id}")
async def get_arrivals(stop_id: str):
    arrivals = transit_engine.get_arrivals(stop_id)
    return {
        "status": "success",
        "data_mode": "DEMO_SIMULATION",
        "stop_id": stop_id,
        "count": len(arrivals),
        "arrivals": arrivals
    }


@router.get("/live")
async def get_live_bundle():
    """Consolidated state bundle for the live transit map in 1 efficient HTTP roundtrip"""
    transit_engine.step_simulation()
    vehicles = transit_engine.get_vehicles()
    routes = transit_engine.get_routes()
    stops = transit_engine.get_stops()
    return {
        "status": "success",
        "data_mode": "DEMO_SIMULATION",
        "vehicles": vehicles,
        "routes": routes,
        "stops": stops
    }

@router.post("/simulate-delay")
async def simulate_delay(req: DelaySimulationRequest):
    transit_engine.set_vehicle_delay(req.vehicle_id, req.delay_minutes)
    updated = transit_engine.get_vehicle_position(req.vehicle_id)
    return {
        "status": "success",
        "message": f"Simulated delay of +{req.delay_minutes} minutes applied to vehicle {req.vehicle_id}.",
        "vehicle": updated
    }

@router.post("/reset-demo")
async def reset_demo():
    for v in transit_engine._vehicles.values():
        v.delay_minutes = 0
        v.crowding_level = "Moderate"
    return {"status": "success", "message": "Demo transit simulation reset to baseline."}

# Journey Live & Risk Endpoints
@journey_router.post("/catchability")
async def post_catchability(req: CatchabilityRequest):
    result = evaluate_catchability(
        user_lat=req.user_lat,
        user_lng=req.user_lng,
        stop_lat=req.stop_lat,
        stop_lng=req.stop_lng,
        bus_eta_min=req.bus_eta_min,
        user_mode=req.user_mode or "walking",
        weather_multiplier=req.weather_multiplier or 1.0
    )
    return {"status": "success", "data_mode": "DEMO_SIMULATION", "result": result}

@journey_router.post("/transfer-risk")
async def post_transfer_risk(req: TransferRiskRequest):
    result = evaluate_transfer_risk(
        first_leg_eta_min=req.first_leg_eta_min,
        transfer_walk_min=req.transfer_walk_min,
        connection_departure_min=req.connection_departure_min,
        bus_delay_min=req.bus_delay_min
    )
    return {"status": "success", "data_mode": "DEMO_SIMULATION", "result": result}

@journey_router.post("/recalculate")
async def post_recalculate(req: RecalculateRequest):
    # Generates 4 alternative options with recalculated friction scores
    risk_eval = evaluate_transfer_risk(
        first_leg_eta_min=6,
        transfer_walk_min=5,
        connection_departure_min=12,
        bus_delay_min=req.current_delay_min
    )
    return {
        "status": "success",
        "data_mode": "DEMO_SIMULATION",
        "current_delay": req.current_delay_min,
        "is_disrupted": req.current_delay_min >= 4,
        "friction_change": {
            "before_delay": 38,
            "after_delay": 38 + req.current_delay_min * 3,
            "penalty_breakdown": {
                "waiting_burden": f"+{req.current_delay_min * 2}",
                "transfer_risk_penalty": "+7" if req.current_delay_min >= 4 else "+0",
                "journey_duration_penalty": f"+{req.current_delay_min}"
            }
        },
        "recovery_alternatives": risk_eval.alternatives
    }
