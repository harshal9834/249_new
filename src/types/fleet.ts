// AeroPulse AI - Common TypeScript Types

export type FleetCategory = 'Fighter' | 'Transport' | 'UAV';
export type AircraftStatus = 'Operational' | 'Warning' | 'Maintenance' | 'Critical';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type UserRole = 'Admin' | 'Fleet Commander' | 'Maintenance Officer' | 'Viewer';

export interface AircraftComponent {
  id: string;
  name: string;
  type: 'Engine' | 'Fuel System' | 'Hydraulic System' | 'Avionics' | 'Electrical System' | 'Landing Gear' | 'Airframe';
  serialNumber: string;
  healthScore: number;
  status: AircraftStatus;
  riskLevel: RiskLevel;
  rulHours: number;
  temperature: number; // °C
  vibration: number; // IPS
  pressure: number; // PSI
  fuelFlow?: number; // PPH
  voltage?: number; // Volts
  oilPressure?: number; // PSI
  rpm?: number;
  trend: 'stable' | 'degrading' | 'improving' | 'critical_spike';
  maintenanceHistory: Array<{
    date: string;
    type: string;
    action: string;
    tech: string;
  }>;
}

export interface Aircraft {
  id: string;
  name: string;
  tailNumber: string;
  category: FleetCategory;
  status: AircraftStatus;
  healthScore: number;
  riskLevel: RiskLevel;
  flightHours: number;
  missionHours: number;
  lastMaintenance: string;
  nextInspection: string;
  squadron: string;
  baseStation: string;
  callSign: string;
  enginesCount: number;
  components: AircraftComponent[];
}

export interface FleetMetrics {
  total: number;
  operational: number;
  warning: number;
  maintenance: number;
  critical: number;
  availabilityPct: number;
  categories: {
    Fighter: { total: number; healthy: number; warning: number; critical: number; maintenance: number };
    Transport: { total: number; healthy: number; warning: number; critical: number; maintenance: number };
    UAV: { total: number; healthy: number; warning: number; critical: number; maintenance: number };
  };
  mtbfHours: number;
  missionReadinessRate: number;
}

export interface PredictiveInsight {
  id: string;
  aircraftId: string;
  aircraftName: string;
  tailNumber: string;
  componentName: string;
  anomalyDetected: boolean;
  anomalyType: string;
  failureRiskScore: number;
  rulFlightHours: number;
  confidenceScore: number;
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
  priority: RiskLevel;
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
  criticality: RiskLevel;
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

export interface EngineStageData {
  id: string;
  name: string;
  healthScore: number;
  rpm: number;
  temperature: number;
  fuelFlow: number;
  vibration: number;
  oilPressure: number;
  rul: number;
  status: AircraftStatus;
  diagnostics: string;
}
