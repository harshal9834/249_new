import { create } from 'zustand';
import { io } from 'socket.io-client';
const socket = io(); // Connects to same origin

import { 
    Aircraft, AircraftStatus, AircraftComponent, FleetCategory, RiskLevel, 
    FleetMetrics, PredictiveInsight, SparePartItem, MaintenanceRecord, 
    MaintenanceAgency, FailurePrediction, MaintenanceAnalytics 
} from '../types/fleet';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function calculateComponentTrend(health: number): 'stable' | 'degrading' | 'improving' | 'critical_spike' {
    if (health > 80) return 'stable';
    if (health > 40) return 'degrading';
    return 'critical_spike';
}

function calculateRiskLevel(health: number): RiskLevel {
    if (health > 80) return 'Low';
    if (health > 60) return 'Medium';
    if (health > 40) return 'High';
    return 'Critical';
}

function calculateStatus(health: number): AircraftStatus {
    if (health > 80) return 'Operational';
    if (health > 60) return 'Warning';
    if (health > 40) return 'Maintenance';
    return 'Critical';
}

export function createNewAircraft(name: string, category: FleetCategory): Aircraft {
    const id = generateId();
    const tailNumber = `SIM-${Math.floor(Math.random() * 9000) + 1000}`;
    
    const compTypes = ['Engine', 'Fuel System', 'Hydraulic System', 'Avionics', 'Electrical System', 'Landing Gear', 'Airframe'] as const;
    
    const components: AircraftComponent[] = compTypes.map(type => {
        const health = 100;
        return {
            id: generateId(),
            name: `${type} Unit`,
            type,
            serialNumber: `SN-${Math.floor(Math.random() * 10000)}`,
            healthScore: health,
            status: 'Operational',
            riskLevel: 'Low',
            rulHours: 500,
            temperature: type === 'Engine' ? 620 : 40,
            vibration: type === 'Engine' ? 0.8 : 0.1,
            pressure: 3000,
            oilPressure: type === 'Engine' ? 45 : undefined,
            rpm: type === 'Engine' ? 0 : undefined,
            fuelFlow: type === 'Engine' ? 0 : undefined,
            fuelLevel: type === 'Fuel System' ? 100 : undefined,
            voltage: type === 'Electrical System' ? 28 : undefined,
            trend: 'stable',
            maintenanceHistory: []
        };
    });
    
    return {
        id,
        name,
        tailNumber,
        category,
        status: 'Operational',
        healthScore: 100,
        riskLevel: 'Low',
        flightHours: Math.floor(Math.random() * 2000),
        missionHours: Math.floor(Math.random() * 50),
        lastMaintenance: new Date(Date.now() - 1000000000).toISOString(),
        nextInspection: new Date(Date.now() + 1000000000).toISOString(),
        squadron: '1st Fighter Wing',
        baseStation: 'Langley AFB',
        callSign: `GHOST-${Math.floor(Math.random() * 99)}`,
        enginesCount: category === 'Fighter' ? 1 : category === 'Transport' ? 4 : 1,
        operatingMode: 'Ground Idle',
        activeFaults: [],
        throttle: 5,
        speed: 0,
        altitude: 0,
        outsideAirTemp: 15,
        weight: category === 'Fighter' ? 45000 : category === 'Transport' ? 120000 : 5000,
        engineLoad: 5,
        climbRate: 0,
        heading: 360,
        bankAngle: 0,
        pitchAngle: 0,
        verticalSpeed: 0,
        groundSpeed: 0,
        machNumber: 0,
        angleOfAttack: 0,
        humidity: 45,
        windSpeed: 12,
        ambientPressure: 1013,
        payloadWeight: 5000,
        components
    };
}

export interface SimulatorState {
    aircraftList: Aircraft[];
    telemetryHistory: any[];
    isSimulating: boolean;
    
    addAircraft: (name: string, category: FleetCategory) => void;
    injectFault: (aircraftId: string, componentType: string, faultType: string) => void;
    toggleSimulation: () => void;
    tickSimulation: () => void;
    resetSimulation: () => void;
    randomDegradation: () => void;
    generateFleet: () => void;
    selectedAircraftId: string | null;
        setSelectedAircraftId: (id: string) => void;
    setOperatingMode: (aircraftId: string, mode: string) => void;
    setManualThrottle: (aircraftId: string, throttle: number) => void;
    setComponentHealth: (aircraftId: string, compType: string, health: number) => void;
    
