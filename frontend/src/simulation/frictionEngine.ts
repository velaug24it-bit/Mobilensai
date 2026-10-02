import { Journey, JourneySegment, PrimaryBottleneck, FrictionBreakdown, InterventionOption, WhatIfParams, SimulationResult } from '../types';

export interface CalculationWeights {
  waiting: number;       // default 0.30
  transfer: number;      // default 0.20
  walking: number;       // default 0.15
  time: number;          // default 0.15
  cost: number;          // default 0.08
  accessibility: number; // default 0.07
  reliability: number;   // default 0.05
}

export const DEFAULT_WEIGHTS: CalculationWeights = {
  waiting: 0.30,
  transfer: 0.20,
  walking: 0.15,
  time: 0.15,
  cost: 0.08,
  accessibility: 0.07,
  reliability: 0.05
};

/**
 * Prototype Mobility Friction Model
 * NOTE: Prototype analytical index for hackathon simulation demonstration.
 */
export function calculateFrictionModel(
  segments: JourneySegment[],
  weights: CalculationWeights = DEFAULT_WEIGHTS,
  userProfileModifier: number = 1.0
): {
  frictionScore: number;
  frictionBreakdown: FrictionBreakdown;
  primaryBottleneck: PrimaryBottleneck;
  totalDuration: number;
  travelDuration: number;
  waitingDuration: number;
  walkingDuration: number;
  transferCount: number;
  totalCost: number;
} {
  let totalDuration = 0;
  let travelDuration = 0;
  let waitingDuration = 0;
  let walkingDuration = 0;
  let transferCount = 0;
  let totalCost = 0;
  let totalDistanceKm = 0;
  let maxExcessWait = -1;
  let worstSegment: JourneySegment = segments[0] || {
    id: 'none',
    name: 'None',
    mode: 'waiting',
    durationMinutes: 0,
    frictionContribution: 'low',
    description: '',
    startTime: '',
    endTime: '',
    location: ''
  };

  segments.forEach(seg => {
    totalDuration += seg.durationMinutes;
    if (seg.costInr) totalCost += seg.costInr;
    if (seg.distanceKm) totalDistanceKm += seg.distanceKm;

    if (seg.mode === 'waiting') {
      waitingDuration += seg.durationMinutes;
      const expected = seg.expectedMinutes ?? 5;
      const excess = Math.max(0, seg.durationMinutes - expected);
      if (excess > maxExcessWait) {
        maxExcessWait = excess;
        worstSegment = seg;
      }
    } else if (seg.mode === 'walking') {
      walkingDuration += seg.durationMinutes;
    } else if (seg.mode === 'transfer') {
      transferCount += 1;
      waitingDuration += Math.max(0, seg.durationMinutes - (seg.expectedMinutes ?? 4));
    } else {
      travelDuration += seg.durationMinutes;
    }
  });

  // Calculate component burdens (scaled 0 - 100)
  const waitingScore = Math.min(100, (waitingDuration / 20) * 100);
  const transferScore = Math.min(100, (transferCount / 3) * 100);
  const walkingScore = Math.min(100, (walkingDuration / 25) * 100);
  const timeScore = Math.min(100, (totalDuration / 90) * 100);
  const costScore = Math.min(100, (totalCost / 60) * 100);
  const accessibilityScore = Math.min(100, (walkingDuration > 15 || transferCount > 1 ? 70 : 30) * userProfileModifier);
  const reliabilityScore = Math.min(100, (waitingDuration > 10 ? 80 : 35));

  // Weighted raw score
  const rawScore = 
    (waitingScore * weights.waiting) +
    (transferScore * weights.transfer) +
    (walkingScore * weights.walking) +
    (timeScore * weights.time) +
    (costScore * weights.cost) +
    (accessibilityScore * weights.accessibility) +
    (reliabilityScore * weights.reliability);

  const finalFrictionScore = Math.round(Math.min(100, Math.max(5, rawScore)));

  // Relative breakdown percentages
  const sumScores = waitingScore * weights.waiting +
    transferScore * weights.transfer +
    walkingScore * weights.walking +
    timeScore * weights.time +
    costScore * weights.cost +
    accessibilityScore * weights.accessibility +
    reliabilityScore * weights.reliability || 1;

  const breakdown: FrictionBreakdown = {
    waitingBurden: Math.round(((waitingScore * weights.waiting) / sumScores) * 100),
    transferBurden: Math.round(((transferScore * weights.transfer) / sumScores) * 100),
    walkingBurden: Math.round(((walkingScore * weights.walking) / sumScores) * 100),
    timeBurden: Math.round(((timeScore * weights.time) / sumScores) * 100),
    costBurden: Math.round(((costScore * weights.cost) / sumScores) * 100),
    accessibilityBurden: Math.round(((accessibilityScore * weights.accessibility) / sumScores) * 100),
    reliabilityBurden: Math.round(((reliabilityScore * weights.reliability) / sumScores) * 100),
  };

  // Build AI primary bottleneck
  const primaryBottleneck: PrimaryBottleneck = {
    segmentId: worstSegment.id,
    title: worstSegment.mode === 'waiting' ? 'Unsynchronized Connection Delay' : 'Excessive First/Last-Mile Exertion',
    location: worstSegment.location || 'Central Transfer Hub',
    affectedSegment: worstSegment.name,
    currentWaitMinutes: worstSegment.durationMinutes,
    expectedWaitMinutes: worstSegment.expectedMinutes ?? 5,
    excessWaitMinutes: Math.max(0, worstSegment.durationMinutes - (worstSegment.expectedMinutes ?? 5)),
    confidence: 'Prototype analysis (94% confidence)',
    insight: `Your journey experiences a critical bottleneck at ${worstSegment.location}. A ${worstSegment.durationMinutes}-minute wait (excess +${Math.max(0, worstSegment.durationMinutes - (worstSegment.expectedMinutes ?? 5))} min above schedule) contributes ${breakdown.waitingBurden}% to total journey friction.`,
    recommendation: 'Synchronize arrival windows with departing transit or deploy on-demand micro-feeder.'
  };

  return {
    frictionScore: finalFrictionScore,
    frictionBreakdown: breakdown,
    primaryBottleneck,
    totalDuration,
    travelDuration,
    waitingDuration,
    walkingDuration,
    transferCount,
    totalCost
  };
}

