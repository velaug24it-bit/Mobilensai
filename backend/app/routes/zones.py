from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.database import db_manager

router = APIRouter(prefix="/api", tags=["zones"])

@router.get("/zones")
async def list_zones(
    city: Optional[str] = Query(None, description="Filter zones by city name (e.g. Bengaluru, Chennai, Mumbai, Delhi)"),
    min_friction: Optional[int] = Query(None, description="Filter by minimum friction score")
) -> List[Dict[str, Any]]:
    col = db_manager.get_collection("zones")
    if col is not None:
        query = {}
        if city and city.lower() != "all":
            query["city"] = {"$regex": f"^{city}$", "$options": "i"}
        if min_friction is not None:
            query["frictionScore"] = {"$gte": min_friction}
        
        cursor = col.find(query, {"_id": 0})
        results = list(cursor)
        if results:
            return results

    # Fallback to local default zones if DB is offline
    from app.seed import zones_data
    if city and city.lower() != "all":
        return [z for z in zones_data if z.get("city", "").lower() == city.lower()]
    return zones_data

@router.get("/zones/{id}")
async def get_zone(id: str) -> Dict[str, Any]:
    col = db_manager.get_collection("zones")
    if col is not None:
        res = col.find_one({"$or": [{"id": id}, {"code": {"$regex": f"^{id}$", "$options": "i"}}]}, {"_id": 0})
        if res:
            return res

    from app.seed import zones_data
    for z in zones_data:
        if z["id"] == id or z["code"].lower() == id.lower():
            return z
    raise HTTPException(status_code=404, detail="Zone not found")

@router.post("/zones")
async def create_custom_zone(zone: Dict[str, Any]) -> Dict[str, Any]:
    col = db_manager.get_collection("zones")
    if col is not None:
        col.insert_one(zone)
        return {"status": "success", "message": "Custom real zone added to MongoDB Atlas", "zone": zone}
    return {"status": "saved_locally", "zone": zone}
