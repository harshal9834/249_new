import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Update createNewAircraft
new_create = """export function createNewAircraft(name: string, category: FleetCategory): Aircraft {
    const id = generateId();
    const tailNumber = `SIM-${Math.floor(Math.random() * 9000) + 1000}`;
    
    const compTypes = ['Engine', 'Fuel System', 'Hydraulic System', 'Avionics', 'Electrical System', 'Landing Gear', 'Airframe'] as const;
    
    const components: AircraftComponent[] = compTypes.map(type => {
        const health = 100;
        return {
            id: generateId(),
            name: `${type} Unit`,
            type,
            serialNumber: `SN-${Math.floor(Math.random() * 10000)}`,
            healthScore: health,
            status: 'Operational',
            riskLevel: 'Low',
            rulHours: 500,
            temperature: type === 'Engine' ? 620 : 40,
            vibration: type === 'Engine' ? 0.8 : 0.1,
            pressure: 3000,
            oilPressure: type === 'Engine' ? 45 : undefined,
            rpm: type === 'Engine' ? 0 : undefined,
            fuelFlow: type === 'Engine' ? 0 : undefined,
            fuelLevel: type === 'Fuel System' ? 100 : undefined,
            voltage: type === 'Electrical System' ? 28 : undefined,
            trend: 'stable',
            maintenanceHistory: []
        };
    });
    
    return {
        id,
        name,
        tailNumber,
        category,
        status: 'Operational',
        healthScore: 100,
        riskLevel: 'Low',
        flightHours: Math.floor(Math.random() * 2000),
        missionHours: Math.floor(Math.random() * 50),
        lastMaintenance: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        nextInspection: new Date(Date.now() + Math.random() * 10000000000).toISOString(),
        squadron: '1st Fighter Wing',
        baseStation: 'Langley AFB',
        callSign: `GHOST-${Math.floor(Math.random() * 99)}`,
        enginesCount: category === 'Fighter' ? 1 : category === 'Transport' ? 4 : 1,
        operatingMode: 'Cruise',
        activeFaults: [],
        components
    };
}"""

content = re.sub(
    r"export function createNewAircraft[\s\S]*?components\n    };\n}",
    new_create,
    content
)

