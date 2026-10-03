import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports for new types
imports_old = "import { Aircraft, AircraftStatus, AircraftComponent, FleetCategory, RiskLevel, FleetMetrics, PredictiveInsight } from '../types/fleet';"
imports_new = "import { Aircraft, AircraftStatus, AircraftComponent, FleetCategory, RiskLevel, FleetMetrics, PredictiveInsight, SparePartItem, MaintenanceRecord, MaintenanceAgency, FailurePrediction, MaintenanceAnalytics } from '../types/fleet';"
content = content.replace(imports_old, imports_new)

# Add new state fields to SimulatorState interface
state_iface_old = """    getMetrics: () => FleetMetrics;
    getInsights: () => PredictiveInsight[];
}"""
state_iface_new = """    inventory: SparePartItem[];
    maintenanceRecords: MaintenanceRecord[];
    agencies: MaintenanceAgency[];
    predictions: FailurePrediction[];
    analytics: MaintenanceAnalytics;
    
    performMaintenance: (aircraftId: string, componentType: string, agencyId: string) => void;
    restockPart: (partId: string, quantity: number) => void;
    
    getMetrics: () => FleetMetrics;
    getInsights: () => PredictiveInsight[];
}"""
content = content.replace(state_iface_old, state_iface_new)

# Add initial state for the new properties
initial_state = """
    inventory: [
        { id: 'p1', partNumber: 'ENG-F135-01', name: 'Turbofan Compressor Blade', category: 'Propulsion', stockQuantity: 42, minThreshold: 15, unitCost: 12500, leadTimeDays: 45, criticality: 'High', binLocation: 'A1-B2', forecastDemand30d: 12, replenishmentStatus: 'In Stock' },
        { id: 'p2', partNumber: 'HYD-ACT-09', name: 'Hydraulic Actuator', category: 'Hydraulics', stockQuantity: 8, minThreshold: 10, unitCost: 4500, leadTimeDays: 14, criticality: 'High', binLocation: 'C4-D1', forecastDemand30d: 5, replenishmentStatus: 'Reorder Suggested' },
        { id: 'p3', partNumber: 'AVI-RAD-33', name: 'AESA Radar Module', category: 'Avionics', stockQuantity: 2, minThreshold: 5, unitCost: 85000, leadTimeDays: 120, criticality: 'Critical', binLocation: 'SEC-Vault', forecastDemand30d: 1, replenishmentStatus: 'Critical Shortage' }
    ],
    maintenanceRecords: [],
    agencies: [
        { id: 'ag1', name: '388th Maintenance Group (Base)', location: 'Hill AFB', tier: 'Tier 1 (Base)', status: 'Available', activeWorkOrders: 2, averageTurnaroundHours: 12, certificationLevel: 'Flightline' },
        { id: 'ag2', name: 'Ogden Air Logistics Complex (Depot)', location: 'Hill AFB', tier: 'Tier 3 (Depot)', status: 'At Capacity', activeWorkOrders: 15, averageTurnaroundHours: 144, certificationLevel: 'Heavy Overhaul' }
    ],
    predictions: [],
    analytics: { mtbfHours: 450, mttrHours: 14.5, fleetDowntimePct: 12.4, totalMaintenanceCost: 1250000, activeWorkOrdersCount: 4 },
"""

content = content.replace("isSimulating: false,", "isSimulating: false," + initial_state)

