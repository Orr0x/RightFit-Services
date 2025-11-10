import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Spinner, EmptyState, Button, Badge, Input } from '@rightfit/ui-core';
import { useToast } from '../components/ui';
import { useLoading } from '../hooks/useLoading'
import { customersAPI, type Customer } from '../lib/api'
import './Customers.css'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [searchQuery, customers])

  const loadCustomers = () => {
    withLoading(async () => {
      try {
        const result = await customersAPI.list()
        setCustomers(result.data)
      } catch (err: any) {
        toast.error('Failed to load customers')
        console.error('Load customers error:', err)
      }
    })
  }

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = customers.filter(
      (customer) =>
        customer.business_name.toLowerCase().includes(query) ||
        customer.contact_name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query)
    )
    setFilteredCustomers(filtered)
  }

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL':
        return <Badge color="blue">Individual</Badge>
      case 'PROPERTY_MANAGER':
        return <Badge color="purple">Property Manager</Badge>
      case 'VACATION_RENTAL':
        return <Badge color="green">Vacation Rental</Badge>
      default:
        return <Badge color="gray">{type}</Badge>
    }
  }

  const getPaymentTermsLabel = (terms: string) => {
    switch (terms) {
      case 'NET_7':
        return 'Net 7'
      case 'NET_14':
        return 'Net 14'
      case 'NET_30':
        return 'Net 30'
      case 'NET_60':
        return 'Net 60'
      case 'DUE_ON_RECEIPT':
        return 'Due on Receipt'
      default:
        return terms
    }
  }

  const stats = {
    total: customers.length,
    withCleaningContract: customers.filter((c) => c.has_cleaning_contract).length,
    withMaintenanceContract: customers.filter((c) => c.has_maintenance_contract).length,
    totalProperties: customers.reduce((sum, c) => sum + (c._count?.customer_properties || 0), 0),
  }

  if (isLoading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer relationships and contracts</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" onClick={() => navigate('/customers/new')}>
            + Add Customer
          </Button>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="customers-stats">
        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value">{stats.withCleaningContract}</div>
            <div className="stat-label">Cleaning Contracts</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value">{stats.withMaintenanceContract}</div>
            <div className="stat-label">Maintenance Contracts</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value">{stats.totalProperties}</div>
            <div className="stat-label">Properties</div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="customers-search">
        <Input
          type="search"
          placeholder="Search customers by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No customers found' : 'No customers yet'}
          description={
            searchQuery
              ? 'Try adjusting your search criteria'
              : 'Add your first customer to get started with managing your business'
          }
        />
      ) : (
        <div className={`customers-${viewMode}`}>
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              variant="elevated"
              className="customer-card"
              onClick={() => navigate(`/customers/${customer.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="customer-card-header">
                <div>
                  <h3 className="customer-business-name">{customer.business_name}</h3>
                  <p className="customer-contact-name">{customer.contact_name}</p>
                </div>
                {getCustomerTypeBadge(customer.customer_type)}
              </div>

              <div className="customer-contact-info">
                <div className="customer-contact-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13 3H3c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm0 2l-5 3-5-3V4l5 3 5-3v1z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>{customer.email}</span>
                </div>
                <div className="customer-contact-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 2c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H4zm4.5 1.5a.5.5 0 110 1 .5.5 0 010-1z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                  <span>{customer.phone}</span>
                </div>
              </div>

              <div className="customer-contract-badges">
                {customer.has_cleaning_contract && <Badge color="blue">Cleaning</Badge>}
                {customer.has_maintenance_contract && <Badge color="orange">Maintenance</Badge>}
              </div>

              {customer._count && (
                <div className="customer-stats">
                  <div className="customer-stat">
                    <span className="customer-stat-value">{customer._count.customer_properties}</span>
                    <span className="customer-stat-label">Properties</span>
                  </div>
                  <div className="customer-stat">
                    <span className="customer-stat-label">Payment</span>
                    <span className="customer-stat-value">{getPaymentTermsLabel(customer.payment_terms)}</span>
                  </div>
                </div>
              )}

              {customer.bundled_discount_percentage > 0 && (
                <div className="customer-discount">
                  <Badge color="green">{customer.bundled_discount_percentage}% Bundled Discount</Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
