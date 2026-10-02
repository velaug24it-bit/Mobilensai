from typing import List, Optional
from pydantic import BaseModel, Field

class JourneySegmentSchema(BaseModel):
    id: str
    name: str
    mode: str  # walking, bus, waiting, transfer, train, auto
    durationMinutes: int
    expectedMinutes: Optional[int] = 5
    excessMinutes: Optional[int] = 0
    distanceKm: Optional[float] = 0.0
    costInr: Optional[float] = 0.0
    frictionContribution: str  # low, moderate, high
    description: str
    startTime: str
    endTime: str
    location: str
    stepFree: Optional[bool] = True

class FrictionBreakdownSchema(BaseModel):
    waitingBurden: int
    transferBurden: int
    walkingBurden: int
    timeBurden: int
    costBurden: int
    accessibilityBurden: int
    reliabilityBurden: int

class PrimaryBottleneckSchema(BaseModel):
    segmentId: str
    title: str
    location: str
    affectedSegment: str
    currentWaitMinutes: int
    expectedWaitMinutes: int
    excessWaitMinutes: int
    confidence: str
    insight: str
    recommendation: str

class JourneySchema(BaseModel):
    id: str
    title: str
    userType: str
    origin: str
    destination: str
    departureTime: str
    arrivalTime: str
    totalDurationMinutes: int
    travelDurationMinutes: int
    waitingDurationMinutes: int
    walkingDurationMinutes: int
    transferCount: int
    estimatedCostInr: float
    frictionScore: int
    frictionLevel: str
    segments: List[JourneySegmentSchema]
    frictionBreakdown: FrictionBreakdownSchema
    primaryBottleneck: PrimaryBottleneckSchema
    simulation: bool = True

class InterventionOptionSchema(BaseModel):
    id: str
    title: str
    type: str
    description: str
    estimatedComplexity: str
    estimatedCost: str
    simulatedFrictionReductionPct: int
    simulatedTimeReductionMin: int
    affectedPopulationDaily: int
    implementationCategory: str
    afterFrictionScore: int
    afterDurationMinutes: int
    afterWaitingMinutes: int
    afterTransfers: int
    aiRecommendationSummary: str
    isRecommended: Optional[bool] = False

class ZoneSchema(BaseModel):
    id: str
    code: str
    name: str
    frictionScore: int
    level: str
    lat: float
    lng: float
    radiusMeters: int
    affectedDaily: int
    avgJourneyMinutes: int
    avgWaitMinutes: int
    avgTransfers: int
    walkingBurdenKm: float
    mainIssue: str
    peakPeriod: str
    secondaryIssue: str
    interventionsAvailable: int

class WhatIfParamsSchema(BaseModel):
    busFrequencyPerHour: int = 4
    trainFrequencyPerHour: int = 3
    avgTransferWaitMinutes: int = 19
    walkingConnectionMinutes: int = 20
    feederAvailabilityPct: int = 20
    scheduleSyncPct: int = 15
    accessibilityLevelPct: int = 40

class SimulationResultSchema(BaseModel):
    baselineJourneyMin: int
    baselineFriction: int
    baselineWaitMin: int
    simulatedJourneyMin: int
    simulatedFriction: int
    simulatedWaitMin: int
    journeyDeltaMin: int
    frictionDeltaPoints: int
    waitDeltaMin: int
    keyDrivers: List[str]

class AIChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

class AIChatResponse(BaseModel):
    reply: str
    source: str = "local_prototype_ai"
    confidence: float = 0.95
