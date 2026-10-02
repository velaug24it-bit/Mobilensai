# 🌐 MobiLens AI — Human-Centric Mobility Intelligence & Intervention Simulator

> *"See the journey beyond the vehicle."*  
> *"We don't just measure how vehicles move. We measure how difficult it is for people to move."*

---

## 🏆 Project Overview

**MobiLens AI** is a state-of-the-art, human-centric transportation intelligence platform built for modern smart cities, transit planners, and daily commuters. 

Traditional transportation systems analyze roads, traffic density, vehicle speed, and fleet capacity. However, a city’s transportation network can appear fully connected on a GIS map while remaining fundamentally broken for the individual using it. 

**MobiLens AI reconstructs door-to-door passenger journeys, isolates hidden multi-modal friction (dead waiting time, transfer gaps, excessive walking, inaccessible corridors), pinpoints the primary bottleneck, and deterministically simulates targeted interventions before physical capital is deployed.**

---

## 💡 The Core Problem Statement

> *"Connected infrastructure does not always mean a connected journey."*

Consider two commuters travelling across the city:
- **Person A**: Home ➔ 6 min walk ➔ City Bus (15 min) ➔ College = **25 Minutes (Low Friction)**
- **Person B**: Home ➔ Walk ➔ Auto ➔ **Wait 19 min (Missed Train)** ➔ Bus ➔ Train ➔ College = **58 Minutes (Severe Friction)**

Both commuters technically have access to public transportation, but their lived mobility experiences are profoundly divergent. MobiLens AI measures, maps, and eliminates this difference.

---

## 🚀 Key Innovations & Golden Flow

```
PERSON ➔ JOURNEY ➔ FRICTION ➔ BOTTLENECK ➔ AI ENGINE ➔ INTERVENTION ➔ BEFORE / AFTER
```

1. **Human Journey Reconstruction**: Deconstructs multi-modal trips into walking, transit, waiting, transfer, and dwell segments.
2. **Prototype Mobility Friction Index**: A weighted composite metric (0–100) aggregating:
   - Waiting Burden (28%)
   - Transfer Burden (17%)
   - Walking Burden (9%)
   - Total Time Burden (12%)
   - Cost Burden (6%)
   - Accessibility Burden (6%)
   - Reliability Buffer (5%)
3. **Automated AI Bottleneck Detection**: Automatically identifies the disproportionate delay trap (e.g., the 19-minute platform wait caused by a 7-minute walking transfer to an unsynchronized train departure).
4. **Deterministic Intervention Simulator**: Tests 5 distinct municipal interventions:
   - **Option 1: Schedule Synchronization** (Low Complexity, -43% Friction, 15 min saved, 4,210 riders) — *AI Recommended*
   - **Option 2: Electric Micro-Feeder Shuttles** (Medium Complexity, -31% Friction, 10 min saved)
   - **Option 3: Additional Bus Fleet Headway** (High Complexity, -18% Friction, 7 min saved)
   - **Option 4: Relocate Bus Stop Closer to Rail Concourse** (Low Complexity, -12% Friction, 4 min saved)
   - **Option 5: Direct Covered Walkway & Ramp** (Medium Complexity, -24% Friction, 6 min saved)
5. **Interactive Before vs. After Screen**: Real-time side-by-side comparison of baseline vs. simulated journeys with metrics diff cards and celebration feedback.
6. **Mobility Friction Map**: Full-screen interactive Leaflet map featuring colored friction zones (Zone 17 Red 82, Zone 07 Orange 72, Zone 04 Amber 54, Zone 01 Emerald 31).
7. **What-If Parametric Sandbox**: Real-time sliders for bus frequency, rail headway, transfer buffer, feeder coverage, schedule sync %, and accessibility level with live recalculation.
8. **Inclusive Mobility & Accessibility Mode**: Side-by-side evaluation of passenger personas (Standard, Wheelchair User, Elderly, Parent with Stroller, Visually Impaired) and automated step-free alternative routing.
9. **Executive Presentation Mode**: Projector-optimized pitch view engineered specifically for hackathon judging and executive demonstrations.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite (TypeScript)
- **Styling**: Tailwind CSS v4 + Custom Dark Theme
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Data Visualization**: Recharts (diurnal curves, zone distributions, trends)
- **Mapping**: Leaflet + React-Leaflet (custom glowing dark markers, zones, popups)
- **Micro-Animations**: Canvas Confetti + CSS Transitions

### Backend
- **Framework**: Python 3.10+ FastAPI
- **Validation**: Pydantic v2
- **Real-Time Communication**: WebSockets (`/ws/mobility`)
- **Database**: MongoDB with Motor / PyMongo (with seamless in-memory fallback for 100% offline hackathon demos)
- **Local AI Engine**: Deterministic rule-based analytical engine (requires zero external API keys)

---

## 📦 Directory Structure

