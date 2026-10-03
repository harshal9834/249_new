// AeroPulse AI - Express Full-Stack Server
import express, { Request, Response } from 'express';
const app = express();
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  initialAircraft,
  engineStagesData,
  predictiveInsights,
  maintenanceSchedules,
  sparePartsInventory,
  notificationsList,
  computeFleetMetrics,
  getLiveTelemetry,
  AircraftData,
  MaintenanceScheduleItem
} from './server/data.js';
import { askAeroPulseCopilot } from './server/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory state
let aircraftStore: AircraftData[] = [...initialAircraft];
let schedulesStore: MaintenanceScheduleItem[] = [...maintenanceSchedules];
let notifsStore = [...notificationsList];

// 1. Fleet Command Center Overview
app.get('/api/fleet/overview', (_req: Request, res: Response) => {
  const metrics = computeFleetMetrics();
  const topRiskAircraft = [...aircraftStore]
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 4);

  const recentAlerts = notifsStore.slice(0, 5);
  const recentActivities = schedulesStore.slice(0, 4);

  res.json({
    metrics,
    topRiskAircraft,
    recentAlerts,
    recentActivities,
    fleetReadinessGauge: {
      currentReadiness: 78.4,
      targetReadiness: 85.0,
      deployableCount: aircraftStore.filter(a => a.status === 'Operational').length,
      totalCount: aircraftStore.length
    }
  });
});

// 2. Aircraft Management API
app.get('/api/aircraft', (req: Request, res: Response) => {
  const { category, status, search, sortField, sortOrder } = req.query;

  let filtered = [...aircraftStore];

  if (category && category !== 'ALL') {
    filtered = filtered.filter(a => a.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter(a => a.status.toLowerCase() === (status as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      a =>
        a.id.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.tailNumber.toLowerCase().includes(q) ||
        a.squadron.toLowerCase().includes(q)
    );
  }

  if (sortField) {
    const field = sortField as keyof AircraftData;
    const order = sortOrder === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      if (a[field] < b[field]) return -1 * order;
      if (a[field] > b[field]) return 1 * order;
      return 0;
    });
  }

  res.json(filtered);
});

// Get Single Aircraft
app.get('/api/aircraft/:id', (req: Request, res: Response) => {
  const aircraft = aircraftStore.find(a => a.id === req.params.id || a.tailNumber === req.params.id);
  if (!aircraft) {
    res.status(404).json({ error: 'Aircraft not found' });
    return;
  }
  res.json(aircraft);
});

// Update Aircraft Status
app.patch('/api/aircraft/:id/status', (req: Request, res: Response) => {
  const { status, healthScore } = req.body;
  const index = aircraftStore.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Aircraft not found' });
    return;
  }

  if (status) aircraftStore[index].status = status;
  if (healthScore !== undefined) aircraftStore[index].healthScore = healthScore;

  res.json(aircraftStore[index]);
});

// Register New Aircraft
app.post('/api/aircraft', (req: Request, res: Response) => {
  const body = req.body;
  const newAircraft: AircraftData = {
    id: `AC-${Date.now().toString().slice(-4)}`,
    name: body.name || 'New Airframe',
    tailNumber: body.tailNumber || `TAIL-${Math.floor(100 + Math.random() * 900)}`,
    category: body.category || 'Fighter',
    status: body.status || 'Operational',
    healthScore: body.healthScore || 100.0,
    riskLevel: body.riskLevel || 'Low',
    flightHours: body.flightHours || 0,
    missionHours: body.missionHours || 0,
    lastMaintenance: new Date().toISOString().split('T')[0],
    nextInspection: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    squadron: body.squadron || 'General Air Fleet Reserve',
    baseStation: body.baseStation || 'Main Air Base',
    callSign: body.callSign || 'GHOST-01',
    enginesCount: body.enginesCount || 2,
    components: body.components || [
      {
        id: `comp-${Date.now()}-eng`,
        name: 'Primary Propulsion Assembly',
        type: 'Engine',
        serialNumber: `ENG-${Math.floor(1000 + Math.random() * 9000)}`,
        healthScore: 98,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 500,
        temperature: 610,
        vibration: 1.1,
        pressure: 50,
        fuelFlow: 3200,
        rpm: 96,
        oilPressure: 52,
        trend: 'stable',
        maintenanceHistory: []
      },
      {
        id: `comp-${Date.now()}-hyd`,
        name: 'Flight Hydraulic Actuators',
        type: 'Hydraulic System',
        serialNumber: `HYD-${Math.floor(1000 + Math.random() * 9000)}`,
        healthScore: 99,
        status: 'Operational',
        riskLevel: 'Low',
        rulHours: 600,
        temperature: 65,
        vibration: 0.6,
        pressure: 3000,
        trend: 'stable',
        maintenanceHistory: []
      }
    ]
  };

  aircraftStore.unshift(newAircraft);
  res.status(201).json(newAircraft);
});

