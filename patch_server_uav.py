import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the CREATE TABLE
new_table = """CREATE TABLE IF NOT EXISTS telemetry_readings (
        time TIMESTAMPTZ NOT NULL,
        aircraft_id TEXT NOT NULL,
        rpm DOUBLE PRECISION,
        temperature DOUBLE PRECISION,
        vibration DOUBLE PRECISION,
        oil_pressure DOUBLE PRECISION,
        fuel_flow DOUBLE PRECISION,
        throttle DOUBLE PRECISION,
        speed DOUBLE PRECISION,
        altitude DOUBLE PRECISION,
        outside_air_temp DOUBLE PRECISION,
        weight DOUBLE PRECISION,
        engine_load DOUBLE PRECISION
      );"""

content = re.sub(
    r"CREATE TABLE IF NOT EXISTS telemetry_readings \([\s\S]*?fuel_flow DOUBLE PRECISION\n\s*\);",
    new_table,
    content
)

# 2. Update the API route
new_route = """app.post('/api/telemetry', async (req, res) => {
  try {
    const { aircraftId, rpm, temperature, vibration, oilPressure, fuelFlow, throttle, speed, altitude, outsideAirTemp, weight, engineLoad, healthScores, status } = req.body;
    const now = new Date();
    
    await pool.query(
      `INSERT INTO telemetry_readings (time, aircraft_id, rpm, temperature, vibration, oil_pressure, fuel_flow, throttle, speed, altitude, outside_air_temp, weight, engine_load) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [now, aircraftId, rpm, temperature, vibration, oilPressure, fuelFlow, throttle || 0, speed || 0, altitude || 0, outsideAirTemp || 0, weight || 0, engineLoad || 0]
    );

    if (healthScores) {"""

content = re.sub(
    r"app\.post\('/api/telemetry', async \(req, res\) => \{\n\s*try \{\n\s*const \{ aircraftId, rpm, temperature, vibration, oilPressure, fuelFlow, healthScores, status \} = req\.body;\n\s*const now = new Date\(\);\n\s*await pool\.query\(\n\s*`INSERT INTO telemetry_readings \(time, aircraft_id, rpm, temperature, vibration, oil_pressure, fuel_flow\) \n\s*VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7\)`,\n\s*\[now, aircraftId, rpm, temperature, vibration, oilPressure, fuelFlow\]\n\s*\);\n\n\s*if \(healthScores\) \{",
    new_route,
    content
)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
