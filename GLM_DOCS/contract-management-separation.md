# Contract Management Separation

## Overview
This document outlines the strategy for separating contract management, billing, and financial data between cleaning and maintenance services, ensuring each service can manage its own contracts, invoices, and quotes while maintaining financial integrity and cross-service customer billing coordination.

## Current Contract Management Analysis

### Existing Contract Structure
The current system already has separated contract models for cleaning and maintenance services:

#### Cleaning Contracts Model
```sql
model CleaningContract {
  id                     String         @id @default(uuid())
  contract_number        String?        @unique @db.VarChar(50)
  customer_id            String
  service_provider_id    String
  contract_type          ContractType   @default(FLAT_MONTHLY)
  contract_start_date    DateTime       @db.Date
  contract_end_date      DateTime?      @db.Date
  monthly_fee            Decimal        @db.Decimal(10, 2)
  billing_day            Int // 1-31, day of month to invoice
  status                 ContractStatus @default(ACTIVE)
  notes                  String?
  customer_address_line1 String?        @db.VarChar(255)
  customer_address_line2 String?        @db.VarChar(255)
  customer_city          String?        @db.VarChar(100)
  customer_postcode      String?        @db.VarChar(20)
  customer_country       String?        @db.VarChar(100)
}
```

#### Maintenance Contracts Model
```sql
model MaintenanceContract {
  id                     String         @id @default(uuid())
  contract_number        String?        @unique @db.VarChar(50)
  customer_id            String
  service_provider_id    String
  contract_type          ContractType   @default(FLAT_MONTHLY)
  contract_start_date    DateTime       @db.Date
  contract_end_date      DateTime?      @db.Date
  monthly_fee            Decimal        @db.Decimal(10, 2)
  billing_day            Int // 1-31, day of month to invoice
  status                 ContractStatus @default(ACTIVE)
  notes                  String?
  customer_address_line1 String?        @db.VarChar(255)
  customer_address_line2 String?        @db.VarChar(255)
  customer_city          String?        @db.VarChar(100)
  customer_postcode      String?        @db.VarChar(20)
  customer_country       String?        @db.VarChar(100)
}
```

### Current Financial Models
```sql
model Invoice {
  id                      String               @id @default(uuid())
  customer_id             String
  maintenance_job_id      String?              @unique
  maintenance_contract_id String?
  cleaning_job_id         String?              @unique
  cleaning_contract_id    String?              -- Note: Missing in current schema
  invoice_number          String               @unique @db.VarChar(50)
  invoice_date            DateTime             @db.Date
  due_date                DateTime             @db.Date
  line_items              Json
  subtotal                Decimal              @db.Decimal(10, 2)
  tax_percentage          Decimal              @default(20) @db.Decimal(5, 2)
  tax_amount              Decimal              @db.Decimal(10, 2)
  total                   Decimal              @db.Decimal(10, 2)
  status                  InvoiceStatus        @default(PENDING)
  payment_method          String?              @db.VarChar(50)
  paid_at                 DateTime?
  payment_reference       String?              @db.VarChar(100)
  notes                   String?
}

model Quote {
  id                  String           @id @default(uuid())
  customer_id         String
  maintenance_job_id  String?
  quote_number        String           @unique @db.VarChar(50)
  quote_date          DateTime         @db.Date
  valid_until_date    DateTime         @db.Date
  line_items          Json
  subtotal            Decimal          @db.Decimal(10, 2)
  discount_percentage Decimal          @default(0) @db.Decimal(5, 2)
  discount_amount     Decimal          @default(0) @db.Decimal(10, 2)
  total               Decimal          @db.Decimal(10, 2)
  status              QuoteStatus      @default(DRAFT)
  customer_response   String?
  approved_at         DateTime?
  approved_by         String?          @db.VarChar(100)
}
```

### Key Findings
1. **Already Separated**: Cleaning and maintenance contracts are already in separate tables
2. **Missing Invoice Links**: Invoices don't properly link to cleaning contracts (missing `cleaning_contract_id`)
3. **Shared Financial Models**: Invoice and Quote models are shared but have service-specific fields
4. **Service Provider Integration**: Both use service_provider_id for multi-tenancy
5. **Contract Types**: Uses shared ContractType enum which may need service-specific values

