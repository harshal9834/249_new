import re

with open('src/components/PredictiveMaintenance.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add safeNumber and robust fallbacks
fallbacks = """function safeNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) && !isNaN(n) ? n : 0;
}

export const PredictiveMaintenance: React.FC<PredictiveMaintenanceProps> = ({"""

content = content.replace("export const PredictiveMaintenance: React.FC<PredictiveMaintenanceProps> = ({", fallbacks)

content = content.replace("Risk: <span className=\"font-mono\">{insight.riskScore}/100</span>", "Risk: <span className=\"font-mono\">{safeNumber(insight.riskScore)}/100</span>")
content = content.replace("<span className=\"font-mono\">{insight.predictedRulHours}</span> hrs RUL", "<span className=\"font-mono\">{safeNumber(insight.predictedRulHours)}</span> hrs RUL")

content = content.replace("<span className=\"text-3xl font-bold text-slate-900 font-mono\">{selectedInsight.riskScore}</span><span className=\"text-slate-400 font-bold\">/100</span>", "<span className=\"text-3xl font-bold text-slate-900 font-mono\">{safeNumber(selectedInsight.riskScore)}</span><span className=\"text-slate-400 font-bold\">/100</span>")

content = content.replace("<span className=\"text-3xl font-bold text-slate-900 font-mono\">{selectedInsight.predictedRulHours}</span>", "<span className=\"text-3xl font-bold text-slate-900 font-mono\">{safeNumber(selectedInsight.predictedRulHours)}</span>")

content = content.replace("<span className=\"text-4xl font-bold text-emerald-500 font-mono\">{selectedInsight.confidencePct}%</span>", "<span className=\"text-4xl font-bold text-emerald-500 font-mono\">{safeNumber(selectedInsight.confidencePct)}%</span>")

with open('src/components/PredictiveMaintenance.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
