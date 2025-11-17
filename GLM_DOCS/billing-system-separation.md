# Billing System Separation and Automation

## Overview
This document outlines the comprehensive billing system separation for cleaning and maintenance services, including automated invoicing, payment processing, revenue recognition, and cross-service billing coordination.

## Billing Architecture

### Service-Specific Billing Systems

#### Cleaning Service Billing Features
```typescript
interface CleaningBillingConfig {
  serviceType: 'CLEANING'
  pricingModels: Array<
    'FLAT_MONTHLY' | 'PER_VISIT' | 'PER_HOUR' | 'PER_SQUARE_FOOT' | 'CUSTOM'
  >
  billingCycles: Array<'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'QUARTERLY'>
  taxConfiguration: TaxConfig
  paymentMethods: PaymentMethod[]
  lateFeeRules: LateFeeRule[]
  discountRules: DiscountRule[]
}

interface CleaningInvoiceData {
  contractId?: string
  jobId?: string
  billingPeriod: {
    startDate: Date
    endDate: Date
  }
  lineItems: CleaningInvoiceLineItem[]
  appliedDiscounts: DiscountApplication[]
  taxCalculations: TaxCalculation
  totalAmount: number
  dueDate: Date
}

interface CleaningInvoiceLineItem {
  itemType: 'SERVICE' | 'SUPPLIES' | 'EQUIPMENT' | 'ADDITIONAL_SERVICE'
  description: string
  quantity: number
  unitRate: number
  unit: 'VISIT' | 'HOUR' | 'SQFT' | 'MONTH'
  amount: number
  taxable: boolean
}
```

#### Maintenance Service Billing Features
```typescript
interface MaintenanceBillingConfig {
  serviceType: 'MAINTENANCE'
  pricingModels: Array<
    'FLAT_MONTHLY' | 'PER_SERVICE' | 'PER_HOUR' | 'RETAINER' | 'CUSTOM'
  >
  billingCycles: Array<'MONTHLY' | 'QUARTERLY' | 'PER_COMPLETION'>
  taxConfiguration: TaxConfig
  paymentMethods: PaymentMethod[]
  laborRates: LaborRateConfig
  partsMarkup: PartsMarkupConfig
  emergencyRates: EmergencyRateConfig
}

interface MaintenanceInvoiceData {
  contractId?: string
  workOrderId?: string
  billingPeriod?: {
    startDate: Date
    endDate: Date
  }
  lineItems: MaintenanceInvoiceLineItem[]
  costBreakdown: CostBreakdown
  taxCalculations: TaxCalculation
  totalAmount: number
  dueDate: Date
  warrantyInfo?: WarrantyInfo
}

interface MaintenanceInvoiceLineItem {
  itemType: 'LABOR' | 'PARTS' | 'EQUIPMENT' | 'PERMIT' | 'EMERGENCY_FEE' | 'OTHER'
  description: string
  quantity: number
  unitRate: number
  unit: 'HOUR' | 'PIECE' | 'VISIT' | 'FLAT_RATE'
  amount: number
  taxable: boolean
  costToCompany: number // For profitability tracking
}
```

## Automated Invoicing System