## Enhanced Contract Management Strategy

### Service-Specific Contract Enhancement

#### Cleaning Service Database - Enhanced Contracts
```sql
CREATE TABLE IF NOT EXISTS cleaning_service_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR(50) UNIQUE,
  tenant_id UUID NOT NULL,
  customer_profile_id UUID NOT NULL, -- Links to shared customer profiles

  -- Contract identification
  contract_name VARCHAR(100) NOT NULL,
  contract_level VARCHAR(20) DEFAULT 'STANDARD' CHECK (contract_level IN ('BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE')),

  -- Service specifications
  service_type VARCHAR(30) NOT NULL CHECK (service_type IN (
    'RESIDENTIAL_CLEANING', 'COMMERCIAL_CLEANING', 'DEEP_CLEANING',
    'POST_CONSTRUCTION', 'CARPET_CLEANING', 'WINDOW_CLEANING', 'SPECIALIZED'
  )),
  cleaning_frequency VARCHAR(20) DEFAULT 'WEEKLY' CHECK (cleaning_frequency IN (
    'DAILY', 'TWICE_WEEKLY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ONE_TIME'
  )),
  service_hours VARCHAR(50), -- e.g., "9:00-17:00 Monday-Friday"

  -- Pricing and billing
  pricing_model VARCHAR(20) DEFAULT 'FLAT_MONTHLY' CHECK (pricing_model IN (
    'FLAT_MONTHLY', 'PER_VISIT', 'PER_HOUR', 'PER_SQUARE_FOOT', 'CUSTOM'
  )),
  base_rate DECIMAL(10,2),
  rate_unit VARCHAR(20) DEFAULT 'MONTH', -- MONTH, VISIT, HOUR, SQFT
  additional_services JSONB DEFAULT '[]', -- Array of additional service objects
  minimum_contract_months INTEGER DEFAULT 12,
  auto_renewal BOOLEAN DEFAULT true,

  -- Service scope
  included_rooms TEXT[] DEFAULT '{}',
  excluded_areas TEXT[] DEFAULT '{}',
  square_footage INTEGER,
  special_requirements TEXT[], -- e.g., ['PETS', 'CHILDREN', 'ELDERLY', 'MEDICAL_FACILITY']
  cleaning_supplies_included BOOLEAN DEFAULT true,
  equipment_provided BOOLEAN DEFAULT false,

  -- Quality expectations
  quality_standards JSONB DEFAULT '{}', -- Service level agreements
  inspection_frequency VARCHAR(20) DEFAULT 'WEEKLY' CHECK (inspection_frequency IN (
    'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'AS_NEEDED'
  )),
  customer_satisfaction_target DECIMAL(3,2) DEFAULT 4.5,

  -- Contract terms
  contract_start_date DATE NOT NULL,
  contract_end_date DATE,
  billing_day_of_month INTEGER DEFAULT 1, -- 1-31
  payment_terms VARCHAR(30) DEFAULT 'NET_30' CHECK (payment_terms IN (
    'NET_15', 'NET_30', 'NET_45', 'NET_60', 'UPON_RECEIPT'
  )),
  cancellation_notice_days INTEGER DEFAULT 30,

  -- Status and tracking
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED', 'CANCELLED'
  )),
  signed_date DATE,
  signed_by VARCHAR(100),
  activation_date DATE,

  -- Compliance and legal
  insurance_required BOOLEAN DEFAULT true,
  insurance_coverage_amount DECIMAL(12,2),
  bonding_required BOOLEAN DEFAULT false,
  background_checks_required BOOLEAN DEFAULT false,

  -- Metadata
  notes TEXT,
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  CONSTRAINT fk_cleaning_contracts_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
  CONSTRAINT fk_cleaning_contracts_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
  CONSTRAINT fk_cleaning_contracts_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

  INDEX idx_cleaning_contracts_tenant (tenant_id),
  INDEX idx_cleaning_contracts_customer (customer_profile_id),
  INDEX idx_cleaning_contracts_status (status),
  INDEX idx_cleaning_contracts_service_type (service_type),
  INDEX idx_cleaning_contracts_start_date (contract_start_date)
);
```

