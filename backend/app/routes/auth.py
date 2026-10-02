import logging
import uuid
import datetime
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.database import db_manager

logger = logging.getLogger("mobilens.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication & User Management"])

ROLE_FEATURES: Dict[str, List[Dict[str, Any]]] = {
    "citizen": [
        {
            "id": "my-journey",
            "title": "My Journey Planner",
            "route": "/my-journey",
            "icon": "Navigation",
            "badge": "Active: TCR ➔ FXEC Corridor",
            "benefit": "Detects hidden transfer traps, dead wait times, and walking fatigue before you step out.",
            "description": "Plan real routes across Tirunelveli & Thoothukudi with accurate distances, multi-modal travel times, and fare estimations."
        },
        {
            "id": "analyzer",
            "title": "Journey Friction Analyzer",
            "route": "/analyzer",
            "icon": "TrendingDown",
            "badge": "Human-Centric",
            "benefit": "Shows exactly why a trip is exhausting by separating vehicle transit from waiting and walking burdens.",
            "description": "Inspect door-to-door segments, transfer bottlenecks (like Vagaikulam 16-min wait), and pedestrian crossing hazards."
        },
        {
            "id": "routes",
            "title": "Citizen Safe Routes",
            "route": "/routes",
            "icon": "Compass",
            "badge": "Pedestrian Safety",
            "benefit": "Avoid scorching sun, hazardous unshaded bypass roads, and poorly lit nighttime transit stops.",
            "description": "Smart route recommendations balancing minimal walking fatigue, shaded pathways, and safe pedestrian crossings."
        },
        {
            "id": "map",
            "title": "Mobility Friction Map",
            "route": "/map",
            "icon": "MapPin",
            "badge": "Real Corridor Heatmap",
            "benefit": "Live visibility of transit congestion and transfer bottlenecks across Tirunelveli and Thoothukudi.",
            "description": "Interactive map showing Vannarpettai Bypass, Tirunelveli Railway Junction, and Thoothukudi Airport zones."
        }
    ],
    "planner": [
        {
            "id": "city-intelligence",
            "title": "City Intelligence Center",
            "route": "/city-intelligence",
            "icon": "Layers",
            "badge": "Municipal Decision Support",
            "benefit": "Quantifies human strain index and passenger hours wasted across high-friction corridors.",
            "description": "Macro-level district transit metrics, passenger stress indicators, and corridor vulnerability rankings."
        },
        {
            "id": "interventions",
            "title": "AI Interventions Simulator",
            "route": "/interventions",
            "icon": "Sparkles",
            "badge": "-45% Friction Reduction",
            "benefit": "Simulate transit interventions (like the TCR ➔ FXEC Electric Feeder Shuttle) before spending public capital.",
            "description": "Forecast time saved, modal shift from private vehicles to public transit, and economic ROI for transport agencies."
        },
        {
            "id": "map",
            "title": "Mobility Friction Map",
            "route": "/map",
            "icon": "MapPin",
            "badge": "Zone Choke Points",
            "benefit": "Spot exact geographical choke points where commuters abandon public transit or suffer excessive delay.",
            "description": "District-level spatial heatmap of high-friction transit intersections, bus terminals, and highway crossings."
        },
        {
            "id": "simulator",
            "title": "What-If Scenario Simulator",
            "route": "/simulator",
            "icon": "Sliders",
            "badge": "Policy Modeling",
            "benefit": "Test policy levers: dedicated bus lanes, feeder frequencies, or fare subsidies to maximize transit adoption.",
            "description": "Interactive simulation engine computing network-wide friction reduction and commuter satisfaction."
        }
    ],
    "accessibility": [
        {
            "id": "accessibility",
            "title": "Inclusive Mobility Navigator",
            "route": "/accessibility",
            "icon": "Accessibility",
            "badge": "Barrier-Free",
            "benefit": "Guaranteed step-free transfers, wheelchair ramp availability, and zero-stairway journeys.",
            "description": "Dedicated routing for senior citizens, wheelchair commuters, and travelers needing physical assistance."
        },
        {
            "id": "my-journey",
            "title": "Low-Strain Journey Planner",
            "route": "/my-journey",
            "icon": "Navigation",
            "badge": "Endurance Cap: 400m",
            "benefit": "Caps pedestrian walking strain and prioritizes flat, shaded sidewalks and low-floor bus connections.",
            "description": "Customized trip calculations preventing excessive walking fatigue and long platform transfers."
        },
        {
            "id": "routes",
            "title": "Safe Pedestrian Corridors",
            "route": "/routes",
            "icon": "Compass",
            "badge": "Signalized Crossings",
            "benefit": "Avoids dangerous multi-lane highway crossings like Vannarpettai Bypass without pedestrian signals.",
            "description": "Safe path recommendations with audio-signal crossings, wide curbs, and sheltered resting benches."
        },
        {
            "id": "map",
            "title": "Accessibility Barrier Map",
            "route": "/map",
            "icon": "MapPin",
            "badge": "Infra Audit",
            "benefit": "Visual audit of broken sidewalks, missing ramps, and inaccessible transit hubs across the district.",
            "description": "District spatial map highlighting mobility barriers and accessible infrastructure in Tirunelveli & Thoothukudi."
        }
    ]
}

# Add alias for admin to planner features
ROLE_FEATURES["admin"] = ROLE_FEATURES["planner"]

