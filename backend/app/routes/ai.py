from fastapi import APIRouter
from typing import Dict, Any
from app.schemas import AIChatRequest, AIChatResponse

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(req: AIChatRequest) -> AIChatResponse:
    text = req.message.lower()

    if "zone 17" in text or "sector 17" in text:
        reply = (
            "Zone 17 exhibits high simulated friction (Score 82) predominantly due to transfer waiting (28% of total burden). "
            "Bus #42 arrives at 08:20 AM and Suburban Train departs at 08:25 AM, making the 7-minute walking transfer impossible. "
            "Our AI recommendation is Option 4: Schedule Synchronization, which drops friction to 46."
        )
    elif "difficult" in text or "bottleneck" in text or "time" in text:
        reply = (
            "Your primary mobility bottleneck is the 19-minute transfer wait between City Bus #42 and the Suburban Train at Central Interchange. "
            "Expected wait is only 5 minutes, resulting in an excess delay burden of 14 minutes."
        )
    elif "intervention" in text or "recommend" in text:
        reply = (
            "The top-ranked intervention is Schedule Synchronization (Low complexity, -43% friction reduction, 15 min saved, 4,210 daily riders benefitted)."
        )
    elif "bus frequency" in text:
        reply = (
            "Doubling bus frequency reduces random headway wait from 19m to ~10m, but without timetable synchronization, transfer misses still occur."
        )
    elif "accessibility" in text or "wheelchair" in text:
        reply = (
            "Wheelchair passengers suffer 72 friction vs 28 for able-bodied commuters due to broken step-free links at Station B. Rerouting via Station C drops friction to 41."
        )
    else:
        reply = (
            "MobiLens AI reconstructs multi-modal human journeys, decomposes waiting/transfer burdens, and tests simulation interventions in real time."
        )

    return AIChatResponse(reply=reply, source="local_prototype_ai", confidence=0.95)

@router.post("/analyze-journey")
async def ai_analyze_journey(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "status": "success",
        "primaryBottleneck": "19-minute transfer wait at Central Transit Point",
        "excessDelayMin": 14,
        "recommendedAction": "Synchronize feeder bus arrival window with suburban rail departure"
    }

@router.post("/find-bottleneck")
async def ai_find_bottleneck(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "bottleneckLocation": "Central Interchange Platform 3",
        "excessWait": 14,
        "burdenPercentage": 28,
        "urgency": "High"
    }

@router.post("/recommend-intervention")
async def ai_recommend_intervention(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "recommendedIntervention": "Schedule Synchronization",
        "expectedFrictionReduction": "43%",
        "implementationComplexity": "Low"
    }
