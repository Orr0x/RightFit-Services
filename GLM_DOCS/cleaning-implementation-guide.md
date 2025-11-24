# RightFit Cleaning Services - Implementation Guide

## 🚀 **Phase-by-Phase Implementation**

This guide provides detailed implementation steps, code examples, and migration scripts for each phase of the RightFit Cleaning Services separation.

---

## 📋 **Phase 1: Foundation Setup (Weeks 1-3)**

### **1.1 Repository Structure Creation**

```bash
# Create new repository
mkdir rightfit-cleaning
cd rightfit-cleaning

# Initialize monorepo structure
npm init -y
npm install -D turbo

# Create folder structure
mkdir -p apps/{api,web-cleaning,web-customer,web-worker}
mkdir -p packages/{shared,ui-components,database}
mkdir -p docker scripts docs
```

### **1.2 Root Package.json Configuration**

```json
{
  "name": "rightfit-cleaning",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "db:migrate": "cd apps/api && npm run db:migrate",
    "db:seed": "cd apps/api && npm run db:seed"
  },
  "devDependencies": {
    "turbo": "^1.13.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### **1.3 Turbo Configuration**

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "type-check": {}
  }
}
```

### **1.4 Database Schema Setup**

```prisma
// packages/database/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Core Foundation
model Tenant {
  id                String   @id @default(cuid())
  tenant_name       String
  subscription_status SubscriptionStatus @default(ACTIVE)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  users             User[]
  customers         Customer[]
  workers           Worker[]
  cleaning_jobs     CleaningJob[]
  cleaning_contracts CleaningContract[]

  @@map("tenants")
}

model User {
  id              String    @id @default(cuid())
  tenant_id       String
  email           String    @unique
  password_hash   String
  full_name       String
  role            UserRole  @default(MEMBER)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  last_login      DateTime?

  // Relations
  tenant          Tenant    @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  devices         Device[]
  notifications   Notification[]

  @@map("users")
}

model Device {
  id              String   @id @default(cuid())
  user_id         String
  device_token    String   @unique
  device_type     DeviceType
  is_active       Boolean  @default(true)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  // Relations
  user            User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("devices")
}

model Notification {
  id              String           @id @default(cuid())
  user_id         String
  title           String
  message         String
  type            NotificationType
  is_read         Boolean          @default(false)
  created_at      DateTime         @default(now())

  // Relations
  user            User             @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("notifications")
}

// Enums
enum SubscriptionStatus { ACTIVE INACTIVE SUSPENDED CANCELLED }
enum UserRole { ADMIN MEMBER CUSTOMER WORKER }
enum DeviceType { IOS ANDROID WEB }
enum NotificationType { INFO WARNING ERROR SUCCESS JOB BILLING SYSTEM }
```

### **1.5 API Foundation Setup**

```typescript
// apps/api/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5174'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'RightFit Cleaning API'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', authenticateToken, customerRoutes);
app.use('/api/v1/workers', authenticateToken, workerRoutes);
app.use('/api/v1/cleaning-jobs', authenticateToken, cleaningJobRoutes);

// Error handling
app.use(errorHandler);

export default app;
```

```typescript
// apps/api/src/server.ts
import app from './app';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 RightFit Cleaning API running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

---

## 📋 **Phase 2: Customer Management (Weeks 4-6)**

### **2.1 Customer Database Models**

```prisma
// Customer Management Models
model ServiceProvider {
  id                    String   @id @default(cuid())
  tenant_id             String
  business_name         String
  contact_email         String
  contact_phone         String?
  business_address      String?
  logo_url              String?
  is_active             Boolean  @default(true)
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  // Relations
  tenant                Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  customers             Customer[]
  workers               Worker[]
  cleaning_contracts    CleaningContract[]
  cleaning_quotes       CleaningQuote[]

  @@map("service_providers")
}

model Customer {
  id                    String   @id @default(cuid())
  tenant_id             String
  service_provider_id   String
  customer_type         CustomerType @default(INDIVIDUAL)
  business_name         String?
  contact_name          String
  email                 String
  phone                 String?
  billing_address       String?
  is_active             Boolean  @default(true)
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  // Relations
  tenant                Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  service_provider      ServiceProvider @relation(fields: [service_provider_id], references: [id], onDelete: Cascade)
  properties            CustomerProperty[]
  cleaning_jobs         CleaningJob[]
  cleaning_contracts    CleaningContract[]
  customer_preferences  CustomerPreferences?
  customer_notifications CustomerNotification[]

  @@map("customers")
}

