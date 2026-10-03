import re

# 1. Update fleet.ts to add fuelLevel
with open('src/types/fleet.ts', 'r', encoding='utf-8') as f:
    fleet_content = f.read()

fleet_content = fleet_content.replace(
    "fuelFlow?: number; // PPH",
    "fuelFlow?: number; // PPH\n  fuelLevel?: number; // %"
)

with open('src/types/fleet.ts', 'w', encoding='utf-8') as f:
    f.write(fleet_content)

# 2. Update SimulatorControlCenter.tsx to add ! for potentially undefined values in checks
with open('src/components/SimulatorControlCenter.tsx', 'r', encoding='utf-8') as f:
    sim_content = f.read()

# Fix oilPressure check
sim_content = sim_content.replace(
    "critical={engine && engine.oilPressure < 30 ? true : false}",
    "critical={engine && engine.oilPressure! < 30 ? true : false}"
)
# Fix voltage check
sim_content = sim_content.replace(
    "critical={elec && elec.voltage < 22 ? true : false}",
    "critical={elec && elec.voltage! < 22 ? true : false}"
)

# And fix fuelLevel any casts (since we added it to fleet.ts we don't strictly need any, but let's just make it clean)
sim_content = sim_content.replace("(fuel as any)?.fuelLevel", "fuel?.fuelLevel")

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(sim_content)
