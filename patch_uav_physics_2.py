import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update publishTelemetry
new_publish = """const publishTelemetry = (aircraft: Aircraft) => {
    const engine = aircraft.components.find(c => c.type === 'Engine');
    const fuel = aircraft.components.find(c => c.type === 'Fuel System');
    const hyd = aircraft.components.find(c => c.type === 'Hydraulic System');
    const avi = aircraft.components.find(c => c.type === 'Avionics');
    const elec = aircraft.components.find(c => c.type === 'Electrical System');
    const gear = aircraft.components.find(c => c.type === 'Landing Gear');
    const airframe = aircraft.components.find(c => c.type === 'Airframe');
    
    fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            aircraftId: aircraft.id,
            rpm: engine?.rpm || 0,
            temperature: engine?.temperature || 0,
            vibration: engine?.vibration || 0,
            oilPressure: engine?.oilPressure || 0,
            fuelFlow: engine?.fuelFlow || 0,
            throttle: aircraft.throttle,
            speed: aircraft.speed,
            altitude: aircraft.altitude,
            outsideAirTemp: aircraft.outsideAirTemp,
            weight: aircraft.weight,
            engineLoad: aircraft.engineLoad,
            climbRate: aircraft.climbRate,
            heading: aircraft.heading,
            bankAngle: aircraft.bankAngle,
            pitchAngle: aircraft.pitchAngle,
            verticalSpeed: aircraft.verticalSpeed,
            healthScores: {"""
content = re.sub(
    r"const publishTelemetry = \(aircraft: Aircraft\) => \{[\s\S]*?healthScores: \{",
    new_publish,
    content
)

# 2. Update createNewAircraft
new_create = """enginesCount: category === 'Fighter' ? 1 : category === 'Transport' ? 4 : 1,
        operatingMode: 'Ground Idle',
        activeFaults: [],
        throttle: 5,
        speed: 0,
        altitude: 0,
        outsideAirTemp: 15,
        weight: category === 'Fighter' ? 45000 : category === 'Transport' ? 120000 : 5000,
        engineLoad: 5,
        climbRate: 0,
        heading: 360,
        bankAngle: 0,
        pitchAngle: 0,
        verticalSpeed: 0,
        humidity: 45,
        windSpeed: 12,
        ambientPressure: 1013,
        payloadWeight: 5000,
        components"""
content = re.sub(
    r"enginesCount:.*?\n\s*operatingMode:.*?\n\s*activeFaults:.*?\n\s*throttle:.*?\n\s*speed:.*?\n\s*altitude:.*?\n\s*outsideAirTemp:.*?\n\s*weight:.*?\n\s*engineLoad:.*?\n\s*components",
    new_create,
    content,
    flags=re.DOTALL
)

