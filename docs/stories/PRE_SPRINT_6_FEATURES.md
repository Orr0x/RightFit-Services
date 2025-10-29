# Pre-Sprint 6 Features: Tenant Management & Financial Dashboard

**Status**: Approved for Implementation
**Timeline**: 1 week (30 hours)
**Start Date**: November 4, 2025
**Completion Target**: November 8, 2025

## Overview

These two features address critical gaps identified in the pre-production review. They transform RightFit from a work order tracker into a comprehensive property management platform.

---

## Feature 5: Financial Dashboard

**Story Points**: 15
**Priority**: HIGH
**Dependencies**: None (works with existing properties/work orders)

### Business Value

UK landlords need:
- Income/expense tracking for tax returns
- Profit & loss visibility per property
- CSV export for accountants
- Understanding of property performance

### User Stories

#### US-FIN-1: Income/Expense Tracking (6 hours)

**As a** landlord
**I want to** track income and expenses for each property
**So that** I can understand profitability and prepare tax returns

**Acceptance Criteria:**
- [ ] Can record rental income with date, amount, property, tenant
- [ ] Can record expenses with date, amount, property, category, receipt upload
- [ ] Expense categories: Repairs, Maintenance, Insurance, Mortgage, Utilities, Legal, Other
- [ ] Can attach receipts (photos/PDFs) to expenses via S3
- [ ] Can edit/delete transactions
- [ ] Transactions filtered by tenant context
- [ ] Mobile and web support

**Database Schema:**
```prisma
model FinancialTransaction {
  id          String   @id @default(uuid())
  tenantId    String
  propertyId  String
  type        TransactionType
  category    ExpenseCategory?
  amount      Float
  date        DateTime
  description String
  receiptUrl  String?
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  createdBy   User     @relation(fields: [createdById], references: [id])

  @@index([tenantId, propertyId])
  @@index([date])
}

enum TransactionType {
  INCOME
  EXPENSE
}

enum ExpenseCategory {
  REPAIRS
  MAINTENANCE
  INSURANCE
  MORTGAGE
  UTILITIES
  LEGAL
  ADMIN
  OTHER
}
```

**API Endpoints:**
```typescript
// POST /api/financial/transactions
interface CreateTransactionDto {
  propertyId: string;
  type: 'INCOME' | 'EXPENSE';
  category?: ExpenseCategory;
  amount: number;
  date: string; // ISO date
  description: string;
  receiptFile?: File; // Multipart upload
}

// GET /api/financial/transactions?propertyId=xxx&startDate=xxx&endDate=xxx
// PATCH /api/financial/transactions/:id
// DELETE /api/financial/transactions/:id
```

**Mobile UI:**
- Bottom tab: "Finances" (new tab)
- Transaction list with filters (property, date range, type)
- FAB to add transaction
- Form with property picker, amount, date, category, photo upload

**Web UI:**
- Sidebar: "Finances" (new item)
- Data table with sorting/filtering
- Add button top-right
- Modal form for add/edit

**Testing:**
- Create income transaction
- Create expense with receipt upload
- Filter by property
- Edit transaction
- Delete transaction
- Verify tenant isolation

---

#### US-FIN-2: Property P&L Report (5 hours)

**As a** landlord
**I want to** see profit & loss for each property
**So that** I can identify underperforming assets

**Acceptance Criteria:**
- [ ] P&L report per property showing:
  - Total income
  - Total expenses (by category)
  - Net profit/loss
  - Profit margin %
- [ ] Date range filter (last 30 days, last quarter, last year, custom)
- [ ] Visual charts (income vs expenses over time)
- [ ] Property comparison view (all properties side-by-side)
- [ ] Mobile and web support

**API Endpoints:**
```typescript
// GET /api/financial/reports/property/:propertyId?startDate=xxx&endDate=xxx
interface PropertyPLReport {
  propertyId: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number; // percentage
  expensesByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyBreakdown: {
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }[];
}

// GET /api/financial/reports/overview?startDate=xxx&endDate=xxx
// Returns P&L for all properties
```

**Mobile UI:**
- Financial Dashboard screen with summary cards:
  - Total Income (green)
  - Total Expenses (red)
  - Net Profit (blue)
- Property dropdown filter
- Date range picker
- Bar chart: Income vs Expenses by month
- Pie chart: Expenses by category

**Web UI:**
- Financial Dashboard page
- Property tabs or dropdown
- Summary KPI cards
- Charts using recharts library
- Responsive layout

**Testing:**
- Create transactions for multiple properties
- Generate P&L report
- Verify calculations
- Test date range filters
- Compare multiple properties

---

