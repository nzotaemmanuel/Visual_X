# LASPA Database Schema Specification

This document defines the comprehensive database schema for the LASPA Parking Management System, aggregating requirements from the core spec, entity list, and third-party integration technical documentation.

## 1. Core Architecture
- **Database**: PostgreSQL 15+ (Required for robust geospatial queries and JSONB support).
- **ORM**: Prisma (Recommended for type safety and migration management).

## 2. Entity Relationship Model

### A. Identity & Access Management
**1. USERS** (Dashboard)
- `id` (INT, PK)
- `email` (TEXT, Unique)
- `password_hash` (TEXT)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `role` (ENUM: UserRole)
- `is_active` (BOOLEAN)

**2. STAFF** (Field Operations)
- `id` (INT, PK)
- `email` (TEXT, Unique)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `phone_number` (TEXT)
- `role` (ENUM: StaffRole)
- `account_status` (ENUM: AccountStatus)

**3. CUSTOMERS** (Mobile App)
- `id` (INT, PK)
- `customer_reference_id` (TEXT, Unique)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `email` (TEXT, Unique)
- `phone_number` (TEXT)

**4. VEHICLES**
- `id` (INT, PK)
- `customer_id` (INT, FK -> CUSTOMERS.id)
- `plate_number` (TEXT, Unique)
- `plate_code` (TEXT)
- `is_default` (BOOLEAN)

### B. Parking Infrastructure
**5. PARKING_ZONES**
- `id` (INT, PK)
- `zone_code` (TEXT, Unique)
- `zone_name` (TEXT)
- `geographical_area` (GEOMETRY: Polygon)

**6. PARKING_BAYS**
- `id` (INT, PK)
- `zone_id` (INT, FK -> PARKING_ZONES.id)
- `bay_code` (TEXT, Unique)
- `bay_name` (TEXT)
- `base_fee` (DECIMAL)

**7. PARKING_SLOTS**
- `id` (INT, PK)
- `bay_id` (INT, FK -> PARKING_BAYS.id)
- `slot_number` (TEXT)
- `status` (ENUM: SlotStatus)

### C. Transactions & Enforcement
**8. PARKING_TICKETS**
- `id` (INT, PK)
- `transaction_ref` (TEXT, Unique)
- `customer_id` (INT, FK -> CUSTOMERS.id)
- `vehicle_id` (INT, FK -> VEHICLES.id)
- `bay_id` (INT, FK -> PARKING_BAYS.id)
- `start_time` (TIMESTAMP)
- `expiry_time` (TIMESTAMP)
- `status` (ENUM: TicketStatus)

**9. CUSTOMER_VIOLATIONS**
- `id` (INT, PK)
- `reference_id` (TEXT, Unique)
- `customer_id` (INT, FK -> CUSTOMERS.id)
- `vehicle_id` (INT, FK -> VEHICLES.id)
- `enforcement_officer_id` (INT, FK -> STAFF.id)
- `status` (ENUM: ViolationStatus)

**10. APPEALS**
- `id` (INT, PK)
- `violation_id` (INT, FK -> CUSTOMER_VIOLATIONS.id)
- `customer_id` (INT, FK -> CUSTOMERS.id)
- `reviewer_id` (INT, FK -> STAFF.id)
- `status` (ENUM: AppealStatus)

## 3. Required Views (Reporting)
- `VIEW_AVAILABLE_SPACES`: Real-time availability by Zone/Bay.
- `VIEW_DAILY_REVENUE`: Aggregated calculations from Tickets and Fines.
- `VIEW_ENFORCEMENT_STATS`: Count of clamps/tows per officer/zone.

## 4. Initialization Data (Seed)
- **Roles**: Admin, Customer, Agent.
- **Zones**: Ikeja (IKJ111), Ikorodu (IKD112).
- **Violation Types**: PV01 (Illegal Parking), PHD01 (Handicap), PFL00 (Fire Lane).
- **Pricing**: Default bay fees.