### Cleaning Service Invoicing
```sql
-- Automated cleaning service invoice generation
CREATE OR REPLACE FUNCTION generate_cleaning_service_invoices(
    billing_date DATE DEFAULT CURRENT_DATE,
    tenant_id UUID DEFAULT NULL
) RETURNS TABLE(
    invoice_generated BOOLEAN,
    invoice_id UUID,
    customer_id UUID,
    contract_id UUID,
    invoice_amount DECIMAL,
    error_message TEXT
) AS $$
DECLARE
    billing_cycle_start DATE;
    billing_cycle_end DATE;
    invoice_record RECORD;
BEGIN
    -- Calculate billing cycle
    billing_cycle_start := billing_date - INTERVAL '1 month' + INTERVAL '1 day';
    billing_cycle_end := billing_date;

    -- Generate invoices for cleaning contracts
    FOR invoice_record IN
        SELECT
            csc.id as contract_id,
            csc.customer_profile_id,
            csc.tenant_id,
            csc.billing_day_of_month,
            csc.pricing_model,
            csc.base_rate,
            csc.service_type,
            csc.cleaning_frequency,
            csc.square_footage,
            p.first_name,
            p.last_name,
            p.email,
            p.phone
        FROM cleaning_db.cleaning_service_contracts csc
        JOIN shared_auth_db.customer_profiles p ON csc.customer_profile_id = p.id
        WHERE csc.status = 'ACTIVE'
        AND csc.deleted_at IS NULL
        AND (tenant_id IS NULL OR csc.tenant_id = tenant_id)
        AND (
            -- Monthly billing on specific day
            (EXTRACT(DAY FROM billing_date) = csc.billing_day_of_month)
            OR
            -- End of month billing
            (csc.billing_day_of_month > 28 AND billing_date = (billing_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE)
        )
    LOOP
        BEGIN
            -- Calculate invoice amount based on pricing model
            DECLARE
                invoice_amount DECIMAL(12,2);
                line_items JSONB;
                invoice_description TEXT;
            BEGIN
                CASE invoice_record.pricing_model
                    WHEN 'FLAT_MONTHLY' THEN
                        invoice_amount := invoice_record.base_rate;
                        line_items := jsonb_build_array(
                            jsonb_build_object(
                                'itemType', 'SERVICE',
                                'description', 'Monthly cleaning service - ' || invoice_record.cleaning_frequency,
                                'quantity', 1,
                                'unitRate', invoice_record.base_rate,
                                'unit', 'MONTH',
                                'amount', invoice_record.base_rate,
                                'taxable', true
                            )
                        );
                        invoice_description := 'Monthly cleaning service (' || invoice_record.cleaning_frequency || ')';

                    WHEN 'PER_SQUARE_FOOT' THEN
                        invoice_amount := invoice_record.base_rate * invoice_record.square_footage;
                        line_items := jsonb_build_array(
                            jsonb_build_object(
                                'itemType', 'SERVICE',
                                'description', 'Cleaning service per square foot',
                                'quantity', invoice_record.square_footage,
                                'unitRate', invoice_record.base_rate,
                                'unit', 'SQFT',
                                'amount', invoice_amount,
                                'taxable', true
                            )
                        );
                        invoice_description := 'Cleaning service (' || invoice_record.square_footage || ' sq ft)';

                    WHEN 'PER_VISIT' THEN
                        -- Calculate number of visits in billing period
                        DECLARE
                            visit_count INTEGER;
                        BEGIN
                            visit_count := calculate_visits_in_period(
                                invoice_record.cleaning_frequency,
                                billing_cycle_start,
                                billing_cycle_end
                            );
                            invoice_amount := invoice_record.base_rate * visit_count;
                            line_items := jsonb_build_array(
                                jsonb_build_object(
                                    'itemType', 'SERVICE',
                                    'description', 'Cleaning service - ' || visit_count || ' visits',
                                    'quantity', visit_count,
                                    'unitRate', invoice_record.base_rate,
                                    'unit', 'VISIT',
                                    'amount', invoice_amount,
                                    'taxable', true
                                )
                            );
                            invoice_description := 'Cleaning service (' || visit_count || ' visits)';
                        END;

                    ELSE
                        invoice_amount := invoice_record.base_rate;
                        line_items := jsonb_build_array(
                            jsonb_build_object(
                                'itemType', 'SERVICE',
                                'description', 'Custom cleaning service',
                                'quantity', 1,
                                'unitRate', invoice_record.base_rate,
                                'unit', 'MONTH',
                                'amount', invoice_amount,
                                'taxable', true
                            )
                        );
                        invoice_description := 'Custom cleaning service';
                END CASE;

                -- Generate invoice number
                DECLARE
                    invoice_number VARCHAR;
                    new_invoice_id UUID;
                BEGIN
                    SELECT 'CLN-' || TO_CHAR(billing_date, 'YYYYMM') || '-' ||
                           LPAD(NEXTVAL('cleaning_invoice_seq')::TEXT, 4, '0')
                    INTO invoice_number;

                    -- Insert invoice
                    INSERT INTO cleaning_db.cleaning_service_invoices (
                        invoice_number, tenant_id, customer_profile_id, cleaning_contract_id,
                        invoice_date, due_date, period_start, period_end, line_items,
                        subtotal, tax_rate, tax_amount, total_amount, status,
                        created_by_user_id
                    ) VALUES (
                        invoice_number,
                        invoice_record.tenant_id,
                        invoice_record.customer_profile_id,
                        invoice_record.contract_id,
                        billing_date,
                        billing_date + INTERVAL '30 days',
                        billing_cycle_start,
                        billing_cycle_end,
                        line_items,
                        invoice_amount,
                        0.00, -- Tax rate will be calculated based on location
                        0.00, -- Tax amount will be calculated
                        invoice_amount,
                        'DRAFT',
                        'SYSTEM_BILLING'
                    ) RETURNING id INTO new_invoice_id;

                -- Return success
                RETURN QUERY SELECT true, new_invoice_id, invoice_record.customer_profile_id,
                                   invoice_record.contract_id, invoice_amount, NULL::TEXT;

                EXCEPTION WHEN OTHERS THEN
                    RETURN QUERY SELECT false, NULL::UUID, invoice_record.customer_profile_id,
                                       invoice_record.contract_id, 0.00, SQLERRM;
                END;
            END;

        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT false, NULL::UUID, invoice_record.customer_profile_id,
                               invoice_record.contract_id, 0.00, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Helper function to calculate visits in billing period
CREATE OR REPLACE FUNCTION calculate_visits_in_period(
    frequency VARCHAR,
    period_start DATE,
    period_end DATE
) RETURNS INTEGER AS $$
DECLARE
    days_in_period INTEGER;
    visit_count INTEGER;
BEGIN
    days_in_period := period_end - period_start;

    CASE frequency
        WHEN 'DAILY' THEN
            visit_count := days_in_period;
        WHEN 'TWICE_WEEKLY' THEN
            visit_count := (days_in_period / 7) * 2;
        WHEN 'WEEKLY' THEN
            visit_count := days_in_period / 7;
        WHEN 'BI_WEEKLY' THEN
            visit_count := days_in_period / 14;
        WHEN 'MONTHLY' THEN
            visit_count := 1;
        WHEN 'QUARTERLY' THEN
            visit_count := CASE WHEN days_in_period >= 90 THEN 1 ELSE 0 END;
        ELSE
            visit_count := 1; -- Default for ONE_TIME or unknown
    END CASE;

    RETURN GREATEST(0, visit_count);
END;
$$ LANGUAGE plpgsql;
```

