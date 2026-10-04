import os
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import db_manager
from app.routes import dashboard, journeys, zones, interventions, accessibility, ai, notifications, auth, reports, transit, risk, places
from app.transit.simulation_provider import transit_engine
from app.transit.road_risk_engine import DEFAULT_CONFLICTS

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("mobilens.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing MobiLens AI Backend Services...")
    await db_manager.connect()
    yield
    await db_manager.disconnect()
    logger.info("MobiLens AI Backend Shutting Down...")

app = FastAPI(
    title="MobiLens AI — API Service",
    description="Human-Centric Mobility Intelligence & Intervention Simulator Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(dashboard.router)
app.include_router(journeys.router)
app.include_router(zones.router)
app.include_router(interventions.router)
app.include_router(accessibility.router)
app.include_router(ai.router)
app.include_router(notifications.router)
app.include_router(transit.router)
app.include_router(transit.journey_router)
app.include_router(risk.router)
app.include_router(places.router)

@app.get("/")
async def root():
    return {
        "service": "MobiLens AI",
        "tagline": "See the journey beyond the vehicle.",
        "status": "operational",
        "simulationMode": True,
        "database": "connected" if db_manager.is_mongo_connected else "demo_mock_fallback",
        "docsUrl": "/docs"
    }

# WebSocket for live simulated mobility updates
@app.websocket("/ws/mobility")
async def websocket_mobility(websocket: WebSocket):
    await websocket.accept()
    logger.info("Client connected to /ws/mobility")
    try:
        while True:
            # Send live pulse event every 10 seconds
            await asyncio.sleep(10)
            await websocket.send_json({
                "type": "mobility_pulse",
                "focusZone": "ZONE 17",
                "frictionScore": 82,
                "activeIntervention": "Schedule Synchronization",
                "status": "Simulation Operational"
            })
    except WebSocketDisconnect:
        logger.info("Client disconnected from /ws/mobility")

# WebSocket for live transit vehicle updates
@app.websocket("/ws/transit")
async def websocket_transit(websocket: WebSocket):
    await websocket.accept()
    logger.info("Client connected to /ws/transit")
    try:
        while True:
            transit_engine.step_simulation()
            vehicles = transit_engine.get_vehicles()
            await websocket.send_json({
                "type": "vehicle_update",
                "timestamp": asyncio.get_event_loop().time(),
                "data_mode": "DEMO_SIMULATION",
                "vehicles": [v.model_dump() for v in vehicles]
            })
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        logger.info("Client disconnected from /ws/transit")
    except Exception as e:
        logger.error(f"Transit WebSocket error: {e}")

# WebSocket for live road safety & trajectory conflict events
@app.websocket("/ws/risk")
async def websocket_risk(websocket: WebSocket):
    await websocket.accept()
    logger.info("Client connected to /ws/risk")
    conf_idx = 0
    try:
        while True:
            await asyncio.sleep(8)
            conf = DEFAULT_CONFLICTS[conf_idx % len(DEFAULT_CONFLICTS)]
            conf_idx += 1
            await websocket.send_json({
                "type": "conflict_event",
                "data_mode": "DEMO_SIMULATION",
                "disclaimer": "Analytical indicator only — not an accident prediction",
                "conflict": conf.model_dump()
            })
    except WebSocketDisconnect:
        logger.info("Client disconnected from /ws/risk")
    except Exception as e:
        logger.error(f"Risk WebSocket error: {e}")

# WebSocket for live journey status stream
@app.websocket("/ws/journey")
async def websocket_journey(websocket: WebSocket):
    await websocket.accept()
    logger.info("Client connected to /ws/journey")
    try:
        while True:
            await asyncio.sleep(5)
            await websocket.send_json({
                "type": "journey_heartbeat",
                "data_mode": "DEMO_SIMULATION",
                "status": "ACTIVE_TRACKING",
                "current_stage": "BUS_EN_ROUTE",
                "bus_eta_minutes": 5,
                "friction_index": 72
            })
    except WebSocketDisconnect:
        logger.info("Client disconnected from /ws/journey")
    except Exception as e:
        logger.error(f"Journey WebSocket error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
