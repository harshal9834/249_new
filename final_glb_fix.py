import os

aircraft_code = """import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Bounds, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

import { 
  Box, 
  RotateCw, 
  Layers, 
  Activity,
  RefreshCw,
  Crosshair
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
            mat.emissive.setHex(0x3b82f6);
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

export const AircraftDigitalTwin: React.FC<AircraftDigitalTwinProps> = ({
  aircraft,
  onSelectAnotherAircraft,
  allAircraft
}) => {
  const [selectedComponentName, setSelectedComponentName] = useState<string>('Airframe');
  const [isExploded, setIsExploded] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const componentsList = aircraft.components.map(c => c.type);
  const activeComponent = aircraft.components.find(c => c.type.toLowerCase().includes(selectedComponentName.toLowerCase()) || c.name.toLowerCase().includes(selectedComponentName.toLowerCase())) || aircraft.components[0];

  return (
    <div className="space-y-6">
      {/* Title & Aircraft Selector */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Box className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Aircraft Digital Twin (Universal C-130J Model)</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
              3D CAD TWIN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive high-fidelity universal military aircraft digital twin. Inspect internal subsystems, sensor diagnostics, and remaining useful life.
          </p>
        </div>

        {/* Airframe switcher */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-500 font-medium">Active Airframe:</label>
          <select
            value={aircraft.id}
            onChange={e => onSelectAnotherAircraft && onSelectAnotherAircraft(e.target.value)}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
          >
            {allAircraft.map(ac => (
              <option key={ac.id} value={ac.id}>
                {ac.tailNumber} - {ac.name} ({ac.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Viewer Column */}
        <div className="lg:col-span-2 flex flex-col rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs">
          
          {/* Top Controls */}
          <div className="p-3 bg-white border-b border-slate-100 flex justify-between items-center z-10">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">Interactive 3D Viewport</span>
              <span className="text-[10px] text-slate-400">| Left Click + Drag to Orbit • Scroll to Zoom</span>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setIsExploded(!isExploded)} className={`flex items-center px-2 py-1.5 rounded border transition-colors ${isExploded ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                <Layers className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs font-medium">Exploded View</span>
              </button>
              <button onClick={() => setIsWireframe(!isWireframe)} className={`px-2 py-1.5 rounded text-xs font-medium border transition-colors ${isWireframe ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                Wireframe
              </button>
              <button onClick={() => setAutoRotate(!autoRotate)} className={`p-1.5 rounded border transition-colors ${autoRotate ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-200'}`}>
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-100">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3D Container */}
          <div className="w-full h-[540px] cursor-grab active:cursor-grabbing relative bg-white">
            <Canvas camera={{ position: [20, 10, 20], fov: 45 }}>
              <Suspense fallback={<Loader />}>
                <color attach="background" args={['#ffffff']} />
                <ambientLight intensity={1.5} color="#ffffff" />
                <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" />
                <directionalLight position={[-10, -10, -10]} intensity={1.0} color="#e0f2fe" />
                <gridHelper args={[100, 100, 0xcbd5e1, 0xe2e8f0]} position={[0, -2, 0]} />
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
          </div>

          {/* Bottom Component Selectors */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Select Component:</span>
            {componentsList.map(name => {
              const isSelected = selectedComponentName.toLowerCase() === name.toLowerCase();
              return (
                <button
                  key={name}
                  onClick={() => setSelectedComponentName(name)}
                  className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected ? 'bg-blue-600 text-white font-semibold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {activeComponent?.type || selectedComponentName}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{activeComponent?.name || selectedComponentName}</h3>
                <p className="text-xs text-slate-500 font-mono">Serial Number: {activeComponent?.serialNumber || 'SN-MIL-4409'}</p>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  activeComponent?.status === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' : 
                  activeComponent?.status === 'Warning' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                {activeComponent?.status || 'Operational'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Health Score</div>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{activeComponent?.healthScore || 84}%</div>
                <div className="text-[10px] text-slate-500">Degradation: {activeComponent?.trend || 'stable'}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Remaining Useful Life</div>
                <div className="text-2xl font-bold font-mono text-blue-700 mt-0.5">{activeComponent?.rulHours || 42} hrs</div>
                <div className="text-[10px] text-slate-500">Weibull Projected</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Subsystem Sensor Telemetry</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Temp:</span>
                  <span className={`font-mono font-bold ${(activeComponent?.temperature || 620) > 650 ? 'text-red-600' : 'text-slate-900'}`}>{activeComponent?.temperature?.toFixed(1) || 620}&deg;C</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Vibration:</span>
                  <span className={`font-mono font-bold ${(activeComponent?.vibration || 2.4) > 2.0 ? 'text-red-600' : 'text-slate-900'}`}>{activeComponent?.vibration?.toFixed(2) || 2.4} IPS</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Oil PSI:</span>
                  <span className="font-mono font-bold text-slate-900">{activeComponent?.oilPressure?.toFixed(1) || activeComponent?.pressure?.toFixed(1) || 48}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Fuel PPH:</span>
                  <span className="font-mono font-bold text-slate-900">{activeComponent?.fuelFlow?.toFixed(0) || 3850}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
              <div className="font-bold text-blue-900 flex items-center space-x-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Predictive Twin Diagnostic</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {activeComponent?.trend === 'critical_spike' ? 'High-frequency harmonic resonance exceeds MIL-STD limits. Borescope teardown recommended within 38 flight hours.' : activeComponent?.trend === 'degrading' ? 'Sensor drift indicates gradual thermal barrier coating wear. Scheduled for upcoming depot phase.' : 'Telemetry signatures conform within 99.4% confidence nominal envelope. No anomalies detected.'}
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-right">
            <span className="text-[11px] text-slate-400 font-mono">Telemetry Sync: Online (MIL-1553B)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
"""

