-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('CLEANING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('PER_JOB', 'HOURLY', 'RETAINER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('PROPERTY_MANAGER', 'OWNER', 'LETTING_AGENCY');

-- CreateEnum
CREATE TYPE "PaymentTerms" AS ENUM ('NET_7', 'NET_14', 'NET_30');

-- CreateEnum
CREATE TYPE "WorkerType" AS ENUM ('CLEANER', 'MAINTENANCE', 'BOTH');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaintenanceSource" AS ENUM ('CUSTOMER_REQUEST', 'CLEANER_REPORT', 'GUEST_REPORT', 'PREVENTIVE_MAINTENANCE', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('URGENT', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('QUOTE_PENDING', 'QUOTE_SENT', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "GuestIssueStatus" AS ENUM ('SUBMITTED', 'TRIAGED', 'WORK_ORDER_CREATED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "service_providers" (
    "id" TEXT NOT NULL,
    "business_name" VARCHAR(100) NOT NULL,
    "owner_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "service_provider_id" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "pricing_model" "PricingModel" NOT NULL,
    "default_rate" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "service_provider_id" TEXT NOT NULL,
    "business_name" VARCHAR(100) NOT NULL,
    "contact_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "customer_type" "CustomerType" NOT NULL,
    "has_cleaning_contract" BOOLEAN NOT NULL DEFAULT false,
    "has_maintenance_contract" BOOLEAN NOT NULL DEFAULT false,
    "bundled_discount_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "payment_terms" "PaymentTerms" NOT NULL DEFAULT 'NET_14',
    "payment_reliability_score" INTEGER NOT NULL DEFAULT 50,
    "satisfaction_score" INTEGER,
    "cross_sell_potential" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_properties" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "property_name" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "postcode" VARCHAR(10) NOT NULL,
    "property_type" VARCHAR(50) NOT NULL,
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "access_instructions" TEXT,
    "access_code" VARCHAR(255),
    "cleaning_checklist_template_id" TEXT,
    "guest_portal_enabled" BOOLEAN NOT NULL DEFAULT false,
    "guest_portal_qr_code_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" TEXT NOT NULL,
    "service_provider_id" TEXT NOT NULL,
    "user_id" TEXT,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "worker_type" "WorkerType" NOT NULL,
    "employment_type" "EmploymentType" NOT NULL,
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_weekly_hours" INTEGER,
    "jobs_completed" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_contractors" (
    "id" TEXT NOT NULL,
    "service_provider_id" TEXT NOT NULL,
    "company_name" VARCHAR(100) NOT NULL,
    "contact_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "specialties" VARCHAR(50)[],
    "certifications" VARCHAR(255)[],
    "referral_fee_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "preferred_contractor" BOOLEAN NOT NULL DEFAULT false,
    "emergency_callout_available" BOOLEAN NOT NULL DEFAULT false,
    "jobs_completed" INTEGER NOT NULL DEFAULT 0,
    "average_response_time_hours" DECIMAL(10,2),
    "average_rating" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cleaning_jobs" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "assigned_worker_id" TEXT,
    "scheduled_date" DATE NOT NULL,
    "scheduled_start_time" VARCHAR(10) NOT NULL,
    "scheduled_end_time" VARCHAR(10) NOT NULL,
    "actual_start_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "checklist_template_id" TEXT,
    "checklist_items" JSONB,
    "checklist_completed_items" INTEGER NOT NULL DEFAULT 0,
    "checklist_total_items" INTEGER NOT NULL DEFAULT 0,
    "status" "JobStatus" NOT NULL DEFAULT 'SCHEDULED',
    "completion_notes" TEXT,
    "before_photos" VARCHAR(500)[],
    "after_photos" VARCHAR(500)[],
    "issue_photos" VARCHAR(500)[],
    "pricing_type" VARCHAR(50) NOT NULL,
    "quoted_price" DECIMAL(10,2) NOT NULL,
    "actual_price" DECIMAL(10,2),
    "maintenance_issues_found" INTEGER NOT NULL DEFAULT 0,
    "maintenance_quotes_generated" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cleaning_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_jobs" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "assigned_worker_id" TEXT,
    "assigned_contractor_id" TEXT,
    "source" "MaintenanceSource" NOT NULL,
    "source_cleaning_job_id" TEXT,
    "source_guest_report_id" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "priority" "MaintenancePriority" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "requested_date" DATE,
    "scheduled_date" DATE,
    "completed_date" DATE,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'QUOTE_PENDING',
    "quote_id" TEXT,
    "estimated_hours" DECIMAL(10,2),
    "estimated_parts_cost" DECIMAL(10,2),
    "estimated_labor_cost" DECIMAL(10,2),
    "estimated_total" DECIMAL(10,2),
    "actual_total" DECIMAL(10,2),
    "issue_photos" VARCHAR(500)[],
    "work_in_progress_photos" VARCHAR(500)[],
    "completion_photos" VARCHAR(500)[],
    "ai_severity_score" INTEGER,
    "ai_category_confidence" DECIMAL(3,2),
    "completion_notes" TEXT,
    "customer_satisfaction_rating" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "maintenance_job_id" TEXT,
    "quote_number" VARCHAR(50) NOT NULL,
    "quote_date" DATE NOT NULL,
    "valid_until_date" DATE NOT NULL,
    "line_items" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "customer_response" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_templates" (
    "id" TEXT NOT NULL,
    "service_provider_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "template_name" VARCHAR(100) NOT NULL,
    "property_type" VARCHAR(50) NOT NULL,
    "sections" JSONB NOT NULL,
    "estimated_duration_minutes" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_issue_reports" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "guest_name" VARCHAR(100),
    "guest_phone" VARCHAR(20),
    "guest_email" VARCHAR(255),
    "issue_type" VARCHAR(50) NOT NULL,
    "issue_description" TEXT NOT NULL,
    "photos" VARCHAR(500)[],
    "ai_severity" VARCHAR(20),
    "ai_category" VARCHAR(50),
    "ai_confidence" DECIMAL(3,2),
    "ai_analysis_notes" TEXT,
    "status" "GuestIssueStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_maintenance_job_id" TEXT,
    "assigned_to_next_cleaning" BOOLEAN NOT NULL DEFAULT false,
    "guest_notified" BOOLEAN NOT NULL DEFAULT false,
    "guest_notification_message" TEXT,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triaged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_issue_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "services_service_provider_id_idx" ON "services"("service_provider_id");

-- CreateIndex
CREATE INDEX "services_service_type_idx" ON "services"("service_type");

-- CreateIndex
CREATE INDEX "customers_service_provider_id_idx" ON "customers"("service_provider_id");

-- CreateIndex
CREATE INDEX "customer_properties_customer_id_idx" ON "customer_properties"("customer_id");

-- CreateIndex
CREATE INDEX "customer_properties_postcode_idx" ON "customer_properties"("postcode");

-- CreateIndex
CREATE INDEX "workers_service_provider_id_idx" ON "workers"("service_provider_id");

-- CreateIndex
CREATE INDEX "workers_worker_type_idx" ON "workers"("worker_type");

-- CreateIndex
CREATE INDEX "external_contractors_service_provider_id_idx" ON "external_contractors"("service_provider_id");

-- CreateIndex
CREATE INDEX "cleaning_jobs_service_id_idx" ON "cleaning_jobs"("service_id");

-- CreateIndex
CREATE INDEX "cleaning_jobs_property_id_idx" ON "cleaning_jobs"("property_id");

-- CreateIndex
CREATE INDEX "cleaning_jobs_customer_id_idx" ON "cleaning_jobs"("customer_id");

-- CreateIndex
CREATE INDEX "cleaning_jobs_assigned_worker_id_idx" ON "cleaning_jobs"("assigned_worker_id");

-- CreateIndex
CREATE INDEX "cleaning_jobs_status_idx" ON "cleaning_jobs"("status");

-- CreateIndex
CREATE INDEX "cleaning_jobs_scheduled_date_idx" ON "cleaning_jobs"("scheduled_date");

-- CreateIndex
CREATE INDEX "maintenance_jobs_service_id_idx" ON "maintenance_jobs"("service_id");

-- CreateIndex
CREATE INDEX "maintenance_jobs_property_id_idx" ON "maintenance_jobs"("property_id");

-- CreateIndex
CREATE INDEX "maintenance_jobs_customer_id_idx" ON "maintenance_jobs"("customer_id");

-- CreateIndex
CREATE INDEX "maintenance_jobs_assigned_worker_id_idx" ON "maintenance_jobs"("assigned_worker_id");

-- CreateIndex
CREATE INDEX "maintenance_jobs_assigned_contractor_id_idx" ON "maintenance_jobs"("assigned_contractor_id");

-- CreateIndex
CREATE INDEX "maintenance_jobs_status_idx" ON "maintenance_jobs"("status");

-- CreateIndex
CREATE INDEX "maintenance_jobs_priority_idx" ON "maintenance_jobs"("priority");

-- CreateIndex
CREATE INDEX "maintenance_jobs_scheduled_date_idx" ON "maintenance_jobs"("scheduled_date");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quote_number_key" ON "quotes"("quote_number");

-- CreateIndex
CREATE INDEX "quotes_customer_id_idx" ON "quotes"("customer_id");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

-- CreateIndex
CREATE INDEX "checklist_templates_service_provider_id_idx" ON "checklist_templates"("service_provider_id");

-- CreateIndex
CREATE INDEX "checklist_templates_customer_id_idx" ON "checklist_templates"("customer_id");

-- CreateIndex
CREATE INDEX "guest_issue_reports_property_id_idx" ON "guest_issue_reports"("property_id");

-- CreateIndex
CREATE INDEX "guest_issue_reports_status_idx" ON "guest_issue_reports"("status");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_properties" ADD CONSTRAINT "customer_properties_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_contractors" ADD CONSTRAINT "external_contractors_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_jobs" ADD CONSTRAINT "cleaning_jobs_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_jobs" ADD CONSTRAINT "cleaning_jobs_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "customer_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_jobs" ADD CONSTRAINT "cleaning_jobs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_jobs" ADD CONSTRAINT "cleaning_jobs_assigned_worker_id_fkey" FOREIGN KEY ("assigned_worker_id") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "customer_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_assigned_worker_id_fkey" FOREIGN KEY ("assigned_worker_id") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_assigned_contractor_id_fkey" FOREIGN KEY ("assigned_contractor_id") REFERENCES "external_contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_source_cleaning_job_id_fkey" FOREIGN KEY ("source_cleaning_job_id") REFERENCES "cleaning_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_source_guest_report_id_fkey" FOREIGN KEY ("source_guest_report_id") REFERENCES "guest_issue_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_issue_reports" ADD CONSTRAINT "guest_issue_reports_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "customer_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
