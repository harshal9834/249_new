import re

with open('src/components/MaintenanceAnalyticsCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

safe_logic = """function safeNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) && !isNaN(n) ? n : 0;
}

export const MaintenanceAnalyticsCenter: React.FC = () => {
  const store = useSimulatorStore();
  const analytics = store.analytics ?? {};
  const predictions = store.predictions ?? [];
  const aircraftList = store.aircraftList ?? [];

  if (Object.keys(analytics).length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-lg border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-700">No analytics data available</h2>
        <p className="text-slate-500 text-sm">TimescaleDB returned an empty analytics payload.</p>
      </div>
    );
  }"""

content = re.sub(
    r"export const MaintenanceAnalyticsCenter: React\.FC = \(\) => \{\n\s*const store = useSimulatorStore\(\);\n\s*const \{ analytics, predictions, aircraftList \} = store;",
    safe_logic,
    content
)

# Fix analytics fallbacks
content = content.replace("analytics.mtbfHours.toFixed(1)", "safeNumber(analytics.mtbfHours).toFixed(1)")
content = content.replace("analytics.mttrHours.toFixed(1)", "safeNumber(analytics.mttrHours).toFixed(1)")
content = content.replace("analytics.fleetDowntimePct.toFixed(1)", "safeNumber(analytics.fleetDowntimePct).toFixed(1)")
content = content.replace("analytics.totalMaintenanceCost.toLocaleString()", "safeNumber(analytics.totalMaintenanceCost).toLocaleString()")

# Fix predictions fallbacks
content = content.replace("p.probabilityScore >", "safeNumber(p.probabilityScore) >")
content = content.replace("${p.probabilityScore}%", "${safeNumber(p.probabilityScore)}%")
content = content.replace("p.probabilityScore.toFixed(0)", "safeNumber(p.probabilityScore).toFixed(0)")
content = content.replace("p.predictedTimeOfFailure.toFixed(1)", "safeNumber(p.predictedTimeOfFailure).toFixed(1)")
content = content.replace("p.contributingFactors.join(', ')", "(p.contributingFactors || []).join(', ')")
content = content.replace("p.aiConfidence.toFixed(1)", "safeNumber(p.aiConfidence).toFixed(1)")

with open('src/components/MaintenanceAnalyticsCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
