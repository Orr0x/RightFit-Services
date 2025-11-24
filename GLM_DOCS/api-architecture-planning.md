# API Architecture Planning - RightFit Services Separation

## Overview

This document provides comprehensive API architecture planning for separating the RightFit Services monolithic API into independent service-specific APIs for cleaning and maintenance operations, along with shared authentication services.

## API Architecture Strategy

### 1. Service-Oriented Architecture Overview

#### Target Architecture Diagram

```yaml
# ================================================================
# RightFit Services Target API Architecture
# ================================================================

api_gateway:
  host: api.rightfit-services.com
  port: 443
  protocol: https
  services:
    - shared_auth_service
    - cleaning_api
    - maintenance_api
    - notification_service
    - analytics_service

microservices:
  shared_auth_service:
    description: "Centralized authentication and authorization"
    endpoints: "/auth/*"
    database: "shared_auth_service"
    technology: "Node.js + Express"

  cleaning_api:
    description: "Cleaning service specific operations"
    endpoints: "/cleaning/*"
    database: "cleaning_db"
    technology: "Node.js + Express"

  maintenance_api:
    description: "Maintenance service specific operations"
    endpoints: "/maintenance/*"
    database: "maintenance_db"
    technology: "Node.js + Express"

  notification_service:
    description: "Cross-service notifications and communications"
    endpoints: "/notifications/*"
    databases: ["shared_auth_service", "cleaning_db", "maintenance_db"]
    technology: "Node.js + Express"

  analytics_service:
    description: "Cross-service analytics and reporting"
    endpoints: "/analytics/*"
    databases: ["shared_auth_service", "cleaning_db", "maintenance_db"]
    technology: "Python + FastAPI"

infrastructure:
  load_balancer: "AWS Application Load Balancer"
  api_gateway: "AWS API Gateway"
  service_discovery: "AWS Cloud Map"
  monitoring: "AWS CloudWatch + X-Ray"
  security: "AWS WAF + Cognito"
```

### 2. API Design Principles

#### Core API Design Guidelines

```yaml
# ================================================================
# API Design Principles
# ================================================================

design_principles:
  consistency:
    - "Uniform error response formats across all services"
    - "Consistent naming conventions (camelCase for properties, kebab-case for endpoints)"
    - "Standard HTTP status code usage"
    - "Unified authentication patterns"

  scalability:
    - "Stateless service design"
    - "Horizontal scaling capability"
    - "Asynchronous processing for long-running operations"
    - "Caching strategies implemented"

  security:
    - "Defense in depth security model"
    - "JWT-based authentication"
    - "Role-based access control (RBAC)"
    - "API rate limiting and throttling"
    - "Input validation and sanitization"

  maintainability:
    - "Comprehensive API documentation"
    - "Versioning strategy implemented"
    - "Automated testing coverage"
    - "Observability and monitoring"
    - "Standardized logging and error handling"

  performance:
    - "Response time targets (<200ms for 95th percentile)"
    - "Efficient database query patterns"
    - "Appropriate use of caching"
    - "Pagination for large datasets"
    - "Compression for API responses"
```

### 3. API Specification Design

#### Service-Specific API Specifications

