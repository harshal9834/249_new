import re

with open('src/components/SimulatorControlCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Define engineComp
content = content.replace(
    "const activeAc = store.aircraftList.find(a => a.id === store.selectedAircraftId) || store.aircraftList[0];",
    "const activeAc = store.aircraftList.find(a => a.id === store.selectedAircraftId) || store.aircraftList[0];\n  const engineComp = activeAc?.components.find(c => c.type === 'Engine');"
)

# 2. Fix old TelemetryCard
# The old TelemetryCard looks something like:
# const TelemetryCard = ({ title, value, unit, trend, critical = false }: { ... }) => { ... }
# I will use Python regex to completely replace it.
telemetry_regex = re.compile(r"const TelemetryCard = \(\{.*?\}\) => \{[\s\S]*?return \([\s\S]*?\);\n\};")

new_telemetry_card = """
const TelemetryCard = ({ label, value, unit, trend }: { label: string, value: string | number, unit: string, trend?: string }) => {
  let arrow = '−';
  let color = 'text-emerald-400';
  let trendColor = 'text-slate-500';
  
  if (trend === 'critical_spike' || trend === 'degrading') {
    arrow = trend === 'critical_spike' ? '⇈' : '↘';
    color = trend === 'critical_spike' ? 'text-red-500 animate-pulse' : 'text-amber-500';
    trendColor = color;
  } else if (trend === 'improving') {
    arrow = '↗';
    trendColor = 'text-emerald-500';
  } else {
    arrow = '↗'; 
  }

  if (label === 'Fuel Level') { arrow = '↘'; trendColor = 'text-amber-500'; }

  return (
    <div className="bg-slate-800/50 border border-slate-700 p-3 rounded flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <Activity className="w-8 h-8" />
      </div>
      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 z-10">{label}</div>
      <div className="flex items-baseline gap-1 z-10">
        <span className={`text-xl font-black font-mono tracking-tight ${color}`}>{value}</span>
        <span className="text-[10px] font-bold text-slate-500">{unit}</span>
        <span className={`ml-auto text-sm font-bold ${trendColor}`}>{arrow}</span>
      </div>
    </div>
  );
};
"""

content = telemetry_regex.sub(new_telemetry_card, content)

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
