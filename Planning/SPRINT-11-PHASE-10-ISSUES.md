# Sprint 11 - Phase 10: Known Issues & Fixes Required

## ✅ COMPLETED FIXES

### 1. MaintenanceInvoiceService - Requires Complete Refactoring ✅ FIXED
**Location**: `apps/api/src/services/MaintenanceInvoiceService.ts`
**Status**: ✅ **COMPLETED** (Commit: 9e9fc1a)

**Problem**: The service was copied from CleaningInvoiceService and uses contract-based fields that don't exist in the generic Invoice model.

**Current (Incorrect) Fields**:
- `contract_id` - does not exist in Invoice model
- `billing_period_start` / `billing_period_end` - does not exist
- `total_cleans_completed` - does not exist
- `contract_monthly_fee` - does not exist
- `additional_charges` - does not exist in Invoice (use line_items instead)

**Should Use (Job-based Invoice)**:
- `maintenance_job_id` - links invoice to specific job
- `customer_id` - customer who receives invoice
- `invoice_date` - date invoice was issued
- `due_date` - payment due date
- `line_items` - JSON array of invoice line items
- `subtotal`, `tax_percentage`, `tax_amount`, `total`
- `status` - PENDING, PAID, OVERDUE, VOID
- `payment_method`, `paid_at`, `payment_reference`
- `notes`

**Required Changes**:
1. Remove all contract-based logic from `generateFromContract()` method
2. Create new method `createFromJob(maintenance_job_id, serviceProviderId)` that:
   - Fetches the MaintenanceJob details
   - Generates line items from job details (parts used, labor hours, etc.)
   - Calculates totals from line items
   - Creates invoice with proper due date
3. Update `list()` method to remove contract_id filter
4. Update `getById()` to not include contract relations
5. Remove billing period logic from all methods
6. Keep generic methods: `markAsPaid`, `update`, `delete`, `getCustomerStats`

**Solution Implemented**:
- ✅ Removed generateFromContract() method
- ✅ Added createFromJob(maintenance_job_id) - creates invoice from completed job
- ✅ Added create() - manual invoice creation with line_items
- ✅ Updated generateInvoiceNumber() - uses "MINV" prefix
- ✅ Updated list() - filters by maintenance_job_id, orders by invoice_date
- ✅ Updated getById() - includes maintenance_job with property
- ✅ Updated update() - recalculates from line_items
- ✅ Updated getCustomerStats() - filters for maintenance invoices only

**Time Taken**: 35 minutes

---

### 2. MaintenanceInvoice Routes - Update to Match Service Changes ✅ FIXED
**Location**: `apps/api/src/routes/maintenance-invoices.ts`
**Status**: ✅ **COMPLETED** (Commit: 9e9fc1a)

**Problem**: Routes currently expect contract-based invoice generation

**Solution Implemented**:
- ✅ Updated GET / - filters by maintenance_job_id (not contract_id)
- ✅ Replaced POST /generate → POST /from-job
- ✅ Added POST / - manual invoice creation
- ✅ Updated PATCH /:id - accepts line_items, subtotal, tax_percentage
- ✅ Updated all routes to use req.user.tenant_id for multi-tenant auth

**Time Taken**: 15 minutes

---

### 6. Quote Number Generation ✅ FIXED
**Location**: `apps/api/src/services/MaintenanceQuoteService.ts:generateQuoteNumber()`
**Status**: ✅ **COMPLETED** (Commit: 941cdce)

**Problem**: Uses "CQ" prefix and comments reference "cleaning quotes"

**Solution Implemented**:
- ✅ Changed prefix from CQ → MQ (Maintenance Quote)
- ✅ Updated comments to reference "maintenance quotes"
- ✅ Format: MQ-YYYYMM-XXXX (e.g., MQ-202501-0001)

**Time Taken**: 5 minutes

---

## 🔄 REMAINING TASKS

## Medium Priority Issues

