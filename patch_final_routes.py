import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add missing GET endpoints
missing_endpoints = """app.get('/api/agencies', async (_req, res) => {
  try {
    const agencies = await prisma.maintenanceAgency.findMany();
    if (agencies.length === 0) {
      await prisma.maintenanceAgency.createMany({
        data: [
          { name: 'Lockheed Martin Aerospace', location: 'Fort Worth, TX', certificationLevel: 'Tier 1' },
          { name: 'USAF Base Maintenance Facility', location: 'Nellis AFB, NV', certificationLevel: 'Tier 1' },
          { name: 'AeroPulse Rapid Response', location: 'Mobile Unit', certificationLevel: 'Tier 2' }
        ]
      });
      res.json(await prisma.maintenanceAgency.findMany());
      return;
    }
    res.json(agencies);
  } catch(e) { res.status(500).json({ error: 'DB Error' }); }
});

app.get('/api/maintenance_events', async (_req, res) => {
  try {
    const records = await prisma.maintenanceRecord.findMany({
      orderBy: { scheduledDate: 'desc' },
      take: 50
    });
    res.json(records);
  } catch(e) { res.status(500).json({ error: 'DB Error' }); }
});
"""

# Insert them before app.get('/api/inventory'
content = content.replace("app.get('/api/inventory', async (_req, res) => {", missing_endpoints + "\napp.get('/api/inventory', async (_req, res) => {")

# Update WebSocket to log insert success/failure
ws_code = """
  socket.on('publish_telemetry', async (data) => {
    try {
      await prisma.aircraft.upsert({
        where: { id: data.aircraftId },
        update: { status: data.status !== 'OPERATIONAL' ? data.status : 'OPERATIONAL' },
        create: { 
          id: data.aircraftId, 
          tailNumber: data.tailNumber || data.aircraftId, 
          name: data.name || 'Aircraft',
          category: data.category || 'Unknown',
          status: data.status !== 'OPERATIONAL' ? data.status : 'OPERATIONAL'
        }
      });

      await prisma.telemetry.create({
        data: {
          aircraftId: data.aircraftId,
          rpm: data.rpm || 0,
          temperature: data.temperature || 0,
          vibration: data.vibration || 0,
          oilPressure: data.oilPressure || 0,
          fuelFlow: data.fuelFlow || 0,
          throttle: data.throttle || 0,
          speed: data.speed || 0,
          altitude: data.altitude || 0,
          outsideAirTemp: data.outsideAirTemp || 0,
          weight: data.weight || 0,
          engineLoad: data.engineLoad || 0,
          climbRate: data.climbRate || 0,
          heading: data.heading || 0,
          bankAngle: data.bankAngle || 0,
          pitchAngle: data.pitchAngle || 0,
          verticalSpeed: data.verticalSpeed || 0
        }
      });
      // Log success silently or keep to a minimum to avoid massive console spam at 10Hz
      // console.log(`[TimescaleDB] Successfully inserted 10Hz telemetry for ${data.aircraftId}`);
      
      socket.broadcast.emit('telemetry_update', data);
    } catch(e: any) {
      console.error('[TimescaleDB] INSERT FAILURE:', e.message);
    }
  });"""

content = re.sub(
    r"socket\.on\('publish_telemetry', async \(data\) => \{[\s\S]*?socket\.broadcast\.emit\('telemetry_update', data\);\n\s*\}\);\n\s*\}\);",
    ws_code + "\n});",
    content
)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
