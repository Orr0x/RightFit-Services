-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('CLEANING_SERVICE', 'MAINTENANCE_SERVICE', 'PROPERTY_MANAGEMENT', 'GENERAL');

-- CreateTable
CREATE TABLE "property_shares" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "owner_tenant_id" TEXT NOT NULL,
    "shared_with_tenant_id" TEXT NOT NULL,
    "share_type" "ShareType" NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT true,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_view_financial" BOOLEAN NOT NULL DEFAULT false,
    "can_view_certificates" BOOLEAN NOT NULL DEFAULT true,
    "can_create_jobs" BOOLEAN NOT NULL DEFAULT true,
    "can_view_tenants" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "property_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_shares_owner_tenant_id_idx" ON "property_shares"("owner_tenant_id");

-- CreateIndex
CREATE INDEX "property_shares_shared_with_tenant_id_idx" ON "property_shares"("shared_with_tenant_id");

-- CreateIndex
CREATE INDEX "property_shares_property_id_idx" ON "property_shares"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_shares_property_id_shared_with_tenant_id_key" ON "property_shares"("property_id", "shared_with_tenant_id");

-- AddForeignKey
ALTER TABLE "property_shares" ADD CONSTRAINT "property_shares_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_shares" ADD CONSTRAINT "property_shares_owner_tenant_id_fkey" FOREIGN KEY ("owner_tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_shares" ADD CONSTRAINT "property_shares_shared_with_tenant_id_fkey" FOREIGN KEY ("shared_with_tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
