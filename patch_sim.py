import re

# 1. Update simulatorStore.ts
with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add fuelLevel to AircraftComponent if possible, or just generate it. The prompt just asks to show it, and we can store it in the component.
# Actually, I'll modify the `createNewAircraft` function to include fuelLevel
create_old = "voltage: type === 'Electrical System' ? 28 : undefined,"
create_new = "voltage: type === 'Electrical System' ? 28 : undefined,\n            fuelLevel: type === 'Fuel System' ? 100 : undefined,"
content = content.replace(create_old, create_new)

# Add generateFleet action
type_old = "randomDegradation: () => void;"
type_new = "randomDegradation: () => void;\n    generateFleet: () => void;\n    selectedAircraftId: string | null;\n    setSelectedAircraftId: (id: string) => void;"
content = content.replace(type_old, type_new)

store_old = "isSimulating: false,"
store_new = "isSimulating: false,\n    selectedAircraftId: null,\n    setSelectedAircraftId: (id) => set({ selectedAircraftId: id }),"
content = content.replace(store_old, store_new)

gen_fleet = """    randomDegradation: () => set(state => {
        const newList = state.aircraftList.map(ac => {
            const updatedComponents = ac.components.map(c => {
                const degradation = Math.random() * 15;
                const health = Math.max(0, c.healthScore - degradation);
                return {
                    ...c,
                    healthScore: health,
                    status: calculateStatus(health),
                    riskLevel: calculateRiskLevel(health),
                    trend: calculateComponentTrend(health)
                };
            });
            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));
            return {
                ...ac,
                components: updatedComponents,
                healthScore: overallHealth,
                status: calculateStatus(overallHealth),
                riskLevel: calculateRiskLevel(overallHealth)
            };
        });
        return { aircraftList: newList };
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
    }),"""

content = re.sub(r'randomDegradation: \(\) => set\(state => \{.*?\n    \}\),', gen_fleet, content, flags=re.DOTALL)

# Also update the ticking to decrement fuelLevel
tick_old = """vibration: c.type === 'Engine' ? Math.max(0, c.vibration + (Math.random()*0.1 - 0.05)) : c.vibration
                    };"""
tick_new = """vibration: c.type === 'Engine' ? Math.max(0, c.vibration + (Math.random()*0.1 - 0.05)) : c.vibration,
                        fuelLevel: c.type === 'Fuel System' ? Math.max(0, (c.fuelLevel || 100) - Math.random()*0.1) : c.fuelLevel
                    };"""
