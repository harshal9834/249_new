import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

upsert_fix = """        const safeStatus = (data.status || 'OPERATIONAL').toUpperCase();
        await prisma.aircraft.upsert({
          where: { id: data.aircraftId },
          update: { status: safeStatus },
          create: {
            id: data.aircraftId,
            name: data.name || 'Simulated Aircraft',
            tailNumber: data.tailNumber || data.aircraftId,
            status: safeStatus,
            healthScore: data.healthScore || 100
          }
        });"""

content = re.sub(
    r"await prisma\.aircraft\.upsert\(\{[\s\S]*?healthScore: data\.healthScore \|\| 100\n\s*\}\n\s*\}\);",
    upsert_fix,
    content
)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
