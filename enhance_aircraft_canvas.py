import re

with open('src/components/AircraftDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update PremiumAerospaceEnvironment
new_env = """function PremiumAerospaceEnvironment() {
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
      <Html position={[0, -2.4, -14]} center className="pointer-events-none"><div className="text-[10px] font-mono font-bold text-blue-500/70 tracking-widest bg-white/50 px-1 rounded backdrop-blur-sm">N 000&deg;</div></Html>
      <Html position={[0, -2.4, 14]} center className="pointer-events-none"><div className="text-[10px] font-mono font-bold text-blue-500/70 tracking-widest bg-white/50 px-1 rounded backdrop-blur-sm">S 180&deg;</div></Html>
      <Html position={[14, -2.4, 0]} center className="pointer-events-none"><div className="text-[10px] font-mono font-bold text-blue-500/70 tracking-widest bg-white/50 px-1 rounded backdrop-blur-sm">E 090&deg;</div></Html>
      <Html position={[-14, -2.4, 0]} center className="pointer-events-none"><div className="text-[10px] font-mono font-bold text-blue-500/70 tracking-widest bg-white/50 px-1 rounded backdrop-blur-sm">W 270&deg;</div></Html>
      
      {/* Subtle Digital Particles */}
      <Sparkles count={120} scale={25} size={1.2} speed={0.15} opacity={0.3} color="#0ea5e9" />
    </group>
  );
}"""
content = re.sub(r"function PremiumAerospaceEnvironment\(\) \{[\s\S]*?\}\n", new_env + "\n", content)


# 2. Update AircraftR3FModel scale and rotation speed
content = content.replace("scale={1.5}", "scale={2.5}")
content = content.replace("groupRef.current.rotation.y += 0.001;", "groupRef.current.rotation.y += 0.0005;")
content = content.replace("import { OrbitControls, Bounds, useBounds", "import { OrbitControls, Bounds, useBounds, Sparkles")

# 3. Update main UI container (remove min-h-[750px], replace with h-[600px])
content = content.replace("min-h-[750px]", "h-[600px]")

# 4. Replace 3D Container with HUD overlays
new_canvas = """          {/* 3D Container with HUD & Scanlines */}
          <div className="flex-1 w-full relative bg-[#f8fafc] overflow-hidden">
            
            {/* Telemetry HUD Overlay */}
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
            
            {/* Scanline Effect & Animation via inline style block to avoid external CSS requirements */}
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
          </div>"""
content = re.sub(r"          \{\/\* 3D Container \*\/\}[\s\S]*?<\/Canvas>\n          <\/div>", new_canvas, content)

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
