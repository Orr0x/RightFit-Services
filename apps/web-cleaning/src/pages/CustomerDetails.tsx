import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Spinner, Badge } from '@rightfit/ui-core';
import { useToast, Tabs, TabPanel } from '../components/ui';
import { useLoading } from '../hooks/useLoading'
import {
  customersAPI,
  customerPropertiesAPI,
  cleaningContractsAPI,
  cleaningJobsAPI,
  type Customer,
  type CustomerProperty,
  type CleaningContract,
  type CleaningJob,
} from '../lib/api'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import BusinessIcon from '@mui/icons-material/Business'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import HomeIcon from '@mui/icons-material/Home'
import DescriptionIcon from '@mui/icons-material/Description'
import WorkIcon from '@mui/icons-material/Work'
import './ContractDetails.css'

const SERVICE_PROVIDER_ID = 'sp-cleaning-test'

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [properties, setProperties] = useState<CustomerProperty[]>([])
  const [contracts, setContracts] = useState<CleaningContract[]>([])
  const [recentJobs, setRecentJobs] = useState<CleaningJob[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    if (id) {
      loadCustomer()
      loadProperties()
      loadContracts()
      loadRecentJobs()
    }
  }, [id])

  const loadCustomer = () => {
    if (!id) return

    withLoading(async () => {
      try {
        const data = await customersAPI.get(id)
        setCustomer(data)
      } catch (err: any) {
        toast.error('Failed to load customer details')
        console.error('Load customer error:', err)
      }
    })
  }

  const loadProperties = async () => {
    if (!id) return

    try {
      const result = await customerPropertiesAPI.list({ customer_id: id, service_provider_id: SERVICE_PROVIDER_ID })
      setProperties(result.data)
    } catch (err) {
      console.log('No properties found for customer')
    }
  }

  const loadContracts = async () => {
    if (!id) return

    try {
      const result = await cleaningContractsAPI.list({
        service_provider_id: 'sp-cleaning-test',
        customer_id: id,
      })
      setContracts(result || [])
    } catch (err) {
      console.log('No contracts found for customer')
    }
  }

  const loadRecentJobs = async () => {
    if (!id) return

    try {
      const result = await cleaningJobsAPI.list('sp-cleaning-test', {
        customer_id: id,
        page: 1,
        limit: 10,
      })
      setRecentJobs(result.data)
    } catch (err) {
      console.log('No recent jobs found')
    }
  }

  if (isLoading && !customer) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
          <Button onClick={() => navigate('/customers')}>Back to Customers</Button>
        </Card>
      </div>
    )
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
        return 'Net 7 Days'
      case 'NET_14':
        return 'Net 14 Days'
      case 'NET_30':
        return 'Net 30 Days'
      case 'NET_60':
        return 'Net 60 Days'
      case 'DUE_ON_RECEIPT':
        return 'Due on Receipt'
      default:
        return terms
    }
  }

  const tabs = [
    { id: 'info', label: 'Customer Info', icon: <BusinessIcon sx={{ fontSize: 18 }} /> },
    { id: 'properties', label: `Properties (${properties.length})`, icon: <HomeIcon sx={{ fontSize: 18 }} /> },
    { id: 'contracts', label: `Contracts (${contracts.length})`, icon: <DescriptionIcon sx={{ fontSize: 18 }} /> },
    { id: 'jobs', label: `Jobs (${recentJobs.length})`, icon: <WorkIcon sx={{ fontSize: 18 }} /> },
    { id: 'billing', label: 'Invoices & Quotes', icon: <DescriptionIcon sx={{ fontSize: 18 }} /> },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/customers')}>
            <ArrowBackIcon sx={{ fontSize: 20, mr: 1 }} />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{customer.business_name}</h1>
              {getCustomerTypeBadge(customer.customer_type)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{customer.contact_name}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/customers/${id}/edit`)}>
          <EditIcon sx={{ fontSize: 18, mr: 1 }} />
          Edit
        </Button>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </Card>

      {/* Tab Content */}
      <TabPanel tabId="info" activeTab={activeTab}>
        {/* Customer Information - Individual Cards */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">👤</span>
          Business Information
        </h2>
        <div className="customer-info-grid">
          {/* Customer Number Card */}
          {customer.customer_number && (
            <Card className="p-5 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pink-200 dark:bg-pink-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔖</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wide mb-1">Customer Number</p>
                  <p className="text-lg font-extrabold text-pink-900 dark:text-pink-100 font-mono">
                    {customer.customer_number}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Business Name Card */}
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🏢</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Business Name</p>
                <p className="text-lg font-extrabold text-blue-900 dark:text-blue-100">
                  {customer.business_name}
                </p>
              </div>
            </div>
          </Card>

          {/* Contact Person Card */}
          <Card className="p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-cyan-200 dark:bg-cyan-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">👨‍💼</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide mb-1">Contact Person</p>
                <p className="text-lg font-extrabold text-cyan-900 dark:text-cyan-100">
                  {customer.contact_name}
                </p>
              </div>
            </div>
          </Card>

          {/* Email Card */}
          <Card className="p-5 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-200 dark:bg-teal-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📧</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide mb-1">Email</p>
                <p className="text-sm font-bold text-teal-900 dark:text-teal-100 break-all">
                  {customer.email}
                </p>
              </div>
            </div>
          </Card>

          {/* Phone Card */}
          <Card className="p-5 bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 border-sky-200 dark:border-sky-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-sky-200 dark:bg-sky-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📞</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wide mb-1">Phone</p>
                <p className="text-lg font-extrabold text-sky-900 dark:text-sky-100">
                  {customer.phone}
                </p>
              </div>
            </div>
          </Card>

          {/* Address Card */}
          {(customer.address_line1 || customer.address) && (
            <Card className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700 md:col-span-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📍</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Address</p>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 space-y-1">
                    {customer.address_line1 ? (
                      <>
                        <p>{customer.address_line1}</p>
                        {customer.address_line2 && <p>{customer.address_line2}</p>}
                        <p>{[customer.city, customer.postcode].filter(Boolean).join(', ')}</p>
                        {customer.country && <p>{customer.country}</p>}
                      </>
                    ) : (
                      <p>{customer.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Service Contracts - Individual Cards */}
        <h2 className="text-xl font-bold mb-4 mt-6 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Service Contracts
        </h2>
        <div className="customer-info-grid">
          {/* Cleaning Contract Card */}
          <Card className={`p-5 bg-gradient-to-br ${
            customer.has_cleaning_contract
              ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800'
              : 'from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${
                customer.has_cleaning_contract
                  ? 'bg-blue-200 dark:bg-blue-800'
                  : 'bg-gray-300 dark:bg-gray-700'
              } rounded-lg flex items-center justify-center flex-shrink-0`}>
                <span className="text-xl">🧹</span>
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${
                  customer.has_cleaning_contract
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                } uppercase tracking-wide mb-1`}>Cleaning Contract</p>
                <p className={`text-lg font-extrabold ${
                  customer.has_cleaning_contract
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {customer.has_cleaning_contract ? 'Active' : 'None'}
                </p>
              </div>
            </div>
          </Card>

          {/* Maintenance Contract Card */}
          <Card className={`p-5 bg-gradient-to-br ${
            customer.has_maintenance_contract
              ? 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800'
              : 'from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${
                customer.has_maintenance_contract
                  ? 'bg-orange-200 dark:bg-orange-800'
                  : 'bg-gray-300 dark:bg-gray-700'
              } rounded-lg flex items-center justify-center flex-shrink-0`}>
                <span className="text-xl">🔧</span>
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${
                  customer.has_maintenance_contract
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-gray-700 dark:text-gray-300'
                } uppercase tracking-wide mb-1`}>Maintenance Contract</p>
                <p className={`text-lg font-extrabold ${
                  customer.has_maintenance_contract
                    ? 'text-orange-900 dark:text-orange-100'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {customer.has_maintenance_contract ? 'Active' : 'None'}
                </p>
              </div>
            </div>
          </Card>

          {/* Bundled Discount Card */}
          {customer.bundled_discount_percentage > 0 && (
            <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💰</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">Bundled Discount</p>
                  <p className="text-2xl font-extrabold text-green-900 dark:text-green-100">
                    {customer.bundled_discount_percentage}%
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">Multi-Service</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Payment Information - Individual Cards */}
        <h2 className="text-xl font-bold mb-4 mt-6 flex items-center gap-2">
          <span className="text-2xl">💳</span>
          Payment Information
        </h2>
        <div className="customer-info-grid">
          {/* Payment Terms Card */}
          <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">Payment Terms</p>
                <p className="text-lg font-extrabold text-purple-900 dark:text-purple-100">
                  {getPaymentTermsLabel(customer.payment_terms)}
                </p>
              </div>
            </div>
          </Card>

          {/* Reliability Score Card */}
          <Card className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-200 dark:bg-indigo-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⭐</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">Reliability Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100">
                    {customer.payment_reliability_score}/10
                  </p>
                </div>
                <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${customer.payment_reliability_score * 10}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Satisfaction Score Card */}
          {customer.satisfaction_score !== null && customer.satisfaction_score !== undefined && (
            <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-200 dark:bg-emerald-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">😊</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">Satisfaction Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">
                      {customer.satisfaction_score}/10
                    </p>
                  </div>
                  <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${customer.satisfaction_score * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </TabPanel>

      <TabPanel tabId="properties" activeTab={activeTab}>
        {properties.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
            <HomeIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No properties found for this customer</p>
            <Button onClick={() => navigate('/properties/new')}>
              Add Property
            </Button>
          </Card>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              Properties ({properties.length})
            </h2>
            <div className="customer-info-grid">
              {properties.map((property, index) => {
                const gradientColors = [
                  'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
                  'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
                  'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
                  'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800',
                  'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800',
                  'from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800',
                ]
                const gradient = gradientColors[index % gradientColors.length]

                return (
                  <Card
                    key={property.id}
                    className={`p-5 cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br ${gradient}`}
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${
                        index % 6 === 0 ? 'bg-blue-200 dark:bg-blue-800' :
                        index % 6 === 1 ? 'bg-purple-200 dark:bg-purple-800' :
                        index % 6 === 2 ? 'bg-green-200 dark:bg-green-800' :
                        index % 6 === 3 ? 'bg-orange-200 dark:bg-orange-800' :
                        index % 6 === 4 ? 'bg-pink-200 dark:bg-pink-800' :
                        'bg-cyan-200 dark:bg-cyan-800'
                      } rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xl">🏘️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-extrabold mb-1 truncate">{property.property_name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                          <LocationOnIcon sx={{ fontSize: 14 }} />
                          <span className="truncate">{property.address}, {property.postcode}</span>
                        </p>
                        <div className="flex gap-3 text-xs font-semibold">
                          <span>🛏️ {property.bedrooms} bed</span>
                          <span>🚿 {property.bathrooms} bath</span>
                        </div>
                        <div className="mt-2">
                          <Badge color="blue">{property.property_type}</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </TabPanel>

      <TabPanel tabId="contracts" activeTab={activeTab}>
        {contracts.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
            <DescriptionIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No contracts found for this customer</p>
            <Button onClick={() => navigate('/contracts')}>
              View All Contracts
            </Button>
          </Card>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📄</span>
              Contracts ({contracts.length})
            </h2>
            <div className="customer-info-grid">
              {contracts.map((contract, index) => {
                const isActive = contract.status === 'ACTIVE'
                const gradient = isActive
                  ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'
                  : 'from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700'

                return (
                  <Card
                    key={contract.id}
                    className={`p-5 cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br ${gradient}`}
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${
                        isActive ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-300 dark:bg-gray-700'
                      } rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xl">📝</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-extrabold mb-1">
                              {contract.pricing_model === 'PER_PROPERTY' ? 'Per Property' : 'Per Job'} Contract
                            </h3>
                            <Badge color={isActive ? 'green' : 'gray'}>{contract.status}</Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="text-gray-600 dark:text-gray-400">
                            📅 Started: {new Date(contract.contract_start_date).toLocaleDateString('en-GB')}
                          </p>
                          {contract.contract_end_date && (
                            <p className="text-gray-600 dark:text-gray-400">
                              ⏱️ Ends: {new Date(contract.contract_end_date).toLocaleDateString('en-GB')}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className={`text-2xl font-extrabold ${
                            isActive ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            £{Number(contract.contract_value).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {contract.billing_frequency}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </TabPanel>

      <TabPanel tabId="jobs" activeTab={activeTab}>
        {recentJobs.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
            <WorkIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
            <p className="text-gray-600 dark:text-gray-400">No jobs found for this customer</p>
          </Card>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🧹</span>
              Recent Jobs ({recentJobs.length})
            </h2>
            <div className="customer-info-grid">
              {recentJobs.map((job) => {
                const isCompleted = job.status === 'COMPLETED'
                const isInProgress = job.status === 'IN_PROGRESS'
                const gradient = isCompleted
                  ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'
                  : isInProgress
                  ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800'
                  : 'from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700'

                const iconBg = isCompleted
                  ? 'bg-green-200 dark:bg-green-800'
                  : isInProgress
                  ? 'bg-blue-200 dark:bg-blue-800'
                  : 'bg-gray-300 dark:bg-gray-700'

                const icon = isCompleted ? '✅' : isInProgress ? '🔄' : '📋'

                return (
                  <Card
                    key={job.id}
                    className={`p-5 cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br ${gradient}`}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xl">{icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-extrabold mb-1">Cleaning Job</h3>
                            <Badge
                              color={
                                isCompleted ? 'green' : isInProgress ? 'blue' : 'gray'
                              }
                            >
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          📅 {job.scheduled_date
                            ? new Date(job.scheduled_date).toLocaleDateString('en-GB')
                            : 'Not scheduled'}
                        </div>
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className={`text-2xl font-extrabold ${
                            isCompleted ? 'text-green-900 dark:text-green-100' :
                            isInProgress ? 'text-blue-900 dark:text-blue-100' :
                            'text-gray-900 dark:text-gray-100'
                          }`}>
                            £{Number(job.quoted_price).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Quoted Price
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </TabPanel>

      <TabPanel tabId="billing" activeTab={activeTab}>
        <Card className="p-8 text-center bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-200 dark:bg-indigo-800 rounded-lg flex items-center justify-center">
              <span className="text-3xl">💰</span>
            </div>
          </div>
          <h3 className="text-2xl font-extrabold mb-2 text-indigo-900 dark:text-indigo-100">Invoices & Quotes</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Invoice and quote management coming soon
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/invoices')}>
              📄 View All Invoices
            </Button>
            <Button variant="secondary" onClick={() => navigate('/quotes')}>
              📋 View All Quotes
            </Button>
          </div>
        </Card>
      </TabPanel>
    </div>
  )
}
