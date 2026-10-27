import { EvacuationPlan, EvacuationShelterAllocation, Shelter } from '../src/types/index.ts';
import { calculateHaversineDistanceKm } from './riskEngine.ts';

export interface GenerateEvacuationProposalParams {
  cycloneId: string;
  cycloneName: string;
  regionName: string;
  district: string;
  regionLat?: number;
  regionLon?: number;
  targetPopulation: number;
  availableShelters: Shelter[];
  createdBy: string;
}

export function generateEvacuationAllocationPlan(params: GenerateEvacuationProposalParams): EvacuationPlan {
  const {
    cycloneId,
    cycloneName,
    regionName,
    district,
    targetPopulation,
    availableShelters,
    createdBy,
  } = params;

  // Approximate default coordinates for region if not provided
  const regLat = params.regionLat ?? 19.35;
  const regLon = params.regionLon ?? 84.95;

  // 1. Identify operational shelters and filter out full or closed shelters
  const eligibleShelters = availableShelters
    .filter((s) => s.status !== 'Temporarily Closed')
    .map((s) => {
      const remainingCap = Math.max(0, s.maxCapacity - s.currentOccupancy);
      const dist = calculateHaversineDistanceKm(regLat, regLon, s.latitude, s.longitude);
      return {
        ...s,
        calculatedAvailableCapacity: remainingCap,
        distanceKm: dist,
      };
    })
    .filter((s) => s.calculatedAvailableCapacity > 0);

  // 2. Prioritize shelters based on proximity and matching district, then capacity
  eligibleShelters.sort((a, b) => {
    // If one is in same district, give proximity preference
    const aDistrictMatch = a.district.toLowerCase() === district.toLowerCase() ? 0 : 1;
    const bDistrictMatch = b.district.toLowerCase() === district.toLowerCase() ? 0 : 1;
    if (aDistrictMatch !== bDistrictMatch) return aDistrictMatch - bDistrictMatch;
    return a.distanceKm - b.distanceKm;
  });

  // 3. Multi-pass greedy allocation without exceeding available capacity
  let unallocated = targetPopulation;
  const allocatedShelters: EvacuationShelterAllocation[] = [];

  for (const shelter of eligibleShelters) {
    if (unallocated <= 0) break;

    const allocCount = Math.min(unallocated, shelter.calculatedAvailableCapacity);
    if (allocCount > 0) {
      allocatedShelters.push({
        shelterId: shelter.id,
        shelterName: shelter.name,
        allocatedCount: allocCount,
        distanceKm: shelter.distanceKm,
        availableCapacityBefore: shelter.calculatedAvailableCapacity,
      });
      unallocated -= allocCount;
    }
  }

  const allocatedTotal = targetPopulation - unallocated;
  const evacPercent = targetPopulation > 0 ? Math.round((allocatedTotal / targetPopulation) * 100) : 0;

  // 4. Logistics & Transportation calculations
  const busesNeeded = Math.ceil(allocatedTotal / 50); // 50 passengers per heavy passenger coach
  const ambulancesNeeded = Math.ceil(allocatedTotal / 450); // 1 ambulance per 450 persons for emergency triage
  const escortVehicles = Math.ceil(busesNeeded / 6); // 1 police/ODRAF pilot vehicle per 6 convoy buses
  const paramedicTeams = Math.ceil(allocatedTotal / 250);

  const plan: EvacuationPlan = {
    id: `plan-${Date.now()}`,
    cycloneId,
    cycloneName,
    regionName,
    district,
    targetPopulation,
    allocatedPopulation: allocatedTotal,
    unallocatedPopulation: unallocated,
    sheltersAssigned: allocatedShelters,
    transportationRequirements: {
      busesRequired: busesNeeded,
      ambulancesRequired: Math.max(2, ambulancesNeeded),
      escortVehiclesRequired: Math.max(2, escortVehicles),
      paramedicTeamsRequired: Math.max(3, paramedicTeams),
    },
    status: 'Draft Proposal',
    evacuationPercentage: evacPercent,
    createdBy,
    createdAt: new Date().toISOString(),
    notes:
      unallocated > 0
        ? `DEFICIT WARNING: ${unallocated.toLocaleString()} people cannot be accommodated in immediate primary shelters. Auxiliary school buildings or inland inter-district evacuation must be activated.`
        : 'Sufficient primary shelter capacity identified. Convoy routing scheduled upon official confirmation.',
  };

  return plan;
}