#### US-FIN-3: Tax Export (2 hours)

**As a** landlord
**I want to** export financial data to CSV
**So that** I can provide it to my accountant for tax filing

**Acceptance Criteria:**
- [ ] Export button on transactions page
- [ ] CSV includes: Date, Property, Type, Category, Amount, Description, Receipt URL
- [ ] Filtered by current date range/property selection
- [ ] Formatted for UK tax return (Self Assessment)
- [ ] Filename: `rightfit-transactions-{startDate}-{endDate}.csv`

**API Endpoints:**
```typescript
// GET /api/financial/export?propertyId=xxx&startDate=xxx&endDate=xxx
// Returns CSV file download
```

**Implementation:**
```typescript
import { Parser } from 'json2csv';

export async function exportTransactions(
  tenantId: string,
  filters: TransactionFilters
): Promise<string> {
  const transactions = await prisma.financialTransaction.findMany({
    where: {
      tenantId,
      ...filters,
    },
    include: {
      property: { select: { address: true } },
    },
    orderBy: { date: 'asc' },
  });

  const fields = [
    { label: 'Date', value: 'date' },
    { label: 'Property', value: 'property.address' },
    { label: 'Type', value: 'type' },
    { label: 'Category', value: 'category' },
    { label: 'Amount (£)', value: 'amount' },
    { label: 'Description', value: 'description' },
    { label: 'Receipt', value: 'receiptUrl' },
  ];

  const parser = new Parser({ fields });
  return parser.parse(transactions);
}
```

**Testing:**
- Export with various filters
- Verify CSV format
- Test with accountant (manual validation)

---

#### US-FIN-4: Budget & Alerts (2 hours)

**As a** landlord
**I want to** set expense budgets and receive alerts
**So that** I can control costs

**Acceptance Criteria:**
- [ ] Set monthly expense budget per property
- [ ] Dashboard shows budget vs actual spend
- [ ] Alert when 80% budget reached
- [ ] Alert when budget exceeded
- [ ] Push notification + email notification

**Database Schema:**
```prisma
model PropertyBudget {
  id                String   @id @default(uuid())
  tenantId          String
  propertyId        String   @unique
  monthlyBudget     Float
  alertThreshold    Float    @default(0.8) // 80%
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
}
```

**API Endpoints:**
```typescript
// POST /api/financial/budgets
// PATCH /api/financial/budgets/:propertyId
// GET /api/financial/budgets (returns all properties with budget status)

interface BudgetStatus {
  propertyId: string;
  propertyName: string;
  monthlyBudget: number;
  currentSpend: number;
  percentage: number;
  daysRemaining: number;
  status: 'on_track' | 'warning' | 'exceeded';
}
```

**Implementation:**
- Background job checks budgets daily
- Sends notification when threshold crossed
- Transaction creation triggers budget check

**Testing:**
- Set budget
- Create expenses exceeding 80%
- Verify alert received
- Create expenses exceeding 100%
- Verify second alert

---

## Feature 6: Tenant Management System

**Story Points**: 15
**Priority**: CRITICAL
**Dependencies**: None

### Business Value

**This is the most critical gap.** A property management platform without tenant tracking is like a CRM without contacts. Landlords need to:
- Know who lives where
- Track tenancy dates (move-in, move-out, lease expiry)
- Record rent amounts and payment frequency
- Contact tenant details
- Link work orders to specific tenants

### User Stories

#### US-TEN-1: Tenant CRUD (5 hours)

**As a** landlord
**I want to** add, view, edit, and remove tenants
**So that** I can track who occupies my properties

**Acceptance Criteria:**
- [ ] Can create tenant with: Name, Email, Phone, Move-in date, Lease expiry, Rent amount, Payment frequency
- [ ] Can assign tenant to property (one-to-many: property has many tenants over time)
- [ ] Can mark tenant as active or inactive (moved out)
- [ ] Can view tenant list (all tenants, active only, inactive only)
- [ ] Can search/filter tenants by name, property, status
- [ ] Tenant details page shows: Contact info, tenancy dates, rent details, associated work orders
- [ ] Multi-tenant isolation (tenantId)
- [ ] Mobile and web support

