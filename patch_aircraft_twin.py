import re

with open('src/components/AircraftDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useSimulatorStore import
content = content.replace("import { Canvas, useFrame } from '@react-three/fiber';", "import { Canvas, useFrame } from '@react-three/fiber';\nimport { useSimulatorStore } from '../store/simulatorStore';")

# Add telemetry to AircraftModel
aircraft_model_patch = """function AircraftModel({ isWireframe, aircraftId }: { isWireframe: boolean, aircraftId?: string }) {
  const { scene } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/airplane/model.gltf') as any;
  const store = useSimulatorStore();
  const ac = store.aircraftList.find(a => a.id === aircraftId) || store.aircraftList[0];
  const engine = ac?.components.find(c => c.type === 'Engine');
  
  // Clone the scene so we can mutate materials safely
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useFrame((state, delta) => {
    if (!ac) return;
    
    // React to Pitch, Roll, Yaw
    clonedScene.rotation.x = THREE.MathUtils.lerp(clonedScene.rotation.x, (ac.pitchAngle || 0) * (Math.PI / 180), 0.1);
    clonedScene.rotation.z = THREE.MathUtils.lerp(clonedScene.rotation.z, -(ac.bankAngle || 0) * (Math.PI / 180), 0.1);
    
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material.wireframe = isWireframe;
        
        // React to overall health
        if (ac.healthScore < 50) {
          child.material.color.lerp(new THREE.Color(0xffaa00), 0.05);
        } else if (ac.healthScore < 30) {
          child.material.color.lerp(new THREE.Color(0xff0000), 0.1);
        } else {
          child.material.color.lerp(new THREE.Color(0xffffff), 0.1);
        }
      }
    });
  });

  return (
    <group position={[0, -1, 0]} scale={[0.5, 0.5, 0.5]}>
      <primitive object={clonedScene} />
    </group>
  );
}"""

content = re.sub(
    r"function AircraftModel\(\{ isWireframe \}: \{ isWireframe: boolean \}\) \{[\s\S]*?return \([\s\S]*?</group>\n  \);\n\}",
    aircraft_model_patch,
    content
)

# Update AircraftDigitalTwin to pass aircraftId
content = re.sub(
    r"export const AircraftDigitalTwin: React\.FC<AircraftDigitalTwinProps> = \(\{ aircraftId, onClose \}\) => \{",
    "export const AircraftDigitalTwin: React.FC<AircraftDigitalTwinProps> = ({ aircraftId, onClose }) => {\n  const store = useSimulatorStore();\n  const ac = store.aircraftList.find(a => a.id === aircraftId) || store.aircraftList[0];\n  const engine = ac?.components.find(c => c.type === 'Engine');",
    content
)

content = content.replace("<AircraftModel isWireframe={isWireframe} />", "<AircraftModel isWireframe={isWireframe} aircraftId={ac?.id} />")

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
