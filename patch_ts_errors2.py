import re

# 1. Fix server.ts (leadTimeDays -> remove)
with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r", leadTimeDays: \d+", "", content)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Fix simulatorStore.ts (add createdAt to PredictiveInsight)
with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("technicalOrder: 'T.O. 1C-130J-2-71JG-00-1'", "technicalOrder: 'T.O. 1C-130J-2-71JG-00-1',\n                    createdAt: new Date().toISOString()")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
