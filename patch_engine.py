import re

with open('src/components/EngineDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports at the top
imports = """import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Center, Bounds, useGLTF, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
"""
content = re.sub(r'import React.*?from \'react\';\nimport \* as THREE from \'three\';', imports, content, count=1, flags=re.DOTALL)

# 2. Add Loader and EngineR3FModel components
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

function EngineR3FModel({ isWireframe, isRotating }: { isWireframe: boolean, isRotating: boolean }) {
  const { scene } = useGLTF('/models/turbine_turbofan_jet_engine.glb');

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

  useFrame((state, delta) => {
    if (isRotating) {
      scene.traverse((child) => {
        const name = child.name.toLowerCase();
        if (name.includes('rotor') || name.includes('fan') || name.includes('blade') || name.includes('turbine') || name.includes('shaft')) {
          // Adjust rotation axis based on typical orientation. Usually Z or X for engines.
          child.rotation.z += delta * 2;
          child.rotation.x += delta * 2;
        }
      });
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />
      <OrbitControls makeDefault enablePan enableZoom enableRotate />
      <Environment preset="studio" />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <Bounds fit clip margin={1.2}>
        <Center>
          <primitive object={scene} />
        </Center>
      </Bounds>
    </>
  );
}
"""
content = content.replace("export const EngineDigitalTwin: React.FC<EngineDigitalTwinProps> = ({", r3f_components + "\nexport const EngineDigitalTwin: React.FC<EngineDigitalTwinProps> = ({")

# 3. Remove raw Three.js refs and useEffects
# We need to remove from `const sceneRef = useRef` to just before `const stages:`
start_refs = "const sceneRef = useRef<THREE.Scene | null>(null);"
end_refs = "const stages: EngineStageData[] = ["
start_idx = content.find(start_refs)
end_idx = content.find(end_refs)
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]

# We need to remove from `useEffect(() => {` down to `return (\n    <div className="space-y-6">`
# To do this safely, we will find `const currentStage = stages.find(s => s.id === selectedStageId) || stages[0];`
# and `return (` before `<div className="space-y-6">`.
start_ue = content.find("useEffect(() => {\n    if (!containerRef.current) return;")
end_ue = content.find("  return (\n    <div className=\"space-y-6\">")
if start_ue != -1 and end_ue != -1:
    content = content[:start_ue] + content[end_ue:]

# 4. Replace container div with Canvas
old_container = """<div ref={containerRef} className="w-full h-[520px] cursor-grab active:cursor-grabbing" />"""
new_container = """<div className="w-full h-[520px] cursor-grab active:cursor-grabbing relative bg-[#f8fafc]">
            <Canvas>
              <Suspense fallback={<Loader />}>
                <EngineR3FModel isWireframe={isWireframe} isRotating={isRotating} />
              </Suspense>
            </Canvas>
          </div>"""
content = content.replace(old_container, new_container)

with open('src/components/EngineDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
