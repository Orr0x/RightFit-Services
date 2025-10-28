# Core Workflows

## Emergency Maintenance During Guest Stay

```mermaid
sequenceDiagram
    participant Guest
    participant Landlord as Landlord (Mobile)
    participant API as RightFit API
    participant DB as PostgreSQL
    participant Twilio as Twilio SMS
    participant Contractor as Contractor (Mobile)

    Guest->>Landlord: Reports heating failure (Airbnb message)
    Landlord->>Landlord: Opens mobile app
    Landlord->>API: POST /api/v1/work-orders (Emergency, Heating)
    API->>DB: Create work_order with status=OPEN
    DB-->>API: work_order created
    API-->>Landlord: 201 Created

    Landlord->>API: POST /api/v1/work-orders/:id/assign
    API->>DB: Update work_order.contractor_id, status=ASSIGNED
    API->>Twilio: Send SMS to contractor
    API->>Contractor: Push notification (FCM)
    Twilio-->>Contractor: SMS: "URGENT: Heating failure..."
    API-->>Landlord: 200 OK

    Contractor->>API: GET /api/v1/work-orders/:id
    API-->>Contractor: Work order details + property access
    Contractor->>Contractor: Taps "Accept Job"
    Contractor->>API: PUT /api/v1/work-orders/:id (status=IN_PROGRESS)
    API->>DB: Update status, started_at timestamp
    API-->>Landlord: Push notification: "Contractor accepted"

    Contractor->>API: POST /api/v1/work-orders/:id/photos (diagnostic photo)
    API->>S3: Upload photo
    API->>GoogleVision: Analyze photo quality
    API->>DB: Save photo metadata
    API-->>Contractor: 201 Created

    Contractor->>Contractor: Completes repair
    Contractor->>API: POST /api/v1/work-orders/:id/photos (after photo)
    Contractor->>API: PUT /api/v1/work-orders/:id (status=COMPLETED, actual_cost=180)
    API->>DB: Update work_order
    API-->>Landlord: Push notification: "Work order completed"

    Landlord->>API: GET /api/v1/work-orders/:id
    API-->>Landlord: Full details + before/after photos
    Landlord->>Landlord: Reviews photos, approves
    Landlord->>API: POST /api/v1/work-orders/:id/rate (5 stars)
```

**Critical Requirements:**
- Work order creation must complete in <60 seconds on 4G
- SMS notification sent within 30 seconds of assignment
- Contractor receives push notification immediately if app installed
- Photo upload with AI quality check <10 seconds on 4G
- Complete audit trail: timestamps, photos, location data, resolution

---

## Offline Work Order Creation (Rural Property Visit)

```mermaid
sequenceDiagram
    participant Landlord as Landlord (Mobile App)
    participant LocalDB as WatermelonDB (SQLite)
    participant SyncQueue as Sync Queue
    participant API as RightFit API
    participant ServerDB as PostgreSQL

    Note over Landlord: Arrives at remote property<br/>(NO INTERNET)
    Landlord->>Landlord: App detects offline mode

    Landlord->>LocalDB: Create work_order (client_id: temp-uuid-1)
    LocalDB-->>Landlord: Saved locally
    Landlord->>LocalDB: Take 3 photos, attach to work_order
    LocalDB-->>Landlord: Photos saved locally
    Landlord->>SyncQueue: Add CREATE action (temp-uuid-1)
    SyncQueue-->>Landlord: Queued (status: PENDING)

    Note over Landlord: Creates 2nd work order offline
    Landlord->>LocalDB: Create work_order (client_id: temp-uuid-2)
    Landlord->>SyncQueue: Add CREATE action (temp-uuid-2)

    Note over Landlord: Drives away, regains signal
    Landlord->>Landlord: App detects connection restored
    Landlord->>API: POST /api/v1/sync/work-orders (batch)
    Note over API: [temp-uuid-1, temp-uuid-2] + photos

    API->>ServerDB: Create work_order_1 (server_id: real-uuid-1)
    API->>ServerDB: Create work_order_2 (server_id: real-uuid-2)
    API->>S3: Upload 3 photos from work_order_1
    API-->>Landlord: Sync results (client → server ID mapping)

    Landlord->>LocalDB: Update local records (temp-uuid-1 → real-uuid-1)
    Landlord->>SyncQueue: Mark actions as SYNCED
    Landlord->>Landlord: Show notification: "All offline changes synced"
```

**Critical Requirements:**
- App fully functional offline (create work orders, take photos, add notes)
- No data loss if app crashes during offline session (persistent local storage)
- Automatic sync when connection restored (no manual "sync now" button)
- Sync conflict resolution (last-write-wins acceptable for MVP)
- Photo upload optimization (compress before upload on slow connections)

---

## Multi-Tenant Data Isolation Flow

```mermaid
sequenceDiagram
    participant Client as Client (Mobile/Web)
    participant API as Express API
    participant AuthMiddleware as Auth Middleware
    participant TenantMiddleware as Tenant Middleware
    participant Service as Properties Service
    participant Repository as Properties Repository
    participant DB as PostgreSQL

    Client->>API: GET /api/v1/properties<br/>Authorization: Bearer <JWT>

    API->>AuthMiddleware: Verify JWT
    AuthMiddleware->>AuthMiddleware: Decode JWT payload
    Note over AuthMiddleware: Extract user_id, tenant_id, role
    AuthMiddleware->>API: Attach req.user, req.tenant_id

    API->>TenantMiddleware: Inject tenant_id into context
    Note over TenantMiddleware: All queries will filter by tenant_id

    API->>Service: propertiesService.list(req.tenant_id)
    Service->>Repository: propertiesRepository.findAll(tenant_id)
    Repository->>DB: SELECT * FROM properties WHERE tenant_id = $1 AND deleted_at IS NULL
    DB-->>Repository: [property1, property2, ...]
    Repository-->>Service: Properties[]
    Service-->>API: Properties[]
    API-->>Client: 200 OK { data: [...] }
```

**Security Enforcement:**
1. **JWT contains tenant_id**: Immutable, cryptographically signed
2. **Middleware injects tenant_id**: Every request automatically filtered
3. **Repository layer enforces**: No raw SQL without tenant_id filter
4. **Database row-level constraints**: Foreign keys enforce referential integrity per tenant

**Failure Modes:**
- **Invalid JWT**: 401 Unauthorized (before tenant_id extraction)
- **Missing tenant_id**: 403 Forbidden (user not associated with tenant)
- **Cross-tenant access attempt**: Returns empty result set (tenant_id filter prevents leaks)

---

