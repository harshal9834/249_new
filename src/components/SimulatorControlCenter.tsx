import React, { useEffect, useState } from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import { Play, Pause, RefreshCw, AlertTriangle, Activity, Settings2, ShieldAlert, Cpu, Database, Wind, Droplets, Thermometer, Gauge, Plane, Wrench, Shield, CheckCircle } from 'lucide-react';
import { Aircraft } from '../types/fleet';

const TelemetryCard = ({ title, value, unit, trend, critical }: { title: string, value: string | number, unit: string, trend?: string, critical?: boolean }) => {
  let arrow = '−';
  let color = 'text-emerald-600';
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
    <div className={`bg-white shadow-sm border ${critical ? 'border-red-500/50' : 'border-slate-200'} p-3 rounded flex flex-col justify-between relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <Activity className="w-8 h-8 text-slate-700" />
      </div>
      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 z-10">{title}</div>
      <div className="flex items-baseline gap-1 z-10">
        <span className={`text-xl font-black font-mono tracking-tight ${color}`}>{value}</span>
        <span className="text-[10px] font-bold text-slate-500">{unit}</span>
        <span className={`ml-auto text-sm font-bold ${trendColor}`}>{arrow}</span>
      </div>
    </div>
  );
};

export const SimulatorControlCenter: React.FC = () => {
  const store = useSimulatorStore();

  useEffect(() => {
    if (store.aircraftList.length > 0 && !store.selectedAircraftId) {
      store.setSelectedAircraftId(store.aircraftList[0].id);
    }
  }, [store.aircraftList, store.selectedAircraftId, store]);

  
  const activeAc = store.aircraftList.find(a => a.id === store.selectedAircraftId) || store.aircraftList[0];
  if (!activeAc) return <div className="p-10 text-slate-900">No active aircraft found. Please reset.</div>;

  const engineComp = activeAc.components.find(c => c.type === 'Engine');
  const fuelComp = activeAc.components.find(c => c.type === 'Fuel System');
  const hydComp = activeAc.components.find(c => c.type === 'Hydraulic System');
  const aviComp = activeAc.components.find(c => c.type === 'Avionics');
  const elecComp = activeAc.components.find(c => c.type === 'Electrical System');
  const lgComp = activeAc.components.find(c => c.type === 'Landing Gear');
  const frameComp = activeAc.components.find(c => c.type === 'Airframe');

  // Explainable AI Extraction
  const xaiPrediction = store.predictions.find(p => p.aircraftId === activeAc.id && p.componentId === engineComp?.id);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* TOP BAR */}
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center text-slate-900 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Database className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-widest">AeroPulse Telemetry Lab</h1>
            <p className="text-[10px] text-slate-500 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              TIMESCALEDB 10HZ STREAM ACTVE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select 
            className="bg-slate-100 border border-slate-200 text-sm rounded px-3 py-1.5 focus:ring-blue-500 text-slate-900"
            value={store.selectedAircraftId || ''}
            onChange={(e) => store.setSelectedAircraftId(e.target.value)}
          >
            {store.aircraftList.map(a => (
              <option key={a.id} value={a.id}>{a.tailNumber} - {a.name}</option>
            ))}
          </select>

          <div className="h-6 w-px bg-slate-200"></div>

          <button
            onClick={store.toggleSimulation}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold transition-colors ${store.isSimulating ? 'bg-amber-500/20 text-amber-600 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/50 hover:bg-emerald-500/30'}`}
          >
            {store.isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {store.isSimulating ? 'PAUSE TELEMETRY' : 'START SIMULATION'}
          </button>
          
          <button
            onClick={store.resetSimulation}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            RESET
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 p-6 flex-grow">
        
        {/* LEFT PANEL: MISSION CONTROL */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
          
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-50 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-slate-200 flex items-center gap-2 text-slate-700">
              <Plane className="w-4 h-4 text-blue-600" />
              Aircraft Details
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono">TAIL NO</span>
                <span className="text-slate-800 font-bold">{activeAc.tailNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono">TYPE</span>
                <span className="text-slate-800 font-bold">{activeAc.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono">PHASE</span>
                <span className="text-blue-600 font-bold uppercase">{activeAc.operatingMode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono">STATUS</span>
                <span className={`font-bold ${activeAc.status === 'Operational' ? 'text-emerald-600' : activeAc.status === 'Critical' ? 'text-red-500' : 'text-amber-600'}`}>
                  {activeAc.status}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono">GROSS WT</span>
                <span className="text-slate-800 font-bold">{Math.round(activeAc.weight || 0).toLocaleString()} LBS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-mono">FLIGHT HRS</span>
                <span className="text-slate-800 font-bold">{activeAc.flightHours.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-50 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-slate-200 flex items-center gap-2 text-slate-700">
              <Wind className="w-4 h-4 text-sky-400" />
              Atmospheric & Weather
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono flex items-center gap-2"><Thermometer className="w-3 h-3"/> OAT</span>
                <span className="text-slate-800 font-bold">{Math.round(activeAc.outsideAirTemp || 15)} °C</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono flex items-center gap-2"><Gauge className="w-3 h-3"/> PRESSURE</span>
                <span className="text-slate-800 font-bold">{Math.round(activeAc.ambientPressure || 1013)} hPa</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono flex items-center gap-2"><Droplets className="w-3 h-3"/> HUMIDITY</span>
                <span className="text-slate-800 font-bold">{Math.round(activeAc.humidity || 45)} %</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-mono flex items-center gap-2"><Wind className="w-3 h-3"/> WIND</span>
                <span className="text-slate-800 font-bold">{Math.round(activeAc.windSpeed || 12)} KTS</span>
              </div>
            </div>
          </div>

        </div>

        {/* CENTER PANEL: LIVE TELEMETRY STREAM */}
        <div className="col-span-12 xl:col-span-6 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4ade80 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="bg-slate-50/80 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-slate-200 flex items-center gap-2 text-emerald-600 backdrop-blur">
              <Activity className="w-4 h-4" />
              Engine System Dynamics
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <TelemetryCard title="Engine RPM" value={Math.round(engineComp?.rpm || 0).toLocaleString()} unit="RPM" trend={engineComp?.trend} critical={(engineComp?.rpm || 0) > 6000} />
              <TelemetryCard title="Temperature" value={Math.round(engineComp?.temperature || 0)} unit="°C" trend={engineComp?.trend} critical={(engineComp?.temperature || 0) > 850} />
              <TelemetryCard title="Vibration" value={(engineComp?.vibration || 0).toFixed(2)} unit="IPS" trend={engineComp?.trend} critical={(engineComp?.vibration || 0) > 2.0} />
              <TelemetryCard title="Oil Pressure" value={Math.round(engineComp?.oilPressure || 0)} unit="PSI" trend={(engineComp?.oilPressure || 0) < 40 ? 'degrading' : 'stable'} critical={(engineComp?.oilPressure || 0) < 20} />
              <TelemetryCard title="Fuel Flow" value={Math.round(engineComp?.fuelFlow || 0)} unit="PPH" trend="stable" />
              <TelemetryCard title="Throttle" value={Math.round(activeAc.throttle || 0)} unit="%" trend="stable" />
              <TelemetryCard title="Engine Load" value={Math.round(activeAc.engineLoad || 0)} unit="%" trend="stable" critical={(activeAc.engineLoad || 0) > 95} />
              <TelemetryCard title="Engine Health" value={Math.round(engineComp?.healthScore || 0)} unit="%" trend={engineComp?.healthScore && engineComp.healthScore < 80 ? 'degrading' : 'stable'} critical={(engineComp?.healthScore || 0) < 60} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden relative">
            <div className="bg-slate-50/80 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-slate-200 flex items-center gap-2 text-blue-600">
              <Plane className="w-4 h-4" />
              Flight Kinematics
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <TelemetryCard title="Altitude" value={Math.round(activeAc.altitude || 0).toLocaleString()} unit="FT" trend="stable" />
              <TelemetryCard title="Speed (TAS)" value={Math.round(activeAc.speed || 0)} unit="KTS" trend="stable" />
              <TelemetryCard title="Vertical Spd" value={Math.round(activeAc.verticalSpeed || 0)} unit="FPM" trend="stable" />
              <TelemetryCard title="Heading" value={Math.round(activeAc.heading || 0)} unit="°" trend="stable" />
              <TelemetryCard title="Bank Angle" value={Math.round(activeAc.bankAngle || 0)} unit="°" trend="stable" />
              <TelemetryCard title="Pitch Angle" value={Math.round(activeAc.pitchAngle || 0)} unit="°" trend="stable" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden relative mb-6">
            <div className="bg-slate-50/80 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-slate-200 flex items-center gap-2 text-purple-600">
              <Settings2 className="w-4 h-4" />
              Aircraft Subsystems
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <TelemetryCard title="Hydraulic Pres" value={Math.round(hydComp?.pressure || 0)} unit="PSI" trend="stable" critical={(hydComp?.pressure || 0) < 1500} />
              <TelemetryCard title="Battery Volt" value={(elecComp?.voltage || 0).toFixed(1)} unit="V" trend="stable" critical={(elecComp?.voltage || 0) < 22} />
              <TelemetryCard title="Fuel Level" value={(fuelComp?.fuelLevel || 0).toFixed(1)} unit="%" trend="degrading" critical={(fuelComp?.fuelLevel || 0) < 10} />
              <TelemetryCard title="Avionics Hlth" value={Math.round(aviComp?.healthScore || 0)} unit="%" trend="stable" critical={(aviComp?.healthScore || 0) < 50} />
              <TelemetryCard title="L. Gear Hlth" value={Math.round(lgComp?.healthScore || 0)} unit="%" trend="stable" critical={(lgComp?.healthScore || 0) < 50} />
              <TelemetryCard title="Overall Hlth" value={Math.round(activeAc.healthScore)} unit="%" trend="stable" critical={activeAc.healthScore < 50} />
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: FAULT INJECTION & MAINTENANCE & XAI */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-6">
          
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-red-50 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-red-200 flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              Fault Injection
            </div>
            <div className="p-4 flex flex-col gap-2">
              <button onClick={() => store.injectFault(activeAc.id, 'Engine', 'Engine Overheat')} className="w-full text-left px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 transition flex items-center justify-between group">
                Engine Overheat <span className="opacity-0 group-hover:opacity-100 text-red-600 text-xs font-mono">INJECT</span>
              </button>
              <button onClick={() => store.injectFault(activeAc.id, 'Engine', 'High Vibration')} className="w-full text-left px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 transition flex items-center justify-between group">
                High Vibration <span className="opacity-0 group-hover:opacity-100 text-red-600 text-xs font-mono">INJECT</span>
              </button>
              <button onClick={() => store.injectFault(activeAc.id, 'Fuel System', 'Fuel Leak')} className="w-full text-left px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 transition flex items-center justify-between group">
                Fuel Leak <span className="opacity-0 group-hover:opacity-100 text-red-600 text-xs font-mono">INJECT</span>
              </button>
              <button onClick={() => store.injectFault(activeAc.id, 'Hydraulic System', 'Hydraulic Failure')} className="w-full text-left px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 transition flex items-center justify-between group">
                Hydraulic Failure <span className="opacity-0 group-hover:opacity-100 text-red-600 text-xs font-mono">INJECT</span>
              </button>
              <button onClick={() => store.injectFault(activeAc.id, 'Electrical System', 'Electrical Failure')} className="w-full text-left px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 transition flex items-center justify-between group">
                Electrical Failure <span className="opacity-0 group-hover:opacity-100 text-red-600 text-xs font-mono">INJECT</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-emerald-50 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-emerald-200 flex items-center gap-2 text-emerald-600">
              <Wrench className="w-4 h-4" />
              Maintenance Actions
            </div>
            <div className="p-4 flex flex-col gap-2">
              <button onClick={() => store.performMaintenance(activeAc.id, 'Engine', 'ag1')} className="w-full text-left px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 transition flex items-center justify-between">
                Repair Engine <Wrench className="w-3 h-3 text-emerald-500" />
              </button>
              <button onClick={() => store.performMaintenance(activeAc.id, 'Hydraulic System', 'ag1')} className="w-full text-left px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 transition flex items-center justify-between">
                Repair Hydraulics <Wrench className="w-3 h-3 text-emerald-500" />
              </button>
              <button onClick={() => store.performMaintenance(activeAc.id, 'Fuel System', 'ag1')} className="w-full text-left px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 transition flex items-center justify-between">
                Replace Fuel Pump <Wrench className="w-3 h-3 text-emerald-500" />
              </button>
              <button onClick={() => store.performMaintenance(activeAc.id, 'Engine', 'ag2')} className="w-full text-left px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 transition flex items-center justify-between border-l-2 border-l-emerald-500">
                Depot Overhaul <Database className="w-3 h-3 text-emerald-500" />
              </button>
            </div>
          </div>

          {/* EXPLAINABLE AI EMBEDDED */}
          {xaiPrediction || activeAc.healthScore < 85 ? (
            <div className="bg-white rounded-lg border border-blue-200 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2"><Cpu className="w-16 h-16 text-blue-500/10" /></div>
              <div className="bg-blue-50 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-blue-200/50 flex items-center gap-2 text-blue-600">
                <Cpu className="w-4 h-4" />
                Explainable AI Diagnostics
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Detected Anomaly</div>
                  <div className="text-sm text-red-600 font-bold">{xaiPrediction?.contributingFactors[0] || 'Accelerated Component Wear'}</div>
                </div>
                
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Root Cause Analysis</div>
                  <div className="text-xs text-slate-700 space-y-1 font-mono">
                    {xaiPrediction && (engineComp?.temperature || 0) > 750 && <div className="flex justify-between"><span>Thermal Stress</span><span className="text-red-600">47%</span></div>}
                    {xaiPrediction && (engineComp?.vibration || 0) > 1.5 && <div className="flex justify-between"><span>Bearing Degradation</span><span className="text-amber-600">32%</span></div>}
                    {(engineComp?.oilPressure || 0) < 40 && <div className="flex justify-between"><span>Low Oil Pressure</span><span className="text-amber-600">21%</span></div>}
                  </div>
                </div>

                <div className="bg-slate-100/80 p-3 rounded border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-600"/> Recommended Action</div>
                  <div className="text-xs text-slate-800">
                    {xaiPrediction?.probabilityScore && xaiPrediction.probabilityScore > 70 
                      ? 'Immediate grounding. Inspect turbine assembly within 24 flight hours.' 
                      : 'Schedule preventive maintenance at next base visit.'}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-200 pt-3">
                  <span className="text-slate-500">AI CONFIDENCE:</span>
                  <span className="text-blue-600 font-bold">{Math.round(xaiPrediction?.aiConfidence || 84)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden p-6 flex flex-col items-center justify-center text-center opacity-50">
               <Shield className="w-8 h-8 text-emerald-500 mb-2" />
               <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Systems Nominal</div>
               <div className="text-[10px] text-slate-500 mt-1">No AI anomalies detected.</div>
            </div>
          )}

        </div>
      </div>
      
      {/* GLOBAL STYLES FOR SCROLLBAR */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};
