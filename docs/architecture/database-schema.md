# Database Schema

## Prisma Schema Definition

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== CORE ENTITIES =====

model User {
  id            String    @id @default(uuid())
  tenant_id     String?   // null for contractors (shared across tenants)
  email         String    @unique
  password_hash String
  role          UserRole
  first_name    String
  last_name     String
  phone         String
  avatar_url    String?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  deleted_at    DateTime?

  // Relationships
  tenant         Tenant?       @relation(fields: [tenant_id], references: [id])
  properties     Property[]    @relation("PropertyOwner")
  work_orders    WorkOrder[]   @relation("WorkOrderCreator")
  photos_uploaded Photo[]      @relation("PhotoUploader")
  contractor_profile Contractor? @relation("ContractorUser")

  @@index([tenant_id])
  @@index([email])
  @@map("users")
}

enum UserRole {
  LANDLORD
  CONTRACTOR
  ADMIN
}

model Tenant {
  id                  String             @id @default(uuid())
  owner_user_id       String             @unique
  company_name        String?
  subscription_status SubscriptionStatus
  subscription_plan   String
  trial_ends_at       DateTime
  stripe_customer_id  String?
  created_at          DateTime           @default(now())
  updated_at          DateTime           @updatedAt

  // Relationships
  owner      User         @relation(fields: [owner_user_id], references: [id])
  properties Property[]
  work_orders WorkOrder[]
  contractors Contractor[]
  certificates Certificate[]
  photos     Photo[]

  @@index([owner_user_id])
  @@map("tenants")
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAUSED
  CANCELLED
}

model Property {
  id                   String        @id @default(uuid())
  tenant_id            String
  owner_user_id        String
  name                 String
  address_line1        String
  address_line2        String?
  city                 String
  postcode             String
  property_type        PropertyType
  bedrooms             Int
  bathrooms            Int
  access_instructions  String?       @db.Text
  status               PropertyStatus @default(ACTIVE)
  created_at           DateTime      @default(now())
  updated_at           DateTime      @updatedAt
  deleted_at           DateTime?

  // Relationships
  tenant       Tenant        @relation(fields: [tenant_id], references: [id])
  owner        User          @relation("PropertyOwner", fields: [owner_user_id], references: [id])
  work_orders  WorkOrder[]
  certificates Certificate[]
  photos       Photo[]

  @@index([tenant_id])
  @@index([owner_user_id])
  @@index([postcode])
  @@map("properties")
}

enum PropertyType {
  CABIN
  COTTAGE
  FLAT
  HOUSE
  HMO
  OTHER
}

enum PropertyStatus {
  ACTIVE
  INACTIVE
}

model WorkOrder {
  id                String            @id @default(uuid())
  tenant_id         String
  property_id       String
  contractor_id     String?
  created_by_user_id String
  title             String
  description       String?           @db.Text
  status            WorkOrderStatus   @default(OPEN)
  priority          WorkOrderPriority
  category          WorkOrderCategory
  due_date          DateTime?
  estimated_cost    Decimal?          @db.Decimal(10, 2)
  actual_cost       Decimal?          @db.Decimal(10, 2)
  started_at        DateTime?
  completed_at      DateTime?
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt
  deleted_at        DateTime?

  // Relationships
  tenant      Tenant      @relation(fields: [tenant_id], references: [id])
  property    Property    @relation(fields: [property_id], references: [id])
  contractor  Contractor? @relation(fields: [contractor_id], references: [id])
  created_by  User        @relation("WorkOrderCreator", fields: [created_by_user_id], references: [id])
  photos      Photo[]

  @@index([tenant_id])
  @@index([property_id])
  @@index([contractor_id])
  @@index([status])
  @@index([priority])
  @@index([due_date])
  @@map("work_orders")
}

