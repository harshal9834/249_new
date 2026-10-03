import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

upsert_logic = """const knownAircraft = new Set<string>();

io.on('connection', (socket) => {
  socket.on('publish_telemetry', async (data) => {
    // Ensure Aircraft exists in DB to prevent Foreign Key constraint failures
    if (!knownAircraft.has(data.aircraftId)) {
      try {
        await prisma.aircraft.upsert({
          where: { id: data.aircraftId },
          update: { status: data.status },
          create: {
            id: data.aircraftId,
            name: data.name || 'Simulated Aircraft',
            tailNumber: data.tailNumber || data.aircraftId,
            status: data.status || 'OPERATIONAL',
            healthScore: data.healthScore || 100
          }
        });
        knownAircraft.add(data.aircraftId);
      } catch(e) { console.warn('Aircraft Upsert Error:', e); }
    }

    // Save to TimescaleDB via Prisma
    try {
"""

content = re.sub(
    r"io\.on\('connection', \(socket\) => \{\n\s*socket\.on\('publish_telemetry', async \(data\) => \{\n\s*// Save to TimescaleDB via Prisma\n\s*try \{",
    upsert_logic,
    content
)

# Do the same for /api/faults to ensure we don't drop faults if they hit before telemetry
faults_upsert = """app.post('/api/faults', async (req, res) => {
  try {
    const { aircraftId, faultType, description } = req.body;
    
    // Ensure aircraft exists
    if (!knownAircraft.has(aircraftId)) {
      await prisma.aircraft.upsert({
        where: { id: aircraftId },
        update: {},
        create: { id: aircraftId, name: 'Simulated Aircraft', tailNumber: aircraftId }
      });
      knownAircraft.add(aircraftId);
    }

    await prisma.fault.create({
"""

content = content.replace("app.post('/api/faults', async (req, res) => {\n  try {\n    const { aircraftId, faultType, description } = req.body;\n    await prisma.fault.create({", faults_upsert)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