### Maintenance Service Invoicing
```sql
-- Automated maintenance service invoice generation
CREATE OR REPLACE FUNCTION generate_maintenance_service_invoices(
    billing_date DATE DEFAULT CURRENT_DATE,
    tenant_id UUID DEFAULT NULL
) RETURNS TABLE(
    invoice_generated BOOLEAN,
    invoice_id UUID,
    customer_id UUID,
    contract_id UUID,
    invoice_amount DECIMAL,
    error_message TEXT
) AS $$
DECLARE
    invoice_record RECORD;
BEGIN
    -- Generate invoices for maintenance contracts
    FOR invoice_record IN
        SELECT
            msc.id as contract_id,
            msc.customer_profile_id,
            msc.tenant_id,
            msc.billing_day_of_month,
            msc.pricing_model,
            msc.base_rate,
            msc.service_coverage,
            msc.labor_rate_per_hour,
            msc.parts_markup_percentage,
            p.first_name,
            p.last_name,
            p.email,
            p.phone
        FROM maintenance_db.maintenance_service_contracts msc
        JOIN shared_auth_db.customer_profiles p ON msc.customer_profile_id = p.id
        WHERE msc.status = 'ACTIVE'
        AND msc.deleted_at IS NULL
        AND (tenant_id IS NULL OR msc.tenant_id = tenant_id)
        AND (
            (EXTRACT(DAY FROM billing_date) = msc.billing_day_of_month)
            OR (msc.billing_day_of_month > 28 AND billing_date = (billing_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE)
        )
    LOOP
        BEGIN
            -- Calculate invoice amount based on pricing model
            DECLARE
                invoice_amount DECIMAL(12,2);
                labor_subtotal DECIMAL(12,2) := 0.00;
                parts_subtotal DECIMAL(12,2) := 0.00;
                other_charges DECIMAL(12,2) := 0.00;
                line_items JSONB;
                invoice_description TEXT;
                billing_period_start DATE := billing_date - INTERVAL '1 month' + INTERVAL '1 day';
                billing_period_end DATE := billing_date;
            BEGIN
                CASE invoice_record.pricing_model
                    WHEN 'FLAT_MONTHLY' THEN
                        invoice_amount := invoice_record.base_rate;
                        labor_subtotal := invoice_record.base_rate * 0.7; -- Assume 70% labor
                        parts_subtotal := invoice_record.base_rate * 0.2; -- Assume 20% parts
                        other_charges := invoice_record.base_rate * 0.1; -- Assume 10% other

                        line_items := jsonb_build_array(
                            jsonb_build_object(
                                'itemType', 'LABOR',
                                'description', 'Monthly maintenance service - labor component',
                                'quantity', 1,
                                'unitRate', labor_subtotal,
                                'unit', 'FLAT_RATE',
                                'amount', labor_subtotal,
                                'taxable', true,
                                'costToCompany', labor_subtotal * 0.6
                            ),
                            jsonb_build_object(
                                'itemType', 'PARTS',
                                'description', 'Monthly maintenance service - parts allowance',
                                'quantity', 1,
                                'unitRate', parts_subtotal,
                                'unit', 'FLAT_RATE',
                                'amount', parts_subtotal,
                                'taxable', true,
                                'costToCompany', parts_subtotal * 0.8
                            ),
                            jsonb_build_object(
                                'itemType', 'OTHER',
                                'description', 'Monthly maintenance service - other charges',
                                'quantity', 1,
                                'unitRate', other_charges,
                                'unit', 'FLAT_RATE',
                                'amount', other_charges,
                                'taxable', false,
                                'costToCompany', other_charges * 0.9
                            )
                        );
                        invoice_description := 'Monthly maintenance service (' || invoice_record.service_coverage || ')';

                    WHEN 'RETAINER' THEN
                        invoice_amount := invoice_record.base_rate;
                        labor_subtotal := invoice_record.base_rate;

                        line_items := jsonb_build_array(
                            jsonb_build_object(
                                'itemType', 'LABOR',
                                'description', 'Monthly retainer - priority service access',
                                'quantity', 1,
                                'unitRate', invoice_record.base_rate,
                                'unit', 'RETAINER',
                                'amount', invoice_amount,
                                'taxable', true,
                                'costToCompany', invoice_record.base_rate * 0.5
                            )
                        );
                        invoice_description := 'Monthly maintenance retainer';

                    ELSE
                        invoice_amount := invoice_record.base_rate;
                        labor_subtotal := invoice_amount;

                        line_items := jsonb_build_array(
                            jsonb_build_object(
                                'itemType', 'LABOR',
                                'description', 'Custom maintenance service',
                                'quantity', 1,
                                'unitRate', invoice_amount,
                                'unit', 'MONTH',
                                'amount', invoice_amount,
                                'taxable', true,
                                'costToCompany', invoice_amount * 0.6
                            )
                        );
                        invoice_description := 'Custom maintenance service';
                END CASE;

                -- Generate invoice number
                DECLARE
                    invoice_number VARCHAR;
                    new_invoice_id UUID;
                BEGIN
                    SELECT 'MTN-' || TO_CHAR(billing_date, 'YYYYMM') || '-' ||
                           LPAD(NEXTVAL('maintenance_invoice_seq')::TEXT, 4, '0')
                    INTO invoice_number;

                    -- Insert invoice
                    INSERT INTO maintenance_db.maintenance_service_invoices (
                        invoice_number, tenant_id, customer_profile_id, maintenance_contract_id,
                        invoice_date, due_date, period_start, period_end,
                        line_items, labor_subtotal, parts_subtotal, other_charges,
                        subtotal, tax_rate, tax_amount, total_amount,
                        total_labor_cost, total_parts_cost, profit_margin,
                        status, created_by_user_id
                    ) VALUES (
                        invoice_number,
                        invoice_record.tenant_id,
                        invoice_record.customer_profile_id,
                        invoice_record.contract_id,
                        billing_date,
                        billing_date + INTERVAL '30 days',
                        billing_period_start,
                        billing_period_end,
                        line_items,
                        labor_subtotal,
                        parts_subtotal,
                        other_charges,
                        invoice_amount,
                        0.00, -- Tax rate will be calculated
                        0.00, -- Tax amount will be calculated
                        invoice_amount,
                        labor_subtotal * 0.6, -- Estimated cost
                        parts_subtotal * 0.8, -- Estimated cost
                        CASE WHEN invoice_amount > 0 THEN ((invoice_amount - (labor_subtotal * 0.6 + parts_subtotal * 0.8)) / invoice_amount) * 100 ELSE 0 END,
                        'DRAFT',
                        'SYSTEM_BILLING'
                    ) RETURNING id INTO new_invoice_id;

                -- Return success
                RETURN QUERY SELECT true, new_invoice_id, invoice_record.customer_profile_id,
                                   invoice_record.contract_id, invoice_amount, NULL::TEXT;

                EXCEPTION WHEN OTHERS THEN
                    RETURN QUERY SELECT false, NULL::UUID, invoice_record.customer_profile_id,
                                       invoice_record.contract_id, 0.00, SQLERRM;
                END;
            END;

        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT false, NULL::UUID, invoice_record.customer_profile_id,
                               invoice_record.contract_id, 0.00, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## Cross-Service Billing Coordination

### Dual-Service Customer Billing
```sql
-- Consolidated billing for dual-service customers
CREATE OR REPLACE FUNCTION coordinate_cross_service_billing(
    billing_date DATE DEFAULT CURRENT_DATE,
    consolidation_option VARCHAR DEFAULT 'SEPARATE' -- 'SEPARATE', 'CONSOLIDATED', 'OPTIONAL'
) RETURNS TABLE(
    coordination_id UUID,
    customer_id UUID,
    billing_option VARCHAR,
    invoice_count INTEGER,
    total_amount DECIMAL,
    coordination_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH dual_service_customers AS (
        SELECT DISTINCT
            cscl.customer_profile_id,
            cscl.relationship_type,
            cscl.billing_coordination
        FROM dual_service_contract_linking cscl
        WHERE cscl.relationship_type IN ('BUNDLED', 'COORDINATED')
        AND cscl.billing_coordination = true
    ),
    customer_billing_summary AS (
        SELECT
            dsc.customer_profile_id,
            COUNT(DISTINCT csi.id) as cleaning_invoice_count,
            COALESCE(SUM(csi.total_amount), 0) as cleaning_total,
            COUNT(DISTINCT msi.id) as maintenance_invoice_count,
            COALESCE(SUM(msi.total_amount), 0) as maintenance_total,
            (COUNT(DISTINCT csi.id) + COUNT(DISTINCT msi.id)) as total_invoices,
            COALESCE(SUM(csi.total_amount), 0) + COALESCE(SUM(msi.total_amount), 0) as combined_total
        FROM dual_service_customers dsc
        LEFT JOIN cleaning_db.cleaning_service_invoices csi ON
            dsc.customer_profile_id = csi.customer_profile_id
            AND csi.invoice_date = billing_date
            AND csi.status IN ('DRAFT', 'SENT')
        LEFT JOIN maintenance_db.maintenance_service_invoices msi ON
            dsc.customer_profile_id = msi.customer_profile_id
            AND msi.invoice_date = billing_date
            AND msi.status IN ('DRAFT', 'SENT')
        GROUP BY dsc.customer_profile_id
    )
    INSERT INTO cross_service_billing_coordination (
        customer_profile_id, billing_cycle_start, billing_cycle_end,
        cleaning_contract_count, maintenance_contract_count,
        cleaning_job_count, maintenance_work_order_count,
        cleaning_total, maintenance_total, combined_total,
        consolidated_invoice, billing_status
    )
    SELECT
        cbs.customer_profile_id,
        billing_date - INTERVAL '1 month' + INTERVAL '1 day' as billing_cycle_start,
        billing_date as billing_cycle_end,
        (SELECT COUNT(*) FROM cleaning_db.cleaning_service_contracts
         WHERE customer_profile_id = cbs.customer_profile_id AND status = 'ACTIVE') as cleaning_contract_count,
        (SELECT COUNT(*) FROM maintenance_db.maintenance_service_contracts
         WHERE customer_profile_id = cbs.customer_profile_id AND status = 'ACTIVE') as maintenance_contract_count,
        (SELECT COUNT(*) FROM cleaning_db.cleaning_jobs
         WHERE customer_profile_id = cbs.customer_profile_id
         AND completed_at BETWEEN billing_date - INTERVAL '1 month' AND billing_date) as cleaning_job_count,
        (SELECT COUNT(*) FROM maintenance_db.maintenance_work_orders
         WHERE customer_profile_id = cbs.customer_profile_id
         AND completed_at BETWEEN billing_date - INTERVAL '1 month' AND billing_date) as maintenance_work_order_count,
        cbs.cleaning_total,
        cbs.maintenance_total,
        cbs.combined_total,
        CASE WHEN consolidation_option = 'CONSOLIDATED' THEN true ELSE false END as consolidated_invoice,
        'PROCESSING' as billing_status
    FROM customer_billing_summary cbs
    RETURNING id, customer_profile_id,
           CASE WHEN consolidation_option = 'CONSOLIDATED' THEN 'CONSOLIDATED' ELSE 'SEPARATE' END as billing_option,
           (cbs.cleaning_invoice_count + cbs.maintenance_invoice_count) as invoice_count,
           cbs.combined_total,
           'COORDINATED' as coordination_status;
END;
$$ LANGUAGE plpgsql;
```

## Payment Processing Integration

### Payment Gateway Integration
```sql
-- Payment processing tracking
CREATE TABLE IF NOT EXISTS payment_processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type VARCHAR(20) NOT NULL,
    invoice_id UUID NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    payment_method VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL, -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'
    gateway_response JSONB,
    error_message TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_payment_logs_service (service_type),
    INDEX idx_payment_logs_invoice (invoice_id),
    INDEX idx_payment_logs_status (status),
    INDEX idx_payment_logs_date (processed_at)
);