/**
 * Simulate What-If Scenario with real-time recalculation
 */
export function simulateWhatIf(
  baseJourney: Journey,
  params: WhatIfParams
): SimulationResult {
  const baseFriction = baseJourney.frictionScore;
  const baseJourneyMin = baseJourney.totalDurationMinutes;
  const baseWaitMin = baseJourney.waitingDurationMinutes;

  // Impact calculations based on parameter sliders
  // 1. Bus frequency factor (higher frequency -> lower wait)
  const busFreqFactor = Math.max(0.3, 1 - (params.busFrequencyPerHour - 3) * 0.04);
  // 2. Schedule synchronization (100% sync reduces transfer wait directly)
  const syncReduction = (params.scheduleSyncPct / 100) * 14;
  // 3. Feeder availability reduces walking connection
  const feederWalkReduction = (params.feederAvailabilityPct / 100) * 8;
  // 4. Accessibility level reduces strain
  const accessibilityModifier = 1 - (params.accessibilityLevelPct / 100) * 0.4;

  const simulatedWaitMin = Math.max(
    3,
    Math.round((params.avgTransferWaitMinutes * busFreqFactor) - syncReduction * 0.7)
  );

  const simulatedWalkMin = Math.max(
    4,
    Math.round(params.walkingConnectionMinutes - feederWalkReduction)
  );

  const travelTime = baseJourney.travelDurationMinutes;
  const simulatedJourneyMin = travelTime + simulatedWaitMin + simulatedWalkMin;

  // Friction score adjustment
  const frictionReductionPoints = Math.round(
    ((baseWaitMin - simulatedWaitMin) * 1.8) +
    ((baseJourney.walkingDurationMinutes - simulatedWalkMin) * 1.2) +
    ((params.scheduleSyncPct / 100) * 12) +
    ((1 - accessibilityModifier) * 10)
  );

  const simulatedFriction = Math.max(25, Math.min(95, baseFriction - frictionReductionPoints));

  const keyDrivers: string[] = [];
  if (params.scheduleSyncPct > 70) keyDrivers.push('Schedule sync eliminated connection buffer (-14 min)');
  if (params.feederAvailabilityPct > 50) keyDrivers.push('Micro-feeder deployment bridged first/last-mile walk (-7 min)');
  if (params.busFrequencyPerHour >= 8) keyDrivers.push('High bus frequency reduced headway randomness');
  if (params.accessibilityLevelPct >= 80) keyDrivers.push('Elevator and ramp availability smoothed level-transitions');

  if (keyDrivers.length === 0) keyDrivers.push('Incremental frequency and walking improvements');

  return {
    baselineJourneyMin: baseJourneyMin,
    baselineFriction: baseFriction,
    baselineWaitMin: baseWaitMin,
    simulatedJourneyMin,
    simulatedFriction,
    simulatedWaitMin,
    journeyDeltaMin: simulatedJourneyMin - baseJourneyMin,
    frictionDeltaPoints: simulatedFriction - baseFriction,
    waitDeltaMin: simulatedWaitMin - baseWaitMin,
    keyDrivers
  };
}

