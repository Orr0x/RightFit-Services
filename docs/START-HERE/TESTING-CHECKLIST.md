# Comprehensive Testing Checklist for RightFit Services

**Created**: 2025-11-03
**Purpose**: Systematic testing guide for all features across the platform

---

## 1. **Maintenance Job Workflow - Complete End-to-End**

### Quote & Approval Process
- [ ] Create maintenance job from maintenance dashboard
- [ ] Submit quote with multiple line items
- [ ] Verify quote notification appears in customer portal
- [ ] Customer receives notification with correct quote total
- [ ] Customer can approve quote from notification or dashboard
- [ ] Customer can decline quote with reason
- [ ] Declined quotes show reason to maintenance provider
- [ ] After approval, job status changes to APPROVED

### Scheduling & Assignment
- [ ] Schedule approved job with date/time
- [ ] Assign worker to job
- [ ] Customer receives scheduling notification
- [ ] Scheduled job appears in "Scheduled" tab on both portals
- [ ] Worker assignment shows correct name

### Job Completion
- [ ] Complete job without before/after photos (should fail)
- [ ] Upload before photo only (should fail)
- [ ] Upload after photo only (should fail)
- [ ] Upload both before and after photos successfully
- [ ] Complete job with invoice generation enabled
- [ ] Complete job with invoice generation disabled
- [ ] Verify completion notification sent to customer
- [ ] Verify notification mentions invoice if generated
- [ ] Page doesn't go blank after completion
- [ ] Toast message shows appropriate success message

### Invoice Verification
- [ ] Invoice appears on maintenance dashboard invoices page
- [ ] Invoice appears on customer portal invoices page
- [ ] Invoice has correct invoice number (INV-YYYY-XXXXX)
- [ ] Invoice shows correct line items from quote
- [ ] Invoice calculates tax correctly (20% VAT)
- [ ] Invoice subtotal, tax, and total are accurate
- [ ] Invoice status starts as PENDING
- [ ] Invoice links to correct maintenance job
- [ ] Invoice shows correct property name
- [ ] Invoice shows correct service type

### Completed Jobs Tab
- [ ] Completed job appears in customer "Completed" tab
- [ ] Completed tab shows correct count
- [ ] Completed job card shows property name
- [ ] Completed job card shows worker name
- [ ] Completed job card shows total amount
- [ ] Completed job card shows "Completed" chip
- [ ] Clicking completed job navigates to job details
- [ ] Job details page shows before/after photos
- [ ] Job details shows completion notes
- [ ] Job details shows invoice link if generated

---

## 2. **Customer Portal Features**

### Dashboard Overview
- [ ] Property count is accurate
- [ ] Active jobs count is accurate
- [ ] Pending quotes count is accurate
- [ ] Recent activity feed shows latest events
- [ ] Notifications badge shows unread count
- [ ] All 4 tabs load correctly (Overview, Scheduled, In Progress, Completed)

### Properties Page
- [ ] All customer properties display
- [ ] Property cards show correct information
- [ ] **Can click into property cards to view details**
- [ ] Property details page displays correctly
- [ ] Property maintenance history displays
- [ ] Property images load correctly
- [ ] **Can add properties for other customers**

### Financial Page
- [ ] Monthly spending chart displays
- [ ] Service breakdown pie chart shows
- [ ] Upcoming payments list is accurate
- [ ] Recent invoices section shows latest invoices
- [ ] Payment status indicators are correct

### Invoices Page
- [ ] Current month total is accurate
- [ ] Last month total is accurate
- [ ] Year-to-date total is accurate
- [ ] Percentage change calculation is correct
- [ ] Invoice table shows all invoices
- [ ] Invoice numbers display correctly
- [ ] Invoice dates format properly
- [ ] Service types display correctly
- [ ] Amounts show with £ symbol and 2 decimals
- [ ] Status chips show correct colors (PAID=green, PENDING=orange, OVERDUE=red)
- [ ] Download button shows (even if not functional yet)
- [ ] **Can click into invoice rows to view invoice details**
- [ ] Empty state displays when no invoices exist

### Quotes Page
- [ ] Shows all quotes (not just pending approval)
- [ ] **Mirrors dashboard quote data**
- [ ] Quote cards display correctly
- [ ] Can approve quotes from this page
- [ ] Can decline quotes with reason
- [ ] Status filters work correctly
- [ ] Empty state displays appropriately

### Guest Issues Page
- [ ] Guest-reported issues display
- [ ] Issue cards show property name
- [ ] Issue cards show severity level
- [ ] Issue photos display correctly
- [ ] **Can click into guest issue cards to see full details**
- [ ] **Status tag updates based on workflow (not just "WORK ORDER CREATED")**
- [ ] Can submit issue to maintenance provider
- [ ] Can dismiss issue
- [ ] Submitted issues disappear from pending list
- [ ] Dismissed issues disappear from pending list