    inventory: SparePartItem[];
    maintenanceRecords: MaintenanceRecord[];
    agencies: MaintenanceAgency[];
    predictions: FailurePrediction[];
    analytics: MaintenanceAnalytics;
    
    performMaintenance: (aircraftId: string, componentType: string, agencyId: string) => void;
    restockPart: (partId: string, quantity: number) => void;
    fetchInitialData: () => Promise<void>;
    ingestTelemetry: (data: any) => void;
    
    getMetrics: () => FleetMetrics;
    getInsights: () => PredictiveInsight[];
}

const publishTelemetry = (aircraft: Aircraft) => {
    const engine = aircraft.components.find(c => c.type === 'Engine');
    const fuelSystem = aircraft.components.find(c => c.type === 'Fuel System');
    const electrical = aircraft.components.find(c => c.type === 'Electrical System');
    const hydraulics = aircraft.components.find(c => c.type === 'Hydraulic System');
    
    socket.emit('publish_telemetry', {
        aircraftId: aircraft.id,
        rpm: engine?.rpm || 0,
        temperature: engine?.temperature || 0,
        vibration: engine?.vibration || 0,
        oilPressure: engine?.oilPressure || 0,
        fuelFlow: engine?.fuelFlow || 0,
        fuelLevel: fuelSystem?.fuelLevel || 100,
        voltage: electrical?.voltage || 28,
        hydraulicPressure: hydraulics?.pressure || 3000,
        ...aircraft
    });
};

const publishFault = (aircraftId: string, faultType: string) => {
    fetch('/api/faults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aircraftId, faultType, description: `Fault injected: ${faultType}` })
    }).catch(e => console.warn('Failed to publish fault to TimescaleDB', e));
};

const publishMaintenance = (aircraftId: string, action: string, agency: string, cost: number, downtime: number) => {
    fetch('/api/maintenance_events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aircraftId, action, agency, cost, downtime })
    }).catch(e => console.warn('Failed to publish maintenance event', e));
};


