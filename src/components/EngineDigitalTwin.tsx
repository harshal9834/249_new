import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Cpu, 
  RotateCw, 
  Layers, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  Thermometer, 
  Gauge, 
  Droplet, 
  Radio,
  RefreshCw
} from 'lucide-react';
import { EngineStageData } from '../types/fleet';

interface EngineDigitalTwinProps {
  aircraftTailNumber?: string;
}

export const EngineDigitalTwin: React.FC<EngineDigitalTwinProps> = ({
  aircraftTailNumber = 'AF-023 (F-35A)'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStageId, setSelectedStageId] = useState<string>('stg-turb');
  const [isRotating, setIsRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);

  // References for Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const engineStagesGroupRef = useRef<Map<string, THREE.Group>>(new Map());
  const rotorShaftRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stages: EngineStageData[] = [
    {
      id: 'stg-comp',
      name: 'Compressor (LP & HP Stages)',
      healthScore: 81.5,
      rpm: 10450,
      temperature: 485,
      fuelFlow: 3850,
      vibration: 2.10,
      oilPressure: 48,
      rul: 54,
      status: 'Warning',
      diagnostics: 'Minor aerodynamic flutter detected on stage 4 stator blades. Mild acoustic resonance.'
    },
    {
      id: 'stg-comb',
      name: 'Annular Combustor Chamber',
      healthScore: 92.0,
      rpm: 10450,
      temperature: 1240,
      fuelFlow: 3850,
      vibration: 0.85,
      oilPressure: 50,
      rul: 380,
      status: 'Operational',
      diagnostics: 'Combustion uniformity index within nominal envelope (pattern factor 0.18).'
    },
    {
      id: 'stg-turb',
      name: 'High & Low Pressure Turbine',
      healthScore: 68.0,
      rpm: 14200,
      temperature: 980,
      fuelFlow: 3850,
      vibration: 2.82,
      oilPressure: 44,
      rul: 38,
      status: 'Critical',
      diagnostics: 'Thermal barrier coating (TBC) spalling gradient observed on nozzle guide vanes. Blade creep risk.'
    },
    {
      id: 'stg-fuel',
      name: 'Digital Fuel Control (FADEC)',
      healthScore: 87.0,
      rpm: 10450,
      temperature: 85,
      fuelFlow: 3850,
      vibration: 0.90,
      oilPressure: 52,
      rul: 220,
      status: 'Operational',
      diagnostics: 'Dual redundant FADEC channel A active; metered flow matches commanded thrust schedule.'
    },
    {
      id: 'stg-oil',
      name: 'Oil Scavenge & Bearing Sump',
      healthScore: 74.0,
      rpm: 10450,
      temperature: 112,
      fuelFlow: 3850,
      vibration: 1.85,
      oilPressure: 44,
      rul: 82,
      status: 'Warning',
      diagnostics: 'Bearing #3 scavenge oil temperature delta +8°C above baseline. Trace ferrous particulate detected.'
    }
  ];

  const currentStage = stages.find(s => s.id === selectedStageId) || stages[0];

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 540;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8fafc); // Clean aerospace background

    // Grid
    const grid = new THREE.GridHelper(24, 24, 0x94a3b8, 0xe2e8f0);
    grid.position.y = -3.5;
    scene.add(grid);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 6, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.5);
    dirLight2.position.set(-10, -5, -10);
    scene.add(dirLight2);

    // Engine Master Assembly
    const engineMaster = new THREE.Group();
    scene.add(engineMaster);

    // Rotating Shaft Group
    const rotorShaft = new THREE.Group();
    engineMaster.add(rotorShaft);
    rotorShaftRef.current = rotorShaft;

    // Central drive shaft
    const shaftGeo = new THREE.CylinderGeometry(0.35, 0.35, 16.5, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftMesh.rotation.z = Math.PI / 2;
    rotorShaft.add(shaftMesh);

    // Materials
    const titaniumMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.75, roughness: 0.25 });
    const casingMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.4,
      roughness: 0.3,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });

    // Outer Cutaway Casing (Engine Cowling Cut in Half)
    const cowlGeo = new THREE.CylinderGeometry(2.4, 2.1, 15, 32, 1, true, 0, Math.PI);
    const cowlMesh = new THREE.Mesh(cowlGeo, casingMat);
    cowlMesh.rotation.z = Math.PI / 2;
    cowlMesh.rotation.y = Math.PI / 2;
    engineMaster.add(cowlMesh);

    // 1. COMPRESSOR STAGE
    const compGroup = new THREE.Group();
    compGroup.name = 'stg-comp';

    // Front Fan Blades Disk
    const fanDiskGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.3, 32);
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 });
    const fanDisk = new THREE.Mesh(fanDiskGeo, fanMat);
    fanDisk.rotation.z = Math.PI / 2;
    fanDisk.position.x = 6.2;
    rotorShaft.add(fanDisk);

    // Fan nose spinner cone
    const spinConeGeo = new THREE.ConeGeometry(0.7, 1.8, 24);
    const spinCone = new THREE.Mesh(spinConeGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }));
    spinCone.rotation.z = -Math.PI / 2;
    spinCone.position.x = 7.2;
    rotorShaft.add(spinCone);

    // Multi-stage compressor disks
    [5.0, 4.0, 3.1, 2.3].forEach((px, i) => {
      const r = 2.0 - i * 0.18;
      const cDisk = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.25, 24), titaniumMat);
      cDisk.rotation.z = Math.PI / 2;
      cDisk.position.x = px;
      rotorShaft.add(cDisk);
    });

    // Compressor casing stator vanes
    const compCasing = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 1.8, 4.5, 24, 1, true, 0, Math.PI * 1.5),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide })
    );
    compCasing.rotation.z = Math.PI / 2;
    compCasing.position.x = 4.2;
    compGroup.add(compCasing);

    engineMaster.add(compGroup);
    engineStagesGroupRef.current.set('stg-comp', compGroup);

    // 2. COMBUSTOR STAGE
    const combGroup = new THREE.Group();
    combGroup.name = 'stg-comb';

    // Annular combustor ring
    const combLinerGeo = new THREE.TorusGeometry(1.4, 0.35, 16, 32);
    const combMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.3 });
    const combLiner = new THREE.Mesh(combLinerGeo, combMat);
    combLiner.rotation.y = Math.PI / 2;
    combLiner.position.x = 0.5;
    combGroup.add(combLiner);

    // Fuel injector nozzle ring (12 nozzles)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      noz.position.set(0.5, Math.sin(angle) * 1.6, Math.cos(angle) * 1.6);
      combGroup.add(noz);
    }

    engineMaster.add(combGroup);
    engineStagesGroupRef.current.set('stg-comb', combGroup);

    // 3. TURBINE STAGE (HPT & LPT)
    const turbGroup = new THREE.Group();
    turbGroup.name = 'stg-turb';

    // High Pressure Turbine stage 1 (High thermal glow/critical)
    const hptMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 });
    const hptDisk = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32), hptMat);
    hptDisk.rotation.z = Math.PI / 2;
    hptDisk.position.x = -1.5;
    rotorShaft.add(hptDisk);

    // LPT Stages
    [-2.5, -3.6, -4.7].forEach((px, i) => {
      const r = 1.6 + i * 0.15;
      const tDisk = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.3, 24), titaniumMat);
      tDisk.rotation.z = Math.PI / 2;
      tDisk.position.x = px;
      rotorShaft.add(tDisk);
    });

    // Exhaust nozzle cone
    const exhaustCone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.2, 24), shaftMat);
    exhaustCone.rotation.z = Math.PI / 2;
    exhaustCone.position.x = -6.4;
    rotorShaft.add(exhaustCone);

    engineMaster.add(turbGroup);
    engineStagesGroupRef.current.set('stg-turb', turbGroup);

    // 4. FUEL SYSTEM (Manifolds & FADEC box)
    const fuelGroup = new THREE.Group();
    fuelGroup.name = 'stg-fuel';

    const fadecBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.8, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.5, roughness: 0.3 })
    );
    fadecBox.position.set(1.5, 2.5, 0);
    fuelGroup.add(fadecBox);

    // High pressure fuel delivery pipes
    const pipeGeo = new THREE.TorusGeometry(1.9, 0.06, 8, 32);
    const pipeMesh = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.9 }));
    pipeMesh.rotation.y = Math.PI / 2;
    pipeMesh.position.x = 0.8;
    fuelGroup.add(pipeMesh);

    engineMaster.add(fuelGroup);
    engineStagesGroupRef.current.set('stg-fuel', fuelGroup);

    // 5. OIL SYSTEM (Scavenge lines & reservoir sump)
    const oilGroup = new THREE.Group();
    oilGroup.name = 'stg-oil';

    const sumpMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 2.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.5, roughness: 0.4 })
    );
    sumpMesh.rotation.z = Math.PI / 2;
    sumpMesh.position.set(-1.2, -2.4, 0);
    oilGroup.add(sumpMesh);

    engineMaster.add(oilGroup);
    engineStagesGroupRef.current.set('stg-oil', oilGroup);

    // Raycast click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(engineMaster.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent && obj.parent !== engineMaster) {
          obj = obj.parent;
        }
        if (obj && obj.name && obj.name.startsWith('stg-')) {
          setSelectedStageId(obj.name);
        }
      }
    };
    container.addEventListener('pointerdown', onPointerDown);

    // Drag Orbit Controls
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      engineMaster.rotation.y += dx * 0.008;
      engineMaster.rotation.x = Math.max(-0.6, Math.min(0.6, engineMaster.rotation.x + dy * 0.005));
    };

    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(6, Math.min(28, camera.position.z + e.deltaY * 0.02));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (isRotating && rotorShaftRef.current) {
        rotorShaftRef.current.rotation.x += 0.04; // High speed shaft rotation
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 540;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isRotating]);

  // Stage highlighting effect
  useEffect(() => {
    engineStagesGroupRef.current.forEach((group, id) => {
      const isSelected = id === selectedStageId;
      group.traverse(child => {
        if (child instanceof THREE.Mesh && child.material) {
          child.material.wireframe = isWireframe;
          if (isSelected) {
            child.material.emissive = new THREE.Color(0x38bdf8);
            child.material.emissiveIntensity = 0.55;
          } else {
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0.0;
          }
        }
      });
    });
  }, [selectedStageId, isWireframe]);

  return (
    <div className="space-y-6">
      {/* Title & Engine Specs Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Engine Digital Twin (Turbofan Cutaway)</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
              PROPULSION 3D TWIN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aerospace gas-turbine cutaway simulation for {aircraftTailNumber}. Interactive stage diagnostics and thermal-mechanical stress analysis.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors flex items-center space-x-1.5 ${
              isRotating ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? 'Rotor Active' : 'Rotor Paused'}</span>
          </button>

          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
              isWireframe ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Wireframe</span>
          </button>
        </div>
      </div>

      {/* 3D Engine Viewport & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Three.js Container (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-50 rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col relative">
          <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between z-10 text-xs">
            <span className="font-mono font-bold text-slate-700">TURBOFAN HOT-SECTION DIGITAL CUTAWAY</span>
            <span className="text-slate-400 text-[11px]">Click any stage below or directly on the 3D model</span>
          </div>

          <div ref={containerRef} className="w-full h-[520px] cursor-grab active:cursor-grabbing" />

          {/* Engine Stages Selector Pills */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 overflow-x-auto">
            {stages.map(stg => {
              const isSelected = selectedStageId === stg.id;
              return (
                <button
                  key={stg.id}
                  onClick={() => setSelectedStageId(stg.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      stg.status === 'Critical' ? 'bg-red-500' : stg.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span>{stg.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Diagnostics HUD (1 Column) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                  STAGE DIAGNOSTICS
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{currentStage.name}</h3>
              </div>

              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  currentStage.status === 'Critical'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : currentStage.status === 'Warning'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {currentStage.status}
              </span>
            </div>

            {/* Health Score & RUL Banner */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Stage Health</div>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{currentStage.healthScore}%</div>
                <div className="text-[10px] text-slate-500">Weibull Fitted</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Remaining Life</div>
                <div className="text-2xl font-bold font-mono text-blue-700 mt-0.5">{currentStage.rul} hrs</div>
                <div className="text-[10px] text-slate-500">Calculated RUL</div>
              </div>
            </div>

            {/* Core Metrics Required in Brief */}
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Stage Telemetry Grid</h4>
              <div className="space-y-2 text-xs">
                {/* RPM */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Gauge className="w-4 h-4 text-blue-600" />
                    <span>Shaft RPM:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{currentStage.rpm.toLocaleString()} RPM</span>
                </div>

                {/* Temperature */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Thermometer className="w-4 h-4 text-amber-600" />
                    <span>Operating Temp:</span>
                  </div>
                  <span className={`font-mono font-bold ${currentStage.temperature > 700 ? 'text-red-600' : 'text-slate-900'}`}>
                    {currentStage.temperature}°C
                  </span>
                </div>

                {/* Fuel Flow */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Droplet className="w-4 h-4 text-cyan-600" />
                    <span>Fuel Flow:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{currentStage.fuelFlow} PPH</span>
                </div>

                {/* Vibration */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>Vibration:</span>
                  </div>
                  <span className={`font-mono font-bold ${currentStage.vibration > 2.0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {currentStage.vibration} IPS
                  </span>
                </div>

                {/* Oil Pressure */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Gauge className="w-4 h-4 text-emerald-600" />
                    <span>Oil Pressure:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{currentStage.oilPressure} PSI</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Recommendation */}
            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-800 mb-1 flex items-center space-x-1">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>Aerospace Diagnostic Log</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">{currentStage.diagnostics}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>FADEC Channel: Dual Redundant</span>
            <span>MIL-E-5007D Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
