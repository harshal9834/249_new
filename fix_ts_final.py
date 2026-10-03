import re

with open('src/components/SimulatorControlCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Completely remove old TelemetryCard
content = re.sub(r'const TelemetryCard = \(\{.*?\}\) => \([\s\S]*?\);\n', '', content)

# Remove the one I injected (if it's there)
content = re.sub(r'const TelemetryCard = \(\{ label[\s\S]*?\}\s*;\s*\}\s*;', '', content)

new_telemetry_card = """
const TelemetryCard = ({ title, value, unit, trend, critical }: { title: string, value: string | number, unit: string, trend?: string, critical?: boolean }) => {
  let arrow = '−';
  let color = 'text-emerald-400';
  let trendColor = 'text-slate-500';
  
  if (trend === 'critical_spike' || trend === 'degrading' || critical) {
    arrow = trend === 'critical_spike' ? '⇈' : '↘';
    color = trend === 'critical_spike' || critical ? 'text-red-500 animate-pulse' : 'text-amber-500';
    trendColor = color;
  } else if (trend === 'improving') {
    arrow = '↗';
    trendColor = 'text-emerald-500';
  } else {
    arrow = '↗'; 
  }

  if (title === 'Fuel Level') { arrow = '↘'; trendColor = 'text-amber-500'; }

  return (
    <div className={`bg-slate-800/50 border ${critical ? 'border-red-500/50' : 'border-slate-700'} p-3 rounded flex flex-col justify-between relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <Activity className="w-8 h-8 text-slate-300" />
      </div>
      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 z-10">{title}</div>
      <div className="flex items-baseline gap-1 z-10">
        <span className={`text-xl font-black font-mono tracking-tight ${color}`}>{value}</span>
        <span className="text-[10px] font-bold text-slate-500">{unit}</span>
        <span className={`ml-auto text-sm font-bold ${trendColor}`}>{arrow}</span>
      </div>
    </div>
  );
};
"""

content = content + "\n" + new_telemetry_card

# Fix the JSX tags in the panel to use title= instead of label=, and String(value)
content = content.replace('label="Engine RPM"', 'title="Engine RPM"').replace('label="Temperature"', 'title="Temperature"').replace('label="Vibration"', 'title="Vibration"').replace('label="Oil Pressure"', 'title="Oil Pressure"').replace('label="Fuel Flow"', 'title="Fuel Flow"').replace('label="Fuel Level"', 'title="Fuel Level"').replace('label="Hydraulic Pres"', 'title="Hydraulic Pres"').replace('label="Battery Volt"', 'title="Battery Volt"').replace('label="Flight Hours"', 'title="Flight Hours"').replace('label="Engine Health"', 'title="Engine Health"')

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix AircraftManagement.tsx
with open('src/components/AircraftManagement.tsx', 'r', encoding='utf-8') as f:
    am_content = f.read()

am_content = am_content.replace("let valA = a[sortField];\n      let valB = b[sortField];", "let valA = a[sortField as keyof typeof a];\n      let valB = b[sortField as keyof typeof b];\n      if (valA === undefined) valA = '';\n      if (valB === undefined) valB = '';")

with open('src/components/AircraftManagement.tsx', 'w', encoding='utf-8') as f:
    f.write(am_content)
