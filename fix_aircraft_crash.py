import re

with open('src/components/AircraftDigitalTwin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the material cloning safely
safe_clone = """        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map(m => m.clone());
            child.material.forEach(m => m.wireframe = isWireframe);
          } else {
            child.material = child.material.clone();
            child.material.wireframe = isWireframe;
          }
        }"""
        
content = re.sub(r"        child\.material = child\.material\.clone\(\);\n        child\.material\.wireframe = isWireframe;", safe_clone, content)

with open('src/components/AircraftDigitalTwin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
