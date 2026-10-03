import os

aircraft_code = """import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Bounds, useGLTF, Html, Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

import { 
  RotateCw, Layers, Crosshair, Radar, AlertTriangle, Activity
} from 'lucide-react';
import { Aircraft, AircraftComponent } from '../types/fleet';

interface AircraftDigitalTwinProps {
  aircraft: Aircraft;
  onSelectAnotherAircraft?: (id: string) => void;
  allAircraft: Aircraft[];
}

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

const mapFaultToMesh = (componentType: string): string[] => {
  switch(componentType) {
    case 'Engine': return ['engine', 'propeller', 'turbine', 'exhaust'];
    case 'Fuel System': return ['wing', 'tank', 'fuel'];
    case 'Hydraulic System': return ['flap', 'rudder', 'elevator', 'gear'];
    case 'Electrical System': return ['nose', 'radar', 'cockpit', 'avionics'];
    default: return [];
  }
};

function PremiumAerospaceEnvironment() {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const radarSweepRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef1.current) {
        ringRef1.current.rotation.z = t * 0.1;
    }
    if (ringRef2.current) {
        ringRef2.current.rotation.z = -t * 0.05;
    }
    if (radarSweepRef.current) {
        radarSweepRef.current.rotation.z = -t * 1.5;
    }
  });

  return (
    <>
      <color attach="background" args={['#f8fafc']} />
      <fog attach="fog" args={['#f8fafc', 5, 35]} />
      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-10, -10, -10]} intensity={1.0} color="#e0f2fe" />
      
      <Grid 
        infiniteGrid 
        fadeDistance={30} 
        sectionColor="#cbd5e1" 
        cellColor="#e2e8f0" 
        sectionSize={4} 
        cellSize={1} 
        position={[0, -2, 0]} 
      />
      
      <Sparkles count={80} scale={20} size={1.5} speed={0.1} opacity={0.2} color="#0284c7" />

      {/* Holographic Rings (Rotated to lie flat on the grid) */}
      <group position={[0, -1.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh ref={ringRef1}>
          <ringGeometry args={[8, 8.02, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={ringRef2}>
          <ringGeometry args={[12, 12.05, 64]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        {/* Radar Sweep Arc */}
        <mesh ref={radarSweepRef}>
          <circleGeometry args={[12, 32, 0, Math.PI / 4]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}

function AircraftR3FModel({ 
  isWireframe, 
  autoRotate, 
  exploded,
  aircraft,
  selectedComponent
}: { 
  isWireframe: boolean, 
  autoRotate: boolean, 
  exploded: boolean,
  aircraft: Aircraft,
  selectedComponent: AircraftComponent | null
}) {
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
    
    if (autoRotate) {
      groupRef.current.rotation.y += 0.005;
    }

    const t = state.clock.elapsedTime;
    const pulseFast = Math.sin(t * 10) * 0.5 + 0.5;
    const pulseMed = Math.sin(t * 5) * 0.5 + 0.5;

    let targetKeywords = selectedComponent ? mapFaultToMesh(selectedComponent.type) : [];
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        const name = child.name.toLowerCase();
        
        let isTarget = false;
        if (selectedComponent) {
          isTarget = targetKeywords.some(k => name.includes(k));
        }

        if (selectedComponent && isTarget) {
          mat.transparent = true;
          mat.opacity = 1.0;
          
          if (selectedComponent.status === 'Critical') {
            mat.emissive.setHex(0xff2222); 
            mat.emissiveIntensity = pulseFast * 1.5;
            mat.color.setHex(0xff4444);
          } else if (selectedComponent.status === 'Warning') {
            mat.emissive.setHex(0xffaa00);
            mat.emissiveIntensity = pulseMed * 1.0;
            mat.color.setHex(0xffaa44);
          } else {
            mat.emissive.setHex(0x0ea5e9);
            mat.emissiveIntensity = 0.5;
            mat.color.setHex(0xaaaaaa);
          }
        } else if (selectedComponent && !isTarget) {
          mat.transparent = true;
          mat.opacity = 0.15;
          mat.emissiveIntensity = 0;
          mat.color.setHex(0xa3a3a3);
        } else {
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.emissiveIntensity = 0.05;
          mat.emissive.setHex(0x94a3b8);
          mat.color.setHex(0xe2e8f0);
          
          const engine = aircraft.components.find(c => c.type === 'Engine');
          if (engine && engine.status === 'Critical' && name.includes('engine')) {
             mat.emissive.setHex(0xff2222);
             mat.emissiveIntensity = pulseFast * 1.5;
          }
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

export const AircraftDigitalTwin: React.FC<AircraftDigitalTwinProps> = ({ aircraft }) => {
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [selectedComponentName, setSelectedComponentName] = useState<string>('Airframe');

  const componentsList = aircraft.components.map(c => c.type);
  const activeComponent = aircraft.components.find(c => c.type === selectedComponentName) || null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D Viewer Column */}
        <div className="lg:col-span-2 flex flex-col rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
          
          {/* Top Controls */}
          <div className="p-3 bg-white border-b border-slate-100 flex justify-between items-center z-10">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Radar className="w-4 h-4 text-blue-600" />
                AeroPulse Digital Twin
              </h2>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setIsWireframe(!isWireframe)} className={`p-1.5 rounded transition ${isWireframe ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-400 border border-slate-200'}`} title="Blueprint Mode">
                <Crosshair className="w-4 h-4" />
              </button>
              <button onClick={() => setAutoRotate(!autoRotate)} className={`p-1.5 rounded transition ${autoRotate ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-400 border border-slate-200'}`} title="Rotate">
                <RotateCw className="w-4 h-4" />
              </button>
              <button onClick={() => setExploded(!exploded)} className={`p-1.5 rounded transition ${exploded ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-400 border border-slate-200'}`} title="Exploded View">
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-[540px] relative bg-[#f8fafc]">
            {/* Holographic Overlays */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono text-[10px] text-slate-500 space-y-1">
              <div>ALT: {Math.round(aircraft.altitude || 0)} FT</div>
              <div>SPD: {Math.round(aircraft.speed || 0)} KTS</div>
              <div>HDG: {Math.round(aircraft.heading || 0)}&deg;</div>
              <div>PCH: {Math.round(aircraft.pitchAngle || 0)}&deg;</div>
            </div>

            <Canvas camera={{ position: [20, 10, 20], fov: 45 }}>
              <Suspense fallback={<Loader />}>
                <PremiumAerospaceEnvironment />
                <Bounds fit clip observe margin={1.2}>
                  <AircraftR3FModel 
                    isWireframe={isWireframe} 
                    autoRotate={autoRotate} 
                    exploded={exploded}
                    aircraft={aircraft}
                    selectedComponent={activeComponent}
                  />
                </Bounds>
                <OrbitControls makeDefault enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 1.8} />
              </Suspense>
            </Canvas>
          </div>

          {/* Subsystem Selectors */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center overflow-x-auto space-x-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Select Component:
            </span>
            {componentsList.map(name => {
              const comp = aircraft.components.find(c => c.type === name);
              const isCrit = comp?.status === 'Critical' || comp?.status === 'Warning';
              return (
                <button
                  key={name}
                  onClick={() => setSelectedComponentName(name)}
                  className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedComponentName === name 
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isCrit 
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Sidebar - Reverted to Original White Theme */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {activeComponent?.type || selectedComponentName}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{activeComponent?.name || selectedComponentName}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Serial Number: {activeComponent?.serialNumber || 'SN-MIL-4409'}
                </p>
              </div>

              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  activeComponent?.status === 'Critical'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : activeComponent?.status === 'Warning'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {activeComponent?.status || 'Operational'}
              </span>
            </div>

            {/* Health Score & RUL Banner */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Health Score</div>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                  {activeComponent?.healthScore || 84}%
                </div>
                <div className="text-[10px] text-slate-500">Degradation: {activeComponent?.trend || 'stable'}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Remaining Useful Life</div>
                <div className="text-2xl font-bold font-mono text-blue-700 mt-0.5">
                  {activeComponent?.rulHours || 42} hrs
                </div>
                <div className="text-[10px] text-slate-500">Weibull Projected</div>
              </div>
            </div>

            {/* Real-time Component Telemetry */}
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Subsystem Sensor Telemetry</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Temperature:</span>
                  <span className={`font-mono font-bold ${(activeComponent?.temperature || 620) > 650 ? 'text-red-600' : 'text-slate-900'}`}>
                    {activeComponent?.temperature?.toFixed(1) || 620}&deg;C
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Vibration:</span>
                  <span className={`font-mono font-bold ${(activeComponent?.vibration || 2.4) > 2.0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {activeComponent?.vibration?.toFixed(2) || 2.4} IPS
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Oil Pressure:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeComponent?.oilPressure?.toFixed(1) || activeComponent?.pressure?.toFixed(1) || 48} PSI
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Fuel Flow:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeComponent?.fuelFlow?.toFixed(0) || 3850} PPH
                  </span>
                </div>
              </div>
            </div>

            {/* Trend & Diagnostic Note */}
            <div className="mt-4 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
              <div className="font-bold text-blue-900 flex items-center space-x-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Predictive Twin Diagnostic</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {activeComponent?.trend === 'critical_spike'
                  ? 'High-frequency harmonic resonance exceeds MIL-STD limits. Borescope teardown recommended within 38 flight hours.'
                  : activeComponent?.trend === 'degrading'
                  ? 'Sensor drift indicates gradual thermal barrier coating wear. Scheduled for upcoming depot phase.'
                  : 'Telemetry signatures conform within 99.4% confidence nominal envelope. No anomalies detected.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AircraftDigitalTwin;
"""