-- Automated payment processing function
CREATE OR REPLACE FUNCTION process_invoice_payments(
    service_type VARCHAR,
    payment_method_filter VARCHAR DEFAULT NULL -- NULL = all methods
) RETURNS TABLE(
    payment_processed BOOLEAN,
    invoice_id UUID,
    customer_id UUID,
    amount DECIMAL,
    status VARCHAR,
    error_message TEXT
) AS $$
DECLARE
    invoice_record RECORD;
BEGIN
    CASE service_type
        WHEN 'CLEANING' THEN
            FOR invoice_record IN
                SELECT
                    csi.id,
                    csi.customer_profile_id,
                    csi.total_amount,
                    csi.due_date,
                    csi.status,
                    csi.payment_status
                FROM cleaning_db.cleaning_service_invoices csi
                WHERE csi.status = 'SENT'
                AND csi.payment_status IN ('UNPAID', 'PARTIALLY_PAID')
                AND csi.due_date <= CURRENT_DATE
                AND (payment_method_filter IS NULL OR csi.payment_method = payment_method_filter)
                AND csi.deleted_at IS NULL
            LOOP
                -- Process payment through payment gateway
                -- This would integrate with actual payment providers like Stripe, PayPal, etc.
                BEGIN
                    INSERT INTO payment_processing_logs (
                        service_type, invoice_id, payment_gateway,
                        amount, status, created_at
                    ) VALUES (
                        'CLEANING', invoice_record.id, 'STRIPE',
                        invoice_record.total_amount, 'PENDING', CURRENT_TIMESTAMP
                    ) RETURNING id;

                    -- Simulate payment processing
                    UPDATE cleaning_db.cleaning_service_invoices
                    SET payment_status = 'PAID',
                        paid_date = CURRENT_DATE,
                        paid_amount = total_amount,
                        status = 'PAID'
                    WHERE id = invoice_record.id;

                    RETURN QUERY SELECT true, invoice_record.id, invoice_record.customer_profile_id,
                                       invoice_record.total_amount, 'COMPLETED', NULL::TEXT;

                EXCEPTION WHEN OTHERS THEN
                    RETURN QUERY SELECT false, invoice_record.id, invoice_record.customer_profile_id,
                                       invoice_record.total_amount, 'FAILED', SQLERRM;
                END;
            END LOOP;

        WHEN 'MAINTENANCE' THEN
            FOR invoice_record IN
                SELECT
                    msi.id,
                    msi.customer_profile_id,
                    msi.total_amount,
                    msi.due_date,
                    msi.status,
                    msi.payment_status
                FROM maintenance_db.maintenance_service_invoices msi
                WHERE msi.status = 'SENT'
                AND msi.payment_status IN ('UNPAID', 'PARTIALLY_PAID')
                AND msi.due_date <= CURRENT_DATE
                AND (payment_method_filter IS NULL OR msi.payment_method = payment_method_filter)
                AND msi.deleted_at IS NULL
            LOOP
                -- Process payment for maintenance invoices
                BEGIN
                    INSERT INTO payment_processing_logs (
                        service_type, invoice_id, payment_gateway,
                        amount, status, created_at
                    ) VALUES (
                        'MAINTENANCE', invoice_record.id, 'STRIPE',
                        invoice_record.total_amount, 'PENDING', CURRENT_TIMESTAMP
                    ) RETURNING id;

                    UPDATE maintenance_db.maintenance_service_invoices
                    SET payment_status = 'PAID',
                        paid_date = CURRENT_DATE,
                        paid_amount = total_amount,
                        status = 'PAID'
                    WHERE id = invoice_record.id;

                    RETURN QUERY SELECT true, invoice_record.id, invoice_record.customer_profile_id,
                                       invoice_record.total_amount, 'COMPLETED', NULL::TEXT;

                EXCEPTION WHEN OTHERS THEN
                    RETURN QUERY SELECT false, invoice_record.id, invoice_record.customer_profile_id,
                                       invoice_record.total_amount, 'FAILED', SQLERRM;
                END;
            END LOOP;
    END CASE;
