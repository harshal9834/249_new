import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the object passed to socket.emit with a full destructured activeAc + component mappings
emit_replace = """
    socket.emit('publish_telemetry', {
        aircraftId: aircraft.id,
        rpm: engine?.rpm || 0,
        temperature: engine?.temperature || 0,
        vibration: engine?.vibration || 0,
        oilPressure: engine?.oilPressure || 0,
        fuelFlow: engine?.fuelFlow || 0,
        ...aircraft // Spread all the new fields natively
    });
"""

content = re.sub(
    r"socket\.emit\('publish_telemetry', \{[\s\S]*?healthScores: \{ overall: aircraft\.healthScore \}\n\s*\}\);",
    emit_replace.strip(),
    content
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
