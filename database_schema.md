# LASPA Database Schema Specification

This document defines the comprehensive database schema for the LASPA Parking Management System, aggregating requirements from the core spec, entity list, and third-party integration technical documentation.

## 1. Core Architecture
- **Database**: PostgreSQL 15+ (Required for robust geospatial queries and JSONB support).
- **node-postgres (pg) - Raw SQL**: Required for maximum control and performance


## 2. Entity Relationship Model

### A. Identity & Access Management
**1. USERS**
*Extends `Entities.md: Customers` and `laspa_technical_doc: 2.1`*
- `id` (UUID, PK)
- `customer_reference_id` (VARCHAR, Unique, from External/ICELL)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `phone_number` (VARCHAR)
- `user_type` (ENUM: 'CUSTOMER', 'ADMIN', 'PARKING_AGENT', 'ENFORCEMENT_AGENT')
- `account_status` (ENUM: 'ACTIVE', 'SUSPENDED')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**2. VEHICLES**
*Extends `Entities.md: Vehicles` and `laspa_technical_doc: 2.1`*
- `id` (UUID, PK)
- `user_id` (UUID, FK -> USERS.id)
- `plate_number` (VARCHAR, Unique)
- `plate_code` (VARCHAR) - e.g., "KJA"
- `plate_source` (VARCHAR) - e.g., "Lagos"
- `plate_type` (VARCHAR) - e.g., "Private", "Commercial"
- `is_default` (BOOLEAN)

### B. Parking Infrastructure
**3. PARKING_ZONES**
*Extends `Entities.md: Parking Zones` and `laspa_technical_doc: 3.1`*
- `id` (UUID, PK)
- `zone_code` (VARCHAR, Unique) - e.g., "IKJ111"
- `zone_name` (VARCHAR) - e.g., "Ikeja"
- `geographical_area` (GEOMETRY/POLYGON) - Optional for map

**4. PARKING_BAYS**
*Extends `Entities.md: Parking Bays` and `laspa_technical_doc: 3.2`*
- `id` (UUID, PK)
- `zone_id` (UUID, FK -> PARKING_ZONES.id)
- `bay_code` (VARCHAR, Unique) - e.g., "MDPB128"
- `bay_name` (VARCHAR)
- `address` (TEXT)
- `capacity_lanes` (INTEGER)
- `base_fee` (DECIMAL)
- `operating_hours` (JSONB) - Opening/Closing times