DEFAULT_USERS = [
    {
        "id": "user-citizen-01",
        "email": "citizen@mobilens.ai",
        "password": "citizen123",
        "name": "Velraj (Student / Commuter)",
        "role": "citizen",
        "district": "Tirunelveli",
        "organization": "Francis Xavier Engineering College"
    },
    {
        "id": "user-planner-01",
        "email": "planner@mobilens.ai",
        "password": "planner123",
        "name": "S. Meenakshi (Transit Planning Officer)",
        "role": "planner",
        "district": "Tirunelveli & Thoothukudi",
        "organization": "TNSTC / Municipal Mobility Cell"
    },
    {
        "id": "user-access-01",
        "email": "access@mobilens.ai",
        "password": "access123",
        "name": "Dr. K. Raman (Inclusive Transit Advocate)",
        "role": "accessibility",
        "district": "Tirunelveli",
        "organization": "Accessible Tamil Nadu Mission"
    }
]

class SignUpRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "citizen"  # citizen, planner, accessibility
    district: Optional[str] = "Tirunelveli"
    organization: Optional[str] = "Francis Xavier Engineering College"

class LoginRequest(BaseModel):
    email: str
    password: str

@router.get("/features/{role}")
async def get_role_features(role: str):
    clean_role = role.lower()
    features = ROLE_FEATURES.get(clean_role, ROLE_FEATURES["citizen"])
    return {
        "role": clean_role,
        "featuresCount": len(features),
        "features": features
    }

@router.post("/signup")
async def signup(req: SignUpRequest):
    col = db_manager.get_collection("users")
    clean_email = req.email.strip().lower()
    clean_role = req.role.strip().lower()
    if clean_role not in ["citizen", "planner", "accessibility", "admin"]:
        clean_role = "citizen"

    # Check existing user
    if col is not None:
        try:
            existing = col.find_one({"email": clean_email})
            if existing:
                raise HTTPException(status_code=400, detail="An account with this email address already exists.")
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Error checking user in Atlas: {e}")

    user_doc = {
        "id": f"user-{uuid.uuid4().hex[:8]}",
        "name": req.name.strip(),
        "email": clean_email,
        "password": req.password,
        "role": clean_role,
        "district": req.district or "Tirunelveli",
        "organization": req.organization or "Francis Xavier Engineering College",
        "createdAt": datetime.datetime.utcnow().isoformat(),
        "database": "MongoDB Atlas" if db_manager.is_mongo_connected else "Local Cache"
    }

    if col is not None:
        try:
            col.insert_one(user_doc)
            logger.info(f"User {clean_email} saved to MongoDB Atlas successfully.")
        except Exception as e:
            logger.error(f"Failed to persist user in MongoDB Atlas: {e}")

    features = ROLE_FEATURES.get(clean_role, ROLE_FEATURES["citizen"])
    
    return {
        "success": True,
        "message": f"Welcome to MobiLens AI, {user_doc['name']}! Your account has been created successfully.",
        "user": {
            "id": user_doc["id"],
            "name": user_doc["name"],
            "email": user_doc["email"],
            "role": user_doc["role"],
            "district": user_doc["district"],
            "organization": user_doc["organization"]
        },
        "token": f"token-{user_doc['id']}",
        "features": features
    }

@router.post("/login")
async def login(req: LoginRequest):
    clean_email = req.email.strip().lower()
    col = db_manager.get_collection("users")
    found_user = None

    # Check MongoDB Atlas
    if col is not None:
        try:
            found_user = col.find_one({"email": clean_email})
        except Exception as e:
            logger.warning(f"Failed to query Atlas users: {e}")

    # Fallback to default demo personas
    if not found_user:
        for u in DEFAULT_USERS:
            if u["email"].lower() == clean_email:
                found_user = u
                break

    # If still not found, allow quick demo login if password matches or standard email structure
    if not found_user:
        # Determine role from email
        if "planner" in clean_email:
            role = "planner"
            name = "Transit Planning Officer"
        elif "access" in clean_email:
            role = "accessibility"
            name = "Inclusive Mobility Advocate"
        elif "admin" in clean_email:
            role = "admin"
            name = "System Administrator"
        else:
            role = "citizen"
            name = "Commuter / Student"

        found_user = {
            "id": f"user-demo-{uuid.uuid4().hex[:6]}",
            "name": name,
            "email": clean_email,
            "password": req.password,
            "role": role,
            "district": "Tirunelveli",
            "organization": "Francis Xavier Engineering College"
        }

    # Verify password if user was in default list
    if req.password and found_user.get("password") and req.password != found_user.get("password") and not req.password.startswith("demo"):
        # For hackathon demo ease, allow demo logins or matching passwords
        raise HTTPException(status_code=401, detail="Invalid password. Please check your credentials or use 1-Click Fast Login.")

    clean_role = found_user.get("role", "citizen").lower()
    features = ROLE_FEATURES.get(clean_role, ROLE_FEATURES["citizen"])

    return {
        "success": True,
        "message": f"Welcome back, {found_user.get('name', 'User')}!",
        "user": {
            "id": found_user.get("id"),
            "name": found_user.get("name"),
            "email": found_user.get("email"),
            "role": clean_role,
            "district": found_user.get("district", "Tirunelveli"),
            "organization": found_user.get("organization", "Francis Xavier Engineering College")
        },
        "token": f"token-{found_user.get('id', 'guest')}",
        "features": features
    }