```
d:\Mobilens AI\
├── frontend/
│   ├── src/
│   │   ├── components/         # MetricCard, JourneyTimeline, FrictionGauge, AIBottleneckCard,
│   │   │                       # InterventionComparison, BeforeAfter, MobilityMap, PresentationMode,
│   │   │                       # HackathonDemoModal, AIChatModal, NotificationPanel
│   │   ├── context/            # AppContext.tsx (Global state, AI rules, and demo controllers)
│   │   ├── data/               # mockData.ts (Demo journeys, zones, personas, and city stats)
│   │   ├── layouts/            # MainLayout.tsx (Responsive sidebar, top header, status pills)
│   │   ├── pages/              # Overview, MyJourney, JourneyAnalyzer, AIInterventions,
│   │   │                       # MobilityFrictionMap, CityIntelligence, WhatIfSimulator,
│   │   │                       # Accessibility, CitizenSafeRoutes, Analytics, Login, AboutPitch
│   │   ├── simulation/         # frictionEngine.ts (Local AI calculation and simulation algorithms)
│   │   ├── types/              # index.ts (Full TypeScript domain interfaces)
│   │   ├── App.tsx             # Route definitions
│   │   ├── index.css           # Tailwind v4 directives and Leaflet dark styles
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── ai/                 # friction_model.py (Python analytical calculation engine)
│   │   ├── routes/             # dashboard, journeys, zones, interventions, accessibility, ai, notifications
│   │   ├── simulation/         # intervention_engine.py (Deterministic policy testing)
│   │   ├── database.py         # MongoDB connection with automatic in-memory fallback
│   │   ├── main.py             # FastAPI entrypoint, CORS, and WebSockets
│   │   └── schemas.py          # Pydantic data schemas
│   ├── requirements.txt
│   └── .env.example
├── .env.example
└── README.md
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22.14.0)
- **Python**: 3.10+

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will start instantly at: `http://localhost:5173/`

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API service will run at: `http://localhost:8000/`  
Interactive Swagger API Documentation: `http://localhost:8000/docs`

---

## 🔑 Demo Personas & Fast Accounts

Authentication is pre-configured with 3 functional demo roles:

| Role | Email | Password | Default Redirect |
|---|---|---|---|
| **Citizen Commuter** | `citizen@mobilens.ai` | `citizen123` | **My Journey** (`/my-journey`) |
| **Transit / City Planner** | `planner@mobilens.ai` | `planner123` | **City Intelligence** (`/city-intelligence`) |
| **System Administrator** | `admin@mobilens.ai` | `admin123` | **Overview Command Center** (`/overview`) |

*(Use the single-click Quick Switch buttons on the `/login` page to switch personas instantly.)*

---

## 🎬 How to Run the Hackathon Presentation (60–90 Seconds)

1. Launch `http://localhost:5173/`.
2. Click the **"Run Hackathon Demo"** button in the top navigation bar.
3. The interactive 9-step walkthrough will guide you and the judges through:
   - **Step 1**: Multi-modal citizen journey (Home ➔ Walk ➔ Bus ➔ Central Hub ➔ Train ➔ College).
   - **Step 2**: Composite burden score calculation (Friction: 78/100).
   - **Step 3**: AI bottleneck detection (19-minute platform wait trap).
   - **Step 4**: Zoom to Zone 17 on the Mobility Friction Map.
   - **Step 5**: Test 5 interventions in the AI Intervention Engine.
   - **Step 6**: AI Recommendation (Schedule Synchronization wins).
   - **Step 7**: Before vs. After comparison (Total time drops to 53 min, wait drops to 4 min).
   - **Step 8**: Inclusive mobility comparison (Wheelchair user 72 friction vs. 28 able-bodied).
   - **Step 9**: Launches full-screen **Presentation Mode** for stage projection!

---

## 🌐 API Endpoints Reference

### Dashboard & Analytics
- `GET /api/dashboard`: Overview KPIs, system status, active focus zone.
- `GET /api/analytics`: Diurnal hourly curves and systemic problem distributions.

### Journeys
- `GET /api/journeys`: List available journeys.
- `GET /api/journeys/{id}`: Detailed segment breakdown for a journey.
- `POST /api/journey/analyze`: Calculates friction scores, component burdens, and bottlenecks.

### Zones & Spatial
- `GET /api/zones`: Hotspot zones with coordinates, radii, and burden scores.
- `GET /api/zones/{id}`: Diagnostic report for a specific zone.

### Interventions & Simulation
- `GET /api/interventions`: List available policy options.
- `POST /api/intervention/simulate`: Computes simulated impact of an intervention.
- `POST /api/simulation/run`: Runs parametric What-If simulation with custom sliders.

### AI & Assistant
- `POST /api/ai/chat`: Context-aware conversational AI assistant.
- `POST /api/ai/find-bottleneck`: Isolates transfer delay pinch points.
- `POST /api/ai/recommend-intervention`: Generates optimal policy recommendations.

### WebSockets
- `ws://localhost:8000/ws/mobility`: Live simulated mobility pulses and notifications.

---

## 🔒 Offline & Demo-First Reliability

MobiLens AI is strictly architected for **zero-failure hackathon demonstrations**:
- If MongoDB is offline $\rightarrow$ Automatically falls back to internal mock data storage.
- If the FastAPI backend is stopped $\rightarrow$ The frontend continues to run deterministically with its client-side simulation engine.
- Zero external transit or map API dependencies required.

---

## 📋 Data Disclaimer

*All friction scores, population affected numbers, journey duration minutes, and cost/complexity ratings displayed in demonstration mode are prototype simulation estimates produced by our analytical model. They are intended for demonstration purposes and do not represent validated municipal policy forecasts.*

---

## 📄 License
MIT License. Built for hackathon innovation.