```yaml
# ================================================================
# Shared Authentication Service API Specification
# ================================================================

openapi: 3.0.3
info:
  title: RightFit Shared Authentication Service API
  description: |
    Centralized authentication and authorization service for RightFit platform.
    Provides user authentication, JWT token management, and role-based access control.
  version: 1.0.0
  contact:
    name: RightFit API Team
    email: api-team@rightfit-services.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.rightfit-services.com/auth/v1
    description: Production environment
  - url: https://staging-api.rightfit-services.com/auth/v1
    description: Staging environment
  - url: http://localhost:3001/auth/v1
    description: Development environment

security:
  - BearerAuth: []

paths:
  /auth/login:
    post:
      tags:
        - Authentication
      summary: User login
      description: Authenticate user and return JWT tokens
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginResponse'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '429':
          description: Too many login attempts
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/logout:
    post:
      tags:
        - Authentication
      summary: User logout
      description: Invalidate user's refresh token
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Logout successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Success'
        '401':
          description: Invalid token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/refresh:
    post:
      tags:
        - Authentication
      summary: Refresh access token
      description: Generate new access token using refresh token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RefreshTokenRequest'
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RefreshTokenResponse'
        '401':
          description: Invalid refresh token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/register:
    post:
      tags:
        - Authentication
      summary: User registration
      description: Register new user account
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: User registered successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
        '409':
          description: User already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/profile:
    get:
      tags:
        - User Profile
      summary: Get user profile
      description: Retrieve current user's profile information
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Profile retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags:
        - User Profile
      summary: Update user profile
      description: Update current user's profile information
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateProfileRequest'
      responses:
        '200':
          description: Profile updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/users/{userId}:
    get:
      tags:
        - User Management
      summary: Get user by ID
      description: Retrieve user information by ID (admin only)
      security:
        - BearerAuth: []
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: User retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '404':
          description: User not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: Forbidden (admin access required)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  schemas:
    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          example: "user@rightfit-services.com"
        password:
          type: string
          format: password
          minLength: 8
          example: "SecurePassword123!"
        rememberMe:
          type: boolean
          default: false

    LoginResponse:
      type: object
      properties:
        user:
          $ref: '#/components/schemas/UserResponse'
        accessToken:
          type: string
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        refreshToken:
          type: string
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        expiresIn:
          type: integer
          example: 3600

    RefreshTokenRequest:
      type: object
      required:
        - refreshToken
      properties:
        refreshToken:
          type: string
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    RefreshTokenResponse:
      type: object
      properties:
        accessToken:
          type: string
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        expiresIn:
          type: integer
          example: 3600

    RegisterRequest:
      type: object
      required:
        - email
        - password
        - firstName
        - lastName
        - role
      properties:
        email:
          type: string
          format: email
          example: "newuser@rightfit-services.com"
        password:
          type: string
          format: password
          minLength: 8
          example: "SecurePassword123!"
        firstName:
          type: string
          example: "John"
        lastName:
          type: string
          example: "Doe"
        phone:
          type: string
          example: "+1-555-123-4567"
        role:
          type: string
          enum: [CUSTOMER, CONTRACTOR, EMPLOYEE, ADMIN]
          example: "CUSTOMER"

    UpdateProfileRequest:
      type: object
      properties:
        firstName:
          type: string
          example: "John"
        lastName:
          type: string
          example: "Doe"
        phone:
          type: string
          example: "+1-555-123-4567"
        addressLine1:
          type: string
          example: "123 Main St"
        addressLine2:
          type: string
          example: "Apt 4B"
        city:
          type: string
          example: "New York"
        state:
          type: string
          example: "NY"
        postalCode:
          type: string
          example: "10001"

    UserResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        email:
          type: string
          format: email
          example: "user@rightfit-services.com"
        firstName:
          type: string
          example: "John"
        lastName:
          type: string
          example: "Doe"
        phone:
          type: string
          example: "+1-555-123-4567"
        role:
          type: string
          enum: [CUSTOMER, CONTRACTOR, EMPLOYEE, ADMIN]
          example: "CUSTOMER"
        isActive:
          type: boolean
          example: true
        createdAt:
          type: string
          format: date-time
          example: "2024-01-15T10:30:00Z"
        updatedAt:
          type: string
          format: date-time
          example: "2024-01-20T15:45:00Z"

    Success:
      type: object
      properties:
        success:
          type: boolean
          example: true
        message:
          type: string
          example: "Operation completed successfully"

    Error:
      type: object
      required:
        - error
        - message
      properties:
        error:
          type: string
          example: "VALIDATION_ERROR"
        message:
          type: string
          example: "Request validation failed"
        details:
          type: object
          additionalProperties: true
        timestamp:
          type: string
          format: date-time
          example: "2024-01-15T10:30:00Z"
        requestId:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"

    ValidationError:
      type: object
      required:
        - error
        - message
        - validationErrors
      properties:
        error:
          type: string
          example: "VALIDATION_ERROR"
        message:
          type: string
          example: "Request validation failed"
        validationErrors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
                example: "email"
              message:
                type: string
                example: "Invalid email format"
        timestamp:
          type: string
          format: date-time
          example: "2024-01-15T10:30:00Z"
        requestId:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

tags:
  - name: Authentication
    description: User authentication and token management endpoints
  - name: User Profile
    description: User profile management endpoints
  - name: User Management
    description: User management endpoints (admin only)
```

