# Maintenance Issue Tracking Enhancement

## ✅ Enhancement Complete

Successfully added maintenance issue tracking to the job history system. Now when a maintenance issue is reported from a cleaning job, it's automatically recorded in the cleaning job's history timeline with a clickable link to the maintenance job.

---

## What Was Added

### **New Change Type** 🔧
- `MAINTENANCE_ISSUE_CREATED` - Recorded when maintenance issue is reported from cleaning job

### **Automatic Tracking**
When a maintenance issue is created from a cleaning job:
1. Issue details are recorded in cleaning job history
2. Includes issue title and priority
3. Links to the maintenance job
4. Non-blocking (doesn't fail if history recording fails)

---

## Implementation Details

### **Database Schema**
Updated `JobHistoryChangeType` enum:
```prisma
enum JobHistoryChangeType {
  // ... existing types
  MAINTENANCE_ISSUE_CREATED // New!
  DELETED
}
```

### **Backend Service**

**New Method in CleaningJobHistoryService:**
```typescript
async recordMaintenanceIssueCreated(
  jobId: string,
  maintenanceJobId: string,
  issueTitle: string,
  priority: string,
  userId?: string
)
```

**Metadata Stored:**
- `maintenance_job_id` - Link to maintenance job
- `issue_title` - Issue title
- `priority` - URGENT, HIGH, MEDIUM, or LOW

**Example Entry:**
```typescript
{
  change_type: 'MAINTENANCE_ISSUE_CREATED',
  description: 'Maintenance issue reported: Leaking faucet (HIGH priority)',
  new_value: 'maintenance-job-uuid',
  metadata: {
    maintenance_job_id: 'maintenance-job-uuid',
    issue_title: 'Leaking faucet',
    priority: 'HIGH'
  }
}
```

### **MaintenanceJobsService Integration**

Updated `createFromCleaningIssue` method to record history:
```typescript
// Record in cleaning job history
await this.cleaningJobHistoryService.recordMaintenanceIssueCreated(
  cleaningJobId,
  maintenanceJob.id,
  issueData.title,
  issueData.priority
).catch((error) => {
  console.error('Failed to record maintenance issue in cleaning job history:', error);
});
```

### **Frontend Timeline Display**

**Icon:** 🔧 (wrench)
**Color:** Orange (#f97316)
**Clickable:** Yes - Opens maintenance job in new tab

**Display Example:**
```
🔧 Maintenance issue reported: Leaking faucet (HIGH priority) →
   2 hours ago
```

**Hover Effect:**
- Dashed underline becomes solid
- Orange color throughout
- Cursor: pointer
- Arrow (→) indicates it's clickable

---

## Files Modified

### [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)
**Line 1370**: Added `MAINTENANCE_ISSUE_CREATED` to enum

### [apps/api/src/services/CleaningJobHistoryService.ts](apps/api/src/services/CleaningJobHistoryService.ts)
**Lines 264-287**: Added `recordMaintenanceIssueCreated` method

### [apps/api/src/services/MaintenanceJobsService.ts](apps/api/src/services/MaintenanceJobsService.ts)
**Lines 1-4**: Added import
**Lines 46-50**: Added constructor with history service
**Lines 357-365**: Added history recording after maintenance issue creation

### [apps/web-cleaning/src/lib/api.ts](apps/web-cleaning/src/lib/api.ts)
**Line 673**: Added `MAINTENANCE_ISSUE_CREATED` to JobHistoryEntry type

### [apps/web-cleaning/src/components/JobHistoryTimeline.tsx](apps/web-cleaning/src/components/JobHistoryTimeline.tsx)
**Lines 80-81**: Added icon case (🔧)
**Lines 107-108**: Added color case (orange)
**Lines 217-238**: Added clickable link for maintenance issues

---

## User Experience

### **Timeline Display**

When viewing a cleaning job that had maintenance issues reported:

```
✨ Job created
   3 days ago

👤 Worker assigned: John Smith
   2 days ago

🔧 Maintenance issue reported: Leaking faucet (HIGH priority) →
   5 hours ago

🔧 Maintenance issue reported: Broken door handle (MEDIUM priority) →
   3 hours ago

📷 After photos added
   1 hour ago

🔄 Status changed from IN_PROGRESS to COMPLETED
   30 minutes ago
```

### **Clicking Maintenance Issue**
- Click on the orange text
- Opens maintenance job details in new tab
- Shows full maintenance job information
- Can track progress of maintenance work

---

## Benefits

1. **Complete Audit Trail** - See all maintenance issues raised during cleaning
2. **Easy Navigation** - Click to view maintenance job details
3. **Priority Visibility** - See issue priority at a glance
4. **Cross-Sell Tracking** - Track opportunities converted to maintenance jobs
5. **Worker Accountability** - See which issues were reported and when

---

## Example Workflow

1. **Cleaner Reports Issue**
   - During cleaning, worker finds leaking faucet
   - Reports issue via "Report Issue" button
   - Creates maintenance job

2. **History Recorded**
   - Entry added to cleaning job timeline
   - Shows: "🔧 Maintenance issue reported: Leaking faucet (HIGH priority) →"
   - Includes link to maintenance job

3. **Manager Reviews**
   - Views cleaning job details
   - Sees all maintenance issues reported
   - Clicks link to view/manage maintenance job
   - Can track resolution

4. **Performance Tracking**
   - Count maintenance issues per property
   - Track which cleaners report most issues (proactive)
   - Identify problem properties
   - Measure cross-sell success

---

## Testing Checklist

### **Backend**
- [x] Database schema updated
- [x] History service method created
- [x] Maintenance service integrated
- [ ] Test creating maintenance issue from cleaning job
- [ ] Verify history entry is created
- [ ] Check metadata is correct

### **Frontend**
- [x] TypeScript types updated
- [x] Timeline icon added
- [x] Timeline color added
- [x] Clickable link implemented
- [ ] Test clicking maintenance link
- [ ] Verify opens in new tab
- [ ] Check hover effect works

### **Integration**
- [ ] Report issue from cleaning job
- [ ] Check history shows entry
- [ ] Click link to maintenance job
- [ ] Verify correct job opens
- [ ] Test with multiple issues
- [ ] Test with different priorities

---

## Future Enhancements

### **1. Resolution Tracking**
- Update history when maintenance job is completed
- Show: "🔧 Maintenance issue resolved: Leaking faucet"
- Close the loop on reported issues

### **2. Cost Tracking**
- Show maintenance job cost in history
- Track total maintenance costs per cleaning job
- ROI analysis for cross-selling

### **3. Cleaner Recognition**
- Badge for cleaners who report most issues
- "Proactive cleaner" metric
- Incentive programs

### **4. Property Insights**
- Dashboard showing properties with most issues
- Preventive maintenance scheduling
- Property condition trends

### **5. Customer Communication**
- Auto-notify customer when issue reported
- Include in cleaning completion report
- "We found X issues and created quotes"

---

## Summary

The maintenance issue tracking enhancement provides:

- ✅ **Automatic Recording** - No manual steps needed
- ✅ **Clickable Links** - Easy navigation to maintenance jobs
- ✅ **Visual Distinction** - Orange wrench icon stands out
- ✅ **Priority Display** - See urgency at a glance
- ✅ **Complete Timeline** - All job events in one place

**Timeline Example:**
```
🔧 Maintenance issue reported: Leaking faucet (HIGH priority) →
   Description: Water dripping from kitchen sink
   Priority: HIGH priority
```

**Status**: ✅ **Ready for testing**

Test it out: Report a maintenance issue from any cleaning job and watch it appear in the timeline with a clickable link! 🎉
