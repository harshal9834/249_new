import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded arrays with empty arrays
content = re.sub(
    r"inventory:\s*\[[\s\S]*?\],\n\s*maintenanceRecords:\s*\[\],\n\s*agencies:\s*\[[\s\S]*?\],\n",
    "inventory: [],\n    maintenanceRecords: [],\n    agencies: [],\n",
    content
)

# Add fetchInitialData action
fetch_data_action = """
    fetchInitialData: async () => {
        try {
            const [invRes, agRes, recRes] = await Promise.all([
                fetch('/api/inventory'),
                fetch('/api/agencies'),
                fetch('/api/maintenance_events')
            ]);
            if (invRes.ok) set({ inventory: await invRes.json() } as Partial<SimulatorState>);
            if (agRes.ok) set({ agencies: await agRes.json() } as Partial<SimulatorState>);
            if (recRes.ok) set({ maintenanceRecords: await recRes.json() } as Partial<SimulatorState>);
        } catch (e) {
            console.warn("Failed to fetch initial data from TimescaleDB");
        }
    },
"""

# Inject the interface type
content = content.replace("restockPart: (partId: string, quantity: number) => void;", "restockPart: (partId: string, quantity: number) => void;\n    fetchInitialData: () => Promise<void>;")

# Inject the implementation before getMetrics
content = content.replace("getMetrics: () => {", fetch_data_action + "\n    getMetrics: () => {")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
