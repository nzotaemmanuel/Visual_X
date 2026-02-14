# LASPA Database Dictionary

This document provides a detailed overview of the LASPA database schema, including enums, tables, and relationships.

---

## 🏗️ Enums

Global value sets used across multiple tables to ensure data integrity.

| Enum Name | Values | Description |
|-----------|--------|-------------|
| **UserRole** | `ADMIN`, `ENFORCEMENT_OFFICER`, `ANALYST`, `VIEWER` | Roles for dashboard users (admins/analysts). |
| **StaffRole** | `ADMIN`, `PARKING_AGENT`, `ENFORCEMENT_AGENT` | Roles for operational staff (agents/officers). |
| **AccountStatus**| `ACTIVE`, `SUSPENDED` | Indicates if a user is allowed to access the system. |
| **SlotStatus** | `AVAILABLE`, `OCCUPIED`, `RESERVED`, `OUT_OF_SERVICE` | Real-time status of a specific parking slot. |
| **TicketStatus** | `ACTIVE`, `COMPLETED`, `EXPIRED`, `CANCELLED` | Lifecycle state of a parking session/ticket. |
| **PaymentMethod**| `WALLET`, `CARD`, `CASH`, `AIRTIME` | Supported channels for parking and fine payments. |
| **ViolationStatus**| `OUTSTANDING`, `PAID`, `APPEALED`, `WAIVED` | Current state of a customer violation. |
| **ActionType** | `CLAMP`, `TOW`, `IMPOUND` | Types of enforcement actions taken by officers. |
| **ActionStatus** | `PENDING`, `IN_PROGRESS`, `COMPLETED`, `RELEASED` | Completion state of an enforcement action. |
| **PaymentStatus**| `PENDING`, `PAID` | Tracking payment for enforcement actions. |
| **AppealStatus** | `PENDING`, `APPROVED`, `REJECTED` | Review state of a violation appeal. |
| **RequestStatus**| `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`, `CANCELLED` | Lifecycle state of a parking request. |

---

## 📋 Tables

### 1. Identity & Access Management

#### `users` (User)
Dashboard users (Admins, Analysts).
- **PK**: `id` (Int)
- **Unique**: `email`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | Int | Auto-inc | No | Primary key. |
| `email` | String | | No | Unique login email. |
| `password_hash` | String | | No | Bcrypt hashed password. |
| `first_name` | String | | Yes | User's first name. |
| `last_name` | String | | Yes | User's last name. |
| `role` | UserRole | `VIEWER` | No | Dashboard role. |
| `is_active` | Boolean | `true` | No | Account active state. |
| `created_at` | DateTime | `now()` | No | Creation timestamp. |
| `updated_at` | DateTime | | No | Update timestamp. |

#### `staff` (Staff)
Operational field staff (Officers, Agents).
- **PK**: `id` (Int)
- **Unique**: `email`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | Int | Auto-inc | No | Primary key. |
| `first_name` | String | | No | Staff first name. |
| `last_name` | String | | No | Staff last name. |
| `email` | String | | No | Professional email. |
| `phone_number` | String | | No | Contact number. |
| `role` | StaffRole | | No | Operational role. |
| `account_status`| AccountStatus | `ACTIVE` | No | Account state. |

#### `customers` (Customer)
App users and vehicle owners.
- **PK**: `id` (Int)
- **Unique**: `customer_reference_id`, `email`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | Int | Auto-inc | No | Primary key. |
| `customer_reference_id` | String | | No | External reference (ICELL). |
| `first_name` | String | | No | Customer first name. |
| `last_name` | String | | No | Customer last name. |
| `email` | String | | No | Personal email. |
| `phone_number` | String | | No | Mobile number. |

#### `vehicles` (Vehicle)
Vehicles registered by customers.
- **PK**: `id` (Int)
- **Unique**: `plate_number`
- **FK**: `customer_id` -> `customers.id`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | Int | Auto-inc | No | Primary key. |
| `customer_id` | Int | | No | Reference to owner. |
| `plate_number` | String | | No | Plate registration. |
| `plate_code` | String | | Yes | Region code. |
| `is_default` | Boolean | `false` | No | User's primary vehicle. |

---

### 2. Parking Infrastructure

#### `parking_zones` (ParkingZone)
High-level geographic management areas.
- **PK**: `id` (Int)
- **Unique**: `zone_code`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | Int | Auto-inc | No | Primary key. |
| `zone_code` | String | | No | Identifier (e.g., "IKJ111"). |
| `zone_name` | String | | No | Display name (e.g., "Ikeja"). |
| `geographical_area` | Geometry (Polygon) | | Yes | Spatial boundary for map viz. |

