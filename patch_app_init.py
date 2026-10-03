import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useEffect for initial data load
init_logic = """    const store = useSimulatorStore();
    
    useEffect(() => {
      store.fetchInitialData();
    }, []);

    const aircraftList = store.aircraftList;"""

content = re.sub(
    r"const store = useSimulatorStore\(\);\n\s*const aircraftList = store\.aircraftList;",
    init_logic,
    content
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
