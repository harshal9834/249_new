const http = require('http');

const routes = [
    '/api/aircraft',
    '/api/dashboard',
    '/api/inventory',
    '/api/agencies',
    '/api/maintenance-analytics',
    '/api/maintenance_events',
    '/api/telemetry/history/C-130J-01',
    { path: '/api/faults', method: 'POST', body: '{"aircraftId":"C-130J-01","faultType":"Engine Overheat"}' }
];

async function runAudit() {
    console.log("=== PHASE 1: BACKEND ROUTE AUDIT ===");
    for (const route of routes) {
        const isPost = typeof route === 'object';
        const path = isPost ? route.path : route;
        const method = isPost ? route.method : 'GET';
        
        try {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            await new Promise((resolve, reject) => {
                const req = http.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        console.log(`[${method}] ${path} -> Status: ${res.statusCode} | Data Length: ${data.length}`);
                        if (res.statusCode === 404) {
                            console.log(`  -> ❌ ERROR: Route missing or returning 404`);
                        }
                        resolve();
                    });
                });
                
                req.on('error', e => {
                    console.log(`[${method}] ${path} -> ❌ ERROR: ${e.message}`);
                    resolve();
                });
                
                if (isPost) {
                    req.write(route.body);
                }
                req.end();
            });
        } catch (e) {
            console.error(e);
        }
    }
}

runAudit();
