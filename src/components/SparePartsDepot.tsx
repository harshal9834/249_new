import React, { useState } from 'react';
import { useSimulatorStore } from '../store/simulatorStore';
import { Package, Truck, AlertOctagon, ArrowUpRight } from 'lucide-react';

function safeNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) && !isNaN(n) ? n : 0;
}

export const SparePartsDepot: React.FC = () => {
  const store = useSimulatorStore();
  const inventory = store.inventory ?? [];
  const restockPart = store.restockPart;

  if (inventory.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-lg border border-slate-200">
        <AlertOctagon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-700">No inventory data available</h2>
        <p className="text-slate-500 text-sm">TimescaleDB returned an empty inventory array.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          Spare Parts Depot
        </h1>
        <p className="text-sm text-slate-500 mt-1">Live inventory simulation, component usage, and depot restocking workflows.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map(part => (
          <div key={part.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{part.category || 'General'}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${(part.replenishmentStatus || 'In Stock') === 'In Stock' ? 'bg-emerald-100 text-emerald-700' : (part.replenishmentStatus || 'Unknown') === 'Reorder Suggested' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {part.replenishmentStatus || 'Unknown'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{part.name}</h3>
              <p className="font-mono text-xs text-blue-600 mb-4">{part.partNumber || part.id}</p>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 mb-4">
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Stock</div>
                  <div className={`font-mono text-xl font-bold ${safeNumber(part.stockQuantity) < safeNumber(part.minThreshold) ? 'text-red-600' : 'text-slate-800'}`}>
                    {safeNumber(part.stockQuantity)}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Unit Cost</div>
                  <div className="font-mono text-base font-bold text-slate-800">${safeNumber(part.unitCost).toLocaleString()}</div>
                </div>
              </div>
              
              <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                <div className="flex justify-between"><span>Min Threshold:</span> <span className="font-mono font-bold text-slate-700">{safeNumber(part.minThreshold)}</span></div>
                <div className="flex justify-between"><span>Lead Time:</span> <span className="font-mono font-bold text-slate-700">{safeNumber(part.leadTimeDays)} Days</span></div>
                <div className="flex justify-between"><span>Location:</span> <span className="font-mono font-bold text-slate-700">{part.binLocation || 'A1-00'}</span></div>
              </div>
            </div>

            <button 
              onClick={() => restockPart(part.id, 10)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              Restock (+10)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
