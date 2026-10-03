import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

ws_imports = """
import { io } from 'socket.io-client';
const socket = io(); // Connects to same origin
"""

content = content.replace("import { create } from 'zustand';", "import { create } from 'zustand';\n" + ws_imports)

publish_ws = """const publishTelemetry = (aircraft: Aircraft) => {
    const engine = aircraft.components.find(c => c.type === 'Engine');
    
    socket.emit('publish_telemetry', {
        aircraftId: aircraft.id,
        rpm: engine?.rpm || 0,
        temperature: engine?.temperature || 0,
        vibration: engine?.vibration || 0,
        oilPressure: engine?.oilPressure || 0,
        fuelFlow: engine?.fuelFlow || 0,
        throttle: aircraft.throttle,
        speed: aircraft.speed,
        altitude: aircraft.altitude,
        outsideAirTemp: aircraft.outsideAirTemp,
        weight: aircraft.weight,
        engineLoad: aircraft.engineLoad,
        climbRate: aircraft.climbRate,
        heading: aircraft.heading,
        bankAngle: aircraft.bankAngle,
        pitchAngle: aircraft.pitchAngle,
        verticalSpeed: aircraft.verticalSpeed,
        healthScores: { overall: aircraft.healthScore }
    });
};"""

content = re.sub(r"const publishTelemetry = \(aircraft: Aircraft\) => \{[\s\S]*?\}\);\n\};", publish_ws, content)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
