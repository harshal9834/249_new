import re

with open('src/types/fleet.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add new physics variables to Aircraft interface
new_fields = """  enginesCount: number;
  operatingMode?: 'Ground Idle' | 'Taxi' | 'Takeoff' | 'Climb' | 'Cruise' | 'Loiter' | 'Descent' | 'Landing';
  activeFaults?: string[];
  throttle?: number;
  speed?: number;
  altitude?: number;
  outsideAirTemp?: number;
  weight?: number;
  engineLoad?: number;
  climbRate?: number;
  heading?: number;
  bankAngle?: number;
  pitchAngle?: number;
  verticalSpeed?: number;
  humidity?: number;
  windSpeed?: number;
  ambientPressure?: number;
  payloadWeight?: number;
  components: AircraftComponent[];"""

content = re.sub(r'  enginesCount: number;\n.*?components: AircraftComponent\[\];', new_fields, content, flags=re.DOTALL)

with open('src/types/fleet.ts', 'w', encoding='utf-8') as f:
    f.write(content)
