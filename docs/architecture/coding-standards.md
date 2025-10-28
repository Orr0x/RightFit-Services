# Coding Standards

## Critical Fullstack Rules

These are the **MUST-FOLLOW** rules that prevent common mistakes and ensure consistency across the codebase.

### **1. Type Sharing**
**Rule:** Always define shared types in `packages/shared` and import from there. Never duplicate type definitions between mobile, web, and API.

**Why:** Ensures type safety across the stack. Changes to data models propagate automatically.

**Example:**
```typescript
// ❌ WRONG - Duplicating types
// apps/mobile/src/types.ts
export interface Property {
  id: string;
  name: string;
}

// apps/web/src/types.ts
export interface Property {  // Duplicate!
  id: string;
  name: string;
}

// ✅ CORRECT - Single source of truth
// packages/shared/src/types/Property.ts
export interface Property {
  id: string;
  tenant_id: string;
  name: string;
  address_line1: string;
  // ...
}

// apps/mobile/src/screens/PropertyListScreen.tsx
import { Property } from '@shared/types/Property'

// apps/api/src/services/PropertiesService.ts
import { Property } from '@shared/types/Property'
```

---

### **2. API Calls**
**Rule:** Never make direct HTTP calls. Always use the service layer (API client functions).

**Why:** Centralizes auth token handling, error handling, retry logic, and offline queue management.

**Example:**
```typescript
// ❌ WRONG - Direct axios call
import axios from 'axios'

const properties = await axios.get('/api/v1/properties', {
  headers: { Authorization: `Bearer ${token}` }  // Error-prone!
})

// ✅ CORRECT - Use service layer
import { propertiesService } from '@/services/propertiesService'

const properties = await propertiesService.list()  // Token, errors handled automatically
```

---

### **3. Environment Variables**
**Rule:** Access environment variables only through config objects, never `process.env` directly.

**Why:** Type safety, validation, single source of truth, easier testing.

**Example:**
```typescript
// ❌ WRONG - Direct process.env access
const apiUrl = process.env.API_BASE_URL  // No type checking, could be undefined!

// ✅ CORRECT - Config object
// apps/web/src/config/index.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
} as const

// Validate on app init
if (!config.stripePublicKey) {
  throw new Error('VITE_STRIPE_PUBLIC_KEY is required')
}

// Usage
import { config } from '@/config'
const url = config.apiBaseUrl
```

---

### **4. Error Handling**
**Rule:** All API routes must use the standard error handler. Never send raw error messages to client.

**Why:** Consistent error format, prevents leaking sensitive information, proper logging.

**Example:**
```typescript
// ❌ WRONG - Raw error handling
app.get('/api/v1/properties', async (req, res) => {
  try {
    const properties = await db.property.findMany()
    res.json(properties)
  } catch (error) {
    res.status(500).json({ error: error.message })  // Leaks stack trace!
  }
})

// ✅ CORRECT - Use error handler middleware
import { AppError } from '@/utils/errors'

app.get('/api/v1/properties', async (req, res, next) => {
  try {
    const properties = await propertiesService.list(req.tenant_id)
    res.json({ data: properties })
  } catch (error) {
    next(error)  // Caught by error handler middleware
  }
})

// Or throw AppError directly
if (!property) {
  throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND')
}
```

---

### **5. State Updates**
**Rule:** Never mutate state directly. Use proper state management patterns (Redux Toolkit, React setState).

**Why:** Prevents hard-to-debug side effects, ensures React re-renders correctly.

**Example:**
```typescript
// ❌ WRONG - Direct mutation
const [properties, setProperties] = useState<Property[]>([])

properties.push(newProperty)  // Mutates state directly!
properties[0].name = 'Updated'  // Mutates state directly!

// ✅ CORRECT - Immutable updates
setProperties([...properties, newProperty])
setProperties(properties.map(p =>
  p.id === targetId ? { ...p, name: 'Updated' } : p
))

// Redux Toolkit (automatically uses Immer for immutable updates)
const propertiesSlice = createSlice({
  name: 'properties',
  initialState: [],
  reducers: {
    addProperty: (state, action) => {
      state.push(action.payload)  // Looks like mutation, but Immer makes it immutable!
    },
  },
})
```