# 3. Update tickSimulation to compute flight dynamics
tick_logic = """
    tickSimulation: () => set((state) => {
        if (!state.isSimulating) return state;

        const dt = 0.1; // 100ms simulation step

        const newList = state.aircraftList.map(ac => {
            const faults = ac.activeFaults || [];
            let currentMode = ac.operatingMode || 'Ground Idle';

            if (Math.random() < 0.001 && faults.length === 0) {
                const progression: Record<string, string> = {
                    'Ground Idle': 'Taxi', 'Taxi': 'Takeoff', 'Takeoff': 'Climb', 'Climb': 'Cruise',
                    'Cruise': 'Loiter', 'Loiter': 'Descent', 'Descent': 'Landing', 'Landing': 'Ground Idle'
                };
                currentMode = (progression[currentMode] || 'Cruise') as any;
            }

            if (faults.includes('Engine Overheat') || faults.includes('Fuel Leak') || faults.includes('Hydraulic Failure') || faults.includes('High Vibration')) {
                if (currentMode !== 'Landing' && currentMode !== 'Ground Idle') {
                    currentMode = 'Descent';
                }
            }

            let targetThrottle = 0;
            let targetRpm = 0;
            let targetPitch = 0;
            let targetBank = 0;

            switch (currentMode) {
                case 'Ground Idle': targetThrottle = 5; targetRpm = 1100; targetPitch = 0; targetBank = 0; break;
                case 'Taxi': targetThrottle = 15; targetRpm = 1600; targetPitch = 0; targetBank = (Math.random() > 0.5 ? 5 : -5); break;
                case 'Takeoff': targetThrottle = 100; targetRpm = 5600; targetPitch = 15; targetBank = 0; break;
                case 'Climb': targetThrottle = 85; targetRpm = 5250; targetPitch = 10; targetBank = (Math.random() > 0.8 ? 2 : -2); break;
                case 'Cruise': targetThrottle = 65; targetRpm = 4500; targetPitch = 2; targetBank = 0; break;
                case 'Loiter': targetThrottle = 50; targetRpm = 3500; targetPitch = 1; targetBank = 15; break;
                case 'Descent': targetThrottle = 25; targetRpm = 3000; targetPitch = -5; targetBank = 0; break;
                case 'Landing': targetThrottle = 40; targetRpm = 3800; targetPitch = 3; targetBank = 0; break;
            }

            let throttle = ac.throttle || 0;
            let speed = ac.speed || 0;
            let altitude = ac.altitude || 0;
            let heading = ac.heading || 360;
            let pitchAngle = ac.pitchAngle || 0;
            let bankAngle = ac.bankAngle || 0;
            
            throttle += (targetThrottle - throttle) * (dt * 0.5);
            pitchAngle += (targetPitch - pitchAngle) * (dt * 1.0);
            bankAngle += (targetBank - bankAngle) * (dt * 0.5);
            
            // Turn rate based on bank angle
            let turnRate = bankAngle * 0.1; 
            heading = (heading + turnRate * dt) % 360;
            if (heading < 0) heading += 360;

            // Vertical Speed logic based on pitch and speed
            let verticalSpeed = 0;

            if (currentMode === 'Takeoff') { speed += 4 * dt; if(speed>150) verticalSpeed = 80; }
            else if (currentMode === 'Climb') { speed += (300 - speed)*0.02; verticalSpeed = 300; }
            else if (currentMode === 'Cruise') { speed += (450 - speed)*0.01; verticalSpeed = (30000 - altitude)*0.1; }
            else if (currentMode === 'Loiter') { speed += (300 - speed)*0.01; verticalSpeed = (20000 - altitude)*0.1; }
            else if (currentMode === 'Descent') { speed += (250 - speed)*0.02; verticalSpeed = -200; }
            else if (currentMode === 'Landing') { speed += (140 - speed)*0.05; verticalSpeed = altitude > 0 ? -100 : 0; }
            else if (currentMode === 'Ground Idle') { altitude = 0; speed += (0 - speed)*0.2; }
            else if (currentMode === 'Taxi') { altitude = 0; speed += (20 - speed)*0.1; }
            
            altitude += verticalSpeed * dt;
            altitude = Math.max(0, altitude);
            speed = Math.max(0, speed);

            let oat = 15 - (altitude / 1000) * 1.98;
            
            let weight = ac.weight || 40000;
            let engineLoad = (throttle * 0.8) + (weight / 50000 * 15) + (currentMode === 'Climb' ? 10 : 0);

            const updatedComponents = ac.components.map(c => {
                let health = c.healthScore;
                health -= 0.0001; 
                let trend: 'stable' | 'degrading' | 'improving' | 'critical_spike' = 'stable';

                if (c.type === 'Engine') {
                    let rpm = c.rpm || 0;
                    let temp = c.temperature || 0;
                    let vib = c.vibration || 0.8;
                    let oil = c.oilPressure || 45;
                    let flow = c.fuelFlow || 0;

                    rpm += (targetRpm - rpm) * (dt * 0.5);
                    let targetTemp = oat + (rpm / 5800) * 700 + (engineLoad * 2);
                    if (faults.includes('Engine Overheat')) {
                        targetTemp += 500; health -= 0.02; trend = 'critical_spike';
                    }
                    temp += (targetTemp - temp) * (dt * 0.2);

                    let baseVib = 0.2 + (engineLoad / 100) * 0.5 + ((100 - health) / 100) * 1.5;
                    if (faults.includes('High Vibration')) {
                        baseVib += 3.0; health -= 0.03; trend = 'critical_spike';
                    }
                    vib += (baseVib - vib) * 0.2 + (Math.random() * 0.05 - 0.025);

                    let targetOil = 30 + (rpm / 5800) * 50;
                    if (health < 80) targetOil -= (80 - health) * 0.5;
                    oil += (targetOil - oil) * (dt * 0.5);

                    flow = (rpm / 5800) * 400 + (engineLoad / 100) * 100;
                    if (faults.includes('Fuel Leak')) flow += 200 + Math.random() * 50;

                    return { ...c, healthScore: Math.max(0, health), rpm, temperature: temp, vibration: vib, oilPressure: oil, fuelFlow: flow, trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }

                if (c.type === 'Fuel System') {
                    let fuel = c.fuelLevel || 100;
                    const eng = ac.components.find(e => e.type === 'Engine');
                    const burnRate = eng?.fuelFlow || 0;
                    fuel -= (burnRate / 3600 / 10) * 0.01; 
                    
                    if (faults.includes('Fuel Leak')) {
                        fuel -= 0.05; health -= 0.01; trend = 'critical_spike';
                    }
                    weight = (ac.payloadWeight || 5000) + 20000 + (fuel * 50); 
                    return { ...c, healthScore: Math.max(0, health), fuelLevel: Math.max(0, fuel), trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }

                if (c.type === 'Hydraulic System') {
                    let pres = c.pressure || 3000;
                    if (faults.includes('Hydraulic Failure')) {
                        pres -= (pres - 200) * (dt * 0.5); health -= 0.02; trend = 'critical_spike';
                    } else {
                        pres = 3000 + (Math.random() * 50 - 25);
                    }
                    return { ...c, healthScore: Math.max(0, health), pressure: pres, trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }

                if (c.type === 'Electrical System') {
                    let volt = c.voltage || 28;
                    if (faults.includes('Electrical Failure')) {
                        volt = 28 + (Math.random() * 6 - 3); health -= 0.02; trend = 'critical_spike';
                    } else {
                        volt = 28 + (Math.random() * 0.2 - 0.1);
                    }
                    return { ...c, healthScore: Math.max(0, health), voltage: volt, trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }

                if (c.type === 'Avionics') {
                    if (faults.includes('Avionics Failure')) { health -= 0.02; trend = 'critical_spike'; }
                    return { ...c, healthScore: Math.max(0, health), trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }
                
                if (c.type === 'Landing Gear') {
                    if (faults.includes('Landing Gear Failure') || faults.includes('Hydraulic Failure')) { health -= 0.01; trend = 'critical_spike'; }
                    return { ...c, healthScore: Math.max(0, health), trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
                }

                return { ...c, healthScore: Math.max(0, health), trend: trend === 'stable' && health < 90 ? 'degrading' : trend };
            });

            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));
            return {
                ...ac,
                operatingMode: currentMode,
                throttle,
                speed,
                altitude,
                outsideAirTemp: oat,
                weight,
                engineLoad,
                climbRate: verticalSpeed,
                heading,
                bankAngle,
                pitchAngle,
                verticalSpeed,
                flightHours: ac.flightHours + (dt / 3600),
                components: updatedComponents,
                healthScore: overallHealth,
                status: calculateStatus(overallHealth),
                riskLevel: calculateRiskLevel(overallHealth)
            };
        });

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
        newList.forEach(ac => publishTelemetry(ac));
        return { aircraftList: newList, predictions: newPredictions.sort((a,b) => b.probabilityScore - a.probabilityScore), analytics: newAnalytics };
    }),
"""

content = re.sub(
    r"tickSimulation:\s*\(\)\s*=>\s*set\(\(state\)\s*=>\s*\{[\s\S]*?analytics:\s*newAnalytics\s*\};\s*\}\),",
    tick_logic,
    content
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
