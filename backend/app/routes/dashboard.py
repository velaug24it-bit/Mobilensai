from fastapi import APIRouter
from typing import Dict, Any
from app.database import db_manager

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/dashboard")
async def get_dashboard_data() -> Dict[str, Any]:
    metrics_col = db_manager.get_collection("system_metrics")
    zones_col = db_manager.get_collection("zones")
    journeys_col = db_manager.get_collection("journeys")

    kpis = {
        "peopleAnalyzed": 18420,
        "journeysAnalyzed": 42816,
        "averageJourneyMin": 51,
        "averageFriction": 63,
        "highFrictionZones": 8,
        "interventionsSimulated": 1248,
    }

    if metrics_col is not None:
        db_metrics = metrics_col.find_one({"id": "global_kpis"}, {"_id": 0})
        if db_metrics:
            kpis["peopleAnalyzed"] = db_metrics.get("peopleAnalyzed", 18420)
            kpis["journeysAnalyzed"] = db_metrics.get("journeysAnalyzed", 42816)
            kpis["averageFriction"] = db_metrics.get("averageFriction", 63)

    if zones_col is not None:
        high_zones_count = zones_col.count_documents({"frictionScore": {"$gte": 70}})
        if high_zones_count > 0:
            kpis["highFrictionZones"] = high_zones_count

    if journeys_col is not None:
        total_custom_journeys = journeys_col.count_documents({})
        kpis["journeysAnalyzed"] += total_custom_journeys

    return {
        "kpis": kpis,
        "systemStatus": "Live MongoDB Atlas Operational" if db_manager.is_mongo_connected else "Simulation Operational",
        "simulationMode": not db_manager.is_mongo_connected,
        "connectedDatabase": db_manager.db_name if db_manager.is_mongo_connected else "in_memory_demo",
        "dataNote": "Connected to MongoDB Atlas live cluster" if db_manager.is_mongo_connected else "Prototype simulation data"
    }

@router.get("/analytics")
async def get_analytics_data() -> Dict[str, Any]:
    return {
        "hourlyFriction": [
            {"hour": "06:00", "friction": 38, "waitingMin": 6},
            {"hour": "07:00", "friction": 54, "waitingMin": 11},
            {"hour": "08:00", "friction": 79, "waitingMin": 19},
            {"hour": "09:00", "friction": 82, "waitingMin": 21},
            {"hour": "10:00", "friction": 68, "waitingMin": 14},
            {"hour": "11:00", "friction": 52, "waitingMin": 9},
            {"hour": "12:00", "friction": 48, "waitingMin": 8},
            {"hour": "13:00", "friction": 46, "waitingMin": 7},
            {"hour": "14:00", "friction": 50, "waitingMin": 8},
            {"hour": "15:00", "friction": 57, "waitingMin": 10},
            {"hour": "16:00", "friction": 64, "waitingMin": 13},
            {"hour": "17:00", "friction": 76, "waitingMin": 18},
            {"hour": "18:00", "friction": 81, "waitingMin": 20},
            {"hour": "19:00", "friction": 73, "waitingMin": 16},
            {"hour": "20:00", "friction": 58, "waitingMin": 11},
            {"hour": "21:00", "friction": 42, "waitingMin": 7}
        ],
        "topProblems": [
            {"title": "Transfer Waiting", "percentage": 34, "zone": "Zone 17"},
            {"title": "Last-Mile Gaps", "percentage": 27, "zone": "Zone 07"},
            {"title": "Poor Schedule Synchronization", "percentage": 19, "zone": "Zone 17"},
            {"title": "Walking Burden", "percentage": 12, "zone": "Zone 04"},
            {"title": "Accessibility Gaps", "percentage": 8, "zone": "Zone 07"}
        ]
    }