#### `parking_bays` (ParkingBay)
Specific parking locations within a zone.
- **PK**: `id` (Int)
- **Unique**: `bay_code`
- **FK**: `zone_id` -> `parking_zones.id`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | Int | Auto-inc | No | Primary key. |
| `zone_id` | Int | | No | Parent zone reference. |
| `bay_code` | String | | No | Identifier (e.g., "MDPB128"). |
| `bay_name` | String | | No | Name (e.g., "Mr DotMan Bay"). |
| `address` | Text | | Yes | Street address. |
| `capacity_lanes`| Int | `0` | No | Number of lanes available. |
| `base_fee` | Decimal(10,2) | `0.00` | No | Base hourly rate. |
| `operating_hours`| Json | | Yes | Opening/closing configuration. |

#### `parking_slots` (ParkingSlot)
Individual parking spots.
- **PK**: `id` (Int)
- **FK**: `bay_id` -> `parking_bays.id`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | Int | Auto-inc | No | Primary key. |
| `bay_id` | Int | | No | Parent bay reference. |
| `slot_number` | String | | No | Label (e.g., "Lane 1"). |
| `status` | SlotStatus | `AVAILABLE`| No | Current physical state. |
| `sensor_id` | String | | Yes | External sensor reference. |

---

### 3. Transactions & Enforcement

#### `parking_tickets` (ParkingTicket)
Active and historical parking sessions.
- **PK**: `id` (Int)
- **Unique**: `transaction_ref`
- **FK**: `customer_id` -> `customers.id`, `vehicle_id` -> `vehicles.id`, `bay_id` -> `parking_bays.id`, `slot_id` -> `parking_slots.id` (Null), `agent_id` -> `staff.id` (Null)

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | Int | Auto-inc | No | Internal primary key. |
| `transaction_ref` | String | | No | Unique transaction ID. |
| `amount_paid` | Decimal(10,2) | | No | Total value. |
| `duration_hours` | Int | | No | Purchased time. |
| `start_time` | DateTime | | No | Session start. |
| `expiry_time` | DateTime | | No | Expiration time. |
| `status` | TicketStatus | `ACTIVE` | No | Session state. |
| `payment_method` | PaymentMethod| | No | Payment method used. |

#### `customer_violations` (CustomerViolation)
Infractions recorded by field staff.
- **PK**: `id` (Int)
- **Unique**: `reference_id`
- **FK**: `customer_id` -> `customers.id`, `vehicle_id` -> `vehicles.id`, `violation_type_id` -> `violation_types.id`, `zone_id` -> `parking_zones.id`, `enforcement_officer_id` -> `staff.id`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | Int | Auto-inc | No | Internal primary key. |
| `reference_id` | String | | No | Violation identifier. |
| `violation_date` | DateTime | | No | Date of infraction. |
| `fee_amount` | Decimal(10,2) | | No | Fine amount. |
| `status` | ViolationStatus | `OUTSTANDING`| No | Current state. |
| `evidence_images` | Json | | Yes | Image URLs. |

#### `parking_requests` (ParkingRequest)
Initial customer requests for parking sessions.
- **PK**: `id` (Int)
- **FK**: `customer_id` -> `customers.id`, `vehicle_id` -> `vehicles.id`, `zone_id` -> `parking_zones.id`, `bay_id` -> `parking_bays.id`, `slot_id` -> `parking_slots.id`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| `id` | Int | Auto-inc | No | Primary key. |
| `customer_id` | Int | | No | Reference to requester. |
| `vehicle_id` | Int | | No | Vehicle to be parked. |
| `zone_id` | Int | | Yes | Preferred zone. |
| `bay_id` | Int | | Yes | Specific bay. |
| `slot_id` | Int | | Yes | Specific slot. |
| `start_time` | DateTime | | No | Requested start. |
| `duration_hours` | Int | | No | Requested duration. |
| `status` | RequestStatus | `PENDING` | No | Approval state. |

---

## 🖇️ Key Relationships

1. **User ↔ Vehicle** (1:N): A user can own multiple vehicles, each uniquely identified by their plate number.
2. **ParkingZone ↔ ParkingBay** (1:N): A zone aggregates multiple bays for management.
3. **ParkingBay ↔ ParkingSlot** (1:N): Individual slots are physical subdivisions of a bay.
4. **User ↔ ParkingRequest** (1:N): Customers can place multiple parking requests.
5. **ParkingTicket ↔ CustomerViolation** (1:N): One ticket overstay can lead to multiple violations if not addressed.
6. **CustomerViolation ↔ EnforcementAction** (1:N): A violation can trigger a clamp, followed by towing/impoundment.
