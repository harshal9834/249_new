import re

for filename in ['src/components/AircraftDigitalTwin.tsx', 'src/components/EngineDigitalTwin.tsx']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace("m => m.clone()", "(m: any) => m.clone()")
    content = content.replace("m => m.wireframe", "(m: any) => m.wireframe")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
