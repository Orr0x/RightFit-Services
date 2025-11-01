// User and Auth types
export interface User {
  id: string
  email: string
  full_name: string
  tenant_id: string
  tenant_name: string
  role: 'ADMIN' | 'MEMBER' | 'CONTRACTOR'
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

// Property types
export interface Property {
  id: string
  tenant_id: string
  name: string
  address_line1: string
  address_line2?: string
  city: string
  postcode: string
  property_type: 'HOUSE' | 'FLAT' | 'COTTAGE' | 'COMMERCIAL'
  bedrooms: number
  bathrooms: number
  access_instructions?: string
  created_at: string
  updated_at: string
}

// Work Order types
export type WorkOrderStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type WorkOrderPriority = 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW'

export type WorkOrderCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HEATING'
  | 'APPLIANCES'
  | 'EXTERIOR'
  | 'INTERIOR'
  | 'OTHER'

export interface WorkOrder {
  id: string
  tenant_id: string
  property_id: string
  contractor_id?: string
  title: string
  description: string
  status: WorkOrderStatus
  priority: WorkOrderPriority
  category: WorkOrderCategory
  due_date?: string
  estimated_cost?: number
  actual_cost?: number
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  property?: Property
  contractor?: Contractor
}

// Contractor types
export type ContractorSpecialty =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HEATING'
  | 'GENERAL'

export interface Contractor {
  id: string
  tenant_id: string
  name: string
  company_name?: string
  phone: string
  email?: string
  specialties: ContractorSpecialty[]
  service_area?: string
  hourly_rate?: number
  preferred: boolean
  notes?: string
  created_at: string
  updated_at: string
}

// Photo types
export type PhotoLabel =
  | 'BEFORE'
  | 'DURING'
  | 'AFTER'
  | 'DAMAGE'
  | 'REPAIR'
  | 'GENERAL'

export interface Photo {
  id: string
  tenant_id: string
  property_id?: string
  work_order_id?: string
  s3_url: string
  thumbnail_url: string
  file_size: number
  mime_type: string
  width: number
  height: number
  label?: PhotoLabel
  caption?: string
  created_at: string
}

// Certificate types
export type CertificateType =
  | 'GAS_SAFETY'
  | 'ELECTRICAL'
  | 'EPC'
  | 'STL_LICENSE'
  | 'OTHER'

export interface Certificate {
  id: string
  tenant_id: string
  property_id: string
  certificate_type: CertificateType
  issue_date: string
  expiry_date: string
  document_url: string
  certificate_number?: string
  issuer_name?: string
  notes?: string
  days_until_expiry: number
  is_expired: boolean
  created_at: string
  property?: Property
}

// Navigation types
export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Main: undefined
}

export type MainTabParamList = {
  Properties: undefined
  WorkOrders: undefined
  Certificates: undefined
  Contractors: undefined
  Profile: undefined
}

export type PropertiesStackParamList = {
  PropertiesList: undefined
  PropertyDetails: { propertyId: string }
  CreateProperty: { propertyId?: string }
}

export type WorkOrdersStackParamList = {
  WorkOrdersList: undefined
  WorkOrderDetails: { workOrderId: string }
  CreateWorkOrder: { propertyId?: string; workOrderId?: string }
}

export type CertificatesStackParamList = {
  CertificatesList: undefined
  CertificateDetails: { certificateId: string }
  CreateCertificate: { certificateId?: string }
}

export type ContractorsStackParamList = {
  ContractorsList: undefined
  ContractorDetails: { contractorId: string }
  CreateContractor: { contractorId?: string }
}

export type ProfileStackParamList = {
  ProfileMain: undefined
  ChangePassword: undefined
}
