import { PrismaClient, UserType, AccountStatus } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding ...')

  // 1. Seed Users (Admin, Agent, Officer)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@laspa.lagos.gov.ng' },
    update: {},
    create: {
      email: 'admin@laspa.lagos.gov.ng',
      firstName: 'System',
      lastName: 'Admin',
      phoneNumber: '+2348000000000',
      userType: UserType.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
    },
  })

  const agent = await prisma.user.upsert({
    where: { email: 'agent@laspa.lagos.gov.ng' },
    update: {},
    create: {
      email: 'agent@laspa.lagos.gov.ng',
      firstName: 'Parking',
      lastName: 'Agent',
      phoneNumber: '+2348000000001',
      userType: UserType.PARKING_AGENT,
      accountStatus: AccountStatus.ACTIVE,
    },
  })

  const officer = await prisma.user.upsert({
    where: { email: 'officer@laspa.lagos.gov.ng' },
    update: {},
    create: {
      email: 'officer@laspa.lagos.gov.ng',
      firstName: 'Enforcement',
      lastName: 'Officer',
      phoneNumber: '+2348000000002',
      userType: UserType.ENFORCEMENT_AGENT,
      accountStatus: AccountStatus.ACTIVE,
    },
  })

  console.log({ admin, agent, officer })

  // 2. Seed Parking Zones
  const zoneIkeja = await prisma.parkingZone.upsert({
    where: { zoneCode: 'IKJ111' },
    update: {},
    create: {
      zoneCode: 'IKJ111',
      zoneName: 'Ikeja G.R.A',
    },
  })

  const zoneIkorodu = await prisma.parkingZone.upsert({
    where: { zoneCode: 'IKD112' },
    update: {},
    create: {
      zoneCode: 'IKD112',
      zoneName: 'Ikorodu Central',
    },
  })

  console.log({ zoneIkeja, zoneIkorodu })

  // 3. Seed Violation Types
  const violationPV01 = await prisma.violationType.upsert({
    where: { code: 'PV01' },
    update: {},
    create: {
      code: 'PV01',
      description: 'Illegal Parking (No Parking Zone)',
      defaultFee: 25000.00,
      severityLevel: 2,
    },
  })

  const violationPHD01 = await prisma.violationType.upsert({
    where: { code: 'PHD01' },
    update: {},
    create: {
      code: 'PHD01',
      description: 'Unauthorized Parking in Handicap Spot',
      defaultFee: 50000.00,
      severityLevel: 3,
    },
  })

  const violationPFL00 = await prisma.violationType.upsert({
    where: { code: 'PFL00' },
    update: {},
    create: {
      code: 'PFL00',
      description: 'Blocking Fire Lane',
      defaultFee: 100000.00,
      severityLevel: 5,
    },
  })

  console.log({ violationPV01, violationPHD01, violationPFL00 })

  console.log('Seeding finished.')
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