### 3. Frontend Quote/Invoice Creation Forms
**Locations**:
- `apps/web-maintenance/src/pages/CreateQuote.tsx`
- `apps/web-maintenance/src/pages/CreateInvoice.tsx`

**Potential Issue**: Forms may reference fields that don't exist in MaintenanceQuote or Invoice models

**Required Testing**:
1. Test quote creation workflow
2. Test invoice creation from job
3. Verify all form fields map to correct database fields
4. Test PDF generation (if implemented)

**Estimated Effort**: 20-30 minutes testing + fixes

---

### 4. API Type Definitions
**Location**: `apps/web-maintenance/src/lib/api.ts`

**Potential Issue**: TypeScript types may not match actual Prisma models

**Required Verification**:
1. Verify MaintenanceQuote interface matches schema
2. Verify MaintenanceInvoice interface matches Invoice schema
3. Update any mismatched fields

**Estimated Effort**: 15 minutes

---

## Testing Checklist

### Backend API Testing
- [ ] GET /api/maintenance-quotes (list quotes)
- [ ] POST /api/maintenance-quotes (create quote)
- [ ] GET /api/maintenance-quotes/:id (get quote details)
- [ ] PUT /api/maintenance-quotes/:id (update quote)
- [ ] POST /api/maintenance-quotes/:id/approve (approve quote)
- [ ] POST /api/maintenance-quotes/:id/decline (decline quote)
- [ ] DELETE /api/maintenance-quotes/:id (delete quote)
- [ ] GET /api/maintenance-invoices (list invoices) - ✅ FIXED
- [ ] POST /api/maintenance-invoices (create invoice) - ✅ FIXED
- [ ] POST /api/maintenance-invoices/from-job (create from job) - ✅ NEW
- [ ] GET /api/maintenance-invoices/:id (get invoice) - ✅ FIXED
- [ ] PATCH /api/maintenance-invoices/:id (update invoice) - ✅ FIXED
- [ ] PUT /api/maintenance-invoices/:id/mark-paid (mark as paid) - ✅ FIXED
- [ ] DELETE /api/maintenance-invoices/:id (delete invoice) - ✅ FIXED

### Frontend Testing
- [ ] Quotes page loads without errors
- [ ] Create quote form works
- [ ] Edit quote form works
- [ ] Quote details page displays correctly
- [ ] Invoices page loads without errors
- [ ] Create invoice form works
- [ ] Edit invoice form works
- [ ] Invoice details page displays correctly
- [ ] All modals open/close correctly
- [ ] All API calls use correct endpoints

### Database Testing
- [ ] MaintenanceQuote table exists
- [ ] Can create maintenance quotes
- [ ] Can query maintenance quotes
- [ ] Can update maintenance quotes
- [ ] Can delete maintenance quotes
- [ ] Invoice table accepts maintenance_job_id
- [ ] Foreign key constraints work properly

---

## Summary

**Progress Update**:
- ✅ **3 Issues Fixed** (2 HIGH, 1 LOW)
- 🔄 **2 Issues Remaining** (2 MEDIUM)

**Completed**:
- ✅ MaintenanceInvoiceService refactoring (HIGH) - 35 min
- ✅ Invoice routes update (HIGH) - 15 min
- ✅ Quote number prefix fix (LOW) - 5 min
- **Total Time Spent**: 55 minutes

**Remaining**:
- 🔄 Frontend forms testing (MEDIUM) - Est. 20-30 min
- 🔄 API type verification (MEDIUM) - Est. 15 min
- **Est. Time Remaining**: 35-45 minutes

**Overall Sprint Status**:
- Phase 10.2: 60% Complete (3/5 issues fixed)
- Sprint 11 Total: 95% Complete

---

**Status**: Phase 10.2 In Progress - Critical fixes completed
**Created**: Sprint 11, Phase 10.1 (Integration Testing)
**Last Updated**: Phase 10.2 (Bug Fixes) - Commits 9e9fc1a, 941cdce
