import re

with open('src/types/fleet.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_types = """
export interface MaintenanceRecord {
  id: string;
  aircraftId: string;
  tailNumber: string;
  componentId: string;
  componentName: string;
  actionTaken: string;
  replacedPartId?: string;
  replacedPartName?: string;
  agencyId: string;
  agencyName: string;
  dateCompleted: string;
  downtimeHours: number;
  cost: number;
  techId: string;
  notes: string;
}

export interface MaintenanceAgency {
  id: string;
  name: string;
  location: string;
  tier: 'Tier 1 (Base)' | 'Tier 2 (Regional)' | 'Tier 3 (Depot)';
  status: 'Available' | 'At Capacity' | 'Offline';
  activeWorkOrders: number;
  averageTurnaroundHours: number;
  certificationLevel: string;
}

export interface FailurePrediction {
  id: string;
  aircraftId: string;
  componentId: string;
  componentName: string;
  probabilityScore: number; // 0-100%
  predictedTimeOfFailure: number; // flight hours remaining
  contributingFactors: string[];
  aiConfidence: number;
  recommendedAgencyId?: string;
}

export interface MaintenanceAnalytics {
  mtbfHours: number;      // Mean Time Between Failures
  mttrHours: number;      // Mean Time To Repair
  fleetDowntimePct: number; // % of time fleet is down
  totalMaintenanceCost: number;
  activeWorkOrdersCount: number;
}
"""

content = content + "\n" + new_types

with open('src/types/fleet.ts', 'w', encoding='utf-8') as f:
    f.write(content)
