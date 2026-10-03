import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the manual PG pool and initDB with Prisma + Socket.io
new_db_code = """
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import http from 'http';

const prisma = new PrismaClient();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

async function initDB() {
  try {
    // TimescaleDB extension
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);
    // Convert to Hypertable
    await prisma.$executeRawUnsafe(`SELECT create_hypertable('"Telemetry"', by_range('time', INTERVAL '1 day'), if_not_exists => TRUE);`);
    console.log('[TimescaleDB] Schema and Hypertable initialized successfully via Prisma');
  } catch (err: any) {
    console.warn('[TimescaleDB] Initialization info:', err.message);
  }
}

io.on('connection', (socket) => {
  socket.on('publish_telemetry', async (data) => {
    // Save to TimescaleDB via Prisma
    try {
      await prisma.telemetry.create({
        data: {
          time: new Date(),
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
      // Broadcast to all clients
      socket.broadcast.emit('telemetry_update', data);
    } catch(e) { console.error('WS Prisma Save Error:', e); }
  });
});

app.post('/api/telemetry', async (req, res) => {
  res.status(200).json({ success: true, message: 'Use websockets for telemetry' });
});

app.get('/api/telemetry/history/:aircraftId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 60;
    const history = await prisma.telemetry.findMany({
      where: { aircraftId: req.params.aircraftId },
      orderBy: { time: 'desc' },
      take: limit
    });
    res.json(history.reverse());
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});
"""

# We'll use regex to replace everything from `import { Pool } from 'pg';` down to `app.get('/api/faults/:aircraftId', ...)`
content = re.sub(r"import \{ Pool \} from 'pg';[\s\S]*?app\.get\('/api/faults/:aircraftId'[\s\S]*?\}\);", new_db_code, content)
content = content.replace("const app = express();", "")
content = content.replace("app.listen(PORT", "httpServer.listen(PORT")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
