import re

# 1. Fix App.tsx handlers and Header missing props
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Replace the handlers block
handlers_old = """  const handleAddNewAircraft = async (newAc: Partial<Aircraft>) => {
    try {
      const res = await fetch('/api/aircraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAc)
      });
      if (res.ok) {
        const created = await res.json();
        setAircraftList(prev => [created, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id: string, status: AircraftStatus) => {
    try {
      const res = await fetch(`/api/aircraft/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setAircraftList(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (e) {
      console.error(e);
    }
  };"""
handlers_new = """  const handleAddNewAircraft = async (newAc: Partial<Aircraft>) => {
    store.addAircraft(newAc.name || 'New Aircraft', newAc.category || 'Fighter');
  };

  const handleUpdateStatus = async (id: string, status: AircraftStatus) => {
    // Simulator computes status from health automatically
  };"""
app_content = app_content.replace(handlers_old, handlers_new)

# Let's fix the Header in App.tsx missing `onOpenSimulator` if it is really missing.
header_search = "onOpenNotifications={() => setActiveModule('notifications')}\n        />"
if header_search in app_content:
    app_content = app_content.replace(header_search, "onOpenNotifications={() => setActiveModule('notifications')}\n          onOpenSimulator={() => setActiveModule('simulator')}\n        />")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)

# 2. Fix AircraftDigitalTwin TS errors
with open('src/components/AircraftDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    ac_content = f.read()

ac_content = ac_content.replace("m.wireframe = isWireframe;", "(m as any).wireframe = isWireframe;")
ac_content = ac_content.replace("(mesh.material as THREE.Material).wireframe = isWireframe;", "(mesh.material as any).wireframe = isWireframe;")

# Re-add activeComponent
ac_content = ac_content.replace(
    "const [resetToken, setResetToken] = useState(0);",
    "const [resetToken, setResetToken] = useState(0);\n  const activeComponent = aircraft.components.find(c => c.type.toLowerCase().includes(selectedComponentName.toLowerCase()) || c.name.toLowerCase().includes(selectedComponentName.toLowerCase())) || aircraft.components[0];"
)

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(ac_content)

# 3. Fix EngineDigitalTwin TS errors
with open('src/components/EngineDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    en_content = f.read()

en_content = en_content.replace("m.wireframe = isWireframe;", "(m as any).wireframe = isWireframe;")
en_content = en_content.replace("(mesh.material as THREE.Material).wireframe = isWireframe;", "(mesh.material as any).wireframe = isWireframe;")

with open('src/components/EngineDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(en_content)
