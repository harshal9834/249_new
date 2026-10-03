import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [activeModule, setActiveModule] = useState<NavModule>('command-center');
  const [currentRole, setCurrentRole] = useState<UserRole>('Fleet Commander');
  const [selectedWing, setSelectedWing] = useState<string>('Global Air Fleet Command (All Wings)');
  const [selectedAircraftId, setSelectedAircraftId] = useState<string>('AC-F023');
  const [isViewingDetails, setIsViewingDetails] = useState<boolean>(false);

  // Data Stores
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [metrics, setMetrics] = useState<FleetMetrics | null>(null);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceScheduleItem[]>([]);
  const [inventory, setInventory] = useState<SparePartItem[]>([]);
  const [notifications, setNotifications] = useState<FleetNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      try {
        const [acRes, overviewRes, insRes, schedRes, invRes, notifRes] = await Promise.all([
          fetch('/api/aircraft'),
          fetch('/api/fleet/overview'),
          fetch('/api/predictive/insights'),
          fetch('/api/maintenance/schedules'),
          fetch('/api/inventory'),
          fetch('/api/notifications')
        ]);

        if (acRes.ok) setAircraftList(await acRes.json());
        if (overviewRes.ok) {
          const overview = await overviewRes.json();
          setMetrics(overview.metrics);
        }
        if (insRes.ok) setInsights(await insRes.json());
        if (schedRes.ok) setSchedules(await schedRes.json());
        if (invRes.ok) setInventory(await invRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      } catch (err) {
        console.warn('Backend fetch failed, using internal fallbacks:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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
    try {
      const res = await fetch('/api/aircraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAc)
      });
      if (res.ok) {
        const created = await res.json();
        setAircraftList(prev => [created, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id: string, status: AircraftStatus) => {
    try {
      const res = await fetch(`/api/aircraft/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setAircraftList(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSchedule = async (sched: Partial<MaintenanceScheduleItem>) => {
    try {
      const res = await fetch('/api/maintenance/schedules', {
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
      const res = await fetch('/api/inventory/reorder', {
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
      await fetch('/api/notifications/mark-read', {
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
          <AircraftDigitalTwin
            aircraft={currentAircraft}
            allAircraft={aircraftList}
            onSelectAnotherAircraft={(id) => setSelectedAircraftId(id)}
          />
        )}

        {activeModule === 'engine-digital-twin' && (
          <EngineDigitalTwin
            aircraftTailNumber={currentAircraft ? `${currentAircraft.tailNumber} (${currentAircraft.name})` : 'AF-023 (F-35A)'}
          />
        )}

        {activeModule === 'predictive-maintenance' && (
          <PredictiveMaintenance
            insights={insights}
            onScheduleAction={(ins) => {
              setActiveModule('maintenance-planner');
            }}
            onAskCopilot={(query) => {
              setActiveModule('ai-copilot');
            }}
          />
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
          <MaintenancePlanner
            schedules={schedules}
            aircraftList={aircraftList}
            onAddSchedule={handleAddSchedule}
            onUpdateStatus={handleUpdateScheduleStatus}
          />
        )}

        {activeModule === 'spare-parts' && (
          <SparePartsManagement
            inventory={inventory}
            onReorder={handleReorderPart}
          />
        )}

        {activeModule === 'fleet-analytics' && (
          <FleetAnalytics />
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
      </main>

      {/* Executive Defense Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">AeroPulse AI</span>
            <span>•</span>
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
