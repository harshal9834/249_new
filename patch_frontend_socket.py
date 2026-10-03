import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

ingest_telemetry_action = """    ingestTelemetry: (data: any) => void;
"""

content = content.replace("fetchInitialData: () => Promise<void>;", "fetchInitialData: () => Promise<void>;\n    ingestTelemetry: (data: any) => void;")

ingest_telemetry_impl = """    ingestTelemetry: (data) => set((state) => {
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
                roll: data.roll,
                yaw: data.yaw,
                airDensity: data.airDensity,
                windSpeed: data.windSpeed,
                ambientPressure: data.pressure,
                turbulence: data.turbulence,
                gearPosition: data.gearPosition,
                brakeTemp: data.brakeTemp,
                tyrePressure: data.tyrePressure,
                generatorLoad: data.generatorLoad,
                busVoltage: data.busVoltage,
                batteryVoltage: data.batteryVoltage,
                powerConsumption: data.powerConsumption,
                radarStatus: data.radarStatus,
                gpsHealth: data.gpsHealth,
                insAccuracy: data.insAccuracy,
                flightComputerStatus: data.flightComputerStatus,
                communicationStatus: data.communicationStatus,
                fuelTankTemp: data.fuelTankTemp,
                fuelPumpStatus: data.fuelPumpStatus,
                hydraulicTemp: data.hydraulicTemp,
                actuatorLoad: data.actuatorLoad,
                healthScore: data.healthScore,
                status: data.status,
                activeFaults: data.activeFaults || a.activeFaults,
                components: a.components.map(c => {
                    if (c.type === 'Engine') {
                        return { ...c, rpm: data.rpm, temperature: data.temperature, vibration: data.vibration, oilPressure: data.oilPressure, fuelFlow: data.fuelFlow };
                    }
                    if (c.type === 'Fuel System') {
                        return { ...c, fuelLevel: data.fuelLevel || c.fuelLevel };
                    }
                    return c;
                })
            };
        });
        return { aircraftList: newList } as Partial<SimulatorState>;
    }),

    getMetrics: () => {"""

content = content.replace("getMetrics: () => {", ingest_telemetry_impl)

# Add socket listener that feeds ingestTelemetry
socket_listener = """
// Setup socket listeners for real-time telemetry broadcast from backend
socket.on('telemetry_update', (data) => {
    useSimulatorStore.getState().ingestTelemetry(data);
});
socket.on('telemetry_broadcast', (data) => {
    useSimulatorStore.getState().ingestTelemetry(data);
});

export const useSimulatorStore = create<SimulatorState>((set, get) => ({"""

content = content.replace("export const useSimulatorStore = create<SimulatorState>((set, get) => ({", socket_listener)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
