import re

with open('src/components/AircraftDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports at the top
imports = """import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Center, Bounds, useGLTF, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
"""
content = re.sub(r'import React.*?from \'react\';\nimport \* as THREE from \'three\';', imports, content, count=1, flags=re.DOTALL)

# 2. Add Loader and AircraftR3FModel components
r3f_components = """
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-200 min-w-[120px]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

function AircraftR3FModel({ isWireframe, autoRotate, resetToken }: { isWireframe: boolean, autoRotate: boolean, resetToken: number }) {
  const { scene } = useGLTF('/models/lockheed_martin_c130jsuper_hercules_reupload.glb');
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.wireframe = isWireframe);
          } else {
            (mesh.material as THREE.Material).wireframe = isWireframe;
          }
        }
      }
    });
  }, [isWireframe, scene]);

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
# Insert before export const AircraftDigitalTwin
content = content.replace("export const AircraftDigitalTwin: React.FC<AircraftDigitalTwinProps> = ({", r3f_components + "\nexport const AircraftDigitalTwin: React.FC<AircraftDigitalTwinProps> = ({")

# 3. Replace the huge useEffect block and refs inside AircraftDigitalTwin
start_str = "const sceneRef = useRef<THREE.Scene | null>(null);"
end_str = "const componentsList = ["

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    replacement = """const [resetToken, setResetToken] = useState(0);
  
  """
    content = content[:start_idx] + replacement + content[end_idx:]
else:
    print("Could not find boundaries for removal!")

# 4. Replace resetView
old_reset = """  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(16, 9, 18);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };"""
new_reset = """  const resetView = () => {
    setResetToken(prev => prev + 1);
  };"""
content = content.replace(old_reset, new_reset)

# 5. Replace the 3D container
old_container = """<div ref={containerRef} className="w-full h-[540px] cursor-grab active:cursor-grabbing relative" />"""
new_container = """<div className="w-full h-[540px] cursor-grab active:cursor-grabbing relative bg-[#f8fafc]">
            <Canvas>
              <Suspense fallback={<Loader />}>
                <AircraftR3FModel isWireframe={isWireframe} autoRotate={autoRotate} resetToken={resetToken} />
              </Suspense>
            </Canvas>
          </div>"""
content = content.replace(old_container, new_container)

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
