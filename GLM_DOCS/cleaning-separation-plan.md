# RightFit Services - Complete Separation Plan: Cleaning, Customer & Worker Apps

## 🎯 **Project Overview**

This document outlines the complete separation of the Cleaning, Customer, and Worker applications into an independent project with its own database, API, and frontend applications.

### **Scope:**
- **Includes**: Cleaning services, Customer portal, Worker mobile app
- **Excludes**: Maintenance services, Landlord portal, Property management
- **Goal**: Create a standalone RightFit Cleaning Services platform

---

## 📊 **Database Schema Separation**

### **Required Tables for New Project**

#### **Core Foundation (Essential)**
```sql
-- Multi-tenant foundation
Tenant
User
PasswordResetToken
Device
Notification
```

#### **Customer Management**
```sql
ServiceProvider           -- Cleaning service provider business
Customer                  -- End customers/clients
CustomerPortalUser        -- Customer portal authentication
CustomerPreferences       -- Customer notification/behavior preferences
CustomerNotification      -- Customer-specific notifications
CustomerProperty          -- Customer properties (cleaning locations)
```

#### **Worker Management**
```sql
Worker                    -- Workers/Cleaners
WorkerCertificate         -- Worker certifications
WorkerAvailability        -- Worker scheduling availability
WorkerIssueReport         -- Issues reported by workers
WorkerHistory             -- Worker activity audit trail
```

#### **Cleaning Services**
```sql
Service                   -- Cleaning services definition
CleaningJob               -- Individual cleaning jobs
CleaningJobTimesheet      -- Worker time tracking
CleaningJobHistory        -- Cleaning job audit trail
CleaningContract          -- Recurring cleaning contracts
CleaningInvoice           -- Contract-based invoicing
CleaningQuote             -- One-off cleaning quotes
```

#### **Supporting Systems**
```sql
Photo                     -- Photos (cleaning job photos, profiles)
ChecklistTemplate         -- Cleaning checklists
PropertyChecklistTemplate -- Property-specific checklists
PropertyCalendar          -- Property availability scheduling
GuestSession              -- Guest sessions for customer properties
GuestQuestion             -- Guest Q&A
GuestIssue                -- Guest-reported issues
PropertyKnowledgeBase     -- Property-specific information
```

### **Excluded Tables (Maintenance/Landlord Only)**
- **Maintenance**: MaintenanceJob, MaintenanceContract, MaintenanceQuote, MaintenanceInvoice
- **Landlord**: Property, PropertyTenant, RentPayment, FinancialTransaction
- **Contractors**: ExternalContractor, Contractor
- **Property Management**: PropertyBudget, WorkOrder, Certificate
- **General**: Quote, Invoice (non-cleaning specific)

---

## 🏗️ **Project Structure Design**

### **New Repository Structure**
```
rightfit-cleaning/
├── apps/
│   ├── api/                    # Node.js/Express API
│   │   ├── prisma/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── controllers/
│   │   │   └── utils/
│   │   └── package.json
│   ├── web-cleaning/          # Cleaning management dashboard
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── package.json
│   ├── web-customer/          # Customer portal
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── package.json
│   └── web-worker/            # Worker mobile app
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   └── lib/
│       └── package.json
├── packages/
│   ├── shared/                # Shared types and utilities
│   ├── ui-components/         # Reusable UI components
│   └── database/              # Database schemas and migrations
├── docker/
├── docs/
└── scripts/
```

### **Technology Stack**
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Database**: PostgreSQL (dedicated instance)
- **Authentication**: JWT with refresh tokens
- **File Storage**: Local file system or AWS S3
- **Email**: Resend/SendGrid
- **SMS**: Twilio
- **Mobile**: React Native (optional future enhancement)

---

## 🔧 **API Separation Strategy**

### **API Structure**
```
/api/v1/
├── /auth/                     # Authentication endpoints
├── /customers/                # Customer management
├── /workers/                  # Worker management
├── /cleaning-jobs/            # Cleaning job operations
├── /contracts/                # Cleaning contracts
├── /invoices/                 # Billing and invoicing
├── /quotes/                   # Job quotes
├── /services/                 # Service definitions
├── /properties/               # Customer property management
├── /photos/                   # Photo upload/management
├── /notifications/            # Push/email/SMS notifications
└── /guest-portal/             # Guest access features
```

### **API Port Configuration**
- **API Server**: Port 3001 (dedicated)
- **Cleaning Dashboard**: Port 5174
- **Customer Portal**: Port 5176
- **Worker App**: Port 5178

### **Authentication & Authorization**
```typescript
// JWT Token Structure
interface JWTPayload {
  user_id: string;
  tenant_id: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'CUSTOMER' | 'WORKER';
  user_type: 'customer' | 'worker' | 'admin';
}

// Role-based permissions
const permissions = {
  ADMIN: ['*'], // Full access
  MEMBER: ['read:jobs', 'write:jobs', 'read:customers', 'read:workers'],
  CUSTOMER: ['read:own:jobs', 'write:own:jobs', 'read:own:properties'],
  WORKER: ['read:assigned:jobs', 'write:own:timesheet', 'read:own:profile']
};
```