END;
$$ LANGUAGE plpgsql;
```

## Revenue Recognition and Reporting

### Service-Specific Revenue Tracking
```sql
-- Revenue recognition by service type
CREATE MATERIALIZED VIEW IF NOT EXISTS service_revenue_recognition AS
WITH cleaning_revenue AS (
    SELECT
        'CLEANING' as service_type,
        DATE_TRUNC('month', paid_date) as revenue_month,
        COUNT(*) as paid_invoices,
        SUM(total_amount) as total_revenue,
        SUM(total_amount - (total_amount * 0.6)) as gross_profit, -- Assume 40% margin
        AVG(total_amount) as avg_invoice_amount,
        COUNT(DISTINCT customer_profile_id) as active_customers
    FROM cleaning_db.cleaning_service_invoices
    WHERE payment_status = 'PAID'
    AND paid_date IS NOT NULL
    GROUP BY DATE_TRUNC('month', paid_date)
),
maintenance_revenue AS (
    SELECT
        'MAINTENANCE' as service_type,
        DATE_TRUNC('month', paid_date) as revenue_month,
        COUNT(*) as paid_invoices,
        SUM(total_amount) as total_revenue,
        SUM(total_amount - total_labor_cost - total_parts_cost) as gross_profit,
        AVG(total_amount) as avg_invoice_amount,
        COUNT(DISTINCT customer_profile_id) as active_customers
    FROM maintenance_db.maintenance_service_invoices
    WHERE payment_status = 'PAID'
    AND paid_date IS NOT NULL
    GROUP BY DATE_TRUNC('month', paid_date)
)
SELECT * FROM cleaning_revenue
UNION ALL
SELECT * FROM maintenance_revenue;