#### Cleaning Service API Specification

```yaml
# ================================================================
# Cleaning Service API Specification
# ================================================================

openapi: 3.0.3
info:
  title: RightFit Cleaning Service API
  description: |
    Cleaning service specific operations including customer management,
    job scheduling, property management, and financial operations.
  version: 1.0.0

servers:
  - url: https://api.rightfit-services.com/cleaning/v1
    description: Production environment
  - url: https://staging-api.rightfit-services.com/cleaning/v1
    description: Staging environment
  - url: http://localhost:3002/cleaning/v1
    description: Development environment

security:
  - BearerAuth: []

paths:
  /customers:
    get:
      tags:
        - Customers
      summary: List customers
      description: Retrieve list of cleaning service customers
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: search
          in: query
          schema:
            type: string
        - name: isActive
          in: query
          schema:
            type: boolean
      responses:
        '200':
          description: Customers retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerListResponse'

    post:
      tags:
        - Customers
      summary: Create customer
      description: Create new cleaning service customer
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateCustomerRequest'
      responses:
        '201':
          description: Customer created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'

  /customers/{customerId}:
    get:
      tags:
        - Customers
      summary: Get customer by ID
      description: Retrieve specific cleaning customer by ID
      security:
        - BearerAuth: []
      parameters:
        - name: customerId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Customer retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerResponse'
        '404':
          description: Customer not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags:
        - Customers
      summary: Update customer
      description: Update cleaning customer information
      security:
        - BearerAuth: []
      parameters:
        - name: customerId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateCustomerRequest'
      responses:
        '200':
          description: Customer updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerResponse'
        '404':
          description: Customer not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /jobs:
    get:
      tags:
        - Jobs
      summary: List jobs
      description: Retrieve list of cleaning jobs
      security:
        - BearerAuth: []
      parameters:
        - name: customerId
          in: query
          schema:
            type: string
            format: uuid
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, scheduled, in_progress, completed, cancelled]
        - name: assignedContractorId
          in: query
          schema:
            type: string
            format: uuid
        - name: dateFrom
          in: query
          schema:
            type: string
            format: date
        - name: dateTo
          in: query
          schema:
            type: string
            format: date
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Jobs retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobListResponse'

    post:
      tags:
        - Jobs
      summary: Create job
      description: Create new cleaning job
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateJobRequest'
      responses:
        '201':
          description: Job created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'

  /jobs/{jobId}:
    get:
      tags:
        - Jobs
      summary: Get job by ID
      description: Retrieve specific cleaning job by ID
      security:
        - BearerAuth: []
      parameters:
        - name: jobId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Job retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobResponse'
        '404':
          description: Job not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags:
        - Jobs
      summary: Update job
      description: Update cleaning job information
      security:
        - BearerAuth: []
      parameters:
        - name: jobId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateJobRequest'
      responses:
        '200':
          description: Job updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobResponse'
        '404':
          description: Job not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /jobs/{jobId}/assign:
    post:
      tags:
        - Jobs
      summary: Assign contractor to job
      description: Assign a contractor to a cleaning job
      security:
        - BearerAuth: []
      parameters:
        - name: jobId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AssignContractorRequest'
      responses:
        '200':
          description: Contractor assigned successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobResponse'
        '404':
          description: Job or contractor not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  schemas:
    CustomerResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        customerId:
          type: string
          format: uuid
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        phone:
          type: string
        address:
          $ref: '#/components/schemas/Address'
        isActive:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateCustomerRequest:
      type: object
      required:
        - email
        - firstName
        - lastName
        - phone
        - address
      properties:
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        phone:
          type: string
        address:
          $ref: '#/components/schemas/Address'

    UpdateCustomerRequest:
      type: object
      properties:
        firstName:
          type: string
        lastName:
          type: string
        phone:
          type: string
        address:
          $ref: '#/components/schemas/Address'
        isActive:
          type: boolean

    CustomerListResponse:
      type: object
      properties:
        customers:
          type: array
          items:
            $ref: '#/components/schemas/CustomerResponse'
        pagination:
          $ref: '#/components/schemas/Pagination'

    JobResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        customerId:
          type: string
          format: uuid
        propertyId:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [pending, scheduled, in_progress, completed, cancelled]
        scheduledDate:
          type: string
          format: date-time
        durationMinutes:
          type: integer
        price:
          type: number
          format: decimal
        assignedContractorId:
          type: string
          format: uuid
        assignedContractor:
          $ref: '#/components/schemas/Contractor'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateJobRequest:
      type: object
      required:
        - customerId
        - propertyId
        - title
        - scheduledDate
        - durationMinutes
        - price
      properties:
        customerId:
          type: string
          format: uuid
        propertyId:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        scheduledDate:
          type: string
          format: date-time
        durationMinutes:
          type: integer
          minimum: 15
        price:
          type: number
          format: decimal
          minimum: 0
        notes:
          type: string

    UpdateJobRequest:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
        scheduledDate:
          type: string
          format: date-time
        durationMinutes:
          type: integer
        price:
          type: number
          format: decimal
        notes:
          type: string
        status:
          type: string
          enum: [pending, scheduled, in_progress, completed, cancelled]

    AssignContractorRequest:
      type: object
      required:
        - contractorId
      properties:
        contractorId:
          type: string
          format: uuid

    Contractor:
      type: object
      properties:
        id:
          type: string
          format: uuid
        firstName:
          type: string
        lastName:
          type: string
        email:
          type: string
          format: email
        phone:
          type: string
        rating:
          type: number
          format: decimal
        specialties:
          type: array
          items:
            type: string

    Address:
      type: object
      required:
        - addressLine1
        - city
        - state
        - postalCode
      properties:
        addressLine1:
          type: string
        addressLine2:
          type: string
        city:
          type: string
        state:
          type: string
        postalCode:
          type: string
        country:
          type: string
          default: "US"

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer
        hasNext:
          type: boolean
        hasPrev:
          type: boolean

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

tags:
  - name: Customers
    description: Customer management endpoints
  - name: Jobs
    description: Job management endpoints
```

