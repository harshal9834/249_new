import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add telemetryHistory to interface
content = content.replace("aircraftList: Aircraft[];", "aircraftList: Aircraft[];\n    telemetryHistory: any[];")

# Initialize telemetryHistory
content = content.replace("aircraftList: [createNewAircraft('C-130J Super Hercules', 'Transport')],", "aircraftList: [createNewAircraft('C-130J Super Hercules', 'Transport')],\n    telemetryHistory: [],")

# Update ingestTelemetry to push to history
ingest_history = """                })
            };
        });
        
        const newHistory = [...state.telemetryHistory, { ...data, time: new Date().toISOString() }];
        if (newHistory.length > 100) newHistory.shift();

        return { aircraftList: newList, telemetryHistory: newHistory } as Partial<SimulatorState>;
    }),"""

content = re.sub(
    r"\s*\}\)\n\s*\};\n\s*\}\);\n\s*return \{ aircraftList: newList \} as Partial<SimulatorState>;\n\s*\}\),",
    ingest_history,
    content
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Now rewrite HistoricalTelemetryTrends.tsx
with open('src/components/HistoricalTelemetryTrends.tsx', 'r', encoding='utf-8') as f:
    charts_content = f.read()

charts_logic = """export const HistoricalTelemetryTrends: React.FC = () => {
  const store = useSimulatorStore();
  const activeAc = store.aircraftList.find(a => a.id === store.selectedAircraftId) || store.aircraftList[0];
  
  // Directly consume the 100-point rolling window from the global state
  const data = store.telemetryHistory
    .filter(d => d.aircraftId === activeAc?.id)
    .map(d => ({
        time: new Date(d.time).toLocaleTimeString(),
        rpm: d.rpm || 0,
        temp: d.temperature || 0,
        vib: d.vibration || 0,
        oil: d.oilPressure || 0
    }));

  const healthData = store.telemetryHistory
    .filter(d => d.aircraftId === activeAc?.id)
    .map(d => ({
        time: new Date(d.time).toLocaleTimeString(),
        overall: Math.max(0, 100 - (d.vibration * 10)),
        engine: Math.max(0, 100 - ((d.temperature - 400) / 10))
    }));

  if (!activeAc) return null;"""

charts_content = re.sub(
    r"export const HistoricalTelemetryTrends: React\.FC = \(\) => \{[\s\S]*?if \(!activeAc\) return null;",
    charts_logic,
    charts_content
)

with open('src/components/HistoricalTelemetryTrends.tsx', 'w', encoding='utf-8') as f:
    f.write(charts_content)
