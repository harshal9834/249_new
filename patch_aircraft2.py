import re

with open('src/components/AircraftDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to change the coloring logic in AircraftR3FModel. But wait, AircraftR3FModel only receives `isWireframe` right now!
# The user wants the 3D model itself to react to health.
# `AircraftR3FModel` should receive the `aircraft` object and change materials based on component health!

# Let's replace the AircraftR3FModel component entirely.
start_str = "function AircraftR3FModel"
end_str = "export const AircraftDigitalTwin:"
start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_model = """function AircraftR3FModel({ isWireframe, autoRotate, resetToken, aircraft }: { isWireframe: boolean, autoRotate: boolean, resetToken: number, aircraft: Aircraft }) {
  const { scene } = useGLTF('/models/lockheed_martin_c130jsuper_hercules_reupload.glb');
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // Map GLTF nodes to our component types if possible, or just color everything generically for demo
    // The prompt says "Engine component becomes red... Hydraulic section warning". 
    // Without exact mesh names, we can try to guess by mesh names in the GLB.
    
    // Helper to get component health
    const getHealth = (type: string) => {
        const comp = aircraft.components.find(c => c.type.toLowerCase().includes(type.toLowerCase()));
        return comp ? comp.healthScore : 100;
    };

    const engineHealth = getHealth('Engine');
    const fuelHealth = getHealth('Fuel');
    const hydHealth = getHealth('Hydraulic');
    const avionicsHealth = getHealth('Avionics');
    const gearHealth = getHealth('Landing');
    
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        
        let targetColor: THREE.Color | null = null;
        
        if ((name.includes('engine') || name.includes('prop')) && engineHealth < 40) {
            targetColor = new THREE.Color(0xff0000); // Red
        } else if ((name.includes('fuel') || name.includes('tank') || name.includes('wing')) && fuelHealth < 50) {
            targetColor = new THREE.Color(0xf59e0b); // Amber/Warning
        } else if ((name.includes('gear') || name.includes('wheel') || name.includes('tire')) && gearHealth < 50) {
            targetColor = new THREE.Color(0xf59e0b);
        } else if ((name.includes('hyd') || name.includes('actuator')) && hydHealth < 50) {
            targetColor = new THREE.Color(0xf59e0b);
        } else if ((name.includes('radome') || name.includes('antenna') || name.includes('glass') || name.includes('cockpit')) && avionicsHealth < 50) {
            targetColor = new THREE.Color(0xf59e0b);
        }
        
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => {
                m.wireframe = isWireframe;
                if (targetColor) {
                    (m as any).emissive = targetColor;
                    (m as any).emissiveIntensity = 0.5;
                } else {
                    (m as any).emissive = new THREE.Color(0x000000);
                    (m as any).emissiveIntensity = 0;
                }
            });
          } else {
            (mesh.material as THREE.Material).wireframe = isWireframe;
            if (targetColor) {
                (mesh.material as any).emissive = targetColor;
                (mesh.material as any).emissiveIntensity = 0.5;
            } else {
                (mesh.material as any).emissive = new THREE.Color(0x000000);
                (mesh.material as any).emissiveIntensity = 0;
            }
          }
        }
      }
    });
  }, [isWireframe, scene, aircraft]);

  useEffect(() => {
    if (resetToken > 0 && controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetToken]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[12, 6, 12]} fov={50} />
      <OrbitControls ref={controlsRef} makeDefault enablePan enableZoom enableRotate autoRotate={autoRotate} autoRotateSpeed={0.5} />
      <Environment preset="city" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
      <Bounds fit clip margin={1.2}>
        <Center>
          <primitive object={scene} />
        </Center>
      </Bounds>
    </>
  );
}
"""
    content = content[:start_idx] + new_model + content[end_idx:]

# Also update the render call to pass `aircraft`
render_call = """<AircraftR3FModel isWireframe={isWireframe} autoRotate={autoRotate} resetToken={resetToken} />"""
new_render_call = """<AircraftR3FModel isWireframe={isWireframe} autoRotate={autoRotate} resetToken={resetToken} aircraft={aircraft} />"""
content = content.replace(render_call, new_render_call)

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