# Implement the new actions
actions = """
    performMaintenance: (aircraftId, componentType, agencyId) => set((state) => {
        const agency = state.agencies.find(a => a.id === agencyId);
        const ac = state.aircraftList.find(a => a.id === aircraftId);
        if (!ac || !agency) return state;
        
        const comp = ac.components.find(c => c.type === componentType);
        if (!comp) return state;

        // Reduce spare part if exists
        const newInv = [...state.inventory];
        const partMatch = newInv.find(p => p.name.includes(comp.name.split(' ')[0]) || comp.name.includes(p.category));
        let replacedPartId = undefined;
        let replacedPartName = undefined;
        let cost = 5000;
        
        if (partMatch && partMatch.stockQuantity > 0) {
            partMatch.stockQuantity -= 1;
            if (partMatch.stockQuantity < partMatch.minThreshold) partMatch.replenishmentStatus = 'Reorder Suggested';
            if (partMatch.stockQuantity === 0) partMatch.replenishmentStatus = 'Critical Shortage';
            replacedPartId = partMatch.partNumber;
            replacedPartName = partMatch.name;
            cost += partMatch.unitCost;
        }

        // Create tech record
        const record: MaintenanceRecord = {
            id: generateId(),
            aircraftId: ac.id,
            tailNumber: ac.tailNumber,
            componentId: comp.id,
            componentName: comp.name,
            actionTaken: `Replaced/Repaired ${comp.name} due to degradation.`,
            replacedPartId,
            replacedPartName,
            agencyId: agency.id,
            agencyName: agency.name,
            dateCompleted: new Date().toISOString(),
            downtimeHours: agency.averageTurnaroundHours + (Math.random() * 5),
            cost,
            techId: `T-${Math.floor(Math.random() * 9000)+1000}`,
            notes: 'Completed per technical order standards.'
        };

        // Fix the component
        const newList = state.aircraftList.map(a => {
            if (a.id !== aircraftId) return a;
            const updatedComponents = a.components.map(c => {
                if (c.type === componentType) {
                    return {
                        ...c,
                        healthScore: 100,
                        status: 'Operational',
                        riskLevel: 'Low',
                        trend: 'improving',
                        rulHours: 500,
                        temperature: c.type === 'Engine' ? 620 : 40,
                        vibration: c.type === 'Engine' ? 0.8 : 0.1,
                        maintenanceHistory: [{
                            date: record.dateCompleted,
                            type: 'Corrective',
                            action: record.actionTaken,
                            tech: record.techId
                        }, ...c.maintenanceHistory]
                    };
                }
                return c;
            });
            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));
            return {
                ...a,
                components: updatedComponents,
                healthScore: overallHealth,
                status: calculateStatus(overallHealth),
                riskLevel: calculateRiskLevel(overallHealth)
            };
        });

        // Update analytics MTTR & Downtime slightly based on this record
        const newAnalytics = { ...state.analytics };
        newAnalytics.totalMaintenanceCost += cost;
        newAnalytics.mttrHours = ((newAnalytics.mttrHours * state.maintenanceRecords.length) + record.downtimeHours) / (state.maintenanceRecords.length + 1);

        return { 
            aircraftList: newList, 
            inventory: newInv,
            maintenanceRecords: [record, ...state.maintenanceRecords],
            analytics: newAnalytics
        };
    }),
    
    restockPart: (partId, quantity) => set((state) => {
        const newInv = state.inventory.map(p => {
            if (p.id === partId) {
                const newQ = p.stockQuantity + quantity;
                return {
                    ...p,
                    stockQuantity: newQ,
                    replenishmentStatus: newQ > p.minThreshold ? 'In Stock' : (newQ === 0 ? 'Critical Shortage' : 'Reorder Suggested')
                };
            }
            return p;
        });
        return { inventory: newInv };
    }),
"""

content = content.replace("setComponentHealth: (aircraftId, compType, health) => set((state) => {", actions + "\n    setComponentHealth: (aircraftId, compType, health) => set((state) => {")


# Update tickSimulation to generate AI failure predictions dynamically
tick_sim_ext = """
            // AI Failure Probability Prediction Calculation
            const newPredictions: FailurePrediction[] = [];
            newList.forEach(ac => {
                ac.components.forEach(c => {
                    // Calculate probability of failure based on health and vibration/temp
                    let prob = (100 - c.healthScore);
                    if (c.type === 'Engine' && c.vibration && c.vibration > 1.5) prob += 15;
                    if (c.type === 'Engine' && c.temperature && c.temperature > 800) prob += 15;
                    
                    prob = Math.min(99, Math.max(1, prob)); // Bound between 1 and 99
                    
                    if (prob > 30) {
                        newPredictions.push({
                            id: generateId(),
                            aircraftId: ac.id,
                            componentId: c.id,
                            componentName: c.name,
                            probabilityScore: prob,
                            predictedTimeOfFailure: Math.max(1, c.rulHours * (100-prob)/100),
                            contributingFactors: prob > 70 ? ['Extreme Wear', 'Thermal Stress'] : ['Normal Degradation'],
                            aiConfidence: 80 + (Math.random() * 15),
                            recommendedAgencyId: prob > 80 ? 'ag2' : 'ag1'
                        });
                    }
                });
            });
            
            // Randomly slightly shift MTBF down if degrading
            const newAnalytics = { ...state.analytics };
            if (Math.random() > 0.9) {
                newAnalytics.mtbfHours = Math.max(100, newAnalytics.mtbfHours - (Math.random() * 2));
                newAnalytics.fleetDowntimePct = Math.min(100, newAnalytics.fleetDowntimePct + (Math.random() * 0.1));
            }

            return { aircraftList: newList, predictions: newPredictions.sort((a,b) => b.probabilityScore - a.probabilityScore), analytics: newAnalytics };
"""

# Need to replace the end of tickSimulation. 
# Look for "return { aircraftList: newList };" inside tickSimulation and replace it.
content = content.replace("return { aircraftList: newList };\n    }),\n    \n    generateFleet:", tick_sim_ext + "\n    }),\n    \n    generateFleet:")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