#### Maintenance Service Database - Enhanced Contracts
```sql
CREATE TABLE IF NOT EXISTS maintenance_service_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR(50) UNIQUE,
  tenant_id UUID NOT NULL,
  customer_profile_id UUID NOT NULL, -- Links to shared customer profiles

  -- Contract identification
  contract_name VARCHAR(100) NOT NULL,
  contract_level VARCHAR(20) DEFAULT 'STANDARD' CHECK (contract_level IN ('BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE')),

  -- Service specifications
  service_coverage VARCHAR(30) NOT NULL CHECK (service_coverage IN (
    'FULL_MAINTENANCE', 'HVAC_ONLY', 'PLUMBING_ONLY', 'ELECTRICAL_ONLY',
    'APPLIANCE_ONLY', 'EXTERIOR_ONLY', 'PREVENTIVE_ONLY', 'EMERGENCY_ONLY', 'CUSTOM'
  )),
  response_time_hours INTEGER DEFAULT 24, -- Emergency response SLA
  service_hours VARCHAR(50), -- e.g., "24/7 Emergency, 8-5 Weekdays"

  -- Pricing and billing
  pricing_model VARCHAR(20) DEFAULT 'FLAT_MONTHLY' CHECK (pricing_model IN (
    'FLAT_MONTHLY', 'PER_SERVICE', 'PER_HOUR', 'PER_SQUARE_FOOT', 'RETAINER', 'CUSTOM'
  )),
  base_rate DECIMAL(10,2),
  emergency_response_fee DECIMAL(10,2) DEFAULT 0.00,
  after_hours_premium DECIMAL(3,2) DEFAULT 1.5, -- Multiplier for after-hours work
  parts_markup_percentage DECIMAL(5,2) DEFAULT 20.00,
  labor_rate_per_hour DECIMAL(8,2),
  minimum_contract_months INTEGER DEFAULT 12,
  auto_renewal BOOLEAN DEFAULT true,

  -- Service scope
  included_trades TEXT[] DEFAULT '{}', -- e.g., ['PLUMBING', 'ELECTRICAL', 'HVAC']
  excluded_services TEXT[] DEFAULT '{}',
  property_size VARCHAR(20), -- e.g., 'SMALL', 'MEDIUM', 'LARGE', 'XL'
  number_of_units INTEGER DEFAULT 1,
  special_equipment TEXT[], -- e.g., ['ELEVATOR', 'BOILER', 'GENERATOR']

  -- Service level agreements
  preventive_maintenance_schedule JSONB DEFAULT '{}', -- PM schedule for different systems
  emergency_coverage BOOLEAN DEFAULT true,
  priority_support BOOLEAN DEFAULT false,
  dedicated_technician BOOLEAN DEFAULT false,
  response_time_sla JSONB DEFAULT '{}', -- SLAs for different priority levels

  -- Contract terms
  contract_start_date DATE NOT NULL,
  contract_end_date DATE,
  billing_day_of_month INTEGER DEFAULT 1,
  payment_terms VARCHAR(30) DEFAULT 'NET_30',
  cancellation_notice_days INTEGER DEFAULT 60,

  -- Status and tracking
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED', 'CANCELLED'
  )),
  signed_date DATE,
  signed_by VARCHAR(100),
  activation_date DATE,

  -- Compliance and legal
  licenses_required TEXT[] DEFAULT '{}',
  insurance_required BOOLEAN DEFAULT true,
  insurance_coverage_amount DECIMAL(12,2),
  permits_included BOOLEAN DEFAULT false,

  -- Performance metrics
  performance_targets JSONB DEFAULT '{}', -- KPIs and targets
  reporting_frequency VARCHAR(20) DEFAULT 'MONTHLY',
  customer_portal_access BOOLEAN DEFAULT false,

  -- Metadata
  notes TEXT,
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  CONSTRAINT fk_maintenance_contracts_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
  CONSTRAINT fk_maintenance_contracts_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
  CONSTRAINT fk_maintenance_contracts_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

  INDEX idx_maintenance_contracts_tenant (tenant_id),
  INDEX idx_maintenance_contracts_customer (customer_profile_id),
  INDEX idx_maintenance_contracts_status (status),
  INDEX idx_maintenance_contracts_coverage (service_coverage),
  INDEX idx_maintenance_contracts_start_date (contract_start_date)
);
```

