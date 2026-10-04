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
    elif "pharmacy" in text or "medicine" in text or "chemist" in text:
        if "accessible" in text or "wheelchair" in text:
            reply = (
                "[Simulated Demo Locations] Found 2 accessible pharmacies along your corridor: "
                "1. Apollo Pharmacy at Vagaikulam NH Junction (180m away, step-free wide double doors, 24/7). "
                "2. Thulasi Pharmacy at Vannarpettai Bypass (near FXEC, ramped entrance, 24/7). Both offer verified barrier-free access."
            )
        elif "before my bus" in text or "visit" in text or "time" in text:
            reply = (
                "[Simulated Demo Locations] With your bus expected in ~12 minutes, visiting Apollo Pharmacy (180m away) takes ~3m walk + 5m visit + 3m return (total 11m). "
                "Verdict: 🟢 Likely feasible, but maintain a tight buffer. We do not guarantee timing."
            )
        else:
            reply = (
                "[Simulated Demo Locations] Nearest pharmacy is Apollo Pharmacy — Vagaikulam NH Junction (180m, ~2 min walk, Open 24/7, Phone: +91 462 258 4401). "
                "Alternative: MedPlus Chemist (320m, Open until 11 PM)."
            )
    elif "petrol" in text or "fuel" in text or "gas" in text:
        reply = (
            "[Simulated Demo Locations] Nearest fuel station: Indian Oil Petrol Bunk & Restroom at NH 138 Mile 12, Vagaikulam (450m, 24/7 service, air, restrooms, and 60kW Tata Power DC EV charging bay)."
        )
    elif "food" in text or "restaurant" in text or "eat" in text:
        if "least detour" in text or "detour" in text:
            reply = (
                "[Simulated Demo Locations] Lowest-detour option is Hotel Saravana Bhavan Highway Eatery (250m from Vagaikulam Feeder Stop, extra walk: 180m, detour time: ~6 min, mobility impact: +4 friction pts). "
                "Alternative: FX Canteen directly inside campus North Gate (+0 min detour)."
            )
        else:
            reply = (
                "[Simulated Demo Locations] Food along your journey: "
                "1. Hotel Saravana Bhavan (Vagaikulam Bus Bay, 250m, South Indian tiffin & meals). "
                "2. Madras Coffee House (Airport Blvd, 320m, filter coffee & bakery). "
                "3. FX Canteen (at your destination, student meals & juices)."
            )
    elif "hospital" in text or "emergency" in text or "clinic" in text:
        reply = (
            "[Simulated Demo Locations] 🚨 Emergency Services Near Destination / Corridor: "
            "1. Galaxy Hospital Multispeciality (104 South Bypass Rd, Vannarpettai — 450m from FXEC gate, 24/7 Trauma, ICU). "
            "2. Tirunelveli Medical College Hospital (Palayamkottai, 24/7 Tertiary care). "
            "Note: MobiLens is not an emergency dispatch system. For immediate life-safety emergencies, dial 108 or local emergency services."
        )
    elif "essential" in text or "nearby" in text or "route" in text:
        reply = (
            "[Simulated Demo Locations] Essential services active on your Vagaikulam ➔ FXEC corridor: "
            "🏥 Hospital: Galaxy Hospital (450m from campus) | 💊 Pharmacy: Apollo (180m from bus stop) | "
            "🚻 Restroom: TNSTC Municipal Bay | 🏧 ATM: SBI 24/7 | ⛽ Fuel/EV: Indian Oil + 60kW DC Fast Charger."
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
