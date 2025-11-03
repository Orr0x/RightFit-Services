# Technical Patterns & Best Practices

**Last Updated**: 2025-11-03

---

## 🎯 Overview

This document captures important technical patterns and best practices discovered during implementation. Following these patterns will prevent common errors and maintain code consistency.

---

## 1. Prisma Decimal Type Handling

### The Problem

Prisma returns database `DECIMAL` and `NUMERIC` fields as `Decimal` objects (from the `decimal.js` library), NOT as JavaScript numbers. This causes runtime errors when using number methods.

**Common Error**:
```typescript
// ❌ WRONG - This will crash!
<Typography>Total: £{quote.total.toFixed(2)}</Typography>

// Error: quote.total.toFixed is not a function
```

### The Solution

Always wrap Prisma Decimal values in `Number()` before using number methods:

```typescript
// ✅ CORRECT
<Typography>Total: £{Number(quote.total).toFixed(2)}</Typography>
```

### Where This Applies

**In Schema**:
Any field with type `Decimal` in `schema.prisma`:
```prisma
model MaintenanceQuote {
  subtotal    Decimal  @db.Decimal(10, 2)
  tax_amount  Decimal  @db.Decimal(10, 2)
  total       Decimal  @db.Decimal(10, 2)
}

model MaintenanceJob {
  estimated_total  Decimal?  @db.Decimal(10, 2)
  actual_total     Decimal?  @db.Decimal(10, 2)
}

model MaintenanceQuoteLineItem {
  unit_price  Decimal  @db.Decimal(10, 2)
  total       Decimal  @db.Decimal(10, 2)
}
```

**In Frontend Code**:

```typescript
// Display quote total
£{Number(quote.total).toFixed(2)}

// Display job costs
£{Number(job.estimated_total).toFixed(2)}
£{Number(job.actual_total).toFixed(2)}

// Display line item prices
£{Number(lineItem.unit_price).toFixed(2)}
£{Number(lineItem.total).toFixed(2)}
```

**In Calculations**:

```typescript
// Subtotal calculation
const subtotal = lineItems.reduce((sum, item) =>
  sum + Number(item.total || 0),
  0
)

// Total jobs value
const totalValue = jobs.reduce((sum, job) =>
  sum + Number(job.estimated_total || 0),
  0
).toFixed(2)
```

**In Conditional Logic**:

```typescript
// Comparing values
if (Number(job.actual_total) > Number(job.estimated_total)) {
  // Over budget
}

// Null checks with decimals
const total = job.estimated_total
  ? Number(job.estimated_total).toFixed(2)
  : '0.00'
```

### Files Affected in Our Project

This pattern was applied to fix errors in:
- `apps/web-customer/src/pages/dashboards/CustomerDashboard.tsx` (line 320)
- `apps/web-maintenance/src/pages/dashboards/MaintenanceDashboard.tsx` (lines 223, 240, 245, 297-298)
- `apps/web-maintenance/src/components/KanbanView.tsx` (line 148)

### Prevention Checklist

When working with any Prisma model that has Decimal fields:

- [ ] Wrap Decimal in `Number()` before `.toFixed()`
- [ ] Wrap Decimal in `Number()` before mathematical operations
- [ ] Wrap Decimal in `Number()` in reduce operations
- [ ] Wrap Decimal in `Number()` in comparison operations
- [ ] Always check for null/undefined before conversion

### Quick Reference

```typescript
// ✅ CORRECT PATTERNS
Number(decimal).toFixed(2)
Number(decimal || 0).toFixed(2)
sum + Number(item.decimal || 0)
Number(decimal1) > Number(decimal2)

// ❌ INCORRECT PATTERNS
decimal.toFixed(2)                    // Runtime error
decimal || 0                           // Returns Decimal object, not 0
decimal1 > decimal2                    // Unreliable comparison
```

---

## 2. Customer Comment System

### Pattern: Timestamp-Appended Comments

**Use Case**: Allowing customers to add comments to jobs without a separate comments table.

**Implementation**:
```typescript
// Service layer (CustomerPortalService.ts)
async addJobComment(customerId: string, jobId: string, comment: string) {
  const job = await prisma.maintenanceJob.findFirst({
    where: { id: jobId, customer_id: customerId }
  })

  if (!job) {
    throw new NotFoundError('Maintenance job not found')
  }

  // Create timestamp
  const commentTimestamp = new Date().toLocaleString()

  // Format comment with timestamp
  const customerComment = `\n\n--- Customer Comment (${commentTimestamp}) ---\n${comment}`

  // Append to existing description
  await prisma.maintenanceJob.update({
    where: { id: jobId },
    data: {
      description: job.description
        ? `${job.description}${customerComment}`
        : `Customer Job${customerComment}`
    }
  })

  return { success: true, message: 'Comment added successfully' }
}
```

