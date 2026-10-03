import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Bounds, useGLTF, Html, Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

import { 
  Cpu, RotateCw, Layers, RefreshCw, AlertTriangle, CheckCircle2, Activity, Wrench, ShieldAlert
} from 'lucide-react';
import { Aircraft } from '../types/fleet';

interface EngineDigitalTwinProps {
  aircraftTailNumber?: string;
  aircraft: Aircraft;
}

interface EngineStageData {
  id: string;
  name: string;
  healthScore: number;
  status: 'Operational' | 'Warning' | 'Critical';
  temperature: number;
  oilPressure: number;
  vibration: number;
  rpm: number;
  fuelFlow: number;
  rul: number;
  riskScore: number;
  confidence: number;
  trend: string;
  faultAnalysis: string;
  recommendation: string;
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

function EngineR3FModel({ isWireframe, autoRotate, activeStage }: { isWireframe: boolean, autoRotate: boolean, activeStage: EngineStageData }) {
  const { scene } = useGLTF('/models/turbine_turbofan_jet_engine.glb');
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
    
    // Rotate slowly based on user request (was 0.005, now 0.001)
    if (autoRotate) groupRef.current.rotation.y += 0.0005;
    
    const rpm = activeStage.rpm || 1000;
    const t = state.clock.elapsedTime;
    const pulseFast = Math.sin(t * 10) * 0.5 + 0.5;
    const pulseMed = Math.sin(t * 5) * 0.5 + 0.5;
    
    scene.traverse((child) => {
      const name = child.name.toLowerCase();
      
      // Rotation logic for blades
      if (name.includes('blade') || name.includes('fan') || name.includes('rotor') || name.includes('turbine')) {
         child.rotation.z += (rpm / 10000) * 0.03;
      }

      // Highlighting logic
      if (child instanceof THREE.Mesh) {
        let isTarget = false;
        if (activeStage.id === 'stg-fan' && (name.includes('fan') || name.includes('spinner'))) isTarget = true;
        if (activeStage.id === 'stg-comp' && (name.includes('compressor') || name.includes('stator'))) isTarget = true;
        if (activeStage.id === 'stg-comb' && (name.includes('combust') || name.includes('chamber'))) isTarget = true;
        if (activeStage.id === 'stg-turb' && (name.includes('turb') || name.includes('rotor'))) isTarget = true;
        if (activeStage.id === 'stg-exh' && (name.includes('exhaust') || name.includes('nozzle') || name.includes('cone'))) isTarget = true;

        if (child.material) {
          const applyMat = (m: THREE.MeshStandardMaterial) => {
            if (isTarget) {
              m.transparent = true; m.opacity = 1.0;
              if (activeStage.status === 'Critical') {
                m.emissive.setHex(0xff2222); m.emissiveIntensity = pulseFast * 1.5; m.color.setHex(0xff4444);
              } else if (activeStage.status === 'Warning') {
                m.emissive.setHex(0xffaa00); m.emissiveIntensity = pulseMed * 1.0; m.color.setHex(0xffaa44);
              } else {
                m.emissive.setHex(0x3b82f6); m.emissiveIntensity = 0.6; m.color.setHex(0x93c5fd);
              }
            } else {
               m.transparent = true; 
               m.opacity = activeStage.status === 'Critical' ? 0.2 : 0.4; 
               m.emissiveIntensity = 0; 
               m.color.setHex(0xa3a3a3);
            }
          };

          if (Array.isArray(child.material)) {
            child.material.forEach(applyMat);
          } else {
            applyMat(child.material as THREE.MeshStandardMaterial);
          }
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={5} position={[0, -1, 0]} />
    </group>
  );
}

export const EngineDigitalTwin: React.FC<EngineDigitalTwinProps> = ({
  aircraftTailNumber = 'AF-023 (F-35A)',
  aircraft
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('stg-turb');
  const [isRotating, setIsRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);

  // Extract live root engine telemetry from aircraft props
  const engine = aircraft?.components?.find(c => c.type === 'Engine') || aircraft?.components?.[0];
  const baseHealth = engine?.healthScore || 100;
  const baseTemp = engine?.temperature || 600;
  const baseVib = engine?.vibration || 1.0;
  const basePsi = engine?.oilPressure || engine?.pressure || 45;
  const baseRpm = engine?.rpm || 10000;
  const baseFlow = engine?.fuelFlow || 3000;
  const baseRul = engine?.rulHours || 800;

  // Generate dynamic live stages based on the real-time root telemetry
  const liveStages: EngineStageData[] = [
    { 
      id: 'stg-fan', name: 'Low Pressure Fan', 
      healthScore: Math.min(100, Math.round(baseHealth * 1.05)), 
      status: baseHealth < 60 ? 'Warning' : 'Operational', 
      temperature: 45, oilPressure: Math.round(basePsi), vibration: Number((baseVib * 0.8).toFixed(2)), 
      rpm: Math.round(baseRpm), fuelFlow: Math.round(baseFlow), rul: Math.round(baseRul * 1.05), riskScore: baseHealth < 60 ? 40 : 12, confidence: 98, 
      trend: 'Tracking with root engine parameters.', faultAnalysis: 'Nominal aerodynamic flow.', recommendation: 'None.' 
    },
    { 
      id: 'stg-comp', name: 'High Pressure Compressor', 
      healthScore: Math.max(0, Math.round(baseHealth * 0.9)), 
      status: baseHealth < 75 ? (baseHealth < 50 ? 'Critical' : 'Warning') : 'Operational', 
      temperature: Math.round(baseTemp * 0.4), oilPressure: Math.round(basePsi * 1.1), vibration: Number((baseVib * 1.2).toFixed(2)), 
      rpm: Math.round(baseRpm * 1.5), fuelFlow: Math.round(baseFlow), rul: Math.round(baseRul * 0.8), riskScore: baseHealth < 75 ? 65 : 45, confidence: 92, 
      trend: 'Efficiency correlating to core RPM.', faultAnalysis: baseHealth < 75 ? 'Minor flutter detected on Stage 3 stators.' : 'Nominal.', recommendation: baseHealth < 75 ? 'Monitor closely during high-thrust maneuvers.' : 'None.' 
    },
    { 
      id: 'stg-comb', name: 'Combustion Chamber', 
      healthScore: Math.max(0, Math.round(baseHealth * 0.95)), 
      status: baseTemp > 800 ? 'Warning' : 'Operational', 
      temperature: Math.round(baseTemp * 2.5), oilPressure: Math.round(basePsi * 0.9), vibration: Number((baseVib * 0.9).toFixed(2)), 
      rpm: Math.round(baseRpm * 1.5), fuelFlow: Math.round(baseFlow * 1.1), rul: Math.round(baseRul * 0.9), riskScore: baseTemp > 800 ? 55 : 22, confidence: 95, 
      trend: 'Thermal cycling active.', faultAnalysis: baseTemp > 800 ? 'Elevated EGT detected. Fuel-air mixture rich.' : 'Nominal.', recommendation: baseTemp > 800 ? 'Adjust FADEC fuel trim.' : 'Standard maintenance.' 
    },
    { 
      id: 'stg-turb', name: 'High Pressure Turbine', 
      healthScore: Math.max(0, Math.round(baseHealth * 0.75)), // Usually the most degraded part
      status: baseHealth < 80 ? (baseHealth < 55 ? 'Critical' : 'Warning') : 'Operational', 
      temperature: Math.round(baseTemp * 2.0), oilPressure: Math.round(basePsi * 0.7), vibration: Number((baseVib * 1.6).toFixed(2)), 
      rpm: Math.round(baseRpm * 1.5), fuelFlow: Math.round(baseFlow * 1.15), rul: Math.round(baseRul * 0.5), 
      riskScore: baseHealth < 55 ? 88 : 40, confidence: 96, 
      trend: baseHealth < 55 ? 'Rapid thermal degradation.' : 'Stable.', 
      faultAnalysis: baseHealth < 55 ? 'Harmonic resonance peak detected. Micro-spalling imminent.' : 'Nominal.', 
      recommendation: baseHealth < 55 ? 'GROUND AIRCRAFT. Immediate tear-down.' : 'Continue operation.' 
    },
    { 
      id: 'stg-exh', name: 'Exhaust Nozzle', 
      healthScore: Math.min(100, Math.round(baseHealth * 1.1)), 
      status: 'Operational', 
      temperature: Math.round(baseTemp * 1.1), oilPressure: 16, vibration: Number((baseVib * 0.5).toFixed(2)), 
      rpm: 0, fuelFlow: 0, rul: Math.round(baseRul * 1.2), riskScore: 5, confidence: 99, 
      trend: 'Optimal', faultAnalysis: 'No thermal stress fracturing.', recommendation: 'No action required.' 
    },
  ];

  const activeStage = liveStages.find(s => s.id === selectedStageId) || liveStages[0];
  const isCritical = activeStage.status === 'Critical';

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Main Layout: Left 3D Viewport, Right Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Interactive 3D Viewport (Span 7) */}
        <div className="lg:col-span-7 flex flex-col rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs min-h-[700px]">
          <div className="p-3 bg-white border-b border-slate-100 flex justify-between items-center z-10">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">Interactive 3D Viewport</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">| Left Click + Drag to Orbit • Scroll to Zoom</span>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setIsWireframe(!isWireframe)} className={`px-2 py-1.5 rounded text-xs font-medium border transition-colors ${isWireframe ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Wireframe</button>
              <button onClick={() => setIsRotating(!isRotating)} className={`p-1.5 rounded border transition-colors ${isRotating ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-200'}`}><RotateCw className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"><RefreshCw className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="flex-1 w-full relative bg-[#f8fafc]">
            <Canvas camera={{ position: [12, 4, 12], fov: 40 }}>
              <Suspense fallback={<Loader />}>
                <color attach="background" args={['#ffffff']} />
                <ambientLight intensity={1.5} color="#ffffff" />
                <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" />
                <directionalLight position={[-10, -10, -10]} intensity={1.0} color="#e0f2fe" />
                <gridHelper args={[50, 50, 0xcbd5e1, 0xe2e8f0]} position={[0, -2.5, 0]} />
                <Bounds fit clip observe margin={0.8}>
                  <EngineR3FModel 
                    isWireframe={isWireframe} 
                    autoRotate={isRotating} 
                    activeStage={activeStage}
                  />
                </Bounds>
                <OrbitControls makeDefault enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 1.5} />
              </Suspense>
            </Canvas>
          </div>
        </div>

        {/* RIGHT: Detailed Diagnostics Panel (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Header Panel */}
          <div className={`p-4 border-b transition-colors duration-300 ${isCritical ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded transition-colors duration-300 ${isCritical ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                  ENGINE STAGE INSPECTION
                </span>
                <h2 className={`text-xl font-bold mt-2 transition-colors duration-300 ${isCritical ? 'text-red-900' : 'text-slate-900'}`}>{activeStage.name}</h2>
              </div>
              <div className={`px-3 py-1.5 rounded-md flex items-center border shadow-sm transition-colors duration-300 ${
                isCritical ? 'bg-red-600 border-red-700 text-white' : 
                activeStage.status === 'Warning' ? 'bg-amber-500 border-amber-600 text-white' : 
                'bg-emerald-500 border-emerald-600 text-white'
              }`}>
                {isCritical ? <ShieldAlert className="w-4 h-4 mr-1.5" /> : activeStage.status === 'Warning' ? <AlertTriangle className="w-4 h-4 mr-1.5" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                <span className="text-xs font-bold uppercase tracking-wide">{activeStage.status}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-6">
            
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Health Score</div>
                <div className={`text-2xl font-bold font-mono mt-1 transition-colors duration-300 ${isCritical ? 'text-red-600' : 'text-slate-900'}`}>{activeStage.healthScore}%</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Rem. Useful Life</div>
                <div className={`text-2xl font-bold font-mono mt-1 transition-colors duration-300 ${isCritical ? 'text-red-600' : 'text-blue-700'}`}>{activeStage.rul} <span className="text-sm">hrs</span></div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Risk Score</div>
                <div className={`text-2xl font-bold font-mono mt-1 transition-colors duration-300 ${activeStage.riskScore > 50 ? 'text-red-600' : 'text-emerald-600'}`}>{activeStage.riskScore} / 100</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">AI Confidence</div>
                <div className="text-2xl font-bold font-mono mt-1 text-slate-900">{activeStage.confidence}%</div>
              </div>
            </div>

            {/* Component Selector Breakdown */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-100 pb-2">Component Breakdown</h3>
              <div className="space-y-2">
                {liveStages.map(stage => (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-md border text-left transition-all duration-300 ${
                      selectedStageId === stage.id 
                        ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 transition-colors duration-300 ${stage.status === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : stage.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className={`text-sm font-medium transition-colors duration-300 ${selectedStageId === stage.id ? 'text-blue-900' : 'text-slate-700'}`}>{stage.name}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold transition-colors duration-300 ${stage.healthScore < 50 ? 'text-red-600' : 'text-slate-500'}`}>{stage.healthScore}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Telemetry Matrix */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-100 pb-2 flex justify-between items-center">
                Stage Telemetry
                <span className="flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span> LIVE</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">Temperature</span>
                  <span className={`font-mono font-bold ${activeStage.temperature > 1500 ? 'text-red-600' : 'text-slate-900'}`}>{activeStage.temperature}&deg;C</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">EGT</span>
                  <span className="font-mono font-bold text-slate-900">{(activeStage.temperature * 0.85).toFixed(0)}&deg;C</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">Vibration</span>
                  <span className={`font-mono font-bold ${activeStage.vibration > 2.0 ? 'text-red-600' : 'text-slate-900'}`}>{activeStage.vibration.toFixed(2)} IPS</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">RPM</span>
                  <span className="font-mono font-bold text-slate-900">{activeStage.rpm.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">Oil Pressure</span>
                  <span className={`font-mono font-bold ${activeStage.oilPressure < 30 ? 'text-red-600' : 'text-slate-900'}`}>{activeStage.oilPressure} PSI</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 transition-colors duration-300">
                  <span className="text-slate-500 font-medium">Fuel Flow</span>
                  <span className="font-mono font-bold text-slate-900">{activeStage.fuelFlow.toLocaleString()} PPH</span>
                </div>
              </div>
            </div>

            {/* Fault & Recommendation */}
            <div className={`p-4 rounded-lg border transition-colors duration-300 ${isCritical ? 'bg-red-50 border-red-200' : activeStage.status === 'Warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'}`}>
              <div className="space-y-3">
                <div>
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isCritical ? 'text-red-800' : 'text-blue-800'}`}>Active Fault Analysis</h4>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${isCritical ? 'text-red-700 font-medium' : 'text-slate-700'}`}>{activeStage.faultAnalysis}</p>
                </div>
                <div className="pt-2 border-t border-white/40">
                  <h4 className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isCritical ? 'text-red-800' : 'text-blue-800'}`}>Maintenance Recommendation</h4>
                  <p className={`text-xs mt-1 flex items-start transition-colors duration-300 ${isCritical ? 'text-red-700 font-bold' : 'text-slate-700'}`}>
                    <Wrench className="w-3.5 h-3.5 mr-1.5 shrink-0 mt-0.5" />
                    {activeStage.recommendation}
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
