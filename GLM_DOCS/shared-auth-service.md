# Shared Authentication Service Implementation

## Overview

This document outlines the implementation of the shared authentication service that will handle authentication across both cleaning and maintenance services while maintaining independent user management.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Shared Authentication Service              │
│                        (Port 3030)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐  │
│  │   Auth API      │  │   JWT Manager   │  │  User    │  │
│  │                 │  │                 │  │  Service │  │
│  └─────────────────┘  └─────────────────┘  └──────────┘  │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐  │
│  │ Session Manager │  │   Password      │  │ Service  │  │
│  │                 │  │   Service       │  │ Mapping  │  │
│  └─────────────────┘  └─────────────────┘  └──────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────┐           ┌─────────────────────┐
│  Cleaning Service   │           │ Maintenance Service │
│    (Port 3010)      │           │    (Port 3020)      │
└─────────────────────┘           └─────────────────────┘
```

## Database Schema

### Shared Authentication Database (rightfit_shared_auth)

```sql
-- Core user authentication data
CREATE TABLE shared_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT shared_users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- User service mappings
CREATE TABLE user_service_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES shared_users(id) ON DELETE CASCADE,
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('CLEANING', 'MAINTENANCE', 'BOTH')),
    cleaning_user_id UUID,
    maintenance_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    -- Constraints
    CONSTRAINT user_service_mappings_unique UNIQUE (user_id, service_type)
);

-- Authentication sessions
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES shared_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    service_type VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,

    -- Indexes
    INDEX idx_auth_sessions_token (session_token),
    INDEX idx_auth_sessions_refresh (refresh_token),
    INDEX idx_auth_sessions_user_id (user_id),
    INDEX idx_auth_sessions_expires (expires_at)
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES shared_users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    INDEX idx_password_reset_tokens_token (token),
    INDEX idx_password_reset_tokens_user_id (user_id),
    INDEX idx_password_reset_tokens_expires (expires_at)
);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES shared_users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    INDEX idx_email_verification_tokens_token (token),
    INDEX idx_email_verification_tokens_user_id (user_id),
    INDEX idx_email_verification_tokens_expires (expires_at)
);

-- Login audit log
CREATE TABLE login_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES shared_users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    service_type VARCHAR(20),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    INDEX idx_login_audit_user_id (user_id),
    INDEX idx_login_audit_email (email),
    INDEX idx_login_audit_created (created_at),
    INDEX idx_login_audit_success (success)
);
```

## API Endpoints

### Authentication Endpoints

```typescript
// POST /auth/login
interface LoginRequest {
  email: string;
  password: string;
  serviceType: 'CLEANING' | 'MAINTENANCE';
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    serviceType: string;
    hasBothServices: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  requiresServiceSetup?: boolean;
}

// POST /auth/register
interface RegisterRequest {
  email: string;
  password: string;
  serviceType: 'CLEANING' | 'MAINTENANCE';
  userInfo: {
    fullName: string;
    phone?: string;
    // Additional service-specific fields
  };
}

// POST /auth/logout
interface LogoutRequest {
  refreshToken: string;
}

// POST /auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// POST /auth/forgot-password
interface ForgotPasswordRequest {
  email: string;
}

// POST /auth/reset-password
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// GET /auth/me
interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    services: Array<{
      type: 'CLEANING' | 'MAINTENANCE';
      userId: string;
      role: string;
      isActive: boolean;
    }>;
  };
}
```

### Service Management Endpoints

```typescript
// POST /auth/services/link
interface LinkServiceRequest {
  userId: string;
  serviceType: 'CLEANING' | 'MAINTENANCE';
  serviceUserId: string;
}

// DELETE /auth/services/unlink
interface UnlinkServiceRequest {
  userId: string;
  serviceType: 'CLEANING' | 'MAINTENANCE';
}
```

## Implementation Code

### Node.js/Express Service

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import { authRoutes } from './routes/auth';
import { serviceRoutes } from './routes/services';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3030;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3010', 'http://localhost:3020'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  connectionString: process.env.SHARED_AUTH_DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Routes
app.use('/auth', authRoutes(pool));
app.use('/services', serviceRoutes(pool));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Shared Authentication Service running on port ${PORT}`);
});

export default app;
```

### Authentication Service

```typescript
// src/services/AuthService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { logger } from '../utils/logger';

