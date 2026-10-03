import re

with open('src/components/SimulatorControlCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Change the interval to 100ms
content = re.sub(
    r"interval = setInterval\(\(\) => \{\n\s*store\.tickSimulation\(\);\n\s*\}, 2000\);",
    "interval = setInterval(() => {\n          store.tickSimulation();\n        }, 100);",
    content
)

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
