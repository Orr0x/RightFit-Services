# Sprint 11 - Phase 10: Known Issues & Fixes Required

## High Priority Issues

### 1. MaintenanceInvoiceService - Requires Complete Refactoring
**Location**: `apps/api/src/services/MaintenanceInvoiceService.ts`

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

**Estimated Effort**: 30-45 minutes

---

### 2. MaintenanceInvoice Routes - Update to Match Service Changes
**Location**: `apps/api/src/routes/maintenance-invoices.ts`

**Problem**: Routes currently expect contract-based invoice generation

**Required Changes**:
1. Update POST endpoint to accept job-based invoice creation
2. Remove contract-specific filters from GET /list endpoint
3. Update response types to match Invoice model

**Estimated Effort**: 15 minutes

---

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

## Low Priority / Nice-to-Have

### 5. Invoice Number Generation
**Location**: `apps/api/src/services/MaintenanceInvoiceService.ts:generateInvoiceNumber()`

**Current Implementation**: Uses "CINV" prefix (C for Cleaning)

**Recommendation**: Change to "MINV" or "INV" for maintenance invoices

**Estimated Effort**: 5 minutes

---

### 6. Quote Number Generation
**Location**: `apps/api/src/services/MaintenanceQuoteService.ts:generateQuoteNumber()`

**Current Implementation**: Uses "CQ" prefix and counts cleaning_quotes table

**Potential Issue**: Should count maintenance_quotes table instead

**Estimated Effort**: 10 minutes

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
- [ ] GET /api/maintenance-invoices (list invoices) - BROKEN
- [ ] POST /api/maintenance-invoices (create invoice) - BROKEN
- [ ] GET /api/maintenance-invoices/:id (get invoice) - BROKEN
- [ ] PUT /api/maintenance-invoices/:id (update invoice) - BROKEN
- [ ] POST /api/maintenance-invoices/:id/mark-paid (mark as paid) - BROKEN
- [ ] DELETE /api/maintenance-invoices/:id (delete invoice) - BROKEN

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

**Total High Priority Issues**: 2 (MaintenanceInvoiceService + Routes)
**Total Medium Priority Issues**: 2 (Frontend forms + API types)
**Total Low Priority Issues**: 2 (Invoice/Quote number prefixes)

**Estimated Total Time**: 2-3 hours for all fixes

**Recommended Approach**:
1. Fix MaintenanceInvoiceService first (highest impact)
2. Update invoice routes
3. Test all API endpoints
4. Test frontend pages
5. Fix any issues found during testing
6. Update number generation prefixes
7. Final integration test

---

**Status**: Ready for Phase 10.2 implementation
**Created**: Sprint 11, Phase 10.1 (Integration Testing)
