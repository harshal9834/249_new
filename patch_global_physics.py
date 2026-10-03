import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a global physics loop to App.tsx so it never stops when navigating away from Simulator page
app_physics = """    const store = useSimulatorStore();
    
    // Global Physics Engine Loop (Runs independently of active page)
    useEffect(() => {
      let interval: any;
      if (store.isSimulating) {
        interval = setInterval(() => {
          store.tickSimulation();
        }, 100);
      }
      return () => clearInterval(interval);
    }, [store.isSimulating, store.tickSimulation]);

    useEffect(() => {
      store.fetchInitialData();
    }, []);"""

content = re.sub(
    r"const store = useSimulatorStore\(\);\n\s*useEffect\(\(\) => \{\n\s*store\.fetchInitialData\(\);\n\s*\}, \[\]\);",
    app_physics,
    content
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Remove it from SimulatorControlCenter.tsx to prevent duplicate ticking
with open('src/components/SimulatorControlCenter.tsx', 'r', encoding='utf-8') as f:
    sim_content = f.read()

sim_content = re.sub(
    r"useEffect\(\(\) => \{\n\s*let interval: any;\n\s*if \(store\.isSimulating\) \{\n\s*interval = setInterval\(\(\) => \{\n\s*store\.tickSimulation\(\);\n\s*\}, 100\);\n\s*\}\n\s*return \(\) => clearInterval\(interval\);\n\s*\}, \[store\.isSimulating, store\.tickSimulation\]\);\n",
    "",
    sim_content
)

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(sim_content)