engine_code = """import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Bounds, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

import { 
  Cpu, RotateCw, Layers, RefreshCw
} from 'lucide-react';
import { EngineStageData } from '../types/fleet';

interface EngineDigitalTwinProps {
  aircraftTailNumber?: string;
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-200 min-w-[120px]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Loading Engine...</p>
      </div>
    </Html>
  );
}

function EngineR3FModel({ isWireframe, autoRotate, selectedStageId }: any) {
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

export const EngineDigitalTwin: React.FC<EngineDigitalTwinProps> = ({
  aircraftTailNumber = 'AF-023 (F-35A)'
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('stg-turb');
  const [isRotating, setIsRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);

  const stages: EngineStageData[] = [
    { id: 'stg-fan', name: 'Low Pressure Fan', healthScore: 92, status: 'Operational', temp: 15, pressure: 14.7, vibration: 0.2 },
    { id: 'stg-comp', name: 'High Pressure Compressor', healthScore: 78, status: 'Warning', temp: 350, pressure: 450, vibration: 1.5 },
    { id: 'stg-comb', name: 'Combustion Chamber', healthScore: 88, status: 'Operational', temp: 2100, pressure: 440, vibration: 0.8 },
    { id: 'stg-turb', name: 'High Pressure Turbine', healthScore: 45, status: 'Critical', temp: 1650, pressure: 150, vibration: 2.8 },
    { id: 'stg-exh', name: 'Exhaust Nozzle', healthScore: 95, status: 'Operational', temp: 800, pressure: 16, vibration: 0.4 },
  ];

  const activeStage = stages.find(s => s.id === selectedStageId) || stages[0];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Engine Digital Twin (Turbofan Cutaway)</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">PROPULSION 3D TWIN</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Aerospace gas-turbine cutaway simulation for {aircraftTailNumber}. Interactive stage diagnostics and thermal-mechanical stress analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs">
          <div className="p-3 bg-white border-b border-slate-100 flex justify-between items-center z-10">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">Turbofan Hot-Section Digital Cutaway</span>
              <span className="text-[10px] text-slate-400">Click any stage below or directly on the 3D model</span>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setIsWireframe(!isWireframe)} className={`px-2 py-1.5 rounded text-xs font-medium border transition-colors ${isWireframe ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Wireframe</button>
              <button onClick={() => setIsRotating(!isRotating)} className={`p-1.5 rounded border transition-colors ${isRotating ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-200'}`}><RotateCw className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"><RefreshCw className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="flex-1 w-full h-[540px] cursor-grab active:cursor-grabbing relative bg-white">
            <Canvas camera={{ position: [10, 5, 10], fov: 45 }}>
              <Suspense fallback={<Loader />}>
                <color attach="background" args={['#ffffff']} />
                <ambientLight intensity={1.5} color="#ffffff" />
                <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" />
                <directionalLight position={[-10, -10, -10]} intensity={1.0} color="#e0f2fe" />
                <gridHelper args={[100, 100, 0xcbd5e1, 0xe2e8f0]} position={[0, -2, 0]} />
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
          </div>

          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 overflow-x-auto">
            {stages.map(stage => {
              const isSelected = selectedStageId === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`px-3 py-1.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors flex items-center ${isSelected ? 'bg-blue-600 text-white font-semibold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${stage.status === 'Critical' ? 'bg-red-500' : stage.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  {stage.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col space-y-4">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">ENGINE STAGE</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{activeStage.name}</h3>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${activeStage.status === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' : activeStage.status === 'Warning' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
              {activeStage.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Structural Health</div>
                <div className={`text-2xl font-bold font-mono mt-0.5 ${activeStage.healthScore < 50 ? 'text-red-600' : 'text-slate-900'}`}>{activeStage.healthScore}%</div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
"""

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(aircraft_code)
    
with open('src/components/EngineDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(engine_code)
