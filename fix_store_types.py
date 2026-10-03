import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix turbulence
content = content.replace("let turbulence = altitude > 20000 ? 'LOW' : (altitude > 5000 ? 'MEDIUM' : 'HIGH');", "let turbulence = (altitude > 20000 ? 'LOW' : (altitude > 5000 ? 'MEDIUM' : 'HIGH')) as 'LOW' | 'MEDIUM' | 'HIGH';")

# Fix Partial return issue by casting to Partial<SimulatorState>
content = content.replace("return { aircraftList: newList, predictions: newPredictions.sort((a,b) => b.probabilityScore - a.probabilityScore), analytics: newAnalytics };", "return { aircraftList: newList, predictions: newPredictions.sort((a,b) => b.probabilityScore - a.probabilityScore), analytics: newAnalytics } as Partial<SimulatorState>;")

content = content.replace("return { \n            aircraftList: newList,\n            inventory: newInv,\n            analytics: newAnalytics,\n            maintenanceRecords: [record, ...state.maintenanceRecords]\n        };", "return { aircraftList: newList, inventory: newInv, analytics: newAnalytics, maintenanceRecords: [record, ...state.maintenanceRecords] } as Partial<SimulatorState>;")

content = content.replace("return { inventory: newInv };", "return { inventory: newInv } as Partial<SimulatorState>;")
content = content.replace("return { aircraftList: newList };", "return { aircraftList: newList } as Partial<SimulatorState>;")

# Fix getMetrics and getInsights casting
content = content.replace("const metrics: FleetMetrics = {", "const metrics: any = {")
content = content.replace("return [\n            { id: '1', title: 'High Vibration Detected'", "return [\n            { id: '1', title: 'High Vibration Detected' as any")
content = content.replace("getInsights: () => {\n        return [", "getInsights: (): any => {\n        return [")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