## Separated Financial Management

### Cleaning Service Financial Tables
```sql
-- Cleaning service invoices
CREATE TABLE IF NOT EXISTS cleaning_service_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  tenant_id UUID NOT NULL,
  customer_profile_id UUID NOT NULL,
  cleaning_contract_id UUID,
  cleaning_job_id UUID,

  -- Invoice details
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  period_start DATE, -- For contract-based billing
  period_end DATE,   -- For contract-based billing

  -- Line items and pricing
  line_items JSONB DEFAULT '[]', -- Array of line item objects
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_amount DECIMAL(12,2) DEFAULT 0.00,
  discount_amount DECIMAL(12,2) DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL,

  -- Status and payments
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'VOID'
  )),
  payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN (
    'UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'DISPUTED'
  )),
  payment_method VARCHAR(50),
  paid_date DATE,
  paid_amount DECIMAL(12,2) DEFAULT 0.00,
  payment_reference VARCHAR(100),

  -- Reminders and collections
  reminder_count INTEGER DEFAULT 0,
  last_reminder_sent DATE,
  collection_status VARCHAR(20) DEFAULT 'CURRENT' CHECK (collection_status IN (
    'CURRENT', 'DUE_SOON', 'OVERDUE', 'COLLECTIONS', 'WRITE_OFF'
  )),

  -- Metadata
  notes TEXT,
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  CONSTRAINT fk_cleaning_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
  CONSTRAINT fk_cleaning_invoices_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
  CONSTRAINT fk_cleaning_invoices_contract FOREIGN KEY (cleaning_contract_id) REFERENCES cleaning_service_contracts(id),
  CONSTRAINT fk_cleaning_invoices_job FOREIGN KEY (cleaning_job_id) REFERENCES cleaning_db.cleaning_jobs(id),
  CONSTRAINT fk_cleaning_invoices_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

  INDEX idx_cleaning_invoices_tenant (tenant_id),
  INDEX idx_cleaning_invoices_customer (customer_profile_id),
  INDEX idx_cleaning_invoices_status (status),
  INDEX idx_cleaning_invoices_due_date (due_date),
  INDEX idx_cleaning_invoices_amount (total_amount)
);

-- Cleaning service quotes
CREATE TABLE IF NOT EXISTS cleaning_service_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  tenant_id UUID NOT NULL,
  customer_profile_id UUID NOT NULL,
  cleaning_job_id UUID,

  -- Quote details
  quote_date DATE NOT NULL,
  valid_until_date DATE NOT NULL,
  quote_title VARCHAR(200) NOT NULL,
  description TEXT,

  -- Line items and pricing
  line_items JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_amount DECIMAL(12,2) DEFAULT 0.00,
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  discount_amount DECIMAL(12,2) DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL,

  -- Status and response
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'DECLINED', 'EXPIRED', 'CONVERTED'
  )),
  customer_response TEXT,
  approved_date DATE,
  approved_by VARCHAR(100),
  converted_to_contract BOOLEAN DEFAULT false,
  converted_to_invoice BOOLEAN DEFAULT false,

  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,

  -- Metadata
  notes TEXT,
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  CONSTRAINT fk_cleaning_quotes_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
  CONSTRAINT fk_cleaning_quotes_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
  CONSTRAINT fk_cleaning_quotes_job FOREIGN KEY (cleaning_job_id) REFERENCES cleaning_db.cleaning_jobs(id),
  CONSTRAINT fk_cleaning_quotes_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

  INDEX idx_cleaning_quotes_tenant (tenant_id),
  INDEX idx_cleaning_quotes_customer (customer_profile_id),
  INDEX idx_cleaning_quotes_status (status),
  INDEX idx_cleaning_quotes_valid_date (valid_until_date)
);
```

