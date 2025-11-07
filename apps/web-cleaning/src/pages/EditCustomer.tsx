import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Input, Select, Spinner, Checkbox, Modal, type SelectOption } from '@rightfit/ui-core';
import { useToast, Tabs, TabPanel } from '../components/ui';
import { useLoading } from '../hooks/useLoading'
import {
  customersAPI,
  customerPropertiesAPI,
  cleaningContractsAPI,
  cleaningInvoicesAPI,
  cleaningQuotesAPI,
  type CreateCustomerData,
  type Customer,
  type CustomerProperty,
  type CleaningContract,
  type CleaningInvoice,
  type CleaningQuote
} from '../lib/api'
import './Quotes.css'

const UK_PHONE_REGEX = /^(?:(?:\+44\s?|0)(?:\d\s?){9,10})$/

export default function EditCustomer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { isLoading, withLoading } = useLoading()

  // Customer loading state
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loadingCustomer, setLoadingCustomer] = useState(true)
  const [activeTab, setActiveTab] = useState('details')

  // Linked data states
  const [properties, setProperties] = useState<CustomerProperty[]>([])
  const [contracts, setContracts] = useState<CleaningContract[]>([])
  const [invoices, setInvoices] = useState<CleaningInvoice[]>([])
  const [quotes, setQuotes] = useState<CleaningQuote[]>([])
  const [loadingLinkedData, setLoadingLinkedData] = useState(false)

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Form state with all new fields
  const [formData, setFormData] = useState<CreateCustomerData>({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    // Legacy address fields
    address: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postcode: '',
    country: '',
    // Business address
    business_address_line1: '',
    business_address_line2: '',
    business_city: '',
    business_postcode: '',
    business_country: '',
    // Contact address
    contact_address_different: false,
    contact_address_line1: '',
    contact_address_line2: '',
    contact_city: '',
    contact_postcode: '',
    contact_country: '',
    // Customer details
    customer_type: 'LANDLORD',
    has_cleaning_contract: false,
    has_maintenance_contract: false,
    bundled_discount_percentage: 0,
    payment_terms: 'NET_14',
  })

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load customer data
  useEffect(() => {
    if (id) {
      loadCustomer()
    }
  }, [id])

  // Load linked data when switching tabs
  useEffect(() => {
    if (id && activeTab !== 'details') {
      loadLinkedData()
    }
  }, [id, activeTab])

  const loadCustomer = async () => {
    try {
      setLoadingCustomer(true)
      const customerData = await customersAPI.getById(id!)
      setCustomer(customerData)

      // Set form data with all new fields
      setFormData({
        business_name: customerData.business_name,
        contact_name: customerData.contact_name,
        email: customerData.email,
        phone: customerData.phone,
        // Legacy address fields
        address: customerData.address || '',
        address_line1: customerData.address_line1 || '',
        address_line2: customerData.address_line2 || '',
        city: customerData.city || '',
        postcode: customerData.postcode || '',
        country: customerData.country || '',
        // Business address
        business_address_line1: customerData.business_address_line1 || '',
        business_address_line2: customerData.business_address_line2 || '',
        business_city: customerData.business_city || '',
        business_postcode: customerData.business_postcode || '',
        business_country: customerData.business_country || '',
        // Contact address
        contact_address_different: customerData.contact_address_different || false,
        contact_address_line1: customerData.contact_address_line1 || '',
        contact_address_line2: customerData.contact_address_line2 || '',
        contact_city: customerData.contact_city || '',
        contact_postcode: customerData.contact_postcode || '',
        contact_country: customerData.contact_country || '',
        // Customer details
        customer_type: customerData.customer_type,
        has_cleaning_contract: customerData.has_cleaning_contract,
        has_maintenance_contract: customerData.has_maintenance_contract,
        bundled_discount_percentage: customerData.bundled_discount_percentage,
        payment_terms: customerData.payment_terms,
      })
    } catch (err: any) {
      console.error('Failed to load customer:', err)
      toast.error('Failed to load customer')
      navigate('/customers')
    } finally {
      setLoadingCustomer(false)
    }
  }

  const loadLinkedData = async () => {
    if (!id) return

    try {
      setLoadingLinkedData(true)

      // Load properties
      if (activeTab === 'properties') {
        const propertiesData = await customerPropertiesAPI.list({ customer_id: id })
        setProperties(propertiesData.data || [])
      }

      // Load contracts
      if (activeTab === 'contracts') {
        const contractsData = await cleaningContractsAPI.list({ customer_id: id })
        setContracts(contractsData || [])
      }

      // Load invoices
      if (activeTab === 'invoices') {
        const invoicesData = await cleaningInvoicesAPI.list({ customer_id: id })
        setInvoices(invoicesData || [])
      }

      // Load quotes
      if (activeTab === 'quotes') {
        const quotesData = await cleaningQuotesAPI.list({ customer_id: id })
        setQuotes(quotesData || [])
      }
    } catch (error) {
      console.error('Failed to load linked data:', error)
    } finally {
      setLoadingLinkedData(false)
    }
  }

  const customerTypeOptions: SelectOption[] = [
    { value: 'LANDLORD', label: 'Landlord' },
    { value: 'LETTING_AGENT', label: 'Letting Agent' },
    { value: 'PROPERTY_MANAGEMENT', label: 'Property Management' },
    { value: 'OFFICE_MANAGEMENT', label: 'Office Management' },
    { value: 'SHORT_LET_MANAGEMENT', label: 'Short Let Management' },
    { value: 'HOLIDAY_LETS', label: 'Holiday Lets' },
    { value: 'COMMERCIAL', label: 'Commercial' },
  ]

  const paymentTermsOptions: SelectOption[] = [
    { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
    { value: 'NET_7', label: 'Net 7 Days' },
    { value: 'NET_14', label: 'Net 14 Days' },
    { value: 'NET_30', label: 'Net 30 Days' },
    { value: 'NET_60', label: 'Net 60 Days' },
  ]

  const handleInputChange = (field: keyof CreateCustomerData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required'
    }

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'Contact name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!UK_PHONE_REGEX.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid UK phone number format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }

    await withLoading(async () => {
      try {
        await customersAPI.update(id!, formData)
        toast.success('Customer updated successfully')
        navigate(`/customers/${id}`)
      } catch (err: any) {
        console.error('Failed to update customer:', err)
        toast.error(err.response?.data?.error || 'Failed to update customer')
      }
    })
  }

  const handleDelete = async () => {
    if (deleteConfirmText !== customer?.business_name) {
      toast.error('Business name does not match')
      return
    }

    await withLoading(async () => {
      try {
        await customersAPI.delete(id!)
        toast.success('Customer deleted successfully')
        navigate('/customers')
      } catch (err: any) {
        console.error('Failed to delete customer:', err)
        toast.error(err.response?.data?.error || 'Failed to delete customer')
      }
    })

    setShowDeleteModal(false)
  }

  const handleCancel = () => {
    navigate(`/customers/${id}`)
  }

  if (loadingCustomer) {
    return (
      <div className="quotes-page">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-600">Loading customer...</span>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="quotes-page">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Customer Not Found</h2>
          <p className="text-gray-600 mb-6">The customer you're looking for does not exist.</p>
          <Button onClick={() => navigate('/customers')}>Go to Customers</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="quotes-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Customer</h1>
          <p className="text-gray-600 mt-1">{customer.business_name}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={isLoading}>
            Delete Customer
          </Button>
        </div>
      </div>

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <TabPanel tabId="details" label="Customer Details" activeTab={activeTab}>
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Business Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Business Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Business Name"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="e.g., Acme Properties Ltd"
                      error={errors.business_name}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Input
                    label="Contact Person Name"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    placeholder="e.g., John Smith"
                    error={errors.contact_name}
                    required
                    disabled={isLoading}
                  />

                  <Select
                    label="Customer Type"
                    value={formData.customer_type}
                    onChange={(value) => handleInputChange('customer_type', value as any)}
                    options={customerTypeOptions}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="e.g., john@acmeproperties.com"
                    error={errors.email}
                    required
                    disabled={isLoading}
                  />

                  <Input
                    type="tel"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g., 07123 456789"
                    error={errors.phone}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Section 3: Business Address */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Business Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Address Line 1"
                      value={formData.business_address_line1}
                      onChange={(e) => handleInputChange('business_address_line1', e.target.value)}
                      placeholder="e.g., 123 High Street"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Address Line 2 (Optional)"
                      value={formData.business_address_line2}
                      onChange={(e) => handleInputChange('business_address_line2', e.target.value)}
                      placeholder="e.g., Building 5, Floor 2"
                      disabled={isLoading}
                    />
                  </div>

                  <Input
                    label="City"
                    value={formData.business_city}
                    onChange={(e) => handleInputChange('business_city', e.target.value)}
                    placeholder="e.g., London"
                    disabled={isLoading}
                  />

                  <Input
                    label="Postcode"
                    value={formData.business_postcode}
                    onChange={(e) => handleInputChange('business_postcode', e.target.value)}
                    placeholder="e.g., SW1A 1AA"
                    disabled={isLoading}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Country (Optional)"
                      value={formData.business_country}
                      onChange={(e) => handleInputChange('business_country', e.target.value)}
                      placeholder="e.g., United Kingdom"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Contact Address (if different) */}
              <div className="border-b pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Contact Address</h2>
                  <Checkbox
                    label="Different from business address"
                    checked={formData.contact_address_different || false}
                    onChange={(e) => handleInputChange('contact_address_different', e.target.checked)}
                    disabled={isLoading}
                  />
                </div>

                {formData.contact_address_different && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Address Line 1"
                        value={formData.contact_address_line1}
                        onChange={(e) => handleInputChange('contact_address_line1', e.target.value)}
                        placeholder="e.g., 123 High Street"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        label="Address Line 2 (Optional)"
                        value={formData.contact_address_line2}
                        onChange={(e) => handleInputChange('contact_address_line2', e.target.value)}
                        placeholder="e.g., Building 5, Floor 2"
                        disabled={isLoading}
                      />
                    </div>

                    <Input
                      label="City"
                      value={formData.contact_city}
                      onChange={(e) => handleInputChange('contact_city', e.target.value)}
                      placeholder="e.g., London"
                      disabled={isLoading}
                    />

                    <Input
                      label="Postcode"
                      value={formData.contact_postcode}
                      onChange={(e) => handleInputChange('contact_postcode', e.target.value)}
                      placeholder="e.g., SW1A 1AA"
                      disabled={isLoading}
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Country (Optional)"
                        value={formData.contact_country}
                        onChange={(e) => handleInputChange('contact_country', e.target.value)}
                        placeholder="e.g., United Kingdom"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: Service Contracts */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Service Contracts</h2>
                <div className="space-y-4">
                  <Checkbox
                    label="Has Cleaning Contract"
                    checked={formData.has_cleaning_contract || false}
                    onChange={(e) => handleInputChange('has_cleaning_contract', e.target.checked)}
                    disabled={isLoading}
                  />

                  <Checkbox
                    label="Has Maintenance Contract"
                    checked={formData.has_maintenance_contract || false}
                    onChange={(e) => handleInputChange('has_maintenance_contract', e.target.checked)}
                    disabled={isLoading}
                  />

                  {formData.has_cleaning_contract && formData.has_maintenance_contract && (
                    <div className="mt-4">
                      <Input
                        type="number"
                        label="Bundled Discount Percentage"
                        value={formData.bundled_discount_percentage?.toString() || '0'}
                        onChange={(e) =>
                          handleInputChange('bundled_discount_percentage', parseFloat(e.target.value) || 0)
                        }
                        placeholder="e.g., 10"
                        min="0"
                        max="100"
                        disabled={isLoading}
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Discount applied when customer has both cleaning and maintenance contracts
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 6: Payment Terms */}
              <div className="pb-6">
                <h2 className="text-xl font-semibold mb-4">Payment Terms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Payment Terms"
                    value={formData.payment_terms || 'NET_14'}
                    onChange={(value) => handleInputChange('payment_terms', value as any)}
                    options={paymentTermsOptions}
                    disabled={isLoading}
                  />
                  <div className="flex items-end">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Defines when invoices are due for this customer
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-6 border-t">
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Spinner size="sm" />}
                  {isLoading ? 'Updating Customer...' : 'Update Customer'}
                </Button>
              </div>
            </form>
          </Card>
        </TabPanel>

        <TabPanel tabId="properties" label={`Properties (${customer._count?.customer_properties || 0})`} activeTab={activeTab}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Linked Properties</h2>
              <Button onClick={() => navigate(`/properties/new?customer_id=${id}`)}>+ Add Property</Button>
            </div>

            {loadingLinkedData ? (
              <Card className="p-12 text-center">
                <Spinner size="lg" />
                <p className="text-gray-600 mt-3">Loading properties...</p>
              </Card>
            ) : properties.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties</h3>
                <p className="text-gray-600 mb-6">This customer doesn't have any properties yet</p>
                <Button onClick={() => navigate(`/properties/new?customer_id=${id}`)}>+ Add Property</Button>
              </Card>
            ) : (
              <div className="quotes-grid">
                {properties.map((property) => (
                  <Card key={property.id} className="quote-card" onClick={() => navigate(`/properties/${property.id}`)}>
                    <div className="quote-card-header">
                      <div>
                        <h3 className="quote-number">{property.property_name}</h3>
                        <p className="quote-customer">{property.property_type}</p>
                      </div>
                      {property.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">Inactive</span>
                      )}
                    </div>
                    <div className="quote-details">
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium truncate">{property.address}</span>
                      </div>
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Postcode:</span>
                        <span className="font-medium">{property.postcode}</span>
                      </div>
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Bedrooms:</span>
                        <span className="font-medium">{property.bedrooms}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel tabId="contracts" label="Contracts" activeTab={activeTab}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Cleaning Contracts</h2>
              <Button onClick={() => navigate(`/contracts/new?customer_id=${id}`)}>+ Create Contract</Button>
            </div>

            {loadingLinkedData ? (
              <Card className="p-12 text-center">
                <Spinner size="lg" />
                <p className="text-gray-600 mt-3">Loading contracts...</p>
              </Card>
            ) : contracts.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Contracts</h3>
                <p className="text-gray-600 mb-6">This customer doesn't have any contracts yet</p>
                <Button onClick={() => navigate(`/contracts/new?customer_id=${id}`)}>+ Create Contract</Button>
              </Card>
            ) : (
              <div className="quotes-grid">
                {contracts.map((contract) => (
                  <Card key={contract.id} className="quote-card" onClick={() => navigate(`/contracts/${contract.id}`)}>
                    <div className="quote-card-header">
                      <div>
                        <h3 className="quote-number">{contract.contract_number}</h3>
                        <p className="quote-customer">{contract.service_type?.replace('_', ' ') || 'N/A'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        contract.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {contract.status}
                      </span>
                    </div>
                    <div className="quote-details">
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{new Date(contract.start_date).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="font-medium">{contract.frequency?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel tabId="invoices" label="Invoices" activeTab={activeTab}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Invoices</h2>
              <Button onClick={() => navigate(`/invoices/new?customer_id=${id}`)}>+ Create Invoice</Button>
            </div>

            {loadingLinkedData ? (
              <Card className="p-12 text-center">
                <Spinner size="lg" />
                <p className="text-gray-600 mt-3">Loading invoices...</p>
              </Card>
            ) : invoices.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices</h3>
                <p className="text-gray-600 mb-6">This customer doesn't have any invoices yet</p>
                <Button onClick={() => navigate(`/invoices/new?customer_id=${id}`)}>+ Create Invoice</Button>
              </Card>
            ) : (
              <div className="quotes-grid">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="quote-card" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                    <div className="quote-card-header">
                      <div>
                        <h3 className="quote-number">{invoice.invoice_number}</h3>
                        <p className="quote-customer">{new Date(invoice.invoice_date).toLocaleDateString('en-GB')}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                        invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="quote-footer">
                      <div className="quote-total">
                        <span className="text-gray-600">Total:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          £{Number(invoice.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel tabId="quotes" label="Quotes" activeTab={activeTab}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Quotes</h2>
              <Button onClick={() => navigate(`/quotes/new?customer_id=${id}`)}>+ Create Quote</Button>
            </div>

            {loadingLinkedData ? (
              <Card className="p-12 text-center">
                <Spinner size="lg" />
                <p className="text-gray-600 mt-3">Loading quotes...</p>
              </Card>
            ) : quotes.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Quotes</h3>
                <p className="text-gray-600 mb-6">This customer doesn't have any quotes yet</p>
                <Button onClick={() => navigate(`/quotes/new?customer_id=${id}`)}>+ Create Quote</Button>
              </Card>
            ) : (
              <div className="quotes-grid">
                {quotes.map((quote) => (
                  <Card key={quote.id} className="quote-card" onClick={() => navigate(`/quotes/${quote.id}`)}>
                    <div className="quote-card-header">
                      <div>
                        <h3 className="quote-number">{quote.quote_number}</h3>
                        <p className="quote-customer">{new Date(quote.quote_date).toLocaleDateString('en-GB')}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        quote.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        quote.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                        quote.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                        quote.status === 'EXPIRED' ? 'bg-gray-200 text-gray-600' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                    <div className="quote-details">
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Valid Until:</span>
                        <span className="font-medium">{new Date(quote.valid_until).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                    <div className="quote-footer">
                      <div className="quote-total">
                        <span className="text-gray-600">Total:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          £{Number(quote.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabPanel>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Customer">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800 font-semibold">⚠️ Warning: This action cannot be undone!</p>
            <p className="text-sm text-red-700 mt-2">
              Deleting this customer will remove all associated data including properties, contracts, jobs, and
              invoices.
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-2">
              To confirm deletion, please type the business name: <strong>{customer?.business_name}</strong>
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type business name to confirm"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading || deleteConfirmText !== customer?.business_name}
            >
              {isLoading && <Spinner size="sm" />}
              {isLoading ? 'Deleting...' : 'Delete Customer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