**Database Schema:**
```prisma
model PropertyTenant {
  id              String         @id @default(uuid())
  tenantId        String         // Organization tenant (confusing naming, but matches existing schema)
  propertyId      String
  name            String
  email           String?
  phone           String?
  moveInDate      DateTime
  leaseExpiryDate DateTime?
  moveOutDate     DateTime?      // Null = currently active
  rentAmount      Float
  rentFrequency   RentFrequency  @default(MONTHLY)
  depositAmount   Float?
  notes           String?
  status          TenantStatus   @default(ACTIVE)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  tenant       Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  property     Property     @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  workOrders   WorkOrder[]  // Work orders can be linked to specific tenant

  @@index([tenantId, propertyId])
  @@index([status])
  @@index([leaseExpiryDate])
}

enum RentFrequency {
  WEEKLY
  FORTNIGHTLY
  MONTHLY
  QUARTERLY
}

enum TenantStatus {
  ACTIVE
  INACTIVE
  NOTICE_GIVEN
}

// Update WorkOrder schema
model WorkOrder {
  // ... existing fields
  propertyTenantId String?
  propertyTenant   PropertyTenant? @relation(fields: [propertyTenantId], references: [id])
}
```

**API Endpoints:**
```typescript
// POST /api/tenants
interface CreateTenantDto {
  propertyId: string;
  name: string;
  email?: string;
  phone?: string;
  moveInDate: string;
  leaseExpiryDate?: string;
  rentAmount: number;
  rentFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  depositAmount?: number;
  notes?: string;
}

// GET /api/tenants?propertyId=xxx&status=ACTIVE
// GET /api/tenants/:id
// PATCH /api/tenants/:id
// DELETE /api/tenants/:id
```

**Mobile UI:**
- New tab: "Tenants" (5th bottom tab)
- List view with tenant cards showing:
  - Name
  - Property address
  - Rent amount
  - Move-in date
  - Status badge
- FAB to add tenant
- Tenant detail screen with tabs:
  - Details (contact info, dates, rent)
  - Work Orders (linked work orders)
  - History (move-in/out history)

**Web UI:**
- Sidebar: "Tenants" (new menu item)
- Data table with columns: Name, Property, Rent, Move-in, Lease Expiry, Status
- Add button top-right
- Drawer for add/edit form
- Detail page on row click

**Testing:**
- Create tenant for property
- View tenant list
- Edit tenant details
- Mark tenant as moved out (moveOutDate)
- Filter by status
- Verify tenant isolation

---

#### US-TEN-2: Lease Expiry Alerts (3 hours)

**As a** landlord
**I want to** receive alerts when leases are expiring
**So that** I can renew or find new tenants

**Acceptance Criteria:**
- [ ] Alert 60 days before lease expiry
- [ ] Alert 30 days before lease expiry
- [ ] Alert on expiry date
- [ ] Push notification + email
- [ ] Dashboard widget showing upcoming expirations
- [ ] Can dismiss/snooze alerts
- [ ] Can mark lease as renewed (updates leaseExpiryDate)

**Implementation:**
```typescript
// Daily cron job
export async function checkLeaseExpiries() {
  const now = new Date();
  const in60Days = addDays(now, 60);
  const in30Days = addDays(now, 30);

  // 60-day alerts
  const expiringSoon = await prisma.propertyTenant.findMany({
    where: {
      status: 'ACTIVE',
      leaseExpiryDate: {
        gte: now,
        lte: in60Days,
      },
      // Check if alert not already sent
    },
    include: {
      property: true,
      tenant: { include: { users: true } },
    },
  });

  for (const tenant of expiringSoon) {
    const daysUntilExpiry = differenceInDays(tenant.leaseExpiryDate, now);

    if (daysUntilExpiry === 60 || daysUntilExpiry === 30 || daysUntilExpiry === 0) {
      await sendLeaseExpiryAlert(tenant, daysUntilExpiry);
    }
  }
}

async function sendLeaseExpiryAlert(tenant: PropertyTenant, days: number) {
  const message = days === 0
    ? `Lease expired today for ${tenant.name} at ${tenant.property.address}`
    : `Lease expiring in ${days} days for ${tenant.name} at ${tenant.property.address}`;

  // Send push notification
  await notificationService.send({
    userId: tenant.tenant.users[0].id,
    title: 'Lease Expiry Alert',
    body: message,
    data: { type: 'lease_expiry', tenantId: tenant.id },
  });

  // Send email
  await emailService.send({
    to: tenant.tenant.users[0].email,
    subject: 'Lease Expiry Alert - RightFit Services',
    template: 'lease-expiry',
    data: { tenant, days },
  });
}
```

**Dashboard Widget:**
```typescript
// GET /api/tenants/expiring?days=90
// Returns tenants with leases expiring in next 90 days
```

**Testing:**
- Create tenant with lease expiring in 55 days
- Run cron job (or mock date)
- Verify alert received
- Test 30-day and expiry-day alerts
- Test renewal flow

---

#### US-TEN-3: Tenant Work Order Association (2 hours)

