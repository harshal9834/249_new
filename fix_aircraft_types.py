import re

with open('src/components/AircraftDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Math.round(aircraft.altitude)", "Math.round(aircraft.altitude || 0)")
content = content.replace("Math.round(aircraft.speed)", "Math.round(aircraft.speed || 0)")
content = content.replace("Math.round(aircraft.heading)", "Math.round(aircraft.heading || 0)")
content = content.replace("Math.round(aircraft.pitch)", "Math.round((aircraft as any).pitch || 0)")
content = content.replace("Math.round(aircraft.bank)", "Math.round((aircraft as any).bank || 0)")

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
