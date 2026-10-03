import re

with open('src/components/SimulatorControlCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace dark mode classes with light mode classes
# Backgrounds
content = content.replace('bg-slate-950', 'bg-slate-50')
content = content.replace('bg-slate-900', 'bg-white')
content = content.replace('bg-slate-800/50', 'bg-white shadow-sm')
content = content.replace('bg-slate-800', 'bg-slate-100')
content = content.replace('bg-slate-700', 'bg-slate-200')
content = content.replace('border-slate-800', 'border-slate-200')
content = content.replace('border-slate-700', 'border-slate-200')

# Text colors
content = content.replace('text-slate-100', 'text-slate-900')
content = content.replace('text-slate-200', 'text-slate-800')
content = content.replace('text-slate-300', 'text-slate-700')
content = content.replace('text-slate-400', 'text-slate-500')
content = content.replace('text-white', 'text-slate-900')

# Specific section headers
content = content.replace('bg-slate-950/80', 'bg-slate-100/90')
content = content.replace('text-emerald-400', 'text-emerald-600')
content = content.replace('text-blue-400', 'text-blue-600')
content = content.replace('text-purple-400', 'text-purple-600')
content = content.replace('text-red-400', 'text-red-600')
content = content.replace('text-amber-400', 'text-amber-600')

# In XAI panel
content = content.replace('bg-blue-950/50', 'bg-blue-50')
content = content.replace('border-blue-900', 'border-blue-200')
content = content.replace('border-blue-900/50', 'border-blue-200')

# Fault/Maintenance headers
content = content.replace('bg-red-950/30', 'bg-red-50')
content = content.replace('border-red-900/50', 'border-red-200')
content = content.replace('bg-emerald-950/30', 'bg-emerald-50')
content = content.replace('border-emerald-900/50', 'border-emerald-200')

# Scrollbar
content = content.replace('background: #0f172a;', 'background: #f8fafc;')
content = content.replace('background: #334155;', 'background: #cbd5e1;')
content = content.replace('background: #475569;', 'background: #94a3b8;')

with open('src/components/SimulatorControlCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
