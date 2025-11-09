// User types
export interface User {
  id: string
  tenant_id: string
  email: string
  full_name: string
  role: 'ADMIN' | 'MEMBER' | 'CONTRACTOR'
  created_at: Date
  updated_at: Date
}

export interface Tenant {
  id: string
  tenant_name: string
  subscription_status: 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED'
  trial_ends_at: Date | null
  created_at: Date
  updated_at: Date
}

// Property types
export interface Property {
  id: string
  tenant_id: string
  owner_user_id: string
  name: string
  address_line1: string
  address_line2?: string | null
  city: string
  postcode: string
  property_type: 'HOUSE' | 'FLAT' | 'COTTAGE' | 'COMMERCIAL'
  bedrooms: number
  bathrooms: number
  access_instructions?: string | null
  status: 'ACTIVE' | 'INACTIVE'
  // Location fields for GPS navigation (Sprint 8)
  latitude?: number | null
  longitude?: number | null
  what3words?: string | null
  plus_code?: string | null
  location_type?: string
  geocoded_at?: Date | null
  created_at: Date
  updated_at: Date
}

// JWT payload types
export interface JWTPayload {
  user_id: string
  tenant_id: string
  email: string
  role: 'ADMIN' | 'MEMBER' | 'CONTRACTOR'
  iat: number
  exp: number
}

export interface RefreshTokenPayload {
  user_id: string
  tenant_id: string
  iat: number
  exp: number
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface AuthResponse {
  user: User
  tenant: Tenant
  access_token: string
  refresh_token: string
}

// Navigation types (GPS Navigation Feature - Sprint 8)
export * from './navigation'
