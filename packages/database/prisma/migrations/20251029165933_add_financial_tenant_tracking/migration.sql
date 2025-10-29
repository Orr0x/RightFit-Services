-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'NOTICE_GIVEN');

-- CreateEnum
CREATE TYPE "RentFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH', 'CHEQUE', 'STANDING_ORDER', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('MAINTENANCE', 'REPAIRS', 'UTILITIES', 'INSURANCE', 'PROPERTY_TAX', 'MANAGEMENT_FEES', 'MORTGAGE', 'LEGAL_FEES', 'CLEANING', 'GARDENING', 'SAFETY_CERTIFICATES', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LEASE_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'RENT_OVERDUE';
ALTER TYPE "NotificationType" ADD VALUE 'BUDGET_ALERT';

-- CreateTable
CREATE TABLE "property_tenants" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "move_in_date" TIMESTAMP(3) NOT NULL,
    "lease_expiry_date" TIMESTAMP(3),
    "rent_amount" DECIMAL(10,2) NOT NULL,
    "rent_frequency" "RentFrequency" NOT NULL,
    "rent_due_day" INTEGER,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "property_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_payments" (
    "id" TEXT NOT NULL,
    "property_tenant_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "expected_date" TIMESTAMP(3),
    "payment_method" "PaymentMethod",
    "reference" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rent_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_transactions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" "ExpenseCategory",
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "receipt_url" VARCHAR(500),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_budgets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "monthly_budget" DECIMAL(10,2) NOT NULL,
    "alert_threshold" DECIMAL(3,2) NOT NULL DEFAULT 0.8,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_tenants_tenant_id_idx" ON "property_tenants"("tenant_id");

-- CreateIndex
CREATE INDEX "property_tenants_property_id_idx" ON "property_tenants"("property_id");

-- CreateIndex
CREATE INDEX "property_tenants_status_idx" ON "property_tenants"("status");

-- CreateIndex
CREATE INDEX "property_tenants_lease_expiry_date_idx" ON "property_tenants"("lease_expiry_date");

-- CreateIndex
CREATE INDEX "rent_payments_property_tenant_id_idx" ON "rent_payments"("property_tenant_id");

-- CreateIndex
CREATE INDEX "rent_payments_payment_date_idx" ON "rent_payments"("payment_date");

-- CreateIndex
CREATE INDEX "rent_payments_expected_date_idx" ON "rent_payments"("expected_date");

-- CreateIndex
CREATE INDEX "financial_transactions_tenant_id_idx" ON "financial_transactions"("tenant_id");

-- CreateIndex
CREATE INDEX "financial_transactions_property_id_idx" ON "financial_transactions"("property_id");

-- CreateIndex
CREATE INDEX "financial_transactions_type_idx" ON "financial_transactions"("type");

-- CreateIndex
CREATE INDEX "financial_transactions_date_idx" ON "financial_transactions"("date");

-- CreateIndex
CREATE INDEX "financial_transactions_category_idx" ON "financial_transactions"("category");

-- CreateIndex
CREATE UNIQUE INDEX "property_budgets_property_id_key" ON "property_budgets"("property_id");

-- CreateIndex
CREATE INDEX "property_budgets_tenant_id_idx" ON "property_budgets"("tenant_id");

-- AddForeignKey
ALTER TABLE "property_tenants" ADD CONSTRAINT "property_tenants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_tenants" ADD CONSTRAINT "property_tenants_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_property_tenant_id_fkey" FOREIGN KEY ("property_tenant_id") REFERENCES "property_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_budgets" ADD CONSTRAINT "property_budgets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_budgets" ADD CONSTRAINT "property_budgets_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
