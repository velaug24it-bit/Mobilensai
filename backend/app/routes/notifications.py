from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["notifications"])

NOTIFS = [
    {
        "id": "notif-1",
        "type": "alert",
        "title": "High Friction Alert — Zone 17",
        "message": "Zone 17 exceeded friction threshold (Score 82). Primary trigger: Transfer wait times.",
        "timestamp": "10m ago",
        "read": False,
        "zoneId": "zone-17"
    },
    {
        "id": "notif-2",
        "type": "insight",
        "title": "AI Optimization Identified",
        "message": "Schedule synchronization could reduce simulated transfer friction by 43% in Sector 17.",
        "timestamp": "25m ago",
        "read": False
    },
    {
        "id": "notif-3",
        "type": "journey",
        "title": "Journey Burden Detected",
        "message": "Your current commute route has a 19-minute waiting segment at Central Interchange.",
        "timestamp": "1h ago",
        "read": True
    }
]

@router.get("/notifications")
async def list_notifications() -> List[Dict[str, Any]]:
    return NOTIFS