---

## 🎨 **Frontend Separation Plan**

### **1. Cleaning Management Dashboard** (`web-cleaning`)

**Target Users**: Cleaning business owners/managers
**Key Features**:
- Customer management and onboarding
- Worker scheduling and assignment
- Job tracking and quality control
- Financial reporting and invoicing
- Service pricing and configuration

**Main Pages**:
```
/dashboard                 # Overview with KPIs
/customers                # Customer CRM
/workers                  # Worker management
/jobs                     # Job scheduling and tracking
/contracts                # Recurring contracts
/invoices                 # Financial management
/photos                   # Photo verification
/settings                 # Business configuration
```

### **2. Customer Portal** (`web-customer`)

**Target Users**: End customers who book cleaning services
**Key Features**:
- Property management
- Service booking and scheduling
- Job tracking and history
- Payment processing
- Communication with workers
- Guest access features

**Main Pages**:
```
/dashboard                 # Customer overview
/properties               # Property management
/book                     # Service booking
/jobs                     # Job history and tracking
/payments                 # Payment history
/messages                 # Communication hub
/guest-portal            # Guest access features
/settings                 # Profile and preferences
```

### **3. Worker Mobile App** (`web-worker`)

**Target Users**: Cleaners/service workers
**Key Features**:
- Job scheduling and navigation
- Time tracking and checklists
- Photo capture and reporting
- Communication tools
- Earnings and timesheets
- Offline functionality

**Main Pages**:
```
/dashboard                 # Today's schedule
/jobs                     # Job list and details
/navigation               # GPS navigation
/timesheet               # Time tracking
/photos                  # Photo capture
/messages                # Communication
/earnings                # Payment information
/profile                 # Worker profile and certs
```

---

## 📦 **Database Migration Plan**

### **Phase 1: Foundation Setup**
```sql
-- Create new dedicated database
CREATE DATABASE rightfit_cleaning;

-- Core tables migration
CREATE TABLE Tenant (...);
CREATE TABLE User (...);
CREATE TABLE PasswordResetToken (...);
CREATE TABLE Device (...);
CREATE TABLE Notification (...);
```

### **Phase 2: Customer & Worker Foundation**
```sql
-- Customer management
CREATE TABLE ServiceProvider (...);
CREATE TABLE Customer (...);
CREATE TABLE CustomerPortalUser (...);
CREATE TABLE CustomerPreferences (...);
CREATE TABLE CustomerProperty (...);

-- Worker management
CREATE TABLE Worker (...);
CREATE TABLE WorkerCertificate (...);
CREATE TABLE WorkerAvailability (...);
```

### **Phase 3: Cleaning Services**
```sql
-- Services and jobs
CREATE TABLE Service (...);
CREATE TABLE CleaningJob (...);
CREATE TABLE CleaningJobTimesheet (...);
CREATE TABLE CleaningContract (...);
CREATE TABLE CleaningInvoice (...);
CREATE TABLE CleaningQuote (...);
```

### **Phase 4: Supporting Features**
```sql
-- Supporting systems
CREATE TABLE Photo (...);
CREATE TABLE ChecklistTemplate (...);
CREATE TABLE PropertyCalendar (...);
CREATE TABLE GuestSession (...);
CREATE TABLE GuestQuestion (...);
CREATE TABLE GuestIssue (...);
```

### **Data Migration Strategy**

#### **Option 1: Fresh Start (Recommended)**
```bash
# Create completely new database
# Migrate only active cleaning customers
# Set up new contracts and billing
```

#### **Option 2: Selective Migration**
```sql
-- Migrate only relevant data
INSERT INTO rightfit_cleaning.public.tenant
SELECT * FROM rightfit_services.public.tenant
WHERE id IN (SELECT tenant_id FROM cleaning_services);

-- Migrate cleaning-specific customers
INSERT INTO rightfit_cleaning.public.customer
SELECT * FROM rightfit_services.public.customer
WHERE service_provider_id IN (cleaning_providers);
```

#### **Data Cleanup Tasks**
```sql
-- Remove maintenance/landlord references
DELETE FROM users WHERE role IN ('LANDLORD', 'MAINTENANCE_CONTRACTOR');
-- Clean up shared tables
UPDATE photos SET
  work_order_id = NULL,
  maintenance_job_id = NULL
WHERE work_order_id IS NOT NULL OR maintenance_job_id IS NOT NULL;
```

---

## 🚀 **Deployment Strategy**

### **Development Environment**
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./apps/api
    ports: ["3001:3001"]
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/rightfit_cleaning
      - JWT_SECRET=${JWT_SECRET}

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=rightfit_cleaning
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password

  cleaning-dashboard:
    build: ./apps/web-cleaning
    ports: ["5174:5174"]

  customer-portal:
    build: ./apps/web-customer
    ports: ["5176:5176"]

  worker-app:
    build: ./apps/web-worker
    ports: ["5178:5178"]
