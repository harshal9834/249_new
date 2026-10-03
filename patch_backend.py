import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# I am going to inject the pg pool and API routes into server.ts.
# Let's find a safe spot, e.g., right after app.use(express.json());
db_code = """
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/aeropulse'
});

async function initDB() {
  try {
    const client = await pool.connect();
    
    // Create TimescaleDB extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);

    // Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS telemetry_readings (
        time TIMESTAMPTZ NOT NULL,
        aircraft_id TEXT NOT NULL,
        rpm DOUBLE PRECISION,
        temperature DOUBLE PRECISION,
        vibration DOUBLE PRECISION,
        oil_pressure DOUBLE PRECISION,
        fuel_flow DOUBLE PRECISION
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS aircraft_health_history (
        time TIMESTAMPTZ NOT NULL,
        aircraft_id TEXT NOT NULL,
        overall_health DOUBLE PRECISION,
        engine_health DOUBLE PRECISION,
        fuel_health DOUBLE PRECISION,
        hydraulic_health DOUBLE PRECISION,
        avionics_health DOUBLE PRECISION,
        electrical_health DOUBLE PRECISION,
        landing_gear_health DOUBLE PRECISION,
        airframe_health DOUBLE PRECISION,
        status TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS fault_events (
        time TIMESTAMPTZ NOT NULL,
        aircraft_id TEXT NOT NULL,
        fault_type TEXT,
        description TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_events (
        time TIMESTAMPTZ NOT NULL,
        aircraft_id TEXT NOT NULL,
        action TEXT,
        agency TEXT,
        cost DOUBLE PRECISION,
        downtime DOUBLE PRECISION
      );
    `);

    // Convert to Hypertables (Ignore if already hypertables)
    try { await client.query(`SELECT create_hypertable('telemetry_readings', by_range('time', INTERVAL '1 day'), if_not_exists => TRUE);`); } catch(e) {}
    try { await client.query(`SELECT create_hypertable('aircraft_health_history', by_range('time', INTERVAL '1 day'), if_not_exists => TRUE);`); } catch(e) {}
    try { await client.query(`SELECT create_hypertable('fault_events', by_range('time', INTERVAL '1 day'), if_not_exists => TRUE);`); } catch(e) {}
    try { await client.query(`SELECT create_hypertable('maintenance_events', by_range('time', INTERVAL '1 day'), if_not_exists => TRUE);`); } catch(e) {}

    client.release();
    console.log('[TimescaleDB] Schema initialized successfully');
  } catch (err: any) {
    console.warn('[TimescaleDB] Connection failed. Please ensure docker-compose is running. Error:', err.message);
  }
}

// TimescaleDB API Routes
app.post('/api/telemetry', async (req, res) => {
  try {
    const { aircraftId, rpm, temperature, vibration, oilPressure, fuelFlow, healthScores, status } = req.body;
    const now = new Date();
    
    await pool.query(
      `INSERT INTO telemetry_readings (time, aircraft_id, rpm, temperature, vibration, oil_pressure, fuel_flow) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [now, aircraftId, rpm, temperature, vibration, oilPressure, fuelFlow]
    );

    if (healthScores) {
      await pool.query(
        `INSERT INTO aircraft_health_history (time, aircraft_id, overall_health, engine_health, fuel_health, hydraulic_health, avionics_health, electrical_health, landing_gear_health, airframe_health, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [now, aircraftId, healthScores.overall, healthScores.engine, healthScores.fuel, healthScores.hydraulic, healthScores.avionics, healthScores.electrical, healthScores.landingGear, healthScores.airframe, status]
      );
    }
    res.status(200).json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/faults', async (req, res) => {
  try {
    const { aircraftId, faultType, description } = req.body;
    await pool.query(
      `INSERT INTO fault_events (time, aircraft_id, fault_type, description) VALUES ($1, $2, $3, $4)`,
      [new Date(), aircraftId, faultType, description]
    );
    res.status(200).json({ success: true });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/maintenance_events', async (req, res) => {
  try {
    const { aircraftId, action, agency, cost, downtime } = req.body;
    await pool.query(
      `INSERT INTO maintenance_events (time, aircraft_id, action, agency, cost, downtime) VALUES ($1, $2, $3, $4, $5, $6)`,
      [new Date(), aircraftId, action, agency, cost, downtime]
    );
    res.status(200).json({ success: true });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/telemetry/latest/:aircraftId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM telemetry_readings WHERE aircraft_id = $1 ORDER BY time DESC LIMIT 1`,
      [req.params.aircraftId]
    );
    res.json(rows[0] || null);
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/telemetry/history/:aircraftId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 60;
    const { rows } = await pool.query(
      `SELECT * FROM telemetry_readings WHERE aircraft_id = $1 ORDER BY time DESC LIMIT $2`,
      [req.params.aircraftId, limit]
    );
    res.json(rows.reverse()); // Chronological order
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/health/history/:aircraftId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 60;
    const { rows } = await pool.query(
      `SELECT * FROM aircraft_health_history WHERE aircraft_id = $1 ORDER BY time DESC LIMIT $2`,
      [req.params.aircraftId, limit]
    );
    res.json(rows.reverse());
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/faults/:aircraftId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM fault_events WHERE aircraft_id = $1 ORDER BY time DESC LIMIT 100`,
      [req.params.aircraftId]
    );
    res.json(rows);
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});
"""

# Let's insert this code right before "async function startServer()"
start_server_idx = content.find("async function startServer()")
content = content[:start_server_idx] + db_code + "\n" + content[start_server_idx:]

# Also call initDB() inside startServer()
init_db_call = "  await initDB();\n"
content = content.replace("async function startServer() {\n", "async function startServer() {\n" + init_db_call)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
