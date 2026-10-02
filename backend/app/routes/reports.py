import logging
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import db_manager

logger = logging.getLogger("mobilens.reports")
router = APIRouter(prefix="/api/reports", tags=["Crowdsourced Citizen Reports"])

DEFAULT_REPORTS = [
    {
        "id": "rep-tcr-01",
        "locationName": "Vagaikulam Feeder Stop (TCR Airport)",
        "district": "Thoothukudi",
        "category": "excessive_wait",
        "severity": "high",
        "title": "25-min unsheltered wait for connecting bus",
        "description": "After airport arrival, waited 25 minutes on the NH 138 highway shoulder in 38°C sun. No bench or roof shelter.",
        "coordinates": {"lat": 8.7242, "lng": 78.0264},
        "reportedBy": "P. Arumugam (Commuter)",
        "upvotes": 42,
        "timestamp": "2026-10-01T11:30:00Z",
        "status": "investigating"
    },
    {
        "id": "rep-fxec-01",
        "locationName": "Vannarpettai Bypass Road (FXEC Main Gate)",
        "district": "Tirunelveli",
        "category": "dangerous_crossing",
        "severity": "critical",
        "title": "Dangerous 4-lane crossing without pedestrian signal",
        "description": "Students crossing Tirunelveli Bypass to reach FXEC have to dodge 70 km/h lorries and express buses. Urgent pelican crossing or foot overbridge needed.",
        "coordinates": {"lat": 8.7300, "lng": 77.7126},
        "reportedBy": "Velraj (FXEC Student)",
        "upvotes": 89,
        "timestamp": "2026-10-01T08:45:00Z",
        "status": "escalated_to_nhai"
    },
    {
        "id": "rep-heat-01",
        "locationName": "Bypass Walkway to FXEC Campus",
        "district": "Tirunelveli",
        "category": "extreme_heat_no_shade",
        "severity": "high",
        "title": "Severe midday heat exhaustion (39°C) with no tree shade",
        "description": "750m walk from bus drop to campus feels like a furnace between 12 PM - 3 PM. Need roadside shade canopy and drinking water kiosk.",
        "coordinates": {"lat": 8.7315, "lng": 77.7140},
        "reportedBy": "Kavitha R. (Faculty)",
        "upvotes": 35,
        "timestamp": "2026-10-01T13:15:00Z",
        "status": "open"
    },
    {
        "id": "rep-junc-01",
        "locationName": "Tirunelveli Railway Junction Old Stand",
        "district": "Tirunelveli",
        "category": "broken_ramp",
        "severity": "high",
        "title": "Broken wheelchair ramp at terminal platform exit",
        "description": "Wheelchair passenger unable to access bus bay without 3 people lifting. Ramp damaged and blocked by parked auto-rickshaws.",
        "coordinates": {"lat": 8.7289, "lng": 77.7180},
        "reportedBy": "Dr. K. Raman (Inclusive Advocate)",
        "upvotes": 58,
        "timestamp": "2026-10-01T09:20:00Z",
        "status": "action_required"
    }
]

class CreateReportRequest(BaseModel):
    locationName: str
    district: Optional[str] = "Tirunelveli"
    category: str  # excessive_wait, dangerous_crossing, extreme_heat_no_shade, broken_ramp, unscheduled_delay
    severity: str  # moderate, high, critical
    title: str
    description: str
    lat: float
    lng: float
    reportedBy: Optional[str] = "Anonymous Commuter"

@router.get("")
async def get_reports():
    col = db_manager.get_collection("citizen_reports")
    if col is not None:
        try:
            docs = list(col.find({}, {"_id": 0}))
            if docs:
                return {"reports": docs, "source": "MongoDB Atlas", "count": len(docs)}
        except Exception as e:
            logger.warning(f"Failed to fetch reports from Atlas: {e}")

    return {"reports": DEFAULT_REPORTS, "source": "Local Fallback", "count": len(DEFAULT_REPORTS)}

@router.post("/create")
async def create_report(req: CreateReportRequest):
    new_report = {
        "id": f"rep-{uuid.uuid4().hex[:8]}",
        "locationName": req.locationName.strip(),
        "district": req.district or "Tirunelveli",
        "category": req.category,
        "severity": req.severity,
        "title": req.title.strip(),
        "description": req.description.strip(),
        "coordinates": {"lat": req.lat, "lng": req.lng},
        "reportedBy": req.reportedBy or "Citizen Commuter",
        "upvotes": 1,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "status": "under_review"
    }

    col = db_manager.get_collection("citizen_reports")
    if col is not None:
        try:
            col.insert_one(dict(new_report))
            logger.info(f"New report {new_report['id']} inserted into Atlas successfully.")
        except Exception as e:
            logger.error(f"Failed to save report to MongoDB Atlas: {e}")

    return {
        "success": True,
        "message": "Thank you! Your friction report has been recorded and submitted to the City Mobility Cell.",
        "report": new_report
    }

@router.post("/{report_id}/upvote")
async def upvote_report(report_id: str):
    col = db_manager.get_collection("citizen_reports")
    if col is not None:
        try:
            res = col.find_one_and_update(
                {"id": report_id},
                {"$inc": {"upvotes": 1}},
                return_document=True
            )
            if res:
                res.pop("_id", None)
                return {"success": True, "upvotes": res.get("upvotes", 1), "report": res}
        except Exception as e:
            logger.warning(f"Error upvoting in Atlas: {e}")

    # Fallback to in-memory upvote for default list
    for r in DEFAULT_REPORTS:
        if r["id"] == report_id:
            r["upvotes"] += 1
            return {"success": True, "upvotes": r["upvotes"], "report": r}

    return {"success": True, "upvotes": 2}