```

### **Production Deployment**
```bash
# Infrastructure
- AWS RDS PostgreSQL (Multi-AZ)
- AWS ECS for API
- AWS S3 for file storage
- AWS CloudFront for CDN
- AWS Route53 for DNS

# Monitoring
- CloudWatch logs and metrics
- Application Performance Monitoring
- Error tracking and alerting
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy RightFit Cleaning
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          docker build -t rightfit-cleaning .
          docker push $ECR_REGISTRY/rightfit-cleaning
          ecs update-service --service rightfit-cleaning
```

---

## 📱 **Mobile Strategy**

### **Progressive Web App (PWA) - Immediate**
```typescript
// Service Worker for offline functionality
// Push notifications support
// App-like experience on mobile devices
// Works in browser, no app store required
```

### **React Native App - Future Enhancement**
```typescript
// Native mobile app for workers
// Enhanced GPS and camera features
- Offline-first architecture
- Push notifications
- Background location tracking
- Native photo capture
- App store distribution
```

---

## 💰 **Financial Considerations**

### **Reduced Infrastructure Costs**
- **Database**: 1 PostgreSQL instance vs 2
- **API Servers**: 1 API service vs 2
- **File Storage**: Single S3 bucket
- **Monitoring**: Unified monitoring stack

### **Development Efficiency**
- **Single Codebase**: Focused on cleaning domain
- **Reduced Complexity**: No maintenance/landlord features to maintain
- **Faster Development**: No cross-service compatibility concerns

### **Revenue Opportunities**
- **Cleaning-as-a-Service**: Targeted marketing to cleaning businesses
- **White-label Solution**: License to other cleaning companies
- **Mobile App Premium**: Advanced features for worker app

---

## 🗓️ **Implementation Timeline**

### **Phase 1: Foundation (2-3 weeks)**
- [ ] Set up new repository structure
- [ ] Create new database schema
- [ ] Build core authentication system
- [ ] Develop basic API endpoints

### **Phase 2: Customer Management (2-3 weeks)**
- [ ] Customer portal frontend
- [ ] Property management features
- [ ] Service booking system
- [ ] Payment integration

### **Phase 3: Worker Management (2-3 weeks)**
- [ ] Worker mobile app
- [ ] Job scheduling and assignment
- [ ] Time tracking features
- [ ] GPS and navigation

### **Phase 4: Business Operations (2-3 weeks)**
- [ ] Cleaning management dashboard
- [ ] Invoicing and financial reporting
- [ ] Photo verification system
- [ ] Quality control features

### **Phase 5: Advanced Features (2-3 weeks)**
- [ ] Guest portal functionality
- [ ] Advanced reporting
- [ ] API integrations
- [ ] Mobile enhancements

### **Phase 6: Testing & Deployment (1-2 weeks)**
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

**Total Estimated Timeline: 11-17 weeks**

---

## ✅ **Success Metrics**

### **Technical Metrics**
- [ ] All 3 applications running independently
- [ ] Database schema with only cleaning-related tables
- [ ] API response time < 200ms
- [ ] 99.9% uptime
- [ ] Mobile app offline functionality

### **Business Metrics**
- [ ] Reduced infrastructure costs by 40%
- [ ] Faster feature development cycle
- [ ] Improved user experience for cleaning customers
- [ ] Enhanced worker productivity tools
- [ ] Successful customer migration

### **Quality Metrics**
- [ ] Zero data loss during migration
- [ ] All existing features preserved
- [ ] Improved security through focused scope
- [ ] Enhanced mobile experience
- [ ] Better customer support workflows

---

## 🚧 **Risk Assessment & Mitigation**

### **Technical Risks**
1. **Data Migration Complexity**
   - *Mitigation*: Use automated migration scripts, thorough testing
2. **API Compatibility Issues**
   - *Mitigation*: Version APIs, backward compatibility during transition
3. **Feature Parity**
   - *Mitigation*: Comprehensive feature audit, user acceptance testing

### **Business Risks**
1. **Customer Transition Disruption**
   - *Mitigation*: Phased rollout, dedicated support team
2. **Employee Adoption**
   - *Mitigation*: Training programs, gradual rollout
3. **Competitive Response**
   - *Mitigation*: Focus on unique value propositions, rapid iteration

---

## 🎯 **Next Steps**

1. **Stakeholder Approval**: Review and approve separation plan
2. **Repository Setup**: Create new repository structure
3. **Database Design**: Finalize cleaned database schema
4. **Team Assignment**: Allocate development resources
5. **Migration Planning**: Detailed data migration timeline
6. **Communication Plan**: Inform customers and employees

---

*This plan provides a comprehensive roadmap for creating a focused, efficient RightFit Cleaning Services platform that can better serve customers while reducing operational complexity and costs.*