**App Guide**

This guide explains the metrics and data shown across the Visual_X (LASPA) web app pages, where the data comes from, and where to find the code that renders or fetches it.

**How to use this guide**
- Read the page description to understand what metrics are shown.
- See **Data Source** to learn which database models and API endpoints supply the data.
- See **Code / Location** to find the components and API routes to change if you need to modify display or calculations.

---

**Executive Overview (Dashboard)**
- Purpose: High-level operational view of the parking system across zones.
- Key metrics:
  - Operational Heatmap: spatial occupancy density (zones colored by occupancy)
  - Live Operations Feed: recent enforcement events (overstays, clamps, tows)
  - KPIs: top-level numbers such as total active sessions, recent revenue, enforcement counts
  - Top Performing Zones: revenue and occupancy leaderboard
- Data Source:
  - `parkingZone`, `parkingSlot`, `parkingTicket`, `customerViolation`, `enforcementAction` (Prisma models)
  - API endpoints: `/api/top-zones`, `/api/enforcement-actions`, `/api/zones`
- Code / Location:
  - UI: `src/components/dashboard/*` (TopZones.tsx, RevenueKPIs.tsx, RecentActivity.tsx, OccupancyGauge.tsx)
  - Map UI: `src/app/map/page.tsx` and map components

---

**Revenue Analytics**
- Purpose: show financial collection performance and transaction history.
- Key metrics:
  - Revenue KPIs: total collected (period), growth vs previous period, average ticket value
  - Revenue Chart: revenue time-series for selected zone or global
  - Recent Collection Pulse: table of recent transactions (transaction id, zone/bay, amount, channel, status, time)
- Data Source:
  - `parkingTicket`, `receipt` for amounts and receipts
  - API endpoints: `/api/transactions`, `/api/top-zones` (for aggregated metrics)
- Code / Location:
  - UI: `src/components/dashboard/RevenueContainer.tsx`, `RevenueChart.tsx`, `RevenueDistribution.tsx`, `RevenueKPIs.tsx`

---

**Operations Map**
- Purpose: geospatial view of zones, bays, and live session locations to support field operations.
- Key metrics / displays:
  - Zone polygons (PostGIS layers)
  - Active sessions or occupied slots overlay
  - Clickable bays and slots with occupancy and recent events
- Data Source:
  - PostGIS-enabled `parkingZone` geometry, `parkingSlot` status, `parkingTicket` session locations
  - Mapbox / client-side map engine (requires API key for high-fidelity tiles)
- Code / Location:
  - UI: `src/app/map/page.tsx` and related map components
  - DB functions: `src/lib/db.ts` helper functions that fetch zones and slots

---

**Enforcement & Compliance**
- Purpose: monitor violations and enforcement actions, with status and officer details.
- Key metrics:
  - Recent Enforcement Actions (ID, vehicle plate, action type, zone, officer, status)
  - Violation Breakdown: counts by violation type
  - Quick stats: active clamps, tow counts, total violations
