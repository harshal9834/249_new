import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

physics_injection = """
            // Advanced Aerospace Physics Block
            let windSpeed = ac.windSpeed || (10 + Math.random() * 5);
            let groundSpeed = speed + (windSpeed * 0.5); // simplified wind vector
            let machNumber = speed / 661.47; // standard SOS at sea level approx
            
            // ISA Model Pressure & Air Density
            let pressure = 1013.25 * Math.pow(1 - 0.0000225577 * altitude, 5.25588);
            let tempKelvin = oat + 273.15;
            let airDensity = (pressure * 100) / (287.05 * tempKelvin);
            
            let angleOfAttack = (currentMode === 'Climb' ? 12 : currentMode === 'Cruise' ? 3 : currentMode === 'Takeoff' ? 15 : currentMode === 'Landing' ? 8 : 0) + (Math.random()*0.5);
            let roll = currentMode === 'Loiter' ? 15 : (Math.random() - 0.5);
            let yaw = Math.random() - 0.5;
            let turbulence = altitude > 20000 ? 'LOW' : (altitude > 5000 ? 'MEDIUM' : 'HIGH');
            
            let gearPosition = (altitude < 500 || currentMode === 'Ground Idle' || currentMode === 'Taxi' || currentMode === 'Takeoff') ? 'DOWN' : (currentMode === 'Climb' && altitude < 2000 ? 'TRANSITION' : 'UP');
            let brakeTemp = currentMode === 'Landing' ? (ac.brakeTemp || 100) + (10 * dt) : Math.max(100, (ac.brakeTemp || 100) - (1 * dt));
            let tyrePressure = gearPosition === 'DOWN' ? 200 + (Math.random()*2) : 190;
            
            let generatorLoad = (throttle * 0.5) + 30;
            let busVoltage = 28.0;
            let batteryVoltage = generatorLoad > 20 ? 28.5 : 24.0;
            let powerConsumption = generatorLoad * 1.5;
            
            let radarStatus = faults.includes('Radar Failure') ? 'FAILED' : 'NOMINAL';
            let gpsHealth = faults.includes('GPS Failure') ? 'FAILED' : 'NOMINAL';
            let insAccuracy = gpsHealth === 'FAILED' ? 95.0 : 99.9;
            let flightComputerStatus = faults.includes('Avionics Failure') ? 'WARNING' : 'NOMINAL';
            let communicationStatus = 'NOMINAL';
            
            let fuelTankTemp = Math.max(-40, oat + (machNumber * 20));
            let fuelPumpStatus = faults.includes('Fuel Leak') ? 'WARNING' : 'NOMINAL';
            let hydraulicTemp = 60 + (engineLoad * 0.2);
            let actuatorLoad = 25 + (angleOfAttack * 2) + Math.abs(roll);

            const updatedComponents = ac.components.map(c => {
"""

content = content.replace("            const updatedComponents = ac.components.map(c => {", physics_injection)

# Add faults to state assignment
state_assign = """
                groundSpeed, machNumber, angleOfAttack, roll, yaw, airDensity, windSpeed, pressure, turbulence, gearPosition, brakeTemp, tyrePressure,
                generatorLoad, busVoltage, batteryVoltage, powerConsumption, radarStatus, gpsHealth, insAccuracy, flightComputerStatus, communicationStatus,
                fuelTankTemp, fuelPumpStatus, hydraulicTemp, actuatorLoad,
"""

content = content.replace("                engineLoad,", "                engineLoad,\n" + state_assign)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
