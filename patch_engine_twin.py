import re

with open('src/components/EngineDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useSimulatorStore import
content = content.replace("import { Canvas, useFrame } from '@react-three/fiber';", "import { Canvas, useFrame } from '@react-three/fiber';\nimport { useSimulatorStore } from '../store/simulatorStore';")

engine_model_patch = """function EngineModel({ isWireframe, isRotating, aircraftId }: { isWireframe: boolean; isRotating: boolean; aircraftId?: string }) {
  // Use a generic turbine/engine model or simple placeholder mesh if not available
  const { scene } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/jet-engine/model.gltf') as any;
  const store = useSimulatorStore();
  const ac = store.aircraftList.find(a => a.id === aircraftId) || store.aircraftList[0];
  const engine = ac?.components.find(c => c.type === 'Engine');
  
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useFrame((state, delta) => {
    if (!engine) return;
    const rpm = engine.rpm || 0;
    const vib = engine.vibration || 0;
    const temp = engine.temperature || 0;
    
    // Rotation based on real RPM (mapped to a sensible visual speed)
    const rotationSpeed = (rpm / 5000) * 10; 

    // Shaking based on real vibration
    const shake = vib > 1.2 ? (Math.random() * 0.05 * (vib - 1.2)) : 0;
    
    clonedScene.position.set(shake, shake, shake);

    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material.wireframe = isWireframe;
        
        // Heat Map Coloring based on live Engine Temperature
        if (temp > 850) {
          child.material.color.lerp(new THREE.Color(0xff0000), 0.1); // Overheat Red
        } else if (temp > 700) {
          child.material.color.lerp(new THREE.Color(0xffaa00), 0.05); // Warning Orange
        } else {
          child.material.color.lerp(new THREE.Color(0x888888), 0.1); // Normal Metal
        }

        const name = child.name.toLowerCase();
        if (name.includes('rotor') || name.includes('fan') || name.includes('blade') || name.includes('turbine')) {
          child.rotation.z += delta * rotationSpeed;
        }
      }
    });
  });

  return (
    <group scale={[2, 2, 2]}>
      <primitive object={clonedScene} />
    </group>
  );
}"""

content = re.sub(
    r"function EngineModel\(\{ isWireframe, isRotating \}: \{ isWireframe: boolean; isRotating: boolean \}\) \{[\s\S]*?return \([\s\S]*?</group>\n  \);\n\}",
    engine_model_patch,
    content
)

content = re.sub(
    r"export const EngineDigitalTwin: React\.FC<EngineDigitalTwinProps> = \(\{ engineId, onClose \}\) => \{",
    "export const EngineDigitalTwin: React.FC<EngineDigitalTwinProps> = ({ engineId, onClose }) => {\n  const store = useSimulatorStore();\n  // Assume first aircraft for now if engineId isn't perfectly mapped to aircraft\n  const ac = store.aircraftList[0];\n  const engine = ac?.components.find(c => c.type === 'Engine');",
    content
)

content = content.replace("<EngineModel isWireframe={isWireframe} isRotating={isRotating} />", "<EngineModel isWireframe={isWireframe} isRotating={isRotating} aircraftId={ac?.id} />")

with open('src/components/EngineDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
