import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import {
  CycloneEvent,
  Shelter,
  EvacuationPlan,
  ReliefInventoryItem,
  ReliefTransaction,
  ReliefRequest,
  EmergencyAlert,
  ResponseTask,
  User,
  AuditLog,
  ImpactAssessment,
} from '../src/types/index.ts';

// In-memory operational store for resilient demo mode and testing
class OperationalStore {
  cyclones: CycloneEvent[] = [];
  shelters: Shelter[] = [];
  evacuationPlans: EvacuationPlan[] = [];
  reliefInventory: ReliefInventoryItem[] = [];
  reliefTransactions: ReliefTransaction[] = [];
  reliefRequests: ReliefRequest[] = [];
  alerts: EmergencyAlert[] = [];
  tasks: ResponseTask[] = [];
  users: (User & { passwordHash: string })[] = [];
  auditLogs: AuditLog[] = [];
  impactAssessments: ImpactAssessment[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    const now = new Date();
    const isoNow = now.toISOString();

    // Default users with hashed passwords
    const salt = bcrypt.genSaltSync(10);
    this.users = [
      {
        id: 'usr-admin-01',
        name: 'Dr. Rajeshwar Sharma',
        email: 'admin@cycloneshield.gov',
        passwordHash: bcrypt.hashSync('admin123', salt),
        role: 'Administrator',
        organization: 'National Disaster Management Authority (NDMA)',
        phone: '+91-11-26701700',
        createdAt: '2026-01-10T08:00:00Z',
      },
      {
        id: 'usr-dmo-02',
        name: 'Sunita Mohapatra',
        email: 'dmo@cycloneshield.gov',
        passwordHash: bcrypt.hashSync('dmo123', salt),
        role: 'Disaster Management Officer',
        organization: 'Special Relief Commissioner Office, Odisha',
        phone: '+91-674-2534177',
        createdAt: '2026-01-12T09:30:00Z',
      },
      {
        id: 'usr-evac-03',
        name: 'Capt. Vikram Rathore',
        email: 'evac@cycloneshield.gov',
        passwordHash: bcrypt.hashSync('evac123', salt),
        role: 'Evacuation Coordinator',
        organization: 'Odisha Disaster Rapid Action Force (ODRAF)',
        phone: '+91-9437012345',
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'usr-relief-04',
        name: 'Ananya Sen',
        email: 'relief@cycloneshield.gov',
        passwordHash: bcrypt.hashSync('relief123', salt),
        role: 'Relief Coordinator',
        organization: 'Indian Red Cross Society & Civil Supplies Dept',
        phone: '+91-9830098765',
        createdAt: '2026-01-18T11:00:00Z',
      },
      {
        id: 'usr-viewer-05',
        name: 'Rohan Mehra',
        email: 'viewer@cycloneshield.gov',
        passwordHash: bcrypt.hashSync('viewer123', salt),
        role: 'Read-Only Viewer',
        organization: 'Civil Defense Volunteer Cadre',
        phone: '+91-9876543210',
        createdAt: '2026-02-01T14:00:00Z',
      },
    ];

    // Seed Active Cyclone "VARUN" - Bay of Bengal threatening Odisha/Andhra coast
    this.cyclones = [
      {
        id: 'cyc-2026-001',
        name: 'VARUN',
        identifier: 'BOB-04-2026',
        basin: 'Bay of Bengal',
        latitude: 17.85,
        longitude: 86.45,
        windSpeedKmph: 175,
        centralPressureHpa: 968,
        movementDirection: 'NW',
        movementSpeedKmph: 16,
        category: 'Very Severe Cyclonic Storm',
        observationTime: isoNow,
        lastUpdated: isoNow,
        forecastTrack: [
          {
            timeHorizonHours: 6,
            latitude: 18.25,
            longitude: 86.05,
            estimatedWindSpeedKmph: 185,
            expectedCategory: 'Very Severe Cyclonic Storm',
          },
          {
            timeHorizonHours: 12,
            latitude: 18.7,
            longitude: 85.65,
            estimatedWindSpeedKmph: 195,
            expectedCategory: 'Extremely Severe Cyclonic Storm',
          },
          {
            timeHorizonHours: 18,
            latitude: 19.15,
            longitude: 85.25,
            estimatedWindSpeedKmph: 205,
            expectedCategory: 'Extremely Severe Cyclonic Storm',
          },
          {
            timeHorizonHours: 24,
            latitude: 19.6,
            longitude: 84.85,
            estimatedWindSpeedKmph: 180, // Landfall vicinity near Gopalpur/Puri
            expectedCategory: 'Very Severe Cyclonic Storm',
          },
          {
            timeHorizonHours: 36,
            latitude: 20.35,
            longitude: 84.4,
            estimatedWindSpeedKmph: 110,
            expectedCategory: 'Severe Cyclonic Storm',
          },
        ],
        dataSource: 'IMD',
        warningStatus: 'RED ALERT',
        affectedRegions: [
          'Ganjam Coastal Belt',
          'Puri Coastline',
          'Jagatsinghpur Lowlands',
          'Kendrapara Estuary',
          'Srikakulam North Zone',
        ],
        notes:
          'Eye diameter approx 28km. Heavy storm surge expected between 2.5m - 4.2m above astronomical tide. Landfall expected within 24 hours.',
      },
      {
        id: 'cyc-2026-002',
        name: 'SAGAR-DEEP',
        identifier: 'ARB-02-2026',
        basin: 'Arabian Sea',
        latitude: 14.2,
        longitude: 69.1,
        windSpeedKmph: 75,
        centralPressureHpa: 994,
        movementDirection: 'NNW',
        movementSpeedKmph: 12,
        category: 'Cyclonic Storm',
        observationTime: new Date(Date.now() - 3600000 * 4).toISOString(),
        lastUpdated: new Date(Date.now() - 3600000 * 2).toISOString(),
        forecastTrack: [
          {
            timeHorizonHours: 12,
            latitude: 15.4,
            longitude: 68.6,
            estimatedWindSpeedKmph: 85,
            expectedCategory: 'Cyclonic Storm',
          },
          {
            timeHorizonHours: 24,
            latitude: 16.8,
            longitude: 68.1,
            estimatedWindSpeedKmph: 95,
            expectedCategory: 'Severe Cyclonic Storm',
          },
          {
            timeHorizonHours: 48,
            latitude: 19.2,
            longitude: 67.5,
            estimatedWindSpeedKmph: 105,
            expectedCategory: 'Severe Cyclonic Storm',
          },
        ],
        dataSource: 'IMD',
        warningStatus: 'YELLOW WATCH',
        affectedRegions: ['Goa Offshore', 'Konkan Coastal Zone', 'Ratnagiri Coast'],
        notes: 'Developing tropical storm moving northward away from mainland coast.',
      },
    ];

    // Seed Operational Shelters with genuine GPS coordinates along vulnerable coastal belt
    this.shelters = [
      {
        id: 'shl-01',
        name: 'Gopalpur Multi-Hazard Cyclone Shelter',
        code: 'CS-GPL-01',
        district: 'Ganjam',
        state: 'Odisha',
        latitude: 19.26,
        longitude: 84.87,
        maxCapacity: 2500,
        currentOccupancy: 2150,
        availableCapacity: 350,
        accessibilityInfo: 'Ground floor ramp, tactile paving, 8 disabled-accessible toilets',
        medicalFacilities: 'Full emergency dispensary, 2 doctors, oxygen concentrators',
        contactPerson: 'S. K. Patnaik',
        contactPhone: '+91-680-2344101',
        status: 'Near Capacity',
        hasGenerator: true,
        hasCleanWaterStorage: true,
        lastUpdated: isoNow,
      },
      {
        id: 'shl-02',
        name: 'Puri Sea Beach Government College Evacuation Center',
        code: 'CS-PRI-02',
        district: 'Puri',
        state: 'Odisha',
        latitude: 19.79,
        longitude: 85.82,
        maxCapacity: 3500,
        currentOccupancy: 3480,
        availableCapacity: 20,
        accessibilityInfo: 'Elevator operational on backup generator, wide corridors',
        medicalFacilities: 'District Red Cross Mobile Medical Unit stationed',
        contactPerson: 'Manas Ranjan Das',
        contactPhone: '+91-6752-223400',
        status: 'Full',
        hasGenerator: true,
        hasCleanWaterStorage: true,
        lastUpdated: isoNow,
      },
      {
        id: 'shl-03',
        name: 'Chhatrapur Community Cyclone Relief Facility',
        code: 'CS-CTR-03',
        district: 'Ganjam',
        state: 'Odisha',
        latitude: 19.35,
        longitude: 84.99,
        maxCapacity: 1800,
        currentOccupancy: 820,
        availableCapacity: 980,
        accessibilityInfo: 'Step-free access, lactation room, elder care bay',
        medicalFacilities: 'Paramedic triage booth, trauma basic kits',
        contactPerson: 'Anita Pradhan',
        contactPhone: '+91-6811-260199',
        status: 'Operational',
        hasGenerator: true,
        hasCleanWaterStorage: true,
        lastUpdated: isoNow,
      },
      {
        id: 'shl-04',
        name: 'Paradip Port Coastal Fortress Shelter',
        code: 'CS-PDP-04',
        district: 'Jagatsinghpur',
        state: 'Odisha',
        latitude: 20.31,
        longitude: 86.62,
        maxCapacity: 4000,
        currentOccupancy: 1950,
        availableCapacity: 2050,
        accessibilityInfo: 'Reinforced concrete ramp, separate quarantine wing',
        medicalFacilities: 'Port Trust Hospital surge clinic, 4 EMTs',
        contactPerson: 'Capt. Debabrata Roy',
        contactPhone: '+91-6722-222340',
        status: 'Operational',
        hasGenerator: true,
        hasCleanWaterStorage: true,
        lastUpdated: isoNow,
      },
      {
        id: 'shl-05',
        name: 'Astaranga Multipurpose Cyclone Shelter',
        code: 'CS-AST-05',
        district: 'Puri',
        state: 'Odisha',
        latitude: 19.98,
        longitude: 86.26,
        maxCapacity: 1500,
        currentOccupancy: 1200,
        availableCapacity: 300,
        accessibilityInfo: 'Ramp and handrails on all stairways',
        medicalFacilities: 'Community Health Centre field staff',
        contactPerson: 'Balaram Swain',
        contactPhone: '+91-6754-245100',
        status: 'Near Capacity',
        hasGenerator: true,
        hasCleanWaterStorage: true,
        lastUpdated: isoNow,
      },
      {
        id: 'shl-06',
        name: 'Berhampur Town Hall Emergency Relocation Depot',
        code: 'CS-BAM-06',
        district: 'Ganjam',
        state: 'Odisha',
        latitude: 19.32,
        longitude: 84.79,
        maxCapacity: 3000,
        currentOccupancy: 950,
        availableCapacity: 2050,
        accessibilityInfo: 'Fully accessible civic auditorium with kitchen amenities',
        medicalFacilities: 'MKCG Medical College standby team attached',
        contactPerson: 'Pravat Mishra',
        contactPhone: '+91-680-2227188',
        status: 'Operational',
        hasGenerator: true,
        hasCleanWaterStorage: true,
        lastUpdated: isoNow,
      },
      {
        id: 'shl-07',
        name: 'Sompeta Coastal Cyclone Haven',
        code: 'CS-SMP-07',
        district: 'Srikakulam',
        state: 'Andhra Pradesh',
        latitude: 18.93,
        longitude: 84.59,
        maxCapacity: 2200,
        currentOccupancy: 1100,
        availableCapacity: 1100,
        accessibilityInfo: 'Ground floor accessibility, emergency power backup',
        medicalFacilities: 'Primary health center unit stationed',
        contactPerson: 'K. Appa Rao',
        contactPhone: '+91-8947-234201',
        status: 'Operational',
        hasGenerator: true,
        hasCleanWaterStorage: true,
        lastUpdated: isoNow,
      },
      {
        id: 'shl-08',
        name: 'Kalingapatnam Lighthouse Cyclone Hub',
        code: 'CS-KLP-08',
        district: 'Srikakulam',
        state: 'Andhra Pradesh',
        latitude: 18.34,
        longitude: 84.13,
        maxCapacity: 1200,
        currentOccupancy: 0,
        availableCapacity: 0,
        accessibilityInfo: 'Roof maintenance under repair',
        medicalFacilities: 'Basic first aid supplies',
        contactPerson: 'V. Ramana Murthy',
        contactPhone: '+91-8942-277102',
        status: 'Temporarily Closed',
        hasGenerator: false,
        hasCleanWaterStorage: true,
        lastUpdated: isoNow,
      },
    ];

    // Seed Relief Inventory
    this.reliefInventory = [
      {
        id: 'inv-01',
        name: 'Ready-to-Eat Emergency Food Packs (72-hr ration)',
        category: 'Food & Rations',
        quantity: 18500,
        unit: 'Packs',
        storageLocation: 'Central Disaster Depot, Bhubaneswar Hub A',
        minThreshold: 5000,
        lastUpdated: isoNow,
        status: 'Adequate',
      },
      {
        id: 'inv-02',
        name: 'Potable Drinking Water (20-Liter Jerry Cans)',
        category: 'Drinking Water',
        quantity: 3200,
        unit: 'Cans',
        storageLocation: 'Berhampur Forward Supply Base',
        minThreshold: 4000,
        lastUpdated: isoNow,
        status: 'Low Stock',
      },
      {
        id: 'inv-03',
        name: 'Chlorine Water Purification Tablets (Strip of 50)',
        category: 'Drinking Water',
        quantity: 45000,
        unit: 'Strips',
        storageLocation: 'Puri District Medical Warehouse',
        minThreshold: 10000,
        lastUpdated: isoNow,
        status: 'Adequate',
      },
      {
        id: 'inv-04',
        name: 'Trauma & Wound Care Field Kits',
        category: 'Medical Supplies',
        quantity: 850,
        unit: 'Kits',
        storageLocation: 'Gopalpur Sub-Divisional Hospital Depot',
        minThreshold: 1200,
        lastUpdated: isoNow,
        status: 'Low Stock',
      },
      {
        id: 'inv-05',
        name: 'Heavy-Duty Waterproof Tarpaulins & Tie Ropes',
        category: 'Bedding & Tarpaulins',
        quantity: 12400,
        unit: 'Sheets',
        storageLocation: 'Paradip Port Staging Warehouse',
        minThreshold: 3000,
        lastUpdated: isoNow,
        status: 'Adequate',
      },
      {
        id: 'inv-06',
        name: 'Inflatable Life Jackets & Flotation Rings',
        category: 'Rescue Gear',
        quantity: 1650,
        unit: 'Units',
        storageLocation: 'ODRAF 3rd Battalion Barracks, Cuttack',
        minThreshold: 800,
        lastUpdated: isoNow,
        status: 'Adequate',
      },
      {
        id: 'inv-07',
        name: 'Portable Gasoline De-Watering Pumps (10 HP)',
        category: 'Rescue Gear',
        quantity: 18,
        unit: 'Units',
        storageLocation: 'Chhatrapur Municipal Garage',
        minThreshold: 25,
        lastUpdated: isoNow,
        status: 'Critical Shortage',
      },
      {
        id: 'inv-08',
        name: 'Sanitary Hygiene & Dignity Kits',
        category: 'Sanitation & Hygiene',
        quantity: 7200,
        unit: 'Kits',
        storageLocation: 'Bhubaneswar Central Depot',
        minThreshold: 2000,
        lastUpdated: isoNow,
        status: 'Adequate',
      },
    ];

    // Seed Relief Transactions
    this.reliefTransactions = [
      {
        id: 'tx-001',
        itemId: 'inv-01',
        itemName: 'Ready-to-Eat Emergency Food Packs',
        type: 'Distribution',
        quantity: 4000,
        previousBalance: 22500,
        newBalance: 18500,
        recipientArea: 'Gopalpur Coastal Shelter Sector 4',
        authorizedBy: 'Ananya Sen (Relief Coordinator)',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        notes: 'Dispatched via 2 high-clearance military trucks.',
      },
      {
        id: 'tx-002',
        itemId: 'inv-02',
        itemName: 'Potable Drinking Water (20-Liter Jerry Cans)',
        type: 'Distribution',
        quantity: 1500,
        previousBalance: 4700,
        newBalance: 3200,
        recipientArea: 'Puri Beach Evacuation Zone',
        authorizedBy: 'Ananya Sen (Relief Coordinator)',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        notes: 'Direct supply to Puri Sea Beach College Center.',
      },
    ];

    // Seed Relief Requests
    this.reliefRequests = [
      {
        id: 'req-001',
        code: 'REL-REQ-2026-081',
        affectedLocation: 'Gopalpur Fishing Hamlet Block B',
        requestingOrg: 'Local Revenue Inspector & Red Cross Post',
        resourceCategory: 'Drinking Water',
        resourceName: 'Potable Drinking Water (20-Liter Jerry Cans)',
        requiredQuantity: 600,
        unit: 'Cans',
        priority: 'Critical',
        description: 'Borewell seawater intrusion observed due to preliminary high-tide surge.',
        requestedBy: 'Tahasildar Gopalpur',
        requestTimestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        status: 'Approved',
        reviewedBy: 'Ananya Sen',
        assignedDriverOrTeam: 'Convoy Team Delta (Driver: J. Nayak)',
        deliveryNotes: 'En route via NH-516C diversion route.',
        updatedAt: isoNow,
      },
      {
        id: 'req-002',
        code: 'REL-REQ-2026-082',
        affectedLocation: 'Astaranga Fishermen Colony',
        requestingOrg: 'Panchayat Disaster Committee',
        resourceCategory: 'Food & Rations',
        resourceName: 'Ready-to-Eat Emergency Food Packs',
        requiredQuantity: 1200,
        unit: 'Packs',
        priority: 'High',
        description: 'Dry rations needed for 300 evacuated families housed in makeshift school camp.',
        requestedBy: 'Sarpanch Astaranga',
        requestTimestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'Under Review',
        reviewedBy: 'Ananya Sen',
        updatedAt: isoNow,
      },
      {
        id: 'req-003',
        code: 'REL-REQ-2026-083',
        affectedLocation: 'Chhatrapur Lowland Hamlet',
        requestingOrg: 'Civil Defense Volunteer Group',
        resourceCategory: 'Rescue Gear',
        resourceName: 'Portable Gasoline De-Watering Pumps',
        requiredQuantity: 6,
        unit: 'Units',
        priority: 'Critical',
        description: 'Water accumulation blocking emergency access route to primary shelter.',
        requestedBy: 'R. K. Jena (CDV)',
        requestTimestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        status: 'Submitted',
        updatedAt: isoNow,
      },
      {
        id: 'req-004',
        code: 'REL-REQ-2026-079',
        affectedLocation: 'Paradip Tidal Creek Ward 3',
        requestingOrg: 'Paradip Port Municipality',
        resourceCategory: 'Bedding & Tarpaulins',
        resourceName: 'Heavy-Duty Waterproof Tarpaulins',
        requiredQuantity: 800,
        unit: 'Sheets',
        priority: 'Medium',
        description: 'Reinforcement for thatched roofing vulnerable to pre-landfall squalls.',
        requestedBy: 'Executive Officer Paradip',
        requestTimestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        status: 'Delivered',
        reviewedBy: 'Ananya Sen',
        assignedDriverOrTeam: 'ODRAF Supply Truck #4',
        deliveryNotes: 'Delivered and acknowledged by Municipal Inspector at 08:30 hrs.',
        updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      },
    ];

    // Seed Evacuation Plans
    this.evacuationPlans = [
      {
        id: 'plan-001',
        cycloneId: 'cyc-2026-001',
        cycloneName: 'VARUN',
        regionName: 'Ganjam Coastal High-Vulnerability Strip',
        district: 'Ganjam',
        targetPopulation: 6500,
        allocatedPopulation: 5380,
        unallocatedPopulation: 1120,
        sheltersAssigned: [
          {
            shelterId: 'shl-01',
            shelterName: 'Gopalpur Multi-Hazard Cyclone Shelter',
            allocatedCount: 2150,
            distanceKm: 3.4,
            availableCapacityBefore: 2500,
          },
          {
            shelterId: 'shl-03',
            shelterName: 'Chhatrapur Community Cyclone Relief Facility',
            allocatedCount: 1180,
            distanceKm: 12.8,
            availableCapacityBefore: 1800,
          },
          {
            shelterId: 'shl-06',
            shelterName: 'Berhampur Town Hall Emergency Relocation Depot',
            allocatedCount: 2050,
            distanceKm: 18.2,
            availableCapacityBefore: 2050,
          },
        ],
        transportationRequirements: {
          busesRequired: 108,
          ambulancesRequired: 14,
          escortVehiclesRequired: 18,
          paramedicTeamsRequired: 27,
        },
        status: 'In Progress',
        evacuationPercentage: 74,
        createdBy: 'Capt. Vikram Rathore (Evacuation Coordinator)',
        confirmedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        notes:
          '1,120 unallocated citizens being routed via secondary state transport fleet to inland Chhatrapur degree colleges.',
      },
      {
        id: 'plan-002',
        cycloneId: 'cyc-2026-001',
        cycloneName: 'VARUN',
        regionName: 'Puri Pilgrim & Beach Town Sector',
        district: 'Puri',
        targetPopulation: 5000,
        allocatedPopulation: 4700,
        unallocatedPopulation: 300,
        sheltersAssigned: [
          {
            shelterId: 'shl-02',
            shelterName: 'Puri Sea Beach Government College Evacuation Center',
            allocatedCount: 3480,
            distanceKm: 2.1,
            availableCapacityBefore: 3500,
          },
          {
            shelterId: 'shl-05',
            shelterName: 'Astaranga Multipurpose Cyclone Shelter',
            allocatedCount: 1220,
            distanceKm: 29.5,
            availableCapacityBefore: 1500,
          },
        ],
        transportationRequirements: {
          busesRequired: 94,
          ambulancesRequired: 8,
          escortVehiclesRequired: 12,
          paramedicTeamsRequired: 24,
        },
        status: 'In Progress',
        evacuationPercentage: 86,
        createdBy: 'Capt. Vikram Rathore (Evacuation Coordinator)',
        confirmedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
        notes: 'Puri coastal zone 100% evacuated within 500m high tide line.',
      },
    ];

    // Seed Emergency Alerts
    this.alerts = [
      {
        id: 'alt-001',
        code: 'ALT-CRIT-001',
        title: 'EXTREME STORM SURGE WARNING: Ganjam & Puri Coastal Districts',
        severity: 'Critical',
        affectedRegions: ['Ganjam', 'Puri', 'Jagatsinghpur'],
        description:
          'Cyclone VARUN projected landfall within 24 hours. Astronomical tidal surge expected up to 4.2m. Inundation risk critical in low-lying villages.',
        instructions:
          'Complete all mandatory evacuations immediately. Fishing vessels strictly barred from sea. Power shutdown scheduled for 18:00 hrs.',
        issuedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 36).toISOString(),
        status: 'Active',
        issuedBy: 'Sunita Mohapatra (Disaster Management Officer)',
        acknowledgedCount: 42,
      },
      {
        id: 'alt-002',
        code: 'ALT-WARN-002',
        title: 'Shelter Capacity Alert: Puri Beach Center Reached 99% Capacity',
        severity: 'Warning',
        affectedRegions: ['Puri Town'],
        description:
          'Puri Sea Beach Government College has reached 3,480 occupants out of 3,500 maximum capacity.',
        instructions:
          'Divert incoming evacuation buses from Grand Road sector to Astaranga and Pipili secondary inland shelters.',
        issuedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 20).toISOString(),
        status: 'Active',
        issuedBy: 'Capt. Vikram Rathore (Evacuation Coordinator)',
        acknowledgedCount: 29,
      },
      {
        id: 'alt-003',
        code: 'ALT-WARN-003',
        title: 'Relief Inventory Alert: Portable De-Watering Pumps Critically Low',
        severity: 'Warning',
        affectedRegions: ['All Southern Coastal Sectors'],
        description:
          'Only 18 de-watering pump units available across frontline depots against minimum emergency threshold of 25.',
        instructions:
          'Expedite requisition from Cuttack Irrigation Division and mobilize private tractor-mounted pumps.',
        issuedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 48).toISOString(),
        status: 'Active',
        issuedBy: 'Ananya Sen (Relief Coordinator)',
        acknowledgedCount: 17,
      },
      {
        id: 'alt-004',
        code: 'ALT-INFO-004',
        title: 'Meteorological Advisory: Gale Wind Alert for Arabian Sea',
        severity: 'Informational',
        affectedRegions: ['Goa Offshore', 'Konkan Coast'],
        description:
          'Cyclonic Storm SAGAR-DEEP moving NNW with wind gusts up to 85 kmph. Rough to very rough sea conditions.',
        instructions: 'Fishermen advised not to venture into deep sea areas.',
        issuedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 24).toISOString(),
        status: 'Active',
        issuedBy: 'Dr. Rajeshwar Sharma (NDMA)',
        acknowledgedCount: 11,
      },
    ];

    // Seed Response Tasks
    this.tasks = [
      {
        id: 'tsk-001',
        title: 'Deploy ODRAF Team 4 to Gopalpur Coastal Sector',
        description:
          'Station high-clearance inflatable rescue boats and tree-clearing power saws at Gopalpur police station compound.',
        priority: 'Critical',
        assignedTeam: 'ODRAF 4th Battalion Rescue Unit',
        responsibleUser: 'Capt. Vikram Rathore',
        location: 'Gopalpur on Sea, Ganjam',
        deadline: new Date(Date.now() + 3600000 * 4).toISOString(),
        status: 'In Progress',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: isoNow,
      },
      {
        id: 'tsk-002',
        title: 'Pre-position 10,000 Water Purification Strips at Puri Sub-Depot',
        description:
          'Transfer stock from Bhubaneswar Central Medical Store to prevent waterborne epidemic risks post-surge.',
        priority: 'High',
        assignedTeam: 'Civil Supplies Logistics Team B',
        responsibleUser: 'Ananya Sen',
        location: 'Puri District Hospital Depot',
        deadline: new Date(Date.now() + 3600000 * 8).toISOString(),
        status: 'Assigned',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: isoNow,
      },
      {
        id: 'tsk-003',
        title: 'Inspect Emergency Diesel Generators at Berhampur Town Hall',
        description:
          'Verify fuel tanks filled to 100% capacity (48 hours run-time) and test automatic transfer switchgear.',
        priority: 'High',
        assignedTeam: 'Public Works Electrical Division',
        responsibleUser: 'Er. B. K. Sahoo',
        location: 'Berhampur Town Hall Shelter',
        deadline: new Date(Date.now() - 3600000 * 1).toISOString(),
        status: 'Completed',
        completionNotes: 'Generator passed load testing. 1,200 liters reserve diesel verified in bunded tank.',
        createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'tsk-004',
        title: 'Establish Satellite Phone Emergency Link with Jagatsinghpur EOC',
        description:
          'Setup INMARSAT terminal and test voice/data link in case terrestrial cell towers sustain cyclone wind damage.',
        priority: 'Critical',
        assignedTeam: 'State Emergency Operations Center Comms Wing',
        responsibleUser: 'Sunita Mohapatra',
        location: 'District Collectorate, Jagatsinghpur',
        deadline: new Date(Date.now() + 3600000 * 2).toISOString(),
        status: 'Pending',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        updatedAt: isoNow,
      },
    ];

    // Seed Impact Assessments
    this.impactAssessments = [
      {
        id: 'imp-001',
        cycloneId: 'cyc-2026-001',
        cycloneName: 'VARUN',
        assessedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        assessedBy: 'Sunita Mohapatra (Disaster Management Officer)',
        timeHorizonHours: 24,
        assumptions: {
          windDecayModel: 'Inland exponential decay with surface roughness coefficient 0.18',
          stormSurgeHeightMeters: 3.8,
          rainfallBufferHours: 48,
        },
        totalExposedPopulation: 425000,
        highRiskPopulation: 185000,
        moderateRiskPopulation: 240000,
        regions: [
          {
            regionName: 'Ganjam Coastal Belt',
            state: 'Odisha',
            distanceFromEyeKm: 42,
            distanceFromTrackKm: 18,
            coastalExposure: 'High Coastal',
            population: 145000,
            riskLevel: 'CRITICAL',
            estimatedExposedPopulation: 112000,
            criticalInfrastructure: [
              'Gopalpur Commercial Port',
              'Substation 220kV Ganjam',
              'NH-516C Coastal Arterial',
            ],
            primaryThreats: [
              'Catastrophic wind shear > 175 kmph',
              'Storm surge flooding up to 3.8m above MSL',
              'Saltwater salinization of arable lands',
            ],
            recommendedActions: [
              'Mandatory complete evacuation of 0-3km strip',
              'Pre-emptive power transmission shutdown',
              'Position tree removal cranes every 5km on NH',
            ],
            riskScore: 94,
            methodologyReasoning:
              'Direct trajectory within 20km radius of projected maximum wind radius (RMW). Low coastal elevation (<4m MSL) amplifies surge penetrations.',
          },
          {
            regionName: 'Puri Coastline & Chilika Bay',
            state: 'Odisha',
            distanceFromEyeKm: 68,
            distanceFromTrackKm: 28,
            coastalExposure: 'High Coastal',
            population: 175000,
            riskLevel: 'CRITICAL',
            estimatedExposedPopulation: 95000,
            criticalInfrastructure: [
              'Puri Railway Terminal',
              'Heritage Temple Drainage Corridor',
              'Chilika Biosphere Estuary Barrier',
            ],
            primaryThreats: [
              'Sustained gale winds 140-165 kmph',
              'Breaching of coastal sand dunes',
              'Flash inundation of low-lying settlements',
            ],
            recommendedActions: [
              'Evacuate all temporary fishing settlements',
              'Distribute water purification supplies to shelter nodes',
              'Activate flood discharge sluice gates',
            ],
            riskScore: 88,
            methodologyReasoning:
              'High density pilgrim population and vulnerable thatched settlements along exposed Chilika sandspit.',
          },
          {
            regionName: 'Jagatsinghpur & Paradip Belt',
            state: 'Odisha',
            distanceFromEyeKm: 110,
            distanceFromTrackKm: 65,
            coastalExposure: 'High Coastal',
            population: 210000,
            riskLevel: 'HIGH',
            estimatedExposedPopulation: 78000,
            criticalInfrastructure: [
              'Paradip Port Oil Refinery Storage Tanks',
              'Fertilizer Complex Dikes',
              'Cuttack-Paradip Railway Line',
            ],
            primaryThreats: [
              'Heavy to extremely heavy rainfall (>200mm in 24h)',
              'High tidal backflow in Mahanadi delta',
            ],
            recommendedActions: [
              'Halt hazardous chemical handling at docks',
              'Inspect petrochemical bund walls',
            ],
            riskScore: 76,
            methodologyReasoning:
              'Right-forward quadrant squall bands with extreme moisture convergence and tidal surge backflow.',
          },
          {
            regionName: 'Srikakulam North Coastal Plain',
            state: 'Andhra Pradesh',
            distanceFromEyeKm: 85,
            distanceFromTrackKm: 45,
            coastalExposure: 'Inland Lowland',
            population: 130000,
            riskLevel: 'HIGH',
            estimatedExposedPopulation: 62000,
            criticalInfrastructure: [
              'Vamsadhara River Embankments',
              'East Coast Railway Main Line',
            ],
            primaryThreats: [
              'Flash flooding in river catchment',
              'Agricultural crop flattening',
            ],
            recommendedActions: [
              'Patrol river embankments for seepage',
              'Deploy standby drainage siphon units',
            ],
            riskScore: 72,
            methodologyReasoning:
              'Peripheral squall line with wind gusts reaching 120 kmph and riverine catchment runoff.',
          },
        ],
        infrastructureExposureSummary: {
          hospitalsAtRisk: 14,
          powerGridsAtRisk: 6,
          roadsFloodedKm: 85,
          coastalDikesAtRisk: 22,
        },
        keyRecommendations: [
          'Enforce strict curfew and evacuation in 0-5 km coastal band across Ganjam and Puri.',
          'Designate inland shelters with dedicated backup power and minimum 72-hour food/water reserves.',
          'Place National Disaster Response Force (NDRF) and Army amphibious units on immediate 30-minute notice.',
        ],
        confidenceScore: 89,
        disclaimer:
          'ASSESSMENT NOTICE: This impact prediction is synthesized from transparent mathematical exposure algorithms and IMD meteorological advisories. Operational deployment must be confirmed by District Disaster Management Authorities (DDMA).',
      },
    ];

    // Seed Audit Logs
    this.auditLogs = [
      {
        id: 'log-001',
        action: 'UPDATE_CYCLONE_OBSERVATION',
        entityType: 'cyclone_events',
        entityId: 'cyc-2026-001',
        performedBy: 'Sunita Mohapatra',
        userRole: 'Disaster Management Officer',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        details:
          'Updated central pressure to 968 hPa and category upgraded to Very Severe Cyclonic Storm.',
      },
      {
        id: 'log-002',
        action: 'CONFIRM_EVACUATION_PLAN',
        entityType: 'evacuation_plans',
        entityId: 'plan-001',
        performedBy: 'Capt. Vikram Rathore',
        userRole: 'Evacuation Coordinator',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        details: 'Confirmed evacuation plan for Ganjam Coastal Belt assigning 5,380 people to 3 shelters.',
      },
      {
        id: 'log-003',
        action: 'DISTRIBUTE_RELIEF_SUPPLIES',
        entityType: 'relief_inventory',
        entityId: 'inv-01',
        performedBy: 'Ananya Sen',
        userRole: 'Relief Coordinator',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        details: 'Authorized distribution of 4,000 ready-to-eat ration packs to Gopalpur Sector 4.',
      },
      {
        id: 'log-004',
        action: 'ISSUE_EMERGENCY_ALERT',
        entityType: 'emergency_alerts',
        entityId: 'alt-001',
        performedBy: 'Sunita Mohapatra',
        userRole: 'Disaster Management Officer',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        details: 'Broadcasted CRITICAL alert: Extreme Storm Surge Warning for Ganjam and Puri.',
      },
    ];
  }
}

