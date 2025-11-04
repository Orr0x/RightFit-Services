# Property History Implementation Plan

## 🎯 Goal
Create a comprehensive activity timeline for each property showing:
- Property data edits/updates
- All cleaning jobs (scheduled, started, completed)
- All maintenance work
- Contract renewals and changes
- Certificate uploads and expirations

---

## ✅ Completed So Far

### 1. **Database Schema** (DONE)
Created `PropertyHistory` table with relation to `Property`:
- `property_history` table
- `PropertyHistoryChangeType` enum with 24+ event types
- Indexed for fast lookups
- Cascade delete protection

### 2. **PropertyHistoryService** (DONE)
Comprehensive service with methods for:
- ✅ Property creation/updates
- ✅ Cleaning job events (scheduled, started, completed)
- ✅ Maintenance job events (created, completed)
- ✅ Contract events (created, renewed)
- ✅ Certificate events (uploaded, expiring, expired)

---

## 🔄 Integration Needed

The service is ready, but needs to be integrated into existing services:

### **Priority 1: Core Property Events**

#### A. Property Creation/Updates
**File**: `apps/api/src/services/PropertiesService.ts`
**Methods**: `create()`, `update()`
**Add**:
```typescript
import { PropertyHistoryService } from './PropertyHistoryService';

class PropertiesService {
  private historyService = new PropertyHistoryService();

  async create(...) {
    const property = await prisma.property.create(...);
    await this.historyService.recordPropertyCreated(property.id, property.name);
    return property;
  }
}
```

### **Priority 2: Cleaning Job Events**

#### B. Cleaning Jobs Service
**File**: `apps/api/src/services/CleaningJobsService.ts`
**Events to Track**:
1. **Job Created** → `recordCleaningJobScheduled()`
2. **Job Started** → `recordCleaningJobStarted()`
3. **Job Completed** → `recordCleaningJobCompleted()`

**Integration Example**:
```typescript
import { PropertyHistoryService } from './PropertyHistoryService';

class CleaningJobsService {
  private propertyHistoryService = new PropertyHistoryService();

  async create(input) {
    const job = await prisma.cleaningJob.create({ data });

    // Record in property history
    await this.propertyHistoryService.recordCleaningJobScheduled(
      job.property_id,
      job.id,
      job.scheduled_date,
      job.assigned_worker?.first_name + ' ' + job.assigned_worker?.last_name
    ).catch(console.error);

    return job;
  }

  async startJob(id, workerId) {
    // ... existing logic
    await this.propertyHistoryService.recordCleaningJobStarted(
      job.property_id,
      job.id,
      worker.first_name + ' ' + worker.last_name
    ).catch(console.error);
  }

  async completeJob(id) {
    // ... existing logic
    await this.propertyHistoryService.recordCleaningJobCompleted(
      job.property_id,
      job.id,
      worker.first_name + ' ' + worker.last_name
    ).catch(console.error);
  }
}
```

### **Priority 3: Maintenance Job Events**

#### C. Maintenance Jobs Service
**File**: `apps/api/src/services/MaintenanceJobsService.ts`
**Events to Track**:
1. **Job Created** → `recordMaintenanceJobCreated()`
2. **Job Completed** → `recordMaintenanceJobCompleted()`

**Integration Example**:
```typescript
import { PropertyHistoryService } from './PropertyHistoryService';

class MaintenanceJobsService {
  private propertyHistoryService = new PropertyHistoryService();

  async create(input) {
    const job = await prisma.maintenanceJob.create({ data });

    // Record in property history
    await this.propertyHistoryService.recordMaintenanceJobCreated(
      job.property_id,
      job.id,
      job.title,
      job.priority
    ).catch(console.error);

    return job;
  }
}
```

### **Priority 4: Contract & Certificate Events**

#### D. Contract Service
**File**: `apps/api/src/services/CleaningContractService.ts` (if exists)
**Events**: Contract created, renewed, cancelled

#### E. Certificate Service
**File**: `apps/api/src/services/CertificatesService.ts` (if exists)
**Events**: Certificate uploaded, expiring, expired

---

## 🎨 Frontend Components

### **PropertyHistoryTimeline Component**
Similar to `JobHistoryTimeline` but for properties:

```typescript
<PropertyHistoryTimeline propertyId={property.id} />
```