### 4. API Gateway and Routing Configuration

#### API Gateway Configuration

```yaml
# ================================================================
# API Gateway Configuration
# ================================================================

api_gateway_config:
  provider: "Amazon API Gateway"
  version: "2.0"
  domain: "api.rightfit-services.com"

routes:
  # Authentication Service Routes
  - path: "/auth/{proxy+}"
    service: "shared_auth_service"
    methods:
      - GET
      - POST
      - PUT
      - DELETE
    cors:
      enabled: true
      origins: ["https://rightfit-services.com", "https://www.rightfit-services.com"]
    rate_limiting:
      requests_per_minute: 60
      burst_limit: 10
    caching:
      enabled: false
    authentication:
      required: false  # Auth endpoints don't require authentication

  # Cleaning Service Routes
  - path: "/cleaning/{proxy+}"
    service: "cleaning_api"
    methods:
      - GET
      - POST
      - PUT
      - DELETE
    cors:
      enabled: true
      origins: ["https://rightfit-services.com", "https://www.rightfit-services.com"]
    rate_limiting:
      requests_per_minute: 1000
      burst_limit: 100
    caching:
      enabled: true
      ttl_seconds: 300
      cache_key_params: ["customerId", "status", "page", "limit"]
    authentication:
      required: true
      roles: ["CUSTOMER", "CONTRACTOR", "EMPLOYEE", "ADMIN"]

  # Maintenance Service Routes
  - path: "/maintenance/{proxy+}"
    service: "maintenance_api"
    methods:
      - GET
      - POST
      - PUT
      - DELETE
    cors:
      enabled: true
      origins: ["https://rightfit-services.com", "https://www.rightfit-services.com"]
    rate_limiting:
      requests_per_minute: 1000
      burst_limit: 100
    caching:
      enabled: true
      ttl_seconds: 300
      cache_key_params: ["customerId", "status", "page", "limit"]
    authentication:
      required: true
      roles: ["CUSTOMER", "CONTRACTOR", "EMPLOYEE", "ADMIN"]

  # Notification Service Routes
  - path: "/notifications/{proxy+}"
    service: "notification_service"
    methods:
      - GET
      - POST
      - PUT
      - DELETE
    cors:
      enabled: true
      origins: ["https://rightfit-services.com", "https://www.rightfit-services.com"]
    rate_limiting:
      requests_per_minute: 500
      burst_limit: 50
    caching:
      enabled: false
    authentication:
      required: true

  # Analytics Service Routes
  - path: "/analytics/{proxy+}"
    service: "analytics_service"
    methods:
      - GET
      - POST
    cors:
      enabled: true
      origins: ["https://rightfit-services.com", "https://www.rightfit-services.com"]
    rate_limiting:
      requests_per_minute: 200
      burst_limit: 20
    caching:
      enabled: true
      ttl_seconds: 600
    authentication:
      required: true
      roles: ["EMPLOYEE", "ADMIN"]

# Service Discovery Configuration
service_discovery:
  provider: "AWS Cloud Map"
  namespace: "rightfit-services.local"

services:
  shared_auth_service:
    health_check:
      path: "/health"
      interval_seconds: 30
      timeout_seconds: 5
      healthy_threshold: 3
      unhealthy_threshold: 2
    load_balancing:
      algorithm: "round_robin"
      session_stickiness: false

  cleaning_api:
    health_check:
      path: "/health"
      interval_seconds: 30
      timeout_seconds: 5
      healthy_threshold: 3
      unhealthy_threshold: 2
    load_balancing:
      algorithm: "least_connections"
      session_stickiness: false

  maintenance_api:
    health_check:
      path: "/health"
      interval_seconds: 30
      timeout_seconds: 5
      healthy_threshold: 3
      unhealthy_threshold: 2
    load_balancing:
      algorithm: "least_connections"
      session_stickiness: false
```