enum WorkOrderStatus {
  OPEN
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum WorkOrderPriority {
  EMERGENCY
  HIGH
  MEDIUM
  LOW
}

enum WorkOrderCategory {
  PLUMBING
  ELECTRICAL
  HEATING
  APPLIANCES
  EXTERIOR
  INTERIOR
  OTHER
}

model Contractor {
  id            String   @id @default(uuid())
  tenant_id     String
  user_id       String?  @unique // Links to User if contractor has app account
  name          String
  company_name  String?
  phone         String
  email         String?
  specialties   String[] // Array of categories
  service_area  String?
  hourly_rate   Decimal? @db.Decimal(10, 2)
  notes         String?  @db.Text
  preferred     Boolean  @default(false)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  deleted_at    DateTime?

  // Relationships
  tenant      Tenant      @relation(fields: [tenant_id], references: [id])
  user        User?       @relation("ContractorUser", fields: [user_id], references: [id])
  work_orders WorkOrder[]

  @@index([tenant_id])
  @@index([user_id])
  @@index([preferred])
  @@map("contractors")
}

model Photo {
  id                     String   @id @default(uuid())
  tenant_id              String
  uploaded_by_user_id    String
  property_id            String?
  work_order_id          String?
  s3_key                 String
  s3_url                 String
  thumbnail_url          String
  file_size              Int      // bytes
  mime_type              String
  width                  Int
  height                 Int
  label                  PhotoLabel?
  caption                String?  @db.Text
  gps_latitude           Decimal? @db.Decimal(10, 8)
  gps_longitude          Decimal? @db.Decimal(11, 8)
  quality_check_passed   Boolean?
  quality_check_details  Json?    // { brightness_score, blur_score, warnings }
  created_at             DateTime @default(now())

  // Relationships
  tenant       Tenant     @relation(fields: [tenant_id], references: [id])
  uploaded_by  User       @relation("PhotoUploader", fields: [uploaded_by_user_id], references: [id])
  property     Property?  @relation(fields: [property_id], references: [id])
  work_order   WorkOrder? @relation(fields: [work_order_id], references: [id])

  @@index([tenant_id])
  @@index([property_id])
  @@index([work_order_id])
  @@index([created_at])
  @@map("photos")
}

enum PhotoLabel {
  BEFORE
  DURING
  AFTER
  PROPERTY
}

model Certificate {
  id                String          @id @default(uuid())
  tenant_id         String
  property_id       String
  certificate_type  CertificateType
  issue_date        DateTime
  expiry_date       DateTime
  document_url      String
  certificate_number String?
  issuer_name       String?
  notes             String?         @db.Text
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  deleted_at        DateTime?

  // Relationships
  tenant   Tenant   @relation(fields: [tenant_id], references: [id])
  property Property @relation(fields: [property_id], references: [id])

  @@index([tenant_id])
  @@index([property_id])
  @@index([expiry_date])
  @@index([certificate_type])
  @@map("certificates")
}

enum CertificateType {
  GAS_SAFETY
  ELECTRICAL
  EPC
  STL_LICENSE
  OTHER
}

// ===== AUDIT & SYNC =====

model AuditLog {
  id         String   @id @default(uuid())
  tenant_id  String
  user_id    String
  entity_type String  // 'property', 'work_order', etc.
  entity_id  String
  action     String   // 'CREATE', 'UPDATE', 'DELETE'
  changes    Json?    // Old vs new values
  ip_address String?
  user_agent String?
  created_at DateTime @default(now())

  @@index([tenant_id])
  @@index([user_id])
  @@index([entity_type, entity_id])
  @@index([created_at])
  @@map("audit_logs")
}

// ===== BACKGROUND JOBS (Phase 2) =====

model Job {
  id          String    @id @default(uuid())
  job_type    String    // 'send_sms', 'send_email', 'analyze_photo'
  payload     Json
  status      JobStatus @default(PENDING)
  attempts    Int       @default(0)
  max_attempts Int      @default(3)
  last_error  String?   @db.Text
  scheduled_at DateTime @default(now())
  started_at  DateTime?
  completed_at DateTime?
  created_at  DateTime  @default(now())

  @@index([status])
  @@index([scheduled_at])
  @@map("jobs")
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

---

## Key Design Decisions

### Multi-Tenancy Strategy

**Approach:** Shared database with `tenant_id` on all tables

**Rationale:**
- **Cost-Effective**: Single PostgreSQL instance serves all tenants (~£15-30/month vs. £15/tenant with database-per-tenant)
- **Operational Simplicity**: Single backup, single migration, single connection pool
- **Query Performance**: Proper indexing on `tenant_id` ensures fast filtering
- **Future Migration Path**: Can move to Row-Level Security (RLS) or database-per-tenant if enterprise customers require stricter isolation

**Security Measures:**
1. **Middleware Enforcement**: Every query automatically filtered by `tenant_id` from JWT
2. **Foreign Key Constraints**: Prevent accidental cross-tenant references
3. **Indexes**: All tenant_id columns indexed for fast filtering
4. **Audit Logging**: Track all data access for compliance

**Trade-offs:**
- ✅ **Pro**: Dramatically lower costs, simpler operations
- ❌ **Con**: Requires disciplined development (accidental cross-tenant queries if middleware bypassed)
- ❌ **Con**: Perceived security risk for enterprise customers (can migrate to RLS later)

---

### Soft Deletes

**Approach:** All entities have `deleted_at` timestamp column

**Rationale:**
- **Data Recovery**: Users can recover accidentally deleted properties/work orders
- **Audit Trail**: Maintain complete history for compliance
- **Relational Integrity**: Preserve references when parent entities deleted

**Implementation:**
- Prisma queries automatically filter `WHERE deleted_at IS NULL` (via middleware)
- Delete endpoints set `deleted_at = NOW()` instead of `DELETE` statement
- Admin panel can permanently purge after 90 days (GDPR right to erasure)

---

### Timestamps & Audit Fields

**Standard Fields on All Tables:**
- `created_at`: DateTime @default(now())
- `updated_at`: DateTime @updatedAt (Prisma auto-updates)
- `deleted_at`: DateTime? (soft delete)

**Rationale:**
- **Debugging**: Trace when issues occurred
- **Sync**: `updated_at` enables delta sync (GET /sync/delta?since=<timestamp>)
- **Compliance**: GDPR requires knowing when data created/modified

---

### Indexing Strategy

**Primary Indexes:**
1. **tenant_id**: Every table (multi-tenancy filtering)
2. **Foreign Keys**: All foreign key columns (JOIN performance)
3. **Status Fields**: work_orders.status, users.role (frequent filters)
4. **Timestamps**: created_at, updated_at, expiry_date (range queries)

**Query Optimization Examples:**
```sql
-- Efficiently fetch landlord's active work orders
SELECT * FROM work_orders
WHERE tenant_id = $1 AND status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS')
ORDER BY priority DESC, due_date ASC;
-- Uses: (tenant_id, status) composite index

-- Find expiring certificates in next 60 days
SELECT * FROM certificates
WHERE tenant_id = $1 AND expiry_date BETWEEN NOW() AND NOW() + INTERVAL '60 days';
-- Uses: (tenant_id, expiry_date) composite index
```

---

### JSON Columns

**Used for:**
- `quality_check_details` (Photo): Flexible schema for AI service responses
- `audit_logs.changes`: Before/after values for audit trail
- `jobs.payload`: Background job parameters

**Rationale:**
- **Flexibility**: Schema can evolve without migrations (AI service adds new fields)
- **PostgreSQL JSON Support**: Native JSON operators, GIN indexing for complex queries
- **Type Safety**: Zod schemas validate JSON structure at runtime

**Trade-off:** Less type-safe than relational columns, but acceptable for flexible/evolving data.

---

## Database Sizing & Cost

**MVP (<100 users):**
- **Instance**: db.t3.micro (1 vCPU, 1GB RAM, 20GB storage)
- **Cost**: ~£15-20/month (Single-AZ)
- **Connections**: 10-20 concurrent (sufficient for single EC2 API instance)
- **Storage Growth**: ~1GB/month (primarily photos metadata, actual photos in S3)

**Growth (100-500 users):**
- **Instance**: db.t3.small (2 vCPU, 2GB RAM, 50GB storage)
- **Cost**: ~£30-40/month (Multi-AZ for high availability)
- **Connections**: 50-100 concurrent (API connection pooling via Prisma)

**Scaling Path:**
- **Read Replicas**: Add read replica for reporting queries (Phase 2)
- **Connection Pooling**: PgBouncer if connections exceed limits
- **Partitioning**: Partition audit_logs by created_at if >10M rows
- **Archival**: Move completed work_orders >1 year old to S3 (Phase 3)

---

