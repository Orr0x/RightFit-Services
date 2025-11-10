# Sprint 11 - Maintenance Portal V2: Executive Summary

## Quick Overview

**Objective**: Build complete Maintenance Portal V2 by replicating cleaning portal architecture
**Duration**: 22 working days (~4.5 weeks)
**Priority**: 🔴 PRIORITY 1
**Scope**: 60+ new files, full CRUD for all modules, complete job-to-payment workflow

---

## What We're Building

### 1. Complete Page Set (30+ pages)
Matching cleaning portal PLUS contractors enhancement:

**Property Management:**
- Properties list with grid/list view
- Add/Edit Property with GPS integration
- Property Details with maintenance history

**Customer Management:**
- Customers list with search/filter
- Add/Edit Customer
- Customer Details with all related data

**Financial Management:**
- **Quotes**: Create → Send → Approve → Convert to Job
- **Invoices**: Create → Send → Track Payments
- Complete PDF generation and email integration

**Job Management:**
- Enhanced job creation with tabs (details, scheduling, financial, attachments)
- Job edit page
- Enhanced job details with timeline, photos, documents
- Multiple view modes (list, grid, kanban, calendar)

**Worker/Contractor Management:**
- Worker details and performance
- **Contractors page** with full CRUD (NEW - not in cleaning portal)
- Contractor scheduling and availability
- Performance tracking for both

**Planning & Organization:**
- Property calendar with drag-drop scheduling
- Enhanced dashboard with maintenance metrics
- Worker/Contractor reports

---

## Key Differentiators from Cleaning Portal

### 1. **Contractors Module** 🆕
Separate from workers with:
- Company information and specialties
- Insurance tracking with expiry alerts
- License and certification management
- Hourly/project rate configuration
- Availability calendar
- Performance metrics
- Document management

### 2. **Maintenance-Specific Service Types**
```typescript
PLUMBING | ELECTRICAL | HVAC | CARPENTRY |
PAINTING | ROOFING | APPLIANCE_REPAIR |
PEST_CONTROL | LANDSCAPING | GENERAL | EMERGENCY
```

### 3. **Priority-Based Workflow**
- URGENT (immediate response)
- HIGH (24-48 hours)
- MEDIUM (3-7 days)
- LOW (scheduled maintenance)

### 4. **Enhanced Quote Approval Process**
```
Job Request → Quote Required? → Create Quote →
Send to Customer → Approval → Schedule Job →
Assign Worker/Contractor → Complete → Invoice
```

### 5. **Parts & Materials Tracking**
- Parts needed (planning)
- Parts used (actual)
- Cost tracking (estimated vs actual)

### 6. **Multiple Assignment Types**
- Internal Workers (employees)
- External Contractors (third-party)
- Mixed assignments (worker + contractor)

---

## 10-Phase Implementation Plan

### Phase 1-2: Foundation (Days 1-4)
- API client setup with maintenance-specific endpoints
- TypeScript types (MaintenanceJob, Contractor, Quote, Invoice)
- Shared components migration
- Customer & Property CRUD

### Phase 3-4: Core Features (Days 5-10)
- Enhanced job management (create, edit, details, list views)
- Quotes module (create, approve, convert, PDF)
- Invoices module (create, send, payments, PDF)

### Phase 5-6: People & Planning (Days 11-14)
- Workers enhancement (details, performance)
- Contractors module (full CRUD, scheduling, availability)
- Property calendar (drag-drop, recurring jobs)
- Enhanced dashboard

### Phase 7-8: Details (Days 15-19)
- All modals (start job, complete job, quotes, reassign, etc.)
- Picker components (customer, property, worker, contractor)
- Backend API implementation
- Email and PDF services

### Phase 9-10: Polish (Days 20-22)
- Database schema migrations
- Integration testing
- Bug fixes
- Documentation

---

## Database Schema Additions

