import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Make injectFault forcefully tick the simulation or start it, and increase fault severities

inject_fault_patch = """injectFault: (aircraftId, componentType, faultType) => set((state) => {
        publishFault(aircraftId, faultType);
        const newList = state.aircraftList.map(ac => {
            if (ac.id !== aircraftId) return ac;
            const newFaults = [...(ac.activeFaults || [])];
            if (!newFaults.includes(faultType)) newFaults.push(faultType);
            return {
                ...ac,
                activeFaults: newFaults
            };
        });
        return { aircraftList: newList, isSimulating: true } as Partial<SimulatorState>;
    }),"""

content = re.sub(r"injectFault:\s*\(aircraftId,\s*componentType,\s*faultType\)\s*=>\s*set\(\(state\)\s*=>\s*\{[\s\S]*?return\s*\{\s*aircraftList:\s*newList\s*\}\s*as\s*Partial<SimulatorState>;\n\s*\}\),", inject_fault_patch, content)

# Amplify the degradation in tickSimulation so it's instantly noticeable to the user
content = content.replace("health -= 0.02;", "health -= 0.5;")
content = content.replace("health -= 0.03;", "health -= 1.0;")
content = content.replace("health -= 0.01;", "health -= 0.3;")
content = content.replace("targetTemp += 500;", "targetTemp += 1500;")
content = content.replace("targetOil -= 20;", "targetOil -= 60;")
content = content.replace("flow += 200 + Math.random() * 50;", "flow += 800 + Math.random() * 200;")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
