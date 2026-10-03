import React from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import { Activity, Clock, Wrench, AlertTriangle, TrendingDown, Target, BrainCircuit } from 'lucide-react';

function safeNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) && !isNaN(n) ? n : 0;
}

export const MaintenanceAnalyticsCenter: React.FC = () => {
  const store = useSimulatorStore();
  const analytics = store.analytics ?? {};
  const predictions = store.predictions ?? [];
  const aircraftList = store.aircraftList ?? [];

  if (Object.keys(analytics).length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-lg border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-700">No analytics data available</h2>
        <p className="text-slate-500 text-sm">TimescaleDB returned an empty analytics payload.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Maintenance Analytics Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">Live MTBF, MTTR, Downtime analytics and AI Failure Probability Prediction.</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="MTBF (Mean Time Between Failures)" value={`${safeNumber(analytics.mtbfHours).toFixed(1)} HRS`} icon={<Clock />} trend="stable" />
        <MetricCard title="MTTR (Mean Time To Repair)" value={`${safeNumber(analytics.mttrHours).toFixed(1)} HRS`} icon={<Wrench />} trend="improving" />
        <MetricCard title="Fleet Downtime" value={`${safeNumber(analytics.fleetDowntimePct).toFixed(1)}%`} icon={<TrendingDown />} trend="degrading" />
        <MetricCard title="Total Maintenance Cost" value={`$${safeNumber(analytics.totalMaintenanceCost).toLocaleString()}`} icon={<Target />} trend="degrading" />
      </div>

      {/* AI Failure Predictions */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white p-3 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-blue-400" />
          AI Failure Probability Prediction (Live)
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-3 font-semibold">Aircraft</th>
                <th className="p-3 font-semibold">Component</th>
                <th className="p-3 font-semibold">Probability</th>
                <th className="p-3 font-semibold">Est. Time to Failure</th>
                <th className="p-3 font-semibold">Contributing Factors</th>
                <th className="p-3 font-semibold">AI Confidence</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {predictions.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500">No imminent failures predicted. System nominal.</td></tr>
              ) : (
                predictions.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {aircraftList.find(a => a.id === p.aircraftId)?.tailNumber || p.aircraftId}
                    </td>
                    <td className="p-3 text-slate-700">{p.componentName}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${safeNumber(p.probabilityScore) > 80 ? 'bg-red-500' : safeNumber(p.probabilityScore) > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${safeNumber(p.probabilityScore)}%` }}></div>
                        </div>
                        <span className={`font-bold font-mono ${safeNumber(p.probabilityScore) > 80 ? 'text-red-600' : safeNumber(p.probabilityScore) > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{safeNumber(p.probabilityScore).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{safeNumber(p.predictedTimeOfFailure).toFixed(1)} HRS</td>
                    <td className="p-3 text-xs text-slate-500">{(p.contributingFactors || []).join(', ')}</td>
                    <td className="p-3 text-blue-600 font-semibold font-mono">{safeNumber(p.aiConfidence).toFixed(1)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">{title}</div>
      <div className="text-2xl font-black font-mono text-slate-900">{value}</div>
    </div>
    <div className={`p-3 rounded-full ${trend === 'degrading' ? 'bg-red-50 text-red-600' : trend === 'improving' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
      {icon}
    </div>
  </div>
);
