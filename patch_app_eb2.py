import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure ErrorBoundary is imported
if "import { ErrorBoundary }" not in content:
    content = content.replace("import { NotificationCenter } from './components/NotificationCenter';", "import { NotificationCenter } from './components/NotificationCenter';\nimport { ErrorBoundary } from './components/ErrorBoundary';")

# Replace components with ErrorBoundary wrappers
def wrap_multi_line_component(content, comp_name, module_name):
    pattern = r"(<" + comp_name + r"[\s\S]*?/>)"
    replacement = r'<ErrorBoundary moduleName="' + module_name + r'">\n            \1\n          </ErrorBoundary>'
    return re.sub(pattern, replacement, content)

content = wrap_multi_line_component(content, "AircraftDigitalTwin", "Aircraft 3D Twin")
content = wrap_multi_line_component(content, "EngineDigitalTwin", "Engine 3D Twin")
content = wrap_multi_line_component(content, "PredictiveMaintenance", "Predictive AI")

# For single line ones if they exist
content = re.sub(r"(<SparePartsDepot />)", r'<ErrorBoundary moduleName="Spare Parts Depot">\1</ErrorBoundary>', content)
content = re.sub(r"(<MaintenanceAnalyticsCenter />)", r'<ErrorBoundary moduleName="Maintenance Analytics">\1</ErrorBoundary>', content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