### Notifications
- [ ] Notification bell icon shows unread count
- [ ] Notification panel opens when clicked
- [ ] Quote ready notifications appear
- [ ] Job scheduled notifications appear
- [ ] Job completed notifications appear
- [ ] Invoice generated notifications appear
- [ ] Notification messages are clear and informative
- [ ] Can mark individual notification as read
- [ ] Unread count decreases when marked read
- [ ] Notification links to related resource (if applicable)

---

## 3. **Maintenance Provider Dashboard**

### Jobs Management
- [ ] Create new maintenance job
- [ ] Edit existing job
- [ ] Delete draft job
- [ ] Search jobs by property/customer
- [ ] Filter jobs by status
- [ ] Sort jobs by date
- [ ] View job details
- [ ] Add internal notes to job

### Quote Management
- [ ] Create quote with multiple line items
- [ ] Add/remove line items dynamically
- [ ] Quote totals calculate correctly
- [ ] Submit quote to customer
- [ ] View quote status (pending, approved, declined)
- [ ] See decline reason when customer declines

### Worker Assignment
- [ ] View list of available workers
- [ ] Assign worker to job
- [ ] Reassign worker
- [ ] Unassign worker
- [ ] Worker shows up on job card

### Photos & Documentation
- [ ] Upload multiple before photos
- [ ] Upload multiple after photos
- [ ] Photos display in thumbnails
- [ ] Click photo to view full size
- [ ] Photo upload progress indicator works
- [ ] Large photos are handled correctly

### Invoice Generation
- [ ] Generate invoice from completed job
- [ ] Invoice number auto-generates correctly
- [ ] Invoice includes all line items from quote
- [ ] Invoice uses actual costs if provided
- [ ] Invoice falls back to quote if no actual costs
- [ ] Invoice calculates VAT correctly
- [ ] Invoice due date is 14 days from generation
- [ ] Mark invoice as paid
- [ ] Add payment method and reference

---

## 4. **Cleaning Service Dashboard**

### Cleaning Jobs
- [ ] Create cleaning job
- [ ] Schedule recurring cleaning
- [ ] Assign cleaner to job
- [ ] Mark job as in progress
- [ ] Mark job as complete
- [ ] Upload completion photos
- [ ] View cleaning history per property

### Cleaning-Specific Features
- [ ] Room checklist displays
- [ ] Can check off completed rooms
- [ ] Time tracking for job duration
- [ ] Supply usage tracking (if implemented)
- [ ] Quality control photos

---

## 5. **Worker Availability & Scheduling**

### Worker Availability Management
- [ ] Navigate to worker details page (Team Members)
- [ ] Click on Availability tab
- [ ] Calendar widget displays current month
- [ ] Statistics show correct blocked days count
- [ ] Statistics show current availability status (Available/Unavailable)
- [ ] Click "+ Block Period" button opens modal
- [ ] Modal requires start date and end date
- [ ] Modal accepts optional reason field
- [ ] Can create blocked period with date range
- [ ] Blocked period appears in calendar with red markers
- [ ] Blocked dates show in "Blocked Dates" list
- [ ] List displays date range and reason (if provided)
- [ ] "Remove Block" button appears on each blocked period
- [ ] Can delete blocked period successfully
- [ ] Deleted period removes from calendar and list
- [ ] Statistics update after creating/deleting periods
- [ ] Can navigate between months in calendar
- [ ] Blocked periods spanning multiple months display correctly

### Drag & Drop Schedule Protection
- [ ] Navigate to Property Calendar
- [ ] Create/find job with assigned worker
- [ ] Block that worker for a specific date
- [ ] Try to drag job to blocked date
- [ ] System shows error: "{Worker Name} is marked as unavailable on this date"
- [ ] Job does NOT move to blocked date
- [ ] Can still drag job to available dates
- [ ] Validation happens before time conflict check
- [ ] Multiple workers with different availability blocks work correctly
- [ ] Unassigned jobs can be dropped on any date

### Worker Dropdown Filtering
- [ ] Open calendar and right-click on a job to quick edit
- [ ] Worker dropdown loads all active workers initially
- [ ] Block a worker for the job's date
- [ ] Reopen the edit modal
- [ ] Blocked worker is NOT in the dropdown
- [ ] Helper text shows: "X worker(s) unavailable (blocked or already scheduled)"
- [ ] Only available workers appear in dropdown
- [ ] Currently assigned worker always appears (even if unavailable)
- [ ] Create another job at same time on same date
- [ ] Assign a worker to first job
- [ ] Open second job's edit modal
- [ ] Worker scheduled for first job does NOT appear in dropdown
- [ ] Helper text updates to show both blocked and scheduled workers
- [ ] Changing start/end times updates available worker list dynamically

