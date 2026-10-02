from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.ai.friction_model import calculate_friction_model
from app.database import db_manager
import time

router = APIRouter(prefix="/api", tags=["journeys"])

@router.get("/journeys")
async def list_journeys() -> List[Dict[str, Any]]:
    col = db_manager.get_collection("journeys")
    if col is not None:
        cursor = col.find({}, {"_id": 0}).sort("createdAt", -1).limit(50)
        results = list(cursor)
        if results:
            return results

    # Default fallback
    return [{
        "id": "J-DEMO-2026",
        "title": "Morning College Commute",
        "origin": "Greenwood Heights (Home)",
        "destination": "City Technology Institute",
        "totalDurationMinutes": 90,
        "waitingDurationMinutes": 19,
        "frictionScore": 78,
        "frictionLevel": "HIGH"
    }]

@router.get("/journeys/{id}")
async def get_journey(id: str) -> Dict[str, Any]:
    col = db_manager.get_collection("journeys")
    if col is not None:
        res = col.find_one({"id": id}, {"_id": 0})
        if res:
            return res

    raise HTTPException(status_code=404, detail="Journey not found")

@router.post("/journey/analyze")
async def analyze_journey(payload: Dict[str, Any]) -> Dict[str, Any]:
    segments = payload.get("segments", [])
    result = calculate_friction_model(segments)
    return result

@router.post("/journey/save")
async def save_journey(journey: Dict[str, Any]) -> Dict[str, Any]:
    col = db_manager.get_collection("journeys")
    if "createdAt" not in journey:
        journey["createdAt"] = int(time.time())
    
    if col is not None:
        # Avoid duplicate id
        col.update_one({"id": journey.get("id")}, {"$set": journey}, upsert=True)
        return {"status": "success", "message": "Journey saved in MongoDB Atlas", "journeyId": journey.get("id")}
    return {"status": "saved_locally", "journeyId": journey.get("id")}
