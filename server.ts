// AeroPulse AI - Express Full-Stack Server
import express, { Request, Response } from 'express';
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

const app = express();
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
app.get('/api/inventory', (_req: Request, res: Response) => {
  res.json(sparePartsInventory);
});

app.post('/api/inventory/reorder', (req: Request, res: Response) => {
  const { partId, quantity } = req.body;
  const part = sparePartsInventory.find(p => p.id === partId);
  if (!part) {
    res.status(404).json({ error: 'Part not found' });
    return;
  }
  part.stockQuantity += Number(quantity) || 10;
  part.replenishmentStatus = part.stockQuantity >= part.minThreshold ? 'In Stock' : 'Reorder Suggested';
  res.json({ message: 'Purchase requisition approved and stock replenished', part });
});

// 10. Fleet Analytics API
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
async function startServer() {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AeroPulse AI] Defense Platform Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[AeroPulse AI] Startup failure:', err);
});
