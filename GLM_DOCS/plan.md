# RightFit Services: Maintenance & Cleaning Apps Separation Plan

## Executive Summary

This document outlines the comprehensive plan to separate the RightFit Services maintenance and cleaning web applications into independent services with their own dedicated resources, databases, and infrastructure.

## Current State

### Shared Architecture Overview
- **Database**: Single PostgreSQL database with 70+ shared tables
- **API Backend**: Combined Node.js/Express API serving both applications
- **Frontend**: Shared UI components and authentication systems
- **Infrastructure**: Monorepo structure with shared build and deployment pipelines

### Identified Coupling Points
1. **High Impact**:
   - Database layer (complete data sharing)
   - API backend (shared services and endpoints)
   - Authentication system (unified user management)

2. **Medium Impact**:
   - Shared UI components (@rightfit/ui-core)
   - Common utilities and services
   - Build and deployment infrastructure

3. **Low Impact**:
   - App-specific UI packages (@rightfit/ui-maintenance, @rightfit/ui-cleaning)
   - Individual routing and business logic

## Separation Strategy

### Phase 1: Database Separation (4-6 Sprints, 8-12 weeks)

**Objective**: Create separate database schemas for cleaning and maintenance services

#### Sprint 1: Database Schema Analysis & Migration Planning
- Analyze shared table dependencies and relationships
- Create database migration scripts for data separation
- Plan database provisioning for independent environments
- **Risk**: High - Data migration complexity
- **Dependencies**: Database access, analysis tools

#### Sprint 2: Core Tables Separation
- Separate authentication and user management tables
- Split customer and property data by service type
- Create dedicated worker tables for each service
- **Risk**: High - Data integrity concerns
- **Dependencies**: Sprint 1 completion

#### Sprint 3: Business Logic Tables Separation
- Separate job management tables (cleaning_jobs vs maintenance_jobs)
- Split contract management systems
- Migrate financial and reporting tables
- **Risk**: High - Business logic preservation
- **Dependencies**: Sprint 2 completion

#### Sprint 4: Data Validation & Testing
- Implement comprehensive data validation scripts
- Create test suites for separated databases
- Perform dry-run migrations and rollback procedures
- **Risk**: Medium - Testing thoroughness
- **Dependencies**: Sprint 3 completion

### Phase 2: API Backend Separation (3-4 Sprints, 6-8 weeks)

**Objective**: Create dedicated API backends for cleaning and maintenance services

#### Sprint 5: API Architecture Planning
- Design separate API specifications for each service
- Plan shared services for common functionality
- Create API versioning strategy for backward compatibility
- **Risk**: Medium - Architecture complexity
- **Dependencies**: Phase 1 completion

#### Sprint 6: Shared Services Extraction
- Create shared authentication microservice
- Extract notification and file upload services
- Implement common utilities and helpers
- **Risk**: Medium - Service coupling
- **Dependencies**: Sprint 5 completion

#### Sprint 7: Cleaning API Implementation
- Implement cleaning-specific API endpoints
- Integrate with cleaning database schema
- Update authentication to use shared service
- **Risk**: Medium - Feature parity
- **Dependencies**: Sprint 6 completion

#### Sprint 8: Maintenance API Implementation
- Implement maintenance-specific API endpoints
- Integrate with maintenance database schema
- Connect to shared authentication service
- **Risk**: Medium - Feature parity
- **Dependencies**: Sprint 7 completion

### Phase 3: Frontend Application Separation (2-3 Sprints, 4-6 weeks)

**Objective**: Update frontend applications to use dedicated backends

#### Sprint 9: Frontend Dependency Updates (Cleaning)
- Update cleaning app API client configuration
- Modify authentication flow for new API
- Update all API calls to use cleaning-specific endpoints
- **Risk**: Low - Breaking changes
- **Dependencies**: Sprint 8 completion

#### Sprint 10: Frontend Dependency Updates (Maintenance)
- Update maintenance app API client configuration
- Migrate maintenance-specific UI components
- Update routing for maintenance-only features
- **Risk**: Low - Breaking changes
- **Dependencies**: Sprint 9 completion

#### Sprint 11: Shared UI Components Refactoring
- Refactor shared components to be truly independent
- Create separate component packages for each service
- Update component dependencies and imports
- **Risk**: Low - Component dependency issues
- **Dependencies**: Sprint 10 completion

### Phase 4: Infrastructure & Deployment Separation (2 Sprints, 4 weeks)

**Objective**: Set up independent deployment and infrastructure

#### Sprint 12: Infrastructure Setup
- Create separate Docker configurations
- Set up independent deployment pipelines
- Configure monitoring and logging for each service
- **Risk**: Low - Infrastructure complexity
- **Dependencies**: Phase 3 completion

#### Sprint 13: Migration & Testing
- Perform production data migration
- Deploy separated APIs and frontend applications
- Conduct end-to-end testing of separated systems
- **Risk**: Medium - Production deployment
- **Dependencies**: Sprint 12 completion