**Frontend**:
```typescript
const [comment, setComment] = useState('')

const handleSubmitComment = async () => {
  if (!comment.trim()) {
    return
  }

  await fetch(`/api/customer-portal/maintenance-jobs/${id}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: customerId,
      comment: comment.trim()
    })
  })

  setComment('')
  fetchJobDetails() // Refresh to show new comment
}
```

**Benefits**:
- No database migration needed
- Simple implementation
- Preserves audit trail
- Works with existing description field

**Limitations**:
- No individual comment editing/deletion
- No rich formatting
- Description field can become long

**Future Enhancement**:
Create dedicated `JobComments` table for better structure.

---

## 3. Multi-Tenant Data Access

### Pattern: Tenant Isolation via Middleware

**Customer Portal Authentication**:
```typescript
// apps/api/src/routes/customer-portal.ts
const customerAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const customerId = req.query.customer_id as string || req.body.customer_id

  if (!customerId) {
    return res.status(401).json({ error: 'customer_id is required' })
  }

  // Store customer_id in request for use in route handlers
  (req as any).customerId = customerId
  next()
}

// Apply to all protected routes
router.get('/dashboard', customerAuthMiddleware, async (req, res, next) => {
  const customerId = (req as any).customerId
  // Use customerId for tenant isolation
})
```

**Service Provider Routes**:
```typescript
// apps/api/src/routes/maintenance-jobs.ts
// Validates service_provider_id in request body/query

const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

// All queries filtered by service_provider_id
const jobs = await prisma.maintenanceJob.findMany({
  where: {
    service_provider_id: SERVICE_PROVIDER_ID,
    // ... other filters
  }
})
```

**Shared Data Access**:
```typescript
// Same job, different tenant filters

// Customer view
const job = await prisma.maintenanceJob.findFirst({
  where: {
    id: jobId,
    customer_id: customerId  // Customer tenant filter
  }
})

// Service Provider view
const job = await prisma.maintenanceJob.findFirst({
  where: {
    id: jobId,
    service_provider_id: providerId  // Provider tenant filter
  }
})
```

**Best Practices**:
- Always filter by tenant ID at database level
- Never trust client-provided IDs without validation
- Use middleware for consistent tenant checking
- Return 404 if resource not found in tenant
- Never expose cross-tenant data

---

## 4. Tab State Management with Auto-Switching

### Pattern: Navigate to Relevant Tab After Action

**Use Case**: When customer approves a quote, automatically switch to "Scheduled" tab to show the approved job.

**Implementation**:
```typescript
const [activeTab, setActiveTab] = useState(0)

