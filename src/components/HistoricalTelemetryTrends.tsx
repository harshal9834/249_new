import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Thermometer, Gauge, Settings, ShieldAlert, BrainCircuit } from 'lucide-react';
import { useSimulatorStore } from '../store/simulatorStore';

export const HistoricalTelemetryTrends: React.FC = () => {
  const store = useSimulatorStore();
  const activeAc = store.aircraftList.find(a => a.id === store.selectedAircraftId) || store.aircraftList[0];
  
    const engineComp = activeAc?.components.find(c => c.type === 'Engine');
  
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
  }

  if (!activeAc) return null;

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-purple-600" />
          Explainable AI & TimescaleDB Historical Trends
        </h2>
        <p className="text-sm text-slate-500 mt-1">Live timeseries metrics polled directly from TimescaleDB for Explainable AI analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RPM & Temp */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
             <Thermometer className="w-4 h-4 text-orange-500" />
             Engine RPM & Temperature
           </h3>
           <div className="h-64">
             {false ? <div className="h-full flex items-center justify-center text-slate-400">Loading TimescaleDB data...</div> : (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="time" tick={{fontSize: 10}} tickMargin={10} />
                   <YAxis yAxisId="left" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                   <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                   <Tooltip />
                   <Legend wrapperStyle={{fontSize: '11px'}} />
                   <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#3b82f6" strokeWidth={2} dot={false} name="RPM" />
                   <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} name="Temp (C)" />
                 </LineChart>
               </ResponsiveContainer>
             )}
           </div>
        </div>

        {/* Vibration & Oil Pressure */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
             <Activity className="w-4 h-4 text-emerald-500" />
             Vibration & Oil Pressure
           </h3>
           <div className="h-64">
             {false ? <div className="h-full flex items-center justify-center text-slate-400">Loading TimescaleDB data...</div> : (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="time" tick={{fontSize: 10}} tickMargin={10} />
                   <YAxis yAxisId="left" tick={{fontSize: 10}} domain={[0, 'auto']} />
                   <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} domain={[0, 'auto']} />
                   <Tooltip />
                   <Legend wrapperStyle={{fontSize: '11px'}} />
                   <Line yAxisId="left" type="monotone" dataKey="vib" stroke="#10b981" strokeWidth={2} dot={false} name="Vibration (IPS)" />
                   <Line yAxisId="right" type="monotone" dataKey="oil" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Oil Pressure (PSI)" />
                 </LineChart>
               </ResponsiveContainer>
             )}
           </div>
        </div>

        {/* Health Scores */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm lg:col-span-2">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
             <ShieldAlert className="w-4 h-4 text-blue-500" />
             Aircraft Health Degradation Curve
           </h3>
           <div className="h-64">
             {false ? <div className="h-full flex items-center justify-center text-slate-400">Loading TimescaleDB data...</div> : (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={healthData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="time" tick={{fontSize: 10}} tickMargin={10} />
                   <YAxis tick={{fontSize: 10}} domain={[0, 100]} />
                   <Tooltip />
                   <Legend wrapperStyle={{fontSize: '11px'}} />
                   <Line type="monotone" dataKey="overall" stroke="#0ea5e9" strokeWidth={3} dot={false} name="Overall Health %" />
                   <Line type="monotone" dataKey="engine" stroke="#f43f5e" strokeWidth={2} dot={false} name="Engine Health %" strokeDasharray="5 5" />
                 </LineChart>
               </ResponsiveContainer>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};
