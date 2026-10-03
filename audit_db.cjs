const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAudit() {
  console.log("====================================================");
  console.log("PHASE 2 — TIMESCALEDB AUDIT");
  console.log("====================================================\n");

  try {
    // 1. Verify Connections & Row Counts
    const aircraftCount = await prisma.aircraft.count();
    const telemetryCount = await prisma.telemetry.count();
    const faultCount = await prisma.fault.count();
    const maintenanceCount = await prisma.maintenanceRecord.count();
    const sparePartCount = await prisma.sparePart.count();
    const agencyCount = await prisma.maintenanceAgency.count();

    console.log("--- TABLE ROW COUNTS ---");
    console.log(`Aircraft: ${aircraftCount}`);
    console.log(`Telemetry: ${telemetryCount}`);
    console.log(`Faults: ${faultCount}`);
    console.log(`Maintenance Records: ${maintenanceCount}`);
    console.log(`Spare Parts: ${sparePartCount}`);
    console.log(`Maintenance Agencies: ${agencyCount}`);
    
    // 2. Validate Telemetry Inserts (Simulate a wait and check if it increases)
    console.log("\n--- LIVE INSERT VALIDATION ---");
    console.log("Waiting 1 second to verify 10Hz telemetry inserts are running in the background...");
    const initialTelCount = await prisma.telemetry.count();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const finalTelCount = await prisma.telemetry.count();
    
    if (finalTelCount > initialTelCount) {
        console.log(`✅ SUCCESS: Telemetry count increased from ${initialTelCount} to ${finalTelCount}. Real-time inserts are working!`);
    } else {
        console.log(`❌ FAILURE: Telemetry count remained at ${initialTelCount}. Simulator inserts are stalled or failing.`);
    }

    // 3. Schema Checks
    console.log("\n--- SCHEMA CHECKS ---");
    const latestTel = await prisma.telemetry.findFirst({ orderBy: { time: 'desc' } });
    if (latestTel) {
        console.log(`✅ SUCCESS: Telemetry schema verified. Latest record: ${latestTel.aircraftId} @ ${latestTel.time.toISOString()}`);
    } else {
        console.log(`⚠️ WARNING: No telemetry records exist yet.`);
    }

  } catch (e) {
    console.error("❌ DB CONNECTION ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();
