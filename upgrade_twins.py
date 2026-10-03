import urllib.request
import os

aircraft_code = """import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSimulatorStore } from '../store/simulatorStore';
import { OrbitControls, Environment, PerspectiveCamera, Center, Bounds, useGLTF, Html, Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

import { 
  RotateCw, Layers, Activity, AlertTriangle, CheckCircle2, ShieldAlert, 
  Crosshair, Plane, Radar, RefreshCw, ZoomIn
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
      <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur rounded-lg shadow-sm border border-cyan-500/30 min-w-[150px]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">INITIALIZING...</p>
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
    
    // Auto-rotate
    if (autoRotate) {
      groupRef.current.rotation.y += 0.005;
    }

    const t = state.clock.elapsedTime;
    const pulseFast = Math.sin(t * 10) * 0.5 + 0.5;
    const pulseMed = Math.sin(t * 5) * 0.5 + 0.5;
    const pulseSlow = Math.sin(t * 2) * 0.5 + 0.5;

    let targetKeywords = selectedComponent ? mapFaultToMesh(selectedComponent.type) : [];
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        const name = child.name.toLowerCase();
        
        let isTarget = false;
        if (selectedComponent) {
          isTarget = targetKeywords.some(k => name.includes(k));
        }

        // --- Fault Visuals ---
        if (selectedComponent && isTarget) {
          mat.transparent = true;
          mat.opacity = 1.0;
          mat.emissiveIntensity = 2;
          
          if (selectedComponent.status === 'Critical') {
            mat.emissive.setHex(0xff0000); // Red
            mat.emissiveIntensity = pulseFast * 3;
            mat.color.setHex(0xff4444);
          } else if (selectedComponent.status === 'Warning') {
            mat.emissive.setHex(0xff8800); // Orange
            mat.emissiveIntensity = pulseMed * 2;
            mat.color.setHex(0xffaa44);
          } else {
            mat.emissive.setHex(0x00ff88); // Green
            mat.emissiveIntensity = 0.5;
            mat.color.setHex(0xaaaaaa);
          }
        } else if (selectedComponent && !isTarget) {
          // Dim non-affected
          mat.transparent = true;
          mat.opacity = 0.2;
          mat.emissiveIntensity = 0;
          mat.color.setHex(0x333333);
        } else {
          // Default state
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.emissiveIntensity = 0.1;
          mat.emissive.setHex(0x112233);
          
          // Check for any general faults
          const engine = aircraft.components.find(c => c.type === 'Engine');
          if (engine && engine.status === 'Critical' && name.includes('engine')) {
             mat.emissive.setHex(0xff0000);
             mat.emissiveIntensity = pulseFast * 2;
          }
        }

        // --- Exploded View ---
        const origPos = originalPositions.current.get(child.uuid);
        if (origPos) {
          const targetPos = origPos.clone();
          if (exploded) {
            // Push outwards based on bounding box center or simple radial push
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

function DefenseEnvironment() {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 10, 50]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#06b6d4" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#3b82f6" />
      <Grid 
        infiniteGrid 
        fadeDistance={50} 
        sectionColor="#06b6d4" 
        cellColor="#1e293b" 
        sectionSize={5} 
        cellSize={1} 
        position={[0, -4, 0]} 
      />
      <Sparkles count={200} scale={20} size={1.5} speed={0.4} opacity={0.3} color="#06b6d4" />
    </>
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
    <div className="w-full bg-slate-900 text-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D Viewer Column */}
        <div className="lg:col-span-2 flex flex-col h-[700px] border border-cyan-900/50 rounded-lg overflow-hidden relative shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          
          {/* Top HUD */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
            <div>
              <h2 className="text-xl font-bold font-mono text-cyan-400 tracking-wider flex items-center gap-2 drop-shadow-md">
                <Radar className="w-5 h-5 animate-pulse" />
                TACTICAL DIGITAL TWIN
              </h2>
              <p className="text-xs text-cyan-600 font-mono mt-1">MIL-STD-1553 DATALINK ACTIVE</p>
            </div>
            
            <div className="pointer-events-auto flex space-x-2 bg-slate-800/80 p-2 rounded backdrop-blur border border-slate-700">
              <button onClick={() => setIsWireframe(!isWireframe)} className={`p-1.5 rounded transition ${isWireframe ? 'bg-cyan-600/30 text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`} title="X-Ray">
                <Crosshair className="w-4 h-4" />
              </button>
              <button onClick={() => setAutoRotate(!autoRotate)} className={`p-1.5 rounded transition ${autoRotate ? 'bg-cyan-600/30 text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`} title="Rotate">
                <RotateCw className="w-4 h-4" />
              </button>
              <button onClick={() => setExploded(!exploded)} className={`p-1.5 rounded transition ${exploded ? 'bg-cyan-600/30 text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`} title="Exploded View">
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Holographic Overlays */}
          <div className="absolute bottom-16 left-4 z-10 pointer-events-none font-mono text-[10px] text-cyan-500/80 space-y-1">
            <div>ALT: {Math.round(aircraft.altitude || 0)} FT</div>
            <div>SPD: {Math.round(aircraft.speed || 0)} KTS</div>
            <div>HDG: {Math.round(aircraft.heading || 0)}&deg;</div>
            <div>PCH: {Math.round(aircraft.pitchAngle || 0)}&deg;</div>
          </div>

          <div className="absolute bottom-16 right-4 z-10 pointer-events-none font-mono text-[10px] text-cyan-500/80 text-right space-y-1">
            <div>SYS HEALTH: {aircraft.healthScore}%</div>
            <div>STATUS: {aircraft.status}</div>
            <div>FAULTS: {aircraft.activeFaults?.length || 0}</div>
          </div>

          <div className="flex-1 w-full bg-slate-900 cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [20, 10, 20], fov: 45 }}>
              <Suspense fallback={<Loader />}>
                <DefenseEnvironment />
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
          <div className="h-14 bg-slate-800/90 backdrop-blur border-t border-cyan-900/50 flex items-center px-4 overflow-x-auto space-x-2">
            <span className="text-[10px] text-cyan-600 font-mono font-bold tracking-widest shrink-0 mr-2">SUBSYSTEMS:</span>
            {componentsList.map(name => {
              const comp = aircraft.components.find(c => c.type === name);
              const isCrit = comp?.status === 'Critical' || comp?.status === 'Warning';
              return (
                <button
                  key={name}
                  onClick={() => setSelectedComponentName(name)}
                  className={`px-3 py-1.5 rounded text-[10px] font-mono whitespace-nowrap transition-all border ${
                    selectedComponentName === name 
                      ? 'bg-cyan-900/80 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : isCrit 
                      ? 'bg-red-900/30 text-red-400 border-red-500/50 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-cyan-700'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Sidebar */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start border-b border-slate-700 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">{activeComponent?.type}</span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{activeComponent?.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">ID: {activeComponent?.serialNumber}</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold font-mono uppercase border ${
                activeComponent?.status === 'Critical' ? 'bg-red-900/40 text-red-400 border-red-500/50 animate-pulse' :
                activeComponent?.status === 'Warning' ? 'bg-orange-900/40 text-orange-400 border-orange-500/50' :
                'bg-emerald-900/40 text-emerald-400 border-emerald-500/50'
              }`}>
                {activeComponent?.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Health Score</div>
                <div className={`text-3xl font-mono font-bold ${
                  (activeComponent?.healthScore||0) < 50 ? 'text-red-400' : 'text-cyan-400'
                }`}>
                  {activeComponent?.healthScore}%
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Remaining Life</div>
                <div className="text-3xl font-mono font-bold text-slate-300">
                  {activeComponent?.rulHours}<span className="text-sm text-slate-500 ml-1">hrs</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest mb-3">Live Telemetry</h4>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700/30">
                  <span className="text-slate-400">TEMPERATURE</span>
                  <span className={(activeComponent?.temperature||0) > 800 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                    {activeComponent?.temperature?.toFixed(1) || '--'} &deg;C
                  </span>
                </div>
                <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700/30">
                  <span className="text-slate-400">VIBRATION</span>
                  <span className={(activeComponent?.vibration||0) > 2.0 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                    {activeComponent?.vibration?.toFixed(2) || '--'} IPS
                  </span>
                </div>
                <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700/30">
                  <span className="text-slate-400">PRESSURE</span>
                  <span className={(activeComponent?.pressure||0) < 1000 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                    {activeComponent?.pressure?.toFixed(0) || activeComponent?.oilPressure?.toFixed(0) || '--'} PSI
                  </span>
                </div>
              </div>
            </div>
            
            {(activeComponent?.status === 'Critical' || activeComponent?.status === 'Warning') && (
              <div className="mt-6 bg-red-900/20 border border-red-500/30 p-4 rounded flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-[10px] text-red-200 font-mono leading-relaxed">
                  CRITICAL ANOMALY DETECTED. Harmonic resonance and thermal expansion exceed MIL-STD safety tolerances. Immediate grounding recommended.
                </p>
              </div>
            )}
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
import { useSimulatorStore } from '../store/simulatorStore';
import { OrbitControls, Environment, Bounds, useGLTF, Html, Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

import { RotateCw, Layers, Crosshair, Radar, AlertTriangle } from 'lucide-react';
import { Aircraft, AircraftComponent } from '../types/fleet';

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur rounded-lg shadow-sm border border-orange-500/30 min-w-[150px]">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
        <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">INITIALIZING ENGINE...</p>
      </div>
    </Html>
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
    
    // Auto-rotate & Engine Spin
    if (autoRotate) {
      groupRef.current.rotation.y += 0.01;
    }
    
    // Spin blades based on RPM
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
          // If high temp, glow the combustion/exhaust
          if ((engine.temperature || 0) > 800 && (name.includes('combust') || name.includes('exhaust') || name.includes('turbine'))) isFaultyComponent = true;
          // If high vibration, glow the rotors
          if ((engine.vibration || 0) > 2.0 && (name.includes('fan') || name.includes('rotor') || name.includes('blade'))) isFaultyComponent = true;
        }

        if (isFaultyComponent) {
          mat.transparent = true;
          mat.opacity = 1.0;
          mat.emissiveIntensity = 2;
          
          if (engine?.status === 'Critical') {
            mat.emissive.setHex(0xff0000); 
            mat.emissiveIntensity = pulseFast * 4;
            mat.color.setHex(0xff4444);
          } else {
            mat.emissive.setHex(0xffaa00);
            mat.emissiveIntensity = pulseMed * 2;
            mat.color.setHex(0xffaa44);
          }
        } else if (engine && engine.status !== 'Operational') {
          // Dim others to highlight fault
          mat.transparent = true;
          mat.opacity = 0.4;
          mat.emissiveIntensity = 0;
          mat.color.setHex(0x555555);
        } else {
          // Normal
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.emissiveIntensity = 0.2;
          mat.emissive.setHex(0x221100); // Slight warmth
        }

        // Exploded View
        const origPos = originalPositions.current.get(child.uuid);
        if (origPos) {
          const targetPos = origPos.clone();
          if (exploded) {
            const dir = targetPos.clone().normalize();
            targetPos.add(dir.multiplyScalar(0.5)); // Pushed out along normal
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

export const EngineDigitalTwin: React.FC<{ aircraft: Aircraft }> = ({ aircraft }) => {
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [exploded, setExploded] = useState(false);

  const engine = aircraft.components.find(c => c.type === 'Engine') || null;

  return (
    <div className="w-full bg-slate-900 text-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 flex flex-col h-[700px] border border-orange-900/50 rounded-lg overflow-hidden relative shadow-[0_0_20px_rgba(249,115,22,0.1)]">
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
            <div>
              <h2 className="text-xl font-bold font-mono text-orange-400 tracking-wider flex items-center gap-2 drop-shadow-md">
                <Radar className="w-5 h-5 animate-pulse" />
                PROPULSION TWIN
              </h2>
              <p className="text-xs text-orange-600 font-mono mt-1">ENGINE DIAGNOSTICS ACTIVE</p>
            </div>
            <div className="pointer-events-auto flex space-x-2 bg-slate-800/80 p-2 rounded backdrop-blur border border-slate-700">
              <button onClick={() => setIsWireframe(!isWireframe)} className={`p-1.5 rounded transition ${isWireframe ? 'bg-orange-600/30 text-orange-400' : 'text-slate-400 hover:text-orange-400'}`}>
                <Crosshair className="w-4 h-4" />
              </button>
              <button onClick={() => setAutoRotate(!autoRotate)} className={`p-1.5 rounded transition ${autoRotate ? 'bg-orange-600/30 text-orange-400' : 'text-slate-400 hover:text-orange-400'}`}>
                <RotateCw className="w-4 h-4" />
              </button>
              <button onClick={() => setExploded(!exploded)} className={`p-1.5 rounded transition ${exploded ? 'bg-orange-600/30 text-orange-400' : 'text-slate-400 hover:text-orange-400'}`}>
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full bg-slate-900 cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [10, 5, 10], fov: 45 }}>
              <Suspense fallback={<Loader />}>
                <color attach="background" args={['#020617']} />
                <fog attach="fog" args={['#020617', 5, 30]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#f97316" />
                <directionalLight position={[-10, -10, -5]} intensity={1} color="#3b82f6" />
                <Grid infiniteGrid fadeDistance={30} sectionColor="#f97316" cellColor="#1e293b" sectionSize={2} cellSize={0.5} position={[0, -2, 0]} />
                <Sparkles count={150} scale={10} size={1} speed={0.8} opacity={0.5} color="#f97316" />
                
                <Bounds fit clip observe margin={1.2}>
                  <EngineR3FModel isWireframe={isWireframe} autoRotate={autoRotate} exploded={exploded} engine={engine} />
                </Bounds>
                <OrbitControls makeDefault enablePan={true} enableZoom={true} />
              </Suspense>
            </Canvas>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start border-b border-slate-700 pb-4">
              <div>
                <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest">TURBOFAN ENGINE</span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{engine?.name || 'F-135 Engine'}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">ID: {engine?.serialNumber}</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold font-mono uppercase border ${
                engine?.status === 'Critical' ? 'bg-red-900/40 text-red-400 border-red-500/50 animate-pulse' :
                engine?.status === 'Warning' ? 'bg-orange-900/40 text-orange-400 border-orange-500/50' :
                'bg-emerald-900/40 text-emerald-400 border-emerald-500/50'
              }`}>
                {engine?.status || 'Operational'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">EGT (Temp)</div>
                <div className={`text-2xl font-mono font-bold ${(engine?.temperature||0) > 800 ? 'text-red-400' : 'text-orange-400'}`}>
                  {engine?.temperature?.toFixed(1) || 0}&deg;C
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Vibration</div>
                <div className={`text-2xl font-mono font-bold ${(engine?.vibration||0) > 2.0 ? 'text-red-400' : 'text-orange-400'}`}>
                  {engine?.vibration?.toFixed(2) || 0} IPS
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-[10px] font-mono text-orange-600 uppercase tracking-widest mb-3">Thermodynamics</h4>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700/30">
                  <span className="text-slate-400">RPM</span>
                  <span className="text-slate-200 font-bold">{engine?.rpm?.toFixed(0) || 0}</span>
                </div>
                <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700/30">
                  <span className="text-slate-400">FUEL FLOW</span>
                  <span className="text-slate-200 font-bold">{engine?.fuelFlow?.toFixed(0) || 0} PPH</span>
                </div>
                <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700/30">
                  <span className="text-slate-400">OIL PRESSURE</span>
                  <span className={(engine?.oilPressure||0) < 30 ? 'text-red-400 font-bold' : 'text-slate-200 font-bold'}>{engine?.oilPressure?.toFixed(1) || 0} PSI</span>
                </div>
              </div>
            </div>
            
            {(engine?.status === 'Critical' || engine?.status === 'Warning') && (
              <div className="mt-6 bg-red-900/20 border border-red-500/30 p-4 rounded flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-[10px] text-red-200 font-mono leading-relaxed">
                  PROPULSION ANOMALY: Abnormal telemetry signatures isolated to {engine?.temperature && engine.temperature > 800 ? 'Combustion Section (Thermal Overload)' : 'Rotor Assembly (Harmonic Resonance)'}.
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