model CustomerProperty {
  id                    String   @id @default(cuid())
  tenant_id             String
  customer_id           String
  property_name         String
  address_street        String
  address_city          String
  address_postcode      String
  address_country       String   @default("United Kingdom")
  property_type         PropertyType
  bedrooms              Int?
  bathrooms             Int?
  square_footage        Float?
  access_instructions   String?
  parking_available     Boolean  @default(true)
  key_storage_details   String?
  is_active             Boolean  @default(true)
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  // Relations
  tenant                Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  customer              Customer @relation(fields: [customer_id], references: [id], onDelete: Cascade)
  cleaning_jobs         CleaningJob[]
  property_calendar     PropertyCalendar[]
  property_checklists   PropertyChecklistTemplate[]
  guest_sessions        GuestSession[]

  @@map("customer_properties")
}

model CustomerPortalUser {
  id                    String   @id @default(cuid())
  customer_id           String
  email                 String
  password_hash         String
  full_name             String
  role                  CustomerPortalRole @default(USER)
  is_active             Boolean  @default(true)
  last_login            DateTime?
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  // Relations
  customer              Customer @relation(fields: [customer_id], references: [id], onDelete: Cascade)

  @@unique([customer_id, email])
  @@map("customer_portal_users")
}

// Enums
enum CustomerType { INDIVIDUAL BUSINESS CORPORATION }
enum PropertyType { APARTMENT HOUSE STUDIO OFFICE COMMERCIAL }
enum CustomerPortalRole { USER ADMIN MANAGER }
```

### **2.2 Customer API Implementation**

```typescript
// apps/api/src/controllers/CustomerController.ts
import { Request, Response } from 'express';
import { CustomerService } from '../services/CustomerService';
import { CreateCustomerDto, UpdateCustomerDto } from '../types/customer';

export class CustomerController {
  constructor(private customerService: CustomerService) {}

