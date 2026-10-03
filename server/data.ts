// AeroPulse AI - Mock Defense Database & Telemetry Simulation Engine

export interface AircraftComponentData {
  id: string;
  name: string;
  type: 'Engine' | 'Fuel System' | 'Hydraulic System' | 'Avionics' | 'Electrical System' | 'Landing Gear' | 'Airframe';
  serialNumber: string;
  healthScore: number;
  status: 'Operational' | 'Warning' | 'Maintenance' | 'Critical';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  rulHours: number;
  temperature: number; // °C
  vibration: number; // IPS
  pressure: number; // PSI
  fuelFlow?: number; // PPH
  voltage?: number; // Volts
  oilPressure?: number; // PSI
  rpm?: number; // RPM / %
  trend: 'stable' | 'degrading' | 'improving' | 'critical_spike';
  maintenanceHistory: Array<{
    date: string;
    type: string;
    action: string;
    tech: string;
  }>;
}

export interface AircraftData {
  id: string;
  name: string;
  tailNumber: string;
  category: 'Fighter' | 'Transport' | 'UAV';
  status: 'Operational' | 'Warning' | 'Maintenance' | 'Critical';
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  flightHours: number;
  missionHours: number;
  lastMaintenance: string;
  nextInspection: string;
  squadron: string;
  baseStation: string;
  callSign: string;
  enginesCount: number;
  components: AircraftComponentData[];
}

export interface EngineStageData {
  id: string;
  name: string;
  healthScore: number;
  rpm: number;
  temperature: number; // °C
  fuelFlow: number; // PPH
  vibration: number; // IPS
  oilPressure: number; // PSI
  rul: number; // Hours
  status: 'Operational' | 'Warning' | 'Maintenance' | 'Critical';
  diagnostics: string;
}

export interface PredictiveInsight {
  id: string;
  aircraftId: string;
  aircraftName: string;
  tailNumber: string;
  componentName: string;
  anomalyDetected: boolean;
  anomalyType: string;
  failureRiskScore: number; // 0-100
  rulFlightHours: number;
  confidenceScore: number; // e.g. 96.4%
  vibrationTrend: number;
  temperatureDelta: number;
  recommendation: string;
  technicalOrder: string;
  urgency: 'Routine' | 'Priority' | 'Immediate Grounding';
  createdAt: string;
}

export interface MaintenanceScheduleItem {
  id: string;
  aircraftId: string;
  tailNumber: string;
  aircraftName: string;
  title: string;
  type: 'Preventive' | 'Corrective' | 'Predictive' | 'Depot Overhaul';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  scheduledStart: string;
  scheduledEnd: string;
  bayLocation: string;
  estimatedHours: number;
  assignedTeam: string;
  components: string[];
}

export interface SparePartItem {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  stockQuantity: number;
  minThreshold: number;
  unitCost: number;
  leadTimeDays: number;
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  binLocation: string;
  forecastDemand30d: number;
  replenishmentStatus: 'In Stock' | 'Reorder Suggested' | 'Critical Shortage';
}

