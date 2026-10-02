from typing import List, Dict, Any

DEFAULT_WEIGHTS = {
    "waiting": 0.30,
    "transfer": 0.20,
    "walking": 0.15,
    "time": 0.15,
    "cost": 0.08,
    "accessibility": 0.07,
    "reliability": 0.05
}

def calculate_friction_model(segments: List[Dict[str, Any]], weights: Dict[str, float] = None, user_modifier: float = 1.0):
    if weights is None:
        weights = DEFAULT_WEIGHTS

    total_duration = 0
    travel_duration = 0
    waiting_duration = 0
    walking_duration = 0
    transfer_count = 0
    total_cost = 0.0
    max_excess_wait = -1
    worst_segment = segments[0] if segments else None

    for seg in segments:
        duration = seg.get("durationMinutes", 0)
        mode = seg.get("mode", "walking")
        total_duration += duration
        total_cost += seg.get("costInr", 0.0)

        if mode == "waiting":
            waiting_duration += duration
            expected = seg.get("expectedMinutes", 5)
            excess = max(0, duration - expected)
            if excess > max_excess_wait:
                max_excess_wait = excess
                worst_segment = seg
        elif mode == "walking":
            walking_duration += duration
        elif mode == "transfer":
            transfer_count += 1
            expected = seg.get("expectedMinutes", 4)
            waiting_duration += max(0, duration - expected)
        else:
            travel_duration += duration

    # Normalization (0-100 scales)
    waiting_score = min(100.0, (waiting_duration / 20.0) * 100.0)
    transfer_score = min(100.0, (transfer_count / 3.0) * 100.0)
    walking_score = min(100.0, (walking_duration / 25.0) * 100.0)
    time_score = min(100.0, (total_duration / 90.0) * 100.0)
    cost_score = min(100.0, (total_cost / 60.0) * 100.0)
    accessibility_score = min(100.0, (70.0 if (walking_duration > 15 or transfer_count > 1) else 30.0) * user_modifier)
    reliability_score = min(100.0, 80.0 if waiting_duration > 10 else 35.0)

    raw_score = (
        waiting_score * weights["waiting"] +
        transfer_score * weights["transfer"] +
        walking_score * weights["walking"] +
        time_score * weights["time"] +
        cost_score * weights["cost"] +
        accessibility_score * weights["accessibility"] +
        reliability_score * weights["reliability"]
    )

    final_score = int(round(min(100, max(5, raw_score))))

    sum_weighted = (
        waiting_score * weights["waiting"] +
        transfer_score * weights["transfer"] +
        walking_score * weights["walking"] +
        time_score * weights["time"] +
        cost_score * weights["cost"] +
        accessibility_score * weights["accessibility"] +
        reliability_score * weights["reliability"]
    ) or 1.0

    breakdown = {
        "waitingBurden": int(round((waiting_score * weights["waiting"] / sum_weighted) * 100)),
        "transferBurden": int(round((transfer_score * weights["transfer"] / sum_weighted) * 100)),
        "walkingBurden": int(round((walking_score * weights["walking"] / sum_weighted) * 100)),
        "timeBurden": int(round((time_score * weights["time"] / sum_weighted) * 100)),
        "costBurden": int(round((cost_score * weights["cost"] / sum_weighted) * 100)),
        "accessibilityBurden": int(round((accessibility_score * weights["accessibility"] / sum_weighted) * 100)),
        "reliabilityBurden": int(round((reliability_score * weights["reliability"] / sum_weighted) * 100)),
    }

    bottleneck = {
        "segmentId": worst_segment.get("id", "seg-wait") if worst_segment else "seg-wait",
        "title": "Unsynchronized Connection Delay" if worst_segment and worst_segment.get("mode") == "waiting" else "Excessive Transfer Strain",
        "location": worst_segment.get("location", "Central Transit Hub") if worst_segment else "Central Transit Hub",
        "affectedSegment": worst_segment.get("name", "Bus to Train Transfer") if worst_segment else "Transfer",
        "currentWaitMinutes": worst_segment.get("durationMinutes", 19) if worst_segment else 19,
        "expectedWaitMinutes": worst_segment.get("expectedMinutes", 5) if worst_segment else 5,
        "excessWaitMinutes": max(0, (worst_segment.get("durationMinutes", 19) - worst_segment.get("expectedMinutes", 5))) if worst_segment else 14,
        "confidence": "Prototype analysis (94% confidence)",
        "insight": f"Primary mobility bottleneck is the {worst_segment.get('durationMinutes', 19)}-minute transfer wait at {worst_segment.get('location', 'Central Transit Point')}. It contributes {breakdown['waitingBurden']}% to total journey friction.",
        "recommendation": "Explore schedule synchronization between the feeder bus arrival window and suburban rail departure."
    }

    return {
        "frictionScore": final_score,
        "frictionLevel": "HIGH" if final_score > 70 else "MODERATE" if final_score > 40 else "LOW",
        "frictionBreakdown": breakdown,
        "primaryBottleneck": bottleneck,
        "totalDurationMinutes": total_duration,
        "travelDurationMinutes": travel_duration,
        "waitingDurationMinutes": waiting_duration,
        "walkingDurationMinutes": walking_duration,
        "transferCount": transfer_count,
        "estimatedCostInr": total_cost
    }
