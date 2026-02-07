# LASPA Parking Analytics Dashboard Metrics

Based on the technical documentation and database schema, here are the detailed metrics for a comprehensive analytics dashboard:

## 1. Revenue & Financial Metrics

### Primary KPIs
- **Total Revenue (Today/Week/Month/Year)** - Sum of `amount_paid` from `PARKING_TICKETS` + `FINES`
- **Average Transaction Value** - Mean `amount_paid` per ticket
- **Revenue by Channel** - Breakdown by `channel` (WEB, MOBILE_APP, SMS, POS)
- **Revenue by Payment Method** - Distribution across WALLET, CARD, CASH, AIRTIME
- **Outstanding Collections** - Total unpaid fines where `is_paid = false`
- **Collection Rate** - (Paid Fines / Total Fines) × 100

### Trend Analysis
- **Daily Revenue Trend** - 30/90-day line chart
- **Revenue Forecast** - Projected revenue based on historical patterns
- **Peak Revenue Hours** - Heatmap of revenue by hour of day

## 2. Parking Utilization & Occupancy

### Real-Time Metrics
- **Current Occupancy Rate** - (Occupied Slots / Total Slots) × 100
- **Available Spaces** - Count where `status = 'AVAILABLE'`
- **Zone-wise Occupancy** - Breakdown by `PARKING_ZONES`
- **Bay-wise Capacity** - Fill rate per `PARKING_BAYS`

### Historical Patterns
- **Average Duration Per Session** - Mean `duration_hours` from completed tickets
- **Turnover Rate** - Number of vehicles per slot per day
- **Peak Usage Hours** - Histogram of `start_time` distribution
- **Weekend vs Weekday Utilization** - Comparative analysis
- **Space Efficiency Score** - (Total Hours Used / Total Hours Available) × 100

## 3. Customer & Vehicle Analytics

### User Metrics
- **Total Registered Users** - Count from `USERS` where `user_type = 'CUSTOMER'`
- **New User Registrations** - Daily/weekly/monthly growth
- **Active vs Inactive Users** - Last activity within 30 days
- **User Retention Rate** - Percentage returning after first visit
- **Top Customers by Spend** - Ranked by total `amount_paid`

### Vehicle Analytics
- **Total Registered Vehicles** - Count from `VEHICLES`
- **Vehicle Type Distribution** - Breakdown by `plate_type` (Private, Commercial)
- **Repeat Vehicles** - Vehicles with multiple parking sessions

## 4. Enforcement & Compliance

### Violation Metrics
- **Total Violations Issued** - Count from `CUSTOMER_VIOLATIONS`
- **Violations by Type** - Breakdown by `VIOLATION_TYPES.code`
- **Violation Hotspots** - Geographic distribution by `zone_id`
- **Violation Trend** - Time series of violations
- **Average Fine Amount** - Mean `fee_amount`
- **Violation Rate** - (Violations / Total Tickets) × 100

### Enforcement Actions
- **Total Clamps/Tows** - Count by `action_type`
- **Action Status Distribution** - PENDING, IN_PROGRESS, COMPLETED
- **Average Resolution Time** - Time between `requested_at` and `release_date`
- **Enforcement Efficiency** - Actions completed per officer
- **Impounded Vehicles** - Current count where `action_type = 'IMPOUND'` and `status != 'RELEASED'`

### Appeals & Disputes
- **Total Appeals Filed** - Count from `APPEALS`
- **Appeal Success Rate** - (Approved / Total Appeals) × 100
- **Pending Appeals** - Count where `status = 'PENDING'`
- **Average Appeal Processing Time** - Duration from creation to resolution

## 5. Operational Performance

### Agent Performance
- **Tickets Issued by Agent** - Count by `agent_id`
- **Revenue per Agent** - Sum of `amount_paid` grouped by `agent_id`
- **Average Processing Time** - Time from initiation to confirmation
- **Agent Efficiency Score** - Tickets processed per hour

### Enforcement Officer Performance
- **Violations Issued per Officer** - Count by `enforcement_officer_id`
- **Actions Completed** - Clamps/tows by officer
- **Average Response Time** - Time to first action

### Channel Performance
- **Bookings by Channel** - Distribution (WEB, MOBILE_APP, SMS, POS)
- **Channel Conversion Rate** - Completed vs initiated bookings
- **SMS Parking Usage** - Specific metrics for SMS channel adoption

## 6. Zone & Bay Analytics

### Geographic Performance
- **Revenue by Zone** - Total earnings per `PARKING_ZONES`
- **Most Profitable Bays** - Ranked by revenue
- **Underutilized Zones** - Low occupancy areas
- **Zone Occupancy Heatmap** - Geographic visualization

### Capacity Planning
- **Overcrowding Alerts** - Bays exceeding 95% capacity
- **Expansion Opportunities** - High-demand, low-capacity zones
- **Optimal Pricing Analysis** - Revenue vs occupancy correlation

## 7. Time-Based Analytics

