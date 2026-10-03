import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for ErrorBoundary
content = content.replace("import { NotificationCenter } from './components/NotificationCenter';", "import { NotificationCenter } from './components/NotificationCenter';\nimport { ErrorBoundary } from './components/ErrorBoundary';")

# Wrap AircraftDigitalTwin
content = content.replace("<AircraftDigitalTwin", "<ErrorBoundary moduleName=\"Aircraft 3D Twin\"><AircraftDigitalTwin")
content = content.replace("allAircraft={store.aircraftList}\n            />", "allAircraft={store.aircraftList}\n            /></ErrorBoundary>")

# Wrap EngineDigitalTwin
content = content.replace("<EngineDigitalTwin", "<ErrorBoundary moduleName=\"Engine 3D Twin\"><EngineDigitalTwin")
content = content.replace("aircraft={activeAircraft}\n            />", "aircraft={activeAircraft}\n            /></ErrorBoundary>")

# Wrap PredictiveMaintenance (just in case)
content = content.replace("<PredictiveMaintenance", "<ErrorBoundary moduleName=\"Predictive AI\"><PredictiveMaintenance")
content = content.replace("setActiveModule('ai-copilot');\n              }}\n            />", "setActiveModule('ai-copilot');\n              }}\n            /></ErrorBoundary>")

# Wrap SparePartsManagement / SparePartsDepot
# Wait, the component is SparePartsManagement in App.tsx? Let's check what it's named in App.tsx
with open('patch_app_eb.py', 'w', encoding='utf-8') as f:
    f.write('''import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if "import { ErrorBoundary }" not in content:
    content = content.replace("import { NotificationCenter } from './components/NotificationCenter';", "import { NotificationCenter } from './components/NotificationCenter';\\nimport { ErrorBoundary } from './components/ErrorBoundary';")

# Replace components with ErrorBoundary wrappers
def wrap_component(content, comp_name, module_name):
    pattern = r"(<" + comp_name + r"[^>]*?/>)"
    replacement = r'<ErrorBoundary moduleName="' + module_name + r'">\\1</ErrorBoundary>'
    return re.sub(pattern, replacement, content)

content = wrap_component(content, "AircraftDigitalTwin", "Aircraft 3D Twin")
content = wrap_component(content, "EngineDigitalTwin", "Engine 3D Twin")
content = wrap_component(content, "PredictiveMaintenance", "Predictive AI")
content = wrap_component(content, "SparePartsManagement", "Spare Parts Depot")
content = wrap_component(content, "MaintenanceAnalyticsCenter", "Maintenance Analytics")
content = wrap_component(content, "FleetAnalytics", "Fleet Analytics")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
''')
