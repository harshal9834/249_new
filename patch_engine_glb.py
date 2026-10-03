import re

with open('src/components/EngineDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_replacement = """import React, { useEffect, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Bounds, useGLTF, Html, Grid, Sparkles } from '@react-three/drei';
"""
content = re.sub(r"import React, \{ useEffect, useRef, useState \} from 'react';\nimport \* as THREE from 'three';", import_replacement, content)

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

function EngineR3FModel({ isWireframe, autoRotate, selectedStageId }: any) {
  const { scene } = useGLTF('/models/turbofan_engine_-_animated.glb');
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = child.material.clone();
        child.material.wireframe = isWireframe;
      }
    });
  }, [scene, isWireframe]);

  useFrame(() => {
    if (!groupRef.current) return;
    if (autoRotate) groupRef.current.rotation.y += 0.01;
    
    const rpm = 1000;
    scene.traverse((child) => {
      if (child.name.toLowerCase().includes('blade') || child.name.toLowerCase().includes('fan') || child.name.toLowerCase().includes('rotor')) {
         child.rotation.z += (rpm / 10000) * 0.5;
      }
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={2} position={[0, -1, 0]} />
    </group>
  );
}

export const EngineDigitalTwin
"""
content = content.replace("export const EngineDigitalTwin", r3f_components)

# Remove the raw Three.js initialization inside useEffect
content = re.sub(r"  // References for Three\.js[\s\S]*?rendererRef\.current\.setSize\(w, h\);\n    };\n    window\.addEventListener\('resize', handleResize\);\n", "", content)
content = re.sub(r"    return \(\) => \{[\s\S]*?renderer\.dispose\(\);\n    \};\n  \}, \[\]\);\n\n  // Update materials when selectedStage changes[\s\S]*?cameraRef\.current\.lookAt\(0, 0, 0\);\n    }\n  \};\n", "", content)

# Remove unused variables and functions
content = content.replace("  const containerRef = useRef<HTMLDivElement>(null);", "")
content = content.replace("  const resetView = () => {", "  const resetView = () => {};\n  // ")

# Replace canvas container div with R3F Canvas
r3f_canvas = """          {/* 3D Three.js Container */}
          <div className="w-full h-[500px] cursor-grab active:cursor-grabbing relative bg-white">
            <Canvas camera={{ position: [10, 5, 10], fov: 45 }}>
              <Suspense fallback={<Loader />}>
                <PremiumAerospaceEnvironment />
                <Bounds fit clip observe margin={1.2}>
                  <EngineR3FModel 
                    isWireframe={isWireframe} 
                    autoRotate={isRotating} 
                    selectedStageId={selectedStageId}
                  />
                </Bounds>
                <OrbitControls makeDefault enablePan={true} enableZoom={true} />
              </Suspense>
            </Canvas>
          </div>"""
content = re.sub(r"          \{\/\* 3D Three\.js Container \*\/\}[\s\S]*?<div ref=\{containerRef\}.*?/>", r3f_canvas, content)

with open('src/components/EngineDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
