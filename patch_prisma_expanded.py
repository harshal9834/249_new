import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# I will add the massive list of new fields to the Telemetry model.
new_telemetry_fields = """
  time            DateTime          @default(now())
  aircraftId      String
  rpm             Float
  temperature     Float
  vibration       Float
  oilPressure     Float
  fuelFlow        Float
  throttle        Float
  speed           Float
  altitude        Float
  outsideAirTemp  Float
  weight          Float
  engineLoad      Float
  climbRate       Float
  heading         Float
  bankAngle       Float
  pitchAngle      Float
  verticalSpeed   Float
  // --- New Additions ---
  groundSpeed     Float             @default(0)
  machNumber      Float             @default(0)
  angleOfAttack   Float             @default(0)
  roll            Float             @default(0)
  yaw             Float             @default(0)
  airDensity      Float             @default(1.225)
  humidity        Float             @default(50)
  windSpeed       Float             @default(0)
  pressure        Float             @default(1013)
  turbulence      String            @default("LOW")
  fuelQuantity    Float             @default(100)
  fuelPercentage  Float             @default(100)
  fuelTankTemp    Float             @default(20)
  fuelPumpStatus  String            @default("NOMINAL")
  fuelLeak        Boolean           @default(false)
  batteryVoltage  Float             @default(28.0)
  generatorLoad   Float             @default(40.0)
  busVoltage      Float             @default(28.0)
  powerConsumption Float            @default(15.0)
  hydraulicPressure Float           @default(3000.0)
  hydraulicTemp   Float             @default(60.0)
  actuatorLoad    Float             @default(25.0)
  leakStatus      Boolean           @default(false)
  gearPosition    String            @default("DOWN")
  brakeTemp       Float             @default(100.0)
  tyrePressure    Float             @default(200.0)
  radarStatus     String            @default("NOMINAL")
  gpsHealth       String            @default("NOMINAL")
  insAccuracy     Float             @default(99.9)
  flightComputerStatus String       @default("NOMINAL")
  communicationStatus String        @default("NOMINAL")
"""

content = re.sub(
    r"time\s+DateTime\s+@default\(now\(\)\)[\s\S]*?verticalSpeed\s+Float",
    new_telemetry_fields.strip(),
    content
)

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)
