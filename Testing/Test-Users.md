# RightFit Services - Test Users

**Last Updated**: November 7, 2025
**Database**: PostgreSQL (Docker, Port 5433)
**Total Tenants**: 6
**Total Users**: 14
**Total Service Providers**: 3 (1 original + 2 test)
**Total Workers**: 5 (3 original + 2 test)
**Total Contractors**: 5 (3 original + 2 test)
**Total Customers**: 3 (1 original + 2 test)

**See Also**: [Database Tables Documentation](DB/database-tables-2025-11-07_12-30-00.md)

---

## Important Notes

⚠️ **User vs Worker/Customer/Contractor Tables**:
- **User table**: Authentication accounts (login credentials) - 14 records
- **Worker table**: Worker/employee profiles linked to Service Providers - 5 records
- **Contractor table**: Contractor profiles linked to Tenants - 5 records
- **Customer table**: Customer business records linked to Service Providers - 3 records

**Complete Testing Architecture**:
✅ **Test Users** (User table) can now login and authenticate
✅ **Worker Profiles** link User accounts to Service Provider workers (cleaning staff)
✅ **Contractor Profiles** link User accounts to maintenance contractors
✅ **Customer Records** represent business clients of Service Providers
✅ **Cross-Tenant Workflows** can be tested (cleaning → maintenance escalation)

**Special Test Case**: `kerradeth@gmail.com` has BOTH a User account AND a Worker profile - perfect for testing the dual-account workflow where a person can login (User) and also be assigned jobs (Worker).

---

## Standard Test Password

**All test users** (unless otherwise noted) use the following password:

```
TestPassword123!
```

---

## Quick Reference Table

| Email | Name | Role | Tenant | Purpose |
|-------|------|------|--------|---------|
| admin@cleaningco.test | Sarah Johnson | ADMIN | CleanCo Services (Test) | Cleaning admin |
| manager@cleaningco.test | Mike Thompson | ADMIN | CleanCo Services (Test) | Cleaning manager |
| worker1@cleaningco.test | Maria Garcia | MEMBER | CleanCo Services (Test) | Cleaning worker |
| worker2@cleaningco.test | John Smith | MEMBER | CleanCo Services (Test) | Cleaning worker |
| admin@maintenance.test | Robert Davis | ADMIN | FixIt Maintenance (Test) | Maintenance admin |
| contractor1@maintenance.test | Carlos Rodriguez | MEMBER | FixIt Maintenance (Test) | Maintenance contractor |
| contractor2@maintenance.test | Lisa Anderson | MEMBER | FixIt Maintenance (Test) | Maintenance contractor |
| owner@business.test | David Williams | ADMIN | ABC Properties LLC (Test) | Property owner |
| manager@business.test | Jennifer Brown | ADMIN | ABC Properties LLC (Test) | Property manager |
| assistant@business.test | Emily Chen | MEMBER | ABC Properties LLC (Test) | Assistant |
| jamesrobins9@gmail.com | James Lee Robins | ADMIN | Rightfit | Development/Testing |
| test2@rightfit.com | James Lee Robins | ADMIN | AI researcher | Development/Testing |
| test@rightfit.com | Test User | ADMIN | Test User | Development/Testing |
| kerradeth@gmail.com | kerry robins | MEMBER | AI researcher | Development/Testing |

---

## Tenants

### 1. CleanCo Services (Test)
**Tenant ID**: `tenant-cleaning-test`
**Type**: Cleaning Service Provider
**Subscription**: ACTIVE
**Purpose**: Testing cleaning service workflows

**Users**:
- **Admin**: admin@cleaningco.test (Sarah Johnson)
- **Manager**: manager@cleaningco.test (Mike Thompson)
- **Worker**: worker1@cleaningco.test (Maria Garcia)
- **Worker**: worker2@cleaningco.test (John Smith)

### 2. FixIt Maintenance (Test)
**Tenant ID**: `tenant-maintenance-test`
**Type**: Maintenance Service Provider
**Subscription**: ACTIVE
**Purpose**: Testing maintenance service workflows

**Users**:
- **Admin**: admin@maintenance.test (Robert Davis)
- **Contractor**: contractor1@maintenance.test (Carlos Rodriguez)
- **Contractor**: contractor2@maintenance.test (Lisa Anderson)

### 3. ABC Properties LLC (Test)
**Tenant ID**: `tenant-customer-test`
**Type**: Customer/Property Owner
**Subscription**: ACTIVE
**Purpose**: Testing customer/landlord workflows

