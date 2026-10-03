import os

new_code = """import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Bounds, useBounds, useGLTF, Html, Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

import { 
  Box, RotateCw, Layers, RefreshCw, AlertTriangle, CheckCircle2, Activity, Wrench, ShieldAlert
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
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Loading Twin...</p>
      </div>
    </Html>
  );
}

const mapFaultToMesh = (componentType: string): string[] => {
  switch(componentType.toLowerCase()) {
    case 'engine': return ['engine', 'propeller', 'turbine', 'exhaust'];
    case 'fuel system': return ['wing', 'tank', 'fuel'];
    case 'hydraulic system': return ['flap', 'rudder', 'elevator', 'gear'];
    case 'electrical system': return ['nose', 'radar', 'cockpit', 'avionics'];
    default: return [componentType.toLowerCase()];
  }
};

function PremiumAerospaceEnvironment() {
  return (
    <group>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-10, -10, -10]} intensity={1.0} color="#e0f2fe" />
      
      {/* Blueprint Grid */}
      <Grid infiniteGrid fadeDistance={60} sectionColor="#94a3b8" cellColor="#e2e8f0" sectionSize={5} cellSize={1} position={[0, -2.5, 0]} />
      
      {/* Holographic Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
        <ringGeometry args={[8, 8.05, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
        <ringGeometry args={[14, 14.1, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
        <ringGeometry args={[20, 20.15, 64]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Compass Markers */}
      <Html position={[0, -2.4, -14]} center className="pointer-events-none">
        <div className="text-[10px] font-mono font-bold text-blue-500/70 tracking-widest bg-white/50 px-1 rounded backdrop-blur-sm">N 000&deg;</div>
      </Html>
      <Html position={[0, -2.4, 14]} center className="pointer-events-none">
        <div className="text-[10px] font-mono font-bold text-blue-500/70 tracking-widest bg-white/50 px-1 rounded backdrop-blur-sm">S 180&deg;</div>
      </Html>
      <Html position={[14, -2.4, 0]} center className="pointer-events-none">
        <div className="text-[10px] font-mono font-bold text-blue-500/70 tracking-widest bg-white/50 px-1 rounded backdrop-blur-sm">E 090&deg;</div>
      </Html>
      <Html position={[-14, -2.4, 0]} center className="pointer-events-none">
        <div className="text-[10px] font-mono font-bold text-blue-500/70 tracking-widest bg-white/50 px-1 rounded backdrop-blur-sm">W 270&deg;</div>
      </Html>
      
      {/* Subtle Digital Particles */}
      <Sparkles count={120} scale={25} size={1.2} speed={0.15} opacity={0.3} color="#0ea5e9" />
    </group>
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
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m: any) => m.clone());
            child.material.forEach((m: any) => m.wireframe = isWireframe);
          } else {
            child.material = child.material.clone();
            child.material.wireframe = isWireframe;
          }
        }
      }
    });
  }, [scene, isWireframe]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    if (autoRotate) {
      groupRef.current.rotation.y += 0.0005; // Slow rotation
    }

    const t = state.clock.elapsedTime;
    const pulseFast = Math.sin(t * 8) * 0.5 + 0.5;
    const pulseMed = Math.sin(t * 4) * 0.5 + 0.5;

    const targetKeywords = selectedComponent ? mapFaultToMesh(selectedComponent.type) : [];
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name.toLowerCase();
        
        let isTarget = false;
        if (selectedComponent) {
          isTarget = targetKeywords.some(k => name.includes(k));
        }

        if (child.material) {
          const applyMat = (mat: THREE.MeshStandardMaterial) => {
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
              mat.opacity = 0.25;
              mat.emissiveIntensity = 0;
              mat.color.setHex(0xa3a3a3);
            } else {
              mat.transparent = true;
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
          };

          if (Array.isArray(child.material)) {
            child.material.forEach(applyMat);
          } else {
            applyMat(child.material as THREE.MeshStandardMaterial);
          }
        }

        const origPos = originalPositions.current.get(child.uuid);
        if (origPos) {
          const targetPos = origPos.clone();
          if (exploded) {
            const dir = targetPos.clone().normalize();
            targetPos.add(dir.multiplyScalar(8));
          }
          child.position.lerp(targetPos, 0.1);
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={2.5} position={[0, -1, 0]} />
    </group>
  );
}

export const AircraftDigitalTwin: React.FC<AircraftDigitalTwinProps> = ({
  aircraft,
  onSelectAnotherAircraft,
  allAircraft
}) => {
  const [selectedComponentName, setSelectedComponentName] = useState<string>(aircraft.components[0]?.type || 'Airframe');
  const [isExploded, setIsExploded] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const activeComponent = aircraft.components.find(c => c.type.toLowerCase().includes(selectedComponentName.toLowerCase()) || c.name.toLowerCase().includes(selectedComponentName.toLowerCase())) || aircraft.components[0];
  const isCritical = activeComponent?.status === 'Critical';

  const riskScore = activeComponent?.status === 'Critical' ? 92 : activeComponent?.status === 'Warning' ? 65 : 12;
  const aiConfidence = 96;

  const faultAnalysis = isCritical 
    ? `Critical anomaly detected in ${activeComponent.name}. High risk of systemic failure if not addressed immediately.`
    : activeComponent?.status === 'Warning'
    ? `Degradation detected in ${activeComponent.name}. Wear pattern exceeds nominal bounds by 14%.`
    : `All subsystems within ${activeComponent.name} are operating nominally.`;
    
  const recommendation = isCritical
    ? `GROUND AIRCRAFT. Immediate replacement of ${activeComponent.type} required.`
    : activeComponent?.status === 'Warning'
    ? `Schedule borescope inspection during next maintenance window.`
    : `Continue standard fleet monitoring.`;

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs h-[600px]">
          
          <div className="p-3 bg-white border-b border-slate-100 flex justify-between items-center z-10 relative">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">Interactive 3D Viewport</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">| Left Click + Drag to Orbit • Scroll to Zoom</span>
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

          <div className="flex-1 w-full relative bg-[#f8fafc] overflow-hidden">
            
            <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col space-y-1 bg-white/40 p-2 rounded backdrop-blur-sm border border-white/50">
              <div className="text-[10px] font-mono text-blue-600 font-bold tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                SYS: ONLINE // NOMINAL
              </div>
              <div className="text-[10px] font-mono text-slate-600 font-semibold mt-1">ALT: {Math.round(aircraft.altitude || 0).toLocaleString()} FT</div>
              <div className="text-[10px] font-mono text-slate-600 font-semibold">SPD: {Math.round(aircraft.speed || 0)} KTS</div>
            </div>

            <div className="absolute bottom-4 right-4 pointer-events-none z-10 text-right flex flex-col space-y-1">
              <div className="text-[10px] font-mono text-blue-600/80 font-bold tracking-widest">CAD // MIL-STD-1553</div>
              <div className="text-[10px] font-mono text-slate-400 font-bold">AEROSPACE DIGITAL TWIN</div>
            </div>

            <div className="absolute bottom-4 left-4 pointer-events-none z-10 flex flex-col space-y-1">
              <div className="text-[10px] font-mono text-slate-400 font-bold">SCALE: 2.5X</div>
              <div className="text-[10px] font-mono text-slate-400 font-bold">FIT: AUTO</div>
            </div>
            
            <style>{`
              @keyframes scan {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
              }
            `}</style>
            <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(to_bottom,transparent_50%,rgba(56,189,248,0.03)_50%)] bg-[length:100%_4px]"></div>
            <div className="absolute inset-0 pointer-events-none z-20 border-b border-blue-400/20 shadow-[0_4px_12px_rgba(56,189,248,0.1)]" style={{ animation: 'scan 4s linear infinite', height: '100%' }}></div>

            <Canvas camera={{ position: [14, 5, 14], fov: 35 }}>
              <Suspense fallback={<Loader />}>
                <PremiumAerospaceEnvironment />
                <Bounds fit clip observe margin={0.8}>
                  <AircraftR3FModel 
                    isWireframe={isWireframe} 
                    autoRotate={autoRotate} 
                    exploded={isExploded}
                    aircraft={aircraft}
                    selectedComponent={activeComponent}
                  />
                </Bounds>
                <OrbitControls makeDefault enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 1.8} minDistance={5} maxDistance={50} />
              </Suspense>
            </Canvas>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          
          <div className={`p-4 border-b transition-colors duration-300 ${isCritical ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded transition-colors duration-300 ${isCritical ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                  SUBSYSTEM INSPECTION
                </span>
                <h2 className={`text-xl font-bold mt-2 transition-colors duration-300 ${isCritical ? 'text-red-900' : 'text-slate-900'}`}>{activeComponent?.name || selectedComponentName}</h2>
              </div>
              <div className={`px-3 py-1.5 rounded-md flex items-center border shadow-sm transition-colors duration-300 ${
                isCritical ? 'bg-red-600 border-red-700 text-white' : 
                activeComponent?.status === 'Warning' ? 'bg-amber-500 border-amber-600 text-white' : 
                'bg-emerald-500 border-emerald-600 text-white'
              }`}>
                {isCritical ? <ShieldAlert className="w-4 h-4 mr-1.5" /> : activeComponent?.status === 'Warning' ? <AlertTriangle className="w-4 h-4 mr-1.5" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                <span className="text-xs font-bold uppercase tracking-wide">{activeComponent?.status || 'Operational'}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-6">
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Health Score</div>
                <div className={`text-2xl font-bold font-mono mt-1 transition-colors duration-300 ${isCritical ? 'text-red-600' : 'text-slate-900'}`}>{activeComponent?.healthScore || 100}%</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Rem. Useful Life</div>
                <div className={`text-2xl font-bold font-mono mt-1 transition-colors duration-300 ${isCritical ? 'text-red-600' : 'text-blue-700'}`}>{activeComponent?.rulHours || 800} <span className="text-sm">hrs</span></div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Risk Score</div>
                <div className={`text-2xl font-bold font-mono mt-1 transition-colors duration-300 ${riskScore > 50 ? 'text-red-600' : 'text-emerald-600'}`}>{riskScore} / 100</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">AI Confidence</div>
                <div className="text-2xl font-bold font-mono mt-1 text-slate-900">{aiConfidence}%</div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-100 pb-2">Subsystem Health</h3>
              <div className="space-y-3">
                {aircraft.components.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedComponentName(comp.type)}
                    className={`w-full group text-left block p-2 rounded transition-colors ${
                      selectedComponentName === comp.type ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-end mb-1">
                      <span className={`text-xs font-semibold ${selectedComponentName === comp.type ? 'text-blue-900' : 'text-slate-700'}`}>{comp.name}</span>
                      <span className={`text-[10px] font-mono font-bold ${comp.healthScore < 50 ? 'text-red-600' : comp.healthScore < 80 ? 'text-amber-600' : 'text-emerald-600'}`}>{comp.healthScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${comp.healthScore < 50 ? 'bg-red-500' : comp.healthScore < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${comp.healthScore}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-100 pb-2 flex justify-between items-center">
                Live Telemetry
                <span className="flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span> STREAMING</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">Temperature</span>
                  <span className={`font-mono font-bold ${(activeComponent?.temperature || 0) > 1000 ? 'text-red-600' : 'text-slate-900'}`}>{activeComponent?.temperature?.toFixed(1) || 'N/A'}&deg;C</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">Vibration</span>
                  <span className={`font-mono font-bold ${(activeComponent?.vibration || 0) > 2.0 ? 'text-red-600' : 'text-slate-900'}`}>{activeComponent?.vibration?.toFixed(2) || 'N/A'} IPS</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">Altitude</span>
                  <span className="font-mono font-bold text-slate-900">{Math.round(aircraft.altitude || 0).toLocaleString()} FT</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">Airspeed</span>
                  <span className="font-mono font-bold text-slate-900">{Math.round(aircraft.speed || 0)} KTS</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">Heading</span>
                  <span className="font-mono font-bold text-slate-900">{Math.round(aircraft.heading || 0)}&deg;</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">Pitch / Bank</span>
                  <span className="font-mono font-bold text-slate-900">{Math.round((aircraft as any).pitch || 0)}&deg; / {Math.round((aircraft as any).bank || 0)}&deg;</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border transition-colors duration-300 ${isCritical ? 'bg-red-50 border-red-200' : activeComponent?.status === 'Warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'}`}>
              <div className="space-y-3">
                <div>
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isCritical ? 'text-red-800' : 'text-blue-800'}`}>Active Fault Analysis</h4>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${isCritical ? 'text-red-700 font-medium' : 'text-slate-700'}`}>{faultAnalysis}</p>
                </div>
                <div className="pt-2 border-t border-white/40">
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isCritical ? 'text-red-800' : 'text-blue-800'}`}>Maintenance Recommendation</h4>
                  <p className={`text-xs mt-1 flex items-start transition-colors duration-300 ${isCritical ? 'text-red-700 font-bold' : 'text-slate-700'}`}>
                    <Wrench className="w-3.5 h-3.5 mr-1.5 shrink-0 mt-0.5" />
                    {recommendation}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
"""

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(new_code)