**As a** landlord
**I want to** link work orders to specific tenants
**So that** I can track maintenance requests per occupant

**Acceptance Criteria:**
- [ ] Work order form has optional tenant field
- [ ] Tenant dropdown filtered by property
- [ ] Work order list shows tenant name (if linked)
- [ ] Tenant detail page shows all their work orders
- [ ] Can filter work orders by tenant

**Implementation:**
- Schema already updated (propertyTenantId in WorkOrder)
- Update CreateWorkOrderDto to include optional propertyTenantId
- Update work order forms (mobile + web)
- Update work order queries to include propertyTenant

**Testing:**
- Create work order with tenant
- View work order list (tenant shown)
- View tenant detail (work orders shown)
- Filter work orders by tenant

---

#### US-TEN-4: Rent Payment Tracking (3 hours)

**As a** landlord
**I want to** track rent payments from tenants
**So that** I know who's paid and who owes

**Acceptance Criteria:**
- [ ] Can record rent payment with date and amount
- [ ] Tenant detail shows payment history
- [ ] Dashboard shows overdue rent (expected payment not received)
- [ ] Can mark payments as expected (recurring schedule)
- [ ] Alert when payment overdue

**Database Schema:**
```prisma
model RentPayment {
  id               String         @id @default(uuid())
  tenantId         String
  propertyTenantId String
  amount           Float
  paymentDate      DateTime
  expectedDate     DateTime?      // When payment was due
  method           PaymentMethod?
  notes            String?
  createdAt        DateTime       @default(now())

  tenant         Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  propertyTenant PropertyTenant @relation(fields: [propertyTenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, propertyTenantId])
  @@index([paymentDate])
}

enum PaymentMethod {
  BANK_TRANSFER
  CASH
  CHECK
  STANDING_ORDER
  OTHER
}
```

**API Endpoints:**
```typescript
// POST /api/tenants/:tenantId/payments
interface RecordRentPaymentDto {
  amount: number;
  paymentDate: string;
  expectedDate?: string;
  method?: PaymentMethod;
  notes?: string;
}

// GET /api/tenants/:tenantId/payments
// GET /api/tenants/overdue-rent
```

**Overdue Logic:**
```typescript
export async function getOverdueRent(tenantId: string) {
  const activeTenants = await prisma.propertyTenant.findMany({
    where: {
      tenantId,
      status: 'ACTIVE',
    },
  });

  const overdueList = [];

  for (const tenant of activeTenants) {
    const lastPayment = await prisma.rentPayment.findFirst({
      where: { propertyTenantId: tenant.id },
      orderBy: { paymentDate: 'desc' },
    });

    const expectedPaymentDate = calculateNextPaymentDate(
      lastPayment?.paymentDate || tenant.moveInDate,
      tenant.rentFrequency
    );

    if (expectedPaymentDate < new Date()) {
      const daysOverdue = differenceInDays(new Date(), expectedPaymentDate);
      overdueList.push({
        tenant,
        expectedDate: expectedPaymentDate,
        daysOverdue,
        amount: tenant.rentAmount,
      });
    }
  }

  return overdueList;
}
```

**Testing:**
- Create tenant with monthly rent
- Record payment
- Wait (or mock) until next payment due
- Verify overdue alert

---

#### US-TEN-5: Mobile Tenant Management (2 hours)

**As a** landlord
**I want to** manage tenants from mobile app
**So that** I can update tenant info on the go

**Acceptance Criteria:**
- [ ] All CRUD operations work offline
- [ ] WatermelonDB sync for tenant data
- [ ] Forms optimized for mobile
- [ ] Photo upload for tenant documents (ID, contract)

**Implementation:**
```typescript
// WatermelonDB Schema
export const propertyTenantsSchema = tableSchema({
  name: 'property_tenants',
  columns: [
    { name: 'server_id', type: 'string', isOptional: true },
    { name: 'tenant_id', type: 'string', isIndexed: true },
    { name: 'property_id', type: 'string', isIndexed: true },
    { name: 'name', type: 'string' },
    { name: 'email', type: 'string', isOptional: true },
    { name: 'phone', type: 'string', isOptional: true },
    { name: 'move_in_date', type: 'number' }, // Timestamp
    { name: 'lease_expiry_date', type: 'number', isOptional: true },
    { name: 'move_out_date', type: 'number', isOptional: true },
    { name: 'rent_amount', type: 'number' },
    { name: 'rent_frequency', type: 'string' },
    { name: 'deposit_amount', type: 'number', isOptional: true },
    { name: 'status', type: 'string' },
    { name: 'synced', type: 'boolean' },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
});

// Model
export class PropertyTenant extends Model {
  static table = 'property_tenants';
  static associations = {
    properties: { type: 'belongs_to', key: 'property_id' },
    work_orders: { type: 'has_many', foreignKey: 'property_tenant_id' },
  };

  @field('server_id') serverId;
  @field('tenant_id') tenantId;
  @field('property_id') propertyId;
  @field('name') name;
  @field('email') email;
  @field('phone') phone;
  @field('move_in_date') moveInDate;
  @field('lease_expiry_date') leaseExpiryDate;
  @field('move_out_date') moveOutDate;
  @field('rent_amount') rentAmount;
  @field('rent_frequency') rentFrequency;
  @field('deposit_amount') depositAmount;
  @field('status') status;
  @field('synced') synced;

  @relation('properties', 'property_id') property;
  @children('work_orders') workOrders;
}
```

