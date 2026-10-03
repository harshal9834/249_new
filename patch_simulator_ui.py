import re

with open('src/components/SimulatorControlCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add select dropdown for Flight Phase
selector_ui = """        <div className="flex items-center gap-4">
          <select 
            value={store.selectedAircraftId || ''} 
            onChange={(e) => store.setSelectedAircraftId(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {store.aircraftList.map(a => <option key={a.id} value={a.id}>{a.tailNumber} - {a.name}</option>)}
          </select>

          <div className="h-6 w-px bg-slate-200"></div>

          <select 
            value={activeAc?.operatingMode || 'Ground Idle'} 
            onChange={(e) => store.setOperatingMode(activeAc.id, e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['Ground Idle', 'Taxi', 'Takeoff', 'Climb', 'Cruise', 'Loiter', 'Descent', 'Landing'].map(mode => (
              <option key={mode} value={mode}>{mode} Phase</option>
            ))}
          </select>"""

content = re.sub(
    r"<div className=\"flex items-center gap-4\">\n\s*<select\s*value=\{store\.selectedAircraftId \|\| ''\}[\s\S]*?</select>",
    selector_ui,
    content
)

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
