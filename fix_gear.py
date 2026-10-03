import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix gearPosition and any other potentially string-inferred fields that have strict types.
content = content.replace("let gearPosition = (altitude < 500 || currentMode === 'Ground Idle' || currentMode === 'Taxi' || currentMode === 'Takeoff') ? 'DOWN' : (currentMode === 'Climb' && altitude < 2000 ? 'TRANSITION' : 'UP');", "let gearPosition = ((altitude < 500 || currentMode === 'Ground Idle' || currentMode === 'Taxi' || currentMode === 'Takeoff') ? 'DOWN' : (currentMode === 'Climb' && altitude < 2000 ? 'TRANSITION' : 'UP')) as 'DOWN' | 'TRANSITION' | 'UP';")
content = content.replace("let radarStatus = faults.includes('Radar Failure') ? 'FAILED' : 'NOMINAL';", "let radarStatus = (faults.includes('Radar Failure') ? 'FAILED' : 'NOMINAL') as 'FAILED' | 'NOMINAL';")
content = content.replace("let gpsHealth = faults.includes('GPS Failure') ? 'FAILED' : 'NOMINAL';", "let gpsHealth = (faults.includes('GPS Failure') ? 'FAILED' : 'NOMINAL') as 'FAILED' | 'NOMINAL';")
content = content.replace("let flightComputerStatus = faults.includes('Avionics Failure') ? 'WARNING' : 'NOMINAL';", "let flightComputerStatus = (faults.includes('Avionics Failure') ? 'WARNING' : 'NOMINAL') as 'WARNING' | 'NOMINAL';")
content = content.replace("let communicationStatus = 'NOMINAL';", "let communicationStatus = 'NOMINAL' as 'NOMINAL' | 'WARNING';")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