**Users**:
- **Owner**: owner@business.test (David Williams)
- **Manager**: manager@business.test (Jennifer Brown)
- **Assistant**: assistant@business.test (Emily Chen)

### 4. Rightfit (Production)
**Tenant ID**: `ee9deaf5-a08a-49e2-be8b-9b0943e54c1e`
**Type**: Development
**Subscription**: TRIAL
**Purpose**: Development and testing

**Users**:
- **Admin**: jamesrobins9@gmail.com (James Lee Robins)

### 5. AI researcher
**Tenant ID**: `b3f0c957-0aa6-47d4-a104-e7da43897572`
**Type**: Development
**Subscription**: TRIAL
**Purpose**: Development and testing

**Users**:Cleaning Portal 5174
- **Admin**: test2@rightfit.com (James Lee Robins)
- **Member**: kerradeth@gmail.com (kerry robins)

### 6. Test User
**Tenant ID**: `661b7002-2579-45ae-a46b-cc4a7b72fc76`
**Type**: Development
**Subscription**: TRIAL
**Purpose**: Development and testing

**Users**:
- **Admin**: test@rightfit.com (Test User)

---

## Test User Details

### Cleaning Service Provider Users

#### Admin: Sarah Johnson
```
Email: admin@cleaningco.test
Password: TestPassword123!
Role: ADMIN
Tenant: CleanCo Services (Test)
Tenant ID: tenant-cleaning-test
```
**Use Case**: Full administrative access to cleaning service provider portal. Can manage properties, schedule jobs, assign workers, manage contracts, view reports.

#### Manager: Mike Thompson
```
Email: manager@cleaningco.test
Password: TestPassword123!
Role: ADMIN
Tenant: CleanCo Services (Test)
Tenant ID: tenant-cleaning-test
```
**Use Case**: Secondary admin for testing multi-admin scenarios and permissions.

#### Worker: Maria Garcia
```
Email: worker1@cleaningco.test
Password: TestPassword123!
Role: MEMBER
Tenant: CleanCo Services (Test)
Tenant ID: tenant-cleaning-test
```
**Use Case**: Cleaning worker testing - view assigned jobs, complete checklists, upload photos, report issues.

#### Worker: John Smith
```
Email: worker2@cleaningco.test
Password: TestPassword123!
Role: MEMBER
Tenant: CleanCo Services (Test)
Tenant ID: tenant-cleaning-test
```
**Use Case**: Additional worker for testing worker assignment, scheduling conflicts, and multiple workers on same job.

---

### Maintenance Service Provider Users

#### Admin: Robert Davis
```
Email: admin@maintenance.test
Password: TestPassword123!
Role: ADMIN
Tenant: FixIt Maintenance (Test)
Tenant ID: tenant-maintenance-test
```
**Use Case**: Full administrative access to maintenance service provider portal. Can manage maintenance jobs, contractors, quotes, invoices.

#### Contractor: Carlos Rodriguez
```
Email: contractor1@maintenance.test
Password: TestPassword123!
Role: MEMBER
Tenant: FixIt Maintenance (Test)
Tenant ID: tenant-maintenance-test
```
**Use Case**: Maintenance contractor testing - view assigned jobs, generate quotes, update job status, upload completion photos.

#### Contractor: Lisa Anderson
```
Email: contractor2@maintenance.test
Password: TestPassword123!
Role: MEMBER
Tenant: FixIt Maintenance (Test)
Tenant ID: tenant-maintenance-test
```
**Use Case**: Additional contractor for testing assignment scenarios and multi-contractor workflows.

---

### Customer/Property Owner Users

#### Owner: David Williams
```
Email: owner@business.test
Password: TestPassword123!
Role: ADMIN
Tenant: ABC Properties LLC (Test)
Tenant ID: tenant-customer-test
```
**Use Case**: Property owner testing - manage properties, view service requests, approve maintenance quotes, review cleaning reports.

#### Manager: Jennifer Brown
```
Email: manager@business.test
Password: TestPassword123!
Role: ADMIN
Tenant: ABC Properties LLC (Test)
Tenant ID: tenant-customer-test
```
**Use Case**: Property manager testing - delegate property management, coordinate with service providers.

