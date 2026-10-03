import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix trend
content = content.replace("trend: trend === 'stable' && health < 90 ? 'degrading' : trend", "trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike'")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
