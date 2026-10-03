import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Unreachable code / scope issues in performMaintenance
content = content.replace(
    """analytics: newAnalytics
        } as Partial<SimulatorState>;
        publishMaintenance(ac.id, record.actionTaken, agency.name, cost, record.downtimeHours);""",
    """analytics: newAnalytics
        } as Partial<SimulatorState>;"""
)

# Move publishMaintenance BEFORE the return statement
content = content.replace(
    "const newAnalytics = { ...state.analytics };",
    "publishMaintenance(ac!.id, record.actionTaken, agency!.name, cost, record.downtimeHours);\n        const newAnalytics = { ...state.analytics };"
)

# Fix injectFault parameter name
content = content.replace(
    "publishFault(aircraftId, faultType);",
    "publishFault(aircraftId, faultName);"
)

# Wait, the lint error said:
# src/store/simulatorStore.ts(312,34): error TS2304: Cannot find name 'faultType'.
# src/store/simulatorStore.ts(396,22): error TS2304: Cannot find name 'aircraftId'.
# src/store/simulatorStore.ts(396,34): error TS2304: Cannot find name 'faultType'.
# Wait, why line 396? Did I inject it twice?
# Let's clean up multiple injects if they happened.

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