#### Assistant: Emily Chen
```
Email: assistant@business.test
Password: TestPassword123!
Role: MEMBER
Tenant: ABC Properties LLC (Test)
Tenant ID: tenant-customer-test
```
**Use Case**: Limited access testing - view properties and requests but limited administrative functions.

---

## Worker Profiles

Workers are linked to Service Providers and can be assigned to cleaning jobs. Test workers are linked to User accounts for complete login → job assignment → completion workflow testing.

### Worker: Maria Garcia (Test Worker 1)
```
Worker ID: worker-maria-garcia
Email: worker1@cleaningco.test
Phone: +44 7700 555111
User Account: Linked (can login as worker1@cleaningco.test)
Service Provider: CleanCo Services
```
**Profile**:
- Type: CLEANER
- Employment: FULL_TIME
- Hourly Rate: £12.50
- Experience: 3 years
- Skills: Deep Cleaning, Window Cleaning, Carpet Cleaning
- Bio: Experienced cleaner specializing in residential and commercial properties.

**Testing Use**:
- Login as worker1@cleaningco.test → view assigned cleaning jobs
- Complete checklists and upload photos
- Report issues during cleaning
- Test worker schedule and availability features

### Worker: John Smith (Test Worker 2)
```
Worker ID: worker-john-smith
Email: worker2@cleaningco.test
Phone: +44 7700 555222
User Account: Linked (can login as worker2@cleaningco.test)
Service Provider: CleanCo Services
```
**Profile**:
- Type: CLEANER
- Employment: PART_TIME
- Hourly Rate: £11.50
- Experience: 1 year
- Skills: General Cleaning, Kitchen Cleaning, Bathroom Cleaning
- Bio: Reliable part-time cleaner with attention to detail.

**Testing Use**:
- Login as worker2@cleaningco.test → view assigned jobs
- Test multiple workers on same job
- Test scheduling conflicts
- Part-time worker availability testing

### Worker: kerry robins (Original Worker - DUAL ACCOUNT)
```
Worker ID: (original)
Email: kerradeth@gmail.com
Phone: 07710536803
User Account: Linked (can login as kerradeth@gmail.com)
Service Provider: RightFit Services
```
**Profile**:
- Type: CLEANER
- Employment: (original data)
- User Role: MEMBER in "AI researcher" tenant

**Special Test Case**: This worker has BOTH a User account (kerradeth@gmail.com) AND a Worker profile with the same email. This tests the dual-account workflow:
- User can login to the system
- User profile is also a Worker who can be assigned jobs
- Tests the link between authentication (User) and business data (Worker)