// Live Telemetry
app.get('/api/telemetry/live/:aircraftId', (req: Request, res: Response) => {
  const telemetry = getLiveTelemetry(req.params.aircraftId);
  res.json(telemetry);
});

// Engine Digital Twin Stage Breakdown
app.get('/api/engine/stages/:aircraftId', (req: Request, res: Response) => {
  const ac = aircraftStore.find(a => a.id === req.params.aircraftId);
  const stages = engineStagesData[req.params.aircraftId] || engineStagesData['default'];
  res.json({
    aircraft: ac || aircraftStore[0],
    stages
  });
});

// 5. Predictive Maintenance API
app.get('/api/predictive/insights', (_req: Request, res: Response) => {
  res.json(predictiveInsights);
});

// 6. Fleet Availability Simulator
app.post('/api/predictive/simulate', (req: Request, res: Response) => {
  const { selectedAircraftIds, maintenanceType, simulatedDowntimeHours } = req.body;
  const total = aircraftStore.length;
  const currentOperational = aircraftStore.filter(a => a.status === 'Operational').length;
  const currentAvailability = Math.round((currentOperational / total) * 1000) / 10;

  const pullCount = (selectedAircraftIds as string[])?.length || 1;
  const newOperational = Math.max(0, currentOperational - pullCount);
  const projectedAvailability = Math.round((newOperational / total) * 1000) / 10;
  const availabilityImpactDelta = Math.round((projectedAvailability - currentAvailability) * 10) / 10;

  const downtime = simulatedDowntimeHours || (maintenanceType === 'Depot Overhaul' ? 96 : maintenanceType === 'Corrective' ? 36 : 14);

  // Generate 7-day timeline simulation curve
  const timeline = [
    { day: 'Day 0 (Now)', baseline: currentAvailability, simulated: currentAvailability },
    { day: 'Day 1 (Downtime)', baseline: currentAvailability, simulated: projectedAvailability },
    { day: 'Day 2', baseline: currentAvailability + 1.2, simulated: projectedAvailability },
    { day: 'Day 3', baseline: currentAvailability + 1.5, simulated: Math.min(100, projectedAvailability + (pullCount > 1 ? 5 : 11)) },
    { day: 'Day 4 (Recovery)', baseline: currentAvailability + 2.0, simulated: Math.min(100, projectedAvailability + (pullCount > 1 ? 10 : 22)) },
    { day: 'Day 5 (Restored)', baseline: currentAvailability + 2.1, simulated: Math.min(100, currentAvailability + 1.2) },
    { day: 'Day 7', baseline: currentAvailability + 2.2, simulated: Math.min(100, currentAvailability + 2.5) }
  ];

  res.json({
    currentAvailability,
    projectedAvailability,
    availabilityImpactDelta,
    pulledAircraftCount: pullCount,
    estimatedDowntimeHours: downtime,
    expectedRecoveryDays: Math.ceil(downtime / 24),
    missionImpactRisk: pullCount > 2 ? 'HIGH MISSION RESTRICTION' : pullCount > 1 ? 'MODERATE SORTIE SURGE RISK' : 'LOW THEATER IMPACT',
    timeline
  });
});

// 7. AI Maintenance Copilot API
app.post('/api/ai/copilot', async (req: Request, res: Response) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }
    const result = await askAeroPulseCopilot(prompt, history || []);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal AI Copilot error' });
  }
});

// 8. Maintenance Planner Schedules
app.get('/api/maintenance/schedules', (_req: Request, res: Response) => {
  res.json(schedulesStore);
});

app.post('/api/maintenance/schedules', (req: Request, res: Response) => {
  const body = req.body;
  const newSchedule: MaintenanceScheduleItem = {
    id: `sched-${Date.now().toString().slice(-4)}`,
    aircraftId: body.aircraftId,
    tailNumber: body.tailNumber || 'TBD',
    aircraftName: body.aircraftName || 'Tactical Aircraft',
    title: body.title,
    type: body.type || 'Preventive',
    priority: body.priority || 'Medium',
    status: 'Scheduled',
    scheduledStart: body.scheduledStart || new Date().toISOString(),
    scheduledEnd: body.scheduledEnd || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    bayLocation: body.bayLocation || 'Hangar Bay 02',
    estimatedHours: body.estimatedHours || 24,
    assignedTeam: body.assignedTeam || 'Maintenance Wing Bravo',
    components: body.components || ['Engine System']
  };

  schedulesStore.unshift(newSchedule);
  res.status(201).json(newSchedule);
});

