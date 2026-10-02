from typing import Dict, Any, List

def simulate_intervention(intervention_id: str, baseline_friction: int = 78, baseline_duration: int = 90, baseline_wait: int = 19):
    options = {
        "int-sync": {
            "title": "Schedule Synchronization",
            "type": "sync",
            "frictionReductionPct": 43,
            "timeReductionMin": 15,
            "waitReductionMin": 15,
            "complexity": "Low",
            "cost": "Low",
            "affected": 4210,
            "afterFriction": 46,
            "afterDuration": 53,
            "afterWait": 4,
            "afterTransfers": 2,
            "category": "Timetable Optimization & Signaling",
            "recommendation": "Optimal choice: Highest friction reduction (-43%) at low complexity."
        },
        "int-feeder": {
            "title": "Electric Micro-Feeder Shuttles",
            "type": "feeder",
            "frictionReductionPct": 31,
            "timeReductionMin": 10,
            "waitReductionMin": 13,
            "complexity": "Medium",
            "cost": "Medium",
            "affected": 3180,
            "afterFriction": 54,
            "afterDuration": 58,
            "afterWait": 6,
            "afterTransfers": 2,
            "category": "Fleet Allocation & Last-Mile",
            "recommendation": "Reduces first-mile walking strain and provides on-demand connections."
        },
        "int-bus": {
            "title": "Additional Bus Fleet Frequency",
            "type": "bus",
            "frictionReductionPct": 18,
            "timeReductionMin": 7,
            "waitReductionMin": 10,
            "complexity": "High",
            "cost": "High",
            "affected": 2900,
            "afterFriction": 64,
            "afterDuration": 61,
            "afterWait": 9,
            "afterTransfers": 2,
            "category": "Capital Expenditure & Crew",
            "recommendation": "Reduces general headway, but does not synchronize with train timetables."
        },
        "int-relocate": {
            "title": "Relocate Bus Stop to Rail Concourse",
            "type": "relocate",
            "frictionReductionPct": 12,
            "timeReductionMin": 4,
            "waitReductionMin": 5,
            "complexity": "Low",
            "cost": "Low",
            "affected": 1500,
            "afterFriction": 68,
            "afterDuration": 64,
            "afterWait": 14,
            "afterTransfers": 2,
            "category": "Station Infrastructure Adjustment",
            "recommendation": "Reduces pedestrian walk transfer by 180 meters."
        },
        "int-pedestrian": {
            "title": "Direct Covered Walkway & Ramp",
            "type": "pedestrian",
            "frictionReductionPct": 24,
            "timeReductionMin": 6,
            "waitReductionMin": 8,
            "complexity": "Medium",
            "cost": "Medium",
            "affected": 3800,
            "afterFriction": 59,
            "afterDuration": 62,
            "afterWait": 11,
            "afterTransfers": 2,
            "category": "Accessible Urban Architecture",
            "recommendation": "Resolves vertical staircase barriers for elderly and wheelchair users."
        }
    }

    selected = options.get(intervention_id, options["int-sync"])
    return {
        "interventionId": intervention_id,
        "details": selected,
        "baseline": {
            "friction": baseline_friction,
            "duration": baseline_duration,
            "wait": baseline_wait
        },
        "simulated": {
            "friction": selected["afterFriction"],
            "duration": selected["afterDuration"],
            "wait": selected["afterWait"],
            "transfers": selected["afterTransfers"]
        },
        "delta": {
            "frictionSaved": baseline_friction - selected["afterFriction"],
            "timeSavedMin": baseline_duration - selected["afterDuration"],
            "waitSavedMin": baseline_wait - selected["afterWait"]
        }
    }

def simulate_what_if_scenario(params: Dict[str, Any], baseline_friction: int = 78, baseline_duration: int = 61, baseline_wait: int = 19):
    bus_freq = params.get("busFrequencyPerHour", 4)
    sync_pct = params.get("scheduleSyncPct", 15)
    feeder_pct = params.get("feederAvailabilityPct", 20)
    access_pct = params.get("accessibilityLevelPct", 40)
    wait_buffer = params.get("avgTransferWaitMinutes", 19)
    walk_buffer = params.get("walkingConnectionMinutes", 20)

    # Parametric equations
    bus_factor = max(0.3, 1.0 - (bus_freq - 3) * 0.04)
    sync_reduction = (sync_pct / 100.0) * 14.0
    feeder_reduction = (feeder_pct / 100.0) * 8.0

    simulated_wait = max(3, int(round((wait_buffer * bus_factor) - (sync_reduction * 0.7))))
    simulated_walk = max(4, int(round(walk_buffer - feeder_reduction)))
    simulated_journey = 28 + simulated_wait + simulated_walk

    friction_reduction = int(round(
        ((baseline_wait - simulated_wait) * 1.8) +
        ((walk_buffer - simulated_walk) * 1.2) +
        ((sync_pct / 100.0) * 12.0) +
        ((access_pct / 100.0) * 8.0)
    ))

    simulated_friction = max(25, min(95, baseline_friction - friction_reduction))

    key_drivers = []
    if sync_pct > 70:
        key_drivers.append("Schedule sync eliminated connection buffer (-14 min)")
    if feeder_pct > 50:
        key_drivers.append("Micro-feeder deployment bridged first/last-mile walk (-7 min)")
    if bus_freq >= 8:
        key_drivers.append("High bus frequency reduced headway randomness")
    if access_pct >= 80:
        key_drivers.append("Elevator and ramp availability smoothed level-transitions")
    if not key_drivers:
        key_drivers.append("Incremental frequency and walking improvements")

    return {
        "baselineJourneyMin": baseline_duration,
        "baselineFriction": baseline_friction,
        "baselineWaitMin": baseline_wait,
        "simulatedJourneyMin": simulated_journey,
        "simulatedFriction": simulated_friction,
        "simulatedWaitMin": simulated_wait,
        "journeyDeltaMin": simulated_journey - baseline_duration,
        "frictionDeltaPoints": simulated_friction - baseline_friction,
        "waitDeltaMin": simulated_wait - baseline_wait,
        "keyDrivers": key_drivers
    }
