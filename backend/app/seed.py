import os
import pymongo
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI", "mongodb+srv://velr012006_db_user:vel2006raj@cluster0.uxiis7h.mongodb.net/Mobilensai?retryWrites=true&w=majority")
DB_NAME = os.getenv("DATABASE_NAME", "Mobilensai")

def seed_database():
    print(f"Connecting to MongoDB Atlas: {DB_NAME}...")
    client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=8000)
    db = client[DB_NAME]

    # 1. ZONES COLLECTION WITH TIRUNELVELI & THOOTHUKUDI DISTRICT DATA
    zones_collection = db["zones"]

    # Delete existing to refresh
    zones_collection.delete_many({})

    zones_data = [
        # TIRUNELVELI & THOOTHUKUDI DISTRICT CORRIDOR (TAMIL NADU)
        {
            "id": "zone-tn-fxec",
            "code": "ZONE TN-01",
            "city": "Tirunelveli",
            "district": "Tirunelveli",
            "name": "Francis Xavier Engineering College & Vannarpettai Bypass",
            "frictionScore": 76,
            "level": "high",
            "lat": 8.7300,
            "lng": 77.7126,
            "radiusMeters": 1100,
            "affectedDaily": 3400,
            "avgJourneyMinutes": 48,
            "avgWaitMinutes": 14,
            "avgTransfers": 2,
            "walkingBurdenKm": 1.6,
            "mainIssue": "Bypass 4-lane highway pedestrian crossing barrier & bus stop drop-off gap",
            "peakPeriod": "08:15 – 09:30 AM",
            "secondaryIssue": "Lack of signalized pedestrian crosswalk from Vannarpettai flyover to FXEC gate",
            "interventionsAvailable": 4
        },
        {
            "id": "zone-tn-junction",
            "code": "ZONE TN-02",
            "city": "Tirunelveli",
            "district": "Tirunelveli",
            "name": "Tirunelveli Railway Junction & Old Bus Stand Interchange",
            "frictionScore": 83,
            "level": "severe",
            "lat": 8.7302,
            "lng": 77.7025,
            "radiusMeters": 1400,
            "affectedDaily": 6800,
            "avgJourneyMinutes": 62,
            "avgWaitMinutes": 19,
            "avgTransfers": 3,
            "walkingBurdenKm": 2.2,
            "mainIssue": "Multi-Modal Transfer Delay between Broad Gauge Rail & TNSTC City Buses",
            "peakPeriod": "08:00 – 10:00 AM",
            "secondaryIssue": "Narrow staircase footbridges connecting rail platforms with bus bays",
            "interventionsAvailable": 5
        },
        {
            "id": "zone-th-airport",
            "code": "ZONE TH-01",
            "city": "Thoothukudi",
            "district": "Thoothukudi",
            "name": "Thoothukudi Airport (Vagaikulam) Transit Gateway",
            "frictionScore": 74,
            "level": "high",
            "lat": 8.7242,
            "lng": 78.0264,
            "radiusMeters": 1800,
            "affectedDaily": 1850,
            "avgJourneyMinutes": 55,
            "avgWaitMinutes": 16,
            "avgTransfers": 2,
            "walkingBurdenKm": 1.8,
            "mainIssue": "Airport Terminal to NH 138 Vagaikulam highway bus feeder gap",
            "peakPeriod": "08:00 – 09:30 AM / 03:00 – 04:30 PM",
            "secondaryIssue": "No scheduled electric shuttle connecting TCR airport arrivals to Tirunelveli express buses",
            "interventionsAvailable": 4
        },
        {
            "id": "zone-tn-palayamkottai",
            "code": "ZONE TN-03",
            "city": "Tirunelveli",
            "district": "Tirunelveli",
            "name": "Palayamkottai Central Bus Stand & Market Concourse",
            "frictionScore": 64,
            "level": "moderate",
            "lat": 8.7186,
            "lng": 77.7342,
            "radiusMeters": 1200,
            "affectedDaily": 4100,
            "avgJourneyMinutes": 45,
            "avgWaitMinutes": 12,
            "avgTransfers": 2,
            "walkingBurdenKm": 1.4,
            "mainIssue": "Arterial road congestion and crowded bus platform queuing",
            "peakPeriod": "08:30 – 10:00 AM",
            "secondaryIssue": "Narrow sidewalks obstructed by commercial vending stalls",
            "interventionsAvailable": 3
        },
        {
            "id": "zone-th-vallanadu",
            "code": "ZONE TH-02",
            "city": "Thoothukudi",
            "district": "Thoothukudi",
            "name": "Vallanadu Highway Junction (NH 138 Mid-Point)",
            "frictionScore": 58,
            "level": "moderate",
            "lat": 8.7305,
            "lng": 77.8924,
            "radiusMeters": 1600,
            "affectedDaily": 1900,
            "avgJourneyMinutes": 44,
            "avgWaitMinutes": 13,
            "avgTransfers": 1,
            "walkingBurdenKm": 1.2,
            "mainIssue": "Rural feeder connection gaps and unshaded waiting stands",
            "peakPeriod": "07:30 – 09:00 AM",
            "secondaryIssue": "High-speed highway traffic hazard for pedestrians boarding buses",
            "interventionsAvailable": 3
        },
        {
            "id": "zone-th-harbour",
            "code": "ZONE TH-03",
            "city": "Thoothukudi",
            "district": "Thoothukudi",
            "name": "Thoothukudi Old Bus Stand & V.O.C. Port Road",
            "frictionScore": 72,
            "level": "high",
            "lat": 8.7984,
            "lng": 78.1482,
            "radiusMeters": 1500,
            "affectedDaily": 5100,
            "avgJourneyMinutes": 52,
            "avgWaitMinutes": 15,
            "avgTransfers": 2,
            "walkingBurdenKm": 2.0,
            "mainIssue": "Port heavy trailer logistics traffic conflicting with passenger transit",
            "peakPeriod": "08:00 – 10:00 AM",
            "secondaryIssue": "Irregular town bus frequency to coastal educational and commercial hubs",
            "interventionsAvailable": 4
        },

        # CHENNAI
        {
            "id": "zone-chn-guindy",
            "code": "ZONE CH-01",
            "city": "Chennai",
            "district": "Chennai",
            "name": "Guindy Multi-Modal Transit Hub (Metro/Suburban/Bus)",
            "frictionScore": 84,
            "level": "severe",
            "lat": 13.0067,
            "lng": 80.2023,
            "radiusMeters": 1500,
            "affectedDaily": 5200,
            "avgJourneyMinutes": 64,
            "avgWaitMinutes": 18,
            "avgTransfers": 3,
            "walkingBurdenKm": 2.5,
            "mainIssue": "Unsynchronized Bus-to-Local Rail Overbridge Crossing",
            "peakPeriod": "08:15 – 09:30 AM",
            "secondaryIssue": "Lack of weather-protected pedestrian walkway across GST Road",
            "interventionsAvailable": 5
        },

        # BENGALURU
        {
            "id": "zone-blr-17",
            "code": "ZONE BLR-17",
            "city": "Bengaluru",
            "district": "Bengaluru Urban",
            "name": "Central Silk Board & Sector 17 Interchange",
            "frictionScore": 82,
            "level": "severe",
            "lat": 12.9172,
            "lng": 77.6228,
            "radiusMeters": 1400,
            "affectedDaily": 4210,
            "avgJourneyMinutes": 68,
            "avgWaitMinutes": 19,
            "avgTransfers": 3,
            "walkingBurdenKm": 2.7,
            "mainIssue": "LAST-MILE / TRANSFER GAP",
            "peakPeriod": "08:00 – 09:00 AM",
            "secondaryIssue": "Poor Schedule Synchronization between feeder bus & suburban rail",
            "interventionsAvailable": 5
        }
    ]

    zones_collection.insert_many(zones_data)
    print(f"Successfully seeded {len(zones_data)} zones into MongoDB Atlas!")

    # 2. REAL JOURNEY: Thoothukudi Airport to Francis Xavier Engineering College, Tirunelveli
    journeys_col = db["journeys"]
    
    tcr_to_fxec_journey = {
        "id": "J-TCR-FXEC-2026",
        "title": "Thoothukudi Airport ➔ Francis Xavier Engineering College, Tirunelveli",
        "userType": "student",
        "corridor": "Tirunelveli - Thoothukudi NH 138 Corridor",
        "origin": "Thoothukudi Airport (TCR), Vagaikulam",
        "destination": "Francis Xavier Engineering College, Vannarpettai, Tirunelveli",
        "originCoords": {"lat": 8.7242, "lng": 78.0264},
        "destCoords": {"lat": 8.7300, "lng": 77.7126},
        "distanceKm": 38.2,
        "departureTime": "08:15 AM",
        "arrivalTime": "09:33 AM",
        "totalDurationMinutes": 78,
        "travelDurationMinutes": 38,
        "waitingDurationMinutes": 19,
        "walkingDurationMinutes": 15,
        "transferCount": 2,
        "estimatedCostInr": 45,
        "frictionScore": 76,
        "frictionLevel": "HIGH",
        "simulation": True,
        "frictionBreakdown": {
            "waitingBurden": 29,
            "transferBurden": 18,
            "walkingBurden": 11,
            "timeBurden": 14,
            "costBurden": 6,
            "accessibilityBurden": 14,
            "reliabilityBurden": 8
        },
        "primaryBottleneck": {
            "segmentId": "seg-vagaikulam-wait",
            "title": "Vagaikulam Airport NH 138 Feeder Wait",
            "location": "Vagaikulam Highway Bus Stand (NH 138)",
            "affectedSegment": "Airport Terminal Exit ➔ TNSTC Tirunelveli Express Bus",
            "currentWaitMinutes": 16,
            "expectedWaitMinutes": 5,
            "excessWaitMinutes": 11,
            "confidence": "Empirical Regional Transit Model (96% confidence)",
            "insight": "Passengers arriving at Thoothukudi Airport must walk 400m to the highway and endure an unscheduled 16-minute wait for passing Tirunelveli-bound express buses. In addition, crossing the Vannarpettai 4-lane bypass to enter FX Engineering College introduces high pedestrian friction.",
            "recommendation": "Deploy a scheduled direct electric airport shuttle connecting Thoothukudi Airport terminal directly to Vannarpettai / FXEC campus and Tirunelveli Junction."
        },
        "segments": [
            {
                "id": "seg-tcr-walk",
                "name": "Airport Terminal Concourse Walk",
                "mode": "walking",
                "durationMinutes": 6,
                "expectedMinutes": 5,
                "excessMinutes": 1,
                "distanceKm": 0.4,
                "frictionContribution": "low",
                "description": "Walk from Arrivals Baggage Belt to Airport Outer Gate",
                "startTime": "08:15 AM",
                "endTime": "08:21 AM",
                "location": "Thoothukudi Airport Terminal",
                "stepFree": True
            },
            {
                "id": "seg-vagaikulam-wait",
                "name": "NH 138 Highway Bus Connection Wait",
                "mode": "waiting",
                "durationMinutes": 16,
                "expectedMinutes": 5,
                "excessMinutes": 11,
                "frictionContribution": "high",
                "description": "Unscheduled roadside wait for passing Tirunelveli-bound TNSTC bus",
                "startTime": "08:21 AM",
                "endTime": "08:37 AM",
                "location": "Vagaikulam Highway Stop (NH 138)",
                "stepFree": False
            },
            {
                "id": "seg-nh138-bus",
                "name": "TNSTC Express Highway Transit via Vallanadu",
                "mode": "bus",
                "durationMinutes": 35,
                "expectedMinutes": 32,
                "excessMinutes": 3,
                "distanceKm": 34.5,
                "costInr": 35,
                "frictionContribution": "low",
                "description": "4-lane NH 138 highway transit passing Vallanadu and Thamirabarani bridge",
                "startTime": "08:37 AM",
                "endTime": "09:12 AM",
                "location": "NH 138 Corridor (Thoothukudi ➔ Tirunelveli)",
                "stepFree": True
            },
            {
                "id": "seg-vannarpettai-transfer",
                "name": "Vannarpettai Bypass Road Transfer & Road Crossing",
                "mode": "transfer",
                "durationMinutes": 12,
                "expectedMinutes": 6,
                "excessMinutes": 6,
                "distanceKm": 0.5,
                "costInr": 0,
                "frictionContribution": "moderate",
                "description": "Disembarking at Vannarpettai flyover bus stop and navigating heavy bypass traffic",
                "startTime": "09:12 AM",
                "endTime": "09:24 AM",
                "location": "Vannarpettai Flyover Junction",
                "stepFree": False
            },
            {
                "id": "seg-fxec-walk",
                "name": "Last-Mile Walk to Francis Xavier Engg College",
                "mode": "walking",
                "durationMinutes": 9,
                "expectedMinutes": 8,
                "excessMinutes": 1,
                "distanceKm": 0.75,
                "costInr": 10,
                "frictionContribution": "low",
                "description": "Pedestrian walkway along 103/G2 Bypass Road into FXEC Main Campus",
                "startTime": "09:24 AM",
                "endTime": "09:33 AM",
                "location": "Bypass Road, Vannarpettai, Tirunelveli",
                "stepFree": True
            }
        ]
    }

    # Update or insert this specific journey
    journeys_col.update_one({"id": tcr_to_fxec_journey["id"]}, {"$set": tcr_to_fxec_journey}, upsert=True)
    print("Saved real journey: 'Thoothukudi Airport to Francis Xavier Engineering College, Tirunelveli' to MongoDB Atlas!")

    # 3. INTERVENTIONS FOR TIRUNELVELI - THOOTHUKUDI CORRIDOR
    interventions_col = db["interventions"]
    interventions_col.delete_many({})
    interventions_col.insert_many([
        {
            "id": "int-tcr-shuttle",
            "title": "Direct TCR Airport ➔ Tirunelveli Electric Feeder Shuttle",
            "type": "feeder",
            "description": "Deploy dedicated 30-minute scheduled electric shuttles connecting Thoothukudi Airport arrivals directly to Vannarpettai / FXEC and Tirunelveli Junction.",
            "estimatedComplexity": "Low",
            "estimatedCost": "Low",
            "simulatedFrictionReductionPct": 45,
            "simulatedTimeReductionMin": 22,
            "affectedPopulationDaily": 2800,
            "implementationCategory": "Airport Multi-Modal Connection Service",
            "afterFrictionScore": 38,
            "afterDurationMinutes": 56,
            "afterWaitingMinutes": 4,
            "afterTransfers": 1,
            "isRecommended": True,
            "aiRecommendationSummary": "Eliminates the 16-minute Vagaikulam roadside wait and bypass transfer risk, providing direct campus-to-terminal travel."
        },
        {
            "id": "int-vannarpettai-skywalk",
            "title": "Vannarpettai Bypass Pedestrian Signal & Skywalk",
            "type": "pedestrian",
            "description": "Install traffic-calmed pelican crossing and covered overpass on Vannarpettai Bypass Road outside Francis Xavier Engineering College.",
            "estimatedComplexity": "Medium",
            "estimatedCost": "Medium",
            "simulatedFrictionReductionPct": 26,
            "simulatedTimeReductionMin": 8,
            "affectedPopulationDaily": 4200,
            "implementationCategory": "Urban Pedestrian Safety Infrastructure",
            "afterFrictionScore": 54,
            "afterDurationMinutes": 68,
            "afterWaitingMinutes": 12,
            "afterTransfers": 2,
            "isRecommended": False,
            "aiRecommendationSummary": "Protects student commuters crossing the busy 4-lane Tirunelveli bypass highway."
        },
        {
            "id": "int-sync-tnstc",
            "title": "TNSTC Flight-Arrival Timetable Synchronization",
            "type": "sync",
            "description": "Synchronize TNSTC Tirunelveli-Thoothukudi express bus departures with IndiGo & SpiceJet arrival banks at TCR Airport.",
            "estimatedComplexity": "Low",
            "estimatedCost": "Low",
            "simulatedFrictionReductionPct": 38,
            "simulatedTimeReductionMin": 14,
            "affectedPopulationDaily": 2100,
            "implementationCategory": "Timetable Harmonization & Signaling",
            "afterFrictionScore": 44,
            "afterDurationMinutes": 62,
            "afterWaitingMinutes": 5,
            "afterTransfers": 2,
            "isRecommended": False,
            "aiRecommendationSummary": "Ensures an express bus is idling at the Vagaikulam gate within 5 minutes of passenger deplaning."
        }
    ])
    print("Seeded targeted interventions for Tirunelveli - Thoothukudi corridor into MongoDB Atlas!")

if __name__ == "__main__":
    seed_database()
