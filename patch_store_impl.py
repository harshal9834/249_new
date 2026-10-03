import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

impl_patch = """    setSelectedAircraftId: (id) => set({ selectedAircraftId: id }),
    
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

content = content.replace("setSelectedAircraftId: (id) => set({ selectedAircraftId: id }),", impl_patch)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