**Features**:
- 🏠 Property events (created, updated)
- 🧹 Cleaning events (scheduled, completed) - clickable links
- 🔧 Maintenance events (created, completed) - clickable links
- 📄 Contract events (created, renewed)
- 📜 Certificate events (uploaded, expiring, expired)
- ⏱️ Relative timestamps
- 🎨 Color-coded icons
- 📊 Filter by event type
- 🔗 Clickable links to related jobs/contracts

### **Icon & Color System**

| Event Type | Icon | Color | Example |
|------------|------|-------|---------|
| Property Created | 🏠 | Green | Property "Beachfront Villa" created |
| Property Updated | ✏️ | Gray | Address updated |
| Cleaning Scheduled | 🗓️ | Blue | Cleaning scheduled for Jan 15 with Sarah |
| Cleaning Started | 🧹 | Cyan | Cleaning started by Sarah |
| Cleaning Completed | ✅ | Green | Cleaning completed by Sarah |
| Maintenance Created | 🔧 | Orange | Maintenance: Leaking faucet (HIGH) |
| Maintenance Completed | ✅ | Green | Maintenance completed: Leaking faucet |
| Contract Created | 📄 | Purple | Contract created (£500/month) |
| Contract Renewed | 🔄 | Purple | Contract renewed until Dec 2025 |
| Certificate Uploaded | 📜 | Blue | Gas Safety certificate uploaded |
| Certificate Expiring | ⚠️ | Yellow | Gas Safety expires in 30 days |
| Certificate Expired | ❌ | Red | Gas Safety certificate expired |

---

## 📊 API Endpoints

### **Get Property History**
```
GET /api/properties/:id/history?limit=50
```

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "changed_at": "2025-11-04T10:30:00Z",
      "change_type": "CLEANING_JOB_COMPLETED",
      "description": "Cleaning completed by Sarah Smith",
      "metadata": {
        "cleaning_job_id": "job-uuid",
        "worker_name": "Sarah Smith"
      }
    }
  ]
}
```

---

## 🔄 Complete Timeline Example

```
🏠 Property "Loch View Cabin" created
   3 months ago

📄 Cleaning contract created (£200/month)
   3 months ago

📜 Gas Safety certificate uploaded (expires Jun 2026)
   3 months ago

🗓️ Cleaning scheduled for Nov 1 with Sarah Smith →
   4 days ago

🧹 Cleaning started by Sarah Smith
   3 days ago

🔧 Maintenance job created: Leaking faucet (HIGH priority) →
   3 days ago

✅ Cleaning completed by Sarah Smith
   3 days ago

🗓️ Cleaning scheduled for Nov 8 with John Doe →
   Today

⚠️ Gas Safety certificate expiring in 90 days
   Today
