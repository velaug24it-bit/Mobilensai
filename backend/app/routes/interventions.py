from fastapi import APIRouter
from typing import List, Dict, Any
from app.simulation.intervention_engine import simulate_intervention, simulate_what_if_scenario

router = APIRouter(prefix="/api", tags=["interventions"])

INTERVENTIONS_LIST = [
    {
        "id": "int-sync",
        "title": "Schedule Synchronization",
        "type": "sync",
        "description": "Retime Bus #42 arrival window by 6 minutes to guarantee seamless 5-min train connection.",
        "estimatedComplexity": "Low",
        "estimatedCost": "Low",
        "simulatedFrictionReductionPct": 43,
        "simulatedTimeReductionMin": 15,
        "affectedPopulationDaily": 4210,
        "implementationCategory": "Timetable Optimization & Signaling",
        "afterFrictionScore": 46,
        "afterDurationMinutes": 53,
        "afterWaitingMinutes": 4,
        "afterTransfers": 2,
        "isRecommended": True,
        "aiRecommendationSummary": "Schedule synchronization provides the highest simulated mobility friction reduction (-43%) among tested interventions while requiring zero capital civil works."
    },
    {
        "id": "int-feeder",
        "title": "Electric Micro-Feeder Shuttles",
        "type": "feeder",
        "description": "Deploy 6 high-frequency on-demand mini-feeders between Greenwood and Central Hub.",
        "estimatedComplexity": "Medium",
        "estimatedCost": "Medium",
        "simulatedFrictionReductionPct": 31,
        "simulatedTimeReductionMin": 10,
        "affectedPopulationDaily": 3180,
        "implementationCategory": "Fleet Allocation & Last-Mile",
        "afterFrictionScore": 54,
        "afterDurationMinutes": 58,
        "afterWaitingMinutes": 6,
        "afterTransfers": 2,
        "aiRecommendationSummary": "Significantly cuts first-mile walking and waiting with medium operational budget."
    },
    {
        "id": "int-bus",
        "title": "Additional Bus Fleet Frequency",
        "type": "bus",
        "description": "Double bus headway during peak 07:30 - 09:30 AM hours from 20 mins to 10 mins.",
        "estimatedComplexity": "High",
        "estimatedCost": "High",
        "simulatedFrictionReductionPct": 18,
        "simulatedTimeReductionMin": 7,
        "affectedPopulationDaily": 2900,
        "implementationCategory": "Capital Expenditure & Crew",
        "afterFrictionScore": 64,
        "afterDurationMinutes": 61,
        "afterWaitingMinutes": 9,
        "afterTransfers": 2,
        "aiRecommendationSummary": "Improves general headway but does not fix the specific train connection miss."
    }
]

@router.get("/interventions")
async def list_interventions() -> List[Dict[str, Any]]:
    return INTERVENTIONS_LIST

@router.post("/intervention/simulate")
async def run_intervention_simulation(payload: Dict[str, Any]) -> Dict[str, Any]:
    int_id = payload.get("interventionId", "int-sync")
    base_f = payload.get("baselineFriction", 78)
    base_d = payload.get("baselineDuration", 90)
    base_w = payload.get("baselineWait", 19)
    return simulate_intervention(int_id, base_f, base_d, base_w)

@router.post("/simulation/run")
async def run_parametric_simulation(payload: Dict[str, Any]) -> Dict[str, Any]:
    params = payload.get("params", {})
    return simulate_what_if_scenario(params)