  async createCustomer(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenant_id;
      const serviceProviderId = req.user?.service_provider_id;

      const customerData: CreateCustomerDto = {
        ...req.body,
        tenant_id: tenantId,
        service_provider_id: serviceProviderId
      };

      const customer = await this.customerService.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCustomers(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenant_id;
      const { page = 1, limit = 50, search } = req.query;

      const customers = await this.customerService.getCustomers({
        tenant_id: tenantId,
        page: Number(page),
        limit: Number(limit),
        search: search as string
      });

      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCustomerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(id);

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

```typescript
// apps/api/src/services/CustomerService.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateCustomerDto, CustomerFilter } from '../types/customer';

export class CustomerService {
  constructor(private prisma: PrismaClient) {}

  async createCustomer(data: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ...data,
        customer_preferences: {
          create: {
            email_notifications: true,
            sms_notifications: false,
            job_reminders: true,
            payment_reminders: true
          }
        }
      },
      include: {
        customer_preferences: true,
        properties: true
      }
    });
  }

  async getCustomers(filters: CustomerFilter) {
    const { tenant_id, page, limit, search } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      tenant_id,
      is_active: true,
      ...(search && {
        OR: [
          { contact_name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { business_name: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer_preferences: true,
          properties: {
            where: { is_active: true },
            select: { id: true, property_name: true, address_city: true }
          },
          _count: {
            select: {
              cleaning_jobs: true,
              cleaning_contracts: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      this.prisma.customer.count({ where })
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getCustomerById(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        customer_preferences: true,
        properties: {
          where: { is_active: true },
          include: {
            property_calendar: {
              where: {
                event_date: { gte: new Date() },
                is_active: true
              },
              orderBy: { event_date: 'asc' }
            }
          }
        },
        cleaning_jobs: {
          where: {
            scheduled_date: { gte: new Date() }
          },
          take: 5,
          orderBy: { scheduled_date: 'asc' }
        }
      }
    });
  }
}
```

### **2.3 Customer Frontend Implementation**

```typescript
// apps/web-cleaning/src/components/customers/CustomerList.tsx
import React, { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(search && { search })
      });

      const response = await fetch(`/api/v1/customers?${params}`);
      const data = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CustomerListSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add Customer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Properties
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Jobs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerRow({ customer }: { customer: Customer }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {customer.business_name || customer.contact_name}
          </div>
          <div className="text-sm text-gray-500">
            {customer.customer_type.toLowerCase()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{customer.email}</div>
        <div className="text-sm text-gray-500">{customer.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{customer.properties.length}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {customer._count.cleaning_jobs} jobs
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {customer.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-3">
          View
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          Edit
        </button>
      </td>
    </tr>
  );
}

function CustomerListSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📋 **Phase 3: Worker Management (Weeks 7-9)**

### **3.1 Worker Database Models**

```prisma
// Worker Management Models
model Worker {
  id                      String   @id @default(cuid())
  tenant_id               String
  service_provider_id     String
  user_id                 String?  @unique
  first_name              String
  last_name               String
  email                   String
  phone                   String?
  address_street          String?
  address_city            String?
  address_postcode        String?
  address_country         String?  @default("United Kingdom")
  worker_type             WorkerType @default(CLEANER)
  employment_type         EmploymentType @default(FULL_TIME)
  hourly_rate             Decimal?
  is_active               Boolean  @default(true)
  max_weekly_hours        Int?     @default(40)
  employment_start_date   DateTime?
  date_of_birth           DateTime?
  ni_number               String?
  driving_licence_number  String?
  driving_licence_expiry  DateTime?
  bio                     String?
  skills                  String[]
  experience_years        Int?
  emergency_contact_name  String?
  emergency_contact_phone String?
  emergency_contact_relation String?
  jobs_completed          Int      @default(0)
  average_rating          Decimal? @default(0)
  photo_url               String?
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt

  // Relations
  tenant                  Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  service_provider        ServiceProvider @relation(fields: [service_provider_id], references: [id], onDelete: Cascade)
  user                    User?    @relation(fields: [user_id], references: [id])
  certificates            WorkerCertificate[]
  availability            WorkerAvailability[]
  cleaning_jobs           CleaningJob[]
  issue_reports           WorkerIssueReport[]
  history                 WorkerHistory[]

  @@map("workers")
}

model WorkerCertificate {
  id                      String   @id @default(cuid())
  worker_id               String
  certificate_type        CertificateType
  certificate_name        String
  certificate_number      String?
  issuing_authority       String?
  issue_date              DateTime?
  expiry_date             DateTime?
  certificate_url         String?
  is_active               Boolean  @default(true)
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt

  // Relations
  worker                  Worker   @relation(fields: [worker_id], references: [id], onDelete: Cascade)

  @@map("worker_certificates")
}

model WorkerAvailability {
  id                      String   @id @default(cuid())
  worker_id               String
  day_of_week             Int      // 0-6 (Sunday-Saturday)
  start_time              String   // HH:MM format
  end_time                String   // HH:MM format
  is_available            Boolean  @default(true)
  recurring               Boolean  @default(true)
  specific_date           DateTime?
  notes                   String?
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt

  // Relations
  worker                  Worker   @relation(fields: [worker_id], references: [id], onDelete: Cascade)

  @@unique([worker_id, day_of_week, start_time, end_time])
  @@map("worker_availability")
}

// Enums
enum WorkerType { CLEANER JANITOR HANDYMAN SPECIALIST }
enum EmploymentType { FULL_TIME PART_TIME CONTRACT FREELANCE }
enum CertificateType { SAFETY_TRAINING PROFESSIONAL_LICENSE BACKGROUND_CHECK DRIVING_LICENSE FIRST_AID }
```

### **3.2 Worker API Implementation**

```typescript
// apps/api/src/controllers/WorkerController.ts
import { Request, Response } from 'express';
import { WorkerService } from '../services/WorkerService';
import { CreateWorkerDto, UpdateWorkerDto } from '../types/worker';

export class WorkerController {
  constructor(private workerService: WorkerService) {}

  async createWorker(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenant_id;
      const serviceProviderId = req.user?.service_provider_id;

      const workerData: CreateWorkerDto = {
        ...req.body,
        tenant_id: tenantId,
        service_provider_id: serviceProviderId
      };

      const worker = await this.workerService.createWorker(workerData);
      res.status(201).json(worker);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getWorkers(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenant_id;
      const { page = 1, limit = 50, worker_type, is_active } = req.query;

      const workers = await this.workerService.getWorkers({
        tenant_id: tenantId,
        page: Number(page),
        limit: Number(limit),
        worker_type: worker_type as string,
        is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined
      });

      res.json(workers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getWorkerSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      const schedule = await this.workerService.getWorkerSchedule(id, {
        start_date: new Date(start_date as string),
        end_date: new Date(end_date as string)
      });

      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateWorkerAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const availabilityData = req.body;

      const availability = await this.workerService.updateWorkerAvailability(
        id,
        availabilityData
      );

      res.json(availability);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

### **3.3 Worker Mobile App Implementation**

```typescript
// apps/web-worker/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { WorkerJob } from '@/types/job';
import { useAuth } from '@/contexts/AuthContext';

export function WorkerDashboard() {
  const { user } = useAuth();
  const [todayJobs, setTodayJobs] = useState<WorkerJob[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<WorkerJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerJobs();
  }, []);

  const fetchWorkerJobs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [todayResponse, upcomingResponse] = await Promise.all([
        fetch(`/api/v1/workers/jobs?date=${today}`),
        fetch('/api/v1/workers/jobs?upcoming=true&limit=5')
      ]);

      const todayData = await todayResponse.json();
      const upcomingData = await upcomingResponse.json();

      setTodayJobs(todayData.jobs);
      setUpcomingJobs(upcomingData.jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.full_name || 'Worker'}!
        </h1>
        <p className="text-blue-100">
          {todayJobs.length > 0 ? `You have ${todayJobs.length} job(s) today` : 'No jobs scheduled for today'}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Today's Jobs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Today's Jobs</h2>
          {todayJobs.length > 0 ? (
            <div className="space-y-3">
              {todayJobs.map((job) => (
                <JobCard key={job.id} job={job} isToday={true} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No jobs today"
              description="Enjoy your day off! Check back for upcoming jobs."
              icon="calendar"
            />
          )}
        </section>

        {/* Upcoming Jobs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Upcoming Jobs</h2>
          {upcomingJobs.length > 0 ? (
            <div className="space-y-3">
              {upcomingJobs.map((job) => (
                <JobCard key={job.id} job={job} isToday={false} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming jobs"
              description="Your schedule is clear. Check back later for new assignments."
              icon="clock"
            />
          )}
        </section>
      </div>
    </div>
  );
}

function JobCard({ job, isToday }: { job: WorkerJob; isToday: boolean }) {
  const startTime = new Date(job.scheduled_date);
  const endTime = new Date(startTime.getTime() + job.estimated_duration * 60000);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{job.customer_name}</h3>
          <p className="text-sm text-gray-600">{job.property_address}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          job.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
          job.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
          job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {job.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex items-center text-sm text-gray-600 mb-3">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }} -
        {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>

      <div className="flex gap-2">
        {isToday && job.status === 'ASSIGNED' && (
          <>
            <button
              onClick={() => startJob(job.id)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Start Job
            </button>
            <button
              onClick={() => viewNavigation(job.property_address)}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Navigate
            </button>
          </>
        )}

        {job.status === 'IN_PROGRESS' && (
          <>
            <button
              onClick={() => completeJob(job.id)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Complete Job
            </button>
            <button
              onClick={() => reportIssue(job.id)}
              className="bg-red-100 text-red-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-200"
            >
              Report Issue
            </button>
          </>
        )}

        {!isToday && (
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200">
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-blue-600 p-6">
        <div className="h-8 bg-blue-500 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-blue-400 rounded w-1/2"></div>
      </div>
      <div className="p-6 space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        {icon === 'calendar' && (
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        {icon === 'clock' && (
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
```

---

## 📋 **Phase 4: Data Migration Scripts**

### **4.1 Database Creation Script**

```bash
#!/bin/bash
# scripts/create-database.sh

set -e

DB_NAME="rightfit_cleaning"
DB_USER="rightfit_user"
DB_PASSWORD="rightfit_password"
DB_HOST="localhost"

echo "🔧 Creating RightFit Cleaning database..."

# Create database
psql -h $DB_HOST -U postgres -c "CREATE DATABASE $DB_NAME;"

# Create user and grant permissions
psql -h $DB_HOST -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
psql -h $DB_HOST -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Grant schema permissions
psql -h $DB_HOST -U postgres -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
psql -h $DB_HOST -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
psql -h $DB_HOST -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

echo "✅ Database $DB_NAME created successfully!"
echo "📋 Connection string: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:5432/$DB_NAME"
```

### **4.2 Data Migration Script**

```typescript
// scripts/migrate-data.ts
import { PrismaClient } from '@prisma/client';
import { createClient } from '@prisma/client';

const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SOURCE_DATABASE_URL // Original RightFit Services DB
    }
  }
});

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TARGET_DATABASE_URL // New Cleaning DB
    }
  }
});

async function migrateCleaningData() {
  console.log('🚀 Starting data migration...');

  try {
    // 1. Migrate Tenants (only those with cleaning services)
    console.log('📋 Migrating tenants...');
    const cleaningTenants = await sourcePrisma.$queryRaw`
      SELECT DISTINCT t.*
      FROM tenants t
      INNER JOIN service_providers sp ON t.id = sp.tenant_id
      WHERE sp.service_type = 'CLEANING'
    `;

    for (const tenant of cleaningTenants) {
      await targetPrisma.tenant.create({
        data: tenant
      });
    }

    // 2. Migrate Service Providers (cleaning only)
    console.log('🏢 Migrating service providers...');
    const cleaningProviders = await sourcePrisma.serviceProvider.findMany({
      where: { service_type: 'CLEANING' }
    });

    await targetPrisma.serviceProvider.createMany({
      data: cleaningProviders.map(({ service_type, ...provider }) => provider)
    });

    // 3. Migrate Users (cleaning-related only)
    console.log('👥 Migrating users...');
    const cleaningUsers = await sourcePrisma.$queryRaw`
      SELECT DISTINCT u.*
      FROM users u
      INNER JOIN tenants t ON u.tenant_id = t.id
      INNER JOIN service_providers sp ON t.id = sp.tenant_id
      WHERE sp.service_type = 'CLEANING'
      AND u.role IN ('ADMIN', 'MEMBER', 'CUSTOMER', 'WORKER')
    `;

    for (const user of cleaningUsers) {
      await targetPrisma.user.create({
        data: user
      });
    }

    // 4. Migrate Customers
    console.log('👤 Migrating customers...');
    const customers = await sourcePrisma.customer.findMany({
      where: {
        service_provider: {
          service_type: 'CLEANING'
        }
      },
      include: {
        customer_preferences: true,
        customer_portal_users: true
      }
    });

    for (const customer of customers) {
      const { customer_preferences, customer_portal_users, ...customerData } = customer;

      const newCustomer = await targetPrisma.customer.create({
        data: {
          ...customerData,
          customer_preferences: customer_preferences ? {
            create: customer_preferences
          } : undefined
        }
      });

      // Migrate portal users
      if (customer_portal_users.length > 0) {
        await targetPrisma.customerPortalUser.createMany({
          data: customer_portal_users.map(user => ({
            ...user,
            customer_id: newCustomer.id
          }))
        });
      }
    }

    // 5. Migrate Properties
    console.log('🏠 Migrating customer properties...');
    const properties = await sourcePrisma.customerProperty.findMany({
      where: {
        customer: {
          service_provider: {
            service_type: 'CLEANING'
          }
        }
      }
    });

    await targetPrisma.customerProperty.createMany({
      data: properties
    });

    // 6. Migrate Workers
    console.log('👷 Migrating workers...');
    const workers = await sourcePrisma.worker.findMany({
      where: {
        worker_type: 'CLEANER',
        service_provider: {
          service_type: 'CLEANING'
        }
      },
      include: {
        certificates: true,
        availability: true
      }
    });

    for (const worker of workers) {
      const { certificates, availability, ...workerData } = worker;

      const newWorker = await targetPrisma.worker.create({
        data: workerData
      });

      // Migrate certificates
      if (certificates.length > 0) {
        await targetPrisma.workerCertificate.createMany({
          data: certificates.map(cert => ({
            ...cert,
            worker_id: newWorker.id
          }))
        });
      }

      // Migrate availability
      if (availability.length > 0) {
        await targetPrisma.workerAvailability.createMany({
          data: availability.map(avail => ({
            ...avail,
            worker_id: newWorker.id
          }))
        });
      }
    }

    // 7. Migrate Cleaning Jobs
    console.log('🧹 Migrating cleaning jobs...');
    const cleaningJobs = await sourcePrisma.cleaningJob.findMany({
      where: {
        service: {
          service_provider: {
            service_type: 'CLEANING'
          }
        }
      },
      include: {
        timesheets: true
      }
    });

    for (const job of cleaningJobs) {
      const { timesheets, ...jobData } = job;

      const newJob = await targetPrisma.cleaningJob.create({
        data: jobData
      });

      // Migrate timesheets
      if (timesheets.length > 0) {
        await targetPrisma.cleaningJobTimesheet.createMany({
          data: timesheets.map(timesheet => ({
            ...timesheet,
            cleaning_job_id: newJob.id
          }))
        });
      }
    }

    // 8. Migrate Services
    console.log('🛠️ Migrating services...');
    const services = await sourcePrisma.service.findMany({
      where: {
        service_type: 'CLEANING',
        service_provider: {
          service_type: 'CLEANING'
        }
      }
    });

    await targetPrisma.service.createMany({
      data: services
    });

    console.log('✅ Data migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateCleaningData()
    .then(() => {
      console.log('🎉 Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export { migrateCleaningData };
```

### **4.3 Environment Setup Script**

```bash
#!/bin/bash
# scripts/setup-environment.sh

set -e

echo "🔧 Setting up RightFit Cleaning Services environment..."

# Copy environment template
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📄 Created .env file from template"
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Seed database with initial data
echo "🌱 Seeding database..."
npm run db:seed

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build all packages
echo "🏗️ Building packages..."
npm run build

echo "✅ Environment setup completed!"
echo ""
echo "🚀 To start development:"
echo "  npm run dev     # Start all applications"
echo "  npm run dev:api # Start only API server"
echo "  npm run dev:web # Start only web applications"
```

---

## 🚀 **Deployment Configuration**

### **Docker Configuration**

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Install Prisma CLI
RUN npx prisma version

# Copy built application
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://rightfit_user:rightfit_password@postgres:5432/rightfit_cleaning
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=rightfit_cleaning
      - POSTGRES_USER=rightfit_user
      - POSTGRES_PASSWORD=rightfit_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rightfit_user -d rightfit_cleaning"]
      interval: 10s
      timeout: 5s
      retries: 5

  cleaning-dashboard:
    build:
      context: ./apps/web-cleaning
      dockerfile: Dockerfile
    ports:
      - "5174:80"
    environment:
      - VITE_API_URL=http://localhost:3001
    restart: unless-stopped

  customer-portal:
    build:
      context: ./apps/web-customer
      dockerfile: Dockerfile
    ports:
      - "5176:80"
    environment:
      - VITE_API_URL=http://localhost:3001
    restart: unless-stopped

  worker-app:
    build:
      context: ./apps/web-worker
      dockerfile: Dockerfile
    ports:
      - "5178:80"
    environment:
      - VITE_API_URL=http://localhost:3001
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
      - cleaning-dashboard
      - customer-portal
      - worker-app
    restart: unless-stopped

volumes:
  postgres_data:
```

### **CI/CD Pipeline**

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test_db

      - name: Build applications
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to production
        run: |
          # Add your deployment logic here
          echo "Deploying to production..."
          # docker build -t rightfit-cleaning .
          # docker push $ECR_REGISTRY/rightfit-cleaning
          # Update ECS service, etc.
```

---

This comprehensive implementation guide provides detailed step-by-step instructions, code examples, and configuration files for successfully separating the RightFit Cleaning Services into an independent project. Each phase builds upon the previous one, ensuring a smooth and organized migration process.