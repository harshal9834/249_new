import re

with open('src/components/EngineDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("export const EngineDigitalTwin: React.FC<{ aircraft: Aircraft }> = ({ aircraft }) => {", "export const EngineDigitalTwin: React.FC<{ aircraft: Aircraft, aircraftTailNumber?: string }> = ({ aircraft, aircraftTailNumber }) => {")

with open('src/components/EngineDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