-- Accounts receivable aging
CREATE MATERIALIZED VIEW IF NOT EXISTS accounts_receivable_aging AS
WITH cleaning_ar AS (
    SELECT
        'CLEANING' as service_type,
        customer_profile_id,
        invoice_number,
        total_amount,
        due_date,
        CURRENT_DATE - due_date as days_overdue,
        CASE
            WHEN CURRENT_DATE - due_date <= 0 THEN 'CURRENT'
            WHEN CURRENT_DATE - due_date <= 30 THEN '1-30_DAYS'
            WHEN CURRENT_DATE - due_date <= 60 THEN '31-60_DAYS'
            WHEN CURRENT_DATE - due_date <= 90 THEN '61-90_DAYS'
            ELSE 'OVER_90_DAYS'
        END as aging_bucket
    FROM cleaning_db.cleaning_service_invoices
    WHERE payment_status IN ('UNPAID', 'PARTIALLY_PAID')
    AND status != 'CANCELLED'
),
maintenance_ar AS (
    SELECT
        'MAINTENANCE' as service_type,
        customer_profile_id,
        invoice_number,
        total_amount,
        due_date,
        CURRENT_DATE - due_date as days_overdue,
        CASE
            WHEN CURRENT_DATE - due_date <= 0 THEN 'CURRENT'
            WHEN CURRENT_DATE - due_date <= 30 THEN '1-30_DAYS'
            WHEN CURRENT_DATE - due_date <= 60 THEN '31-60_DAYS'
            WHEN CURRENT_DATE - due_date <= 90 THEN '61-90_DAYS'
            ELSE 'OVER_90_DAYS'
        END as aging_bucket
    FROM maintenance_db.maintenance_service_invoices
    WHERE payment_status IN ('UNPAID', 'PARTIALLY_PAID')
    AND status != 'CANCELLED'
)
SELECT * FROM cleaning_ar
UNION ALL
SELECT * FROM maintenance_ar;