### Worker History Tracking
- [ ] Assign worker to a job
- [ ] Reschedule the job to different date (via drag/drop)
- [ ] Navigate to worker's History tab
- [ ] History shows: "Job rescheduled at {property}: {old_date} → {new_date}"
- [ ] Entry includes property name
- [ ] Entry shows before and after dates in UK format (DD/MM/YYYY)
- [ ] Entry timestamp is accurate
- [ ] Multiple reschedules show as separate entries
- [ ] Unassigning and reassigning worker also tracked

### Schedule Conflict Prevention
- [ ] Create job 1: 10:00-12:00 with Worker A
- [ ] Try to create job 2: 11:00-13:00 with Worker A (same date)
- [ ] System prevents assignment or shows error
- [ ] Create job 2: 12:00-14:00 with Worker A (same date)
- [ ] System allows assignment (no overlap)
- [ ] Worker B can be assigned to overlapping time slots
- [ ] Time conflict validation respects blocked periods
- [ ] Cancelled jobs don't cause false conflicts

### Edge Cases
- [ ] Block period spanning multiple weeks
- [ ] Block period spanning multiple months
- [ ] Block period in the past (should be allowed for record keeping)
- [ ] Block period starting today
- [ ] Delete block period while jobs are scheduled during it
- [ ] Worker with multiple non-contiguous blocked periods
- [ ] Worker blocked entire month
- [ ] Two workers blocked on same dates (different reasons)
- [ ] Overlapping block periods for same worker
- [ ] Very long reason text (100+ characters)
- [ ] Empty reason (should work)
- [ ] Start date after end date (should show validation error)

---

## 6. **Guest Tablet App**

### Guest Welcome
- [ ] Tablet displays welcome screen
- [ ] Property information shows correctly
- [ ] Can access AI chat
- [ ] Can report issue
- [ ] Can view DIY guides
- [ ] Can browse knowledge base

### Issue Reporting
- [ ] Guest can describe issue
- [ ] Guest can upload photos
- [ ] Guest can select severity level
- [ ] Issue submits successfully
- [ ] Issue appears in customer portal
- [ ] Timestamp is accurate
- [ ] Property linkage is correct

### AI Chat
- [ ] Chat interface loads
- [ ] Can send messages
- [ ] AI responds appropriately
- [ ] Conversation history persists
- [ ] Can start new conversation
- [ ] Emergency escalation works

### DIY Guides
- [ ] Guides list displays
- [ ] Can search guides
- [ ] Guide content displays with images
- [ ] Step-by-step instructions are clear
- [ ] Related guides show up

---

## 7. **Authentication & Authorization**

### Landlord Portal Login
- [ ] Can login with valid credentials
- [ ] Invalid credentials show error
- [ ] Can logout successfully
- [ ] Session persists on refresh
- [ ] Session expires after timeout

### Customer Portal Login
- [ ] Can register new customer account
- [ ] Registration requires valid customer ID
- [ ] Can login with credentials
- [ ] Forgot password flow (if implemented)
- [ ] Can logout successfully

### Maintenance/Cleaning Portal Login
- [ ] Service provider can login
- [ ] Only sees their own customers/jobs
- [ ] Cannot access other provider's data
- [ ] Role-based permissions work

### Guest Tablet Access
- [ ] No login required for guest features
- [ ] Guest cannot access admin features
- [ ] Property access is correctly scoped

---

## 8. **Cross-Portal Data Consistency**

### Maintenance Jobs
- [ ] Job created in maintenance portal shows in customer portal
- [ ] Quote submitted in maintenance portal appears in customer notifications
- [ ] Customer approval updates maintenance portal immediately
- [ ] Job completion in maintenance portal updates customer dashboard
- [ ] Invoice generated in maintenance portal shows in customer invoices

### Properties
- [ ] Property added in landlord portal visible to all portals
- [ ] Property updates sync across portals
- [ ] Property deletion handled gracefully

### Customers
- [ ] Customer added in landlord portal can access customer portal
- [ ] Customer data consistent across all portals
- [ ] Customer updates reflect everywhere

---

## 9. **Edge Cases & Error Handling**

### Data Validation
- [ ] Cannot submit empty forms
- [ ] Required fields are enforced
- [ ] Date fields validate properly
- [ ] Number fields only accept numbers
- [ ] Email fields validate format
- [ ] Phone fields validate format

### Network Errors
- [ ] API timeout shows user-friendly error
- [ ] Failed requests can be retried
- [ ] Offline state handled gracefully
- [ ] Loading states display appropriately