### Maintenance Service Financial Tables
```sql
-- Maintenance service invoices
CREATE TABLE IF NOT EXISTS maintenance_service_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  tenant_id UUID NOT NULL,
  customer_profile_id UUID NOT NULL,
  maintenance_contract_id UUID,
  maintenance_work_order_id UUID,

  -- Invoice details
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,

  -- Line items and pricing
  line_items JSONB DEFAULT '[]',
  labor_subtotal DECIMAL(12,2) DEFAULT 0.00,
  parts_subtotal DECIMAL(12,2) DEFAULT 0.00,
  other_charges DECIMAL(12,2) DEFAULT 0.00,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_amount DECIMAL(12,2) DEFAULT 0.00,
  discount_amount DECIMAL(12,2) DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL,

  -- Cost breakdown for analysis
  total_labor_cost DECIMAL(12,2) DEFAULT 0.00,
  total_parts_cost DECIMAL(12,2) DEFAULT 0.00,
  profit_margin DECIMAL(5,2),

  -- Status and payments
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'VOID'
  )),
  payment_status VARCHAR(20) DEFAULT 'UNPAID',
  payment_method VARCHAR(50),
  paid_date DATE,
  paid_amount DECIMAL(12,2) DEFAULT 0.00,
  payment_reference VARCHAR(100),

  -- Warranty and maintenance tracking
  warranty_included BOOLEAN DEFAULT false,
  warranty_period_days INTEGER DEFAULT 30,
  warranty_start_date DATE,
  warranty_end_date DATE,

  -- Collections
  reminder_count INTEGER DEFAULT 0,
  last_reminder_sent DATE,
  collection_status VARCHAR(20) DEFAULT 'CURRENT',

  -- Metadata
  notes TEXT,
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  CONSTRAINT fk_maintenance_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
  CONSTRAINT fk_maintenance_invoices_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
  CONSTRAINT fk_maintenance_invoices_contract FOREIGN KEY (maintenance_contract_id) REFERENCES maintenance_service_contracts(id),
  CONSTRAINT fk_maintenance_invoices_work_order FOREIGN KEY (maintenance_work_order_id) REFERENCES maintenance_db.maintenance_work_orders(id),
  CONSTRAINT fk_maintenance_invoices_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

  INDEX idx_maintenance_invoices_tenant (tenant_id),
  INDEX idx_maintenance_invoices_customer (customer_profile_id),
  INDEX idx_maintenance_invoices_status (status),
  INDEX idx_maintenance_invoices_due_date (due_date),
  INDEX idx_maintenance_invoices_warranty (warranty_end_date)
);

-- Maintenance service quotes
CREATE TABLE IF NOT EXISTS maintenance_service_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  tenant_id UUID NOT NULL,
  customer_profile_id UUID NOT NULL,
  maintenance_work_order_id UUID,

  -- Quote details
  quote_date DATE NOT NULL,
  valid_until_date DATE NOT NULL,
  quote_title VARCHAR(200) NOT NULL,
  description TEXT,

  -- Labor and parts breakdown
  labor_line_items JSONB DEFAULT '[]',
  parts_line_items JSONB DEFAULT '[]',
  other_charges JSONB DEFAULT '[]',
  labor_subtotal DECIMAL(12,2) DEFAULT 0.00,
  parts_subtotal DECIMAL(12,2) DEFAULT 0.00,
  other_subtotal DECIMAL(12,2) DEFAULT 0.00,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_amount DECIMAL(12,2) DEFAULT 0.00,
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  discount_amount DECIMAL(12,2) DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL,

  -- Cost estimates for analysis
  estimated_labor_hours DECIMAL(6,2),
  estimated_parts_cost DECIMAL(12,2) DEFAULT 0.00,
  emergency_premium_applied BOOLEAN DEFAULT false,

  -- Status and response
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'DECLINED', 'EXPIRED', 'CONVERTED'
  )),
  customer_response TEXT,
  approved_date DATE,
  approved_by VARCHAR(100),
  converted_to_work_order BOOLEAN DEFAULT false,
  converted_to_invoice BOOLEAN DEFAULT false,

  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,

  -- Metadata
  notes TEXT,
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  CONSTRAINT fk_maintenance_quotes_tenant FOREIGN KEY (tenant_id) REFERENCES shared_auth_db.tenants(id),
  CONSTRAINT fk_maintenance_quotes_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
  CONSTRAINT fk_maintenance_quotes_work_order FOREIGN KEY (maintenance_work_order_id) REFERENCES maintenance_db.maintenance_work_orders(id),
  CONSTRAINT fk_maintenance_quotes_user FOREIGN KEY (created_by_user_id) REFERENCES shared_auth_db.users(id),

  INDEX idx_maintenance_quotes_tenant (tenant_id),
  INDEX idx_maintenance_quotes_customer (customer_profile_id),
  INDEX idx_maintenance_quotes_status (status),
  INDEX idx_maintenance_quotes_valid_date (valid_until_date)
);
```

