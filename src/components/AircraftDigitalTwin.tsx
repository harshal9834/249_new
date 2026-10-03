import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Box, 
  RotateCw, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Wrench, 
  Eye, 
  Sliders, 
  Activity,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Aircraft, AircraftComponent } from '../types/fleet';

interface AircraftDigitalTwinProps {
  aircraft: Aircraft;
  onSelectAnotherAircraft?: (id: string) => void;
  allAircraft: Aircraft[];
}

export const AircraftDigitalTwin: React.FC<AircraftDigitalTwinProps> = ({
  aircraft,
  onSelectAnotherAircraft,
  allAircraft
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedComponentName, setSelectedComponentName] = useState<string>('Engine');
  const [isExploded, setIsExploded] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // References for Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const componentsGroupRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  // Find the selected component object
  const activeComponent: AircraftComponent | undefined = 
    aircraft.components.find(c => c.type.toLowerCase().includes(selectedComponentName.toLowerCase()) || c.name.toLowerCase().includes(selectedComponentName.toLowerCase())) ||
    aircraft.components[0];

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8fafc); // Crisp slate-50 aerospace clean background

    // Grid helper
    const grid = new THREE.GridHelper(30, 30, 0x94a3b8, 0xe2e8f0);
    grid.position.y = -3.2;
    scene.add(grid);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 9, 18);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting (Aerospace studio lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(15, 25, 20);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.6); // Cool sky blue fill
    dirLight2.position.set(-15, 10, -15);
    scene.add(dirLight2);

    // Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Materials
    const baseAirframeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // USAF tactical ghost grey
      metalness: 0.35,
      roughness: 0.45
    });

    const darkAccentMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Stealth gunmetal
      metalness: 0.5,
      roughness: 0.3
    });

    const engineMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Titanium alloy
      metalness: 0.7,
      roughness: 0.25
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.65
    });

    // 1. Airframe Component (Fuselage & Empennage)
    const airframeGroup = new THREE.Group();
    airframeGroup.name = 'Airframe';

    // Main fuselage cylinder
    const fuselageGeo = new THREE.CylinderGeometry(1.5, 1.45, 15, 32);
    const fuselageMesh = new THREE.Mesh(fuselageGeo, baseAirframeMat);
    fuselageMesh.rotation.z = Math.PI / 2;
    airframeGroup.add(fuselageMesh);

    // Cockpit nose cone
    const noseGeo = new THREE.ConeGeometry(1.48, 3.2, 32);
    const noseMesh = new THREE.Mesh(noseGeo, baseAirframeMat);
    noseMesh.rotation.z = -Math.PI / 2;
    noseMesh.position.x = 9.0;
    airframeGroup.add(noseMesh);

    // Nose radome tip (black/charcoal)
    const radomeGeo = new THREE.SphereGeometry(0.75, 24, 16);
    const radomeMesh = new THREE.Mesh(radomeGeo, darkAccentMat);
    radomeMesh.position.x = 10.2;
    radomeMesh.scale.set(1.4, 0.9, 0.9);
    airframeGroup.add(radomeMesh);

    // Cockpit canopy windows
    const canopyGeo = new THREE.BoxGeometry(2.2, 0.8, 1.4);
    const canopyMesh = new THREE.Mesh(canopyGeo, glassMat);
    canopyMesh.position.set(7.5, 0.9, 0);
    airframeGroup.add(canopyMesh);

    // Rear cargo ramp & tail cone
    const tailConeGeo = new THREE.ConeGeometry(1.45, 4.5, 32);
    const tailConeMesh = new THREE.Mesh(tailConeGeo, baseAirframeMat);
    tailConeMesh.rotation.z = Math.PI / 2;
    tailConeMesh.position.set(-9.6, 0.35, 0);
    airframeGroup.add(tailConeMesh);

    // Vertical Stabilizer (Fin)
    const vFinShape = new THREE.BoxGeometry(3.5, 4.2, 0.25);
    const vFinMesh = new THREE.Mesh(vFinShape, baseAirframeMat);
    vFinMesh.position.set(-10.2, 2.8, 0);
    vFinMesh.rotation.z = -0.25;
    airframeGroup.add(vFinMesh);

    // Horizontal Stabilizers
    const hTailGeo = new THREE.BoxGeometry(2.0, 0.15, 8.5);
    const hTailMesh = new THREE.Mesh(hTailGeo, baseAirframeMat);
    hTailMesh.position.set(-10.8, 4.2, 0); // High T-tail C-130 / C-17 profile
    airframeGroup.add(hTailMesh);

    modelGroup.add(airframeGroup);
    componentsGroupRef.current.set('Airframe', airframeGroup);

    // 2. Fuel System (High wings with internal fuel tanks)
    const fuelGroup = new THREE.Group();
    fuelGroup.name = 'Fuel System';

    // Main high wing
    const wingGeo = new THREE.BoxGeometry(3.2, 0.45, 22.0);
    const wingMesh = new THREE.Mesh(wingGeo, baseAirframeMat);
    wingMesh.position.set(1.2, 1.45, 0);
    fuelGroup.add(wingMesh);

    // External drop tanks (fuel tanks mounted on pylons)
    const tankGeo = new THREE.CylinderGeometry(0.5, 0.5, 4.8, 16);
    const tankLeft = new THREE.Mesh(tankGeo, darkAccentMat);
    tankLeft.rotation.z = Math.PI / 2;
    tankLeft.position.set(1.2, 0.2, 6.2);
    fuelGroup.add(tankLeft);

    const tankRight = new THREE.Mesh(tankGeo, darkAccentMat);
    tankRight.rotation.z = Math.PI / 2;
    tankRight.position.set(1.2, 0.2, -6.2);
    fuelGroup.add(tankRight);

    modelGroup.add(fuelGroup);
    componentsGroupRef.current.set('Fuel System', fuelGroup);

    // 3. Engine System (4 Turboprop / Turbofan nacelles with propeller disks)
    const engineGroup = new THREE.Group();
    engineGroup.name = 'Engine';

    const nacelleGeo = new THREE.CylinderGeometry(0.75, 0.8, 4.2, 24);
    const propGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.04, 32);
    const propMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      metalness: 0.8
    });

    const enginePositions = [-7.8, -3.8, 3.8, 7.8];
    enginePositions.forEach((posZ, idx) => {
      const nacelle = new THREE.Mesh(nacelleGeo, engineMat);
      nacelle.rotation.z = Math.PI / 2;
      nacelle.position.set(1.5, 1.1, posZ);
      engineGroup.add(nacelle);

      // Propeller spinner & disk
      const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 16), darkAccentMat);
      spinner.rotation.z = -Math.PI / 2;
      spinner.position.set(3.8, 1.1, posZ);
      engineGroup.add(spinner);

      const propDisk = new THREE.Mesh(propGeo, propMat);
      propDisk.rotation.z = Math.PI / 2;
      propDisk.position.set(3.6, 1.1, posZ);
      engineGroup.add(propDisk);
    });

    modelGroup.add(engineGroup);
    componentsGroupRef.current.set('Engine', engineGroup);

    // 4. Avionics System (Cockpit instrumentation & forward radome bay)
    const avionicsGroup = new THREE.Group();
    avionicsGroup.name = 'Avionics';

    const aesaGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.3, 24);
    const aesaMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8, roughness: 0.2 });
    const aesaMesh = new THREE.Mesh(aesaGeo, aesaMat);
    aesaMesh.rotation.z = Math.PI / 2;
    aesaMesh.position.set(8.8, 0.1, 0);
    avionicsGroup.add(aesaMesh);

    // Antennas & Pitot tubes
    const pitotGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
    const pitotMesh = new THREE.Mesh(pitotGeo, darkAccentMat);
    pitotMesh.rotation.z = Math.PI / 2;
    pitotMesh.position.set(10.8, 0.2, 0.3);
    avionicsGroup.add(pitotMesh);

    modelGroup.add(avionicsGroup);
    componentsGroupRef.current.set('Avionics', avionicsGroup);

    // 5. Hydraulic System (Landing gear sponsons & actuator manifolds)
    const hydGroup = new THREE.Group();
    hydGroup.name = 'Hydraulic System';

    // Left and Right fuselage sponsons housing gear & hydraulic actuators
    const sponsonGeo = new THREE.BoxGeometry(6.5, 1.2, 0.9);
    const hydMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4, roughness: 0.4 });
    const sponsonLeft = new THREE.Mesh(sponsonGeo, hydMat);
    sponsonLeft.position.set(0.5, -0.6, 1.6);
    hydGroup.add(sponsonLeft);

    const sponsonRight = new THREE.Mesh(sponsonGeo, hydMat);
    sponsonRight.position.set(0.5, -0.6, -1.6);
    hydGroup.add(sponsonRight);

    modelGroup.add(hydGroup);
    componentsGroupRef.current.set('Hydraulic System', hydGroup);

    // 6. Landing Gear System (Nose gear & tandem multi-wheel main bogies)
    const gearGroup = new THREE.Group();
    gearGroup.name = 'Landing Gear';

    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });

    // Nose Gear
    const noseStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), strutMat);
    noseStrut.position.set(7.2, -1.8, 0);
    gearGroup.add(noseStrut);

    const noseWheel = new THREE.Mesh(wheelGeo, wheelMat);
    noseWheel.position.set(7.2, -2.6, 0);
    gearGroup.add(noseWheel);

    // Main Gear Wheels under sponsons (Tandem 4 wheels left, 4 wheels right)
    [-0.8, 0.4, 1.6].forEach(posX => {
      const wL = new THREE.Mesh(wheelGeo, wheelMat);
      wL.position.set(posX, -2.4, 1.6);
      gearGroup.add(wL);

      const wR = new THREE.Mesh(wheelGeo, wheelMat);
      wR.position.set(posX, -2.4, -1.6);
      gearGroup.add(wR);
    });

    modelGroup.add(gearGroup);
    componentsGroupRef.current.set('Landing Gear', gearGroup);

    // 7. Electrical System (Auxiliary Power Unit APU & Bus Routing)
    const elecGroup = new THREE.Group();
    elecGroup.name = 'Electrical System';

    // APU exhaust & electrical generator blister
    const apuGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.6, 16);
    const elecMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.6, roughness: 0.3 });
    const apuMesh = new THREE.Mesh(apuGeo, elecMat);
    apuMesh.rotation.z = Math.PI / 2;
    apuMesh.position.set(1.2, -0.6, 1.95);
    elecGroup.add(apuMesh);

    modelGroup.add(elecGroup);
    componentsGroupRef.current.set('Electrical System', elecGroup);

    // Raycasting for interactive click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(modelGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent && obj.parent !== modelGroup) {
          obj = obj.parent;
        }
        if (obj && obj.name) {
          setSelectedComponentName(obj.name);
        }
      }
    };

    container.addEventListener('pointerdown', onPointerDown);

    // Orbit Drag Controls (Manual lightweight orbit implementation)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      modelGroup.rotation.y += deltaX * 0.008;
      modelGroup.rotation.x = Math.max(-0.6, Math.min(0.6, modelGroup.rotation.x + deltaY * 0.005));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(8, Math.min(35, camera.position.z + e.deltaY * 0.02));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDragging) {
        modelGroup.rotation.y += 0.005;
      }

      // Propeller spin simulation
      propGeo.parameters.radiusTop; // noop

      renderer.render(scene, camera);
    };
    animate();

    // Window resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 560;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update component highlighting and exploded view
  useEffect(() => {
    componentsGroupRef.current.forEach((group, compName) => {
      const isSelected = compName.toLowerCase() === selectedComponentName.toLowerCase();

      // Highlight logic
      group.traverse(child => {
        if (child instanceof THREE.Mesh) {
          if (child.material) {
            child.material.wireframe = isWireframe;
            if (isSelected) {
              child.material.emissive = new THREE.Color(0x3b82f6);
              child.material.emissiveIntensity = 0.45;
            } else {
              child.material.emissive = new THREE.Color(0x000000);
              child.material.emissiveIntensity = 0.0;
            }
          }
        }
      });

      // Exploded View offset logic
      if (isExploded) {
        if (compName === 'Engine') group.position.set(0, 0, 0).set(1.5, 1.2, 0);
        else if (compName === 'Fuel System') group.position.set(0, 2.5, 0);
        else if (compName === 'Landing Gear') group.position.set(0, -2.0, 0);
        else if (compName === 'Avionics') group.position.set(2.5, 0, 0);
        else if (compName === 'Hydraulic System') group.position.set(0, 0, 2.0);
        else if (compName === 'Electrical System') group.position.set(0, -1.2, 1.5);
      } else {
        group.position.set(0, 0, 0);
      }
    });
  }, [selectedComponentName, isExploded, isWireframe]);

  const componentsList = [
    'Engine',
    'Fuel System',
    'Hydraulic System',
    'Avionics',
    'Electrical System',
    'Landing Gear',
    'Airframe'
  ];

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(16, 9, 18);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

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

      {/* 3D Viewport & Component Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Canvas Box (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-50 rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col relative">
          {/* Top Controls Toolbar */}
          <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase">Interactive 3D Viewport</span>
              <span className="text-[11px] text-slate-400">| Left Click + Drag to Orbit • Scroll to Zoom</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Exploded View Toggle */}
              <button
                onClick={() => setIsExploded(!isExploded)}
                className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors flex items-center space-x-1 ${
                  isExploded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Exploded View</span>
              </button>

              {/* Wireframe Toggle */}
              <button
                onClick={() => setIsWireframe(!isWireframe)}
                className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors flex items-center space-x-1 ${
                  isWireframe ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>Wireframe</span>
              </button>

              {/* Auto-Rotate Toggle */}
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded border transition-colors ${
                  autoRotate ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-200'
                }`}
                title="Toggle Auto-Rotation"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* Reset Camera */}
              <button
                onClick={resetView}
                className="p-1.5 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                title="Reset Camera Angle"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3D Three.js Container */}
          <div ref={containerRef} className="w-full h-[540px] cursor-grab active:cursor-grabbing relative" />

          {/* Bottom Component Hotspot Quick-Selectors */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Select Component:
            </span>
            {componentsList.map(name => {
              const isSelected = selectedComponentName.toLowerCase() === name.toLowerCase();
              return (
                <button
                  key={name}
                  onClick={() => setSelectedComponentName(name)}
                  className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Component Inspection Panel (1 Column) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
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
                    {activeComponent?.temperature || 620}°C
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Vibration:</span>
                  <span className={`font-mono font-bold ${(activeComponent?.vibration || 2.4) > 2.0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {activeComponent?.vibration || 2.4} IPS
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Oil Pressure:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeComponent?.oilPressure || 48} PSI
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Fuel Flow:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeComponent?.fuelFlow || 3850} PPH
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

          <div className="pt-3 border-t border-slate-100 text-right">
            <span className="text-[11px] text-slate-400 font-mono">Telemetry Sync: Online (MIL-1553B)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