See [Special Test Cases](#special-test-cases-kerradethgmailcom) section below for detailed testing scenarios.

### Worker: Sarah Morrison (Original Worker)
```
Email: sarah@rightfit-services.co.uk
Phone: +44 7700 123456
Service Provider: RightFit Services
```
**Profile**:
- Type: CLEANER
- Status: Active
- Original production/development data

### Worker: Mike Thompson (Original Worker)
```
Email: mike@rightfit-services.co.uk
Phone: +44 7700 234567
Service Provider: RightFit Services
```
**Profile**:
- Type: MAINTENANCE
- Status: Active
- Original production/development data

---

## Contractor Profiles

Contractors are linked to Tenants (not Service Providers) and handle maintenance work orders. Test contractors are linked to User accounts for complete workflow testing.

### Contractor: Carlos Rodriguez (Test Contractor 1)
```
Contractor ID: contractor-carlos-rodriguez
Name: Carlos Rodriguez
Email: contractor1@maintenance.test
Phone: +44 7700 666111
User Account: Linked (can login as contractor1@maintenance.test)
Tenant: FixIt Maintenance (Test)
```
**Profile**:
- Trade: Plumbing
- Company: Rodriguez Plumbing & Electrical
- Notes: Multi-skilled contractor with 10 years experience. Specialties: Plumbing, Electrical, General Repairs.

**Testing Use**:
- Login as contractor1@maintenance.test → view assigned maintenance work orders
- Generate quotes for maintenance jobs
- Update job status and upload completion photos
- Test contractor availability and scheduling

### Contractor: Lisa Anderson (Test Contractor 2)
```
Contractor ID: contractor-lisa-anderson
Name: Lisa Anderson
Email: contractor2@maintenance.test
Phone: +44 7700 666222
User Account: Linked (can login as contractor2@maintenance.test)
Tenant: FixIt Maintenance (Test)
```
**Profile**:
- Trade: HVAC
- Company: Anderson HVAC Services
- Notes: Specialist in HVAC systems and appliance repairs. Also handles carpentry work.

**Testing Use**:
- Login as contractor2@maintenance.test → view work orders
- Test multiple contractors assignment
- HVAC-specific workflow testing
- Emergency callout testing

### Contractors: jim, test (Original Contractors)
```
Multiple "jim" and "test" contractor records in various tenants
Original production/development data
```

---

## Customer Profiles

Customers are business clients of Service Providers. They represent landlords, property managers, etc. who hire cleaning/maintenance services.

### Customer: ABC Properties LLC (Cleaning Services)
```
Customer Number: CUST-TEST-001
Business Name: ABC Properties LLC
Contact: David Williams (owner@business.test)
Email: owner@business.test
Phone: +44 7700 777111
Service Provider: CleanCo Services
```
**Profile**:
- Customer Type: LANDLORD
- Address: 789 Business Park, London, E1 1AA, United Kingdom
- Linked User Account: owner@business.test (can login as property owner)

**Testing Use**:
- Represents the client who books cleaning services
- Properties can be assigned to this customer
- Cleaning jobs link to this customer record
- Test cleaning contract management

### Customer: ABC Properties LLC - Maintenance (Maintenance Services)
```
Customer Number: CUST-TEST-002
Business Name: ABC Properties LLC - Maintenance
Contact: Jennifer Brown (manager@business.test)
Email: manager@business.test
Phone: +44 7700 777222
Service Provider: FixIt Maintenance
```
**Profile**:
- Customer Type: PROPERTY_MANAGEMENT
- Address: 789 Business Park, London, E1 1AA, United Kingdom
- Linked User Account: manager@business.test (can login as property manager)

**Testing Use**:
- Represents the client who books maintenance services
- Test maintenance job workflow
- Cross-tenant workflow: cleaning issue → maintenance escalation
- Property management features

### Customer: Highland Haven Lodges (Original Customer)
```
Customer Number: (original)
Business Name: Highland Haven Lodges
Contact: Emma Henderson
Email: emma@highlandhaven.co.uk
Phone: +44 1479 123456
Service Provider: RightFit Services
```
**Profile**:
- Original production/development data
- Linked to original RightFit Services provider

---

## Special Test Cases: kerradeth@gmail.com

**Dual Account Architecture**: This account demonstrates how a person can have both authentication credentials (User table) AND business profile data (Worker table).

### Account Details
```
User Account:
  - Email: kerradeth@gmail.com
  - Name: kerry robins
  - Role: MEMBER
  - Tenant: AI researcher
  - Password: TestPassword123!

Worker Profile:
  - Email: kerradeth@gmail.com
  - Name: kerry robins
  - Type: CLEANER
  - Phone: 07710536803
  - Service Provider: RightFit Services
```

### Test Scenarios for kerradeth@gmail.com

#### Scenario 1: Login and Profile Access
```
1. Login with kerradeth@gmail.com / TestPassword123!
2. System authenticates against User table
3. System loads Worker profile based on email match
4. User sees worker dashboard with assigned jobs
5. Verify user can access both User settings and Worker profile
```

#### Scenario 2: Job Assignment to Dual Account
```
1. Admin assigns cleaning job to worker "kerry robins"
2. Worker record (kerradeth@gmail.com) receives job assignment
3. User logs in as kerradeth@gmail.com
4. User sees assigned job in their dashboard
5. Test notification system for assigned jobs
```

#### Scenario 3: Worker App Usage
```
1. Login to Worker mobile app as kerradeth@gmail.com
2. View assigned cleaning jobs
3. Complete checklist items
4. Upload before/after photos
5. Mark job as complete
6. Verify job completion updates in admin dashboard
```

#### Scenario 4: Cross-Tenant Access Control
```
1. Login as kerradeth@gmail.com (AI researcher tenant)
2. Attempt to access CleanCo Services tenant data
3. Verify proper tenant isolation (should fail)
4. Attempt to access other tenant's workers
5. Verify user can only access their own tenant's data
```

#### Scenario 5: User-Worker Data Consistency
```
1. Update User profile (name, email, phone)
2. Check if Worker profile reflects changes
3. Update Worker profile (skills, availability)
4. Verify User account remains linked
5. Test data synchronization between User and Worker tables
```

#### Scenario 6: Permissions and Role Testing
```
1. Login as kerradeth@gmail.com (MEMBER role)
2. Verify limited access (cannot access admin features)
3. Can view assigned jobs
4. Can update own profile
5. Cannot manage other workers
6. Cannot access billing or admin settings
```

---

## Testing Scenarios

### Scenario 1: Cleaning Job Workflow
1. **Login as**: admin@cleaningco.test
2. **Create**: New cleaning job for a property
3. **Assign**: worker1@cleaningco.test to the job
4. **Switch to**: worker1@cleaningco.test
5. **Complete**: Job checklist and upload photos
6. **Verify**: Job completion as admin

### Scenario 2: Maintenance Request Workflow
1. **Login as**: owner@business.test
2. **Report**: Maintenance issue
3. **Switch to**: admin@maintenance.test
4. **Assign**: contractor1@maintenance.test
5. **Switch to**: contractor1@maintenance.test
6. **Generate**: Quote and complete job

### Scenario 3: Cross-Tenant Isolation
1. **Login as**: admin@cleaningco.test
2. **Attempt**: Access maintenance tenant data (should fail)
3. **Verify**: Proper tenant isolation

### Scenario 4: Multi-User Permissions
1. **Login as**: ADMIN user
2. **Verify**: Full access to all features
3. **Login as**: MEMBER user
4. **Verify**: Limited access based on role

---

## Database Connection

```bash
# PostgreSQL Connection String
DATABASE_URL="postgresql://rightfit_user:rightfit_dev_password@localhost:5433/rightfit_dev?schema=public"

# Connect via psql (if available)
PGPASSWORD=rightfit_dev_password psql -h localhost -p 5433 -U rightfit_user -d rightfit_dev

# View users
SELECT email, full_name, role FROM users ORDER BY role, email;

# View tenants
SELECT id, tenant_name, subscription_status FROM "Tenant" ORDER BY tenant_name;
```

---

## Scripts

### Query All Test Data (Users, Workers, Contractors, Customers, Service Providers)
```bash
node scripts/query-all-test-data.js
```

### Query Test Users Only
```bash
node scripts/query-test-users.js
```

### Create Test Users (Authentication Accounts)
```bash
node scripts/create-test-users.js
```

### Create Test Workers, Contractors, and Customers
```bash
node scripts/create-test-workers-customers.js
```

**Note**: Run `create-test-users.js` first to create User accounts, then run `create-test-workers-customers.js` to create the linked Worker/Contractor/Customer profiles.

### Reset Test Users (if needed)
```bash
# Delete all test tenant users
DATABASE_URL="postgresql://rightfit_user:rightfit_dev_password@localhost:5433/rightfit_dev?schema=public" \
npx prisma studio

# Or use SQL
DELETE FROM users WHERE tenant_id IN ('tenant-cleaning-test', 'tenant-maintenance-test', 'tenant-customer-test');
DELETE FROM "Tenant" WHERE id IN ('tenant-cleaning-test', 'tenant-maintenance-test', 'tenant-customer-test');
```

---

## Security Notes

� **Important**:
- These are **development/test users only**
- Never use these credentials in production
- All test users use the same password for convenience
- Test tenants are clearly labeled with "(Test)" suffix
- Production database should have different, secure credentials

---

## Maintenance

### Adding New Test Users

1. Edit `scripts/create-test-users.js`
2. Add new user to `testUsers` array:
```javascript
{
  email: 'newuser@example.test',
  full_name: 'New User Name',
  role: 'ADMIN', // or 'MEMBER'
  tenant_id: 'tenant-id-here'
}
```
3. Run script: `node scripts/create-test-users.js`
4. Update this documentation

### Verifying Test Users

```bash
# Quick verification
DATABASE_URL="postgresql://rightfit_user:rightfit_dev_password@localhost:5433/rightfit_dev?schema=public" \
node scripts/query-test-users.js
```

---

## Common Issues

### Cannot Connect to Database
- Verify Docker container is running: `docker ps`
- Check port 5433 is not in use: `lsof -i :5433`
- Verify credentials in `.env` file

### User Already Exists
- Test users use `upsert` so re-running script is safe
- If you need to reset a user, delete and recreate

### Password Not Working
- Default password: `TestPassword123!`
- Passwords are hashed with bcrypt (10 rounds)
- Check if password was changed during testing

---

**Last Updated**: November 7, 2025
**Maintained By**: Development Team
**Location**: `/Testing/Test-Users.md`
