import re

with open('src/components/SimulatorControlCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the "Live Telemetry Panel" with the enhanced one.
# It currently has a grid of TelemetryCards. We can add a "Operating Mode" badge, and use trend arrows.

new_telemetry_panel = """
        {/* CENTER PANEL: Live Telemetry Generator */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 shadow-xs flex flex-col h-full overflow-hidden text-slate-200">
          <div className="bg-slate-950 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Telemetry Stream
            </div>
            <div className="flex items-center gap-2">
               <span className="text-slate-500 text-[10px]">MODE:</span>
               <span className="text-blue-400 font-bold bg-blue-900/30 px-2 py-0.5 rounded">{activeAc.operatingMode || 'Cruise'}</span>
            </div>
          </div>
          <div className="p-5 flex-grow grid grid-cols-2 gap-3 relative">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4ade80 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <TelemetryCard label="Engine RPM" value={Math.round(engineComp?.rpm || 0).toLocaleString()} unit="" trend={engineComp?.trend} />
            <TelemetryCard label="Temperature" value={Math.round(engineComp?.temperature || 0)} unit="°C" trend={engineComp?.trend} />
            <TelemetryCard label="Vibration" value={(engineComp?.vibration || 0).toFixed(2)} unit="IPS" trend={engineComp?.trend} />
            <TelemetryCard label="Oil Pressure" value={Math.round(engineComp?.oilPressure || 0)} unit="PSI" trend={(engineComp?.oilPressure || 0) < 40 ? 'degrading' : 'stable'} />
            <TelemetryCard label="Fuel Flow" value={Math.round(engineComp?.fuelFlow || 0)} unit="PPH" trend="stable" />
            <TelemetryCard label="Fuel Level" value={((activeAc.components.find(c => c.type === 'Fuel System')?.fuelLevel) || 0).toFixed(1)} unit="%" trend="degrading" />
            <TelemetryCard label="Hydraulic Pres" value={Math.round(activeAc.components.find(c => c.type === 'Hydraulic System')?.pressure || 0)} unit="PSI" trend="stable" />
            <TelemetryCard label="Battery Volt" value={(activeAc.components.find(c => c.type === 'Electrical System')?.voltage || 0).toFixed(1)} unit="V" trend="stable" />
            <TelemetryCard label="Flight Hours" value={activeAc.flightHours.toFixed(2)} unit="HRS" trend="improving" />
            <TelemetryCard label="Engine Health" value={Math.round(engineComp?.healthScore || 0)} unit="%" trend={engineComp?.healthScore && engineComp.healthScore < 80 ? 'degrading' : 'stable'} />
          </div>
        </div>
"""

# Let's see what the old panel looked like.
# Search for: {/* CENTER PANEL: Live Telemetry Generator */}
content = re.sub(
    r"\{\/\* CENTER PANEL: Live Telemetry Generator \*\/\}.*?\{\/\* RIGHT PANEL: Actions Center \*\/\}",
    new_telemetry_panel + "\n        {/* RIGHT PANEL: Actions Center */}",
    content,
    flags=re.DOTALL
)

# Replace TelemetryCard implementation to show arrows
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
    // For stable, add a slight flicker or ↗/↘ based on random micro-fluctuation purely for visual effect if we wanted, 
    // but the store already handles physics. We'll use values.
    // If it's a value that drops (fuel), trend is set to degrading above.
    arrow = '↗'; 
  }

  // Override specific ones like fuel dropping
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

content = re.sub(
    r"const TelemetryCard = \(\{.*?\}\);\n",
    new_telemetry_card,
    content,
    flags=re.DOTALL
)

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
