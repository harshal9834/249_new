import re

with open('src/components/HistoricalTelemetryTrends.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add fallback to activeAc
fallback_logic = """  const engineComp = activeAc?.components.find(c => c.type === 'Engine');
  
  // Directly consume the 100-point rolling window from the global state
  let data = store.telemetryHistory
    .filter(d => d.aircraftId === activeAc?.id)
    .map(d => ({
        time: new Date(d.time).toLocaleTimeString(),
        rpm: d.rpm || 0,
        temp: d.temperature || 0,
        vib: d.vibration || 0,
        oil: d.oilPressure || 0
    }));

  let healthData = store.telemetryHistory
    .filter(d => d.aircraftId === activeAc?.id)
    .map(d => ({
        time: new Date(d.time).toLocaleTimeString(),
        overall: Math.max(0, 100 - (d.vibration * 10)),
        engine: Math.max(0, 100 - ((d.temperature - 400) / 10))
    }));

  // Automatically load latest simulator values if DB/History is empty to ensure no blank charts
  if (data.length === 0 && activeAc) {
      const now = new Date().toLocaleTimeString();
      data = [{
          time: now,
          rpm: engineComp?.rpm || 0,
          temp: engineComp?.temperature || 0,
          vib: engineComp?.vibration || 0,
          oil: engineComp?.oilPressure || 0
      }];
      healthData = [{
          time: now,
          overall: activeAc.healthScore || 100,
          engine: engineComp?.healthScore || 100
      }];
  }"""

content = re.sub(
    r"// Directly consume the 100-point rolling window from the global state[\s\S]*?engine: Math\.max\(0, 100 - \(\(d\.temperature - 400\) / 10\)\)\n\s*\}\)\);",
    fallback_logic,
    content
)

with open('src/components/HistoricalTelemetryTrends.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
