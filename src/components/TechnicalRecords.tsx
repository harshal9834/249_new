import React from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import { FileText, Wrench, Building2, Calendar, ClipboardCheck } from 'lucide-react';

export const TechnicalRecords: React.FC = () => {
  const store = useSimulatorStore();
  const { maintenanceRecords, agencies, aircraftList } = store;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Technical Records & History
        </h1>
        <p className="text-sm text-slate-500 mt-1">Aircraft maintenance history, component replacement tracking, and agency workflow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Agencies */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            Maintenance Agencies
          </h2>
          {agencies.map(agency => (
            <div key={agency.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900">{agency.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${agency.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {agency.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Location: {agency.location}</p>
                <p>Tier: {agency.tier}</p>
                <p>Cert Level: {agency.certificationLevel}</p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between font-mono font-semibold">
                  <span>Avg Turnaround: {agency.averageTurnaroundHours}h</span>
                  <span>Active WOs: {agency.activeWorkOrders}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Records / History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-slate-400" />
            Aircraft Maintenance History & Component Replacements
          </h2>
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="p-3">Date</th>
                    <th className="p-3">Aircraft</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Replaced Part</th>
                    <th className="p-3">Agency</th>
                    <th className="p-3">Tech ID</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {maintenanceRecords.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No maintenance records logged in this session. Use Simulator to trigger actions.</td></tr>
                  ) : (
                    maintenanceRecords.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {new Date(rec.dateCompleted).toLocaleDateString()} {new Date(rec.dateCompleted).toLocaleTimeString()}
                        </td>
                        <td className="p-3 font-bold text-slate-800">{rec.tailNumber}</td>
                        <td className="p-3 text-slate-700 max-w-xs truncate" title={rec.actionTaken}>{rec.actionTaken}</td>
                        <td className="p-3">
                          {rec.replacedPartId ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-mono">
                              <Wrench className="w-3 h-3" />
                              {rec.replacedPartId}
                            </span>
                          ) : <span className="text-slate-400 text-xs">N/A</span>}
                        </td>
                        <td className="p-3 text-xs font-semibold text-slate-600">{rec.agencyName}</td>
                        <td className="p-3 font-mono text-xs text-slate-400">{rec.techId}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
