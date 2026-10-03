import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plane, 
  Layers, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Aircraft } from '../types/fleet';

interface AvailabilitySimulatorProps {
  aircraftList: Aircraft[];
}

export const AvailabilitySimulator: React.FC<AvailabilitySimulatorProps> = ({ aircraftList }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['AC-F023']);
  const [maintenanceType, setMaintenanceType] = useState<'Predictive' | 'Preventive' | 'Corrective' | 'Depot Overhaul'>('Predictive');
  const [downtimeHours, setDowntimeHours] = useState<number>(36);

  const totalAircraft = aircraftList.length;
  const currentOperational = aircraftList.filter(a => a.status === 'Operational').length;
  const currentAvailability = Math.round((currentOperational / totalAircraft) * 1000) / 10;

  // Selected aircraft that are currently operational that will be pulled
  const operationalPulled = selectedIds.filter(id => {
    const ac = aircraftList.find(a => a.id === id);
    return ac && ac.status === 'Operational';
  }).length;

  const simulatedOperational = Math.max(0, currentOperational - operationalPulled);
  const projectedAvailability = Math.round((simulatedOperational / totalAircraft) * 1000) / 10;
  const impactDelta = Math.round((projectedAvailability - currentAvailability) * 10) / 10;
  const recoveryDays = Math.ceil(downtimeHours / 24);

  // Trajectory Simulation Data
  const chartData = [
    { time: 'Day 0 (Now)', baseline: currentAvailability, projected: currentAvailability },
    { time: 'Day 1 (Downtime)', baseline: currentAvailability, projected: projectedAvailability },
    { time: 'Day 2', baseline: Math.min(100, currentAvailability + 1.0), projected: projectedAvailability },
    { time: 'Day 3', baseline: Math.min(100, currentAvailability + 2.0), projected: Math.min(100, projectedAvailability + (selectedIds.length > 1 ? 5 : 12)) },
    { time: 'Day 4 (Recovery)', baseline: Math.min(100, currentAvailability + 2.5), projected: Math.min(100, projectedAvailability + (selectedIds.length > 1 ? 11 : 23)) },
    { time: 'Day 5 (Restored)', baseline: Math.min(100, currentAvailability + 3.0), projected: Math.min(100, currentAvailability + 2.0) },
    { time: 'Day 7', baseline: Math.min(100, currentAvailability + 3.5), projected: Math.min(100, currentAvailability + 4.0) }
  ];

  const toggleAircraftSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Fleet Availability Simulator</h1>
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-medium">
            OPERATIONAL READINESS MODEL
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Simulate pulling operational airframes for planned or unscheduled maintenance, calculate availability delta, and project recovery timeline.
        </p>
      </div>

      {/* Simulator Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Availability */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Current Availability</div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">{currentAvailability}%</div>
          <div className="text-xs text-slate-500 mt-0.5">{currentOperational} of {totalAircraft} operational</div>
        </div>

        {/* Projected Availability */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs border-l-4 border-l-indigo-600">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Projected Availability</div>
          <div className="text-3xl font-extrabold font-mono text-indigo-700 mt-1">{projectedAvailability}%</div>
          <div className="text-xs text-slate-500 mt-0.5">{simulatedOperational} of {totalAircraft} operational</div>
        </div>

        {/* Maintenance Impact Delta */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Fleet Impact Delta</div>
          <div className={`text-3xl font-extrabold font-mono mt-1 ${impactDelta < 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {impactDelta}%
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{selectedIds.length} airframes staged</div>
        </div>

        {/* Expected Recovery */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Expected Recovery</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 mt-1">{recoveryDays} Days</div>
          <div className="text-xs text-slate-500 mt-0.5">{downtimeHours} downtime hours</div>
        </div>
      </div>

      {/* Main Simulator Controls & Visual Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Airframe Selection & Parameters */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-5">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              1. Select Airframes to Stage
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {aircraftList.map(ac => {
                const isSelected = selectedIds.includes(ac.id);
                return (
                  <button
                    key={ac.id}
                    onClick={() => toggleAircraftSelection(ac.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 font-semibold'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                        {isSelected && <span className="text-white text-[9px]">✓</span>}
                      </div>
                      <span className="font-mono">{ac.tailNumber}</span>
                      <span className="text-slate-500 font-normal">({ac.name})</span>
                    </div>

                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                      ac.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ac.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Maintenance Work Scope */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              2. Maintenance Work Scope
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['Predictive', 'Preventive', 'Corrective', 'Depot Overhaul'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setMaintenanceType(type);
                    setDowntimeHours(type === 'Depot Overhaul' ? 96 : type === 'Corrective' ? 36 : type === 'Preventive' ? 16 : 28);
                  }}
                  className={`p-2 rounded border text-left font-medium transition-colors ${
                    maintenanceType === type
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>{type}</div>
                  <div className="text-[10px] text-slate-400">
                    {type === 'Depot Overhaul' ? '96h est' : type === 'Corrective' ? '36h est' : type === 'Preventive' ? '16h est' : '28h est'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Downtime Slider */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-700">Downtime Duration:</span>
              <span className="font-mono font-bold text-indigo-700">{downtimeHours} Hours</span>
            </div>
            <input
              type="range"
              min="8"
              max="168"
              step="4"
              value={downtimeHours}
              onChange={e => setDowntimeHours(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>8h (Quick-Turn)</span>
              <span>72h</span>
              <span>168h (Depot Phase)</span>
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): Visual Comparison Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Visual Comparison: Current vs Simulated Availability
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Projected theater availability curve across next 7-day deployment window</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="inline-block w-3 h-0.5 bg-slate-400"></span>
              <span className="text-slate-500">Baseline</span>
              <span className="inline-block w-3 h-0.5 bg-indigo-600 ml-2"></span>
              <span className="text-indigo-700 font-semibold">Simulated</span>
            </div>
          </div>

          {/* Recharts Line Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[40, 100]} stroke="#94a3b8" fontSize={11} unit="%" tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Availability']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Baseline" />
                <Line type="monotone" dataKey="projected" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} name="Simulated" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Theater Impact Summary */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-700 font-medium">Mission Impact Assessment:</span>
              <span className="font-bold text-slate-900">
                {selectedIds.length > 2 ? 'ELEVATED SORTIE RISK (THEATER RESERVE BELOW 60%)' : 'ACCEPTABLE TACTICAL CEILING MAINTAINED'}
              </span>
            </div>
            <span className="font-mono text-slate-500 text-[11px]">Recovery Target: Day {recoveryDays}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