## Cross-Service Financial Coordination

### Unified Customer Billing
```sql
-- Cross-service customer billing coordination
CREATE TABLE IF NOT EXISTS cross_service_billing_coordination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_profile_id UUID NOT NULL,
  billing_cycle_start DATE NOT NULL,
  billing_cycle_end DATE NOT NULL,

  -- Service breakdown
  cleaning_contract_count INTEGER DEFAULT 0,
  maintenance_contract_count INTEGER DEFAULT 0,
  cleaning_job_count INTEGER DEFAULT 0,
  maintenance_work_order_count INTEGER DEFAULT 0,

  -- Financial summary
  cleaning_total DECIMAL(12,2) DEFAULT 0.00,
  maintenance_total DECIMAL(12,2) DEFAULT 0.00,
  combined_total DECIMAL(12,2) DEFAULT 0.00,

  -- Invoice coordination
  consolidated_invoice BOOLEAN DEFAULT false,
  consolidated_invoice_number VARCHAR(50),
  separate_invoices BOOLEAN DEFAULT true,
  payment_synchronization BOOLEAN DEFAULT false,

  -- Status
  billing_status VARCHAR(20) DEFAULT 'PENDING' CHECK (billing_status IN (
    'PENDING', 'PROCESSING', 'INVOICED', 'PAID', 'OVERDUE', 'DISPUTED'
  )),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_cross_service_billing_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),

  INDEX idx_cross_service_billing_customer (customer_profile_id),
  INDEX idx_cross_service_billing_cycle (billing_cycle_start, billing_cycle_end),
  INDEX idx_cross_service_billing_status (billing_status)
);
```

### Contract and Quote Linking System
```sql
-- Shared contract references for dual-service customers
CREATE TABLE IF NOT EXISTS dual_service_contract_linking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_profile_id UUID NOT NULL,
  primary_service VARCHAR(20) NOT NULL CHECK (primary_service IN ('CLEANING', 'MAINTENANCE')),
  cleaning_contract_id UUID,
  maintenance_contract_id UUID,

  -- Relationship details
  relationship_type VARCHAR(20) DEFAULT 'INDEPENDENT' CHECK (relationship_type IN (
    'INDEPENDENT', 'BUNDLED', 'SEQUENTIAL', 'COORDINATED'
  )),
  coordination_notes TEXT,

  -- Pricing coordination
  bundled_pricing BOOLEAN DEFAULT false,
  discount_applied DECIMAL(5,2) DEFAULT 0.00,
  billing_coordination BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_dual_service_linking_customer FOREIGN KEY (customer_profile_id) REFERENCES shared_auth_db.customer_profiles(id),
  CONSTRAINT fk_dual_service_linking_cleaning FOREIGN KEY (cleaning_contract_id) REFERENCES cleaning_service_contracts(id),
  CONSTRAINT fk_dual_service_linking_maintenance FOREIGN KEY (maintenance_contract_id) REFERENCES maintenance_service_contracts(id),

  INDEX idx_dual_service_linking_customer (customer_profile_id),
  INDEX idx_dual_service_linking_type (relationship_type)
);
```

## Contract Lifecycle Management

