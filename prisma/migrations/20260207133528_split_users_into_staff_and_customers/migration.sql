/*
  Warnings:

  - The primary key for the `appeals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `appeals` table. All the data in the column will be lost.
  - The `id` column on the `appeals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `reviewer_id` column on the `appeals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `customer_violations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `customer_violations` table. All the data in the column will be lost.
  - The `id` column on the `customer_violations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ticket_id` column on the `customer_violations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `enforcement_actions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `enforcement_actions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `fines` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `fines` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `parking_bays` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `parking_bays` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `parking_slots` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `parking_slots` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `parking_tickets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `parking_tickets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `slot_id` column on the `parking_tickets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `agent_id` column on the `parking_tickets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `parking_zones` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `parking_zones` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `receipts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `receipts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `vehicles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `vehicles` table. All the data in the column will be lost.
  - The `id` column on the `vehicles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `violation_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `violation_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customer_id` to the `appeals` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `violation_id` on the `appeals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `customer_id` to the `customer_violations` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `vehicle_id` on the `customer_violations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `violation_type_id` on the `customer_violations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `zone_id` on the `customer_violations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `enforcement_officer_id` on the `customer_violations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `violation_id` on the `enforcement_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `requested_by` on the `enforcement_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `violation_id` on the `fines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `zone_id` on the `parking_bays` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `bay_id` on the `parking_slots` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `customer_id` on the `parking_tickets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vehicle_id` on the `parking_tickets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `bay_id` on the `parking_tickets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ticket_id` on the `receipts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `customer_id` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'PARKING_AGENT', 'ENFORCEMENT_AGENT');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "appeals" DROP CONSTRAINT "appeals_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "appeals" DROP CONSTRAINT "appeals_user_id_fkey";

-- DropForeignKey
ALTER TABLE "appeals" DROP CONSTRAINT "appeals_violation_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_violations" DROP CONSTRAINT "customer_violations_enforcement_officer_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_violations" DROP CONSTRAINT "customer_violations_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_violations" DROP CONSTRAINT "customer_violations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_violations" DROP CONSTRAINT "customer_violations_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_violations" DROP CONSTRAINT "customer_violations_violation_type_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_violations" DROP CONSTRAINT "customer_violations_zone_id_fkey";

-- DropForeignKey
ALTER TABLE "enforcement_actions" DROP CONSTRAINT "enforcement_actions_requested_by_fkey";

-- DropForeignKey
ALTER TABLE "enforcement_actions" DROP CONSTRAINT "enforcement_actions_violation_id_fkey";

-- DropForeignKey
ALTER TABLE "fines" DROP CONSTRAINT "fines_violation_id_fkey";

-- DropForeignKey
ALTER TABLE "parking_bays" DROP CONSTRAINT "parking_bays_zone_id_fkey";

-- DropForeignKey
ALTER TABLE "parking_slots" DROP CONSTRAINT "parking_slots_bay_id_fkey";

-- DropForeignKey
ALTER TABLE "parking_tickets" DROP CONSTRAINT "parking_tickets_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "parking_tickets" DROP CONSTRAINT "parking_tickets_bay_id_fkey";

-- DropForeignKey
ALTER TABLE "parking_tickets" DROP CONSTRAINT "parking_tickets_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "parking_tickets" DROP CONSTRAINT "parking_tickets_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "parking_tickets" DROP CONSTRAINT "parking_tickets_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_user_id_fkey";

-- AlterTable
ALTER TABLE "appeals" DROP CONSTRAINT "appeals_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "customer_id" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "violation_id",
ADD COLUMN     "violation_id" INTEGER NOT NULL,
DROP COLUMN "reviewer_id",
ADD COLUMN     "reviewer_id" INTEGER,
ADD CONSTRAINT "appeals_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "customer_violations" DROP CONSTRAINT "customer_violations_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "customer_id" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "ticket_id",
ADD COLUMN     "ticket_id" INTEGER,
DROP COLUMN "vehicle_id",
ADD COLUMN     "vehicle_id" INTEGER NOT NULL,
DROP COLUMN "violation_type_id",
ADD COLUMN     "violation_type_id" INTEGER NOT NULL,
DROP COLUMN "zone_id",
ADD COLUMN     "zone_id" INTEGER NOT NULL,
DROP COLUMN "enforcement_officer_id",
ADD COLUMN     "enforcement_officer_id" INTEGER NOT NULL,
ADD CONSTRAINT "customer_violations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "enforcement_actions" DROP CONSTRAINT "enforcement_actions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "violation_id",
ADD COLUMN     "violation_id" INTEGER NOT NULL,
DROP COLUMN "requested_by",
ADD COLUMN     "requested_by" INTEGER NOT NULL,
ADD CONSTRAINT "enforcement_actions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "fines" DROP CONSTRAINT "fines_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "violation_id",
ADD COLUMN     "violation_id" INTEGER NOT NULL,
ADD CONSTRAINT "fines_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "parking_bays" DROP CONSTRAINT "parking_bays_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "zone_id",
ADD COLUMN     "zone_id" INTEGER NOT NULL,
ADD CONSTRAINT "parking_bays_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "parking_slots" DROP CONSTRAINT "parking_slots_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "bay_id",
ADD COLUMN     "bay_id" INTEGER NOT NULL,
ADD CONSTRAINT "parking_slots_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "parking_tickets" DROP CONSTRAINT "parking_tickets_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "customer_id",
ADD COLUMN     "customer_id" INTEGER NOT NULL,
DROP COLUMN "vehicle_id",
ADD COLUMN     "vehicle_id" INTEGER NOT NULL,
DROP COLUMN "bay_id",
ADD COLUMN     "bay_id" INTEGER NOT NULL,
DROP COLUMN "slot_id",
ADD COLUMN     "slot_id" INTEGER,
DROP COLUMN "agent_id",
ADD COLUMN     "agent_id" INTEGER,
ADD CONSTRAINT "parking_tickets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "parking_zones" DROP CONSTRAINT "parking_zones_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "parking_zones_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "ticket_id",
ADD COLUMN     "ticket_id" INTEGER NOT NULL,
ADD CONSTRAINT "receipts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "customer_id" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "violation_types" DROP CONSTRAINT "violation_types_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "violation_types_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "UserType";

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "customer_reference_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_requests" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "zone_id" INTEGER,
    "bay_id" INTEGER,
    "slot_id" INTEGER,
    "start_time" TIMESTAMP(3) NOT NULL,
    "duration_hours" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_reference_id_key" ON "customers"("customer_reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_bays" ADD CONSTRAINT "parking_bays_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "parking_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_bay_id_fkey" FOREIGN KEY ("bay_id") REFERENCES "parking_bays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_tickets" ADD CONSTRAINT "parking_tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_tickets" ADD CONSTRAINT "parking_tickets_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_tickets" ADD CONSTRAINT "parking_tickets_bay_id_fkey" FOREIGN KEY ("bay_id") REFERENCES "parking_bays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_tickets" ADD CONSTRAINT "parking_tickets_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "parking_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_tickets" ADD CONSTRAINT "parking_tickets_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "parking_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "parking_tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_violation_type_id_fkey" FOREIGN KEY ("violation_type_id") REFERENCES "violation_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "parking_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_violations" ADD CONSTRAINT "customer_violations_enforcement_officer_id_fkey" FOREIGN KEY ("enforcement_officer_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enforcement_actions" ADD CONSTRAINT "enforcement_actions_violation_id_fkey" FOREIGN KEY ("violation_id") REFERENCES "customer_violations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enforcement_actions" ADD CONSTRAINT "enforcement_actions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_violation_id_fkey" FOREIGN KEY ("violation_id") REFERENCES "customer_violations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_violation_id_fkey" FOREIGN KEY ("violation_id") REFERENCES "customer_violations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_requests" ADD CONSTRAINT "parking_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_requests" ADD CONSTRAINT "parking_requests_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_requests" ADD CONSTRAINT "parking_requests_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "parking_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_requests" ADD CONSTRAINT "parking_requests_bay_id_fkey" FOREIGN KEY ("bay_id") REFERENCES "parking_bays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_requests" ADD CONSTRAINT "parking_requests_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "parking_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