### Temporal Patterns
- **Hourly Traffic Pattern** - Parking sessions by hour
- **Day of Week Analysis** - Usage patterns across weekdays
- **Seasonal Trends** - Monthly/quarterly comparisons
- **Holiday Impact** - Usage variance on public holidays

### Duration Analytics
- **Average Parking Duration** - Mean `duration_hours`
- **Overstay Rate** - Sessions extending beyond `expiry_time`
- **Short vs Long Stay Distribution** - Categorized by duration brackets

## 8. Customer Experience Metrics

### Service Quality
- **Ticket Expiration Rate** - Percentage of tickets reaching `expiry_time`
- **Cancellation Rate** - Tickets with `status = 'CANCELLED'`
- **Average Wait Time** - For assisted bookings
- **Customer Complaint Rate** - From support tickets (if integrated)

### Satisfaction Indicators
- **Repeat Customer Rate** - Customers with 2+ bookings
- **Churn Rate** - Customers not returning after 90 days
- **Net Promoter Score** - If survey data available

## 9. Compliance & Regulatory

### Payment Compliance
- **Payment Success Rate** - Successful vs failed transactions
- **Outstanding Payments** - Total `amount` where `payment_status = 'PENDING'`
- **Payment Method Adoption** - Trend of cashless payments

### Operational Compliance
- **Slots Out of Service** - Count where `status = 'OUT_OF_SERVICE'`
- **Maintenance Alerts** - Bays requiring attention
- **Regulatory Violations** - Non-compliance incidents

## 10. Predictive & Advanced Analytics

### Forecasting
- **Demand Prediction** - Expected occupancy for next 7/30 days
- **Revenue Projection** - Forecasted earnings
- **Peak Period Prediction** - Anticipated high-demand times

### Anomaly Detection
- **Unusual Revenue Drops** - Significant variance alerts
- **Suspicious Activities** - Multiple violations from same vehicle
- **System Health Alerts** - Booking failures, API errors

---

## Dashboard Layout Recommendations

### Executive Dashboard (C-Suite)
- Revenue overview, growth trends, key KPIs
- High-level zone performance
- Financial health indicators

### Operations Dashboard (Managers)
- Real-time occupancy, agent performance
- Enforcement actions, violation trends
- Zone-specific metrics

### Enforcement Dashboard (Officers)
- Active violations, outstanding actions
- Personal performance metrics
- Violation hotspots map

### Customer Service Dashboard
- Active tickets, customer issues
- Appeal status, payment issues
- User activity metrics

---

## Dashboard Features & Capabilities

### Filter Options
All metrics should support:
- **Date range filters** (Today, Week, Month, Quarter, Year, Custom)
- **Zone/Bay drill-down** capabilities
- **User type filters** (Customer, Agent, Officer)
- **Status filters** (Active, Completed, Pending, etc.)

### Export & Reporting
- **Export functionality** (PDF, CSV, Excel)
- **Scheduled reports** (Daily, Weekly, Monthly)
- **Email notifications** for critical alerts
- **API access** for custom integrations

### Real-Time Capabilities
- **Live updates** for occupancy and revenue metrics
- **Push notifications** for critical alerts
- **Auto-refresh** intervals (configurable)
- **Real-time collaboration** for multi-user dashboards

### Comparative Analysis
- **Year-over-Year (YoY)** comparisons
- **Month-over-Month (MoM)** trends
- **Week-over-Week (WoW)** changes
- **Period-over-Period** custom comparisons
- **Benchmark comparisons** against targets/goals

---

## Data Visualization Recommendations

### Chart Types by Metric Category

**Revenue Metrics:**
- Line charts for trend analysis
- Bar charts for channel/method comparison
- Pie charts for distribution
- Area charts for cumulative revenue

**Occupancy Metrics:**
- Gauge charts for current occupancy rate
- Heatmaps for zone/time patterns
- Stacked bar charts for zone comparison
- Real-time number displays for available spaces

**Performance Metrics:**
- Leaderboards for top performers
- Horizontal bar charts for rankings
- Scatter plots for efficiency analysis
- KPI cards for quick insights

**Geographic Data:**
- Interactive maps for zone performance
- Choropleth maps for violation hotspots
- Bubble maps for revenue by location
- Route maps for enforcement patrols

**Time-Series Data:**
- Line charts for trends
- Calendar heatmaps for usage patterns
- Time-of-day radial charts
- Gantt charts for action timelines

---

## Key Performance Indicators (KPIs) Summary

### Critical Business Metrics
1. **Daily Revenue Target Achievement** - Actual vs Goal
2. **Overall Occupancy Rate** - System-wide utilization
3. **Collection Efficiency** - Fine payment rate
4. **Customer Satisfaction Score** - Based on retention and complaints
5. **Enforcement Response Time** - Average time to action

### Operational Excellence Metrics
1. **Agent Productivity** - Tickets per agent per day
2. **System Uptime** - Availability percentage
3. **Channel Adoption Rate** - Digital vs traditional usage
4. **Space Turnover Rate** - Vehicles served per slot
5. **Payment Success Rate** - Transaction completion

