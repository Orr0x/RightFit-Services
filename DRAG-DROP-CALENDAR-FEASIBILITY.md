# Drag-and-Drop Calendar Feasibility Analysis

## Summary
✅ **YES, it's definitely possible!** The infrastructure is already in place to support dragging job cards to different dates.

---

## Current State Analysis

### ✅ What We Already Have

1. **Backend API Support** ✅
   - PUT endpoint: `/api/cleaning-jobs/:id` ([apps/api/src/routes/cleaning-jobs.ts:75-95](apps/api/src/routes/cleaning-jobs.ts#L75-L95))
   - Accepts `scheduled_date` updates
   - Properly converts date strings to Date objects
   - Validates service provider access

2. **Frontend API Client** ✅
   - Update method exists at [apps/web-cleaning/src/lib/api.ts:696-699](apps/web-cleaning/src/lib/api.ts#L696-L699)
   - Already integrated with CleaningJob interface
   ```typescript
   update: async (id: string, data: Partial<CreateCleaningJobData> & { service_provider_id: string }) => {
     const response = await api.put<{ data: CleaningJob }>(`/api/cleaning-jobs/${id}`, data)
     return response.data.data
   }
   ```

3. **Calendar Structure** ✅
   - Well-organized calendar grid in [PropertyCalendar.tsx](apps/web-cleaning/src/pages/PropertyCalendar.tsx)
   - Job cards already rendered with proper data
   - Job-to-date mapping logic exists (`getJobsForDate()`)
   - State management for jobs array

4. **Job Cards** ✅
   - Individual job cards at lines 199-221
   - Each card has unique job ID
   - Already styled and interactive

### ❌ What We Need to Add

1. **Drag-and-Drop Library** ❌
   - No drag-and-drop library currently installed
   - Need to add to dependencies

2. **Drag Handlers** ❌
   - Need to implement drag start, drag over, drop handlers
   - Need to track which job is being dragged

3. **UI Feedback** ❌
   - Visual feedback during drag (opacity, ghost image)
   - Drop zone highlighting
   - Loading state during API update

---

## Recommended Implementation

### Option 1: @dnd-kit (RECOMMENDED)
**Why?**
- Modern, actively maintained (2024)
- Excellent accessibility support
- Lightweight (~20KB)
- TypeScript-first
- Great documentation
- Works well with React 18

**Installation:**
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Pros:**
- Best-in-class accessibility
- Flexible and powerful
- Great TypeScript support
- Active community

**Cons:**
- Slightly steeper learning curve
- More setup than simpler alternatives

### Option 2: react-draggable
**Why?**
- Simpler API
- Smaller bundle
- Good for basic drag operations

**Pros:**
- Easy to implement
- Minimal setup

**Cons:**
- Less flexible for complex scenarios
- Not optimized for lists/grids
- Limited accessibility features

---

## Implementation Steps (Using @dnd-kit)

### 1. Install Dependencies
```bash
cd apps/web-cleaning
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Modify PropertyCalendar.tsx

#### Add Imports
```typescript
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
```

#### Add State for Dragging
```typescript
const [activeJob, setActiveJob] = useState<CleaningJob | null>(null)
const [isDragging, setIsDragging] = useState(false)
```

#### Wrap Calendar in DndContext
```typescript
<DndContext
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  sensors={sensors}
>
  {/* existing calendar grid */}
</DndContext>
```

#### Make Job Cards Draggable
```typescript
// Replace existing job card div with:
<div
  draggable
  onDragStart={(e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('jobId', job.id)
    e.dataTransfer.setData('oldDate', dateStr)
  }}
  style={{
    ...colors,
    border: `1px solid ${colors.borderColor}`,
    cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
  }}
>
  {/* existing card content */}
</div>
```

#### Make Calendar Cells Drop Zones
```typescript
<div
  key={day}
  className="p-2"
  onDragOver={(e) => {
    e.preventDefault() // Allow drop
    e.currentTarget.style.backgroundColor = '#e0f2fe' // Highlight
  }}
  onDragLeave={(e) => {
    e.currentTarget.style.backgroundColor = isTodayDate ? '#eff6ff' : '#ffffff'
  }}
  onDrop={(e) => handleDrop(e, date)}
  style={{
    minHeight: '120px',
    backgroundColor: isTodayDate ? '#eff6ff' : '#ffffff',
    borderRight: isLastColumn ? 'none' : '1px solid #d1d5db',
    borderBottom: '1px solid #d1d5db',
    transition: 'background-color 0.2s'
  }}
>
  {/* existing day content */}
</div>
```

#### Add Drop Handler
```typescript
const handleDrop = async (e: React.DragEvent, newDate: Date) => {
  e.preventDefault()
  e.currentTarget.style.backgroundColor = '#ffffff'

  const jobId = e.dataTransfer.getData('jobId')
  const oldDate = e.dataTransfer.getData('oldDate')
  const newDateStr = newDate.toISOString().split('T')[0]

  if (oldDate === newDateStr) {
    return // No change
  }

  try {
    // Show loading toast
    toast.info('Rescheduling job...')

    // Find the job to get its times
    const job = jobs.find(j => j.id === jobId)
    if (!job) return

    // Update via API
    await cleaningJobsAPI.update(jobId, {
      scheduled_date: newDateStr,
      service_provider_id: SERVICE_PROVIDER_ID,
    })

    // Refresh jobs to show updated state
    await loadJobs()

    toast.success(`Job rescheduled to ${newDate.toLocaleDateString()}`)
  } catch (error: any) {
    console.error('Error rescheduling job:', error)
    toast.error('Failed to reschedule job')
    // Optionally reload to revert UI
    await loadJobs()
  }
}
```

### 3. Add Visual Feedback

#### Dragging State
```typescript
const handleDragStart = (jobId: string) => {
  setIsDragging(true)
  // Could also set activeJob for a drag preview
}

const handleDragEnd = () => {
  setIsDragging(false)
}
```

#### CSS for Drag Feedback
```typescript
style={{
  ...colors,
  cursor: isDragging ? 'grabbing' : 'grab',
  opacity: isDragging ? 0.5 : 1,
  transform: isDragging ? 'scale(0.95)' : 'scale(1)',
  transition: 'all 0.2s ease'
}}
```

---

## Technical Considerations

### 1. **Date Handling**
- Jobs have both `scheduled_date` and time fields (`scheduled_start_time`, `scheduled_end_time`)
- When dragging, preserve the times and only update the date
- Consider time zone handling if relevant

### 2. **Optimistic Updates**
**Option A: Wait for API response (SAFER)**
```typescript
await cleaningJobsAPI.update(jobId, data)
await loadJobs() // Refresh from server
```

**Option B: Optimistic update (FASTER UX)**
```typescript
// Update local state immediately
setJobs(jobs.map(j => j.id === jobId ? { ...j, scheduled_date: newDate } : j))

// Update in background
cleaningJobsAPI.update(jobId, data).catch(() => {
  // Revert on error
  loadJobs()
  toast.error('Failed to reschedule')
})
```

### 3. **Validation**
- Prevent dragging to past dates?
- Check for worker availability conflicts?
- Validate against property availability?
- Show warnings for double-bookings?

### 4. **Multi-Day Jobs**
- Current implementation treats each job as a single-day event
- If future jobs span multiple days, need additional logic

### 5. **Mobile Considerations**
- Touch events work differently than mouse events
- May need `@dnd-kit/sortable` touch sensor
- Consider disabling on mobile or using long-press

### 6. **Performance**
- Current implementation loads all jobs at once
- If job count grows large, consider:
  - Lazy loading by month
  - Virtualization
  - Pagination

---

## Changes Propagation

### ✅ Automatic Propagation
Once you update a job's `scheduled_date` via the API, the change will automatically reflect in:

1. **Calendar View** (PropertyCalendar.tsx)
   - After calling `loadJobs()`, the job appears in the new date

2. **Jobs List** (CleaningJobs.tsx)
   - Any component that calls `cleaningJobsAPI.list()` will get updated data

3. **Job Details** (CleaningJobDetails.tsx)
   - Shows the updated scheduled_date when viewing individual job

4. **Worker View** (WorkerDetails.tsx)
   - Worker's assigned jobs list will reflect new date

5. **Dashboard** (CleaningDashboard.tsx)
   - Any statistics or upcoming jobs will update

### 🔄 Real-time Updates
For multiple users viewing the same calendar:
- Currently NO real-time sync
- Users need to refresh to see changes from others
- Could add WebSocket or polling for real-time updates later

---

## Testing Checklist

- [ ] Drag job to same day (no-op)
- [ ] Drag job to different day in same month
- [ ] Drag job to previous month day (gray cells)
- [ ] Drag job to next month day (gray cells)
- [ ] Drag job while API is down (error handling)
- [ ] Drag multiple jobs in sequence
- [ ] Cancel drag (ESC key or drag outside calendar)
- [ ] Verify job still clickable for details
- [ ] Test on touch devices
- [ ] Test with different job statuses
- [ ] Verify worker assignment preserved
- [ ] Check that times (start/end) are preserved

---

## Estimated Effort

### Time Breakdown
1. **Install dependencies**: 5 minutes
2. **Implement basic drag-and-drop**: 2-3 hours
3. **Add visual feedback and polish**: 1-2 hours
4. **Testing and bug fixes**: 2-3 hours
5. **Add validation/edge cases**: 1-2 hours

**Total: 6-11 hours** (1-1.5 days)

### Complexity: **MEDIUM**
- Backend API already exists ✅
- Calendar structure is good ✅
- Main work is UI interaction layer
- Most challenging part: handling edge cases and validation

---

## Alternative: HTML5 Drag-and-Drop API

You could also use native HTML5 drag-and-drop without any library:

**Pros:**
- No dependencies
- Smaller bundle
- Simple for basic use case

**Cons:**
- Poor mobile support
- Inconsistent browser behavior
- No built-in accessibility
- More boilerplate code

**Example:**
```typescript
// Job card
<div
  draggable
  onDragStart={(e) => e.dataTransfer.setData('jobId', job.id)}
>

// Drop zone
<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => handleDrop(e)}
>
```

---

## Recommendation

**Go with @dnd-kit** for the following reasons:
1. Professional-grade solution
2. Excellent accessibility out of the box
3. Good TypeScript support
4. Easy to extend later (e.g., sortable lists, multiple drop zones)
5. Active maintenance and community

The native HTML5 API would work but requires more custom code for accessibility and polish.

---

## Next Steps

1. **User Decision**: Choose drag-and-drop library (@dnd-kit recommended)
2. **Install dependencies**
3. **Create feature branch**: `git checkout -b feature/calendar-drag-drop`
4. **Implement core functionality**
5. **Add visual polish**
6. **Test thoroughly**
7. **Consider adding validation rules**

## Questions to Consider

1. Should we allow dragging to past dates?
2. Should we show a confirmation modal before rescheduling?
3. Should we check for worker availability conflicts?
4. Do we want to support drag-and-drop on mobile?
5. Should we add undo/redo functionality?
6. Do we want to log rescheduling in an audit trail?
