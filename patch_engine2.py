import re

# 1. Update App.tsx
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace(
    "<EngineDigitalTwin\n            aircraftTailNumber={currentAircraft ? `${currentAircraft.tailNumber} (${currentAircraft.name})` : 'AF-023 (F-35A)'}\n          />",
    "<EngineDigitalTwin\n            aircraftTailNumber={currentAircraft ? `${currentAircraft.tailNumber} (${currentAircraft.name})` : 'AF-023 (F-35A)'}\n            aircraft={currentAircraft!}\n          />"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)

# 2. Update EngineDigitalTwin.tsx
with open('src/components/EngineDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    engine_content = f.read()

# Add Aircraft to imports
engine_content = engine_content.replace(
    "import { EngineStageData } from '../types/fleet';",
    "import { EngineStageData, Aircraft } from '../types/fleet';"
)

# Update Props
engine_content = engine_content.replace(
    "interface EngineDigitalTwinProps {\n  aircraftTailNumber?: string;\n}",
    "interface EngineDigitalTwinProps {\n  aircraftTailNumber?: string;\n  aircraft?: Aircraft;\n}"
)

# Update Component signature
engine_content = engine_content.replace(
    "export const EngineDigitalTwin: React.FC<EngineDigitalTwinProps> = ({\n  aircraftTailNumber = 'AF-023 (F-35A)'\n}) => {",
    "export const EngineDigitalTwin: React.FC<EngineDigitalTwinProps> = ({\n  aircraftTailNumber = 'AF-023 (F-35A)',\n  aircraft\n}) => {"
)

# Replace the EngineR3FModel to accept colors
engine_model_old = """function EngineR3FModel({ isWireframe, isRotating }: { isWireframe: boolean, isRotating: boolean }) {"""
engine_model_new = """function EngineR3FModel({ isWireframe, isRotating, engineHealth }: { isWireframe: boolean, isRotating: boolean, engineHealth: number }) {"""
engine_content = engine_content.replace(engine_model_old, engine_model_new)

# Update the R3F Model inner logic to set emissive color based on health
old_traverse = """        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.wireframe = isWireframe);
          } else {
            (mesh.material as THREE.Material).wireframe = isWireframe;
          }
        }"""
new_traverse = """        if (mesh.material) {
          let targetColor: THREE.Color | null = null;
          if (engineHealth < 40) targetColor = new THREE.Color(0xff0000);
          else if (engineHealth < 70) targetColor = new THREE.Color(0xf59e0b);
          
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => {
                m.wireframe = isWireframe;
                if (targetColor) {
                    (m as any).emissive = targetColor;
                    (m as any).emissiveIntensity = 0.5;
                } else {
                    (m as any).emissive = new THREE.Color(0x000000);
                    (m as any).emissiveIntensity = 0;
                }
            });
          } else {
            (mesh.material as THREE.Material).wireframe = isWireframe;
            if (targetColor) {
                (mesh.material as any).emissive = targetColor;
                (mesh.material as any).emissiveIntensity = 0.5;
            } else {
                (mesh.material as any).emissive = new THREE.Color(0x000000);
                (mesh.material as any).emissiveIntensity = 0;
            }
          }
        }"""
engine_content = engine_content.replace(old_traverse, new_traverse)
engine_content = engine_content.replace(
    "<EngineR3FModel isWireframe={isWireframe} isRotating={isRotating} />",
    "const engineHealth = aircraft?.components?.find(c => c.type === 'Engine')?.healthScore || 100;\n                <EngineR3FModel isWireframe={isWireframe} isRotating={isRotating} engineHealth={engineHealth} />"
)

# Overwrite hardcoded stages with mapped ones from the live aircraft engine
# The stages array starts with `const stages: EngineStageData[] = [`
# Let's replace the whole stages array declaration.
stages_regex = re.compile(r"const stages: EngineStageData\[\] = \[.*?\];", re.DOTALL)

dynamic_stages = """
  const engineComp = aircraft?.components?.find(c => c.type === 'Engine');
  const temp = engineComp?.temperature || 620;
  const vib = engineComp?.vibration || 0.8;
  const press = engineComp?.oilPressure || 45;
  const flow = engineComp?.fuelFlow || 3850;
  const rpm = engineComp?.rpm || 10450;
  
  let tempStatus = 'Operational';
  if (temp > 800) tempStatus = 'Warning';
  if (temp > 950) tempStatus = 'Critical';
  
  let vibStatus = 'Operational';
  if (vib > 1.5) vibStatus = 'Warning';
  if (vib > 2.5) vibStatus = 'Critical';

  const stages: EngineStageData[] = [
    {
      id: 'stg-comp',
      name: 'Compressor (LP & HP Stages)',
      healthScore: engineComp ? engineComp.healthScore : 81.5,
      rpm: rpm,
      temperature: temp,
      fuelFlow: flow,
      vibration: vib,
      oilPressure: press,
      rul: engineComp ? engineComp.rulHours : 54,
      status: (vibStatus as any),
      diagnostics: vibStatus === 'Critical' ? 'CRITICAL: High vibration in compressor.' : 'Nominal operation.'
    },
    {
      id: 'stg-comb',
      name: 'Annular Combustor Chamber',
      healthScore: engineComp ? Math.min(100, engineComp.healthScore + 5) : 92.0,
      rpm: rpm,
      temperature: temp + 400,
      fuelFlow: flow,
      vibration: vib * 0.8,
      oilPressure: press,
      rul: engineComp ? engineComp.rulHours : 380,
      status: (tempStatus as any),
      diagnostics: tempStatus === 'Critical' ? 'WARNING: High exhaust gas temperature.' : 'Combustion nominal.'
    },
    {
      id: 'stg-turb',
      name: 'High & Low Pressure Turbine',
      healthScore: engineComp ? engineComp.healthScore - 5 : 68.0,
      rpm: rpm * 1.3,
      temperature: temp + 200,
      fuelFlow: flow,
      vibration: vib * 1.2,
      oilPressure: press,
      rul: engineComp ? engineComp.rulHours - 10 : 38,
      status: (engineComp?.status as any) || 'Critical',
      diagnostics: engineComp?.trend === 'critical_spike' ? 'Critical telemetry spike observed.' : 'Telemetry conforming to envelope.'
    }
  ];
"""
engine_content = stages_regex.sub(dynamic_stages.strip(), engine_content)

with open('src/components/EngineDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(engine_content)
