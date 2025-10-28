// JWT constants
export const JWT_ACCESS_EXPIRY = '1h'
export const JWT_REFRESH_EXPIRY = '30d'

// Password hashing
export const BCRYPT_SALT_ROUNDS = 10

// Rate limiting
export const RATE_LIMIT_LOGIN_MAX = 5
export const RATE_LIMIT_LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
export const RATE_LIMIT_REGISTER_MAX = 3
export const RATE_LIMIT_REGISTER_WINDOW_MS = 60 * 60 * 1000 // 1 hour

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Property types
export const PROPERTY_TYPES = ['HOUSE', 'FLAT', 'COTTAGE', 'COMMERCIAL'] as const
export const PROPERTY_STATUSES = ['ACTIVE', 'INACTIVE'] as const

// User roles
export const USER_ROLES = ['ADMIN', 'MEMBER', 'CONTRACTOR'] as const

// Subscription statuses
export const SUBSCRIPTION_STATUSES = ['TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED'] as const
