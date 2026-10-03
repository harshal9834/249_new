import re

with open('src/components/SparePartsDepot.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add safe fallbacks and empty state
safe_logic = """function safeNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) && !isNaN(n) ? n : 0;
}

export const SparePartsDepot: React.FC = () => {
  const store = useSimulatorStore();
  const inventory = store.inventory ?? [];
  const restockPart = store.restockPart;

  if (inventory.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-lg border border-slate-200">
        <AlertOctagon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-700">No inventory data available</h2>
        <p className="text-slate-500 text-sm">TimescaleDB returned an empty inventory array.</p>
      </div>
    );
  }"""

content = re.sub(
    r"export const SparePartsDepot: React\.FC = \(\) => \{\n\s*const store = useSimulatorStore\(\);\n\s*const \{ inventory, restockPart \} = store;",
    safe_logic,
    content
)

# Replace all potential undefined crashes
content = content.replace("part.stockQuantity < part.minThreshold", "safeNumber(part.stockQuantity) < safeNumber(part.minThreshold)")
content = content.replace("{part.stockQuantity}", "{safeNumber(part.stockQuantity)}")
content = content.replace("part.unitCost.toLocaleString()", "safeNumber(part.unitCost).toLocaleString()")
content = content.replace("{part.minThreshold}", "{safeNumber(part.minThreshold)}")
content = content.replace("{part.leadTimeDays}", "{safeNumber(part.leadTimeDays)}")
content = content.replace("{part.category}", "{part.category || 'General'}")
content = content.replace("{part.binLocation}", "{part.binLocation || 'A1-00'}")
content = content.replace("{part.partNumber}", "{part.partNumber || part.id}")
content = content.replace("{part.replenishmentStatus}", "{part.replenishmentStatus || 'Unknown'}")
content = content.replace("part.replenishmentStatus === 'In Stock'", "(part.replenishmentStatus || 'In Stock') === 'In Stock'")
content = content.replace("part.replenishmentStatus === 'Reorder Suggested'", "(part.replenishmentStatus || 'Unknown') === 'Reorder Suggested'")

with open('src/components/SparePartsDepot.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
