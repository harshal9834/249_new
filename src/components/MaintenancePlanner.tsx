import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Users, 
  X,
  ChevronRight,
  Filter
} from 'lucide-react';
import { MaintenanceScheduleItem, Aircraft, RiskLevel } from '../types/fleet';

interface MaintenancePlannerProps {
  schedules: MaintenanceScheduleItem[];
  aircraftList: Aircraft[];
  onAddSchedule: (schedule: Partial<MaintenanceScheduleItem>) => void;
  onUpdateStatus: (id: string, status: any) => void;
}

export const MaintenancePlanner: React.FC<MaintenancePlannerProps> = ({
  schedules,
  aircraftList,
  onAddSchedule,
  onUpdateStatus
}) => {
  const [viewMode, setViewMode] = useState<'queue' | 'table'>('queue');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    aircraftId: aircraftList[0]?.id || 'AC-F023',
    title: 'High-Pressure Turbine Phase Teardown',
    type: 'Predictive' as any,
    priority: 'Critical' as RiskLevel,
    bayLocation: 'Hangar Bay 01 (Clean Environment)',
    estimatedHours: 28,
    assignedTeam: 'Propulsion Specialists Alpha Team',
    components: ['Engine Assembly']
  });

  const scheduledItems = schedules.filter(s => s.status === 'Scheduled');
  const inProgressItems = schedules.filter(s => s.status === 'In Progress');
  const overdueItems = schedules.filter(s => s.status === 'Overdue');
  const completedItems = schedules.filter(s => s.status === 'Completed');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ac = aircraftList.find(a => a.id === formData.aircraftId);
    onAddSchedule({
      ...formData,
      tailNumber: ac?.tailNumber || 'AF-023',
      aircraftName: ac?.name || 'F-35A Lightning II'
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Depot Maintenance Planner & Queue</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
              DEPOT OPERATIONS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate flightline quick-turns, phased scheduled inspections, and heavy depot overhauls across designated hangar bays.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-100 p-1 rounded-md flex space-x-1 text-xs">
            <button
              onClick={() => setViewMode('queue')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'queue' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hangar Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Work Orders List
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs border-l-4 border-l-amber-500">
          <div className="text-slate-500 font-medium">In Progress (Bay Occupied)</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{inProgressItems.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs border-l-4 border-l-blue-500">
          <div className="text-slate-500 font-medium">Scheduled (Upcoming)</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{scheduledItems.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs border-l-4 border-l-red-500">
          <div className="text-slate-500 font-medium">Overdue / Delayed</div>
          <div className="text-2xl font-bold font-mono text-red-600 mt-1">{overdueItems.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs border-l-4 border-l-emerald-500">
          <div className="text-slate-500 font-medium">Completed (This Month)</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{completedItems.length}</div>
        </div>
      </div>

      {/* Kanban Queue Board View */}
      {viewMode === 'queue' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scheduled Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Scheduled ({scheduledItems.length})</span>
              </span>
            </div>

            <div className="space-y-3">
              {scheduledItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">{item.tailNumber}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        item.priority === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.aircraftName}</p>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.bayLocation}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.assignedTeam}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-mono text-slate-500">{item.estimatedHours}h est</span>
                    <button
                      onClick={() => onUpdateStatus(item.id, 'In Progress')}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold"
                    >
                      Start Work
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>In Progress / In Bay ({inProgressItems.length})</span>
              </span>
            </div>

            <div className="space-y-3">
              {inProgressItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg border-2 border-amber-400 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">{item.tailNumber}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-800 animate-pulse">
                      ACTIVE IN BAY
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.aircraftName}</p>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">{item.bayLocation}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.assignedTeam}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-mono text-slate-500">{item.estimatedHours}h allocated</span>
                    <button
                      onClick={() => onUpdateStatus(item.id, 'Completed')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Sign Off</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue / Completed Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Completed / Released ({completedItems.length})</span>
              </span>
            </div>

            <div className="space-y-3">
              {completedItems.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs text-slate-400">
                  No recently signed off work orders this shift.
                </div>
              ) : (
                completedItems.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2 opacity-80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900">{item.tailNumber}</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold">FLIGHT CERTIFIED</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">{item.title}</div>
                    <div className="text-[11px] text-slate-500">{item.bayLocation}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Work Orders Table View */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Airframe</th>
                <th className="py-3 px-4">Title / Scope</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Bay Location</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4 text-right">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.id}</td>
                  <td className="py-3 px-4 font-mono font-bold">{item.tailNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{item.title}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[11px]">{item.priority}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{item.bayLocation}</td>
                  <td className="py-3 px-4 text-slate-600">{item.assignedTeam}</td>
                  <td className="py-3 px-4 font-mono text-right font-bold">{item.estimatedHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Work Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Issue Depot Maintenance Work Order</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Airframe</label>
                <select
                  value={formData.aircraftId}
                  onChange={e => setFormData({ ...formData, aircraftId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900"
                >
                  {aircraftList.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.tailNumber} - {a.name} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Work Order Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900"
                  >
                    <option value="Critical">Critical (Immediate RED X)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low (Routine Phase)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bay Location</label>
                  <input
                    type="text"
                    value={formData.bayLocation}
                    onChange={e => setFormData({ ...formData, bayLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Team</label>
                  <input
                    type="text"
                    value={formData.assignedTeam}
                    onChange={e => setFormData({ ...formData, assignedTeam: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={e => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 12 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-xs"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