### 5. API Versioning Strategy

#### Versioning Implementation

```yaml
# ================================================================
# API Versioning Strategy
# ================================================================

versioning_strategy:
  approach: "URI Path Versioning"
  format: "/api/v{version}/{service}/{resource}"
  current_version: "v1"
  supported_versions: ["v1"]
  deprecation_policy:
    notice_period: "6 months"
    sunset_period: "3 months after deprecation"
    communication_channels: ["email", "api_documentation", "developer_portal"]

version_specifics:
  v1:
    description: "Initial version with core functionality"
    release_date: "2024-01-01"
    status: "active"
    breaking_changes_since_previous: "N/A"
    migration_notes: ""

  v2:
    description: "Enhanced version with advanced features"
    planned_release: "2024-07-01"
    status: "planned"
    breaking_changes:
      - "New authentication flow with refresh tokens"
      - "Updated response format for consistency"
      - "Enhanced error handling structure"
    migration_notes: "See migration guide for v1 to v2"

version_headers:
  api_version: "X-API-Version"
  supported_versions: "X-Supported-Versions"
  deprecated_version: "X-API-Deprecated"
  sunset_date: "X-API-Sunset"

backward_compatibility:
  strategies:
    - "Maintain old endpoints during deprecation period"
    - "Add version-specific response headers"
    - "Provide automated migration tools"
    - "Document breaking changes thoroughly"

  response_format_changes:
    v1_to_v2:
      description: "Standardized response format across all services"
      breaking_change: true
      migration_required: true
      automated_migration: true

      example_v1:
        customers:
          - id: "123"
            name: "John Doe"
            email: "john@example.com"

      example_v2:
        data:
          customers:
            - id: "123"
              name: "John Doe"
              email: "john@example.com"
        metadata:
          version: "v2"
          timestamp: "2024-01-15T10:30:00Z"
          requestId: "req-123456"
```