-- Refresh materialized views
CREATE OR REPLACE FUNCTION refresh_billing_analytics() RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY service_revenue_recognition;
    REFRESH MATERIALIZED VIEW CONCURRENTLY accounts_receivable_aging;
END;
$$ LANGUAGE plpgsql;
```

## Automated Collections Management

### Late Fee and Dunning Management
```sql
-- Late fee calculation and application
CREATE OR REPLACE FUNCTION apply_late_fees() RETURNS TABLE(
    fees_applied INTEGER,
    total_fees_amount DECIMAL,
    customers_affected INTEGER
) AS $$
DECLARE
    fees_count INTEGER := 0;
    total_fees DECIMAL(12,2) := 0.00;
    customers_count INTEGER := 0;
BEGIN
    -- Apply late fees to cleaning service invoices
    UPDATE cleaning_db.cleaning_service_invoices
    SET
        total_amount = total_amount + (total_amount * 0.05), -- 5% late fee
        notes = COALESCE(notes, '') || ' [Late fee applied: 5%]',
        collection_status = 'OVERDUE'
    WHERE payment_status IN ('UNPAID', 'PARTIALLY_PAID')
    AND due_date < CURRENT_DATE - INTERVAL '15 days'
    AND (notes IS NULL OR notes NOT LIKE '%Late fee applied%')
    AND deleted_at IS NULL
    RETURNING 1 INTO fees_count;

    GET DIAGNOSTICS customers_count = ROW_COUNT;
    total_fees := total_fees + (SELECT SUM(total_amount * 0.05)
                                FROM cleaning_db.cleaning_service_invoices
                                WHERE payment_status IN ('UNPAID', 'PARTIALLY_PAID')
                                AND due_date < CURRENT_DATE - INTERVAL '15 days'
                                AND (notes IS NULL OR notes NOT LIKE '%Late fee applied%'));

    -- Apply late fees to maintenance service invoices
    UPDATE maintenance_db.maintenance_service_invoices
    SET
        total_amount = total_amount + (total_amount * 0.05), -- 5% late fee
        notes = COALESCE(notes, '') || ' [Late fee applied: 5%]',
        collection_status = 'OVERDUE'
    WHERE payment_status IN ('UNPAID', 'PARTIALLY_PAID')
    AND due_date < CURRENT_DATE - INTERVAL '15 days'
    AND (notes IS NULL OR notes NOT LIKE '%Late fee applied%')
    AND deleted_at IS NULL;

    GET DIAGNOSTICS customers_count = customers_count + ROW_COUNT;

    RETURN QUERY SELECT fees_count, total_fees, customers_count;
