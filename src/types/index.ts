export type UserRole =
  | 'Administrator'
  | 'Disaster Management Officer'
  | 'Evacuation Coordinator'
  | 'Relief Coordinator'
  | 'Read-Only Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  phone?: string;
  createdAt: string;
}

export type CycloneCategory =
  | 'Depression'
  | 'Deep Depression'
  | 'Cyclonic Storm'
  | 'Severe Cyclonic Storm'
  | 'Very Severe Cyclonic Storm'
  | 'Extremely Severe Cyclonic Storm'
  | 'Super Cyclonic Storm';

export interface ForecastPoint {
  timeHorizonHours: number;
  latitude: number;
  longitude: number;
  estimatedWindSpeedKmph: number;
  expectedCategory: CycloneCategory;
}

export interface CycloneEvent {
  id: string;
  name: string;
  identifier: string; // e.g., "BOB-04-2026"
  basin: string; // "Bay of Bengal", "Arabian Sea", "Indian Ocean"
  latitude: number;
  longitude: number;
  windSpeedKmph: number;
  centralPressureHpa: number;
  movementDirection: string; // e.g. "NW", "NNW"
  movementSpeedKmph: number;
  category: CycloneCategory;
  observationTime: string;
  lastUpdated: string;
  forecastTrack: ForecastPoint[];
  dataSource: 'IMD' | 'NOAA' | 'Manual Officer Entry' | 'Simulated Demonstration';
  warningStatus: 'RED ALERT' | 'ORANGE WARNING' | 'YELLOW WATCH' | 'INFORMATIONAL';
  affectedRegions: string[];
  notes?: string;
}

export interface RegionalRiskAssessment {
  regionName: string;
  state: string;
  distanceFromEyeKm: number;
  distanceFromTrackKm: number;
  coastalExposure: 'High Coastal' | 'Inland Lowland' | 'Inland Elevated';
  population: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  estimatedExposedPopulation: number;
  criticalInfrastructure: string[];
  primaryThreats: string[];
  recommendedActions: string[];
  riskScore: number; // 0 - 100
  methodologyReasoning: string;
}

export interface ImpactAssessment {
  id: string;
  cycloneId: string;
  cycloneName: string;
  assessedAt: string;
  assessedBy: string;
  timeHorizonHours: number;
  assumptions: {
    windDecayModel: string;
    stormSurgeHeightMeters: number;
    rainfallBufferHours: number;
  };
  totalExposedPopulation: number;
  highRiskPopulation: number;
  moderateRiskPopulation: number;
  regions: RegionalRiskAssessment[];
  infrastructureExposureSummary: {
    hospitalsAtRisk: number;
    powerGridsAtRisk: number;
    roadsFloodedKm: number;
    coastalDikesAtRisk: number;
  };
  keyRecommendations: string[];
  confidenceScore: number; // e.g. 88%
  disclaimer: string;
}

export type ShelterStatus = 'Operational' | 'Near Capacity' | 'Full' | 'Temporarily Closed';

export interface Shelter {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  maxCapacity: number;
  currentOccupancy: number;
  availableCapacity: number; // max - current
  accessibilityInfo: string; // e.g., "Wheelchair ramp, ground floor access"
  medicalFacilities: string; // e.g., "First aid station, doctor on call"
  contactPerson: string;
  contactPhone: string;
  status: ShelterStatus;
  hasGenerator: boolean;
  hasCleanWaterStorage: boolean;
  lastUpdated: string;
}

export interface EvacuationShelterAllocation {
  shelterId: string;
  shelterName: string;
  allocatedCount: number;
  distanceKm: number;
  availableCapacityBefore: number;
}

export interface EvacuationPlan {
  id: string;
  cycloneId: string;
  cycloneName: string;
  regionName: string;
  district: string;
  targetPopulation: number;
  allocatedPopulation: number;
  unallocatedPopulation: number;
  sheltersAssigned: EvacuationShelterAllocation[];
  transportationRequirements: {
    busesRequired: number; // approx 50 per bus
    ambulancesRequired: number;
    escortVehiclesRequired: number;
    paramedicTeamsRequired: number;
  };
  status: 'Draft Proposal' | 'Confirmed Order' | 'In Progress' | 'Completed' | 'Suspended';
  evacuationPercentage: number;
  createdBy: string;
  confirmedAt?: string;
  createdAt: string;
  notes?: string;
}

export type ReliefCategory =
  | 'Food & Rations'
  | 'Drinking Water'
  | 'Medical Supplies'
  | 'Bedding & Tarpaulins'
  | 'Rescue Gear'
  | 'Sanitation & Hygiene';

export interface ReliefInventoryItem {
  id: string;
  name: string;
  category: ReliefCategory;
  quantity: number;
  unit: string;
  storageLocation: string;
  minThreshold: number;
  lastUpdated: string;
  status: 'Adequate' | 'Low Stock' | 'Critical Shortage';
}

export interface ReliefTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Restock' | 'Distribution';
  quantity: number;
  previousBalance: number;
  newBalance: number;
  recipientArea: string;
  authorizedBy: string;
  timestamp: string;
  notes?: string;
}

export type ReliefRequestStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Assigned'
  | 'In Transit'
  | 'Delivered'
  | 'Rejected';

export interface ReliefRequest {
  id: string;
  code: string;
  affectedLocation: string;
  requestingOrg: string;
  resourceCategory: ReliefCategory;
  resourceName: string;
  requiredQuantity: number;
  unit: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  requestedBy: string;
  requestTimestamp: string;
  status: ReliefRequestStatus;
  reviewedBy?: string;
  assignedDriverOrTeam?: string;
  deliveryNotes?: string;
  updatedAt: string;
}

export type AlertSeverity = 'Informational' | 'Advisory' | 'Watch' | 'Warning' | 'Critical';

export interface EmergencyAlert {
  id: string;
  code: string;
  title: string;
  severity: AlertSeverity;
  affectedRegions: string[];
  description: string;
  instructions: string;
  issuedAt: string;
  expiresAt: string;
  status: 'Active' | 'Resolved' | 'Expired';
  issuedBy: string;
  acknowledgedCount: number;
}

export type TaskStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ResponseTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTeam: string;
  responsibleUser: string;
  location: string;
  deadline: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completionNotes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  userRole: UserRole;
  timestamp: string;
  details: string;
}

export interface DashboardSummary {
  activeCyclonesCount: number;
  regionsUnderWarningCount: number;
  totalPopulationAtRisk: number;
  sheltersTotal: number;
  sheltersOperational: number;
  sheltersNearCapacity: number;
  sheltersFull: number;
  totalShelterCapacity: number;
  totalShelterOccupancy: number;
  availableShelterBeds: number;
  pendingReliefRequestsCount: number;
  criticalInventoryShortagesCount: number;
  activeAlertsCount: number;
  tasksPendingCount: number;
  tasksOverdueCount: number;
  dataSourceMode: 'MongoDB Atlas' | 'Demonstration Store';
  dataSourceConnected: boolean;
  lastSyncTimestamp: string;
}

export interface ActivityItem {
  id: string;
  type: 'cyclone' | 'shelter' | 'evacuation' | 'relief' | 'alert' | 'task';
  title: string;
  description: string;
  timestamp: string;
  severity?: 'critical' | 'high' | 'medium' | 'info';
  user?: string;
}
