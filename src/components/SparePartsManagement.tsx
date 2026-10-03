import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ShoppingCart, 
  TrendingUp, 
  Building2, 
  Clock, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { SparePartItem } from '../types/fleet';

interface SparePartsManagementProps {
  inventory: SparePartItem[];
  onReorder: (partId: string, quantity: number) => void;
}

export const SparePartsManagement: React.FC<SparePartsManagementProps> = ({
  inventory,
  onReorder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredParts = inventory.filter(item => {
    if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.partNumber.toLowerCase().includes(q) ||
        item.binLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalShortages = inventory.filter(i => i.replenishmentStatus === 'Critical Shortage');
  const reorderSuggested = inventory.filter(i => i.replenishmentStatus === 'Reorder Suggested');
  const inStock = inventory.filter(i => i.replenishmentStatus === 'In Stock');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Spare Parts & Logistics Inventory</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
              SUPPLY CHAIN & DEMAND FORECAST
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mission-critical aviation parts inventory, automated 30-day wear forecasts, and defense procurement recommendations.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-slate-400 font-semibold uppercase text-[10px]">Total Monitored Lines</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{inventory.length} Parts</div>
          <div className="text-[11px] text-slate-500 mt-0.5">MIL-STD tracked</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs border-l-4 border-l-emerald-500">
          <div className="text-slate-400 font-semibold uppercase text-[10px]">Optimal Stock</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{inStock.length}</div>
          <div className="text-[11px] text-emerald-700 font-medium">Above min buffer</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs border-l-4 border-l-amber-500">
          <div className="text-slate-400 font-semibold uppercase text-[10px]">Reorder Suggested</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">{reorderSuggested.length}</div>
          <div className="text-[11px] text-amber-700 font-medium">Near min threshold</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs border-l-4 border-l-red-500">
          <div className="text-slate-400 font-semibold uppercase text-[10px]">Critical Shortage</div>
          <div className="text-2xl font-bold font-mono text-red-600 mt-1">{criticalShortages.length}</div>
          <div className="text-[11px] text-red-700 font-medium">Immediate PO required</div>
        </div>
      </div>

      {/* Procurement Recommendations Banner */}
      {criticalShortages.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-red-900">
                CRITICAL PROCUREMENT RECOMMENDATION ({criticalShortages.length} Shortages Detected)
              </div>
              <p className="text-[11px] text-red-700 mt-0.5">
                Turbine blades (F135-HPT-BLD-04) and composite propeller blades (C130-PROP-DOW-06) have fallen below theater safety margins. Requisition approved for priority air shipment.
              </p>
            </div>
          </div>

          <button
            onClick={() => onReorder(criticalShortages[0].id, 10)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shrink-0 shadow-xs"
          >
            Authorize Bulk Requisition
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search part #, name, or bin..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500">Category:</span>
          {(['ALL', 'Engine', 'Hydraulic System', 'Avionics'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <th className="py-3 px-4">Part Number</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock / Threshold</th>
                <th className="py-3 px-4">Criticality</th>
                <th className="py-3 px-4">30d Forecast</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4 text-right">Procure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.map(item => {
                const isCrit = item.replenishmentStatus === 'Critical Shortage';
                const isReorder = item.replenishmentStatus === 'Reorder Suggested';

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.partNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono font-bold ${isCrit ? 'text-red-600' : isReorder ? 'text-amber-600' : 'text-slate-900'}`}>
                          {item.stockQuantity}
                        </span>
                        <span className="text-slate-400 font-mono">/ {item.minThreshold} min</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold text-[11px] ${item.criticality === 'Critical' ? 'text-red-600' : item.criticality === 'High' ? 'text-orange-600' : 'text-slate-600'}`}>
                        {item.criticality}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-700 font-bold">{item.forecastDemand30d} units</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{item.binLocation}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">${item.unitCost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onReorder(item.id, 10)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold flex items-center space-x-1 ml-auto"
                      >
                        <ShoppingCart className="w-3 h-3 text-blue-400" />
                        <span>Reorder</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