---

### **6. Multi-Tenancy Enforcement**
**Rule:** All database queries MUST filter by `tenant_id`. Use middleware to inject `tenant_id` from JWT automatically.

**Why:** Prevents data leaks between tenants (security-critical).

**Example:**
```typescript
// ❌ WRONG - Missing tenant_id filter
const properties = await prisma.property.findMany()  // Returns all tenants' properties!

// ✅ CORRECT - Use middleware-injected tenant_id
const properties = await prisma.property.findMany({
  where: { tenant_id: req.tenant_id }  // Injected by tenant middleware
})

// Even better: Use repository layer (automatic tenant_id filtering)
const properties = await propertiesRepository.findAll()  // tenant_id added automatically
```

---

### **7. Offline Queue Management**
**Rule:** All mobile create/update operations must go through sync queue. Never call API directly if offline mode enabled.

**Why:** Ensures data isn't lost when offline, maintains consistency.

**Example:**
```typescript
// ❌ WRONG - Direct API call (fails if offline)
await api.post('/work-orders', workOrderData)

// ✅ CORRECT - Queue for sync
import { offlineQueue } from '@/database/sync/OfflineQueue'

await offlineQueue.add({
  action: 'CREATE',
  entity_type: 'work_order',
  payload: workOrderData,
})
// Will sync automatically when online
```

---

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| **Components** | PascalCase | - | `PropertyCard.tsx` |
| **Screens/Pages** | PascalCase + "Screen"/"Page" suffix | - | `PropertyListScreen.tsx`, `DashboardPage.tsx` |
| **Hooks** | camelCase with 'use' prefix | - | `useOfflineSync.ts`, `useAuth.ts` |
| **Services** | PascalCase + "Service" suffix | PascalCase + "Service" suffix | `PropertiesService.ts` |
| **API Routes** | - | kebab-case | `/api/v1/work-orders` |
| **Database Tables** | - | snake_case | `work_orders`, `user_profiles` |
| **Prisma Models** | - | PascalCase (singular) | `WorkOrder`, `Property` |
| **TypeScript Interfaces** | PascalCase | PascalCase | `Property`, `WorkOrder` |
| **TypeScript Types** | PascalCase | PascalCase | `WorkOrderStatus`, `ApiResponse<T>` |
| **Enums** | PascalCase | PascalCase | `WorkOrderStatus`, `PropertyType` |
| **Constants** | UPPER_SNAKE_CASE | UPPER_SNAKE_CASE | `MAX_PHOTO_SIZE`, `API_TIMEOUT` |
| **Functions** | camelCase | camelCase | `formatDate()`, `calculateCost()` |

---

## File Organization Rules

### Frontend Components

**Rule:** Group components by feature, not by type.

```
// ❌ WRONG - Grouped by type
src/
  components/
    buttons/
      PrimaryButton.tsx
      SecondaryButton.tsx
    cards/
      PropertyCard.tsx
      WorkOrderCard.tsx
    modals/
      CreatePropertyModal.tsx

// ✅ CORRECT - Grouped by feature
src/
  components/
    common/
      Button.tsx
      Card.tsx
      Modal.tsx
    properties/
      PropertyCard.tsx
      CreatePropertyModal.tsx
      PropertyFilters.tsx
    workOrders/
      WorkOrderCard.tsx
      WorkOrderStatusBadge.tsx
```

### Backend Services

**Rule:** One service per domain entity, services call repositories, repositories call Prisma.

```
// apps/api/src/services/PropertiesService.ts
export class PropertiesService {
  async list(tenantId: string): Promise<Property[]> {
    return propertiesRepository.findAll(tenantId)
  }

  async create(tenantId: string, data: CreatePropertyDto): Promise<Property> {
    const validated = propertySchema.parse(data)  // Validate first
    return propertiesRepository.create(tenantId, validated)
  }
}

// apps/api/src/repositories/PropertiesRepository.ts
export class PropertiesRepository {
  async findAll(tenantId: string): Promise<Property[]> {
    return prisma.property.findMany({
      where: { tenant_id: tenantId, deleted_at: null }
    })
  }

  async create(tenantId: string, data: CreatePropertyData): Promise<Property> {
    return prisma.property.create({
      data: { ...data, tenant_id: tenantId }
    })
  }
}
```

