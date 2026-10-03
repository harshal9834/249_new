import re

# 1. Fix server.ts (category -> remove, Maintenance -> NON_OPERATIONAL)
with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r", category: '[^']+'", "", content)
content = content.replace("a.status === 'Maintenance'", "a.status !== 'OPERATIONAL'")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Fix HistoricalTelemetryTrends.tsx (loading -> false)
with open('src/components/HistoricalTelemetryTrends.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("{loading ?", "{false ?")

with open('src/components/HistoricalTelemetryTrends.tsx', 'w', encoding='utf-8') as f:
    f.write(content)


# 3. Fix simulatorStore.ts (use correct PredictiveInsight schema)
with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

correct_insight = """                insights.push({
                    id: `ins-${ac.id}-${Date.now()}`,
                    aircraftId: ac.id,
                    aircraftName: ac.name,
                    tailNumber: ac.tailNumber,
                    componentName: 'Engine System',
                    anomalyDetected: true,
                    anomalyType: title as any,
                    urgency: urgency as any,
                    confidenceScore: Math.round(75 + Math.random() * 20),
                    rulFlightHours: rul,
                    failureRiskScore: Math.round(riskScore),
                    vibrationTrend: vib,
                    temperatureDelta: tempDelta,
                    recommendation: `Immediate inspection of engine components due to ${title}.`,
                    technicalOrder: 'T.O. 1C-130J-2-71JG-00-1'
                });"""

content = re.sub(
    r"insights\.push\(\{[\s\S]*?\}\);",
    correct_insight,
    content
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)


# 4. Fix PredictiveMaintenance.tsx (use correct properties)
with open('src/components/PredictiveMaintenance.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("insight.riskScore", "insight.failureRiskScore")
content = content.replace("insight.predictedRulHours", "insight.rulFlightHours")
content = content.replace("insight.confidencePct", "insight.confidenceScore")

content = content.replace("selectedInsight.riskScore", "selectedInsight.failureRiskScore")
content = content.replace("selectedInsight.predictedRulHours", "selectedInsight.rulFlightHours")
content = content.replace("selectedInsight.confidencePct", "selectedInsight.confidenceScore")

# Replace Anomaly array usage with flat props
anomaly_block = """<div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-slate-200 rounded text-sm">
                    <div className="text-slate-500 mb-1 text-xs">Vibration Harmonic Spike:</div>
                    <div className="font-bold text-red-600">{safeNumber(selectedInsight.vibrationTrend).toFixed(2)} IPS</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded text-sm">
                    <div className="text-slate-500 mb-1 text-xs">Thermal Gradient Delta:</div>
                    <div className="font-bold text-red-600">{safeNumber(selectedInsight.temperatureDelta).toFixed(0)} °C</div>
                  </div>
                </div>"""

content = re.sub(
    r"<div className=\"grid grid-cols-2 gap-4\">\n\s*\{selectedInsight\.anomalies[\s\S]*?\}\)\}\n\s*</div>",
    anomaly_block,
    content
)

with open('src/components/PredictiveMaintenance.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

