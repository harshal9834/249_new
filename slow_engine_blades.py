import re

with open('src/components/EngineDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Slow down the blade/turbine spinning (was * 0.8, changing to * 0.03 for a smooth, readable spin)
content = content.replace("child.rotation.z += (rpm / 10000) * 0.8;", "child.rotation.z += (rpm / 10000) * 0.03;")

# Slow down the outer orbit just a tiny bit more to be safe
content = content.replace("groupRef.current.rotation.y += 0.001;", "groupRef.current.rotation.y += 0.0005;")

with open('src/components/EngineDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
