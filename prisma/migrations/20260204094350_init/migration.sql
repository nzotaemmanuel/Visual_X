-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'ADMIN', 'PARKING_AGENT', 'ENFORCEMENT_AGENT');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('WALLET', 'CARD', 'CASH', 'AIRTIME');

-- CreateEnum
CREATE TYPE "ViolationStatus" AS ENUM ('OUTSTANDING', 'PAID', 'APPEALED', 'WAIVED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CLAMP', 'TOW', 'IMPOUND');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'RELEASED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "customer_reference_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "user_type" "UserType" NOT NULL DEFAULT 'CUSTOMER',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plate_number" TEXT NOT NULL,
    "plate_code" TEXT,
    "plate_source" TEXT,
    "plate_type" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_zones" (
    "id" UUID NOT NULL,
    "zone_code" TEXT NOT NULL,
    "zone_name" TEXT NOT NULL,
    "geographical_area" geometry(Polygon, 4326),

    CONSTRAINT "parking_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_bays" (
    "id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "bay_code" TEXT NOT NULL,
    "bay_name" TEXT NOT NULL,
    "address" TEXT,
    "capacity_lanes" INTEGER NOT NULL DEFAULT 0,
    "base_fee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "operating_hours" JSONB,

    CONSTRAINT "parking_bays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_slots" (
    "id" UUID NOT NULL,
    "bay_id" UUID NOT NULL,
    "slot_number" TEXT NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "sensor_id" TEXT,

    CONSTRAINT "parking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_tickets" (
    "id" UUID NOT NULL,
    "transaction_ref" TEXT NOT NULL,
    "customer_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "bay_id" UUID NOT NULL,
    "slot_id" UUID,
    "agent_id" UUID,
    "channel" TEXT NOT NULL DEFAULT 'WEB',
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "duration_hours" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "expiry_time" TIMESTAMP(3) NOT NULL,
    "checkout_time" TIMESTAMP(3),
    "status" "TicketStatus" NOT NULL DEFAULT 'ACTIVE',
    "payment_method" "PaymentMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parking_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdf_url" TEXT,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violation_types" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "default_fee" DECIMAL(10,2) NOT NULL,
    "severity_level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "violation_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_violations" (
    "id" UUID NOT NULL,
    "reference_id" TEXT NOT NULL,
    "ticket_id" UUID,
    "user_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "violation_type_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "location_description" TEXT,
    "violation_date" TIMESTAMP(3) NOT NULL,
    "fee_amount" DECIMAL(10,2) NOT NULL,
    "status" "ViolationStatus" NOT NULL DEFAULT 'OUTSTANDING',
    "enforcement_officer_id" UUID NOT NULL,
    "evidence_images" JSONB,

    CONSTRAINT "customer_violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enforcement_actions" (
    "id" UUID NOT NULL,
    "violation_id" UUID NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "reference_id" TEXT NOT NULL,
    "requested_by" UUID NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "release_date" TIMESTAMP(3),
    "towing_company" TEXT,
    "impound_lot_location" TEXT,

    CONSTRAINT "enforcement_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fines" (
    "id" UUID NOT NULL,
    "violation_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "payment_date" TIMESTAMP(3),

    CONSTRAINT "fines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appeals" (
    "id" UUID NOT NULL,
    "violation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "appeal_reason" TEXT NOT NULL,
    "attachments" JSONB,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "reviewer_id" UUID,
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appeals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_customer_reference_id_key" ON "users"("customer_reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "parking_zones_zone_code_key" ON "parking_zones"("zone_code");

-- CreateIndex
CREATE UNIQUE INDEX "parking_bays_bay_code_key" ON "parking_bays"("bay_code");

-- CreateIndex
CREATE UNIQUE INDEX "parking_tickets_transaction_ref_key" ON "parking_tickets"("transaction_ref");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_number_key" ON "receipts"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "violation_types_code_key" ON "violation_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "customer_violations_reference_id_key" ON "customer_violations"("reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "enforcement_actions_reference_id_key" ON "enforcement_actions"("reference_id");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_bays" ADD CONSTRAINT "parking_bays_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "parking_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_bay_id_fkey" FOREIGN KEY ("bay_id") REFERENCES "parking_bays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_tickets" ADD CONSTRAINT "parking_tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_tickets" ADD CONSTRAINT "parking_tickets_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_tickets" ADD CONSTRAINT "parking_tickets_bay_id_fkey" FOREIGN KEY ("bay_id") REFERENCES "parking_bays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_tickets" ADD CONSTRAINT "parking_tickets_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "parking_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_tickets" ADD CONSTRAINT "parking_tickets_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "parking_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "parking_tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_violation_type_id_fkey" FOREIGN KEY ("violation_type_id") REFERENCES "violation_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "parking_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_enforcement_officer_id_fkey" FOREIGN KEY ("enforcement_officer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enforcement_actions" ADD CONSTRAINT "enforcement_actions_violation_id_fkey" FOREIGN KEY ("violation_id") REFERENCES "customer_violations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enforcement_actions" ADD CONSTRAINT "enforcement_actions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_violation_id_fkey" FOREIGN KEY ("violation_id") REFERENCES "customer_violations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_violation_id_fkey" FOREIGN KEY ("violation_id") REFERENCES "customer_violations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