### Phase 5: Optimization & Cleanup (1 Sprint, 2 weeks)

**Objective**: Final optimization and documentation

#### Sprint 14: Final Optimization
- Remove legacy shared dependencies
- Optimize database queries for each service
- Update documentation and deployment guides
- **Risk**: Low - Performance regression
- **Dependencies**: Sprint 13 completion

## Technical Implementation Details

### Database Separation Strategy

#### Shared Tables to Split
1. **Users & Authentication**
   - `users` → `cleaning_users`, `maintenance_users`
   - `tenants` → `cleaning_tenants`, `maintenance_tenants`
   - Shared authentication service for unified login

2. **Customer Management**
   - `customers` → Split by service type contracts
   - `customer_properties` → Separate by active service contracts

3. **Worker Management**
   - `workers` → Split by `worker_type` (CLEANER vs MAINTENANCE)
   - Handle `BOTH` type workers with shared profiles

4. **Job Management**
   - `cleaning_jobs` → Keep in cleaning database
   - `maintenance_jobs` → Move to maintenance database

5. **Financial & Contracts**
   - `cleaning_contracts` → Cleaning database
   - `maintenance_contracts` → Maintenance database
   - Financial transactions split by service type

### API Separation Strategy

#### Shared Services
1. **Authentication Service**
   - Unified login for both services
   - JWT token management
   - User session management

2. **Notification Service**
   - Email notifications
   - SMS notifications
   - Push notifications

3. **File Upload Service**
   - Photo management
   - Document uploads
   - Media processing

#### Service-Specific APIs
1. **Cleaning API**
   - Job management endpoints
   - Property calendar integration
   - Cleaning contract management
   - Checklist templates

2. **Maintenance API**
   - Work order management
   - Maintenance contracts
   - Quote and invoice generation
   - Contractor management

### Frontend Separation Strategy

#### Maintenance App Cleanup
- Remove cleaning-specific routes and components
- Update API client to use maintenance endpoints
- Remove shared cleaning dependencies

#### Cleaning App Cleanup
- Remove maintenance-specific functionality
- Update API client to use cleaning endpoints
- Optimize for cleaning workflows

## Risk Management

### High-Risk Areas
1. **Data Migration**
   - **Risk**: Data loss or corruption during migration
   - **Mitigation**: Comprehensive testing, backup strategies, rollback procedures

2. **Service Disruption**
   - **Risk**: Potential downtime during migration
   - **Mitigation**: Blue-green deployment, gradual migration, feature flags

3. **Feature Parity**
   - **Risk**: Missing functionality after separation
   - **Mitigation**: Comprehensive testing, user acceptance testing, feature audits

### Medium-Risk Areas
1. **Performance Impact**
   - **Risk**: Temporary performance degradation
   - **Mitigation**: Load testing, performance monitoring, optimization

2. **Integration Complexity**
   - **Risk**: Unexpected dependencies during separation
   - **Mitigation**: Dependency analysis, incremental separation, thorough testing

## Resource Requirements

### Development Team
- **Backend Developers**: 2-3 developers for API separation
- **Frontend Developers**: 2 developers for app migration
- **Database Specialists**: 1-2 specialists for data migration
- **DevOps Engineers**: 1-2 engineers for infrastructure
- **QA Engineers**: 2 testers for validation and testing

### Infrastructure Needs
- **Development Environments**: Separate dev/test environments
- **Database Resources**: Additional database instances
- **Monitoring Tools**: Enhanced monitoring and logging
- **Deployment Infrastructure**: CI/CD pipeline updates

## Success Metrics

### Technical Metrics
- **Database Separation**: 100% data integrity maintained
- **API Performance**: No more than 10% performance degradation
- **Uptime**: 99.9% availability during migration
- **Feature Parity**: 100% functionality preserved

### Business Metrics
- **User Experience**: No user-facing disruptions
- **Performance**: Improved response times for each service
- **Scalability**: Independent scaling capabilities achieved
- **Cost**: Optimized infrastructure costs

## Timeline

**Total Duration**: 14-16 Sprints (28-32 weeks)

- **Phase 1**: 8-12 weeks (Database Separation)
- **Phase 2**: 6-8 weeks (API Separation)
- **Phase 3**: 4-6 weeks (Frontend Separation)
- **Phase 4**: 4 weeks (Infrastructure Separation)
- **Phase 5**: 2 weeks (Optimization)

## Communication Plan

### Stakeholder Updates
- **Weekly**: Progress reports to project stakeholders
- **Bi-weekly**: Technical deep-dives with development team
- **Monthly**: Executive updates on project status and risks

### Documentation Updates
- **Real-time**: Update progress in stories.md
- **Sprint completion**: Update plan.md with completed items
- **Project completion**: Update root README.md with final architecture

---

*Last Updated: [Current Date]*
*Status: In Progress*