engine_code = """import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Bounds, useGLTF, Html, Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

import { RotateCw, Layers, Crosshair, Radar, AlertTriangle, Activity } from 'lucide-react';
import { Aircraft, AircraftComponent } from '../types/fleet';

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
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const radarSweepRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef1.current) {
        ringRef1.current.rotation.z = t * 0.1;
    }
    if (ringRef2.current) {
        ringRef2.current.rotation.z = -t * 0.05;
    }
    if (radarSweepRef.current) {
        radarSweepRef.current.rotation.z = -t * 1.5;
    }
  });

  return (
    <>
      <color attach="background" args={['#f8fafc']} />
      <fog attach="fog" args={['#f8fafc', 3, 25]} />
      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={1.0} color="#e0f2fe" />
      
      <Grid 
        infiniteGrid 
        fadeDistance={25} 
        sectionColor="#cbd5e1" 
        cellColor="#e2e8f0" 
        sectionSize={2} 
        cellSize={0.5} 
        position={[0, -2, 0]} 
      />
      
      <Sparkles count={50} scale={10} size={1} speed={0.1} opacity={0.2} color="#0284c7" />

      {/* Holographic Rings */}
      <group position={[0, -1.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh ref={ringRef1}>
          <ringGeometry args={[4, 4.02, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={ringRef2}>
          <ringGeometry args={[6, 6.05, 64]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={radarSweepRef}>
          <circleGeometry args={[6, 32, 0, Math.PI / 4]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}

function EngineR3FModel({ 
  isWireframe, 
  autoRotate, 
  exploded,
  engine
}: { 
  isWireframe: boolean, 
  autoRotate: boolean, 
  exploded: boolean,
  engine: AircraftComponent | null
}) {
  const { scene } = useGLTF('/models/turbofan_engine_-_animated.glb');
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
    
    if (autoRotate) {
      groupRef.current.rotation.y += 0.01;
    }
    
    const rpm = engine?.rpm || 1000;
    scene.traverse((child) => {
      if (child.name.toLowerCase().includes('blade') || child.name.toLowerCase().includes('fan') || child.name.toLowerCase().includes('rotor')) {
         child.rotation.z += (rpm / 10000) * 0.5;
      }
    });

    const t = state.clock.elapsedTime;
    const pulseFast = Math.sin(t * 10) * 0.5 + 0.5;
    const pulseMed = Math.sin(t * 5) * 0.5 + 0.5;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        const name = child.name.toLowerCase();
        
        let isFaultyComponent = false;
        if (engine && engine.status !== 'Operational') {
          if ((engine.temperature || 0) > 800 && (name.includes('combust') || name.includes('exhaust') || name.includes('turbine'))) isFaultyComponent = true;
          if ((engine.vibration || 0) > 2.0 && (name.includes('fan') || name.includes('rotor') || name.includes('blade'))) isFaultyComponent = true;
        }

        if (isFaultyComponent) {
          mat.transparent = true;
          mat.opacity = 1.0;
          
          if (engine?.status === 'Critical') {
            mat.emissive.setHex(0xff2222); 
            mat.emissiveIntensity = pulseFast * 1.5;
            mat.color.setHex(0xff4444);
          } else {
            mat.emissive.setHex(0xffaa00);
            mat.emissiveIntensity = pulseMed * 1.0;
            mat.color.setHex(0xffaa44);
          }
        } else if (engine && engine.status !== 'Operational') {
          mat.transparent = true;
          mat.opacity = 0.2;
          mat.emissiveIntensity = 0;
          mat.color.setHex(0xaaaaaa);
        } else {
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.emissiveIntensity = 0.05;
          mat.emissive.setHex(0x94a3b8);
          mat.color.setHex(0xe2e8f0);
        }

        const origPos = originalPositions.current.get(child.uuid);
        if (origPos) {
          const targetPos = origPos.clone();
          if (exploded) {
            const dir = targetPos.clone().normalize();
            targetPos.add(dir.multiplyScalar(0.5));
          }
          child.position.lerp(targetPos, 0.1);
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={2} position={[0, -1, 0]} />
    </group>
  );
}

export const EngineDigitalTwin: React.FC<{ aircraft: Aircraft, aircraftTailNumber?: string }> = ({ aircraft }) => {
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [exploded, setExploded] = useState(false);

  const engine = aircraft.components.find(c => c.type === 'Engine') || null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 flex flex-col rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="p-3 bg-white border-b border-slate-100 flex justify-between items-center z-10">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Radar className="w-4 h-4 text-blue-600" />
                Propulsion Twin
              </h2>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setIsWireframe(!isWireframe)} className={`p-1.5 rounded transition ${isWireframe ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
                <Crosshair className="w-4 h-4" />
              </button>
              <button onClick={() => setAutoRotate(!autoRotate)} className={`p-1.5 rounded transition ${autoRotate ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
                <RotateCw className="w-4 h-4" />
              </button>
              <button onClick={() => setExploded(!exploded)} className={`p-1.5 rounded transition ${exploded ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-[540px] relative bg-[#f8fafc]">
            {/* Holographic Overlays */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono text-[10px] text-slate-500 space-y-1">
              <div>RPM: {engine?.rpm?.toFixed(0) || 0}</div>
              <div>EGT: {engine?.temperature?.toFixed(1) || 0}&deg;C</div>
              <div>VIB: {engine?.vibration?.toFixed(2) || 0} IPS</div>
            </div>

            <Canvas camera={{ position: [10, 5, 10], fov: 45 }}>
              <Suspense fallback={<Loader />}>
                <PremiumAerospaceEnvironment />
                <Bounds fit clip observe margin={1.2}>
                  <EngineR3FModel isWireframe={isWireframe} autoRotate={autoRotate} exploded={exploded} engine={engine} />
                </Bounds>
                <OrbitControls makeDefault enablePan={true} enableZoom={true} />
              </Suspense>
            </Canvas>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  TURBOFAN ENGINE
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{engine?.name || 'F-135 Engine'}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {engine?.serialNumber}
                </p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold font-mono uppercase border ${
                engine?.status === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' :
                engine?.status === 'Warning' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}>
                {engine?.status || 'Operational'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400">EGT (Temp)</div>
                <div className={`text-2xl font-bold font-mono mt-0.5 ${(engine?.temperature||0) > 800 ? 'text-red-600' : 'text-slate-900'}`}>
                  {engine?.temperature?.toFixed(1) || 0}&deg;C
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Vibration</div>
                <div className={`text-2xl font-bold font-mono mt-0.5 ${(engine?.vibration||0) > 2.0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {engine?.vibration?.toFixed(2) || 0} IPS
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Thermodynamics</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">RPM</span>
                  <span className="text-slate-900 font-mono font-bold">{engine?.rpm?.toFixed(0) || 0}</span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">FUEL FLOW</span>
                  <span className="text-slate-900 font-mono font-bold">{engine?.fuelFlow?.toFixed(0) || 0} PPH</span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">OIL PRESSURE</span>
                  <span className={(engine?.oilPressure||0) < 30 ? 'text-red-600 font-mono font-bold' : 'text-slate-900 font-mono font-bold'}>
                    {engine?.oilPressure?.toFixed(1) || 0} PSI
                  </span>
                </div>
              </div>
            </div>
            
            {(engine?.status === 'Critical' || engine?.status === 'Warning') && (
              <div className="mt-4 p-3 rounded-lg bg-red-50/80 border border-red-200 text-xs">
                <div className="font-bold text-red-700 flex items-center space-x-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>CRITICAL ANOMALY DETECTED</span>
                </div>
                <p className="text-red-600 leading-relaxed text-[11px]">
                  Abnormal telemetry signatures isolated to {engine?.temperature && engine.temperature > 800 ? 'Combustion Section (Thermal Overload)' : 'Rotor Assembly (Harmonic Resonance)'}. Immediate grounding recommended.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EngineDigitalTwin;
"""

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(aircraft_code)

with open('src/components/EngineDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(engine_code)
