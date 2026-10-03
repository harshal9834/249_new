import re

with open('src/components/AircraftDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the import
content = content.replace("import { Canvas } from '@react-three/fiber';", "import { Canvas, useFrame } from '@react-three/fiber';")
content = content.replace("useProgress, useFrame } from '@react-three/drei';", "useProgress } from '@react-three/drei';")

# Re-apply the R3F Model replace if it didn't hit
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
        if (temp > 850 || health < 50) {
            child.material.color.setHex(0xff8888); 
        } else if (temp > 700 || health < 80) {
            child.material.color.setHex(0xffdd88); 
        } else {
            child.material.color.setHex(0xffffff); 
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

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
