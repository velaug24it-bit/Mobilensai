import logging
import os
import shutil
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from app.transit.road_risk_engine import (
    DEFAULT_RISK_ZONES,
    DEFAULT_CONFLICTS,
    RiskZone,
    ConflictEvent,
    VideoAnalysisResult,
    analyze_journey_risk_exposure,
    run_cv_video_analysis
)

logger = logging.getLogger("mobilens.risk")
router = APIRouter(prefix="/api/risk", tags=["Road Safety & Mobility Risk Engine"])

class JourneyRiskRequest(BaseModel):
    segments: List[Dict[str, Any]]
    user_mode: Optional[str] = "walking"

class VideoAnalyzeRequest(BaseModel):
    scenario_preset: Optional[str] = "junction_crossing"
    video_url: Optional[str] = None

@router.get("/zones")
async def get_risk_zones():
    return {
        "status": "success",
        "data_mode": "DEMO_SIMULATION",
        "disclaimer": "Demo / Simulated Data — analytical road safety risk indicators",
        "count": len(DEFAULT_RISK_ZONES),
        "zones": DEFAULT_RISK_ZONES
    }

@router.get("/zones/{zone_id}")
async def get_risk_zone_detail(zone_id: str):
    for z in DEFAULT_RISK_ZONES:
        if z.id.lower() == zone_id.lower() or z.code.lower() == zone_id.lower() or zone_id.lower() in z.id.lower():
            return {
                "status": "success",
                "zone": z
            }
    raise HTTPException(status_code=404, detail="Risk zone not found")

@router.get("/conflicts")
async def get_recent_conflicts():
    return {
        "status": "success",
        "count": len(DEFAULT_CONFLICTS),
        "conflicts": DEFAULT_CONFLICTS,
        "disclaimer": "Analytical indicators of near-miss/conflict events (TTC/PET) — not accident predictions."
    }

@router.post("/analyze")
async def post_analyze_journey_risk(req: JourneyRiskRequest):
    result = analyze_journey_risk_exposure(req.segments)
    return {
        "status": "success",
        "data_mode": "DEMO_SIMULATION",
        "result": result
    }

@router.post("/video")
async def analyze_traffic_video(
    file: Optional[UploadFile] = File(None),
    preset: Optional[str] = Form("junction_crossing")
):
    """
    Accepts an uploaded video file or runs analysis on a built-in demo scenario clip.
    Modular computer vision pipeline: Video -> Detection -> Tracking -> Conflicts -> Risk Indicators.
    """
    filename = "junction_traffic_feed.mp4"
    if file and file.filename:
        filename = file.filename
        # Safe validate file size / extension
        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".mp4", ".mov", ".avi", ".webm", ".mkv"]:
            raise HTTPException(status_code=400, detail="Video analysis requires supported format (.mp4, .webm, .mov)")
        logger.info(f"Received user uploaded road video: {filename} for CV risk processing.")
    elif preset:
        filename = f"simulated_{preset}.mp4"

    analysis_res = run_cv_video_analysis(filename)
    return {
        "status": "success",
        "data_mode": "PROTOTYPE_ANALYSIS",
        "disclaimer": "Prototype / Demo Analysis — analytical indicators only. Not an accident prediction.",
        "analysis": analysis_res
    }