### New Models:
```prisma
MaintenanceJob {
  + serviceType (enum: PLUMBING, ELECTRICAL, etc.)
  + priority (enum: URGENT, HIGH, MEDIUM, LOW)
  + status (enum: QUOTE_PENDING → COMPLETED)
  + partsNeeded / partsUsed (JSON)
  + estimatedCost / actualCost
  + quoteRequired / quoteApproved
  + assignedContractorId (NEW)
}

Contractor {  // 🆕 NEW MODEL
  + company, specialties, rating
  + insuranceExpiry, certifications
  + hourlyRate, paymentTerms
  + availability[]
}

MaintenanceQuote {  // 🆕 NEW MODEL
  + quoteNumber, lineItems
  + status (DRAFT → APPROVED)
  + validUntil, approvedAt
}

MaintenanceInvoice {  // 🆕 NEW MODEL
  + invoiceNumber, lineItems
  + status (DRAFT → PAID)
  + amountPaid, balanceDue
  + payments[]
}
```

---

## Technical Highlights

### Frontend Stack:
- React + TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Modular component architecture
- Form validation with custom hooks

### Backend Stack:
- Express.js API routes
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Multi-tenant architecture

### Key Features:
- PDF generation (quotes, invoices)
- Email sending (quotes, invoices, notifications)
- Photo upload with compression
- Document management
- GPS integration for properties
- Drag-drop scheduling
- Real-time updates
- Export to CSV/Excel
- Advanced filtering and search

---

## Success Metrics

### Functional:
- ✅ All cleaning portal pages replicated
- ✅ Contractors module fully operational
- ✅ Complete quote-to-payment workflow
- ✅ PDF/email generation working
- ✅ All CRUD operations functional
- ✅ Calendar scheduling with drag-drop
- ✅ Reports and exports working

### Technical:
- ✅ TypeScript type safety
- ✅ API secured with authentication
- ✅ Database migrations successful
- ✅ Page load < 2 seconds
- ✅ No console errors
- ✅ Responsive on all devices
- ✅ Accessibility (WCAG 2.1 AA)

### Quality:
- ✅ Code reviewed
- ✅ User testing completed
- ✅ Documentation complete
- ✅ No critical bugs

---

## What's Already Built (Can Keep/Enhance)

In `apps/web-maintenance`:
- ✅ Basic routing structure
- ✅ MaintenanceDashboard (enhance)
- ✅ MaintenanceJobs list (enhance)
- ✅ CreateMaintenanceJob (enhance)
- ✅ MaintenanceJobDetails (enhance)
- ✅ Workers page (enhance, add details)
- ✅ Contractors page (enhance to full CRUD)
- ✅ Properties page (enhance to full CRUD)
- ✅ Financial page (basic)
- ✅ Certificates page
- ✅ Basic components (CalendarView, KanbanView, PhotoUpload)

**Strategy**: Build v2 alongside existing portal, reference old pages during debugging, then remove old pages once v2 is complete and tested.

---

## Risk Mitigation

**High Risk:**
- Database migrations → Test on dev first, backup production
- API changes → Version APIs, maintain compatibility

**Medium Risk:**
- New contractor module → Early user feedback
- PDF generation → Use proven libraries, implement caching
- Performance → Pagination, lazy loading, indexing

**Low Risk:**
- UI/UX → Following proven cleaning portal patterns

---

## Post-Sprint Enhancements (Future)

1. Worker/Contractor mobile app access
2. Customer self-service portal
3. SMS/Email automation
4. Online payment gateway
5. Preventive maintenance scheduler
6. Parts inventory management
7. PMS integration (two-way sync)
8. Advanced BI dashboards
9. Native mobile apps

---

## File Impact Summary

- **~30 new pages**
- **~25 new components**
- **~5 new API routes**
- **~4 new database models**
- **~3 documentation files**

**Total: 60+ new files**

---

## Deliverables Checklist

- [ ] All pages from cleaning portal replicated
- [ ] Contractors module with full CRUD
- [ ] Quote approval workflow
- [ ] Invoice payment tracking
- [ ] Property calendar with scheduling
- [ ] Enhanced dashboard
- [ ] Worker/contractor reports
- [ ] PDF generation for quotes/invoices
- [ ] Email integration
- [ ] All modals and pickers
- [ ] Backend API implementation
- [ ] Database migrations
- [ ] Complete documentation
- [ ] User guide
- [ ] API documentation

---

**Full Plan**: See [SPRINT-11-MAINTENANCE-PORTAL-V2.md](./SPRINT-11-MAINTENANCE-PORTAL-V2.md)
**Status**: 📋 READY FOR REVIEW
**Next Step**: Review plan → Get approval → Start Phase 1
