import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("<EngineDigitalTwin aircraftTailNumber={activeAc.tailNumber} aircraft={activeAc} />", "<EngineDigitalTwin aircraftTailNumber={activeAc.tailNumber} />")
# Also check if there's any other variant
content = content.replace("<EngineDigitalTwin aircraft={activeAc} />", "<EngineDigitalTwin aircraftTailNumber={activeAc.tailNumber} />")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
