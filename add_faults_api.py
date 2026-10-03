import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add missing endpoints for faults and maintenance
endpoints = """app.post('/api/telemetry', async (req, res) => {
  res.status(200).json({ success: true, message: 'Use websockets for telemetry' });
});

app.post('/api/faults', async (req, res) => {
  try {
    const { aircraftId, faultType, description } = req.body;
    await prisma.fault.create({
      data: {
        aircraftId,
        type: faultType,
        description,
        isActive: true,
        injectedAt: new Date()
      }
    });
    res.json({ success: true });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/maintenance_events', async (req, res) => {
  try {
    const { aircraftId, action, agency, cost, downtime } = req.body;
    
    // We need an agency record first to satisfy the relation.
    // In a real app we'd query it. Here we upsert a dummy one to satisfy Prisma.
    let agencyRecord = await prisma.maintenanceAgency.findFirst({ where: { name: agency } });
    if (!agencyRecord) {
      agencyRecord = await prisma.maintenanceAgency.create({
        data: { name: agency, location: 'Base', tier: 'Tier 1' }
      });
    }

    await prisma.maintenanceRecord.create({
      data: {
        aircraftId,
        agencyId: agencyRecord.id,
        actionTaken: action,
        cost,
        downtimeHours: downtime,
        performedAt: new Date()
      }
    });
    res.json({ success: true });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});"""

content = content.replace("app.post('/api/telemetry', async (req, res) => {\n  res.status(200).json({ success: true, message: 'Use websockets for telemetry' });\n});", endpoints)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