export const inMemoryStore = new OperationalStore();

// MongoDB Database Client & Connectivity Wrapper
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isConnectedToMongo = false;

export async function initDatabase(): Promise<{ isConnected: boolean; mode: 'MongoDB Atlas' | 'Demonstration Store'; error?: string }> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('MY_MONGODB_URI')) {
    console.log('[CycloneShield DB] No valid MONGODB_URI found. Operating in Demonstration Store Mode with fully persistent in-memory models.');
    return { isConnected: false, mode: 'Demonstration Store' };
  }

  try {
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db('cycloneshield');
    isConnectedToMongo = true;
    console.log('[CycloneShield DB] Successfully connected to MongoDB Atlas database: cycloneshield');

    // Create indexes for high-throughput disaster query performance
    await mongoDb.collection('cyclone_events').createIndex({ identifier: 1 }, { unique: true });
    await mongoDb.collection('shelters').createIndex({ code: 1 }, { unique: true });
    await mongoDb.collection('shelters').createIndex({ district: 1 });
    await mongoDb.collection('relief_inventory').createIndex({ category: 1 });
    await mongoDb.collection('relief_requests').createIndex({ status: 1 });
    await mongoDb.collection('emergency_alerts').createIndex({ status: 1 });
    await mongoDb.collection('response_tasks').createIndex({ status: 1 });
    await mongoDb.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoDb.collection('audit_logs').createIndex({ timestamp: -1 });

    // Seed collections if empty
    const cycloneCount = await mongoDb.collection('cyclone_events').countDocuments();
    if (cycloneCount === 0) {
      console.log('[CycloneShield DB] Seeding initial disaster records into MongoDB Atlas...');
      await mongoDb.collection('cyclone_events').insertMany(inMemoryStore.cyclones);
      await mongoDb.collection('shelters').insertMany(inMemoryStore.shelters);
      await mongoDb.collection('relief_inventory').insertMany(inMemoryStore.reliefInventory);
      await mongoDb.collection('relief_requests').insertMany(inMemoryStore.reliefRequests);
      await mongoDb.collection('relief_transactions').insertMany(inMemoryStore.reliefTransactions);
      await mongoDb.collection('evacuation_plans').insertMany(inMemoryStore.evacuationPlans);
      await mongoDb.collection('emergency_alerts').insertMany(inMemoryStore.alerts);
      await mongoDb.collection('response_tasks').insertMany(inMemoryStore.tasks);
      await mongoDb.collection('users').insertMany(inMemoryStore.users);
      await mongoDb.collection('impact_assessments').insertMany(inMemoryStore.impactAssessments);
      await mongoDb.collection('audit_logs').insertMany(inMemoryStore.auditLogs);
      console.log('[CycloneShield DB] MongoDB Atlas initial seed complete.');
    }

    return { isConnected: true, mode: 'MongoDB Atlas' };
  } catch (err: any) {
    console.warn('[CycloneShield DB] Could not connect to MongoDB Atlas:', err?.message || err);
    console.warn('[CycloneShield DB] Gracefully engaging Demonstration Store Mode for seamless offline/college project presentation.');
    isConnectedToMongo = false;
    mongoDb = null;
    return {
      isConnected: false,
      mode: 'Demonstration Store',
      error: err?.message || 'MongoDB connection failed or timed out',
    };
  }
}

export function getDb(): Db | null {
  return mongoDb;
}

export function getDatabaseStatus() {
  return {
    isConnected: isConnectedToMongo,
    mode: isConnectedToMongo ? ('MongoDB Atlas' as const) : ('Demonstration Store' as const),
    host: isConnectedToMongo ? 'Cluster: Atlas Cloud (Live)' : 'Local Memory Store (Active)',
  };
}
