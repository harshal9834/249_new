import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add 90 day retention policy to TimescaleDB
retention_policy = """
    // Convert to Hypertable
    await prisma.$executeRawUnsafe(`SELECT create_hypertable('"Telemetry"', by_range('time', INTERVAL '1 day'), if_not_exists => TRUE);`);
    
    // Add 90 day retention policy
    await prisma.$executeRawUnsafe(`SELECT add_retention_policy('"Telemetry"', INTERVAL '90 days', if_not_exists => TRUE);`);
"""
content = content.replace("    // Convert to Hypertable\n    await prisma.$executeRawUnsafe(`SELECT create_hypertable('\"Telemetry\"', by_range('time', INTERVAL '1 day'), if_not_exists => TRUE);`);", retention_policy)

# Add all fields to the Prisma create call in the socket
# Since the dictionary is large, I'll just dynamically spread the data object, omitting specific things if needed, or explicitly mapping them.
# To be safe and clean, I will just write a regex to replace the `data: { ... }` block.
new_data_mapping = """data: {
          time: new Date(),
          aircraftId: data.aircraftId,
          rpm: data.rpm || 0,
          temperature: data.temperature || 0,
          vibration: data.vibration || 0,
          oilPressure: data.oilPressure || 0,
          fuelFlow: data.fuelFlow || 0,
          throttle: data.throttle || 0,
          speed: data.speed || 0,
          altitude: data.altitude || 0,
          outsideAirTemp: data.outsideAirTemp || 0,
          weight: data.weight || 0,
          engineLoad: data.engineLoad || 0,
          climbRate: data.climbRate || 0,
          heading: data.heading || 0,
          bankAngle: data.bankAngle || 0,
          pitchAngle: data.pitchAngle || 0,
          verticalSpeed: data.verticalSpeed || 0,
          groundSpeed: data.groundSpeed || 0,
          machNumber: data.machNumber || 0,
          angleOfAttack: data.angleOfAttack || 0,
          roll: data.roll || 0,
          yaw: data.yaw || 0,
          airDensity: data.airDensity || 1.225,
          humidity: data.humidity || 50,
          windSpeed: data.windSpeed || 0,
          pressure: data.pressure || 1013,
          turbulence: data.turbulence || 'LOW',
          fuelQuantity: data.fuelQuantity || 100,
          fuelPercentage: data.fuelPercentage || 100,
          fuelTankTemp: data.fuelTankTemp || 20,
          fuelPumpStatus: data.fuelPumpStatus || 'NOMINAL',
          fuelLeak: data.fuelLeak || false,
          batteryVoltage: data.batteryVoltage || 28.0,
          generatorLoad: data.generatorLoad || 40.0,
          busVoltage: data.busVoltage || 28.0,
          powerConsumption: data.powerConsumption || 15.0,
          hydraulicPressure: data.hydraulicPressure || 3000.0,
          hydraulicTemp: data.hydraulicTemp || 60.0,
          actuatorLoad: data.actuatorLoad || 25.0,
          leakStatus: data.leakStatus || false,
          gearPosition: data.gearPosition || 'DOWN',
          brakeTemp: data.brakeTemp || 100.0,
          tyrePressure: data.tyrePressure || 200.0,
          radarStatus: data.radarStatus || 'NOMINAL',
          gpsHealth: data.gpsHealth || 'NOMINAL',
          insAccuracy: data.insAccuracy || 99.9,
          flightComputerStatus: data.flightComputerStatus || 'NOMINAL',
          communicationStatus: data.communicationStatus || 'NOMINAL'
        }"""

content = re.sub(r"data:\s*\{[\s\S]*?verticalSpeed:\s*data\.verticalSpeed\s*\|\|\s*0\n\s*\}", new_data_mapping, content)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
