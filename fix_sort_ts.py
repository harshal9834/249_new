import re

with open('src/components/AircraftManagement.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "if (valA === undefined) valA = '';\n      if (valB === undefined) valB = '';\n      \n      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;\n      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;",
    "if (valA === undefined) valA = '';\n      if (valB === undefined) valB = '';\n      \n      if ((valA as any) < (valB as any)) return sortDirection === 'asc' ? -1 : 1;\n      if ((valA as any) > (valB as any)) return sortDirection === 'asc' ? 1 : -1;"
)

# wait, does this code even exist like that?
# Let's just blindly regex replace the comparisons
content = re.sub(r'if \(valA < valB\)', 'if ((valA as any) < (valB as any))', content)
content = re.sub(r'if \(valA > valB\)', 'if ((valA as any) > (valB as any))', content)

with open('src/components/AircraftManagement.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