export class AuthService {
  constructor(private db: Pool) {}

  async login(email: string, password: string, serviceType: string): Promise<any> {
    try {
      // Check rate limiting
      await this.checkRateLimit(email);

      // Find user
      const userQuery = `
        SELECT id, email, password_hash, is_active, failed_login_attempts, locked_until
        FROM shared_users
        WHERE email = $1
      `;
      const userResult = await this.db.query(userQuery, [email]);

      if (userResult.rows.length === 0) {
        await this.recordLoginAttempt(email, serviceType, false, 'USER_NOT_FOUND');
        throw new Error('Invalid credentials');
      }

      const user = userResult.rows[0];

      // Check if user is locked
      if (user.locked_until && user.locked_until > new Date()) {
        await this.recordLoginAttempt(email, serviceType, false, 'ACCOUNT_LOCKED');
        throw new Error('Account temporarily locked');
      }

      // Check if user is active
      if (!user.is_active) {
        await this.recordLoginAttempt(email, serviceType, false, 'ACCOUNT_INACTIVE');
        throw new Error('Account is inactive');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        await this.handleFailedLogin(user.id, email, serviceType);
        throw new Error('Invalid credentials');
      }

      // Check user has access to requested service
      const serviceMapping = await this.getUserServiceMapping(user.id, serviceType);
      if (!serviceMapping) {
        await this.recordLoginAttempt(email, serviceType, false, 'NO_SERVICE_ACCESS');
        throw new Error('No access to requested service');
      }

      // Reset failed login attempts
      await this.resetFailedAttempts(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user.id, serviceType);

      // Record successful login
      await this.recordLoginAttempt(email, serviceType, true);

      // Update last login
      await this.updateLastLogin(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          serviceType,
          hasBothServices: await this.userHasBothServices(user.id)
        },
        tokens
      };

    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, serviceType: string, userInfo: any): Promise<any> {
    try {
      // Check if user already exists
      const existingUser = await this.db.query(
        'SELECT id FROM shared_users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        // User exists, add service mapping
        const userId = existingUser.rows[0].id;
        await this.createServiceMapping(userId, serviceType);
        return { existingUser: true, userId };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const userQuery = `
        INSERT INTO shared_users (email, password_hash, email_verification_token)
        VALUES ($1, $2, $3)
        RETURNING id, email, created_at
      `;
      const userResult = await this.db.query(userQuery, [
        email,
        passwordHash,
        this.generateVerificationToken()
      ]);

      const user = userResult.rows[0];

      // Create service mapping
      await this.createServiceMapping(user.id, serviceType);

      // Send verification email
      await this.sendVerificationEmail(email);

      return { success: true, userId: user.id, requiresVerification: true };

    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  private async generateTokens(userId: string, serviceType: string): Promise<any> {
    const accessToken = jwt.sign(
      { userId, serviceType, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId, serviceType, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    );

    // Store session
    await this.storeSession(userId, serviceType, accessToken, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour
    };
  }

  private async storeSession(userId: string, serviceType: string, accessToken: string, refreshToken: string): Promise<void> {
    const query = `
      INSERT INTO auth_sessions (user_id, session_token, refresh_token, service_type, expires_at)
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '1 hour')
    `;
    await this.db.query(query, [userId, accessToken, refreshToken, serviceType]);
  }

  private async getUserServiceMapping(userId: string, serviceType: string): Promise<any> {
    const query = `
      SELECT * FROM user_service_mappings
      WHERE user_id = $1 AND service_type = $2 AND is_active = true
    `;
    const result = await this.db.query(query, [userId, serviceType]);
    return result.rows[0] || null;
  }

  private async checkRateLimit(email: string): Promise<void> {
    // Implement rate limiting logic here
    const recentAttempts = await this.db.query(`
      SELECT COUNT(*) as count
      FROM login_audit_log
      WHERE email = $1 AND success = false AND created_at > NOW() - INTERVAL '15 minutes'
    `, [email]);

    if (parseInt(recentAttempts.rows[0].count) >= 5) {
      throw new Error('Too many failed login attempts. Please try again later.');
    }
  }

  private async handleFailedLogin(userId: string, email: string, serviceType: string): Promise<void> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Increment failed attempts
      await client.query(`
        UPDATE shared_users
        SET failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE
              WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
              ELSE locked_until
            END
        WHERE id = $1
      `, [userId]);

      // Record failed login
      await this.recordLoginAttempt(email, serviceType, false, 'INVALID_PASSWORD');

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async resetFailedAttempts(userId: string): Promise<void> {
    await this.db.query(`
      UPDATE shared_users
      SET failed_login_attempts = 0, locked_until = NULL
      WHERE id = $1
    `, [userId]);
  }

  private async recordLoginAttempt(email: string, serviceType: string, success: boolean, reason?: string): Promise<void> {
    const query = `
      INSERT INTO login_audit_log (email, service_type, success, failure_reason)
      VALUES ($1, $2, $3, $4)
    `;
    await this.db.query(query, [email, serviceType, success, reason]);
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.db.query(
      'UPDATE shared_users SET last_login_at = NOW() WHERE id = $1',
      [userId]
    );
  }

  private async userHasBothServices(userId: string): Promise<boolean> {
    const result = await this.db.query(`
      SELECT COUNT(*) as count
      FROM user_service_mappings
      WHERE user_id = $1 AND is_active = true
    `, [userId]);
    return parseInt(result.rows[0].count) > 1;
  }

  private generateVerificationToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  private async sendVerificationEmail(email: string): Promise<void> {
    // Implement email sending logic here
    logger.info(`Verification email sent to ${email}`);
  }

  private async createServiceMapping(userId: string, serviceType: string): Promise<void> {
    const query = `
      INSERT INTO user_service_mappings (user_id, service_type)
      VALUES ($1, $2)
      ON CONFLICT (user_id, service_type) DO UPDATE SET
        is_active = true,
        updated_at = NOW()
    `;
    await this.db.query(query, [userId, serviceType]);
  }
}
```

## Migration Implementation

### User Data Migration Script

```sql
-- Step 1: Extract shared authentication data
INSERT INTO rightfit_shared_auth.shared_users (id, email, password_hash, created_at, updated_at, is_active, last_login_at)
SELECT DISTINCT
    u.id,
    u.email,
    u.password_hash,
    u.created_at,
    u.updated_at,
    u.deleted_at IS NULL as is_active,
    NULL as last_login_at
FROM original_database.users u
WHERE u.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = EXCLUDED.updated_at,
    is_active = EXCLUDED.is_active;

-- Step 2: Create service mappings based on existing roles and data
WITH user_service_analysis AS (
    SELECT
        u.id,
        u.email,
        u.role,
        CASE
            -- Check for cleaning service access
            WHEN EXISTS(
                SELECT 1 FROM original_database.cleaning_jobs cj
                JOIN original_database.workers w ON cj.assigned_worker_id = w.id
                WHERE w.user_id = u.id
            ) OR EXISTS(
                SELECT 1 FROM original_database.cleaning_contracts cc
                WHERE cc.customer_id IN (
                    SELECT c.id FROM original_database.customers c
                    WHERE c.service_provider_id IN (
                        SELECT sp.id FROM original_database.service_providers sp
                        WHERE sp.tenant_id = u.tenant_id
                    )
                )
            ) THEN 'CLEANING'

            -- Check for maintenance service access
            WHEN EXISTS(
                SELECT 1 FROM original_database.maintenance_jobs mj
                JOIN original_database.workers w ON mj.assigned_worker_id = w.id
                WHERE w.user_id = u.id
            ) OR EXISTS(
                SELECT 1 FROM original_database.maintenance_contracts mc
                WHERE mc.customer_id IN (
                    SELECT c.id FROM original_database.customers c
                    WHERE c.service_provider_id IN (
                        SELECT sp.id FROM original_database.service_providers sp
                        WHERE sp.tenant_id = u.tenant_id
                    )
                )
            ) THEN 'MAINTENANCE'

            -- Admin users get both services
            WHEN u.role = 'ADMIN' THEN 'BOTH'

            ELSE 'UNKNOWN'
        END as service_type
    FROM original_database.users u
    WHERE u.email IS NOT NULL
)
INSERT INTO rightfit_shared_auth.user_service_mappings (user_id, service_type)
SELECT
    usa.id as user_id,
    service_type
FROM user_service_analysis usa
JOIN rightfit_shared_auth.shared_users su ON su.email = usa.email
WHERE service_type != 'UNKNOWN'
ON CONFLICT (user_id, service_type) DO UPDATE SET
    is_active = true,
    updated_at = NOW();

-- Step 3: Create service-specific user profiles
-- Cleaning users
INSERT INTO rightfit_cleaning.cleaning_users (
    id, user_id, tenant_id, full_name, role, phone, created_at, updated_at
)
SELECT
    gen_random_uuid() as id,
    su.id as user_id,
    u.tenant_id,
    u.full_name,
    u.role,
    NULL as phone,
    u.created_at,
    u.updated_at
FROM original_database.users u
JOIN rightfit_shared_auth.shared_users su ON su.email = u.email
JOIN rightfit_shared_auth.user_service_mappings usm ON usm.user_id = su.id
WHERE usm.service_type IN ('CLEANING', 'BOTH');

-- Maintenance users
INSERT INTO rightfit_maintenance.maintenance_users (
    id, user_id, tenant_id, full_name, role, phone, created_at, updated_at
)
SELECT
    gen_random_uuid() as id,
    su.id as user_id,
    u.tenant_id,
    u.full_name,
    u.role,
    NULL as phone,
    u.created_at,
    u.updated_at
FROM original_database.users u
JOIN rightfit_shared_auth.shared_users su ON su.email = u.email
JOIN rightfit_shared_auth.user_service_mappings usm ON usm.user_id = su.id
WHERE usm.service_type IN ('MAINTENANCE', 'BOTH');

-- Step 4: Update service mappings with new user IDs
UPDATE rightfit_shared_auth.user_service_mappings usm
SET cleaning_user_id = cu.id
FROM rightfit_cleaning.cleaning_users cu
JOIN rightfit_shared_auth.shared_users su ON su.id = usm.user_id
WHERE usm.service_type IN ('CLEANING', 'BOTH');

UPDATE rightfit_shared_auth.user_service_mappings usm
SET maintenance_user_id = mu.id
FROM rightfit_maintenance.maintenance_users mu
JOIN rightfit_shared_auth.shared_users su ON su.id = usm.user_id
WHERE usm.service_type IN ('MAINTENANCE', 'BOTH');
```

## Testing Implementation

### Authentication Flow Tests

```typescript
// tests/auth.test.ts
import request from 'supertest';
import { app } from '../src/app';
import { AuthService } from '../src/services/AuthService';

describe('Authentication Service', () => {
  describe('POST /auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123',
          serviceType: 'CLEANING'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
          serviceType: 'CLEANING'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject login for unauthorized service', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123',
          serviceType: 'MAINTENANCE' // User only has cleaning access
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /auth/register', () => {
    it('should create new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'newpassword123',
          serviceType: 'CLEANING',
          userInfo: {
            fullName: 'New User',
            phone: '+1234567890'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBeDefined();
    });

    it('should handle existing user adding new service', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com', // Existing user
          password: 'testpassword123',
          serviceType: 'MAINTENANCE', // Add maintenance service
          userInfo: {
            fullName: 'Test User'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.existingUser).toBe(true);
    });
  });
});
```

## Deployment Configuration

### Docker Service Definition

```yaml
# docker-compose.separated.yml (additional service)
shared-auth-api:
  build:
    context: ./GLM_DOCS/shared-auth-service
    dockerfile: Dockerfile
  container_name: rightfit-shared-auth-api
  restart: unless-stopped
  networks:
    - rightfit-network
  environment:
    NODE_ENV: ${NODE_ENV:-development}
    PORT: 3030
    SHARED_AUTH_DATABASE_URL: ${SHARED_AUTH_DATABASE_URL}
    JWT_SECRET: ${JWT_SECRET}
    JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
  ports:
    - "3030:3030"
  depends_on:
    rightfit-shared-auth:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3030/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
  profiles: ["separated-services"]
```

### Environment Variables

```bash
# Shared Auth Service Configuration
SHARED_AUTH_API_URL=http://localhost:3030
SHARED_AUTH_API_SECRET=${SHARED_AUTH_API_SECRET:-your-api-secret}

# JWT Configuration (shared with main services)
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}

# Service Communication
CLEANING_API_CALLBACK_URL=http://localhost:3010/auth/callback
MAINTENANCE_API_CALLBACK_URL=http://localhost:3020/auth/callback
```

---

**Implementation Status**: Ready for development
**Next Steps**:
1. Create the shared auth service repository
2. Implement the API endpoints
3. Set up the Docker container
4. Integrate with existing services
5. Run migration scripts
6. Test authentication flows