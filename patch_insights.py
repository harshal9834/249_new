import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the dummy getInsights function with a dynamic one based on telemetry
dynamic_insights = """    getInsights: () => {
        const insights: PredictiveInsight[] = [];
        const state = get();
        
        state.aircraftList.forEach(ac => {
            const engine = ac.components.find(c => c.type === 'Engine');
            const isCrit = (ac.activeFaults && ac.activeFaults.length > 0) || ac.healthScore < 50 || (engine && engine.healthScore < 50);
            
            if (isCrit || ac.healthScore < 75) {
                let riskScore = 100 - ac.healthScore;
                let urgency = isCrit ? 'Immediate Grounding' : 'Priority';
                let rul = Math.max(0, Math.floor(ac.healthScore * 1.5));
                
                let vib = engine?.vibration || 0;
                let tempDelta = engine ? (engine.temperature - 400) : 0;

                let title = isCrit ? 'Critical System Failure Imminent' : 'Accelerated Wear Detected';
                if (ac.activeFaults && ac.activeFaults.includes('Engine Overheat')) title = 'Thermal Runaway Signature';
                if (ac.activeFaults && ac.activeFaults.includes('High Vibration')) title = 'Rotor Unbalance Signature';

                insights.push({
                    id: `ins-${ac.id}-${Date.now()}`,
                    title: title as any,
                    description: `Aircraft ${ac.tailNumber} shows degradation. Health at ${Math.round(ac.healthScore)}%. Action required.`,
                    severity: isCrit ? 'High' : 'Medium',
                    associatedAircraftId: ac.id,
                    urgency: urgency as any,
                    confidencePct: Math.round(75 + Math.random() * 20),
                    predictedRulHours: rul,
                    riskScore: Math.round(riskScore),
                    anomalies: [
                        { metric: 'Vibration Harmonic Spike', value: vib.toFixed(2), unit: 'IPS' },
                        { metric: 'Thermal Gradient Delta', value: tempDelta > 0 ? '+' + tempDelta.toFixed(0) : '0', unit: '°C' }
                    ]
                });
            }
        });
        
        return insights;
    },"""

content = re.sub(
    r"getInsights:\s*\(\):\s*any\s*=>\s*\{[\s\S]*?return\s*\[[\s\S]*?\];\n\s*\},",
    dynamic_insights,
    content
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
