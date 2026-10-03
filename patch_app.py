import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports = """import React, { useState, useEffect } from 'react';
import { useSimulatorStore } from './store/simulatorStore';
import { SimulatorControlCenter } from './components/SimulatorControlCenter';
"""
content = re.sub(r"import React, \{ useState, useEffect \} from 'react';", imports, content)

# Remove the useEffect fetching logic and replace state definitions
state_replacement = """
export default function App() {
  const [activeModule, setActiveModule] = useState<NavModule>('command-center');
  const [currentRole, setCurrentRole] = useState<UserRole>('Fleet Commander');
  const [selectedWing, setSelectedWing] = useState<string>('Global Air Fleet Command (All Wings)');
  const [selectedAircraftId, setSelectedAircraftId] = useState<string>('AC-F023');
  const [isViewingDetails, setIsViewingDetails] = useState<boolean>(false);

  // Use Simulator Store for ALL data
  const store = useSimulatorStore();
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
"""

# We need to replace from `export default function App() {` down to `  // Handlers`
start_str = "export default function App() {"
end_str = "  // Handlers"
start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + state_replacement + content[end_idx:]

# Handle Header
header_old = """<Header 
          currentRole={currentRole} 
          setCurrentRole={setCurrentRole} 
          selectedWing={selectedWing} 
          setSelectedWing={setSelectedWing}
          availabilityPct={metrics?.availabilityPct || 84.5}
          unreadCount={notifications.filter(n => !n.isRead).length}
          onOpenNotifications={() => setActiveModule('notifications')}
        />"""
header_new = """<Header 
          currentRole={currentRole} 
          setCurrentRole={setCurrentRole} 
          selectedWing={selectedWing} 
          setSelectedWing={setSelectedWing}
          availabilityPct={Math.round(metrics?.availabilityPct || 100)}
          unreadCount={notifications.filter(n => !n.isRead).length}
          onOpenNotifications={() => setActiveModule('notifications')}
          onOpenSimulator={() => setActiveModule('simulator')}
        />"""
content = content.replace(header_old, header_new)

# Handle Simulator Module Rendering
sim_render = """          {activeModule === 'notifications' && (
            <NotificationCenter notifications={notifications} onMarkAllRead={() => {}} onActionClick={() => {}} />
          )}"""
sim_render_new = """          {activeModule === 'notifications' && (
            <NotificationCenter notifications={notifications} onMarkAllRead={() => {}} onActionClick={() => {}} />
          )}
          {activeModule === 'simulator' && (
            <SimulatorControlCenter />
          )}"""
content = content.replace(sim_render, sim_render_new)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
