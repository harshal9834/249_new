import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

missing_methods = """
    resetSimulation: () => set({ aircraftList: [createNewAircraft('C-130J Super Hercules', 'Transport')], telemetryHistory: [], isSimulating: false }),
    
    randomDegradation: () => set(state => {
        const newList = state.aircraftList.map(ac => {
            const updatedComponents = ac.components.map(c => {
                const degradation = Math.random() * 15;
                const health = Math.max(0, c.healthScore - degradation);
                return {
                    ...c,
                    healthScore: health,
                    status: health > 80 ? 'Operational' : health > 50 ? 'Warning' : health > 20 ? 'Maintenance' : 'Critical',
                    riskLevel: health > 80 ? 'Low' : health > 50 ? 'Moderate' : health > 20 ? 'High' : 'Critical',
                    trend: 'degrading' as any
                };
            });
            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));
            return {
                ...ac,
                components: updatedComponents,
                healthScore: overallHealth,
                status: (overallHealth > 80 ? 'Operational' : overallHealth > 50 ? 'Warning' : overallHealth > 20 ? 'Maintenance' : 'Critical') as any,
                riskLevel: (overallHealth > 80 ? 'Low' : overallHealth > 50 ? 'Moderate' : overallHealth > 20 ? 'High' : 'Critical') as any
            };
        });
        return { aircraftList: newList } as Partial<SimulatorState>;
    }),

    generateFleet: () => set(state => {
        return {
            aircraftList: [
                createNewAircraft('F-35A Lightning II', 'Fighter'),
                createNewAircraft('F-22 Raptor', 'Fighter'),
                createNewAircraft('C-130J Super Hercules', 'Transport'),
                createNewAircraft('C-17 Globemaster', 'Transport'),
                createNewAircraft('MQ-9 Reaper', 'UAV')
            ]
        };
    }),
    
    fetchInitialData: async () => {
        try {
            const [invRes, agRes, recRes, anRes] = await Promise.all([
                fetch('/api/inventory'),
                fetch('/api/agencies'),
                fetch('/api/maintenance_events'),
                fetch('/api/maintenance-analytics')
            ]);
            
            const inventory = invRes.ok ? await invRes.json() : [];
            const agencies = agRes.ok ? await agRes.json() : [];
            const maintenanceRecords = recRes.ok ? await recRes.json() : [];
            let analytics = anRes.ok ? await anRes.json() : null;
            if (!analytics || Object.keys(analytics).length === 0) {
                analytics = useSimulatorStore.getState().analytics;
            }
            
            set({ inventory, agencies, maintenanceRecords, analytics });
        } catch (e) {
            console.warn('Failed to fetch initial data from TimescaleDB', e);
        }
    },
"""

content = content.replace("    ingestTelemetry: (data: any) => set((state) => {", missing_methods + "\n    ingestTelemetry: (data: any) => set((state) => {")

# Also fix the Type 'string' is not assignable to type 'AircraftStatus' on line 398 in tickSimulation
# status: overallHealth > 80 ? 'Operational' : overallHealth > 50 ? 'Warning' : overallHealth > 20 ? 'Maintenance' : 'Critical'
content = content.replace("status: overallHealth > 80 ? 'Operational' : overallHealth > 50 ? 'Warning' : overallHealth > 20 ? 'Maintenance' : 'Critical'", "status: (overallHealth > 80 ? 'Operational' : overallHealth > 50 ? 'Warning' : overallHealth > 20 ? 'Maintenance' : 'Critical') as any")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
