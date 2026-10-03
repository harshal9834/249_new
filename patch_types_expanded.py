import re

with open('src/types/fleet.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_fields = """
  verticalSpeed?: number;
  groundSpeed?: number;
  machNumber?: number;
  angleOfAttack?: number;
  roll?: number;
  yaw?: number;
  airDensity?: number;
  humidity?: number;
  windSpeed?: number;
  ambientPressure?: number;
  turbulence?: 'LOW' | 'MEDIUM' | 'HIGH';
  fuelQuantity?: number;
  fuelPercentage?: number;
  fuelTankTemp?: number;
  fuelPumpStatus?: 'NOMINAL' | 'WARNING' | 'FAILED';
  fuelLeak?: boolean;
  batteryVoltage?: number;
  generatorLoad?: number;
  busVoltage?: number;
  powerConsumption?: number;
  hydraulicPressure?: number;
  hydraulicTemp?: number;
  actuatorLoad?: number;
  leakStatus?: boolean;
  gearPosition?: 'UP' | 'DOWN' | 'TRANSITION';
  brakeTemp?: number;
  tyrePressure?: number;
  radarStatus?: 'NOMINAL' | 'WARNING' | 'FAILED';
  gpsHealth?: 'NOMINAL' | 'WARNING' | 'FAILED';
  insAccuracy?: number;
  flightComputerStatus?: 'NOMINAL' | 'WARNING' | 'FAILED';
  communicationStatus?: 'NOMINAL' | 'WARNING' | 'FAILED';
"""

content = re.sub(
    r"verticalSpeed\?: number;",
    new_fields.strip(),
    content
)

with open('src/types/fleet.ts', 'w', encoding='utf-8') as f:
    f.write(content)
