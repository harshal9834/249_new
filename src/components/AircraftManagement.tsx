import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Plane, 
  Box, 
  Cpu, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Wrench,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Aircraft, FleetCategory, AircraftStatus, RiskLevel } from '../types/fleet';

interface AircraftManagementProps {
  aircraftList: Aircraft[];
  onSelectAircraft: (aircraftId: string) => void;
  onOpenDigitalTwin: (aircraftId: string) => void;
  onOpenEngineTwin: (aircraftId: string) => void;
  onAddNewAircraft: (newAircraft: Partial<Aircraft>) => void;
  onUpdateStatus: (aircraftId: string, status: AircraftStatus) => void;
}

export const AircraftManagement: React.FC<AircraftManagementProps> = ({
  aircraftList,
  onSelectAircraft,
  onOpenDigitalTwin,
  onOpenEngineTwin,
  onAddNewAircraft,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | FleetCategory>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AircraftStatus>('ALL');
  const [sortField, setSortField] = useState<keyof Aircraft>('healthScore');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modal for new aircraft
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: 'F-35A Lightning II',
    tailNumber: 'AF-105',
    category: 'Fighter' as FleetCategory,
    status: 'Operational' as AircraftStatus,
    healthScore: 98.5,
    riskLevel: 'Low' as RiskLevel,
    flightHours: 320,
    squadron: '388th Fighter Wing',
    baseStation: 'Hill AFB, UT',
    callSign: 'VIPER-09'
  });

  // Filter & Sort Logic
  const filteredAircraft = useMemo(() => {
    return aircraftList
      .filter(ac => {
        if (categoryFilter !== 'ALL' && ac.category !== categoryFilter) return false;
        if (statusFilter !== 'ALL' && ac.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            ac.id.toLowerCase().includes(q) ||
            ac.name.toLowerCase().includes(q) ||
            ac.tailNumber.toLowerCase().includes(q) ||
            ac.squadron.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [aircraftList, categoryFilter, statusFilter, searchQuery, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredAircraft.length / pageSize) || 1;
  const paginatedAircraft = filteredAircraft.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof Aircraft) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNewAircraft(formData);
    setIsAddModalOpen(false);
    setFormData({
      name: 'F-35A Lightning II',
      tailNumber: `AF-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Fighter',
      status: 'Operational',
      healthScore: 98.5,
      riskLevel: 'Low',
      flightHours: 150,
      squadron: '388th Fighter Wing',
      baseStation: 'Hill AFB, UT',
      callSign: 'VIPER-22'
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Plane className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Aircraft Fleet Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete inventory of tactical fighters, transports, and unmanned aerial platforms with real-time health telemetry.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Induct New Aircraft</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Tail #, Model, Squadron, or ID..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <span className="text-xs font-medium text-slate-500 mr-1 hidden sm:inline">Category:</span>
            {(['ALL', 'Fighter', 'Transport', 'UAV'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Wings' : cat === 'Fighter' ? '✈ Fighters' : cat === 'Transport' ? '🚚 Transports' : '🛩 UAVs'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white text-slate-800 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Operational">Operational</option>
              <option value="Warning">Warning</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aircraft Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider text-[11px]">
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('tailNumber')}>
                  <div className="flex items-center space-x-1">
                    <span>Aircraft ID / Tail</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center space-x-1">
                    <span>Model / Mission</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('healthScore')}>
                  <div className="flex items-center space-x-1">
                    <span>Health Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('riskLevel')}>
                  <div className="flex items-center space-x-1">
                    <span>Risk Level</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('flightHours')}>
                  <div className="flex items-center space-x-1">
                    <span>Flight Hours</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Last Service</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAircraft.map(ac => {
                const isCrit = ac.status === 'Critical';
                const isWarn = ac.status === 'Warning';
                const isMaint = ac.status === 'Maintenance';

                return (
                  <tr
                    key={ac.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* ID / Tail */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono text-xs">{ac.tailNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ac.id}</div>
                    </td>

                    {/* Model */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{ac.name}</div>
                      <div className="text-[10px] text-slate-500">{ac.squadron}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {ac.category === 'Fighter' ? '✈ Fighter' : ac.category === 'Transport' ? '🚚 Transport' : '🛩 UAV'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isCrit
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : isWarn
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : isMaint
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isCrit && <ShieldAlert className="w-3 h-3 text-red-600 mr-1" />}
                        {isWarn && <AlertTriangle className="w-3 h-3 text-amber-600 mr-1" />}
                        {isMaint && <Wrench className="w-3 h-3 text-blue-600 mr-1" />}
                        {!isCrit && !isWarn && !isMaint && <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />}
                        <span>{ac.status}</span>
                      </span>
                    </td>

                    {/* Health Score */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              ac.healthScore >= 85
                                ? 'bg-emerald-500'
                                : ac.healthScore >= 70
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, ac.healthScore)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800">{ac.healthScore}%</span>
                      </div>
                    </td>

                    {/* Risk Level */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold font-mono text-[11px] ${
                          ac.riskLevel === 'Critical'
                            ? 'text-red-600 font-bold'
                            : ac.riskLevel === 'High'
                            ? 'text-orange-600'
                            : ac.riskLevel === 'Medium'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {ac.riskLevel.toUpperCase()}
                      </span>
                    </td>

                    {/* Flight Hours */}
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {ac.flightHours.toLocaleString()} hrs
                    </td>

                    {/* Last Service */}
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {ac.lastMaintenance}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onSelectAircraft(ac.id)}
                          title="View Profile & Diagnostics"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenDigitalTwin(ac.id)}
                          title="Open 3D Universal Aircraft Twin"
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-mono font-semibold flex items-center space-x-1"
                        >
                          <Box className="w-3 h-3 text-blue-400" />
                          <span>Airframe 3D</span>
                        </button>
                        <button
                          onClick={() => onOpenEngineTwin(ac.id)}
                          title="Open 3D Engine Cutaway Twin"
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-mono font-semibold flex items-center space-x-1"
                        >
                          <Cpu className="w-3 h-3" />
                          <span>Engine 3D</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedAircraft.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No aircraft found matching current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-800">{paginatedAircraft.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{filteredAircraft.length}</span> airframes
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="font-mono text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Induct New Aircraft Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Induct Airframe into Fleet Roster</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tail Number</label>
                  <input
                    type="text"
                    required
                    value={formData.tailNumber}
                    onChange={e => setFormData({ ...formData, tailNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900 font-mono"
                    placeholder="e.g. AF-108"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Aircraft Model</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900"
                    placeholder="e.g. F-35A Lightning II"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fleet Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as FleetCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900"
                  >
                    <option value="Fighter">Fighter</option>
                    <option value="Transport">Transport</option>
                    <option value="UAV">UAV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Squadron / Wing</label>
                  <input
                    type="text"
                    required
                    value={formData.squadron}
                    onChange={e => setFormData({ ...formData, squadron: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Base Station</label>
                  <input
                    type="text"
                    value={formData.baseStation}
                    onChange={e => setFormData({ ...formData, baseStation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Flight Hours</label>
                  <input
                    type="number"
                    value={formData.flightHours}
                    onChange={e => setFormData({ ...formData, flightHours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Health Score %</label>
                  <input
                    type="number"
                    value={formData.healthScore}
                    onChange={e => setFormData({ ...formData, healthScore: parseFloat(e.target.value) || 100 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-xs"
                >
                  Induct Airframe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