# Replace tickSimulation entirely
tick_logic = """
    tickSimulation: () => set((state) => {
        if (!state.isSimulating) return state;

        const modeTargets: Record<string, { rpm: number, baseTemp: number }> = {
            'Ground Idle': { rpm: 3000, baseTemp: 400 },
            'Taxi': { rpm: 4500, baseTemp: 450 },
            'Takeoff': { rpm: 15500, baseTemp: 900 },
            'Climb': { rpm: 13500, baseTemp: 800 },
            'Cruise': { rpm: 11500, baseTemp: 600 },
            'Loiter': { rpm: 9500, baseTemp: 550 },
            'Descent': { rpm: 7000, baseTemp: 500 },
            'Landing': { rpm: 5000, baseTemp: 450 }
        };

        const newList = state.aircraftList.map(ac => {
            const faults = ac.activeFaults || [];
            
            // Randomly switch modes occasionally (1% chance per tick) if not faulted heavily
            let currentMode = ac.operatingMode || 'Cruise';
            if (Math.random() < 0.01 && faults.length === 0) {
                const modes = ['Cruise', 'Loiter', 'Climb', 'Descent'];
                currentMode = modes[Math.floor(Math.random() * modes.length)] as any;
            }
            if (faults.includes('Engine Overheat') || faults.includes('Fuel Leak') || faults.includes('Hydraulic Failure') || faults.includes('High Vibration')) {
                // If critical fault, force descent/landing
                if (currentMode !== 'Landing' && currentMode !== 'Ground Idle') {
                    currentMode = 'Descent';
                }
            }

            const targetModeParams = modeTargets[currentMode];
            let targetRpm = targetModeParams.rpm + (Math.random() * 400 - 200);

            const updatedComponents = ac.components.map(c => {
                let health = c.healthScore;
                
                // Continuous degradation
                health -= 0.005; 
                
                let trend: 'stable' | 'degrading' | 'improving' | 'critical_spike' = 'stable';

                if (c.type === 'Engine') {
                    let rpm = c.rpm || 0;
                    let temp = c.temperature || 0;
                    let vib = c.vibration || 0.8;
                    let oil = c.oilPressure || 45;
                    let flow = c.fuelFlow || 0;

                    // Apply physics (smooth transitions)
                    rpm += (targetRpm - rpm) * 0.1;
                    
                    let targetTemp = targetModeParams.baseTemp + (rpm / 15500) * 150 + (Math.random() * 5);
                    if (faults.includes('Engine Overheat')) {
                        targetTemp += 400; // Continuous climb
                        health -= 0.1; // Rapid wear
                        trend = 'critical_spike';
                    }
                    temp += (targetTemp - temp) * 0.05;

                    let baseVib = 0.5 + ((100 - health) * 0.02);
                    if (faults.includes('High Vibration')) {
                        baseVib += 2.5;
                        health -= 0.15;
                        trend = 'critical_spike';
                    }
                    vib += (baseVib - vib) * 0.2 + (Math.random() * 0.1 - 0.05);

                    let targetOil = 45 + (rpm / 15500) * 15;
                    if (faults.includes('Hydraulic Failure')) {
                        targetOil = 15;
                        health -= 0.05;
                    }
                    oil += (targetOil - oil) * 0.1;

                    flow = 200 + (rpm / 15500) * 1200 + (Math.random() * 10);
                    if (faults.includes('Fuel Leak')) flow += 500;

                    return { ...c, healthScore: Math.max(0, health), rpm, temperature: temp, vibration: vib, oilPressure: oil, fuelFlow: flow, trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }

                if (c.type === 'Fuel System') {
                    let fuel = c.fuelLevel || 100;
                    fuel -= 0.005; // Normal burn
                    if (faults.includes('Fuel Leak')) {
                        fuel -= 0.2; // Fast drop
                        health -= 0.05;
                        trend = 'critical_spike';
                    }
                    return { ...c, healthScore: Math.max(0, health), fuelLevel: Math.max(0, fuel), trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }

                if (c.type === 'Hydraulic System') {
                    let pres = c.pressure || 3000;
                    if (faults.includes('Hydraulic Failure')) {
                        pres -= (pres - 500) * 0.1; // Drops towards 500
                        health -= 0.1;
                        trend = 'critical_spike';
                    } else {
                        pres = 3000 + (Math.random() * 100 - 50);
                    }
                    return { ...c, healthScore: Math.max(0, health), pressure: pres, trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }

                if (c.type === 'Electrical System') {
                    let volt = c.voltage || 28;
                    if (faults.includes('Electrical Failure')) {
                        volt = 28 + (Math.random() * 10 - 5); // Erratic
                        health -= 0.08;
                        trend = 'critical_spike';
                    } else {
                        volt = 28 + (Math.random() * 0.4 - 0.2);
                    }
                    return { ...c, healthScore: Math.max(0, health), voltage: volt, trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }

                if (c.type === 'Avionics') {
                    if (faults.includes('Avionics Failure')) {
                        health -= 0.1;
                        trend = 'critical_spike';
                    }
                    return { ...c, healthScore: Math.max(0, health), trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }
                
                if (c.type === 'Landing Gear') {
                    if (faults.includes('Landing Gear Failure')) {
                        health -= 0.1;
                        trend = 'critical_spike';
                    }
                    return { ...c, healthScore: Math.max(0, health), trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }

                return { ...c, healthScore: Math.max(0, health), trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
            });

            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));
            return {
                ...ac,
                operatingMode: currentMode,
                flightHours: ac.flightHours + (1 / 3600), // continuous increment
                components: updatedComponents,
                healthScore: overallHealth,
                status: calculateStatus(overallHealth),
                riskLevel: calculateRiskLevel(overallHealth)
            };
        });

        // AI Failure Probability Prediction Calculation
        const newPredictions: FailurePrediction[] = [];
        newList.forEach(ac => {
            ac.components.forEach(c => {
                let prob = (100 - c.healthScore);
                if (c.type === 'Engine' && c.vibration && c.vibration > 1.5) prob += 15;
                if (c.type === 'Engine' && c.temperature && c.temperature > 800) prob += 15;
                prob = Math.min(99, Math.max(1, prob));
                
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
        
        const newAnalytics = { ...state.analytics };
        if (Math.random() > 0.9) {
            newAnalytics.mtbfHours = Math.max(100, newAnalytics.mtbfHours - (Math.random() * 2));
            newAnalytics.fleetDowntimePct = Math.min(100, newAnalytics.fleetDowntimePct + (Math.random() * 0.1));
        }

        newList.forEach(ac => publishTelemetry(ac));
        return { aircraftList: newList, predictions: newPredictions.sort((a,b) => b.probabilityScore - a.probabilityScore), analytics: newAnalytics };
    }),
"""

content = re.sub(
    r"tickSimulation:\s*\(\)\s*=>\s*set\(\(state\)\s*=>\s*\{[\s\S]*?analytics:\s*newAnalytics\s*\};\s*\}\),",
    tick_logic,
    content
)

# Update injectFault to push to activeFaults
inject_fault_logic = """
    injectFault: (aircraftId, componentType, faultName) => set((state) => {
        const newList = state.aircraftList.map(ac => {
            if (ac.id !== aircraftId) return ac;
            const currentFaults = ac.activeFaults || [];
            if (!currentFaults.includes(faultName)) {
                return { ...ac, activeFaults: [...currentFaults, faultName] };
            }
            return ac;
        });

        publishFault(aircraftId, faultName);
        return { aircraftList: newList };
    }),
"""

content = re.sub(
    r"injectFault:\s*\(aircraftId,\s*componentType,\s*faultName\)\s*=>\s*set\(\(state\)\s*=>\s*\{[\s\S]*?publishFault\(aircraftId,\s*faultName\);\s*return\s*\{\s*aircraftList:\s*newList\s*\};\s*\}\),",
    inject_fault_logic,
    content
)


# Also in performMaintenance, we should CLEAR active faults when repaired
clear_faults = """
            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));
            return {
                ...a,
                activeFaults: [],
"""
content = content.replace(
    """const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));
            return {
                ...a,""",
    clear_faults
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