// 9. Spare Parts Inventory
app.get('/api/agencies', async (_req, res) => {
  try {
    const agencies = await prisma.maintenanceAgency.findMany();
    if (agencies.length === 0) {
      await prisma.maintenanceAgency.createMany({
        data: [
          { name: 'Lockheed Martin Aerospace', location: 'Fort Worth, TX', tier: 'Tier 1' },
          { name: 'USAF Base Maintenance Facility', location: 'Nellis AFB, NV', tier: 'Tier 1' },
          { name: 'AeroPulse Rapid Response', location: 'Mobile Unit', tier: 'Tier 2' }
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
      orderBy: { performedAt: 'desc' },
      take: 50
    });
    res.json(records);
  } catch(e) { res.status(500).json({ error: 'DB Error' }); }
});

app.get('/api/inventory', async (_req, res) => {
  try {
    const parts = await prisma.sparePart.findMany();
    if (parts.length === 0) {
      await prisma.sparePart.createMany({
        data: [
          { name: 'Turbofan Compressor Blade', partNumber: 'ENG-F135-01', stockQuantity: 42, minThreshold: 15, unitCost: 12500 },
          { name: 'Hydraulic Actuator', partNumber: 'HYD-ACT-09', stockQuantity: 8, minThreshold: 10, unitCost: 4500 },
          { name: 'AESA Radar Module', partNumber: 'AVI-RAD-33', stockQuantity: 2, minThreshold: 5, unitCost: 85000 }
        ]
      });
      const newParts = await prisma.sparePart.findMany();
      res.json(newParts);
      return;
    }
    res.json(parts);
  } catch(e) { res.status(500).json({ error: 'DB Error' }); }
});

app.post('/api/inventory/reorder', async (req, res) => {
  try {
    const { partId, quantity } = req.body;
    const part = await prisma.sparePart.findUnique({ where: { id: partId } });
    if (!part) { res.status(404).json({ error: 'Part not found' }); return; }
    await prisma.sparePart.update({
      where: { id: partId },
      data: { stockQuantity: part.stockQuantity + quantity }
    });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'DB Error' }); }
});

// 10. Fleet Analytics API
app.get('/api/maintenance-analytics', async (_req, res) => {
  try {
    const records = await prisma.maintenanceRecord.findMany();
    const faults = await prisma.fault.findMany();
    const aircraft = await prisma.aircraft.findMany();
    
    // Calculate real MTBF (Mean Time Between Failures)
    // For demo, assume each aircraft flies 10 hours a day
    const totalFlightHours = aircraft.length * 500;
    const mtbf = faults.length > 0 ? (totalFlightHours / faults.length) : 450;
    
    // Calculate real MTTR (Mean Time To Repair)
    let totalDowntime = 0;
    records.forEach(r => { totalDowntime += (r.downtimeHours || 0); });
    const mttr = records.length > 0 ? (totalDowntime / records.length) : 14.5;
    
    const activeWorkOrders = faults.filter(f => f.isActive).length;
    
    // Calculate Fleet Downtime %
    const downtimePct = aircraft.length > 0 ? (aircraft.filter(a => a.status !== 'OPERATIONAL').length / aircraft.length) * 100 : 0;
    
    let totalCost = 0;
    records.forEach(r => { totalCost += (r.cost || 0); });

    res.json({
      mtbfHours: mtbf,
      mttrHours: mttr,
      fleetDowntimePct: downtimePct,
      totalMaintenanceCost: totalCost || 1250000,
      activeWorkOrdersCount: activeWorkOrders || 0
    });
  } catch(e) { 
    res.status(500).json({ error: 'DB Error' }); 
  }
});

  app.get('/api/analytics', (_req: Request, res: Response) => {
  const healthDistribution = [
    { range: '90-100% (Optimal)', count: aircraftStore.filter(a => a.healthScore >= 90).length, fill: '#10b981' },
    { range: '80-89% (Good)', count: aircraftStore.filter(a => a.healthScore >= 80 && a.healthScore < 90).length, fill: '#3b82f6' },
    { range: '70-79% (Advisory)', count: aircraftStore.filter(a => a.healthScore >= 70 && a.healthScore < 80).length, fill: '#f59e0b' },
    { range: '<70% (Degraded)', count: aircraftStore.filter(a => a.healthScore < 70).length, fill: '#ef4444' }
  ];

  const failureTrends = [
    { month: 'May', propulsion: 4, avionics: 2, hydraulics: 3, structural: 1 },
    { month: 'Jun', propulsion: 3, avionics: 3, hydraulics: 2, structural: 1 },
    { month: 'Jul', propulsion: 5, avionics: 2, hydraulics: 4, structural: 0 },
    { month: 'Aug', propulsion: 2, avionics: 1, hydraulics: 3, structural: 2 },
    { month: 'Sep', propulsion: 6, avionics: 2, hydraulics: 3, structural: 1 },
    { month: 'Oct (Proj)', propulsion: 3, avionics: 1, hydraulics: 2, structural: 1 }
  ];

  const availabilityHistory = [
    { week: 'W36', rate: 88.5, target: 85 },
    { week: 'W37', rate: 85.2, target: 85 },
    { week: 'W38', rate: 81.0, target: 85 },
    { week: 'W39', rate: 77.8, target: 85 },
    { week: 'W40 (Current)', rate: 66.7, target: 85 }
  ];

  const utilization = aircraftStore.map(a => ({
    name: a.tailNumber,
    flightHours: a.flightHours,
    health: a.healthScore
  }));

  res.json({
    healthDistribution,
    failureTrends,
    availabilityHistory,
    utilization,
    metrics: {
      mtbf: 412.5,
      mttr: 18.2, // Mean Time to Repair (hours)
      preventiveRatio: 74.2, // %
      dispatchReliability: 96.8 // %
    }
  });
});

