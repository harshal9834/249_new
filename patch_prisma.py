import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

new_schema = """// AeroPulse AI - Prisma Database Schema
// Unified Air Fleet Predictive Maintenance & Digital Twin Platform
// Database: PostgreSQL

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum AircraftStatus {
  OPERATIONAL
  WARNING
  MAINTENANCE
  CRITICAL
}

enum OperatingPhase {
  GROUND_IDLE
  TAXI
  TAKEOFF
  CLIMB
  CRUISE
  LOITER
  DESCENT
  LANDING
}

model Aircraft {
  id              String             @id
  name            String
  tailNumber      String             @unique
  status          AircraftStatus     @default(OPERATIONAL)
  operatingPhase  OperatingPhase     @default(GROUND_IDLE)
  healthScore     Float              @default(100.0)
  flightHours     Float              @default(0.0)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  engines         Engine[]
  telemetry       Telemetry[]
  faults          Fault[]
  maintenanceLogs MaintenanceRecord[]
  predictions     AiPrediction[]
  digitalTwin     DigitalTwinState?
}

model Engine {
  id              String            @id @default(uuid())
  aircraftId      String
  serialNumber    String            @unique
  healthScore     Float             @default(100.0)
  vibrationBase   Float             @default(0.2)
  temperatureBase Float             @default(400)
  
  aircraft        Aircraft          @relation(fields: [aircraftId], references: [id], onDelete: Cascade)
}

model Telemetry {
  time            DateTime          @default(now())
  aircraftId      String
  rpm             Float
  temperature     Float
  vibration       Float
  oilPressure     Float
  fuelFlow        Float
  throttle        Float
  speed           Float
  altitude        Float
  outsideAirTemp  Float
  weight          Float
  engineLoad      Float
  climbRate       Float
  heading         Float
  bankAngle       Float
  pitchAngle      Float
  verticalSpeed   Float

  aircraft        Aircraft          @relation(fields: [aircraftId], references: [id], onDelete: Cascade)

  @@id([time, aircraftId])
}

model Fault {
  id              String            @id @default(uuid())
  aircraftId      String
  type            String            // e.g. "ENGINE_OVERHEAT"
  description     String
  isActive        Boolean           @default(true)
  injectedAt      DateTime          @default(now())
  resolvedAt      DateTime?

  aircraft        Aircraft          @relation(fields: [aircraftId], references: [id], onDelete: Cascade)
}

model MaintenanceRecord {
  id              String            @id @default(uuid())
  aircraftId      String
  agencyId        String
  actionTaken     String
  cost            Float
  downtimeHours   Float
  performedAt     DateTime          @default(now())

  aircraft        Aircraft          @relation(fields: [aircraftId], references: [id], onDelete: Cascade)
  agency          MaintenanceAgency @relation(fields: [agencyId], references: [id])
}

model AiPrediction {
  id              String            @id @default(uuid())
  aircraftId      String
  anomalyDetected Boolean           @default(false)
  confidenceScore Float
  reason          String
  evidence        String
  impact          String
  recommendation  String
  predictedFailureTime Float
  createdAt       DateTime          @default(now())

  aircraft        Aircraft          @relation(fields: [aircraftId], references: [id], onDelete: Cascade)
}

model SparePart {
  id              String            @id @default(uuid())
  name            String
  partNumber      String            @unique
  stockQuantity   Int
  minThreshold    Int
  unitCost        Float
}

model MaintenanceAgency {
  id              String            @id @default(uuid())
  name            String
  location        String
  tier            String

  records         MaintenanceRecord[]
}

model DigitalTwinState {
  id              String            @id @default(uuid())
  aircraftId      String            @unique
  colorHex        String            @default("#ffffff")
  engineShakeLevel Float            @default(0.0)
  highlightAreas  String[]
  lastUpdated     DateTime          @default(now())

  aircraft        Aircraft          @relation(fields: [aircraftId], references: [id], onDelete: Cascade)
}
"""

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(new_schema)
