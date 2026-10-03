import re

with open('src/types/fleet.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_fields = """  enginesCount: number;
  operatingMode?: 'Ground Idle' | 'Taxi' | 'Takeoff' | 'Climb' | 'Cruise' | 'Loiter' | 'Descent' | 'Landing';
  activeFaults?: string[];
  components: AircraftComponent[];"""

content = content.replace("  enginesCount: number;\n  components: AircraftComponent[];", new_fields)

with open('src/types/fleet.ts', 'w', encoding='utf-8') as f:
    f.write(content)