### Growth Indicators
1. **User Acquisition Rate** - New registrations trend
2. **Revenue Growth Rate** - Month-over-month increase
3. **Market Penetration** - Registered vehicles vs total vehicles in area
4. **Service Expansion** - New zones/bays added
5. **Technology Adoption** - Mobile app/SMS usage growth

---

## Alert & Notification Thresholds

### Revenue Alerts
- Daily revenue drops below 70% of average
- Payment failures exceed 5% of transactions
- Outstanding collections exceed ₦500,000

### Operational Alerts
- Occupancy exceeds 95% (overcrowding)
- Occupancy drops below 20% (underutilization)
- More than 10% of slots marked out of service

### Enforcement Alerts
- Pending enforcement actions exceed 24 hours
- Violation rate increases by 50% week-over-week
- Appeal backlog exceeds 50 pending cases

### System Alerts
- API response time exceeds 2 seconds
- Database query performance degrades
- Booking failures exceed 2% of attempts

---

## Data Refresh Intervals

### Real-Time (Every 30 seconds - 1 minute)
- Current occupancy rates
- Available spaces
- Active parking sessions
- Live revenue counter

### Near Real-Time (Every 5-15 minutes)
- Booking trends
- Channel performance
- Agent activity
- Enforcement actions

### Periodic (Hourly/Daily)
- Revenue reports
- Violation summaries
- Performance rankings
- Comparative analytics

### Batch Processing (Daily/Weekly)
- Historical trend analysis
- Predictive models
- Advanced analytics
- Scheduled reports

---

## Mobile Dashboard Considerations

### Mobile-Optimized Metrics
- Simplified KPI cards
- Touch-friendly charts
- Swipe-based navigation
- Offline capability for key metrics

### Role-Based Mobile Views
**Enforcement Officers:**
- Active violations map
- Assigned actions
- Quick violation logging
- Photo upload capability

**Parking Agents:**
- Available spaces
- Today's revenue
- Active tickets
- Quick booking interface

**Managers:**
- Key KPIs summary
- Alert notifications
- Approval workflows
- Quick reports access

---

## Integration Points

### External Systems
- **Payment Gateways** - Transaction status
- **SMS Provider** - Message delivery rates
- **ICELL Systems** - Third-party data sync
- **Government Databases** - Vehicle verification

### Internal Systems
- **CRM** - Customer interaction history
- **Financial System** - Accounting reconciliation
- **HR System** - Agent/officer management
- **Maintenance System** - Equipment status

---

## Security & Access Control

### Dashboard Access Levels
1. **Executive** - All metrics, system-wide view
2. **Operations Manager** - Operational metrics, multi-zone
3. **Zone Manager** - Zone-specific metrics
4. **Agent** - Personal performance only
5. **Finance** - Revenue and payment metrics
6. **Enforcement** - Violation and action metrics

### Data Privacy Considerations
- Anonymized customer data in aggregate views
- Role-based data masking
- Audit trails for sensitive data access
- GDPR/data protection compliance

---

## Performance Optimization

### Dashboard Loading Strategies
- Lazy loading for complex visualizations
- Cached data for historical metrics
- Progressive rendering for large datasets
- Pre-aggregated tables for common queries

### Database Optimization
- Indexed columns for frequent queries
- Materialized views for complex calculations
- Partitioned tables for time-series data
- Query optimization for dashboard queries

---

## Future Enhancements

### AI/ML Integration
- Predictive parking demand
- Dynamic pricing recommendations
- Fraud detection algorithms
- Customer behavior analysis

### Advanced Visualizations
- 3D parking facility maps
- Augmented reality for enforcement
- Interactive simulation tools
- Scenario planning interfaces

### Automation
- Automated report generation
- Smart alerting with ML
- Auto-scaling capacity recommendations
- Intelligent anomaly detection

---

## Appendix: Metric Calculation Formulas

### Revenue Metrics
```
Total Revenue = SUM(PARKING_TICKETS.amount_paid) + SUM(FINES.amount WHERE is_paid = true)
Average Transaction Value = Total Revenue / COUNT(PARKING_TICKETS)
Collection Rate = (Paid Fines / Total Fines) * 100
```

### Occupancy Metrics
```
Occupancy Rate = (COUNT(slots WHERE status = 'OCCUPIED') / COUNT(total_slots)) * 100
Turnover Rate = COUNT(tickets_per_day) / COUNT(slots)
Space Efficiency = (SUM(duration_hours) / (COUNT(slots) * 24)) * 100
```

### Performance Metrics
```
Agent Efficiency = COUNT(tickets) / working_hours
Enforcement Response Time = AVG(action_time - violation_time)
Appeal Success Rate = (COUNT(approved_appeals) / COUNT(total_appeals)) * 100
```

### Customer Metrics
```
Retention Rate = (returning_customers / total_customers) * 100
Churn Rate = (customers_not_returned_90days / total_customers) * 100
Repeat Customer Rate = (customers_with_2plus_bookings / total_customers) * 100
```

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Prepared For:** LASPA Parking Management System  
**Classification:** Internal Use
