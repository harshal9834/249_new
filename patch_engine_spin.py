import re

with open('src/components/EngineDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the useFrame block
new_useframe = """  useFrame((state, delta) => {
    // Dynamic Engine RPM and Vibration Physics
    const engine = aircraft?.components.find(c => c.type === 'Engine');
    const rpm = engine?.rpm || 0;
    const vib = engine?.vibration || 0;
    
    // Engine Shaking based on Vibration
    if (scene) {
        if (vib > 1.2) {
            scene.position.x = (Math.random() - 0.5) * vib * 0.05;
            scene.position.y = (Math.random() - 0.5) * vib * 0.05;
        } else {
            scene.position.set(0,0,0);
        }
    }

    // Fan Blade Rotation based on RPM
    if (isRotating || rpm > 0) {
      scene.traverse((child: any) => {
        const name = child.name.toLowerCase();
        if (name.includes('rotor') || name.includes('fan') || name.includes('blade') || name.includes('turbine') || name.includes('shaft')) {
          // Normalize RPM (Max 15000) for visual rotation
          const speed = Math.max(0.1, (rpm / 15000) * 50);
          child.rotation.z += delta * speed;
          child.rotation.x += delta * speed;
        }
      });
    }
  });"""

content = re.sub(
    r"useFrame\(\(state, delta\) => \{[\s\S]*?\}\);\n\s*\}\);\n\s*\}\);",
    new_useframe.strip(),
    content
)

with open('src/components/EngineDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
