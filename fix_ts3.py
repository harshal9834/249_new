import re

# 1. Fix TechnicalRecords.tsx (Tool -> Wrench)
with open('src/components/TechnicalRecords.tsx', 'r', encoding='utf-8') as f:
    tr_content = f.read()

tr_content = tr_content.replace("FileText, Tool, Building2,", "FileText, Wrench, Building2,")
tr_content = tr_content.replace("<Tool className=", "<Wrench className=")

with open('src/components/TechnicalRecords.tsx', 'w', encoding='utf-8') as f:
    f.write(tr_content)

# 2. Fix simulatorStore.ts TypeScript errors
with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    store_content = f.read()

# Fix performMaintenance return type cast
store_content = store_content.replace(
    "return { \n            aircraftList: newList, \n            inventory: newInv,\n            maintenanceRecords: [record, ...state.maintenanceRecords],\n            analytics: newAnalytics\n        };",
    "return { \n            aircraftList: newList, \n            inventory: newInv as SparePartItem[],\n            maintenanceRecords: [record, ...state.maintenanceRecords],\n            analytics: newAnalytics\n        } as Partial<SimulatorState>;"
)

# Fix restockPart return type cast
store_content = store_content.replace(
    "return { inventory: newInv };",
    "return { inventory: newInv as SparePartItem[] } as Partial<SimulatorState>;"
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(store_content)
