import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of tickSimulation
start_idx = content.find('    tickSimulation: () => set((state) => {')

# Find the end of the broken ingestTelemetry (right before getMetrics)
end_idx = content.find('    getMetrics: () => {')

if start_idx != -1 and end_idx != -1:
    correct_code = """    tickSimulation: () => set((state) => {
        if (!state.isSimulating) return state;

        const dt = 0.1; // 100ms simulation step
        const newPredictions = [...state.predictions];

        const newList = state.aircraftList.map(ac => {
            const faults = ac.activeFaults || [];
            let currentMode = ac.operatingMode || 'Ground Idle';

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
            
            let turnRate = bankAngle * 0.1; 
            heading = (heading + turnRate * dt);
            if (heading >= 360) heading -= 360;
            if (heading < 0) heading += 360;

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

            // Advanced Aerospace Physics Block
            let windSpeed = ac.windSpeed || (10 + Math.random() * 5);
            let groundSpeed = speed + (windSpeed * 0.5); 
            let machNumber = speed / 661.47; 
            
            let pressure = 1013.25 * Math.pow(1 - 0.0000225577 * altitude, 5.25588);
            let tempKelvin = oat + 273.15;
            let airDensity = (pressure * 100) / (287.05 * tempKelvin);
            
            let angleOfAttack = (currentMode === 'Climb' ? 12 : currentMode === 'Cruise' ? 3 : currentMode === 'Takeoff' ? 15 : currentMode === 'Landing' ? 8 : 0) + (Math.random()*0.5);
            let roll = currentMode === 'Loiter' ? 15 : (Math.random() - 0.5);
            let yaw = Math.random() - 0.5;
            
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
                    if (faults.includes('Engine Overheat')) { targetTemp += 1500; health -= 0.5; trend = 'critical_spike'; }
                    temp += (targetTemp - temp) * (dt * 0.2);

                    let baseVib = 0.2 + (engineLoad / 100) * 0.5 + ((100 - health) / 100) * 1.5;
                    if (faults.includes('High Vibration')) { baseVib += 3.0; health -= 1.0; trend = 'critical_spike'; }
                    vib += (baseVib - vib) * 0.2 + (Math.random() * 0.05 - 0.025);

                    let targetOil = 30 + (rpm / 5800) * 50;
                    if (health < 80) targetOil -= (80 - health) * 0.5;
                    if (faults.includes('Oil Leak')) targetOil -= 60;
                    oil += (targetOil - oil) * (dt * 0.5);

                    flow = (rpm / 5800) * 400 + (engineLoad / 100) * 100;
                    if (faults.includes('Fuel Leak')) flow += 800 + Math.random() * 200;

                    return { ...c, healthScore: Math.max(0, health), rpm, temperature: temp, vibration: vib, oilPressure: oil, fuelFlow: flow, trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike' };
                }

                if (c.type === 'Fuel System') {
                    let fuel = c.fuelLevel || 100;
                    const eng = ac.components.find(e => e.type === 'Engine');
                    const burnRate = eng?.fuelFlow || 0;
                    fuel -= (burnRate / 3600 / 10) * 0.01; 
                    if (faults.includes('Fuel Leak')) { fuel -= 0.05; health -= 0.3; trend = 'critical_spike'; }
                    return { ...c, healthScore: Math.max(0, health), fuelLevel: Math.max(0, fuel), trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike' };
                }
                
                if (c.type === 'Hydraulic System') {
                    let pressure = c.pressure || 3000;
                    if (faults.includes('Hydraulic Failure')) { pressure = 500; health -= 0.5; trend = 'critical_spike'; }
                    return { ...c, healthScore: Math.max(0, health), pressure, trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike' };
                }
                
                if (c.type === 'Electrical System') {
                    let volt = c.voltage || 28;
                    if (faults.includes('Electrical Failure')) { volt = 18; health -= 0.5; trend = 'critical_spike'; }
                    return { ...c, healthScore: Math.max(0, health), voltage: volt, trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike' };
                }
                
                return { ...c, healthScore: Math.max(0, health), trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike' };
            });

            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));

            return {
                ...ac,
                operatingMode: currentMode,
                throttle, speed, altitude, outsideAirTemp: oat, weight, engineLoad,
                climbRate: verticalSpeed, heading, bankAngle, pitchAngle, verticalSpeed,
                groundSpeed, machNumber, angleOfAttack, components: updatedComponents,
                healthScore: overallHealth, status: overallHealth > 80 ? 'Operational' : overallHealth > 50 ? 'Warning' : overallHealth > 20 ? 'Maintenance' : 'Critical'
            };
        });

        const newAnalytics = { ...state.analytics };
        newList.forEach(ac => publishTelemetry(ac));
        return { aircraftList: newList, predictions: newPredictions, analytics: newAnalytics } as Partial<SimulatorState>;
    }),
    
    ingestTelemetry: (data: any) => set((state) => {
        const newList = state.aircraftList.map(a => {
            if (a.id !== data.aircraftId) return a;
            return {
                ...a,
                throttle: data.throttle,
                speed: data.speed,
                altitude: data.altitude,
                outsideAirTemp: data.outsideAirTemp,
                weight: data.weight,
                engineLoad: data.engineLoad,
                climbRate: data.climbRate,
                heading: data.heading,
                bankAngle: data.bankAngle,
                pitchAngle: data.pitchAngle,
                verticalSpeed: data.verticalSpeed,
                groundSpeed: data.groundSpeed,
                machNumber: data.machNumber,
                angleOfAttack: data.angleOfAttack,
                components: a.components.map(c => {
                    if (c.type === 'Engine') {
                        return { ...c, rpm: data.rpm, temperature: data.temperature, vibration: data.vibration, oilPressure: data.oilPressure, fuelFlow: data.fuelFlow };
                    }
                    if (c.type === 'Fuel System') {
                        return { ...c, fuelLevel: data.fuelLevel || c.fuelLevel };
                    }
                    if (c.type === 'Electrical System') {
                        return { ...c, voltage: data.voltage || c.voltage };
                    }
                    if (c.type === 'Hydraulic System') {
                        return { ...c, pressure: data.hydraulicPressure || c.pressure };
                    }
                    return c;
                })
            };
        });
        
        const newHistory = [...state.telemetryHistory, { ...data, time: new Date().toISOString() }];
        if (newHistory.length > 100) newHistory.shift();

        return { aircraftList: newList, telemetryHistory: newHistory } as Partial<SimulatorState>;
    }),

"""

    new_content = content[:start_idx] + correct_code + content[end_idx:]
    with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed!")
else:
    print("Could not find indices!")
