import React from 'react';
import { 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  AlertCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export const FleetAnalytics: React.FC = () => {
  const healthData = [
    { range: '90-100% (Optimal)', count: 4, fill: '#10b981' },
    { range: '80-89% (Nominal)', count: 2, fill: '#3b82f6' },
    { range: '70-79% (Advisory)', count: 2, fill: '#f59e0b' },
    { range: '<70% (Degraded)', count: 1, fill: '#ef4444' }
  ];

  const failureTrendsData = [
    { month: 'May', Propulsion: 4, Avionics: 2, Hydraulics: 3, Structural: 1 },
    { month: 'Jun', Propulsion: 3, Avionics: 3, Hydraulics: 2, Structural: 1 },
    { month: 'Jul', Propulsion: 5, Avionics: 2, Hydraulics: 4, Structural: 0 },
    { month: 'Aug', Propulsion: 2, Avionics: 1, Hydraulics: 3, Structural: 2 },
    { month: 'Sep', Propulsion: 6, Avionics: 2, Hydraulics: 3, Structural: 1 },
    { month: 'Oct (Proj)', Propulsion: 3, Avionics: 1, Hydraulics: 2, Structural: 1 }
  ];

  const availabilityHistoryData = [
    { week: 'W35', actual: 88.5, target: 85 },
    { week: 'W36', actual: 86.2, target: 85 },
    { week: 'W37', actual: 84.0, target: 85 },
    { week: 'W38', actual: 81.5, target: 85 },
    { week: 'W39', actual: 77.8, target: 85 },
    { week: 'W40 (Now)', actual: 66.7, target: 85 }
  ];

  const utilizationData = [
    { tail: 'AF-023', hours: 1240, health: 68 },
    { tail: 'H-104', hours: 4890, health: 76 },
    { tail: 'RP-902', hours: 3120, health: 94 },
    { tail: 'EX-042', hours: 780, health: 91 },
    { tail: 'G-712', hours: 7420, health: 54 },
    { tail: 'GH-115', hours: 5410, health: 80 },
    { tail: 'RP-088', hours: 1640, health: 95 },
    { tail: 'PG-305', hours: 2190, health: 89 },
    { tail: 'ST-014', hours: 420, health: 94 }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Fleet Analytics & Reliability Engineering</h1>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
            EXECUTIVE ANALYTICS
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Longitudinal failure modes, subsystem reliability distributions, historical mission readiness, and flight hour utilization.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Mean Time Between Failure</div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">412.5 hrs</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">+14h improvement YoY</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Mean Time to Repair (MTTR)</div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">18.2 hrs</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Flightline quick-turn average</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Preventive Maintenance Ratio</div>
          <div className="text-3xl font-extrabold font-mono text-blue-700 mt-1">74.2%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Target: &gt;70% proactive</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Dispatch Reliability</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 mt-1">96.8%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">On-time sortie launch rate</div>
        </div>
      </div>

      {/* Charts Grid Row 1: Health Distribution & Failure Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Distribution */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Fleet Health Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Airframes grouped by calculated health score brackets</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Airframes`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failure Trends by Subsystem */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Subsystem Failure Trends (6-Month)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Monthly unscheduled maintenance removal frequencies</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={failureTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="Propulsion" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
                <Area type="monotone" dataKey="Hydraulics" stackId="1" stroke="#f59e0b" fill="#fde68a" />
                <Area type="monotone" dataKey="Avionics" stackId="1" stroke="#8b5cf6" fill="#ddd6fe" />
                <Area type="monotone" dataKey="Structural" stackId="1" stroke="#64748b" fill="#cbd5e1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Availability History & Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability History vs Target */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Fleet Availability vs DoD Target</h3>
            <p className="text-xs text-slate-500 mt-0.5">Weekly mission availability trajectory</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={availabilityHistoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} unit="%" tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} name="DoD 85% Target" />
                <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} name="Actual Availability" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aircraft Utilization (Flight Hours) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Cumulative Flight Hours by Airframe</h3>
            <p className="text-xs text-slate-500 mt-0.5">Airframe fatigue and service accumulation</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="tail" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="h" tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val.toLocaleString()} hrs`, 'Flight Hours']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="hours" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
