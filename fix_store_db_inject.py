import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all injected publishes
content = re.sub(r'publishFault\([^)]+\);\n\s*', '', content)
content = re.sub(r'publishMaintenance\([^)]+\);\n\s*', '', content)
content = re.sub(r'newList\.forEach\(ac => publishTelemetry\(ac\)\);\n\s*', '', content)

# Inject carefully
# 1. publishMaintenance
content = content.replace(
    "const newAnalytics = { ...state.analytics };\n        newAnalytics.totalMaintenanceCost += cost;",
    "publishMaintenance(aircraftId, record.actionTaken, agency.name, cost, record.downtimeHours);\n        const newAnalytics = { ...state.analytics };\n        newAnalytics.totalMaintenanceCost += cost;"
)

# 2. publishFault
content = content.replace(
    "healthScore: overallHealth,\n                status: calculateStatus(overallHealth),\n                riskLevel: calculateRiskLevel(overallHealth)\n            };\n        });\n\n        return { aircraftList: newList };",
    "healthScore: overallHealth,\n                status: calculateStatus(overallHealth),\n                riskLevel: calculateRiskLevel(overallHealth)\n            };\n        });\n\n        publishFault(aircraftId, faultType);\n        return { aircraftList: newList };"
)

# 3. publishTelemetry
content = content.replace(
    "return { aircraftList: newList, predictions: newPredictions.sort((a,b) => b.probabilityScore - a.probabilityScore), analytics: newAnalytics };",
    "newList.forEach(ac => publishTelemetry(ac));\n            return { aircraftList: newList, predictions: newPredictions.sort((a,b) => b.probabilityScore - a.probabilityScore), analytics: newAnalytics };"
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
