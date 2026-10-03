import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  ArrowLeft, 
  Box, 
  Cpu, 
  Activity, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  TrendingUp, 
  TrendingDown,
  Gauge,
  Thermometer,
  Layers,
  ChevronRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Aircraft, AircraftComponent, AircraftStatus } from '../types/fleet';

interface AircraftDetailsProps {
  aircraft: Aircraft;
  onBack: () => void;
  onOpenDigitalTwin: (aircraftId: string) => void;
  onOpenEngineTwin: (aircraftId: string) => void;
  onStatusChange: (aircraftId: string, status: AircraftStatus) => void;
}

export const AircraftDetails: React.FC<AircraftDetailsProps> = ({
  aircraft,
  onBack,
  onOpenDigitalTwin,
  onOpenEngineTwin,
  onStatusChange
}) => {
  const [selectedComp, setSelectedComp] = useState<AircraftComponent>(aircraft.components[0] || null);
  const [liveTelemetry, setLiveTelemetry] = useState({
    rpm: aircraft.components[0]?.rpm || 98.4,
    temperature: aircraft.components[0]?.temperature || 620,
    vibration: aircraft.components[0]?.vibration || 2.4,
    oilPressure: aircraft.components[0]?.oilPressure || 48,
    fuelFlow: aircraft.components[0]?.fuelFlow || 3850,
    voltage: 270.1,
    hydraulicPressure: 2980
  });

  // Simulated live telemetry streamer
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTelemetry(prev => {
        const jitter = (Math.random() - 0.5) * 0.04;
        const jitterTemp = (Math.random() - 0.5) * 3;
        const jitterVibe = (Math.random() - 0.5) * 0.05;

        return {
          rpm: Math.round((prev.rpm * (1 + jitter)) * 10) / 10,
          temperature: Math.round((prev.temperature + jitterTemp) * 10) / 10,
          vibration: Math.max(0.1, Math.round((prev.vibration + jitterVibe) * 100) / 100),
          oilPressure: Math.round((prev.oilPressure + (Math.random() - 0.5) * 0.6) * 10) / 10,
          fuelFlow: Math.round(prev.fuelFlow + (Math.random() - 0.5) * 40),
          voltage: Math.round((270.0 + (Math.random() - 0.5) * 1.2) * 10) / 10,
          hydraulicPressure: Math.round(2980 + (Math.random() - 0.5) * 30)
        };
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [aircraft.id]);

  const isCrit = aircraft.status === 'Critical';
  const isWarn = aircraft.status === 'Warning';
  const isMaint = aircraft.status === 'Maintenance';

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Fleet Table</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenDigitalTwin(aircraft.id)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs"
          >
            <Box className="w-3.5 h-3.5 text-blue-400" />
            <span>Launch Universal Aircraft 3D Twin</span>
          </button>
          <button
            onClick={() => onOpenEngineTwin(aircraft.id)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Launch Engine 3D Twin</span>
          </button>
        </div>
      </div>

      {/* Aircraft Master Profile Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-slate-100">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm">
              {aircraft.tailNumber.split('-')[1] || aircraft.tailNumber}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">{aircraft.name}</h1>
                <span className="text-sm font-mono font-bold text-slate-500">[{aircraft.tailNumber}]</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                  {aircraft.id}
                </span>
              </div>

              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Category: <strong className="text-slate-700">{aircraft.category}</strong></span>
                <span>•</span>
                <span>Squadron: <strong className="text-slate-700">{aircraft.squadron}</strong></span>
                <span>•</span>
                <span>Base: <strong className="text-slate-700">{aircraft.baseStation}</strong></span>
                <span>•</span>
                <span>Call Sign: <strong className="text-slate-700 font-mono">{aircraft.callSign}</strong></span>
              </div>
            </div>
          </div>

          {/* Status Changer & Health summary */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Health Index</div>
              <div className="text-2xl font-bold font-mono text-slate-900">{aircraft.healthScore}%</div>
            </div>

            <div className="border-l border-slate-200 pl-4">
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Operational State</label>
              <select
                value={aircraft.status}
                onChange={e => onStatusChange(aircraft.id, e.target.value as AircraftStatus)}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-md border ${
                  isCrit
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : isWarn
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : isMaint
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                <option value="Operational">OPERATIONAL (READY)</option>
                <option value="Warning">WARNING (DEGRADED)</option>
                <option value="Maintenance">MAINTENANCE (DEPOT)</option>
                <option value="Critical">CRITICAL (RED X GROUND)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Mission Sortie Hours</div>
            <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">{aircraft.missionHours} hrs</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Cumulative Flight Hours</div>
            <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">{aircraft.flightHours} hrs</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Last Inspection Performed</div>
            <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">{aircraft.lastMaintenance}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Next Scheduled Phase</div>
            <div className="text-lg font-bold font-mono text-blue-700 mt-0.5">{aircraft.nextInspection}</div>
          </div>
        </div>
      </div>

      {/* Live Telemetry Bar */}
      <div className="bg-slate-900 text-white rounded-lg p-4 shadow-sm border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-200">LIVE TELEMETRY STREAM (MIL-STD-1553B BUS)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
            <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
            <span>POLL RATE: 2.5s</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Core RPM</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">{liveTelemetry.rpm}%</div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Exhaust Gas Temp</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${liveTelemetry.temperature > 650 ? 'text-red-400' : 'text-slate-100'}`}>
              {liveTelemetry.temperature}°C
            </div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Vibration Harmonic</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${liveTelemetry.vibration > 2.0 ? 'text-red-400 font-extrabold' : 'text-slate-100'}`}>
              {liveTelemetry.vibration} IPS
            </div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Oil Pressure</div>
            <div className="text-base font-bold font-mono text-slate-100 mt-0.5">{liveTelemetry.oilPressure} PSI</div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Fuel Flow</div>
            <div className="text-base font-bold font-mono text-slate-100 mt-0.5">{liveTelemetry.fuelFlow} PPH</div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Hydraulic Sys</div>
            <div className="text-base font-bold font-mono text-slate-100 mt-0.5">{liveTelemetry.hydraulicPressure} PSI</div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Main DC Bus</div>
            <div className="text-base font-bold font-mono text-slate-100 mt-0.5">{liveTelemetry.voltage} V</div>
          </div>
        </div>
      </div>

      {/* Component Monitoring & Teardown Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Selector List (1 Column) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Subsystem Architecture</h2>
            <span className="text-[11px] font-mono text-slate-400">{aircraft.components.length} Subsystems</span>
          </div>

          <div className="space-y-2">
            {aircraft.components.map(comp => {
              const isSelected = selectedComp?.id === comp.id;
              const isCritComp = comp.status === 'Critical';
              const isWarnComp = comp.status === 'Warning';

              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedComp(comp)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-8 rounded-full ${
                        isCritComp ? 'bg-red-500' : isWarnComp ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{comp.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">S/N: {comp.serialNumber} • {comp.type}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-slate-800">{comp.healthScore}%</span>
                    <div
                      className={`text-[9px] font-mono uppercase font-bold ${
                        isCritComp ? 'text-red-600' : isWarnComp ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {comp.status}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Component Inspection & Diagnostics Panel (2 Columns) */}
        {selectedComp && (
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {selectedComp.type}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedComp.name}</h3>
                <p className="text-xs text-slate-500 font-mono">Serial Number: {selectedComp.serialNumber}</p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                    selectedComp.status === 'Critical'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : selectedComp.status === 'Warning'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedComp.status} (Risk: {selectedComp.riskLevel})
                </span>
                <div className="text-xs font-mono text-slate-500 mt-1">
                  Remaining Useful Life: <strong className="text-blue-700">{selectedComp.rulHours} Flight Hours</strong>
                </div>
              </div>
            </div>

            {/* Component Sensor Telemetry Cards */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Sensor Matrix Readings</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Health Score</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{selectedComp.healthScore}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Weibull Hazard Fit</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Operating Temp</div>
                  <div className={`text-lg font-bold font-mono mt-0.5 ${selectedComp.temperature > 650 ? 'text-red-600' : 'text-slate-900'}`}>
                    {selectedComp.temperature}°C
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Peak EGT limit: 710°C</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Vibration Level</div>
                  <div className={`text-lg font-bold font-mono mt-0.5 ${selectedComp.vibration > 2.0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {selectedComp.vibration} IPS
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Threshold: 1.80 IPS</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Oil Pressure</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {selectedComp.oilPressure || selectedComp.pressure} PSI
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Nominal: 45-55 PSI</div>
                </div>
              </div>
            </div>

            {/* Maintenance History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Logged Maintenance Events</h4>
              {selectedComp.maintenanceHistory && selectedComp.maintenanceHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedComp.maintenanceHistory.map((hist, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-900">{hist.action}</div>
                        <div className="text-[11px] text-slate-500">Inspection: {hist.type} • Performed by: {hist.tech}</div>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">{hist.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                  No unscheduled corrective actions logged in the past 180 days. All preventive phase checks normal.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => onOpenDigitalTwin(aircraft.id)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
              >
                <Box className="w-3.5 h-3.5 text-blue-400" />
                <span>Locate Component in Universal 3D Model</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
