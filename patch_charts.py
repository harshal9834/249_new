import re

with open('src/components/HistoricalTelemetryTrends.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the fetch logic to only use /api/telemetry/history and avoid the 404 HTML parsing error
fetch_patch = """    const fetchHistory = async () => {
      try {
        const telRes = await fetch(`/api/telemetry/history/${activeAc.id}?limit=30`);
        const telJson = await telRes.json();
        
        if (isMounted) {
          if (Array.isArray(telJson)) {
            setData(telJson.map((d: any) => ({
              time: new Date(d.time).toLocaleTimeString(),
              rpm: d.rpm || 0,
              temp: d.temperature || 0,
              vib: d.vibration || 0,
              oil: d.oilPressure || 0
            })));
            
            // Derive a smooth mock health curve or use telemetry proxy if health isn't in timeseries
            setHealthData(telJson.map((d: any) => ({
              time: new Date(d.time).toLocaleTimeString(),
              overall: Math.max(0, 100 - (d.vibration * 10)), // Proxy for visual degradation
              engine: Math.max(0, 100 - (d.temperature / 100))
            })));
          }
          setLoading(false);
        }
      } catch (e) {
        console.warn("Failed to fetch historical telemetry from TimescaleDB API", e);
        if (isMounted) setLoading(false);
      }
    };"""

content = re.sub(
    r"const fetchHistory = async \(\) => \{[\s\S]*?if \(isMounted\) setLoading\(false\);\n\s*\}\n\s*\};",
    fetch_patch,
    content
)

with open('src/components/HistoricalTelemetryTrends.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