**5. PARKING_SLOTS**
*Extends `Entities.md: Parking Slot`*
- `id` (UUID, PK)
- `bay_id` (UUID, FK -> PARKING_BAYS.id)
- `slot_number` (VARCHAR) - e.g., "Lane 1"
- `status` (ENUM: 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_SERVICE')
- `sensor_id` (VARCHAR, Optional) - For IoT integration

### C. Parking Transactions & Tickets
**6. PARKING_TICKETS** (Transactions)
*Extends `Entities.md: Ticket Purchase` and `laspa_technical_doc: 2.2, 3.3`*
- `id` (UUID, PK)
- `transaction_ref` (VARCHAR, Unique) - e.g., "P-20251009..."
- `customer_id` (UUID, FK -> USERS.id)
- `vehicle_id` (UUID, FK -> VEHICLES.id)
- `bay_id` (UUID, FK -> PARKING_BAYS.id)
- `slot_id` (UUID, FK -> PARKING_SLOTS.id, Nullable)
- `agent_id` (UUID, FK -> USERS.id, Nullable) - If booked by agent
- `channel` (ENUM: 'WEB', 'MOBILE_APP', 'SMS', 'POS')
- `amount_paid` (DECIMAL)
- `duration_hours` (INTEGER)
- `start_time` (TIMESTAMP)
- `expiry_time` (TIMESTAMP)
- `checkout_time` (TIMESTAMP, Nullable)
- `status` (ENUM: 'ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED')
- `payment_method` (ENUM: 'WALLET', 'CARD', 'CASH', 'AIRTIME')
- `created_at` (TIMESTAMP)

**7. RECEIPTS**
*Extends `Entities.md: Parking Receipts`*
- `id` (UUID, PK)
- `ticket_id` (UUID, FK -> PARKING_TICKETS.id)
- `receipt_number` (VARCHAR, Unique)
- `generated_at` (TIMESTAMP)
- `pdf_url` (VARCHAR)

### D. Enforcement & Violations
**8. VIOLATION_TYPES** (Catalog)
*Extends `laspa_technical_doc: 2.5`*
- `id` (UUID, PK)
- `code` (VARCHAR, Unique) - e.g., "PV01"
- `description` (TEXT) - e.g., "PARKING ACROSS YELLOW LINE..."
- `default_fee` (DECIMAL)
- `severity_level` (INTEGER)

**9. CUSTOMER_VIOLATIONS**
*Extends `Entities.md: Violation` and `laspa_technical_doc: 2.4`*
- `id` (UUID, PK)
- `reference_id` (VARCHAR, Unique)
- `ticket_id` (UUID, FK -> PARKING_TICKETS.id, Nullable) - If related to overstay
- `user_id` (UUID, FK -> USERS.id)
- `vehicle_id` (UUID, FK -> VEHICLES.id)
- `violation_type_id` (UUID, FK -> VIOLATION_TYPES.id)
- `zone_id` (UUID, FK -> PARKING_ZONES.id)
- `location_description` (TEXT)
- `violation_date` (TIMESTAMP)
- `fee_amount` (DECIMAL) - Can override default
- `status` (ENUM: 'OUTSTANDING', 'PAID', 'APPEALED', 'WAIVED')
- `enforcement_officer_id` (UUID, FK -> USERS.id)
- `evidence_images` (JSONB) - Array of image URLs

### E. Enforcement Actions (Clamping & Towing)
**10. ENFORCEMENT_ACTIONS**
*Extends `Entities.md: Clamp/Tow Request` and `laspa_technical_doc: 2.7 - 2.12`*
- `id` (UUID, PK)
- `violation_id` (UUID, FK -> CUSTOMER_VIOLATIONS.id)
- `action_type` (ENUM: 'CLAMP', 'TOW', 'IMPOUND')
- `reference_id` (VARCHAR, Unique)
- `requested_by` (UUID, FK -> USERS.id)
- `requested_at` (TIMESTAMP)
- `status` (ENUM: 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'RELEASED')
- `payment_status` (ENUM: 'PENDING', 'PAID')
- `release_date` (TIMESTAMP)
- `towing_company` (VARCHAR, Optional)
- `impound_lot_location` (VARCHAR, Optional)

### F. Financials & Disputes
**11. FINES**
*Extends `Entities.md: Fines`*
- `id` (UUID, PK)
- `violation_id` (UUID, FK -> CUSTOMER_VIOLATIONS.id)
- `amount` (DECIMAL)
- `is_paid` (BOOLEAN)
- `payment_date` (TIMESTAMP)

**12. APPEALS**
*Extends `Entities.md: Appeals` and `laspa_technical_doc: 2.13`*
- `id` (UUID, PK)
- `violation_id` (UUID, FK -> CUSTOMER_VIOLATIONS.id)
- `user_id` (UUID, FK -> USERS.id)
- `appeal_reason` (TEXT)
- `attachments` (JSONB)
- `status` (ENUM: 'PENDING', 'APPROVED', 'REJECTED')
- `reviewer_id` (UUID, FK -> USERS.id)
- `review_notes` (TEXT)
- `created_at` (TIMESTAMP)

## 3. Required Views (Reporting)
- `VIEW_AVAILABLE_SPACES`: Real-time availability by Zone/Bay.
- `VIEW_DAILY_REVENUE`: Aggregated calculations from Tickets and Fines.
- `VIEW_ENFORCEMENT_STATS`: Count of clamps/tows per officer/zone.

## 4. Initialization Data (Seed)
- **Roles**: Admin, Customer, Agent.
- **Zones**: Ikeja (IKJ111), Ikorodu (IKD112).
- **Violation Types**: PV01 (Illegal Parking), PHD01 (Handicap), PFL00 (Fire Lane).
- **Pricing**: Default bay fees.