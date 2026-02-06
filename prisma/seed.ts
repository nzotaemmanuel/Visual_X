import { PrismaClient, UserType, AccountStatus, SlotStatus, TicketStatus, PaymentMethod, ViolationStatus, ActionType, ActionStatus, PaymentStatus, AppealStatus, RequestStatus } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Starting Comprehensive Seeding...')

  // -------------------------------------------------------------------------
  // 1. IDENTITY & ACCESS MANAGEMENT
  // -------------------------------------------------------------------------
  console.log('👥 Seeding Users...')

  const staff = [
    { email: 'admin@laspa.lagos.gov.ng', firstName: 'System', lastName: 'Admin', type: UserType.ADMIN },
    { email: 'agent@laspa.lagos.gov.ng', firstName: 'Parking', lastName: 'Agent', type: UserType.PARKING_AGENT },
    { email: 'officer.ade@laspa.lagos.gov.ng', firstName: 'Ade', lastName: 'Olawale', type: UserType.ENFORCEMENT_AGENT },
    { email: 'officer.chi@laspa.lagos.gov.ng', firstName: 'Chidi', lastName: 'Nnamdi', type: UserType.ENFORCEMENT_AGENT },
  ]

  const seededStaff = []
  for (const s of staff) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        phoneNumber: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
        userType: s.type,
        accountStatus: AccountStatus.ACTIVE,
      },
    })
    seededStaff.push(user)
  }

  const customers = [
    { email: 'john.doe@gmail.com', firstName: 'John', lastName: 'Doe' },
    { email: 'jane.smith@yahoo.com', firstName: 'Jane', lastName: 'Smith' },
    { email: 'tunde.bakare@outlook.com', firstName: 'Tunde', lastName: 'Bakare' },
  ]

  const seededCustomers = []
  for (const c of customers) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        phoneNumber: `+23470${Math.floor(10000000 + Math.random() * 90000000)}`,
        userType: UserType.CUSTOMER,
        accountStatus: AccountStatus.ACTIVE,
        customerReferenceId: `CUST-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      },
    })
    seededCustomers.push(user)
  }

  // -------------------------------------------------------------------------
  // 2. VEHICLES
  // -------------------------------------------------------------------------
  console.log('🚗 Seeding Vehicles...')
  const plateNumbers = ['KJA-101-AA', 'LND-202-XY', 'IKD-303-ZZ', 'APP-404-BC', 'MUS-505-DE']
  const seededVehicles = []

  for (let i = 0; i < plateNumbers.length; i++) {
    const owner = seededCustomers[i % seededCustomers.length]
    const vehicle = await prisma.vehicle.upsert({
      where: { plateNumber: plateNumbers[i] },
      update: {},
      create: {
        plateNumber: plateNumbers[i],
        userId: owner.id,
        plateCode: plateNumbers[i].split('-')[0],
        plateSource: 'Lagos',
        plateType: 'Private',
        isDefault: i < seededCustomers.length
      }
    })
    seededVehicles.push(vehicle)
  }

  // -------------------------------------------------------------------------
  // 3. PARKING INFRASTRUCTURE
  // -------------------------------------------------------------------------
  console.log('🏙️ Seeding Zones, Bays, and Slots...')
  const zonesData = [
    { zoneCode: 'IKJ111', zoneName: 'Ikeja' },
    { zoneCode: 'LAS114', zoneName: 'Lagos Island' },
    { zoneCode: 'OSS118', zoneName: 'Oshodi-Isolo' },
  ]

  for (const z of zonesData) {
    const zone = await prisma.parkingZone.upsert({
      where: { zoneCode: z.zoneCode },
      update: {},
      create: z
    })

    // Create 2 Bays per Zone
    for (let b = 1; b <= 2; b++) {
      const bayCode = `${z.zoneCode}-BAY-0${b}`
      const bay = await prisma.parkingBay.upsert({
        where: { bayCode },
        update: {},
        create: {
          bayCode,
          bayName: `${z.zoneName} Main Street ${b}`,
          zoneId: zone.id,
          address: `${b * 10} Obafemi Awolowo Way, ${z.zoneName}`,
          capacityLanes: 5,
          baseFee: 200.00,
          operatingHours: { open: "08:00", close: "20:00" }
        }
      })

      // Create 5 Slots per Bay
      for (let s = 1; s <= 5; s++) {
        await prisma.parkingSlot.create({
          data: {
            bayId: bay.id,
            slotNumber: `SLOT-0${s}`,
            status: Math.random() > 0.3 ? SlotStatus.AVAILABLE : SlotStatus.OCCUPIED,
            sensorId: `SN-${bayCode}-${s}`
          }
        })
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4. TICKETS & TRANSACTIONS
  // -------------------------------------------------------------------------
  console.log('🎫 Seeding Tickets...')
  const allBays = await prisma.parkingBay.findMany()

  for (let t = 0; t < 5; t++) {
    const customer = seededCustomers[t % seededCustomers.length]
    const vehicle = seededVehicles[t % seededVehicles.length]
    const bay = allBays[t % allBays.length]

    const startTime = new Date()
    startTime.setHours(startTime.getHours() - (t + 1))
    const expiryTime = new Date(startTime)
    expiryTime.setHours(expiryTime.getHours() + 2)

    const ticket = await prisma.parkingTicket.create({
      data: {
        transactionRef: `TXN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        customerId: customer.id,
        vehicleId: vehicle.id,
        bayId: bay.id,
        amountPaid: 400.00,
        durationHours: 2,
        startTime,
        expiryTime,
        status: t === 0 ? TicketStatus.EXPIRED : TicketStatus.ACTIVE,
        paymentMethod: PaymentMethod.WALLET,
        channel: 'MOBILE_APP'
      }
    })

    // Create Receipt
    await prisma.receipt.create({
      data: {
        ticketId: ticket.id,
        receiptNumber: `REC-${ticket.transactionRef.split('-')[1]}`,
        pdfUrl: `https://storage.laspa.gov.ng/receipts/${ticket.id}.pdf`
      }
    })
  }

  // -------------------------------------------------------------------------
  // 5. ENFORCEMENT & VIOLATIONS
  // -------------------------------------------------------------------------
  console.log('⚖️ Seeding Violations and Enforcement...')

  // Seed basic violation types first (if not exist)
  const vTypes = [
    { code: 'PV01', description: 'Illegal Parking', fee: 25000 },
    { code: 'PHD01', description: 'Handicap Spot Violation', fee: 50000 },
    { code: 'PFL00', description: 'Fire Lane Obstruction', fee: 100000 },
  ]

  const seededVTypes = []
  for (const vt of vTypes) {
    const type = await prisma.violationType.upsert({
      where: { code: vt.code },
      update: {},
      create: {
        code: vt.code,
        description: vt.description,
        defaultFee: vt.fee,
        severityLevel: vt.code === 'PFL00' ? 5 : 2
      }
    })
    seededVTypes.push(type)
  }

  const officers = seededStaff.filter(s => s.userType === UserType.ENFORCEMENT_AGENT)
  const zones = await prisma.parkingZone.findMany()

  for (let v = 0; v < 3; v++) {
    const vehicle = seededVehicles[v]
    const customer = seededCustomers[v % seededCustomers.length]
    const type = seededVTypes[v % seededVTypes.length]
    const officer = officers[v % officers.length]
    const zone = zones[v % zones.length]

    const violation = await prisma.customerViolation.create({
      data: {
        referenceId: `VIO-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        userId: customer.id,
        vehicleId: vehicle.id,
        violationTypeId: type.id,
        zoneId: zone.id,
        violationDate: new Date(),
        feeAmount: type.defaultFee,
        status: v === 0 ? ViolationStatus.PAID : ViolationStatus.OUTSTANDING,
        enforcementOfficerId: officer.id,
        locationDescription: `Near ${zone.zoneName} Square`
      }
    })

    // Create Fine
    await prisma.fine.create({
      data: {
        violationId: violation.id,
        amount: violation.feeAmount,
        isPaid: v === 0,
        paymentDate: v === 0 ? new Date() : null
      }
    })

    // Create Enforcement Action for the 2nd violation
    if (v === 1) {
      await prisma.enforcementAction.create({
        data: {
          violationId: violation.id,
          actionType: ActionType.CLAMP,
          referenceId: `ACT-${violation.referenceId.split('-')[1]}`,
          requestedBy: officer.id,
          status: ActionStatus.COMPLETED
        }
      })
    }

    // Create Appeal for the 3rd violation
    if (v === 2) {
      await prisma.appeal.create({
        data: {
          violationId: violation.id,
          userId: customer.id,
          appealReason: "I was only there for 2 minutes to drop off a medical delivery.",
          status: AppealStatus.PENDING
        }
      })
    }
  }

  // -------------------------------------------------------------------------
  // 6. PARKING REQUESTS
  // -------------------------------------------------------------------------
  console.log('📬 Seeding Parking Requests...')
  for (let r = 0; r < 5; r++) {
    const customer = seededCustomers[r % seededCustomers.length]
    const vehicle = seededVehicles[r % seededVehicles.length]
    const zone = zones[r % zones.length]

    await prisma.parkingRequest.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        zoneId: zone.id,
        startTime: new Date(Date.now() + (r * 3600000)), // Requests starting in 0-4 hours
        durationHours: 1 + Math.floor(Math.random() * 4),
        status: r === 0 ? RequestStatus.PENDING : RequestStatus.APPROVED
      }
    })
  }

  console.log('✅ Seeding Complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