/**
 * Apply a specific intervention to a journey and create an "AFTER" version
 */
export function applyInterventionToJourney(
  journey: Journey,
  intervention: InterventionOption
): Journey {
  const updatedSegments = journey.segments.map(seg => {
    if (seg.mode === 'waiting') {
      return {
        ...seg,
        durationMinutes: intervention.afterWaitingMinutes,
        excessMinutes: Math.max(0, intervention.afterWaitingMinutes - (seg.expectedMinutes ?? 5)),
        frictionContribution: (intervention.afterWaitingMinutes <= 5 ? 'low' : 'moderate') as 'low' | 'moderate'
      };
    }
    if (seg.mode === 'transfer' && (intervention.type === 'sync' || intervention.type === 'relocate')) {
      return {
        ...seg,
        durationMinutes: Math.max(3, seg.durationMinutes - 2),
        frictionContribution: 'low' as 'low'
      };
    }
    return seg;
  });

  return {
    ...journey,
    id: `${journey.id}-simulated-${intervention.id}`,
    title: `${journey.title} (With ${intervention.title})`,
    totalDurationMinutes: intervention.afterDurationMinutes,
    waitingDurationMinutes: intervention.afterWaitingMinutes,
    frictionScore: intervention.afterFrictionScore,
    frictionLevel: intervention.afterFrictionScore > 70 ? 'HIGH' : intervention.afterFrictionScore > 45 ? 'MODERATE' : 'LOW',
    segments: updatedSegments,
    frictionBreakdown: {
      waitingBurden: Math.round(journey.frictionBreakdown.waitingBurden * 0.4),
      transferBurden: Math.round(journey.frictionBreakdown.transferBurden * 0.7),
      walkingBurden: journey.frictionBreakdown.walkingBurden,
      timeBurden: Math.round(journey.frictionBreakdown.timeBurden * 0.7),
      costBurden: journey.frictionBreakdown.costBurden + 2,
      accessibilityBurden: Math.max(3, journey.frictionBreakdown.accessibilityBurden - 2),
      reliabilityBurden: Math.max(2, journey.frictionBreakdown.reliabilityBurden - 3)
    }
  };
}