export interface FleetNotification {
  id: string;
  aircraftId?: string;
  tailNumber?: string;
  title: string;
  message: string;
  severity: 'Warning' | 'Critical' | 'Maintenance Due' | 'Inventory Shortage' | 'AI Prediction Alert';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// Initial In-Memory Aircraft Database
export let initialAircraft: AircraftData[] = [
  {
    id: 'AC-F023',
    name: 'F-35A Lightning II',
    tailNumber: 'AF-023',
    category: 'Fighter',
    status: 'Critical',
    healthScore: 68.4,
    riskLevel: 'Critical',
    flightHours: 1240.5,
    missionHours: 42.1,
    lastMaintenance: '2026-09-18',
    nextInspection: '2026-10-06',
    squadron: '388th Fighter Wing',
    baseStation: 'Hill AFB, UT',
    callSign: 'VIPER-01',
    enginesCount: 1,
    components: [
      {
        id: 'comp-f23-eng',
        name: 'Pratt & Whitney F135-PW-100 Turbofan',
        type: 'Engine',
        serialNumber: 'PW-135-9082',
        healthScore: 59.2,
        status: 'Critical',
        riskLevel: 'Critical',
        rulHours: 38.5,
        temperature: 685,
        vibration: 2.82,
        pressure: 42.5,
        fuelFlow: 3850,
        rpm: 98.4,
        oilPressure: 44.0,
        trend: 'critical_spike',
        maintenanceHistory: [
          { date: '2026-08-10', type: 'Phase Inspection', action: 'Borescope inspection of HP turbine', tech: 'TSgt. Ramirez' },
          { date: '2026-05-14', type: 'Oil Sample', action: 'Spectrometric oil analysis lab check', tech: 'SSgt. Kowalski' }
        ]
      },
      {
        id: 'comp-f23-fuel',
        name: 'Fuel System & Boost Pumps',
        type: 'Fuel System',
        serialNumber: 'FS-35-1102',
        healthScore: 78.0,
        status: 'Warning',
        riskLevel: 'Medium',
        rulHours: 140.0,
        temperature: 42,
        vibration: 0.8,
        pressure: 68.2,
        fuelFlow: 3850,
        trend: 'degrading',
        maintenanceHistory: [
          { date: '2026-07-22', type: 'Filter Replacement', action: 'Replaced primary boost filter', tech: 'A1C Vance' }
        ]
      },
      {
        id: 'comp-f23-hyd',
        name: 'High-Pressure Hydraulic System A/B',
        type: 'Hydraulic System',
        serialNumber: 'HYD-35-449',
        healthScore: 71.5,
        status: 'Warning',
        riskLevel: 'High',
        rulHours: 85.0,
        temperature: 88,
        vibration: 1.4,
        pressure: 2980,
        oilPressure: 2980,
        trend: 'degrading',
        maintenanceHistory: [
          { date: '2026-06-30', type: 'Fluid Servicing', action: 'Purged line B manifold', tech: 'TSgt. Ramirez' }
        ]
      },
      {
        id: 'comp-f23-avionics',
        name: 'AN/APG-81 AESA Radar & CNI Avionics',
        type: 'Avionics',
        serialNumber: 'AV-35-8120',
        healthScore: 94.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 650.0,
        temperature: 45,
        vibration: 0.2,
        pressure: 14.7,
        voltage: 270.2,
        trend: 'stable',
        maintenanceHistory: [
          { date: '2026-09-01', type: 'Software Upgrade', action: 'Block 4 OFP firmware release flash', tech: 'Capt. Mercer' }
        ]
      },
      {
        id: 'comp-f23-elec',
        name: '270V DC Main Electrical Power Generation',
        type: 'Electrical System',
        serialNumber: 'EP-35-091',
        healthScore: 88.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 420.0,
        temperature: 62,
        vibration: 0.5,
        pressure: 14.7,
        voltage: 270.1,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-f23-gear',
        name: 'Tricycle Retractable Landing Gear & Actuators',
        type: 'Landing Gear',
        serialNumber: 'LG-35-302',
        healthScore: 82.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 290.0,
        temperature: 36,
        vibration: 0.4,
        pressure: 2800,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-f23-frame',
        name: 'Composite Stealth Airframe & RAM Coating',
        type: 'Airframe',
        serialNumber: 'AF-35-0023',
        healthScore: 86.5,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 850.0,
        temperature: 30,
        vibration: 0.3,
        pressure: 14.7,
        trend: 'stable',
        maintenanceHistory: []
      }
    ]
  },
  {
    id: 'AC-T104',
    name: 'C-130J Super Hercules',
    tailNumber: 'H-104',
    category: 'Transport',
    status: 'Warning',
    healthScore: 76.2,
    riskLevel: 'Medium',
    flightHours: 4890.0,
    missionHours: 112.5,
    lastMaintenance: '2026-09-24',
    nextInspection: '2026-10-15',
    squadron: '86th Airlift Wing',
    baseStation: 'Ramstein AB, Germany',
    callSign: 'HERC-44',
    enginesCount: 4,
    components: [
      {
        id: 'comp-t104-eng2',
        name: 'Rolls-Royce AE 2100D3 Turboprop #2',
        type: 'Engine',
        serialNumber: 'AE-2100-4491',
        healthScore: 68.0,
        status: 'Warning',
        riskLevel: 'Medium',
        rulHours: 64.0,
        temperature: 638,
        vibration: 2.15,
        pressure: 52.0,
        fuelFlow: 1450,
        rpm: 1020,
        oilPressure: 49.0,
        trend: 'degrading',
        maintenanceHistory: [
          { date: '2026-08-30', type: 'Propeller Rigging', action: 'Dowty R391 hex-blade balance', tech: 'MSgt. Hoffman' }
        ]
      },
      {
        id: 'comp-t104-eng1',
        name: 'Rolls-Royce AE 2100D3 Turboprop #1',
        type: 'Engine',
        serialNumber: 'AE-2100-4490',
        healthScore: 89.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 390.0,
        temperature: 595,
        vibration: 1.1,
        pressure: 55.0,
        fuelFlow: 1410,
        rpm: 1020,
        oilPressure: 52.0,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-t104-fuel',
        name: 'Internal & External Wing Tank Manifold',
        type: 'Fuel System',
        serialNumber: 'FS-130-992',
        healthScore: 85.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 410.0,
        temperature: 28,
        vibration: 0.6,
        pressure: 45.0,
        fuelFlow: 2900,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-t104-hyd',
        name: 'Booster & Utility Hydraulic System',
        type: 'Hydraulic System',
        serialNumber: 'HYD-130-104',
        healthScore: 74.0,
        status: 'Warning',
        riskLevel: 'Medium',
        rulHours: 98.0,
        temperature: 76,
        vibration: 1.2,
        pressure: 2850,
        oilPressure: 2850,
        trend: 'degrading',
        maintenanceHistory: []
      },
      {
        id: 'comp-t104-avionics',
        name: 'Glass Cockpit CNS/ATM Dual Mission Computers',
        type: 'Avionics',
        serialNumber: 'AV-130-881',
        healthScore: 92.5,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 720.0,
        temperature: 38,
        vibration: 0.3,
        pressure: 14.7,
        voltage: 115.0,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-t104-gear',
        name: 'Main Tandem Bogie Landing Gear Assembly',
        type: 'Landing Gear',
        serialNumber: 'LG-130-221',
        healthScore: 81.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 280.0,
        temperature: 40,
        vibration: 0.8,
        pressure: 2900,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-t104-frame',
        name: 'Tactical Airframe & Cargo Ramp Structure',
        type: 'Airframe',
        serialNumber: 'AF-130-104',
        healthScore: 88.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 1100.0,
        temperature: 22,
        vibration: 0.4,
        pressure: 14.7,
        trend: 'stable',
        maintenanceHistory: []
      }
    ]
  },
  {
    id: 'AC-U902',
    name: 'MQ-9A Reaper',
    tailNumber: 'RP-902',
    category: 'UAV',
    status: 'Operational',
    healthScore: 93.8,
    riskLevel: 'Low',
    flightHours: 3120.4,
    missionHours: 18.2,
    lastMaintenance: '2026-09-29',
    nextInspection: '2026-10-29',
    squadron: '432d Wing',
    baseStation: 'Creech AFB, NV',
    callSign: 'REAPER-12',
    enginesCount: 1,
    components: [
      {
        id: 'comp-u902-eng',
        name: 'Honeywell TPE331-10GD Turboprop',
        type: 'Engine',
        serialNumber: 'TPE-331-558',
        healthScore: 94.2,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 480.0,
        temperature: 540,
        vibration: 0.72,
        pressure: 46.0,
        fuelFlow: 320,
        rpm: 1591,
        oilPressure: 62.0,
        trend: 'stable',
        maintenanceHistory: [
          { date: '2026-09-12', type: '100-Hr Check', action: 'Nozzle ring carbon clearance check', tech: 'SSgt. Patel' }
        ]
      },
      {
        id: 'comp-u902-fuel',
        name: 'Fuselage Internal Bladder & Feed Valves',
        type: 'Fuel System',
        serialNumber: 'FS-9-201',
        healthScore: 92.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 510.0,
        temperature: 31,
        vibration: 0.3,
        pressure: 38.0,
        fuelFlow: 320,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-u902-avionics',
        name: 'Triple Redundant Flight Control & Ku-Band SATCOM',
        type: 'Avionics',
        serialNumber: 'AV-9-8802',
        healthScore: 97.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 850.0,
        temperature: 36,
        vibration: 0.1,
        pressure: 14.7,
        voltage: 28.1,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-u902-hyd',
        name: 'Electro-Hydrostatic Actuators & Brakes',
        type: 'Hydraulic System',
        serialNumber: 'EHA-9-041',
        healthScore: 91.5,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 420.0,
        temperature: 48,
        vibration: 0.4,
        pressure: 2100,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-u902-frame',
        name: 'High-Aspect Carbon-Composite Wings & Fuselage',
        type: 'Airframe',
        serialNumber: 'AF-9-902',
        healthScore: 96.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 1200.0,
        temperature: 20,
        vibration: 0.2,
        pressure: 14.7,
        trend: 'stable',
        maintenanceHistory: []
      }
    ]
  },
  {
    id: 'AC-F042',
    name: 'F-15EX Eagle II',
    tailNumber: 'EX-042',
    category: 'Fighter',
    status: 'Operational',
    healthScore: 91.2,
    riskLevel: 'Low',
    flightHours: 780.2,
    missionHours: 14.0,
    lastMaintenance: '2026-09-20',
    nextInspection: '2026-10-20',
    squadron: '142d Wing',
    baseStation: 'Portland ANGB, OR',
    callSign: 'TALON-04',
    enginesCount: 2,
    components: [
      {
        id: 'comp-f42-eng1',
        name: 'GE F110-GE-129 Afterburning Turbofan #1',
        type: 'Engine',
        serialNumber: 'GE-110-7741',
        healthScore: 93.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 410.0,
        temperature: 610,
        vibration: 1.15,
        pressure: 50.0,
        fuelFlow: 3400,
        rpm: 96.5,
        oilPressure: 55.0,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-f42-eng2',
        name: 'GE F110-GE-129 Afterburning Turbofan #2',
        type: 'Engine',
        serialNumber: 'GE-110-7742',
        healthScore: 89.5,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 360.0,
        temperature: 625,
        vibration: 1.35,
        pressure: 48.0,
        fuelFlow: 3450,
        rpm: 96.2,
        oilPressure: 53.0,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-f42-hyd',
        name: 'Dual 3,000 PSI Utility & Flight Controls Hydraulic',
        type: 'Hydraulic System',
        serialNumber: 'HYD-15-209',
        healthScore: 90.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 390.0,
        temperature: 70,
        vibration: 0.9,
        pressure: 3020,
        oilPressure: 3020,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: 'comp-f42-avionics',
        name: 'EPAWSS Electronic Warfare & APG-82(V)1 AESA',
        type: 'Avionics',
        serialNumber: 'AV-15-440',
        healthScore: 95.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 800.0,
        temperature: 42,
        vibration: 0.2,
        pressure: 14.7,
        voltage: 115.0,
        trend: 'stable',
        maintenanceHistory: []
      }
    ]
  },
  {
    id: 'AC-T712',
    name: 'C-17A Globemaster III',
    tailNumber: 'G-712',
    category: 'Transport',
    status: 'Maintenance',
    healthScore: 54.0,
    riskLevel: 'High',
    flightHours: 7420.0,
    missionHours: 0.0,
    lastMaintenance: '2026-10-01',
    nextInspection: '2026-10-05',
    squadron: '62d Airlift Wing',
    baseStation: 'McChord Field, WA',
    callSign: 'MOOSE-71',
    enginesCount: 4,
    components: [
      {
        id: 'comp-t712-eng3',
        name: 'Pratt & Whitney F117-PW-100 Turbofan #3',
        type: 'Engine',
        serialNumber: 'PW-117-3021',
        healthScore: 48.0,
        status: 'Maintenance',
        riskLevel: 'High',
        rulHours: 12.0,
        temperature: 710,
        vibration: 3.1,
        pressure: 38.0,
        fuelFlow: 4100,
        rpm: 91.0,
        oilPressure: 39.0,
        trend: 'critical_spike',
        maintenanceHistory: [
          { date: '2026-10-02', type: 'Depot Tear-down', action: 'Fan stage blade containment shroud inspection', tech: 'Mr. Henderson' }
        ]
      },
      {
        id: 'comp-t712-gear',
        name: '14-Wheel Heavy Cargo Landing Gear System',
        type: 'Landing Gear',
        serialNumber: 'LG-17-712',
        healthScore: 61.0,
        status: 'Warning',
        riskLevel: 'Medium',
        rulHours: 45.0,
        temperature: 65,
        vibration: 1.8,
        pressure: 3950,
        trend: 'degrading',
        maintenanceHistory: []
      }
    ]
  },
  {
    id: 'AC-U115',
    name: 'RQ-4B Global Hawk',
    tailNumber: 'GH-115',
    category: 'UAV',
    status: 'Warning',
    healthScore: 79.5,
    riskLevel: 'Medium',
    flightHours: 5410.8,
    missionHours: 32.4,
    lastMaintenance: '2026-09-15',
    nextInspection: '2026-10-18',
    squadron: '319th Reconnaissance Wing',
    baseStation: 'Grand Forks AFB, ND',
    callSign: 'HAWK-99',
    enginesCount: 1,
    components: [
      {
        id: 'comp-u115-eng',
        name: 'Rolls-Royce AE 3007H Turbofan',
        type: 'Engine',
        serialNumber: 'AE-3007-889',
        healthScore: 77.0,
        status: 'Warning',
        riskLevel: 'Medium',
        rulHours: 72.0,
        temperature: 660,
        vibration: 1.95,
        pressure: 44.0,
        fuelFlow: 980,
        rpm: 95.0,
        oilPressure: 47.0,
        trend: 'degrading',
        maintenanceHistory: []
      },
      {
        id: 'comp-u115-avionics',
        name: 'Integrated Sensor Suite & Synthetic Aperture Radar',
        type: 'Avionics',
        serialNumber: 'AV-RQ4-102',
        healthScore: 84.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 320.0,
        temperature: 41,
        vibration: 0.3,
        pressure: 14.7,
        voltage: 28.0,
        trend: 'stable',
        maintenanceHistory: []
      }
    ]
  },
  {
    id: 'AC-F088',
    name: 'F-22A Raptor',
    tailNumber: 'RP-088',
    category: 'Fighter',
    status: 'Operational',
    healthScore: 95.0,
    riskLevel: 'Low',
    flightHours: 1640.2,
    missionHours: 19.5,
    lastMaintenance: '2026-09-28',
    nextInspection: '2026-11-02',
    squadron: '1st Fighter Wing',
    baseStation: 'Langley AFB, VA',
    callSign: 'RAPTOR-08',
    enginesCount: 2,
    components: [
      {
        id: 'comp-f88-eng1',
        name: 'Pratt & Whitney F119-PW-100 Vectoring Turbofan #1',
        type: 'Engine',
        serialNumber: 'PW-119-1088-A',
        healthScore: 96.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 510.0,
        temperature: 590,
        vibration: 0.85,
        pressure: 52.0,
        fuelFlow: 3900,
        rpm: 97.2,
        oilPressure: 56.0,
        trend: 'stable',
        maintenanceHistory: []
      }
    ]
  },
  {
    id: 'AC-T305',
    name: 'KC-46A Pegasus Tanker',
    tailNumber: 'PG-305',
    category: 'Transport',
    status: 'Operational',
    healthScore: 88.5,
    riskLevel: 'Low',
    flightHours: 2190.5,
    missionHours: 54.0,
    lastMaintenance: '2026-09-10',
    nextInspection: '2026-10-25',
    squadron: '22d Air Refueling Wing',
    baseStation: 'McConnell AFB, KS',
    callSign: 'SHELL-30',
    enginesCount: 2,
    components: [
      {
        id: 'comp-t305-eng1',
        name: 'Pratt & Whitney PW4062 High-Bypass Turbofan #1',
        type: 'Engine',
        serialNumber: 'PW-4062-5501',
        healthScore: 89.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 420.0,
        temperature: 580,
        vibration: 1.05,
        pressure: 51.0,
        fuelFlow: 2850,
        rpm: 94.0,
        oilPressure: 53.0,
        trend: 'stable',
        maintenanceHistory: []
      }
    ]
  },
  {
    id: 'AC-U014',
    name: 'MQ-25 Stingray',
    tailNumber: 'ST-014',
    category: 'UAV',
    status: 'Operational',
    healthScore: 94.0,
    riskLevel: 'Low',
    flightHours: 420.0,
    missionHours: 12.0,
    lastMaintenance: '2026-09-27',
    nextInspection: '2026-11-10',
    squadron: 'Unmanned Carrier Aviation',
    baseStation: 'NAS Patuxent River, MD',
    callSign: 'RAY-14',
    enginesCount: 1,
    components: [
      {
        id: 'comp-u014-eng',
        name: 'Rolls-Royce AE 3007N Turbofan',
        type: 'Engine',
        serialNumber: 'AE-3007N-014',
        healthScore: 95.0,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 550.0,
        temperature: 550,
        vibration: 0.65,
        pressure: 47.0,
        fuelFlow: 890,
        rpm: 96.0,
        oilPressure: 58.0,
        trend: 'stable',
        maintenanceHistory: []
      }
    ]
  }
];

// In-Memory Engine Digital Twin detailed stages for deep inspection
export let engineStagesData: Record<string, EngineStageData[]> = {
  'default': [
    {
      id: 'stg-comp',
      name: 'Compressor (LP & HP)',
      healthScore: 81.5,
      rpm: 10450,
      temperature: 485,
      fuelFlow: 3850,
      vibration: 2.1,
      oilPressure: 48,
      rul: 54,
      status: 'Warning',
      diagnostics: 'Minor aerodynamic flutter detected on stage 4 stator blades. Mild acoustic resonance.'
    },
    {
      id: 'stg-comb',
      name: 'Annular Combustor',
      healthScore: 92.0,
      rpm: 10450,
      temperature: 1240,
      fuelFlow: 3850,
      vibration: 0.8,
      oilPressure: 50,
      rul: 380,
      status: 'Operational',
      diagnostics: 'Combustion uniformity index within nominal envelope (pattern factor 0.18).'
    },
    {
      id: 'stg-turb',
      name: 'High Pressure Turbine (HPT & LPT)',
      healthScore: 68.0,
      rpm: 14200,
      temperature: 980,
      fuelFlow: 3850,
      vibration: 2.75,
      oilPressure: 45,
      rul: 38,
      status: 'Critical',
      diagnostics: 'Thermal barrier coating (TBC) spalling gradient observed on nozzle guide vanes. Blade creep risk.'
    },
    {
      id: 'stg-fuel',
      name: 'Digital Fuel Control & Injectors',
      healthScore: 87.0,
      rpm: 10450,
      temperature: 85,
      fuelFlow: 3850,
      vibration: 0.9,
      oilPressure: 52,
      rul: 220,
      status: 'Operational',
      diagnostics: 'FADEC primary channel active; metered flow matches commanded thrust schedule.'
    },
    {
      id: 'stg-oil',
      name: 'Scavenge Oil & Bearing Lubrication',
      healthScore: 74.0,
      rpm: 10450,
      temperature: 112,
      fuelFlow: 3850,
      vibration: 1.85,
      oilPressure: 44,
      rul: 82,
      status: 'Warning',
      diagnostics: 'Bearing #3 scavenge oil temperature delta +8°C above baseline. Trace ferrous particulate detected.'
    }
  ]
};

// Predictive Maintenance Insights
export let predictiveInsights: PredictiveInsight[] = [
  {
    id: 'pred-001',
    aircraftId: 'AC-F023',
    aircraftName: 'F-35A Lightning II',
    tailNumber: 'AF-023',
    componentName: 'PW-135 Turbofan / High-Pressure Turbine Stage 1',
    anomalyDetected: true,
    anomalyType: 'Harmonic Vibration & Thermal Gradient Anomaly',
    failureRiskScore: 89.2,
    rulFlightHours: 38.5,
    confidenceScore: 0.964,
    vibrationTrend: 2.82,
    temperatureDelta: +48.5,
    recommendation: 'Immediate borescope inspection of HP turbine rotor blades. Recommend engine removal within 12 flight hours to prevent uncontained disk failure.',
    technicalOrder: 'TO 1F-35A-2-72FI-1 (Engine Hot Section Inspection)',
    urgency: 'Immediate Grounding',
    createdAt: '2026-10-02T19:40:00Z'
  },
  {
    id: 'pred-002',
    aircraftId: 'AC-T104',
    aircraftName: 'C-130J Super Hercules',
    tailNumber: 'H-104',
    componentName: 'Rolls-Royce AE 2100D3 Turboprop #2 / Gearbox & Propeller Hub',
    anomalyDetected: true,
    anomalyType: 'Torque Transmission Phase Shift & Oil Chip Indication',
    failureRiskScore: 72.8,
    rulFlightHours: 64.0,
    confidenceScore: 0.912,
    vibrationTrend: 2.15,
    temperatureDelta: +18.2,
    recommendation: 'Perform spectrometric oil analysis (SOAP) on engine #2 reduction gearbox. Check magnetic chip detector plug. Schedule ground run vibration survey.',
    technicalOrder: 'TO 1C-130J-2-61JG-00-1 (Propeller System Troubleshooting)',
    urgency: 'Priority',
    createdAt: '2026-10-02T14:15:00Z'
  },
  {
    id: 'pred-003',
    aircraftId: 'AC-T712',
    aircraftName: 'C-17A Globemaster III',
    tailNumber: 'G-712',
    componentName: 'Main Cargo Landing Gear Forward Actuator Manifold',
    anomalyDetected: true,
    anomalyType: 'Hydraulic Micro-Cavitation & Dynamic Seal Wear',
    failureRiskScore: 84.0,
    rulFlightHours: 12.0,
    confidenceScore: 0.948,
    vibrationTrend: 1.80,
    temperatureDelta: +24.0,
    recommendation: 'Replace high-pressure dynamic seal kit on actuator cylinder #2. Flush and de-aerate subsystem return line B.',
    technicalOrder: 'TO 1C-17A-2-32JG-1 (Landing Gear Hydraulics)',
    urgency: 'Priority',
    createdAt: '2026-10-01T08:30:00Z'
  },
  {
    id: 'pred-004',
    aircraftId: 'AC-U115',
    aircraftName: 'RQ-4B Global Hawk',
    tailNumber: 'GH-115',
    componentName: 'Rolls-Royce AE 3007H / Oil Scavenge Pump Bearing 4',
    anomalyDetected: true,
    anomalyType: 'Acoustic Bearing Ring Resonance',
    failureRiskScore: 63.5,
    rulFlightHours: 72.0,
    confidenceScore: 0.887,
    vibrationTrend: 1.95,
    temperatureDelta: +12.4,
    recommendation: 'Schedule pre-mission vibration acoustic spectral test. Pre-allocate bearing assembly kit in supply inventory.',
    technicalOrder: 'TO 1Q-4B-2-79FI (Lube & Scavenge Maintenance)',
    urgency: 'Routine',
    createdAt: '2026-09-30T11:20:00Z'
  }
];

// Maintenance Schedules
export let maintenanceSchedules: MaintenanceScheduleItem[] = [
  {
    id: 'sched-101',
    aircraftId: 'AC-F023',
    tailNumber: 'AF-023',
    aircraftName: 'F-35A Lightning II',
    title: 'Hot Section Borescope & Vibration Damper Replace',
    type: 'Predictive',
    priority: 'Critical',
    status: 'Scheduled',
    scheduledStart: '2026-10-04T07:00:00Z',
    scheduledEnd: '2026-10-06T18:00:00Z',
    bayLocation: 'Hangar Bay 01 (Clean Environment)',
    estimatedHours: 28,
    assignedTeam: 'Propulsion Specialists Alpha Team',
    components: ['Pratt & Whitney F135-PW-100 Turbofan']
  },
  {
    id: 'sched-102',
    aircraftId: 'AC-T712',
    tailNumber: 'G-712',
    aircraftName: 'C-17A Globemaster III',
    title: 'Engine #3 Fan Blade Containment Shroud Overhaul',
    type: 'Corrective',
    priority: 'High',
    status: 'In Progress',
    scheduledStart: '2026-10-01T06:00:00Z',
    scheduledEnd: '2026-10-05T20:00:00Z',
    bayLocation: 'Depot Heavy Bay 04',
    estimatedHours: 72,
    assignedTeam: 'Depot Field Maintenance Squad',
    components: ['Pratt & Whitney F117-PW-100 Turbofan #3', 'Landing Gear']
  },
  {
    id: 'sched-103',
    aircraftId: 'AC-T104',
    tailNumber: 'H-104',
    aircraftName: 'C-130J Super Hercules',
    title: 'Gearbox SOAP Sampling & Prop Hub Dynamic Balance',
    type: 'Predictive',
    priority: 'Medium',
    status: 'Scheduled',
    scheduledStart: '2026-10-07T08:00:00Z',
    scheduledEnd: '2026-10-08T16:00:00Z',
    bayLocation: 'Flightline Quick-Turn Pad 2',
    estimatedHours: 14,
    assignedTeam: 'Tactical Airlift Crew Delta',
    components: ['Rolls-Royce AE 2100D3 Turboprop #2']
  },
  {
    id: 'sched-104',
    aircraftId: 'AC-F042',
    tailNumber: 'EX-042',
    aircraftName: 'F-15EX Eagle II',
    title: '200-Hour Phase Preventive Inspection',
    type: 'Preventive',
    priority: 'Low',
    status: 'Scheduled',
    scheduledStart: '2026-10-14T08:00:00Z',
    scheduledEnd: '2026-10-15T17:00:00Z',
    bayLocation: 'Hangar Bay 03',
    estimatedHours: 16,
    assignedTeam: 'Avionics & Airframe Strike Team',
    components: ['Avionics', 'Airframe']
  }
];

// Spare Parts Inventory
export let sparePartsInventory: SparePartItem[] = [
  {
    id: 'part-001',
    partNumber: 'F135-HPT-BLD-04',
    name: 'Turbine Rotor Blade Stage 1 (Thermal Coated)',
    category: 'Engine',
    stockQuantity: 4,
    minThreshold: 8,
    unitCost: 18500,
    leadTimeDays: 21,
    criticality: 'Critical',
    binLocation: 'Depot Secure Vault B-14',
    forecastDemand30d: 6,
    replenishmentStatus: 'Critical Shortage'
  },
  {
    id: 'part-002',
    partNumber: 'AE2100-GBX-BRG-12',
    name: 'Reduction Gearbox Planetary Bearing Set',
    category: 'Engine',
    stockQuantity: 6,
    minThreshold: 5,
    unitCost: 6400,
    leadTimeDays: 14,
    criticality: 'High',
    binLocation: 'Aisle 04, Shelf C',
    forecastDemand30d: 4,
    replenishmentStatus: 'In Stock'
  },
  {
    id: 'part-003',
    partNumber: 'C17-HYD-SEAL-90',
    name: 'Hydraulic Actuator Fluorosilicone Seal Kit',
    category: 'Hydraulic System',
    stockQuantity: 3,
    minThreshold: 10,
    unitCost: 1250,
    leadTimeDays: 7,
    criticality: 'High',
    binLocation: 'Aisle 02, Bin 18',
    forecastDemand30d: 8,
    replenishmentStatus: 'Reorder Suggested'
  },
  {
    id: 'part-004',
    partNumber: 'APG81-RX-MOD-01',
    name: 'AESA Radar Transmit/Receive MMIC Module',
    category: 'Avionics',
    stockQuantity: 12,
    minThreshold: 6,
    unitCost: 32000,
    leadTimeDays: 45,
    criticality: 'Medium',
    binLocation: 'ESD Safe Cleanroom 01',
    forecastDemand30d: 2,
    replenishmentStatus: 'In Stock'
  },
  {
    id: 'part-005',
    partNumber: 'MIL-H-83282-5G',
    name: 'Synthetic Hydrocarbon Fire-Resistant Hydraulic Fluid (5 Gal)',
    category: 'Hydraulic System',
    stockQuantity: 45,
    minThreshold: 20,
    unitCost: 450,
    leadTimeDays: 3,
    criticality: 'Low',
    binLocation: 'Hazmat Haz-03',
    forecastDemand30d: 18,
    replenishmentStatus: 'In Stock'
  },
  {
    id: 'part-006',
    partNumber: 'C130-PROP-DOW-06',
    name: 'Dowty R391 Composite Propeller Blade Assembly',
    category: 'Engine',
    stockQuantity: 2,
    minThreshold: 4,
    unitCost: 42000,
    leadTimeDays: 30,
    criticality: 'Critical',
    binLocation: 'Heavy Rack H-08',
    forecastDemand30d: 3,
    replenishmentStatus: 'Critical Shortage'
  }
];

// Notifications
export let notificationsList: FleetNotification[] = [
  {
    id: 'notif-001',
    aircraftId: 'AC-F023',
    tailNumber: 'AF-023',
    title: 'CRITICAL: Engine Vibration Exceedance',
    message: 'Aircraft AF-023 recorded sustained vibration of 2.82 IPS on PW135 HP turbine. RUL calculated at 38.5 flight hours. Action required immediately.',
    severity: 'Critical',
    timestamp: '2026-10-02T19:42:10Z',
    isRead: false,
    actionUrl: '/aircraft/AC-F023'
  },
  {
    id: 'notif-002',
    aircraftId: 'AC-T104',
    tailNumber: 'H-104',
    title: 'WARNING: Engine #2 Thermal Delta',
    message: 'Turboprop #2 exhaust gas temperature elevated by +18.2°C above baseline envelope.',
    severity: 'Warning',
    timestamp: '2026-10-02T14:18:00Z',
    isRead: false,
    actionUrl: '/aircraft/AC-T104'
  },
  {
    id: 'notif-003',
    title: 'INVENTORY SHORTAGE: Turbine Rotor Blades',
    message: 'Part F135-HPT-BLD-04 stock is 4 units (minimum threshold: 8 units). Procurement requisition auto-drafted.',
    severity: 'Inventory Shortage',
    timestamp: '2026-10-02T11:00:00Z',
    isRead: true,
    actionUrl: '/inventory'
  },
  {
    id: 'notif-004',
    aircraftId: 'AC-T712',
    tailNumber: 'G-712',
    title: 'MAINTENANCE DUE: Depot Tear-Down Inspection',
    message: 'C-17A tail G-712 currently in Heavy Bay 04. Estimated turnaround time remaining: 36 hours.',
    severity: 'Maintenance Due',
    timestamp: '2026-10-01T09:15:00Z',
    isRead: true,
    actionUrl: '/maintenance'
  },
  {
    id: 'notif-005',
    aircraftId: 'AC-U115',
    tailNumber: 'GH-115',
    title: 'AI PREDICTION: Acoustic Resonant Shift',
    message: 'Predictive neural model identified micro-spalling signature in bearing assembly with 88.7% confidence.',
    severity: 'AI Prediction Alert',
    timestamp: '2026-09-30T11:25:00Z',
    isRead: true,
    actionUrl: '/predictive'
  }
];

// Helper calculations for Fleet metrics
export function computeFleetMetrics() {
  const total = initialAircraft.length;
  let operational = 0;
  let warning = 0;
  let maintenance = 0;
  let critical = 0;

  const categories = {
    Fighter: { total: 0, healthy: 0, warning: 0, critical: 0, maintenance: 0 },
    Transport: { total: 0, healthy: 0, warning: 0, critical: 0, maintenance: 0 },
    UAV: { total: 0, healthy: 0, warning: 0, critical: 0, maintenance: 0 }
  };

  initialAircraft.forEach(ac => {
    if (ac.status === 'Operational') operational++;
    else if (ac.status === 'Warning') warning++;
    else if (ac.status === 'Maintenance') maintenance++;
    else if (ac.status === 'Critical') critical++;

    const cat = categories[ac.category];
    if (cat) {
      cat.total++;
      if (ac.status === 'Operational') cat.healthy++;
      else if (ac.status === 'Warning') cat.warning++;
      else if (ac.status === 'Critical') cat.critical++;
      else if (ac.status === 'Maintenance') cat.maintenance++;
    }
  });

  const availabilityPct = Math.round((operational / total) * 1000) / 10;

  return {
    total,
    operational,
    warning,
    maintenance,
    critical,
    availabilityPct,
    categories,
    mtbfHours: 412.5,
    missionReadinessRate: 78.4
  };
}

// Telemetry Jitter / Live Stream update function
export function getLiveTelemetry(aircraftId: string) {
  const ac = initialAircraft.find(a => a.id === aircraftId) || initialAircraft[0];
  const jitter = (Math.random() - 0.5) * 0.05;
  const jitterTemp = (Math.random() - 0.5) * 4;
  const jitterVibe = (Math.random() - 0.5) * 0.08;

  return {
    aircraftId: ac.id,
    tailNumber: ac.tailNumber,
    timestamp: new Date().toISOString(),
    rpm: Math.round((ac.components[0]?.rpm || 98.0) * (1 + jitter) * 10) / 10,
    temperature: Math.round(((ac.components[0]?.temperature || 620) + jitterTemp) * 10) / 10,
    vibration: Math.round(((ac.components[0]?.vibration || 2.4) + jitterVibe) * 100) / 100,
    oilPressure: Math.round(((ac.components[0]?.oilPressure || 48) + jitter * 10) * 10) / 10,
    fuelFlow: Math.round(((ac.components[0]?.fuelFlow || 3850) + jitter * 200)),
    hydraulicPressure: Math.round(((ac.components.find(c => c.type === 'Hydraulic System')?.pressure || 2980) + jitter * 50)),
    voltage: Math.round((270.0 + (Math.random() - 0.5) * 1.5) * 10) / 10,
    healthScore: ac.healthScore,
    rulHours: ac.components[0]?.rulHours || 42
  };
}
