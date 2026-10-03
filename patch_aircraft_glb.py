import re

with open('src/components/AircraftDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add R3F Imports
import_replacement = """import React, { useEffect, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Bounds, useGLTF, Html, Grid, Sparkles } from '@react-three/drei';
"""
content = re.sub(r"import React, \{ useEffect, useRef, useState \} from 'react';\nimport \* as THREE from 'three';", import_replacement, content)

# 2. Add R3F Components (Loader, Env, Model) BEFORE AircraftDigitalTwin export
r3f_components = """
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-200 min-w-[120px]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Loading...</p>
      </div>
    </Html>
  );
}

function PremiumAerospaceEnvironment() {
  return (
    <>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-10, -10, -10]} intensity={1.0} color="#e0f2fe" />
      <Grid infiniteGrid fadeDistance={30} sectionColor="#cbd5e1" cellColor="#e2e8f0" sectionSize={4} cellSize={1} position={[0, -2, 0]} />
      <Sparkles count={80} scale={20} size={1.5} speed={0.1} opacity={0.2} color="#0284c7" />
    </>
  );
}

function AircraftR3FModel({ isWireframe, autoRotate, exploded, aircraft, selectedComponent }: any) {
  const { scene } = useGLTF('/models/lockheed_martin_c130jsuper_hercules_reupload.glb');
  const groupRef = useRef<THREE.Group>(null);
  const originalPositions = useRef<Map<string, THREE.Vector3>>(new Map());

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (!originalPositions.current.has(child.uuid)) {
          originalPositions.current.set(child.uuid, child.position.clone());
        }
        child.material = child.material.clone();
        child.material.wireframe = isWireframe;
      }
    });
  }, [scene, isWireframe]);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (autoRotate) groupRef.current.rotation.y += 0.005;
    
    const t = state.clock.elapsedTime;
    const pulseFast = Math.sin(t * 10) * 0.5 + 0.5;

    let targetKeywords = selectedComponent ? [selectedComponent.type.toLowerCase(), 'engine', 'fuel', 'wing'] : [];
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        const name = child.name.toLowerCase();
        
        let isTarget = false;
        if (selectedComponent) {
          isTarget = targetKeywords.some(k => name.includes(k));
        }

        if (selectedComponent && isTarget) {
          mat.transparent = true; mat.opacity = 1.0;
          if (selectedComponent.status === 'Critical') {
            mat.emissive.setHex(0xff2222); mat.emissiveIntensity = pulseFast * 1.5; mat.color.setHex(0xff4444);
          } else {
            mat.emissive.setHex(0x0ea5e9); mat.emissiveIntensity = 0.5; mat.color.setHex(0xaaaaaa);
          }
        } else if (selectedComponent && !isTarget) {
          mat.transparent = true; mat.opacity = 0.15; mat.emissiveIntensity = 0; mat.color.setHex(0xa3a3a3);
        } else {
          mat.transparent = false; mat.opacity = 1.0; mat.emissiveIntensity = 0.05;
          mat.emissive.setHex(0x94a3b8); mat.color.setHex(0xe2e8f0);
        }

        const origPos = originalPositions.current.get(child.uuid);
        if (origPos) {
          const targetPos = origPos.clone();
          if (exploded) {
            const dir = targetPos.clone().normalize();
            targetPos.add(dir.multiplyScalar(5));
          }
          child.position.lerp(targetPos, 0.1);
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.5} position={[0, -2, 0]} />
    </group>
  );
}

export const AircraftDigitalTwin
"""
content = content.replace("export const AircraftDigitalTwin", r3f_components)

# 3. Remove the massive useEffect that builds the raw Three.js scene
content = re.sub(r"  // References for Three\.js[\s\S]*?    // Update component highlighting and exploded view[\s\S]*?cameraRef\.current\.lookAt\(0, 0, 0\);\n      \}\n    \};\n", "", content)

# 4. Remove variables from the main component that are no longer needed
content = content.replace("  const containerRef = useRef<HTMLDivElement>(null);", "")
content = content.replace("  const resetView = () => {", "  const resetView = () => {};\n  // ")

# 5. Replace the canvas container div with the R3F Canvas
r3f_canvas = """          {/* 3D Three.js Container */}
          <div className="w-full h-[540px] cursor-grab active:cursor-grabbing relative bg-white">
            <Canvas camera={{ position: [20, 10, 20], fov: 45 }}>
              <Suspense fallback={<Loader />}>
                <PremiumAerospaceEnvironment />
                <Bounds fit clip observe margin={1.2}>
                  <AircraftR3FModel 
                    isWireframe={isWireframe} 
                    autoRotate={autoRotate} 
                    exploded={isExploded}
                    aircraft={aircraft}
                    selectedComponent={activeComponent}
                  />
                </Bounds>
                <OrbitControls makeDefault enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 1.8} />
              </Suspense>
            </Canvas>
          </div>"""
content = re.sub(r"          \{\/\* 3D Three\.js Container \*\/\}[\s\S]*?<div ref=\{containerRef\}.*?/>", r3f_canvas, content)

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