END;
$$ LANGUAGE plpgsql;

-- Automated reminder system
CREATE OR REPLACE FUNCTION send_payment_reminders() RETURNS TABLE(
    reminders_sent INTEGER,
    service_type VARCHAR,
    reminder_type VARCHAR
) AS $$
BEGIN
    -- First reminder (due date)
    RETURN QUERY
    SELECT
        COUNT(*),
        'CLEANING' as service_type,
        'DUE_DATE_REMINDER' as reminder_type
    FROM cleaning_db.cleaning_service_invoices
    WHERE due_date = CURRENT_DATE + INTERVAL '3 days'
    AND payment_status = 'UNPAID'
    AND last_reminder_sent IS NULL

    UNION ALL

    -- Second reminder (15 days overdue)
    SELECT
        COUNT(*),
        'CLEANING' as service_type,
        'OVERDUE_REMINDER' as reminder_type
    FROM cleaning_db.cleaning_service_invoices
    WHERE due_date = CURRENT_DATE - INTERVAL '15 days'
    AND payment_status IN ('UNPAID', 'PARTIALLY_PAID')
    AND (last_reminder_sent IS NULL OR last_reminder_sent < CURRENT_DATE - INTERVAL '7 days')

    UNION ALL

    -- Maintenance service reminders
    SELECT
        COUNT(*),
        'MAINTENANCE' as service_type,
        'DUE_DATE_REMINDER' as reminder_type
    FROM maintenance_db.maintenance_service_invoices
    WHERE due_date = CURRENT_DATE + INTERVAL '3 days'
    AND payment_status = 'UNPAID'
    AND last_reminder_sent IS NULL

    UNION ALL

    SELECT
        COUNT(*),
        'MAINTENANCE' as service_type,
        'OVERDUE_REMINDER' as reminder_type
    FROM maintenance_db.maintenance_service_invoices
    WHERE due_date = CURRENT_DATE - INTERVAL '15 days'
    AND payment_status IN ('UNPAID', 'PARTIALLY_PAID')
    AND (last_reminder_sent IS NULL OR last_reminder_sent < CURRENT_DATE - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;
```

## Benefits

### For Financial Management
- Automated invoice generation based on contract terms
- Service-specific pricing models and billing cycles
- Real-time revenue recognition and reporting
- Comprehensive accounts receivable aging

### For Cross-Service Coordination
- Unified billing for dual-service customers
- Consolidated or separate invoicing options
- Cross-service payment processing coordination
- Unified customer financial view

### For Collections and Cash Flow
- Automated late fee application
- Scheduled payment reminders
- Collections workflow management
- Payment processing integration

## Risk Mitigation

### Financial Accuracy
- Service-specific validation rules
- Automated tax calculations
- Audit trails for all transactions
- Reconciliation processes

### Payment Security
- PCI compliance for payment processing
- Secure payment gateway integration
- Fraud detection and prevention
- Data encryption for sensitive information

### Compliance
- Tax compliance by jurisdiction
- Revenue recognition standards
- Data retention policies
- Audit trail maintenance

## Next Steps

1. **Integrate Payment Gateways**: Connect to Stripe, PayPal, and other providers
2. **Implement Billing Automation**: Set up scheduled invoice generation
3. **Build Collections Dashboard**: Create user-friendly collections interface
4. **Set Up Analytics**: Implement financial reporting and dashboards
5. **Test End-to-End**: Validate complete billing and payment workflows