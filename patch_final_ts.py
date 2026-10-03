import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r", certificationLevel: 'Tier \d+'", "", content)
content = content.replace("orderBy: { scheduledDate: 'desc' }", "orderBy: { createdAt: 'desc' }")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