content = content.replace(tick_old, tick_new)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Overwrite SimulatorControlCenter.tsx
new_component = """import React, { useState, useEffect } from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import { Play, Pause, RefreshCw, AlertTriangle, Activity, Settings2, Plus, Zap, ShieldAlert, Cpu, Database, ChevronDown } from 'lucide-react';
import { FleetCategory } from '../types/fleet';

export const SimulatorControlCenter: React.FC = () => {
  const store = useSimulatorStore();
  const [newAcName, setNewAcName] = useState('');
  const [newAcCategory, setNewAcCategory] = useState<FleetCategory>('Fighter');

  // Select first aircraft if none selected
  useEffect(() => {
    if (store.aircraftList.length > 0 && !store.selectedAircraftId) {
      store.setSelectedAircraftId(store.aircraftList[0].id);
    }
  }, [store.aircraftList, store.selectedAircraftId, store]);

  useEffect(() => {
    let interval: any;
    if (store.isSimulating) {
      interval = setInterval(() => {
        store.tickSimulation();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [store.isSimulating, store.tickSimulation]);

  const activeAc = store.aircraftList.find(a => a.id === store.selectedAircraftId) || store.aircraftList[0];

  const handleAddAircraft = () => {
    if (newAcName.trim()) {
      store.addAircraft(newAcName, newAcCategory);
      setNewAcName('');
    }
  };

  if (!activeAc) {
    return <div className="p-10 text-center">No aircraft available. <button onClick={store.generateFleet} className="text-blue-500 underline">Generate Fleet</button></div>;
  }

  const getComp = (type: string) => activeAc.components.find(c => c.type === type);
  const engine = getComp('Engine');
  const fuel = getComp('Fuel System');
  const hyd = getComp('Hydraulic System');
  const elec = getComp('Electrical System');
  const avionics = getComp('Avionics');
  const gear = getComp('Landing Gear');
  const airframe = getComp('Airframe');

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-blue-600" />
            Aircraft Telemetry & Sensor Simulation Center
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-mono uppercase tracking-wide">Primary Source of Truth / Global Sim State</p>
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto">
          <button
            onClick={store.toggleSimulation}
            className={`px-4 py-2 font-bold rounded flex items-center gap-2 text-white shadow-sm transition-colors text-xs whitespace-nowrap ${
              store.isSimulating ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {store.isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {store.isSimulating ? 'Pause Simulation' : 'Start Simulation'}
          </button>
          <button onClick={store.resetSimulation} className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded text-xs flex items-center gap-2 shadow-sm whitespace-nowrap">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={store.randomDegradation} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-xs flex items-center gap-2 shadow-sm whitespace-nowrap">
            <Activity className="w-3.5 h-3.5" /> Random Degrade
          </button>
          <button onClick={store.generateFleet} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-2 shadow-sm whitespace-nowrap">
            <Database className="w-3.5 h-3.5" /> Generate Fleet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT PANEL: Aircraft Configuration */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
          <div className="bg-slate-900 text-slate-100 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            Aircraft Configuration
          </div>
          <div className="p-5 flex-grow space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Target Aircraft</label>
              <div className="relative">
                <select 
                  value={store.selectedAircraftId || ''} 
                  onChange={(e) => store.setSelectedAircraftId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {store.aircraftList.map(a => (
                    <option key={a.id} value={a.id}>{a.tailNumber} - {a.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aircraft ID</div>
                <div className="font-mono text-sm font-bold text-slate-900">{activeAc.id}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aircraft Name</div>
                <div className="text-sm font-bold text-slate-900">{activeAc.name}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category</div>
                <div className="text-sm font-bold text-slate-900">{activeAc.category}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</div>
                <div className={`text-sm font-bold flex items-center gap-1.5 ${activeAc.status === 'Operational' ? 'text-emerald-600' : activeAc.status === 'Warning' ? 'text-amber-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${activeAc.status === 'Operational' ? 'bg-emerald-600' : activeAc.status === 'Warning' ? 'bg-amber-600' : 'bg-red-600'}`}></div>
                  {activeAc.status}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Flight Hours</div>
                <div className="font-mono text-sm font-bold text-slate-900">{activeAc.flightHours.toLocaleString()} HRS</div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 space-y-3">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Create New</h3>
               <input type="text" value={newAcName} onChange={e => setNewAcName(e.target.value)} placeholder="Name" className="w-full p-2 border border-slate-200 rounded text-xs" />
               <select value={newAcCategory} onChange={e => setNewAcCategory(e.target.value as FleetCategory)} className="w-full p-2 border border-slate-200 rounded text-xs">
                 <option value="Fighter">Fighter</option>
                 <option value="Transport">Transport</option>
                 <option value="UAV">UAV</option>
               </select>
               <button onClick={handleAddAircraft} className="w-full py-2 bg-slate-800 text-white text-xs font-bold rounded">Add Aircraft</button>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Live Telemetry Generator */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
          <div className="bg-slate-900 text-slate-100 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Live Telemetry Generator</div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div> BROADCASTING</div>
          </div>
          
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50/50 flex-grow">
            
            <TelemetryCard title="Engine RPM" value={engine?.rpm?.toLocaleString() || '0'} unit="RPM" trend={engine?.trend} critical={engine && engine.rpm && engine.rpm > 14000 ? true : false} />
            <TelemetryCard title="Engine Temp" value={engine?.temperature?.toFixed(1) || '0'} unit="°C" trend={engine?.trend} critical={engine && engine.temperature > 900 ? true : false} />
            <TelemetryCard title="Vibration" value={engine?.vibration?.toFixed(2) || '0'} unit="IPS" trend={engine?.trend} critical={engine && engine.vibration > 2.0 ? true : false} />
            <TelemetryCard title="Oil Pressure" value={engine?.oilPressure?.toFixed(1) || '0'} unit="PSI" trend={engine?.trend} critical={engine && engine.oilPressure < 30 ? true : false} />
            <TelemetryCard title="Fuel Flow" value={engine?.fuelFlow?.toLocaleString() || '0'} unit="PPH" trend={engine?.trend} critical={false} />
            <TelemetryCard title="Fuel Level" value={(fuel as any)?.fuelLevel?.toFixed(1) || '100'} unit="%" trend={fuel?.trend} critical={(fuel as any)?.fuelLevel < 20 ? true : false} />
            <TelemetryCard title="Hyd Pressure" value={hyd?.pressure?.toLocaleString() || '0'} unit="PSI" trend={hyd?.trend} critical={hyd && hyd.pressure < 1500 ? true : false} />
            <TelemetryCard title="Battery Volt" value={elec?.voltage?.toFixed(1) || '0'} unit="VDC" trend={elec?.trend} critical={elec && elec.voltage < 22 ? true : false} />
            
            <HealthCard title="Engine Health" health={engine?.healthScore || 0} />
            <HealthCard title="Avionics Health" health={avionics?.healthScore || 0} />
            <HealthCard title="Landing Gear" health={gear?.healthScore || 0} />
            <HealthCard title="Airframe" health={airframe?.healthScore || 0} />
            
            <div className="col-span-2 sm:col-span-3 mt-4 bg-slate-900 rounded p-4 flex items-center justify-between border border-slate-700 shadow-inner">
               <div className="text-slate-400 font-mono text-xs uppercase tracking-wider font-bold">Overall Aircraft Health</div>
               <div className={`text-3xl font-black font-mono tracking-tight ${activeAc.healthScore < 40 ? 'text-red-500' : activeAc.healthScore < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                 {activeAc.healthScore.toFixed(1)}%
               </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: Fault Injection Center */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
          <div className="bg-red-950 text-red-100 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-red-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-500" />
            Fault Injection Center
          </div>
          <div className="p-5 flex-grow bg-red-50/30 space-y-3">
             <p className="text-xs text-slate-500 mb-4">Click to inject faults into the active aircraft. Telemetry will update instantly across the platform.</p>
             
             <FaultButton label="Engine Overheat" onClick={() => store.injectFault(activeAc.id, 'Engine', 'Engine Overheat')} />
             <FaultButton label="High Vibration" onClick={() => store.injectFault(activeAc.id, 'Engine', 'High Vibration')} />
             <FaultButton label="Fuel Leak" onClick={() => store.injectFault(activeAc.id, 'Fuel System', 'Fuel Leak')} />
             <FaultButton label="Hydraulic Failure" onClick={() => store.injectFault(activeAc.id, 'Hydraulic System', 'Hydraulic Failure')} />
             <FaultButton label="Avionics Failure" onClick={() => store.injectFault(activeAc.id, 'Avionics', 'Avionics Failure')} />
             <FaultButton label="Electrical Failure" onClick={() => store.injectFault(activeAc.id, 'Electrical System', 'Electrical Failure')} />
             <FaultButton label="Landing Gear Failure" onClick={() => store.injectFault(activeAc.id, 'Landing Gear', 'Landing Gear Failure')} />
             
          </div>
        </div>

      </div>
    </div>
  );
};

const TelemetryCard = ({ title, value, unit, trend, critical }: { title: string, value: string, unit: string, trend?: string, critical: boolean }) => (
  <div className={`p-3 rounded border ${critical ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'} shadow-sm flex flex-col justify-between`}>
    <div className={`text-[10px] font-bold uppercase tracking-wider ${critical ? 'text-red-700' : 'text-slate-500'}`}>{title}</div>
    <div className="mt-1 flex items-end gap-1">
      <span className={`text-xl font-black font-mono tracking-tight ${critical ? 'text-red-600' : 'text-slate-900'}`}>{value}</span>
      <span className={`text-[10px] font-bold mb-1 ${critical ? 'text-red-500' : 'text-slate-400'}`}>{unit}</span>
    </div>
  </div>
);

const HealthCard = ({ title, health }: { title: string, health: number }) => (
  <div className="p-3 rounded border bg-white border-slate-200 shadow-sm flex flex-col justify-between">
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</div>
    <div className={`text-xl mt-1 font-black font-mono tracking-tight ${health < 40 ? 'text-red-600' : health < 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
      {health.toFixed(1)}%
    </div>
  </div>
);

const FaultButton = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full py-2.5 px-3 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-700 text-xs font-bold rounded shadow-sm transition-colors text-left flex items-center justify-between group"
  >
    <span>{label}</span>
    <AlertTriangle className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);
"""

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(new_component)