```

---

## 📝 Implementation Steps

### **Step 1: Basic Property Events** (Quick Win)
1. Integrate into PropertiesService:
   - `recordPropertyCreated()` on create
   - `recordPropertyUpdated()` on update
2. Add API endpoint for property history
3. Create PropertyHistoryTimeline component
4. Add to property details page

**Benefit**: See property creation and updates immediately

### **Step 2: Cleaning Events** (High Value)
1. Integrate into CleaningJobsService:
   - `recordCleaningJobScheduled()` on create
   - `recordCleaningJobStarted()` on startJob
   - `recordCleaningJobCompleted()` on completeJob
2. Add clickable links to cleaning jobs

**Benefit**: Complete cleaning history for each property

### **Step 3: Maintenance Events** (High Value)
1. Integrate into MaintenanceJobsService:
   - `recordMaintenanceJobCreated()` on create
   - `recordMaintenanceJobCompleted()` on complete
2. Add clickable links to maintenance jobs

**Benefit**: Track all maintenance work per property

### **Step 4: Contract Events** (If Applicable)
1. Integrate into ContractService
2. Track contract lifecycle

**Benefit**: Contract audit trail

### **Step 5: Certificate Events** (Safety Critical)
1. Integrate into CertificateService
2. Add automated expiry warnings

**Benefit**: Safety compliance tracking

---

## 🎁 Benefits

### **For Property Managers**
- 📊 Complete activity timeline per property
- 🔍 Audit trail for compliance
- 📈 Property maintenance history (useful for sales/valuations)
- ⚡ Quick access to recent events

### **For Cleaners**
- 📅 See cleaning frequency and patterns
- 🏆 Track performance per property
- 🔗 Quick access to related maintenance issues

### **For Maintenance Teams**
- 🛠️ Property maintenance history
- 🔄 Recurring issue identification
- 📊 Property condition trends

### **For Business**
- 💰 Track service usage per property
- 📈 Identify high-maintenance properties
- 🎯 Target cross-sell opportunities
- 📊 Performance analytics

---

## 🧪 Testing Checklist

### **Backend**
- [ ] Property history table created
- [ ] PropertyHistoryService created
- [ ] Test property creation recording
- [ ] Test property update recording
- [ ] Test cleaning job recording
- [ ] Test maintenance job recording
- [ ] API endpoint returns history

### **Frontend**
- [ ] PropertyHistoryTimeline component created
- [ ] Displays all event types correctly
- [ ] Icons and colors match spec
- [ ] Clickable links work
- [ ] Timestamps format correctly
- [ ] Filters work (if implemented)
- [ ] Loading states work
- [ ] Error states work

### **Integration**
- [ ] Create property → see "Property created"
- [ ] Update property → see "Property updated"
- [ ] Schedule cleaning → see "Cleaning scheduled"
- [ ] Start cleaning → see "Cleaning started"
- [ ] Complete cleaning → see "Cleaning completed"
- [ ] Create maintenance → see "Maintenance created"
- [ ] Upload certificate → see "Certificate uploaded"

---

## 📦 Files Created

### Backend
- ✅ `packages/database/prisma/schema.prisma` - PropertyHistory model & enum
- ✅ `apps/api/src/services/PropertyHistoryService.ts` - Service with all methods

### Frontend (TO DO)
- ⏳ `apps/web-*/src/components/PropertyHistoryTimeline.tsx` - Timeline component
- ⏳ `apps/web-*/src/lib/api.ts` - Add PropertyHistoryEntry type & API method

---

## 🚀 Quick Start (Once Integrated)

### **View Property History**
1. Go to any property details page
2. Scroll to "Activity Timeline" section
3. See all events for that property
4. Click on events to navigate to related jobs

### **Filter Events** (Future Enhancement)
- Show only cleaning events
- Show only maintenance events
- Show only contract/certificate events
- Date range filtering

---

## 💡 Future Enhancements

### **1. Analytics Dashboard**
- Most active properties
- Average cleaning frequency
- Maintenance costs per property
- Certificate compliance status

### **2. Automated Alerts**
- Certificate expiring notifications
- Unusual activity patterns
- Maintenance cost threshold alerts

### **3. Export & Reports**
- Property history PDF export
- Annual property reports
- Compliance audit logs

### **4. Real-time Updates**
- WebSocket for live timeline updates
- "New activity" badges
- Push notifications

---

## 📊 Event Type Reference

### Property Events (4)
- PROPERTY_CREATED
- PROPERTY_UPDATED
- ACCESS_INSTRUCTIONS_UPDATED
- STATUS_CHANGED

### Cleaning Events (4)
- CLEANING_JOB_SCHEDULED
- CLEANING_JOB_STARTED
- CLEANING_JOB_COMPLETED
- CLEANING_JOB_CANCELLED

### Maintenance Events (4)
- MAINTENANCE_JOB_CREATED
- MAINTENANCE_JOB_SCHEDULED
- MAINTENANCE_JOB_COMPLETED
- MAINTENANCE_JOB_CANCELLED

### Contract Events (4)
- CONTRACT_CREATED
- CONTRACT_RENEWED
- CONTRACT_UPDATED
- CONTRACT_CANCELLED

### Certificate Events (4)
- CERTIFICATE_UPLOADED
- CERTIFICATE_EXPIRING_SOON
- CERTIFICATE_EXPIRED
- CERTIFICATE_RENEWED

### Other Events (5)
- PHOTO_UPLOADED
- TENANT_MOVED_IN
- TENANT_MOVED_OUT
- WORK_ORDER_CREATED
- WORK_ORDER_COMPLETED

**Total**: 25 event types!

---

## ✅ Next Actions

1. **Decide priority**: Which events are most important to track first?
2. **Start with cleaning**: Integrate cleaning job tracking (highest value)
3. **Add maintenance**: Track maintenance work
4. **Build frontend**: Create PropertyHistoryTimeline component
5. **Test & iterate**: Ensure all events are captured correctly

The foundation is ready - just needs integration! 🎉
