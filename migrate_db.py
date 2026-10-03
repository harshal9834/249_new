import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded inventory endpoints with Prisma calls
inventory_replacement = """app.get('/api/inventory', async (_req: Request, res: Response) => {
  try {
    const parts = await prisma.sparePart.findMany();
    // If empty, seed some initial parts to prevent blank screens
    if (parts.length === 0) {
      await prisma.sparePart.createMany({
        data: [
          { name: 'Turbofan Compressor Blade', category: 'Propulsion', stockQuantity: 42, unitCost: 12500, leadTimeDays: 45 },
          { name: 'Hydraulic Actuator', category: 'Hydraulics', stockQuantity: 8, unitCost: 4500, leadTimeDays: 14 },
          { name: 'AESA Radar Module', category: 'Avionics', stockQuantity: 2, unitCost: 85000, leadTimeDays: 120 }
        ]
      });
      const newParts = await prisma.sparePart.findMany();
      res.json(newParts);
      return;
    }
    res.json(parts);
  } catch(e) { res.status(500).json({ error: 'DB Error' }); }
});

app.post('/api/inventory/reorder', async (req: Request, res: Response) => {
  try {
    const { partId, quantity } = req.body;
    const part = await prisma.sparePart.findUnique({ where: { id: partId } });
    if (!part) { res.status(404).json({ error: 'Part not found' }); return; }
    await prisma.sparePart.update({
      where: { id: partId },
      data: { stockQuantity: part.stockQuantity + quantity }
    });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'DB Error' }); }
});"""

content = re.sub(
    r"app\.get\('/api/inventory',[\s\S]*?app\.post\('/api/inventory/reorder',[\s\S]*?return;\n\s*\}\n\s*part\.stockQuantity \+= quantity;\n\s*res\.json\(part\);\n\}\);",
    inventory_replacement,
    content
)

# Replace agencies endpoints with Prisma calls
agencies_replacement = """app.get('/api/agencies', async (_req: Request, res: Response) => {
  try {
    const agencies = await prisma.maintenanceAgency.findMany();
    if (agencies.length === 0) {
      await prisma.maintenanceAgency.createMany({
        data: [
          { name: '388th Maintenance Group (Base)', location: 'Hill AFB', tier: 'Tier 1' },
          { name: 'Ogden Air Logistics Complex (Depot)', location: 'Hill AFB', tier: 'Tier 3' }
        ]
      });
      const newAg = await prisma.maintenanceAgency.findMany();
      res.json(newAg);
      return;
    }
    res.json(agencies);
  } catch(e) { res.status(500).json({ error: 'DB Error' }); }
});"""

content = re.sub(
    r"app\.get\('/api/maintenance/agencies',[\s\S]*?res\.json\(maintenanceAgencies\);\n\}\);",
    agencies_replacement,
    content
)

# Remove the hardcoded arrays at the top to clean up memory
content = re.sub(r"const sparePartsInventory: SparePartItem\[\] = \[[\s\S]*?\];", "", content)
content = re.sub(r"const maintenanceAgencies: MaintenanceAgency\[\] = \[[\s\S]*?\];", "", content)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