**Testing:**
- Create tenant offline
- Sync to server
- Edit tenant offline
- Sync changes
- Verify data integrity

---

## Implementation Plan

### Week 1: November 4-8, 2025

#### Day 1 (Monday): Database Setup (4 hours)
- [ ] Create Prisma schema changes
- [ ] Generate migration: `npx prisma migrate dev --name add-financial-tenant-tracking`
- [ ] Update API types (regenerate Prisma client)
- [ ] Update mobile WatermelonDB schema
- [ ] Write migration tests

#### Day 2 (Tuesday): Financial Backend (8 hours)
- [ ] Implement FinancialService (CRUD transactions)
- [ ] Implement S3 receipt upload
- [ ] Implement budget logic
- [ ] Build P&L report generation
- [ ] Create CSV export
- [ ] Write backend tests

#### Day 3 (Wednesday): Financial Frontend (8 hours)
- [ ] Build web financial dashboard
- [ ] Build mobile financial screens
- [ ] Implement transaction forms (web + mobile)
- [ ] Add charts (income/expenses)
- [ ] Add budget widgets
- [ ] Implement offline sync (mobile)

#### Day 4 (Thursday): Tenant Backend (6 hours)
- [ ] Implement TenantService (CRUD)
- [ ] Implement lease expiry cron job
- [ ] Implement rent payment tracking
- [ ] Link work orders to tenants
- [ ] Write backend tests

#### Day 5 (Friday): Tenant Frontend + Testing (4 hours)
- [ ] Build web tenant management
- [ ] Build mobile tenant screens
- [ ] Add lease expiry dashboard widget
- [ ] Implement offline sync (mobile)
- [ ] End-to-end testing
- [ ] Bug fixes

---

## Testing Checklist

### Financial Dashboard
- [ ] Create income transaction
- [ ] Create expense with receipt upload
- [ ] Receipt appears in S3
- [ ] Generate P&L report for property
- [ ] Verify calculations correct
- [ ] Export to CSV
- [ ] Set budget
- [ ] Trigger budget alert (80%)
- [ ] Trigger budget exceeded alert
- [ ] Test offline sync (mobile)
- [ ] Test tenant isolation

### Tenant Management
- [ ] Create tenant for property
- [ ] View tenant list
- [ ] Edit tenant details
- [ ] Mark tenant as moved out
- [ ] Link work order to tenant
- [ ] View tenant work order history
- [ ] Record rent payment
- [ ] View payment history
- [ ] Trigger overdue rent alert
- [ ] Trigger lease expiry alert (60/30/0 days)
- [ ] Test offline sync (mobile)
- [ ] Test tenant isolation

---

## Dependencies & Packages

```json
{
  "dependencies": {
    "json2csv": "^6.0.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/json2csv": "^5.0.7"
  }
}
```

---

## Rollout Strategy

1. **Deploy Database Migration**: Run migration in dev, test thoroughly
2. **Deploy Backend API**: Deploy financial & tenant endpoints
3. **Deploy Web Dashboard**: Release financial & tenant features on web first
4. **Deploy Mobile App**: Update mobile app with new features
5. **User Communication**: Email existing beta users about new features
6. **Monitor**: Watch Sentry for errors, Sentry performance for slow queries

---

## Success Metrics

After 2 weeks of use:
- [ ] 80%+ of landlords have added tenants
- [ ] 50%+ of landlords have recorded at least one transaction
- [ ] 30%+ have generated P&L report
- [ ] Zero critical bugs reported
- [ ] < 5% error rate on new endpoints

---

## Next Steps After Implementation

1. **Sprint 6: Payment Processing** (Week 2-3)
2. **Production Deployment** (Week 4)
3. **Beta Launch** (Early December)
4. **Gather Feedback** on these new features
5. **Iterate** - Consider Phase 2 features based on usage data
