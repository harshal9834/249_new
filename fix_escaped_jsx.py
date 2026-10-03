import re

with open('src/components/AircraftManagement.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the filter buttons
content = content.replace(
    "'{cat === \\'ALL\\' ? \\'All Wings\\' : cat === \\'Fighter\\' ? \\'<Plane className=\"inline w-4 h-4 mr-1\" /> Fighters\\' : cat === \\'Transport\\' ? \\' Transports\\' : \\'<Plane className=\"inline w-4 h-4 mr-1\" /> UAVs\\'}'",
    "cat === 'ALL' ? 'All Wings' : cat === 'Fighter' ? <><Plane className=\"inline w-4 h-4 mr-1\" /> Fighters</> : cat === 'Transport' ? ' Transports' : <><Plane className=\"inline w-4 h-4 mr-1\" /> UAVs</>"
)

# A more robust regex approach since the exact string matches might be tricky with escaping
content = content.replace(
    "'<Plane className=\"inline w-4 h-4 mr-1\" /> Fighters'",
    "<><Plane className=\"inline w-4 h-4 mr-1\" /> Fighters</>"
)
content = content.replace(
    "'<Plane className=\"inline w-4 h-4 mr-1\" /> UAVs'",
    "<><Plane className=\"inline w-4 h-4 mr-1\" /> UAVs</>"
)

content = content.replace(
    "'<Plane className=\"inline w-4 h-4 mr-1\" /> Fighter'",
    "<><Plane className=\"inline w-4 h-4 mr-1\" /> Fighter</>"
)
content = content.replace(
    "'<Plane className=\"inline w-4 h-4 mr-1\" /> UAV'",
    "<><Plane className=\"inline w-4 h-4 mr-1\" /> UAV</>"
)


with open('src/components/AircraftManagement.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
