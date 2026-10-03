import re

with open('src/components/SimulatorControlCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_cards = """
            <TelemetryCard title="Speed (TAS)" value={Math.round(activeAc.speed || 0)} unit="KTS" trend="stable" />
            <TelemetryCard title="Altitude" value={Math.round(activeAc.altitude || 0).toLocaleString()} unit="FT" trend="stable" />
            <TelemetryCard title="Throttle" value={Math.round(activeAc.throttle || 0)} unit="%" trend="stable" />
            <TelemetryCard title="Engine Load" value={Math.round(activeAc.engineLoad || 0)} unit="%" trend="stable" />
            <TelemetryCard title="Outside Air" value={Math.round(activeAc.outsideAirTemp || 15)} unit="°C" trend="stable" />
            <TelemetryCard title="Gross Wt" value={Math.round(activeAc.weight || 40000).toLocaleString()} unit="LBS" trend="degrading" />
"""

# Insert these new cards inside the grid
content = re.sub(
    r'(<TelemetryCard title="Engine Health" value=\{Math\.round\(engineComp\?\.healthScore \|\| 0\)\} unit="%" trend=\{engineComp\?\.healthScore && engineComp\.healthScore < 80 \? \'degrading\' : \'stable\'\} \/>)',
    r'\1\n' + new_cards,
    content
)

# Fix the grid layout so they fit nicely
content = content.replace(
    'className="p-5 flex-grow grid grid-cols-2 gap-3 relative"',
    'className="p-5 flex-grow grid grid-cols-3 xl:grid-cols-4 gap-3 relative"'
)

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
