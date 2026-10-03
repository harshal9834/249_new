import re

# 1. Patch Navigation.tsx
with open('src/components/Navigation.tsx', 'r', encoding='utf-8') as f:
    nav_content = f.read()

nav_content = nav_content.replace(
    "{ id: 'maintenance-planner', label: 'Planner & Depot', icon: CalendarClock },",
    "{ id: 'maintenance-planner', label: 'Technical Records', icon: CalendarClock },"
)

nav_content = nav_content.replace(
    "{ id: 'fleet-analytics', label: 'Fleet Analytics', icon: BarChart3 },",
    "{ id: 'fleet-analytics', label: 'Maintenance Analytics', icon: BarChart3 },"
)

nav_content = nav_content.replace(
    "{ id: 'spare-parts', label: 'Spare Parts', icon: Package },",
    "{ id: 'spare-parts', label: 'Spare Parts Depot', icon: Package },"
)

with open('src/components/Navigation.tsx', 'w', encoding='utf-8') as f:
    f.write(nav_content)

# 2. Patch App.tsx
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Add imports for new components
imports_old = "import { SimulatorControlCenter } from './components/SimulatorControlCenter';"
imports_new = """import { SimulatorControlCenter } from './components/SimulatorControlCenter';
import { MaintenanceAnalyticsCenter } from './components/MaintenanceAnalyticsCenter';
import { TechnicalRecords } from './components/TechnicalRecords';
import { SparePartsDepot } from './components/SparePartsDepot';"""
app_content = app_content.replace(imports_old, imports_new)

# Replace the rendering logic for these modules
old_analytics = """        {activeModule === 'fleet-analytics' && (
          <div className="p-8 text-center text-slate-500">Fleet Analytics Module - Coming Soon</div>
        )}"""
new_analytics = """        {activeModule === 'fleet-analytics' && (
          <MaintenanceAnalyticsCenter />
        )}"""
if old_analytics in app_content:
    app_content = app_content.replace(old_analytics, new_analytics)
else:
    app_content = app_content.replace(
        "        {activeModule === 'fleet-analytics'", 
        "        {activeModule === 'fleet-analytics' && <MaintenanceAnalyticsCenter />}\n        {false"
    )

old_spares = """        {activeModule === 'spare-parts' && (
          <SparePartsManagement inventory={inventory} onRestock={() => {}} />
        )}"""
new_spares = """        {activeModule === 'spare-parts' && (
          <SparePartsDepot />
        )}"""
if old_spares in app_content:
    app_content = app_content.replace(old_spares, new_spares)
else:
    app_content = app_content.replace(
        "<SparePartsManagement inventory={inventory} onRestock={() => {}} />",
        "<SparePartsDepot />"
    )

old_planner = """        {activeModule === 'maintenance-planner' && (
          <MaintenancePlanner
            schedules={schedules}
            onAddSchedule={handleAddSchedule}
            onUpdateScheduleStatus={handleUpdateScheduleStatus}
          />
        )}"""
new_planner = """        {activeModule === 'maintenance-planner' && (
          <TechnicalRecords />
        )}"""
if old_planner in app_content:
    app_content = app_content.replace(old_planner, new_planner)
else:
    app_content = app_content.replace(
        "          <MaintenancePlanner", 
        "          <TechnicalRecords />\n          {/*"
    ).replace(
        "            onUpdateScheduleStatus={handleUpdateScheduleStatus}\n          />",
        "          */}"
    )

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)
