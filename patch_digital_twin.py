import re

with open('src/components/AircraftDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure useFrame is imported
if 'useFrame' not in content:
    content = content.replace("useGLTF, Html, useProgress }", "useGLTF, Html, useProgress, useFrame }")
elif 'useFrame' in content and 'useFrame }' not in content:
    # It might be imported differently, let's assume it's in the same @react-three/fiber import
    content = content.replace("import { Canvas }", "import { Canvas, useFrame }")

r3f_logic = """function AircraftR3FModel({ isWireframe, autoRotate, resetToken, aircraft }: { isWireframe: boolean, autoRotate: boolean, resetToken: number, aircraft: Aircraft }) {
  const { scene } = useGLTF('/models/lockheed_martin_c130jsuper_hercules_reupload.glb');
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    const engine = aircraft.components.find(c => c.type === 'Engine');
    const vib = engine?.vibration || 0;
    
    if (scene) {
      if (vib > 1.2) {
         scene.position.x = (Math.random() - 0.5) * vib * 0.02;
         scene.position.y = (Math.random() - 0.5) * vib * 0.02;
         scene.position.z = (Math.random() - 0.5) * vib * 0.02;
      } else {
         scene.position.set(0, 0, 0);
      }
    }
  });

  useEffect(() => {
    const engine = aircraft.components.find(c => c.type === 'Engine');
    const temp = engine?.temperature || 0;
    const health = engine?.healthScore || 100;

    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material.wireframe = isWireframe;
        // React to temperature/health telemetry
        if (temp > 850 || health < 50) {
            child.material.color.setHex(0xff8888); // Red tint for overheating/critical
        } else if (temp > 700 || health < 80) {
            child.material.color.setHex(0xffdd88); // Amber tint
        } else {
            child.material.color.setHex(0xffffff); // Normal
        }
      }
    });
  }, [scene, isWireframe, aircraft]);
"""

content = re.sub(
    r"function AircraftR3FModel[\s\S]*?useEffect\(\(\) => \{[\s\S]*?\}\);\n\s*\}\);\n\s*\}, \[scene, isWireframe, aircraft\]\);",
    r3f_logic,
    content
)

# Just in case the regex fails because of different formatting, I will use a broader regex or just replace the whole function
# Actually, I'll just write a script to rewrite `AircraftR3FModel` completely

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
