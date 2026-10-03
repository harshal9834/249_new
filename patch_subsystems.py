import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

publish_telemetry_replacement = """const publishTelemetry = (aircraft: Aircraft) => {
    const engine = aircraft.components.find(c => c.type === 'Engine');
    const fuelSystem = aircraft.components.find(c => c.type === 'Fuel System');
    const electrical = aircraft.components.find(c => c.type === 'Electrical System');
    const hydraulics = aircraft.components.find(c => c.type === 'Hydraulic System');
    
    socket.emit('publish_telemetry', {
        aircraftId: aircraft.id,
        rpm: engine?.rpm || 0,
        temperature: engine?.temperature || 0,
        vibration: engine?.vibration || 0,
        oilPressure: engine?.oilPressure || 0,
        fuelFlow: engine?.fuelFlow || 0,
        fuelLevel: fuelSystem?.fuelLevel || 100,
        voltage: electrical?.voltage || 28,
        hydraulicPressure: hydraulics?.pressure || 3000,
        ...aircraft
    });
};"""

content = re.sub(
    r"const publishTelemetry = \(aircraft: Aircraft\) => \{[\s\S]*?\.\.\.aircraft\n\s*\}\);\n\};",
    publish_telemetry_replacement,
    content
)

# Also fix ingestTelemetry so it reads voltage and pressure correctly
ingest_replacement = """                    if (c.type === 'Engine') {
                        return { ...c, rpm: data.rpm, temperature: data.temperature, vibration: data.vibration, oilPressure: data.oilPressure, fuelFlow: data.fuelFlow };
                    }
                    if (c.type === 'Fuel System') {
                        return { ...c, fuelLevel: data.fuelLevel || c.fuelLevel };
                    }
                    if (c.type === 'Electrical System') {
                        return { ...c, voltage: data.voltage || c.voltage };
                    }
                    if (c.type === 'Hydraulic System') {
                        return { ...c, pressure: data.hydraulicPressure || c.pressure };
                    }
                    return c;"""

content = re.sub(
    r"if \(c\.type === 'Engine'\) \{[\s\S]*?return c;\s*\}\)",
    ingest_replacement + "\n                })",
    content
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