---

## Code Comments

### When to Comment

**DO comment:**
- **Why** decisions were made (not **what** the code does)
- Complex business logic
- Workarounds for third-party library bugs
- Security-sensitive code
- Performance optimizations

**DON'T comment:**
- Obvious code (self-documenting code is better)
- Disabled code (delete it, use git history)
- TODO comments without ticket numbers

**Example:**
```typescript
// ❌ BAD - Obvious comment
// Loop through properties
properties.forEach(property => {
  // Set status to active
  property.status = 'ACTIVE'
})

// ✅ GOOD - Explains "why"
// Gas Safety certificates must be checked within 60 days of expiration per UK law.
// We send notifications at 60, 30, and 7 days to ensure landlords renew on time.
const CERTIFICATE_WARNING_DAYS = [60, 30, 7]

// ✅ GOOD - Documents workaround
// WORKAROUND: WatermelonDB doesn't support complex JOIN queries.
// We fetch properties and work_orders separately then merge in-memory.
// Revisit if performance becomes an issue (>1000 properties).
const properties = await database.get('properties').query().fetch()
const workOrders = await database.get('work_orders').query().fetch()
const merged = mergePropertiesWithWorkOrders(properties, workOrders)
```

---

## TypeScript Specific

### Strict Mode

**Rule:** Always use `strict: true` in tsconfig.json. Never use `any` unless absolutely necessary.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Inference

**Rule:** Let TypeScript infer types when obvious. Explicitly type function parameters and return types.

```typescript
// ❌ Unnecessary explicit types
const name: string = 'Highland Cabin #2'  // Type is obvious
const count: number = properties.length

// ✅ Let TypeScript infer
const name = 'Highland Cabin #2'
const count = properties.length

// ✅ Explicit types for functions
function calculateCost(hourlyRate: number, hours: number): number {
  return hourlyRate * hours
}

// ✅ Explicit types for complex objects
const config: AppConfig = {
  apiBaseUrl: process.env.API_BASE_URL!,
  timeout: 5000,
}
```

---

## Testing Standards

### Test File Naming

**Rule:** Test files must be named `*.test.ts` or `*.spec.ts` (prefer `.test.ts` for consistency).

```
src/
  services/
    PropertiesService.ts
    PropertiesService.test.ts  ✅
```

### Test Structure

**Rule:** Use Arrange-Act-Assert (AAA) pattern.

```typescript
describe('PropertiesService', () => {
  describe('list', () => {
    it('should return only properties for given tenant', async () => {
      // Arrange
      const tenantId = 'tenant-123'
      const mockProperties = [
        { id: '1', tenant_id: tenantId, name: 'Property 1' },
        { id: '2', tenant_id: tenantId, name: 'Property 2' },
      ]
      jest.spyOn(propertiesRepository, 'findAll').mockResolvedValue(mockProperties)

      // Act
      const result = await propertiesService.list(tenantId)

      // Assert
      expect(result).toEqual(mockProperties)
      expect(propertiesRepository.findAll).toHaveBeenCalledWith(tenantId)
    })
  })
})
```

---

## Git Commit Messages

### Format

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build process, dependencies

### Examples

```
feat(work-orders): add offline sync queue

Implemented WatermelonDB sync adapter for work orders.
Changes are queued locally and synced when connection restored.

Closes #42

---

fix(auth): refresh token rotation not working

Refresh tokens were not being rotated on /auth/refresh endpoint.
Added token rotation logic and updated tests.

Fixes #87

---

docs(architecture): add database schema documentation

Added Prisma schema with all entities and relationships.
Documented multi-tenancy strategy and indexing decisions.
```

---