- Data Source:
  ```markdown
  **App Guide**

  This guide explains the metrics and data shown across the Visual_X (LASPA) web app pages, where the data comes from, and where to find the code that renders or fetches it.

  **How to use this guide**
  - Read the page description to understand what metrics are shown.
  - See **Data Source** to learn which database models and API endpoints supply the data.
  - See **Code / Location** to find the components and API routes to change if you need to modify display or calculations.

  ---

  **Executive Overview (Dashboard)**
  - Purpose: High-level operational view of the parking system across zones.
  - Key metrics:
    - Operational Heatmap: spatial occupancy density (zones colored by occupancy)
      - Calculation: occupancy = (occupied slots in zone / total slots in zone) * 100. "Occupied" is determined from `parkingSlot.status = 'OCCUPIED'` or active `parkingTicket` attached to a slot. Aggregation uses `parkingSlot.zoneId` or `parkingBay.zoneId` as available.
    - Live Operations Feed: recent enforcement events (overstays, clamps, tows)
      - Calculation: shows most recent rows from `enforcementAction` and `customerViolation` ordered by `createdAt`/`requestedAt`. Each feed item surfaces `vehicle.plateNumber`, `zoneId`, `actionType`, officer `staffId`, and timestamps.
    - KPIs: top-level numbers such as total active sessions, recent revenue, enforcement counts
      - Calculation examples:
        - Total Active Sessions: count of `parkingTicket` where `status = 'ACTIVE'` and `expiryTime > NOW()`.
        - Recent Revenue: SUM of `parkingTicket.amountPaid` (or `receipt.amount`) filtered by the selected time window.
        - Enforcement Counts: COUNT of `enforcementAction` grouped by `actionType` within the window.
    - Top Performing Zones: revenue and occupancy leaderboard
      - Calculation: revenue per zone = SUM(`parkingTicket.amountPaid`) for tickets linked to bays in the zone. Occupancy as above. Ranking is by revenue, with occupancy as secondary metric.
  - Data Source:
    - `parkingZone`, `parkingSlot`, `parkingTicket`, `customerViolation`, `enforcementAction` (Prisma models)
    - API endpoints: `/api/top-zones`, `/api/enforcement-actions`, `/api/zones`
  - Code / Location:
    - UI: `src/components/dashboard/*` (TopZones.tsx, RevenueKPIs.tsx, RecentActivity.tsx, OccupancyGauge.tsx)
    - Map UI: `src/app/map/page.tsx` and map components

  ---

  **Revenue Analytics**
  - Purpose: show financial collection performance and transaction history.
  - Key metrics:
    - Revenue KPIs:
      - Total Collected (period): SUM(`parkingTicket.amountPaid`) within the selected date range.
      - Growth vs Previous Period: (current_period_total - previous_period_total) / previous_period_total * 100.
      - Average Ticket Value: total_collected / number_of_paid_tickets in the period.
    - Revenue Chart: revenue time-series for selected zone or global
      - Calculation: time-bucketed aggregation (hour/day/week) of SUM(`parkingTicket.amountPaid`) grouped by `createdAt`.
    - Recent Collection Pulse: table of recent transactions (transaction id, zone/bay, amount, channel, status, time)
      - Calculation: recent `parkingTicket` rows joined to `receipt` (if present) and `parkingBay`/`parkingZone` for context.
  - Data Source:
    - `parkingTicket`, `receipt` for amounts and receipts
    - API endpoints: `/api/transactions`, `/api/top-zones` (for aggregated metrics)
  - Code / Location:
    - UI: `src/components/dashboard/RevenueContainer.tsx`, `RevenueChart.tsx`, `RevenueDistribution.tsx`, `RevenueKPIs.tsx`

  ---

  **Operations Map**
  - Purpose: geospatial view of zones, bays, and live session locations to support field operations.
  - Key metrics / displays:
    - Zone polygons (PostGIS layers)
      - Data: `parkingZone.geographicalArea` (PostGIS polygon). Polygons are styled using the occupancy metric (occupied/total slots).
    - Active sessions or occupied slots overlay
      - Calculation: derived from `parkingTicket` records marked as active and `parkingSlot.status = 'OCCUPIED'`. When session GPS coordinates exist, use them; otherwise use bay/zone centroids.
    - Clickable bays and slots with occupancy and recent events
  - Data Source:
    - PostGIS-enabled `parkingZone` geometry, `parkingSlot` status, `parkingTicket` session locations
    - Mapbox / client-side map engine (requires API key for high-fidelity tiles)
  - Code / Location:
    - UI: `src/app/map/page.tsx` and related map components
    - DB functions: `src/lib/db.ts` helper functions that fetch zones and slots

  ---

  **Enforcement & Compliance**
  - Purpose: monitor violations and enforcement actions, with status and officer details.
  - Key metrics:
    - Recent Enforcement Actions (ID, vehicle plate, action type, zone, officer, status)
      - Calculation: latest `enforcementAction` rows with joined `vehicle` and `staff` for display fields.
    - Violation Breakdown: counts by violation type
      - Calculation: COUNT(`customerViolation`) grouped by `violationTypeId` (join to `ViolationType`) within the selected window.
    - Quick stats: active clamps, tow counts, total violations
      - Calculation examples:
        - Active Clamps: COUNT of `enforcementAction` where `actionType = 'CLAMP'` AND `status IN ('PENDING','IN_PROGRESS')`.
        - Tow Counts: COUNT of `enforcementAction` where `actionType = 'TOW'`.
        - Total Violations: COUNT of `customerViolation` matching filters.
  - Data Source:
    - `enforcementAction`, `customerViolation`, `staff` models
    - API endpoint: `/api/enforcement-actions`
  - Code / Location:
    - UI: `src/components/dashboard/EnforcementContainer.tsx`

  ---

  **Vehicle Analytics / Directory**
  - Purpose: list vehicles and their current status and sessions; staff directory and management.
  - Key metrics / displays:
    - Vehicle list (plate, owner, status, sessions)
      - Sessions: COUNT of recent `parkingTicket` records for the vehicle (filterable by time window).
      - Status definitions:
        - Parked: vehicle has an active `parkingTicket` (`status = 'ACTIVE'` and `expiryTime > NOW()`).
        - Violating: linked `customerViolation` exists and is unresolved.
        - Idle: no active ticket and no recent violations.
    - Staff list (name, role, contact) and staff management actions
  - Data Source:
    - `vehicle`, `customer`, `parkingRequest`, `staff` models
    - API endpoints: `/api/vehicles`, `/api/zones` (for filtering)
  - Code / Location:
    - UI: `src/components/dashboard/DirectoryContainer.tsx`, `src/app/settings/users/page.tsx`

  ---

  **Reports**
  - Purpose: exports and historical views for auditing and analysis.
  - Key metrics / displays:
    - Exported revenue reports, enforcement reports, ticket/receipt logs
    - Calculation notes: queries for exports should explicitly filter by `startDate` and `endDate`, join `receipt` and `customer` where relevant, and include ticket `referenceId`, payment channel, and staff/officer metadata for auditability.
  - Data Source:
    - Aggregations from `parkingTicket`, `receipt`, `customerViolation`, `enforcementAction`
  - Code / Location:
    - UI: `src/app/reports/page.tsx` (or `src/components/reports/*` if present)

  ---

  **Staff Management**
  - Purpose: manage internal users and roles (ADMIN, ENFORCEMENT_OFFICER, ANALYST, VIEWER).
  - Key metrics / displays:
    - Staff roster, roles, status, and quick actions (invite, deactivate)
  - Data Source:
    - `user` and `staff` Prisma models
    - API routes: `src/app/api/users/route.ts` and `src/app/api/users/[id]/route.ts`
  - Code / Location:
    - UI: `src/app/settings/users/page.tsx`, `src/components/layout/Sidebar.tsx` for current user display
    - Role semantics:
      - `ADMIN`: full access to user management, settings and exports.
      - `ENFORCEMENT_OFFICER`: access to enforcement workflows and field tools.
      - `ANALYST`: read-only access to analytics and export features.
      - `VIEWER`: limited, dashboard-focused read-only access.

  ---

  **Settings**
  - Purpose: application configuration (Map keys, SMTP settings, pagination options, feature flags).
  - Key items:
    - Mapbox key (affects Operations Map)
    - SMTP / `nodemailer` settings (affects password reset emails)
    - Token lifetimes (access/refresh) and cookie policies
  - Data Source / Config:
    - Environment variables: `NEXT_PUBLIC_APP_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `NEXT_PUBLIC_MAPBOX_KEY`, `DATABASE_URL`
    - Code: `src/app/actions/passwordReset.ts` (email), `src/lib/auth.ts` (tokens)

  ---

  **Authentication / Current User**
  - The sidebar displays the current user's name and role from the `useAuth` context. The role is derived from the authenticated user record. If you update a user's role directly in the database, you may need to:
    - Log out and log back in to obtain a fresh JWT, or
    - Use the sidebar's "Refresh" button (calls `/api/me`) to re-fetch latest user data.

  **Metric freshness & time windows**
  - Most dashboard metrics default to the last 24 hours. UI controls allow switching to 7-day / 30-day / custom ranges. When adding metrics, accept `startDate` and `endDate` inputs and apply consistent timezone handling (server-side UTC recommended).

  **Developer pointers**
  - API endpoints created for dashboard data live under `src/app/api/*`:
    - `/api/zones` — list zones
    - `/api/transactions` — recent ticket transactions
    - `/api/enforcement-actions` — recent enforcement actions
    - `/api/vehicles` — vehicles list
    - `/api/top-zones` — aggregated revenue/occupancy metrics
    - `/api/me` — returns the current user's latest DB record
  - Frontend components to review / update:
    - `src/components/dashboard/*` (RevenueContainer, EnforcementContainer, DirectoryContainer, TopZones, etc.)
    - `src/components/layout/Sidebar.tsx` — current user display and role refresh
  - DB models used (Prisma): `User`, `Staff`, `ParkingZone`, `ParkingBay`, `ParkingSlot`, `ParkingTicket`, `Receipt`, `Vehicle`, `CustomerViolation`, `EnforcementAction`, `PasswordReset`, `RefreshToken`, `Session`.

  **Testing & Troubleshooting**
  - Seed DB: `npx prisma db seed` (the repo includes `prisma/seed.ts` which seeds admin and test data).
  - Dev helper script to create a reset link: `scripts/test-password-reset.ts` (dev only).
  - To make a user ADMIN manually: `scripts/set-admin.ts` — runs a Prisma update to set the user role.

  ---

  If you'd like, I can:
  - Expand this guide with screenshots and examples for each metric.
  - Generate a printable PDF version.
  - Add inline tooltips in the UI showing each metric's definition.

  ```