### 6. Security and Authentication Patterns

#### Security Implementation

```yaml
# ================================================================
# API Security Configuration
# ================================================================

authentication:
  primary_method: "JWT Bearer Tokens"
  token_source: "shared_auth_service"
  token_validation: "centralized"

  jwt_configuration:
    algorithm: "RS256"
    issuer: "rightfit-services"
    audience: "rightfit-api"
    access_token_ttl: 3600  # 1 hour
    refresh_token_ttl: 2592000  # 30 days

  token_claims:
    required:
      - "sub"  # User ID
      - "email"  # User email
      - "role"  # User role
      - "iat"  # Issued at
      - "exp"  # Expiration
    optional:
      - "permissions"  # Specific permissions
      - "customerId"  # Customer ID (for customer users)
      - "contractorId"  # Contractor ID (for contractor users)

authorization:
  model: "Role-Based Access Control (RBAC)"

  roles:
    CUSTOMER:
      description: "End customer users"
      permissions:
        - "customers:read:own"
        - "jobs:read:own"
        - "jobs:create:own"
        - "properties:read:own"
        - "financial_transactions:read:own"

    CONTRACTOR:
      description: "Service contractor users"
      permissions:
        - "jobs:read:assigned"
        - "jobs:update:assigned"
        - "profile:read:own"
        - "profile:update:own"
        - "availability:read:own"
        - "availability:update:own"

    EMPLOYEE:
      description: "RightFit employee users"
      permissions:
        - "customers:read:all"
        - "customers:create:all"
        - "customers:update:all"
        - "jobs:read:all"
        - "jobs:create:all"
        - "jobs:update:all"
        - "jobs:assign:all"
        - "contractors:read:all"
        - "analytics:read:all"

    ADMIN:
      description: "System administrators"
      permissions:
        - "*"  # All permissions

rate_limiting:
  global_limits:
    requests_per_minute: 10000
    burst_limit: 1000

  role_based_limits:
    CUSTOMER:
      requests_per_minute: 100
      burst_limit: 20

    CONTRACTOR:
      requests_per_minute: 200
      burst_limit: 40

    EMPLOYEE:
      requests_per_minute: 1000
      burst_limit: 100

    ADMIN:
      requests_per_minute: 5000
      burst_limit: 500

  endpoint_specific:
    authentication_endpoints:
      "/auth/login":
        requests_per_minute: 60
        burst_limit: 10

    upload_endpoints:
      "/jobs/*/photos":
        requests_per_minute: 50
        burst_limit: 10
        size_limit_mb: 100

security_headers:
  required:
    - "X-Content-Type-Options: nosniff"
    - "X-Frame-Options: DENY"
    - "X-XSS-Protection: 1; mode=block"
    - "Strict-Transport-Security: max-age=31536000; includeSubDomains"
    - "Content-Security-Policy: default-src 'self'"

  optional:
    - "Referrer-Policy: strict-origin-when-cross-origin"
    - "Permissions-Policy: geolocation=(), microphone=(), camera=()"

input_validation:
  validation_layers:
    - "API Gateway Request Validation"
    - "Service-level Input Validation"
    - "Database Parameter Validation"

  validation_rules:
    email_format:
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"

    phone_format:
      pattern: "^\\+?[1-9]\\d{1,14}$"

    uuid_format:
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"

    pagination_limits:
      min_page: 1
      max_page: 1000
      min_limit: 1
      max_limit: 100
```

This comprehensive API architecture planning provides:

1. **Clear separation of concerns** between cleaning and maintenance services
2. **Shared authentication service** for centralized user management
3. **Comprehensive API specifications** using OpenAPI 3.0
4. **Robust security model** with JWT authentication and RBAC
5. **Scalable architecture** with API gateway and service discovery
6. **Future-proof versioning strategy** for API evolution
7. **Performance optimization** with caching and rate limiting
8. **Enterprise-grade security** with multiple validation layers

The architecture is designed to support the specific needs of both cleaning and maintenance services while maintaining consistency and security across the entire RightFit platform.