### File Upload Edge Cases
- [ ] Very large files (>10MB) handled or rejected
- [ ] Invalid file types rejected
- [ ] Upload progress shows accurately
- [ ] Upload cancellation works
- [ ] Multiple simultaneous uploads handled

### Empty States
- [ ] Empty dashboard shows helpful message
- [ ] No properties shows empty state
- [ ] No jobs shows empty state
- [ ] No invoices shows empty state
- [ ] No notifications shows empty state

### Permissions & Security
- [ ] Customer cannot access other customer's data
- [ ] Cannot modify data without proper authentication
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] CSRF protection in place

---

## 10. **UI/UX Verification**

### Responsive Design
- [ ] Desktop layout looks correct (1920x1080)
- [ ] Laptop layout looks correct (1366x768)
- [ ] Tablet layout adapts properly (768px)
- [ ] Mobile layout works (375px)
- [ ] Navigation is accessible on all screen sizes

### Visual Consistency
- [ ] Colors match theme throughout
- [ ] Typography is consistent
- [ ] Spacing follows grid system
- [ ] Buttons have consistent styling
- [ ] Cards have consistent styling
- [ ] Forms have consistent layout

### Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG standards
- [ ] Images have alt text
- [ ] Forms have proper labels

### Performance
- [ ] Pages load within 2 seconds
- [ ] Large lists paginate or virtualize
- [ ] Images are optimized
- [ ] No console errors on any page
- [ ] No console warnings about React keys
- [ ] No memory leaks during navigation

---

## 11. **Data Persistence & Refresh**

### State Management
- [ ] Form data persists during validation errors
- [ ] Filters persist during navigation
- [ ] Sort preferences persist
- [ ] Page navigation doesn't lose context

### Refresh Scenarios
- [ ] Dashboard refreshes show latest data
- [ ] Browser refresh maintains login state
- [ ] Pull-to-refresh works on mobile
- [ ] Auto-refresh for real-time data (if applicable)

### Data Synchronization
- [ ] Creating item updates list immediately
- [ ] Updating item refreshes detail view
- [ ] Deleting item removes from list
- [ ] Concurrent updates handled correctly

---

## 12. **Specific Bug-Prone Areas to Check**

### Photo Upload System
- [ ] FormData Content-Type is correctly omitted (let browser set it)
- [ ] Photos link to maintenance jobs correctly
- [ ] Photo IDs are returned and stored
- [ ] Before/after photos display in correct order
- [ ] Cannot complete job without both photo types

### Invoice System
- [ ] Decimal values convert correctly with Number()
- [ ] Statistics calculations include all relevant invoices
- [ ] Date filtering works for month/year boundaries
- [ ] Invoice generation is idempotent (doesn't create duplicates)
- [ ] Invoice line items JSON structure is correct

### Notification System
- [ ] All status changes trigger notifications
- [ ] Notification type enum values are correct
- [ ] Notification metadata JSON is valid
- [ ] Customer receives notifications for their jobs only
- [ ] Notifications link to correct resources

### Completed Jobs
- [ ] API fetches COMPLETED status jobs
- [ ] Frontend filters completed jobs correctly
- [ ] Completed count matches actual completed jobs
- [ ] Completed jobs show all necessary information
- [ ] Quote information available for completed jobs

---

## **Priority High-Risk Areas**

These are the most critical paths that should absolutely work:

### 1. End-to-end maintenance job flow
Create → Quote → Approve → Schedule → Complete → Invoice → Customer sees it

### 2. Guest issue reporting
Guest reports → Customer sees → Customer submits to maintenance → Maintenance receives

### 3. Invoice generation and display
Job completes → Invoice generates → Shows in both portals → Statistics calculate correctly

### 4. Notification delivery
Every status change → Customer receives notification → Notification is accurate

### 5. Photo upload in job completion
Select files → Upload → Complete job → Photos visible in job details

---

## **Known Issues to Track**

### Currently Identified Bugs:
1. **Property Cards Not Clickable**: Customer portal property cards should be clickable to view details
2. **Cannot Add Properties**: Should be able to add properties for other customers from customer portal
3. **Guest Issue Cards Not Clickable**: Guest issue cards should be clickable to see full details
4. **Guest Issue Status Tag**: Tag says "WORK ORDER CREATED" but should update based on workflow status
5. **Quotes Page Limited**: Only shows quotes needing approval, should mirror dashboard (all quotes)
6. **Invoice Rows Not Clickable**: Should be able to click into invoices to view details

---

## Testing Notes

- Start with Priority High-Risk Areas first
- Document any bugs found with screenshots
- Note browser and device information for bugs
- Check console for errors on every page
- Test with different user roles/permissions
- Test with varying amounts of data (empty, single, many items)

---

*Last Updated: 2025-11-07*
*Latest Addition: Worker Availability & Scheduling features*
