import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix fuelPumpStatus
content = content.replace("let fuelPumpStatus = faults.includes('Fuel Leak') ? 'WARNING' : 'NOMINAL';", "let fuelPumpStatus = (faults.includes('Fuel Leak') ? 'WARNING' : 'NOMINAL') as 'WARNING' | 'NOMINAL';")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