// 11. Notification Center
app.get('/api/notifications', (_req: Request, res: Response) => {
  res.json(notifsStore);
});

app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
  const { id } = req.body;
  if (id === 'all') {
    notifsStore.forEach(n => (n.isRead = true));
  } else if (id) {
    const item = notifsStore.find(n => n.id === id);
    if (item) item.isRead = true;
  }
  res.json(notifsStore);
});

// Vite Middleware Mounting for Dev Mode / Static serving for production


import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import http from 'http';

const prisma = new PrismaClient();



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
    
    // Add 90 day retention policy
    await prisma.$executeRawUnsafe(`SELECT add_retention_policy('"Telemetry"', INTERVAL '90 days', if_not_exists => TRUE);`);

    console.log('[TimescaleDB] Schema and Hypertable initialized successfully via Prisma');
  } catch (err: any) {
    console.warn('[TimescaleDB] Initialization info:', err.message);
  }
}

const knownAircraft = new Set<string>();

io.on('connection', (socket) => {
  socket.on('publish_telemetry', async (data) => {
    // Ensure Aircraft exists in DB to prevent Foreign Key constraint failures
    if (!knownAircraft.has(data.aircraftId)) {
      try {
                const safeStatus = (data.status || 'OPERATIONAL').toUpperCase();
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
        });
        knownAircraft.add(data.aircraftId);
      } catch(e) { console.warn('Aircraft Upsert Error:', e); }
    }

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
          verticalSpeed: data.verticalSpeed || 0,
          groundSpeed: data.groundSpeed || 0,
          machNumber: data.machNumber || 0,
          angleOfAttack: data.angleOfAttack || 0,
          roll: data.roll || 0,
          yaw: data.yaw || 0,
          airDensity: data.airDensity || 1.225,
          humidity: data.humidity || 50,
          windSpeed: data.windSpeed || 0,
          pressure: data.pressure || 1013,
          turbulence: data.turbulence || 'LOW',
          fuelQuantity: data.fuelQuantity || 100,
          fuelPercentage: data.fuelPercentage || 100,
          fuelTankTemp: data.fuelTankTemp || 20,
          fuelPumpStatus: data.fuelPumpStatus || 'NOMINAL',
          fuelLeak: data.fuelLeak || false,
          batteryVoltage: data.batteryVoltage || 28.0,
          generatorLoad: data.generatorLoad || 40.0,
          busVoltage: data.busVoltage || 28.0,
          powerConsumption: data.powerConsumption || 15.0,
          hydraulicPressure: data.hydraulicPressure || 3000.0,
          hydraulicTemp: data.hydraulicTemp || 60.0,
          actuatorLoad: data.actuatorLoad || 25.0,
          leakStatus: data.leakStatus || false,
          gearPosition: data.gearPosition || 'DOWN',
          brakeTemp: data.brakeTemp || 100.0,
          tyrePressure: data.tyrePressure || 200.0,
          radarStatus: data.radarStatus || 'NOMINAL',
          gpsHealth: data.gpsHealth || 'NOMINAL',
          insAccuracy: data.insAccuracy || 99.9,
          flightComputerStatus: data.flightComputerStatus || 'NOMINAL',
          communicationStatus: data.communicationStatus || 'NOMINAL'
        }
      });
      // Broadcast to all clients
      io.emit('telemetry_update', data);
    } catch(e) { console.error('WS Prisma Save Error:', e); }
  });
});

app.post('/api/telemetry', async (req, res) => {
  res.status(200).json({ success: true, message: 'Use websockets for telemetry' });
});

app.post('/api/faults', async (req, res) => {
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

async function startServer() {
  await initDB();
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[AeroPulse AI] Defense Platform Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[AeroPulse AI] Startup failure:', err);
});