const handleApproveQuote = async (quoteId: string) => {
  const response = await fetch(`/api/customer-portal/quotes/${quoteId}/approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: customerId })
  })

  if (response.ok) {
    fetchDashboardData() // Refresh data
    setActiveTab(1)      // Switch to "Scheduled" tab (index 1)
  }
}
```

**Tab Structure**:
```typescript
<Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
  <Tab label={`Pending Quotes (${pendingQuotes.length})`} />     {/* index 0 */}
  <Tab label={`Scheduled (${scheduledJobs.length})`} />          {/* index 1 */}
  <Tab label={`In Progress (${inProgressJobs.length})`} />       {/* index 2 */}
  <Tab label="Invoices" />                                       {/* index 3 */}
</Tabs>

{activeTab === 0 && <PendingQuotesTab />}
{activeTab === 1 && <ScheduledTab />}
{activeTab === 2 && <InProgressTab />}
{activeTab === 3 && <InvoicesTab />}
```

**Benefits**:
- Provides immediate feedback to user
- Reduces confusion about where item went
- Guides user through workflow naturally

**Tab Count Badges**:
```typescript
// Show count in tab label
<Tab label={`Pending Quotes (${pendingQuotes.length})`} />

// Updates automatically when data refreshes
```

---

## 5. Clickable Cards with Navigation

### Pattern: Interactive Job Cards

**Implementation**:
```typescript
<Card
  variant="outlined"
  sx={{
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      boxShadow: 3,
      transform: 'translateY(-2px)',
    },
  }}
  onClick={() => navigate(`/jobs/${job.id}`)}
>
  <CardContent>
    <Typography variant="h6">{job.title}</Typography>
    <Typography color="textSecondary">
      Property: {job.property?.property_name}
    </Typography>
    {job.scheduled_date && (
      <Typography color="textSecondary">
        Scheduled: {new Date(job.scheduled_date).toLocaleDateString()}
        {job.scheduled_start_time && ` at ${job.scheduled_start_time}`}
      </Typography>
    )}
    <Chip label={job.status} color="info" size="small" sx={{ mt: 1 }} />
  </CardContent>
</Card>
```

**Benefits**:
- Clear visual feedback on hover
- Intuitive navigation
- Mobile-friendly (tap to navigate)
- Maintains card layout for consistency

**Routing**:
```typescript
// App.tsx
<Route
  path="/jobs/:id"
  element={
    <ProtectedRoute>
      <AppLayout>
        <MaintenanceJobDetails />
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

---

## 6. Navigation Best Practices

### Pattern: Consistent Back Button Navigation

**Problem**: Back buttons navigating to non-existent routes.

**Solution**: Always navigate to `/dashboard` unless there's a specific parent page.

```typescript
// ❌ WRONG - Route doesn't exist
<button onClick={() => navigate('/maintenance-jobs')}>
  ← Back
</button>

// ✅ CORRECT - Navigate to dashboard
<button onClick={() => navigate('/dashboard')}>
  ← Back to Dashboard
</button>
```

**Maintenance Portal Pattern**:
```typescript
<button
  onClick={() => navigate('/dashboard')}
  className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
>
  ← Back to Dashboard
</button>
```

**Customer Portal Pattern** (Material-UI):
```tsx
<Button
  startIcon={<ArrowBackIcon />}
  onClick={() => navigate('/dashboard')}
  variant="outlined"
  sx={{ mb: 2 }}
>
  Back to Dashboard
</Button>
```

---

## 7. Notification Display Pattern

### Pattern: Alert Box with Preview

**Implementation**:
```typescript
{notifications.filter(n => !n.read_at).length > 0 && (
  <Alert severity="info" icon={<NotificationsIcon />} sx={{ mb: 3 }}>
    <AlertTitle>Notifications</AlertTitle>
    {notifications.filter(n => !n.read_at).slice(0, 3).map(notification => (
      <Typography key={notification.id} variant="body2" sx={{ mb: 1 }}>
        • {notification.title}: {notification.body}
      </Typography>
    ))}
  </Alert>
)}
```

**Features**:
- Only shows unread notifications
- Limits to 3 preview items (avoids overwhelming UI)
- Icon for visual recognition
- Dismissible
- Could link to full notifications page

**Backend**:
```typescript
// Get notifications ordered by date
const notifications = await prisma.customerNotification.findMany({
  where: { customer_portal_user_id: portalUser.id },
  orderBy: { sent_at: 'desc' },
  take: 50  // Limit to recent 50
})
```

---

## 8. Environment-Specific Configuration

### Pattern: Service Provider ID Configuration

**Development**:
```typescript
// Hard-coded for development
const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'
```

**Production Pattern** (recommended):
```typescript
// Use environment variable
const SERVICE_PROVIDER_ID = import.meta.env.VITE_SERVICE_PROVIDER_ID || 'default-id'

// Or from authentication context
const { serviceProviderId } = useAuth()
```

**Best Practice**:
- Development: Hard-code for ease
- Production: Use env vars or auth context
- Never commit production IDs to version control
- Document the required env vars

---

## 9. Error Handling Patterns

### Pattern: User-Friendly Error Messages

```typescript
try {
  const response = await apiClient.post('/endpoint', data)
  toast.success('Action completed successfully')
  onSuccess()
} catch (err: any) {
  // Check for specific error types
  if (err.response?.status === 404) {
    toast.error('Resource not found')
  } else if (err.response?.data?.message) {
    toast.error(err.response.data.message)
  } else {
    toast.error('An unexpected error occurred')
  }
  console.error('Detailed error:', err)
}
```

**Backend Error Response**:
```typescript
// Return structured errors
return res.status(400).json({
  error: 'Validation failed',
  message: 'Quote total must be greater than zero',
  details: {
    field: 'total',
    value: quoteTotal
  }
})
```

---

## 10. Data Fetching Patterns

### Pattern: Load Related Data in Parallel

```typescript
useEffect(() => {
  // Load data in parallel for better performance
  Promise.all([
    fetchDashboardData(),
    fetchNotifications()
  ])
}, [])

const fetchDashboardData = async () => {
  const response = await fetch(`/api/customer-portal/dashboard?customer_id=${customerId}`)
  const data = await response.json()

  setStats(data.data.statistics)
  setPendingQuotes(data.data.pendingQuotes)
  setScheduledJobs(data.data.activeJobs?.maintenance.filter(j => j.status === 'SCHEDULED'))
  setInProgressJobs(data.data.activeJobs?.maintenance.filter(j => j.status === 'IN_PROGRESS'))
}

const fetchNotifications = async () => {
  const response = await fetch(`/api/customer-portal/notifications?customer_id=${customerId}`)
  const data = await response.json()
  setNotifications(data.data)
}
```

**Benefits**:
- Faster page load
- Prevents blocking requests
- Better user experience

---

## 📝 Pattern Summary Checklist

When implementing new features:

- [ ] Wrap all Prisma Decimal values in `Number()` before display
- [ ] Filter all database queries by tenant ID
- [ ] Implement proper error handling with user-friendly messages
- [ ] Use tab auto-switching to guide users through workflows
- [ ] Make cards clickable with hover effects for better UX
- [ ] Use consistent back button navigation to `/dashboard`
- [ ] Show notification previews with unread count
- [ ] Load related data in parallel when possible
- [ ] Validate all user inputs on both frontend and backend
- [ ] Provide immediate feedback for all user actions

---

*Documentation created: 2025-11-03*
*Patterns established during Phase 2.5 implementation*
