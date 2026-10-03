import re

with open('src/components/SimulatorControlCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a new block for maintenance actions in the RIGHT PANEL
fault_panel = """        {/* RIGHT PANEL: Fault Injection Center */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
          <div className="bg-red-950 text-red-100 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-red-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-500" />
            Fault Injection Center
          </div>
          <div className="p-5 flex-grow bg-red-50/30 space-y-3">
             <p className="text-xs text-slate-500 mb-4">Click to inject faults into the active aircraft. Telemetry will update instantly across the platform.</p>
             
             <FaultButton label="Engine Overheat" onClick={() => store.injectFault(activeAc.id, 'Engine', 'Engine Overheat')} />
             <FaultButton label="High Vibration" onClick={() => store.injectFault(activeAc.id, 'Engine', 'High Vibration')} />
             <FaultButton label="Fuel Leak" onClick={() => store.injectFault(activeAc.id, 'Fuel System', 'Fuel Leak')} />
             <FaultButton label="Hydraulic Failure" onClick={() => store.injectFault(activeAc.id, 'Hydraulic System', 'Hydraulic Failure')} />
             <FaultButton label="Avionics Failure" onClick={() => store.injectFault(activeAc.id, 'Avionics', 'Avionics Failure')} />
             <FaultButton label="Electrical Failure" onClick={() => store.injectFault(activeAc.id, 'Electrical System', 'Electrical Failure')} />
             <FaultButton label="Landing Gear Failure" onClick={() => store.injectFault(activeAc.id, 'Landing Gear', 'Landing Gear Failure')} />
             
          </div>
        </div>"""

new_right_panel = """        {/* RIGHT PANEL: Actions Center */}
        <div className="flex flex-col gap-6 h-full">
            {/* Faults */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex-1">
              <div className="bg-red-950 text-red-100 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-red-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-500" />
                Fault Injection
              </div>
              <div className="p-4 bg-red-50/30 space-y-2 h-full">
                 <FaultButton label="Engine Overheat" onClick={() => store.injectFault(activeAc.id, 'Engine', 'Engine Overheat')} />
                 <FaultButton label="High Vibration" onClick={() => store.injectFault(activeAc.id, 'Engine', 'High Vibration')} />
                 <FaultButton label="Fuel Leak" onClick={() => store.injectFault(activeAc.id, 'Fuel System', 'Fuel Leak')} />
                 <FaultButton label="Hydraulic Failure" onClick={() => store.injectFault(activeAc.id, 'Hydraulic System', 'Hydraulic Failure')} />
                 <FaultButton label="Avionics Failure" onClick={() => store.injectFault(activeAc.id, 'Avionics', 'Avionics Failure')} />
              </div>
            </div>
            
            {/* Maintenance */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex-1">
              <div className="bg-emerald-950 text-emerald-100 p-3 text-xs font-mono font-bold tracking-widest uppercase border-b border-emerald-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-500" />
                Maintenance & Agency
              </div>
              <div className="p-4 bg-emerald-50/30 space-y-2 h-full">
                 <p className="text-[10px] text-slate-500 mb-2">Triggers repairs, generates tech records, depletes spares.</p>
                 <MaintButton label="Repair Engine (Base)" onClick={() => store.performMaintenance(activeAc.id, 'Engine', 'ag1')} />
                 <MaintButton label="Overhaul Engine (Depot)" onClick={() => store.performMaintenance(activeAc.id, 'Engine', 'ag2')} />
                 <MaintButton label="Replace Hydraulics (Base)" onClick={() => store.performMaintenance(activeAc.id, 'Hydraulic System', 'ag1')} />
                 <MaintButton label="Upgrade Avionics (Depot)" onClick={() => store.performMaintenance(activeAc.id, 'Avionics', 'ag2')} />
              </div>
            </div>
        </div>"""

content = content.replace(fault_panel, new_right_panel)

# Also add the MaintButton component at the bottom
maint_btn = """
const MaintButton = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full py-2 px-3 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 text-emerald-700 text-xs font-bold rounded shadow-sm transition-colors text-left flex items-center justify-between group"
  >
    <span>{label}</span>
    <ShieldAlert className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);
"""
content = content + maint_btn

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
