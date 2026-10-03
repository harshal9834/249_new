import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

metrics_fix = """    getMetrics: () => {
        const list = get().aircraftList;
        const getCat = (cat: string) => {
            const acs = list.filter(a => a.category === cat);
            return {
                total: acs.length,
                healthy: acs.filter(a => a.status === 'Operational').length,
                warning: acs.filter(a => a.status === 'Warning').length,
                maintenance: acs.filter(a => a.status === 'Maintenance').length,
                critical: acs.filter(a => a.status === 'Critical').length,
            };
        };
        const metrics: any = {
            total: list.length,
            operational: list.filter(a => a.status === 'Operational').length,
            warning: list.filter(a => a.status === 'Warning').length,
            maintenance: list.filter(a => a.status === 'Maintenance').length,
            critical: list.filter(a => a.status === 'Critical').length,
            availabilityPct: list.length > 0 ? (list.filter(a => a.status === 'Operational').length / list.length) * 100 : 0,
            categories: {
                Fighter: getCat('Fighter'),
                Transport: getCat('Transport'),
                UAV: getCat('UAV')
            },
            mtbfHours: get().analytics.mtbfHours,
            missionReadinessRate: list.length > 0 ? (list.filter(a => a.status === 'Operational').length / list.length) * 100 : 0
        };
        return metrics;
    },"""

content = re.sub(
    r"getMetrics:\s*\(\)\s*=>\s*\{[\s\S]*?return metrics;\n\s*\},",
    metrics_fix,
    content
)

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