// Setup socket listeners for real-time telemetry broadcast from backend
socket.on('telemetry_update', (data) => {
    useSimulatorStore.getState().ingestTelemetry(data);
});
socket.on('telemetry_broadcast', (data) => {
    useSimulatorStore.getState().ingestTelemetry(data);
});

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
    aircraftList: [createNewAircraft('C-130J Super Hercules', 'Transport')],
    telemetryHistory: [],
    isSimulating: false,
    inventory: [],
    maintenanceRecords: [],
    agencies: [],
    predictions: [],
    analytics: { mtbfHours: 450, mttrHours: 14.5, fleetDowntimePct: 12.4, totalMaintenanceCost: 1250000, activeWorkOrdersCount: 4 },

    selectedAircraftId: null,
        setSelectedAircraftId: (id) => set({ selectedAircraftId: id }),
    
    setOperatingMode: (aircraftId, mode) => set((state) => {
        const newList = state.aircraftList.map(a => 
            a.id === aircraftId ? { ...a, operatingMode: mode as any } : a
        );
        return { aircraftList: newList } as Partial<SimulatorState>;
    }),

    setManualThrottle: (aircraftId, throttle) => set((state) => {
        const newList = state.aircraftList.map(a => 
            a.id === aircraftId ? { ...a, throttle } : a
        );
        return { aircraftList: newList } as Partial<SimulatorState>;
    }),
    
    addAircraft: (name, category) => set((state) => ({
        aircraftList: [...state.aircraftList, createNewAircraft(name, category)]
    })),
    
    setComponentHealth: (aircraftId, compType, health) => set((state) => {
        const newList = state.aircraftList.map(a => {
            if (a.id !== aircraftId) return a;
            const updatedComponents = a.components.map(c => {
                if (c.type === compType) return { ...c, healthScore: health, status: calculateStatus(health), riskLevel: calculateRiskLevel(health), trend: calculateComponentTrend(health) };
                return c;
            });
            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));
            return {
                ...a,
                components: updatedComponents,
                healthScore: overallHealth,
                status: calculateStatus(overallHealth),
                riskLevel: calculateRiskLevel(overallHealth)
            };
        });
        return { aircraftList: newList } as Partial<SimulatorState>;
    }),

    injectFault: (aircraftId, componentType, faultType) => set((state) => {
        publishFault(aircraftId, faultType);
        const newList = state.aircraftList.map(ac => {
            if (ac.id !== aircraftId) return ac;
            const newFaults = [...(ac.activeFaults || [])];
            if (!newFaults.includes(faultType)) newFaults.push(faultType);
            return {
                ...ac,
                activeFaults: newFaults
            };
        });
        return { aircraftList: newList, isSimulating: true } as Partial<SimulatorState>;
    }),
    
    toggleSimulation: () => set(state => ({ isSimulating: !state.isSimulating })),
    
    tickSimulation: () => set((state) => {
        if (!state.isSimulating) return state;

        const dt = 0.1; // 100ms simulation step
        const newPredictions = [...state.predictions];

        const newList = state.aircraftList.map(ac => {
            const faults = ac.activeFaults || [];
            let currentMode = ac.operatingMode || 'Ground Idle';

            if (faults.includes('Engine Overheat') || faults.includes('Fuel Leak') || faults.includes('Hydraulic Failure') || faults.includes('High Vibration')) {
                if (currentMode !== 'Landing' && currentMode !== 'Ground Idle') {
                    currentMode = 'Descent';
                }
            }

            let targetThrottle = 0;
            let targetRpm = 0;
            let targetPitch = 0;
            let targetBank = 0;

            switch (currentMode) {
                case 'Ground Idle': targetThrottle = 5; targetRpm = 1100; targetPitch = 0; targetBank = 0; break;
                case 'Taxi': targetThrottle = 15; targetRpm = 1600; targetPitch = 0; targetBank = (Math.random() > 0.5 ? 5 : -5); break;
                case 'Takeoff': targetThrottle = 100; targetRpm = 5600; targetPitch = 15; targetBank = 0; break;
                case 'Climb': targetThrottle = 85; targetRpm = 5250; targetPitch = 10; targetBank = (Math.random() > 0.8 ? 2 : -2); break;
                case 'Cruise': targetThrottle = 65; targetRpm = 4500; targetPitch = 2; targetBank = 0; break;
                case 'Loiter': targetThrottle = 50; targetRpm = 3500; targetPitch = 1; targetBank = 15; break;
                case 'Descent': targetThrottle = 25; targetRpm = 3000; targetPitch = -5; targetBank = 0; break;
                case 'Landing': targetThrottle = 40; targetRpm = 3800; targetPitch = 3; targetBank = 0; break;
            }

            let throttle = ac.throttle || 0;
            let speed = ac.speed || 0;
            let altitude = ac.altitude || 0;
            let heading = ac.heading || 360;
            let pitchAngle = ac.pitchAngle || 0;
            let bankAngle = ac.bankAngle || 0;
            
            throttle += (targetThrottle - throttle) * (dt * 0.5);
            pitchAngle += (targetPitch - pitchAngle) * (dt * 1.0);
            bankAngle += (targetBank - bankAngle) * (dt * 0.5);
            
            let turnRate = bankAngle * 0.1; 
            heading = (heading + turnRate * dt);
            if (heading >= 360) heading -= 360;
            if (heading < 0) heading += 360;

            let verticalSpeed = 0;

            if (currentMode === 'Takeoff') { speed += 4 * dt; if(speed>150) verticalSpeed = 80; }
            else if (currentMode === 'Climb') { speed += (300 - speed)*0.02; verticalSpeed = 300; }
            else if (currentMode === 'Cruise') { speed += (450 - speed)*0.01; verticalSpeed = (30000 - altitude)*0.1; }
            else if (currentMode === 'Loiter') { speed += (300 - speed)*0.01; verticalSpeed = (20000 - altitude)*0.1; }
            else if (currentMode === 'Descent') { speed += (250 - speed)*0.02; verticalSpeed = -200; }
            else if (currentMode === 'Landing') { speed += (140 - speed)*0.05; verticalSpeed = altitude > 0 ? -100 : 0; }
            else if (currentMode === 'Ground Idle') { altitude = 0; speed += (0 - speed)*0.2; }
            else if (currentMode === 'Taxi') { altitude = 0; speed += (20 - speed)*0.1; }
            
            altitude += verticalSpeed * dt;
            altitude = Math.max(0, altitude);
            speed = Math.max(0, speed);

            let oat = 15 - (altitude / 1000) * 1.98;
            let weight = ac.weight || 40000;
            let engineLoad = (throttle * 0.8) + (weight / 50000 * 15) + (currentMode === 'Climb' ? 10 : 0);

            // Advanced Aerospace Physics Block
            let windSpeed = ac.windSpeed || (10 + Math.random() * 5);
            let groundSpeed = speed + (windSpeed * 0.5); 
            let machNumber = speed / 661.47; 
            
            let pressure = 1013.25 * Math.pow(1 - 0.0000225577 * altitude, 5.25588);
            let tempKelvin = oat + 273.15;
            let airDensity = (pressure * 100) / (287.05 * tempKelvin);
            
            let angleOfAttack = (currentMode === 'Climb' ? 12 : currentMode === 'Cruise' ? 3 : currentMode === 'Takeoff' ? 15 : currentMode === 'Landing' ? 8 : 0) + (Math.random()*0.5);
            let roll = currentMode === 'Loiter' ? 15 : (Math.random() - 0.5);
            let yaw = Math.random() - 0.5;
            
            const updatedComponents = ac.components.map(c => {
                let health = c.healthScore;
                health -= 0.0001; 
                let trend: 'stable' | 'degrading' | 'improving' | 'critical_spike' = 'stable';

                if (c.type === 'Engine') {
                    let rpm = c.rpm || 0;
                    let temp = c.temperature || 0;
                    let vib = c.vibration || 0.8;
                    let oil = c.oilPressure || 45;
                    let flow = c.fuelFlow || 0;

                    rpm += (targetRpm - rpm) * (dt * 0.5);
                    let targetTemp = oat + (rpm / 5800) * 700 + (engineLoad * 2);
                    if (faults.includes('Engine Overheat')) { targetTemp += 1500; health -= 0.5; trend = 'critical_spike'; }
                    temp += (targetTemp - temp) * (dt * 0.2);

                    let baseVib = 0.2 + (engineLoad / 100) * 0.5 + ((100 - health) / 100) * 1.5;
                    if (faults.includes('High Vibration')) { baseVib += 3.0; health -= 1.0; trend = 'critical_spike'; }
                    vib += (baseVib - vib) * 0.2 + (Math.random() * 0.05 - 0.025);

                    let targetOil = 30 + (rpm / 5800) * 50;
                    if (health < 80) targetOil -= (80 - health) * 0.5;
                    if (faults.includes('Oil Leak')) targetOil -= 60;
                    oil += (targetOil - oil) * (dt * 0.5);

                    flow = (rpm / 5800) * 400 + (engineLoad / 100) * 100;
                    if (faults.includes('Fuel Leak')) flow += 800 + Math.random() * 200;

                    return { ...c, healthScore: Math.max(0, health), rpm, temperature: temp, vibration: vib, oilPressure: oil, fuelFlow: flow, trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike' };
                }

                if (c.type === 'Fuel System') {
                    let fuel = c.fuelLevel || 100;
                    const eng = ac.components.find(e => e.type === 'Engine');
                    const burnRate = eng?.fuelFlow || 0;
                    fuel -= (burnRate / 3600 / 10) * 0.01; 
                    if (faults.includes('Fuel Leak')) { fuel -= 0.05; health -= 0.3; trend = 'critical_spike'; }
                    return { ...c, healthScore: Math.max(0, health), fuelLevel: Math.max(0, fuel), trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike' };
                }
                
                if (c.type === 'Hydraulic System') {
                    let pressure = c.pressure || 3000;
                    if (faults.includes('Hydraulic Failure')) { pressure = 500; health -= 0.5; trend = 'critical_spike'; }
                    return { ...c, healthScore: Math.max(0, health), pressure, trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike' };
                }
                
                if (c.type === 'Electrical System') {
                    let volt = c.voltage || 28;
                    if (faults.includes('Electrical Failure')) { volt = 18; health -= 0.5; trend = 'critical_spike'; }
                    return { ...c, healthScore: Math.max(0, health), voltage: volt, trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike' };
                }
                
                return { ...c, healthScore: Math.max(0, health), trend: (trend === 'stable' && health < 90 ? 'degrading' : trend) as 'stable' | 'degrading' | 'improving' | 'critical_spike' };
            });

            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));

            return {
                ...ac,
                operatingMode: currentMode,
                throttle, speed, altitude, outsideAirTemp: oat, weight, engineLoad,
                climbRate: verticalSpeed, heading, bankAngle, pitchAngle, verticalSpeed,
                groundSpeed, machNumber, angleOfAttack, components: updatedComponents,
                healthScore: overallHealth, status: (overallHealth > 80 ? 'Operational' : overallHealth > 50 ? 'Warning' : overallHealth > 20 ? 'Maintenance' : 'Critical') as any
            };
        });

        const newAnalytics = { ...state.analytics };
        newList.forEach(ac => publishTelemetry(ac));
        return { aircraftList: newList, predictions: newPredictions, analytics: newAnalytics } as Partial<SimulatorState>;
    }),
    

    resetSimulation: () => set({ aircraftList: [createNewAircraft('C-130J Super Hercules', 'Transport')], telemetryHistory: [], isSimulating: false }),
    
    randomDegradation: () => set(state => {
        const newList = state.aircraftList.map(ac => {
            const updatedComponents = ac.components.map(c => {
                const degradation = Math.random() * 15;
                const health = Math.max(0, c.healthScore - degradation);
                return {
                    ...c,
                    healthScore: health,
                    status: health > 80 ? 'Operational' : health > 50 ? 'Warning' : health > 20 ? 'Maintenance' : 'Critical',
                    riskLevel: health > 80 ? 'Low' : health > 50 ? 'Moderate' : health > 20 ? 'High' : 'Critical',
                    trend: 'degrading' as any
                };
            });
            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));
            return {
                ...ac,
                components: updatedComponents,
                healthScore: overallHealth,
                status: (overallHealth > 80 ? 'Operational' : overallHealth > 50 ? 'Warning' : overallHealth > 20 ? 'Maintenance' : 'Critical') as any,
                riskLevel: (overallHealth > 80 ? 'Low' : overallHealth > 50 ? 'Moderate' : overallHealth > 20 ? 'High' : 'Critical') as any
            };
        });
        return { aircraftList: newList } as Partial<SimulatorState>;
    }),

    generateFleet: () => set(state => {
        return {
            aircraftList: [
                createNewAircraft('F-35A Lightning II', 'Fighter'),
                createNewAircraft('F-22 Raptor', 'Fighter'),
                createNewAircraft('C-130J Super Hercules', 'Transport'),
                createNewAircraft('C-17 Globemaster', 'Transport'),
                createNewAircraft('MQ-9 Reaper', 'UAV')
            ]
        };
    }),
    
    fetchInitialData: async () => {
        try {
            const [invRes, agRes, recRes, anRes] = await Promise.all([
                fetch('/api/inventory'),
                fetch('/api/agencies'),
                fetch('/api/maintenance_events'),
                fetch('/api/maintenance-analytics')
            ]);
            
            const inventory = invRes.ok ? await invRes.json() : [];
            const agencies = agRes.ok ? await agRes.json() : [];
            const maintenanceRecords = recRes.ok ? await recRes.json() : [];
            let analytics = anRes.ok ? await anRes.json() : null;
            if (!analytics || Object.keys(analytics).length === 0) {
                analytics = useSimulatorStore.getState().analytics;
            }
            
            set({ inventory, agencies, maintenanceRecords, analytics });
        } catch (e) {
            console.warn('Failed to fetch initial data from TimescaleDB', e);
        }
    },

    ingestTelemetry: (data: any) => set((state) => {
        const newList = state.aircraftList.map(a => {
            if (a.id !== data.aircraftId) return a;
            return {
                ...a,
                throttle: data.throttle,
                speed: data.speed,
                altitude: data.altitude,
                outsideAirTemp: data.outsideAirTemp,
                weight: data.weight,
                engineLoad: data.engineLoad,
                climbRate: data.climbRate,
                heading: data.heading,
                bankAngle: data.bankAngle,
                pitchAngle: data.pitchAngle,
                verticalSpeed: data.verticalSpeed,
                groundSpeed: data.groundSpeed,
                machNumber: data.machNumber,
                angleOfAttack: data.angleOfAttack,
                components: a.components.map(c => {
                    if (c.type === 'Engine') {
                        return { ...c, rpm: data.rpm, temperature: data.temperature, vibration: data.vibration, oilPressure: data.oilPressure, fuelFlow: data.fuelFlow };
                    }
                    if (c.type === 'Fuel System') {
                        return { ...c, fuelLevel: data.fuelLevel || c.fuelLevel };
                    }
                    if (c.type === 'Electrical System') {
                        return { ...c, voltage: data.voltage || c.voltage };
                    }
                    if (c.type === 'Hydraulic System') {
                        return { ...c, pressure: data.hydraulicPressure || c.pressure };
                    }
                    return c;
                })
            };
        });
        
        const newHistory = [...state.telemetryHistory, { ...data, time: new Date().toISOString() }];
        if (newHistory.length > 100) newHistory.shift();

        return { aircraftList: newList, telemetryHistory: newHistory } as Partial<SimulatorState>;
    }),

    getMetrics: () => {
        const list = get().aircraftList;
        const getCat = (cat: string) => {
            const acs = list.filter(a => a.category === cat);
            return {
                total: acs.length,
                healthy: acs.filter(a => a.status === 'Operational').length,
                warning: acs.filter(a => a.status === 'Warning').length,
                maintenance: acs.filter(a => a.status === 'Maintenance').length,
                critical: acs.filter(a => a.status === 'Critical').length,
            };
        };
        const metrics: any = {
            total: list.length,
            operational: list.filter(a => a.status === 'Operational').length,
            warning: list.filter(a => a.status === 'Warning').length,
            maintenance: list.filter(a => a.status === 'Maintenance').length,
            critical: list.filter(a => a.status === 'Critical').length,
            availabilityPct: list.length > 0 ? (list.filter(a => a.status === 'Operational').length / list.length) * 100 : 0,
            categories: {
                Fighter: getCat('Fighter'),
                Transport: getCat('Transport'),
                UAV: getCat('UAV')
            },
            mtbfHours: get().analytics.mtbfHours,
            missionReadinessRate: list.length > 0 ? (list.filter(a => a.status === 'Operational').length / list.length) * 100 : 0
        };
        return metrics;
    },
    
        getInsights: () => {
        const insights: PredictiveInsight[] = [];
        const state = get();
        
        state.aircraftList.forEach(ac => {
            const engine = ac.components.find(c => c.type === 'Engine');
            const isCrit = (ac.activeFaults && ac.activeFaults.length > 0) || ac.healthScore < 50 || (engine && engine.healthScore < 50);
            
            if (isCrit || ac.healthScore < 75) {
                let riskScore = 100 - ac.healthScore;
                let urgency = isCrit ? 'Immediate Grounding' : 'Priority';
                let rul = Math.max(0, Math.floor(ac.healthScore * 1.5));
                
                let vib = engine?.vibration || 0;
                let tempDelta = engine ? (engine.temperature - 400) : 0;

                let title = isCrit ? 'Critical System Failure Imminent' : 'Accelerated Wear Detected';
                if (ac.activeFaults && ac.activeFaults.includes('Engine Overheat')) title = 'Thermal Runaway Signature';
                if (ac.activeFaults && ac.activeFaults.includes('High Vibration')) title = 'Rotor Unbalance Signature';

                                insights.push({
                    id: `ins-${ac.id}-${Date.now()}`,
                    aircraftId: ac.id,
                    aircraftName: ac.name,
                    tailNumber: ac.tailNumber,
                    componentName: 'Engine System',
                    anomalyDetected: true,
                    anomalyType: title as any,
                    urgency: urgency as any,
                    confidenceScore: Math.round(75 + Math.random() * 20),
                    rulFlightHours: rul,
                    failureRiskScore: Math.round(riskScore),
                    vibrationTrend: vib,
                    temperatureDelta: tempDelta,
                    recommendation: `Immediate inspection of engine components due to ${title}.`,
                    technicalOrder: 'T.O. 1C-130J-2-71JG-00-1',
                    createdAt: new Date().toISOString()
                });
            }
        });
        
        return insights;
    },
    
    performMaintenance: (aircraftId, componentType, agencyId) => set((state) => {
        const agency = state.agencies.find(a => a.id === agencyId);
        const ac = state.aircraftList.find(a => a.id === aircraftId);
        if (!ac || !agency) return state;
        
        const comp = ac.components.find(c => c.type === componentType);
        if (!comp) return state;

        const newInv = [...state.inventory];
        const partMatch = newInv.find(p => p.name.includes(comp.name.split(' ')[0]) || comp.name.includes(p.category));
        let replacedPartId = undefined;
        let replacedPartName = undefined;
        let cost = 5000;
        
        if (partMatch && partMatch.stockQuantity > 0) {
            partMatch.stockQuantity -= 1;
            if (partMatch.stockQuantity < partMatch.minThreshold) partMatch.replenishmentStatus = 'Reorder Suggested';
            if (partMatch.stockQuantity === 0) partMatch.replenishmentStatus = 'Critical Shortage';
            replacedPartId = partMatch.partNumber;
            replacedPartName = partMatch.name;
            cost += partMatch.unitCost;
        }

        const record: MaintenanceRecord = {
            id: generateId(),
            aircraftId: ac.id,
            tailNumber: ac.tailNumber,
            componentId: comp.id,
            componentName: comp.name,
            actionTaken: `Replaced/Repaired ${comp.name} due to degradation.`,
            replacedPartId,
            replacedPartName,
            agencyId: agency.id,
            agencyName: agency.name,
            dateCompleted: new Date().toISOString(),
            downtimeHours: agency.averageTurnaroundHours + (Math.random() * 5),
            cost,
            techId: `T-${Math.floor(Math.random() * 9000)+1000}`,
            notes: 'Completed per technical order standards.'
        };

        const newList = state.aircraftList.map(a => {
            if (a.id !== aircraftId) return a;
            const updatedComponents = a.components.map(c => {
                if (c.type === componentType) {
                    return {
                        ...c,
                        healthScore: 100,
                        status: 'Operational',
                        riskLevel: 'Low',
                        trend: 'improving',
                        rulHours: 500,
                        temperature: c.type === 'Engine' ? 620 : 40,
                        vibration: c.type === 'Engine' ? 0.8 : 0.1,
                        maintenanceHistory: [{
                            date: record.dateCompleted,
                            type: 'Corrective',
                            action: record.actionTaken,
                            tech: record.techId
                        }, ...c.maintenanceHistory]
                    };
                }
                return c;
            });
            
            const overallHealth = Math.min(...updatedComponents.map(c => c.healthScore));
            return {
                ...a,
                activeFaults: [],
                components: updatedComponents,
                healthScore: overallHealth,
                status: calculateStatus(overallHealth),
                riskLevel: calculateRiskLevel(overallHealth)
            };
        });

        publishMaintenance(aircraftId, record.actionTaken, agency.name, cost, record.downtimeHours);
        const newAnalytics = { ...state.analytics };
        newAnalytics.totalMaintenanceCost += cost;
        newAnalytics.mttrHours = ((newAnalytics.mttrHours * state.maintenanceRecords.length) + record.downtimeHours) / (state.maintenanceRecords.length + 1);

        return { aircraftList: newList, inventory: newInv, analytics: newAnalytics, maintenanceRecords: [record, ...state.maintenanceRecords] } as Partial<SimulatorState>;
    }),
    
    restockPart: (partId, quantity) => set((state) => {
        const newInv = state.inventory.map(p => {
            if (p.id === partId) {
                const newQuantity = p.stockQuantity + quantity;
                return {
                    ...p,
                    stockQuantity: newQuantity,
                    replenishmentStatus: newQuantity > p.minThreshold ? 'In Stock' : 'Reorder Suggested'
                };
            }
            return p;
        });
        return { inventory: newInv } as Partial<SimulatorState>;
    })
}));