### Automated Contract Workflows
```sql
-- Contract lifecycle events and automation
CREATE TABLE IF NOT EXISTS contract_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_type VARCHAR(20) NOT NULL, -- 'CLEANING' or 'MAINTENANCE'
  contract_id UUID NOT NULL,
  event_type VARCHAR(30) NOT NULL,
  event_description TEXT,

  -- Event timing
  scheduled_date DATE,
  actual_date DATE,
  event_status VARCHAR(20) DEFAULT 'PENDING' CHECK (event_status IN (
    'PENDING', 'COMPLETED', 'SKIPPED', 'FAILED'
  )),

  -- Automated actions
  action_required VARCHAR(50),
  action_status VARCHAR(20) DEFAULT 'NOT_STARTED' CHECK (action_status IN (
    'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
  )),
  automated BOOLEAN DEFAULT false,
  executed_date DATE,

  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_recipients TEXT[],
  notification_method VARCHAR(20), -- 'EMAIL', 'SMS', 'PORTAL', 'MAIL'

  -- Metadata
  created_by_user_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_contract_lifecycle_contract (contract_type, contract_id),
  INDEX idx_contract_lifecycle_scheduled (scheduled_date),
  INDEX idx_contract_lifecycle_status (event_status)
);

-- Contract renewal management
CREATE TABLE IF NOT EXISTS contract_renewal_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_type VARCHAR(20) NOT NULL,
  contract_id UUID NOT NULL,
  current_end_date DATE NOT NULL,

  -- Renewal terms
  renewal_option VARCHAR(20) DEFAULT 'AUTO_RENEW' CHECK (renewal_option IN (
    'AUTO_RENEW', 'MANUAL_RENEW', 'NO_RENEW', 'REVIEW_REQUIRED'
  )),
  renewal_terms JSONB, -- New terms for renewal
  pricing_adjustment DECIMAL(5,2) DEFAULT 0.00, -- Percentage adjustment

  -- Renewal timeline
  renewal_notice_days INTEGER DEFAULT 60,
  renewal_start_date DATE, -- When renewal process should begin
  decision_deadline DATE,

  -- Status tracking
  renewal_status VARCHAR(20) DEFAULT 'PENDING' CHECK (renewal_status IN (
    'PENDING', 'UNDER_REVIEW', 'APPROVED', 'DECLINED', 'CONVERTED', 'EXPIRED'
  )),
  customer_response TEXT,
  final_decision_date DATE,

  -- Financial impact
  current_monthly_rate DECIMAL(10,2),
  proposed_monthly_rate DECIMAL(10,2),
  renewal_value_change DECIMAL(12,2),

  -- Metadata
  assigned_to_user_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_contract_renewal_contract (contract_type, contract_id),
  INDEX idx_contract_renewal_deadline (decision_deadline),
  INDEX idx_contract_renewal_status (renewal_status)
);
```

## Benefits

### For Cleaning Service
- Service-specific contract management with cleaning-focused terms
- Flexible pricing models (per visit, hourly, square footage)
- Quality standards and inspection tracking
- Specialized service level agreements for cleaning operations

### For Maintenance Service
- Trade-specific contracts with technical service coverage
- Emergency response SLAs and priority support
- Parts and labor cost tracking for profitability analysis
- Warranty management and preventive maintenance scheduling

### For Cross-Service Coordination
- Unified billing for dual-service customers
- Contract bundling and coordination options
- Shared customer financial history across services
- Consolidated reporting and analytics

## Risk Mitigation

### Financial Integrity
- Separated financial tables with service-specific validation
- Cross-service reconciliation processes
- Audit trails for all financial transactions
- Automated revenue recognition and tax calculations

### Contract Compliance
- Service-specific compliance requirements tracking
- Automated renewal and expiration management
- Legal document storage and versioning
- Digital signature integration

### Data Consistency
- Shared customer profile references
- Cross-service contract linking
- Unified billing coordination
- Comprehensive audit logging

## Next Steps

1. **Execute Contract Migration**: Migrate existing contracts to enhanced schemas
2. **Implement Billing Automation**: Set up automated invoice generation and payment processing
3. **Build Contract Management UI**: Develop user-friendly contract and billing interfaces
4. **Integrate Payment Gateways**: Connect to payment processing services
5. **Set Up Reporting**: Create financial and contract performance analytics