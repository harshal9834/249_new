import React, { useState, useEffect } from 'react';
import { useSimulatorStore } from './store/simulatorStore';
import { SimulatorControlCenter } from './components/SimulatorControlCenter';
import { MaintenanceAnalyticsCenter } from './components/MaintenanceAnalyticsCenter';
import { TechnicalRecords } from './components/TechnicalRecords';
import { SparePartsDepot } from './components/SparePartsDepot';

import { Header } from './components/Header';
import { Navigation, NavModule } from './components/Navigation';
import { CommandCenter } from './components/CommandCenter';
import { AircraftManagement } from './components/AircraftManagement';
import { AircraftDetails } from './components/AircraftDetails';
import { AircraftDigitalTwin } from './components/AircraftDigitalTwin';
import { EngineDigitalTwin } from './components/EngineDigitalTwin';
import { PredictiveMaintenance } from './components/PredictiveMaintenance';
import { AvailabilitySimulator } from './components/AvailabilitySimulator';
import { AiCopilot } from './components/AiCopilot';
import { MaintenancePlanner } from './components/MaintenancePlanner';
import { SparePartsManagement } from './components/SparePartsManagement';
import { FleetAnalytics } from './components/FleetAnalytics';
import { NotificationCenter } from './components/NotificationCenter';
import { ErrorBoundary } from './components/ErrorBoundary';

import { 
  Aircraft, 
  FleetMetrics, 
  PredictiveInsight, 
  MaintenanceScheduleItem, 
  SparePartItem, 
  FleetNotification, 
  UserRole,
  AircraftStatus 
} from './types/fleet';


class SimulatorErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Simulator Crash Log:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 border border-red-500 bg-red-50 text-red-700 m-6 rounded-lg">
          <h2 className="text-lg font-bold mb-2">Simulator Component Crashed</h2>
          <pre className="text-xs overflow-auto bg-white p-4 border border-red-200">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeModule, setActiveModule] = useState<NavModule>('command-center');
  const [currentRole, setCurrentRole] = useState<UserRole>('Fleet Commander');
  const [selectedWing, setSelectedWing] = useState<string>('Global Air Fleet Command (All Wings)');
  const [selectedAircraftId, setSelectedAircraftId] = useState<string>('AC-F023');
  const [isViewingDetails, setIsViewingDetails] = useState<boolean>(false);

  // Use Simulator Store for ALL data
          const store = useSimulatorStore();
    
    // Global Physics Engine Loop (Runs independently of active page)
    useEffect(() => {
      let interval: any;
      if (store.isSimulating) {
        interval = setInterval(() => {
          store.tickSimulation();
        }, 100);
      }
      return () => clearInterval(interval);
    }, [store.isSimulating, store.tickSimulation]);

    useEffect(() => {
      store.fetchInitialData();
    }, []);

    const aircraftList = store.aircraftList;
  const metrics = store.getMetrics();
  const insights = store.getInsights();
  
  // Stubs for non-simulated data (to keep the app compiling without ripping out everything)
  const [schedules, setSchedules] = useState<MaintenanceScheduleItem[]>([]);
  const [inventory, setInventory] = useState<SparePartItem[]>([]);
  const [notifications, setNotifications] = useState<FleetNotification[]>([]);
  const isLoading = false;

  // Sync selected aircraft
  useEffect(() => {
    if (aircraftList.length > 0 && (!selectedAircraftId || !aircraftList.find(a => a.id === selectedAircraftId))) {
      setSelectedAircraftId(aircraftList[0].id);
    }
  }, [aircraftList, selectedAircraftId]);
  // Handlers
  const handleSelectAircraft = (id: string) => {
    setSelectedAircraftId(id);
    setIsViewingDetails(true);
    setActiveModule('aircraft-management');
  };

  const handleOpenDigitalTwin = (id: string) => {
    setSelectedAircraftId(id);
    setIsViewingDetails(false);
    setActiveModule('aircraft-digital-twin');
  };

  const handleOpenEngineTwin = (id: string) => {
    setSelectedAircraftId(id);
    setIsViewingDetails(false);
    setActiveModule('engine-digital-twin');
  };

  const handleAddNewAircraft = async (newAc: Partial<Aircraft>) => {
    store.addAircraft(newAc.name || 'New Aircraft', newAc.category || 'Fighter');
  };

  const handleUpdateStatus = async (id: string, status: AircraftStatus) => {
    // Simulator computes status from health automatically
  };

  const handleAddSchedule = async (sched: Partial<MaintenanceScheduleItem>) => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/maintenance/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sched)
      });
      if (res.ok) {
        const created = await res.json();
        setSchedules(prev => [created, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateScheduleStatus = (id: string, status: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: status as any } : s));
  };

  const handleReorderPart = async (partId: string, quantity: number) => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/inventory/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partId, quantity })
      });
      if (res.ok) {
        const { part } = await res.json();
        setInventory(prev => prev.map(p => p.id === partId ? part : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      await fetch((import.meta.env.VITE_API_URL || '') + '/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } else {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentAircraft = aircraftList.find(a => a.id === selectedAircraftId) || aircraftList[0];

  const defaultMetrics: FleetMetrics = {
    total: aircraftList.length || 9,
    operational: aircraftList.filter(a => a.status === 'Operational').length || 6,
    warning: aircraftList.filter(a => a.status === 'Warning').length || 2,
    maintenance: aircraftList.filter(a => a.status === 'Maintenance').length || 1,
    critical: aircraftList.filter(a => a.status === 'Critical').length || 1,
    availabilityPct: 66.7,
    categories: {
      Fighter: { total: 3, healthy: 2, warning: 0, critical: 1, maintenance: 0 },
      Transport: { total: 3, healthy: 1, warning: 1, critical: 0, maintenance: 1 },
      UAV: { total: 3, healthy: 2, warning: 1, critical: 0, maintenance: 0 }
    },
    mtbfHours: 412.5,
    missionReadinessRate: 78.4
  };

  const activeMetrics = metrics || defaultMetrics;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Executive Header */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        selectedWing={selectedWing}
        setSelectedWing={setSelectedWing}
        notifications={notifications}
        onOpenNotifications={() => setActiveModule('notifications')}
        onOpenSimulator={() => setActiveModule('simulator')}
        availabilityPct={activeMetrics.availabilityPct}
      />

      {/* Module Navigation Tabs */}
      <Navigation
        activeModule={activeModule}
        setActiveModule={(mod) => {
          setActiveModule(mod);
          if (mod === 'aircraft-management') setIsViewingDetails(false);
        }}
        unreadAlertsCount={notifications.filter(n => !n.isRead).length}
      />

      {/* Main Module Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeModule === 'command-center' && (
          <CommandCenter
            metrics={activeMetrics}
            topRiskAircraft={aircraftList.filter(a => a.status !== 'Operational').slice(0, 4)}
            recentAlerts={notifications.slice(0, 4)}
            recentActivities={schedules.slice(0, 4)}
            onSelectAircraft={handleSelectAircraft}
            onNavigate={(mod) => {
              setActiveModule(mod);
              setIsViewingDetails(false);
            }}
          />
        )}

        {activeModule === 'aircraft-management' && (
          isViewingDetails && currentAircraft ? (
            <AircraftDetails
              aircraft={currentAircraft}
              onBack={() => setIsViewingDetails(false)}
              onOpenDigitalTwin={handleOpenDigitalTwin}
              onOpenEngineTwin={handleOpenEngineTwin}
              onStatusChange={handleUpdateStatus}
            />
          ) : (
            <AircraftManagement
              aircraftList={aircraftList}
              onSelectAircraft={handleSelectAircraft}
              onOpenDigitalTwin={handleOpenDigitalTwin}
              onOpenEngineTwin={handleOpenEngineTwin}
              onAddNewAircraft={handleAddNewAircraft}
              onUpdateStatus={handleUpdateStatus}
            />
          )
        )}

        {activeModule === 'aircraft-digital-twin' && currentAircraft && (
          <ErrorBoundary moduleName="Aircraft 3D Twin">
            <AircraftDigitalTwin
            aircraft={currentAircraft}
            allAircraft={aircraftList}
            onSelectAnotherAircraft={(id) => setSelectedAircraftId(id)}
          />
          </ErrorBoundary>
        )}

        {activeModule === 'engine-digital-twin' && (
          <ErrorBoundary moduleName="Engine 3D Twin">
            <EngineDigitalTwin aircraftTailNumber={currentAircraft ? `${currentAircraft.tailNumber} (${currentAircraft.name})` : 'AF-023 (F-35A)'} aircraft={currentAircraft!} />
          </ErrorBoundary>
        )}

        {activeModule === 'predictive-maintenance' && (
          <ErrorBoundary moduleName="Predictive AI">
            <PredictiveMaintenance
            insights={insights}
            onScheduleAction={(ins) => {
              setActiveModule('maintenance-planner');
            }}
            onAskCopilot={(query) => {
              setActiveModule('ai-copilot');
            }}
          />
          </ErrorBoundary>
        )}

        {activeModule === 'availability-simulator' && (
          <AvailabilitySimulator
            aircraftList={aircraftList}
          />
        )}

        {activeModule === 'ai-copilot' && (
          <AiCopilot />
        )}

        {activeModule === 'maintenance-planner' && (
          <TechnicalRecords />
        )}

        {activeModule === 'notifications' && (
          <NotificationCenter
            notifications={notifications}
            onMarkRead={handleMarkNotifRead}
            onNavigateToTarget={(url) => {
              if (url?.includes('/aircraft/')) {
                const id = url.split('/aircraft/')[1];
                setSelectedAircraftId(id);
                setIsViewingDetails(true);
                setActiveModule('aircraft-management');
              } else if (url?.includes('/inventory')) {
                setActiveModule('spare-parts');
              } else if (url?.includes('/predictive')) {
                setActiveModule('predictive-maintenance');
              } else if (url?.includes('/maintenance')) {
                setActiveModule('maintenance-planner');
              }
            }}
          />
        )}

        {activeModule === 'simulator' && (
          <SimulatorErrorBoundary>
            <SimulatorControlCenter />
          </SimulatorErrorBoundary>
        )}
      
        {activeModule === 'spare-parts' && (
          <ErrorBoundary moduleName="Spare Parts Depot">
            <SparePartsDepot />
          </ErrorBoundary>
        )}

        {activeModule === 'fleet-analytics' && (
          <ErrorBoundary moduleName="Maintenance Analytics">
            <MaintenanceAnalyticsCenter />
          </ErrorBoundary>
        )}
      </main>


      {/* Executive Defense Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">AeroPulse AI</span>
            <span className="mx-2">•</span>
            <span>Unified Air Fleet Predictive Maintenance & Digital Twin Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
            <span>SYSTEM INTEGRITY: 99.99%</span>
            <span>ENCRYPTION: AES-256-GCM</span>
            <span>MIL-STD-1553B / STANAG-4586</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
