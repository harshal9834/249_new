import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add interface methods
interfaces_patch = """    setSelectedAircraftId: (id: string) => void;
    setOperatingMode: (aircraftId: string, mode: string) => void;
    setManualThrottle: (aircraftId: string, throttle: number) => void;"""
content = content.replace("setSelectedAircraftId: (id: string) => void;", interfaces_patch)

# Add implementation methods
impl_patch = """    setSelectedAircraftId: (id) => set({ selectedAircraftId: id } as Partial<SimulatorState>),
    
    setOperatingMode: (aircraftId, mode) => set((state) => {
        const newList = state.aircraftList.map(a => 
            a.id === aircraftId ? { ...a, operatingMode: mode as any } : a
        );
        return { aircraftList: newList } as Partial<SimulatorState>;
    }),

    setManualThrottle: (aircraftId, throttle) => set((state) => {
        const newList = state.aircraftList.map(a => 
            a.id === aircraftId ? { ...a, throttle } : a
        );
        return { aircraftList: newList } as Partial<SimulatorState>;
    }),"""
content = content.replace("setSelectedAircraftId: (id) => set({ selectedAircraftId: id } as Partial<SimulatorState>),", impl_patch)

# Prevent automatic progression in tickSimulation if we want manual control
# Remove the random mode progression so the user has full control
content = re.sub(
    r"if \(Math\.random\(\) < 0\.001 && faults\.length === 0\) \{[\s\S]*?currentMode = \(progression\[currentMode\] \|\| 'Cruise'\) as any;\n\s*\}",
    "// Manual mode progression only",
    content
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
