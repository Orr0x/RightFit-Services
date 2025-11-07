import { useState, useEffect, useMemo } from 'react'
import { Button, Input, Card, useToast, Spinner, Select, Badge, type SelectOption } from '../../components/ui'
import { useLoading } from '../../hooks/useLoading'
import { useAuth } from '../../contexts/AuthContext'
import {
  cleaningJobsAPI,
  cleaningContractsAPI,
  customerPropertiesAPI,
  propertyCalendarsAPI,
  servicesAPI,
  workersAPI,
  checklistTemplatesAPI,
  type CreateCleaningJobData,
  type CleaningContract,
  type ContractProperty,
  type CustomerProperty,
  type PropertyCalendar,
  type Service,
  type Worker,
  type ChecklistTemplate
} from '../../lib/api'
import { useNavigate, useParams } from 'react-router-dom'

const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

type JobTab = 'contract' | 'oneoff'

export default function CreateCleaningJob() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isEditMode = Boolean(id)

  // Tab state
  const [activeTab, setActiveTab] = useState<JobTab>('contract')
  const [scheduleNow, setScheduleNow] = useState(false)  // Whether to schedule immediately

  // Form data
  const [formData, setFormData] = useState<CreateCleaningJobData>({
    service_id: '',
    property_id: '',
    customer_id: '',
    assigned_worker_id: '',
    scheduled_date: undefined,
    scheduled_start_time: undefined,
    scheduled_end_time: undefined,
    pricing_type: 'PER_TURNOVER',
    quoted_price: 45,
    service_provider_id: SERVICE_PROVIDER_ID,
    status: 'PENDING',  // Default to PENDING
  })

  // Contract tab specific state
  const [selectedContractId, setSelectedContractId] = useState<string>('')
  const [selectedContract, setSelectedContract] = useState<CleaningContract | null>(null)
  const [contractProperties, setContractProperties] = useState<ContractProperty[]>([])
  const [propertyTurnovers, setPropertyTurnovers] = useState<PropertyCalendar[]>([])
  const [selectedTurnoverId, setSelectedTurnoverId] = useState<string>('')

  // Dropdown options
  const [contracts, setContracts] = useState<CleaningContract[]>([])
  const [properties, setProperties] = useState<CustomerProperty[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])

  const { isLoading, withLoading } = useLoading()
  const [isLoadingJob, setIsLoadingJob] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.tenant_id) {
      loadDropdownData()
    }
  }, [user?.tenant_id])

  useEffect(() => {
    if (isEditMode && id && !isLoadingData) {
      loadJob()
    }
  }, [isEditMode, id, isLoadingData])

  // Load contract properties when contract is selected
  useEffect(() => {
    if (selectedContractId && activeTab === 'contract') {
      loadContractProperties(selectedContractId)
    }
  }, [selectedContractId, activeTab])

  // Load property turnovers when property is selected in contract tab
  useEffect(() => {
    if (formData.property_id && activeTab === 'contract') {
      loadPropertyTurnovers(formData.property_id)
    }
  }, [formData.property_id, activeTab])

  const loadDropdownData = async () => {
    if (!user?.tenant_id) return

    setIsLoadingData(true)
    try {
      const [contractsData, propsData, servicesData, workersData, templatesData] = await Promise.all([
        cleaningContractsAPI.list({
          service_provider_id: user.tenant_id,  // Use tenant_id, not ServiceProvider.id
          status: 'ACTIVE',
        }),
        customerPropertiesAPI.list(),
        servicesAPI.list(SERVICE_PROVIDER_ID),
        workersAPI.list(SERVICE_PROVIDER_ID),
        checklistTemplatesAPI.list(SERVICE_PROVIDER_ID),
      ])

      setContracts(contractsData || [])
      setProperties(propsData.data || [])
      setServices(servicesData || [])
      setWorkers(workersData || [])
      setTemplates(templatesData || [])
    } catch (err: any) {
      console.error('Failed to load dropdown data:', err)
      toast.error('Failed to load form data')
    } finally {
      setIsLoadingData(false)
    }
  }

  const loadContractProperties = async (contractId: string) => {
    try {
      const contractData = await cleaningContractsAPI.get(contractId)
      setSelectedContract(contractData)

      const props = await cleaningContractsAPI.getProperties(contractId)
      setContractProperties(props || [])
    } catch (err: any) {
      console.error('Failed to load contract properties:', err)
      toast.error('Failed to load contract properties')
    }
  }

  const loadPropertyTurnovers = async (propertyId: string) => {
    try {
      const turnovers = await propertyCalendarsAPI.list({
        property_id: propertyId,
        include_completed: false,
      })
      setPropertyTurnovers(turnovers || [])
    } catch (err: any) {
      console.error('Failed to load property turnovers:', err)
      // Don't show error toast, turnovers are optional
    }
  }

  const loadJob = async () => {
    setIsLoadingJob(true)
    try {
      const job = await cleaningJobsAPI.get(id!, SERVICE_PROVIDER_ID)
      setFormData({
        service_id: job.service_id,
        property_id: job.property_id,
        customer_id: job.customer_id,
        contract_id: job.contract_id || '',
        quote_id: job.quote_id || '',
        assigned_worker_id: job.assigned_worker_id || '',
        scheduled_date: convertToDateInputFormat(job.scheduled_date),
        scheduled_start_time: job.scheduled_start_time,
        scheduled_end_time: job.scheduled_end_time,
        pricing_type: job.pricing_type,
        quoted_price: job.quoted_price,
        checklist_template_id: job.checklist_template_id || '',
        checklist_total_items: job.checklist_total_items || 0,
        service_provider_id: SERVICE_PROVIDER_ID,
        status: job.status,
      })

      // Set scheduleNow based on whether the job has scheduling data
      setScheduleNow(Boolean(job.scheduled_date))

      // Set the appropriate tab based on whether there's a contract
      if (job.contract_id) {
        setActiveTab('contract')
        setSelectedContractId(job.contract_id)
      } else {
        setActiveTab('oneoff')
      }
    } catch (err: any) {
      toast.error('Failed to load cleaning job')
      console.error('Load job error:', err)
      navigate('/jobs')
    } finally {
      setIsLoadingJob(false)
    }
  }

  // Helper: Convert ISO date string to yyyy-MM-dd format for date input
  const convertToDateInputFormat = (dateString: string): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  // Convert dropdown data to SelectOption format
  const contractOptions: SelectOption[] = useMemo(
    () =>
      contracts.map((contract) => ({
        value: contract.id,
        label: `${contract.customer?.business_name || 'Unknown'} - ${contract.contract_type} (£${Number(contract.monthly_fee).toFixed(2)}/month)`,
      })),
    [contracts]
  )

  const contractPropertyOptions: SelectOption[] = useMemo(() => {
    if (!selectedContractId) return []
    return contractProperties
      .filter((cp) => cp.is_active)
      .map((cp) => ({
        value: cp.property_id,
        label: `${cp.property?.property_name || 'Unknown'} - ${cp.property?.address || ''}, ${cp.property?.postcode || ''}`,
      }))
  }, [selectedContractId, contractProperties])

  const propertyOptions: SelectOption[] = useMemo(
    () =>
      properties.map((property) => ({
        value: property.id,
        label: `${property.property_name} - ${property.address}, ${property.postcode}${
          property.customer ? ` (${property.customer.business_name})` : ''
        }`,
      })),
    [properties]
  )

  const serviceOptions: SelectOption[] = useMemo(
    () =>
      services
        .filter((s) => s.is_active)
        .map((service) => ({
          value: service.id,
          label: `${service.name} - £${Number(service.default_rate).toFixed(2)} (${service.pricing_model})`,
        })),
    [services]
  )

  const workerOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: 'Assign later' },
      ...workers.map((worker) => ({
        value: worker.id,
        label: `${worker.first_name} ${worker.last_name}${worker.worker_type ? ` - ${worker.worker_type}` : ''}`,
      })),
    ],
    [workers]
  )

  const templateOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: 'No checklist' },
      ...templates
        .filter((t) => t.is_active)
        .map((template) => ({
          value: template.id,
          label: `${template.template_name} - ${template.property_type} (${template.estimated_duration_minutes} mins)`,
        })),
    ],
    [templates]
  )

  const pricingTypeOptions: SelectOption[] = [
    { value: 'PER_TURNOVER', label: 'Per Turnover' },
    { value: 'HOURLY', label: 'Hourly Rate' },
    { value: 'FIXED', label: 'Fixed Price' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate scheduling fields if scheduleNow is enabled
    if (scheduleNow && (!formData.scheduled_date || !formData.scheduled_start_time || !formData.scheduled_end_time)) {
      toast.error('Please fill in all scheduling fields or uncheck "Schedule Now"')
      return
    }

    withLoading(async () => {
      try {
        const submitData: CreateCleaningJobData = {
          ...formData,
          // Add contract_id for contract-based jobs
          contract_id: activeTab === 'contract' ? selectedContractId : undefined,
          // Set status based on whether job is being scheduled
          status: scheduleNow && formData.scheduled_date ? 'SCHEDULED' : 'PENDING',
          // Clear scheduling fields if not scheduling now
          scheduled_date: scheduleNow ? formData.scheduled_date : undefined,
          scheduled_start_time: scheduleNow ? formData.scheduled_start_time : undefined,
          scheduled_end_time: scheduleNow ? formData.scheduled_end_time : undefined,
          // Keep assigned_worker_id regardless of scheduling status
          assigned_worker_id: formData.assigned_worker_id || undefined,
        }

        if (isEditMode && id) {
          await cleaningJobsAPI.update(id, submitData)
          const successMsg = scheduleNow && formData.status === 'PENDING'
            ? 'Job scheduled successfully'
            : 'Cleaning job updated successfully'
          toast.success(successMsg)
        } else {
          const job = await cleaningJobsAPI.create(submitData)
          const successMsg = scheduleNow ? 'Cleaning job scheduled successfully' : 'Cleaning job created (pending schedule)'
          toast.success(successMsg)

          // If created from turnover, link the job to the turnover
          if (selectedTurnoverId) {
            try {
              await propertyCalendarsAPI.linkJob(selectedTurnoverId, job.id)
            } catch (err) {
              console.error('Failed to link job to turnover:', err)
              // Don't fail the whole operation
            }
          }

          navigate(`/jobs/${job.id}`)
          return
        }
        navigate(`/jobs/${id}`)
      } catch (err: any) {
        toast.error(isEditMode ? 'Failed to update cleaning job' : 'Failed to create cleaning job')
        console.error(isEditMode ? 'Update error:' : 'Create error:', err)
      }
    })
  }

  const handleContractChange = (contractId: string) => {
    setSelectedContractId(contractId)
    setContractProperties([])
    setPropertyTurnovers([])
    setSelectedTurnoverId('')
    setFormData((prev) => ({
      ...prev,
      property_id: '',
      customer_id: '',
    }))
  }

  const handleContractPropertyChange = (propertyId: string) => {
    setFormData((prev) => ({ ...prev, property_id: propertyId }))
    setSelectedTurnoverId('')

    // Auto-fill customer from contract
    if (selectedContract) {
      setFormData((prev) => ({ ...prev, customer_id: selectedContract.customer_id }))
    }

    // Auto-fill pricing from contract
    const contractProperty = contractProperties.find((cp) => cp.property_id === propertyId)
    if (contractProperty && contractProperty.property_monthly_fee) {
      setFormData((prev) => ({ ...prev, quoted_price: Number(contractProperty.property_monthly_fee) }))
    } else if (selectedContract) {
      setFormData((prev) => ({ ...prev, quoted_price: Number(selectedContract.monthly_fee) }))
    }
  }

  const handleTurnoverSelect = (turnoverId: string) => {
    setSelectedTurnoverId(turnoverId)

    // Auto-fill date and time from turnover
    const turnover = propertyTurnovers.find((t) => t.id === turnoverId)
    if (turnover) {
      const checkoutDate = new Date(turnover.guest_checkout_datetime)
      const cleanWindowStart = new Date(turnover.clean_window_start)
      const cleanWindowEnd = new Date(turnover.clean_window_end)

      setFormData((prev) => ({
        ...prev,
        scheduled_date: convertToDateInputFormat(checkoutDate.toISOString()),
        scheduled_start_time: cleanWindowStart.toTimeString().slice(0, 5),
        scheduled_end_time: cleanWindowEnd.toTimeString().slice(0, 5),
        status: 'SCHEDULED',
      }))
      setScheduleNow(true)  // Auto-enable scheduling when turnover is selected
    }
  }

  const handlePropertyChange = (propertyId: string) => {
    setFormData((prev) => ({ ...prev, property_id: propertyId }))

    // Auto-fill customer based on selected property
    const selectedProperty = properties.find((p) => p.id === propertyId)
    if (selectedProperty && selectedProperty.customer_id) {
      setFormData((prev) => ({ ...prev, customer_id: selectedProperty.customer_id! }))
    }
  }

  const handleServiceChange = (serviceId: string) => {
    setFormData((prev) => ({ ...prev, service_id: serviceId }))

    // Auto-fill price based on selected service (only for one-off jobs)
    if (activeTab === 'oneoff') {
      const selectedService = services.find((s) => s.id === serviceId)
      if (selectedService) {
        setFormData((prev) => ({ ...prev, quoted_price: Number(selectedService.default_rate) }))
      }
    }
  }

  const handleChange = (field: keyof CreateCleaningJobData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoadingData || isLoadingJob) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Edit Cleaning Job' : 'Create Cleaning Job'}
        </h1>
      </div>

      {/* Tabs - Only show when creating new job */}
      {!isEditMode && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('contract')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'contract'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            From Contract
          </button>
          <button
            onClick={() => setActiveTab('oneoff')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'oneoff'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            One-Off Job
          </button>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CONTRACT TAB */}
          {activeTab === 'contract' && (
            <>
              {/* Contract Selection */}
              <Select
                label="Contract"
                placeholder="Select a contract"
                options={contractOptions}
                value={selectedContractId}
                onChange={(e) => handleContractChange(e.target.value)}
                required
                fullWidth
                helperText={contracts.length === 0 ? 'No active contracts found.' : 'Select the cleaning contract for this job'}
                error={contracts.length === 0 ? 'No contracts available' : undefined}
              />

              {/* Property Selection (filtered by contract) */}
              {selectedContractId && (
                <Select
                  label="Property"
                  placeholder="Select a property from this contract"
                  options={contractPropertyOptions}
                  value={formData.property_id}
                  onChange={(e) => handleContractPropertyChange(e.target.value)}
                  required
                  fullWidth
                  helperText={contractPropertyOptions.length === 0 ? 'No properties in this contract.' : undefined}
                />
              )}

              {/* Guest Turnovers (if available) */}
              {formData.property_id && propertyTurnovers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Guest Turnovers (Optional)
                  </label>
                  <div className="space-y-2">
                    {propertyTurnovers.map((turnover) => {
                      const checkoutDate = new Date(turnover.guest_checkout_datetime)
                      const checkinDate = new Date(turnover.next_guest_checkin_datetime)
                      const cleanWindowStart = new Date(turnover.clean_window_start)
                      const cleanWindowEnd = new Date(turnover.clean_window_end)
                      const cleaningHours = (cleanWindowEnd.getTime() - cleanWindowStart.getTime()) / (1000 * 60 * 60)
                      const isSameDay = checkoutDate.toDateString() === checkinDate.toDateString()

                      return (
                        <div
                          key={turnover.id}
                          onClick={() => handleTurnoverSelect(turnover.id)}
                          className={`p-4 border rounded cursor-pointer transition-colors ${
                            selectedTurnoverId === turnover.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {isSameDay && (
                                  <Badge color="orange">Same-Day Turnover</Badge>
                                )}
                                {turnover.cleaning_job_id && (
                                  <Badge color="green">Job Already Scheduled</Badge>
                                )}
                              </div>
                              <div className="text-sm space-y-1">
                                <div>
                                  <span className="font-medium">Checkout:</span>{' '}
                                  {checkoutDate.toLocaleDateString('en-GB', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                  })}{' '}
                                  at {checkoutDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div>
                                  <span className="font-medium">Check-in:</span>{' '}
                                  {checkinDate.toLocaleDateString('en-GB', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                  })}{' '}
                                  at {checkinDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="font-semibold text-blue-600 dark:text-blue-400">
                                  Cleaning Window: {cleaningHours.toFixed(1)} hours
                                </div>
                                {turnover.notes && (
                                  <div className="text-gray-600 dark:text-gray-400 italic">
                                    Note: {turnover.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Click a turnover to auto-fill scheduling details, or leave unselected to schedule manually
                  </p>
                </div>
              )}
            </>
          )}

          {/* ONE-OFF TAB */}
          {activeTab === 'oneoff' && (
            <Select
              label="Property"
              placeholder="Select a property"
              options={propertyOptions}
              value={formData.property_id}
              onChange={(e) => handlePropertyChange(e.target.value)}
              required
              fullWidth
              helperText={properties.length === 0 ? 'No properties found. Please add properties first.' : undefined}
              error={properties.length === 0 ? 'No properties available' : undefined}
            />
          )}

          {/* COMMON FIELDS (shown in both tabs after property selection) */}
          {formData.property_id && (
            <>
              {/* Service Selection */}
              <Select
                label="Service"
                placeholder="Select a service"
                options={serviceOptions}
                value={formData.service_id}
                onChange={(e) => handleServiceChange(e.target.value)}
                required
                fullWidth
                helperText={services.length === 0 ? 'No services found. Please create services first.' : undefined}
                error={services.length === 0 ? 'No services available' : undefined}
              />

              {/* Schedule Now Toggle */}
              <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <input
                  type="checkbox"
                  id="scheduleNow"
                  checked={scheduleNow}
                  onChange={(e) => setScheduleNow(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="scheduleNow" className="text-sm font-medium cursor-pointer">
                  Schedule this job now (assign date, time, and worker)
                </label>
              </div>

              {/* Worker Assignment - Always visible */}
              <Select
                label="Assigned Worker (Optional)"
                placeholder="Assign later"
                options={workerOptions}
                value={formData.assigned_worker_id || ''}
                onChange={(e) => handleChange('assigned_worker_id', e.target.value)}
                fullWidth
                helperText="Can be assigned after job creation"
              />

              {scheduleNow && (
                <>
                  {/* Scheduling */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date *</label>
                      <Input
                        type="date"
                        required
                        value={formData.scheduled_date || ''}
                        onChange={(e) => handleChange('scheduled_date', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Start Time *</label>
                      <Input
                        type="time"
                        required
                        value={formData.scheduled_start_time || ''}
                        onChange={(e) => handleChange('scheduled_start_time', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">End Time *</label>
                      <Input
                        type="time"
                        required
                        value={formData.scheduled_end_time || ''}
                        onChange={(e) => handleChange('scheduled_end_time', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Pricing Type"
                  placeholder="Select pricing type"
                  options={pricingTypeOptions}
                  value={formData.pricing_type}
                  onChange={(e) => handleChange('pricing_type', e.target.value)}
                  required
                  fullWidth
                />

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {activeTab === 'contract' ? 'Price from Contract (£)' : 'Quoted Price (£)'} *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.quoted_price}
                    onChange={(e) => handleChange('quoted_price', parseFloat(e.target.value))}
                    readOnly={activeTab === 'contract' && !!selectedContract}
                  />
                </div>
              </div>

              {/* Checklist Template */}
              <Select
                label="Checklist Template (Optional)"
                placeholder="No checklist"
                options={templateOptions}
                value={formData.checklist_template_id || ''}
                onChange={(e) => {
                  const templateId = e.target.value
                  handleChange('checklist_template_id', templateId)

                  // Auto-fill checklist total items
                  if (templateId) {
                    const template = templates.find((t) => t.id === templateId)
                    if (template && template.sections) {
                      try {
                        const sections = template.sections as any
                        const totalItems = Array.isArray(sections)
                          ? sections.reduce((sum: number, section: any) => {
                              return sum + (Array.isArray(section.items) ? section.items.length : 0)
                            }, 0)
                          : 0
                        handleChange('checklist_total_items', totalItems)
                      } catch (err) {
                        console.error('Error parsing checklist sections:', err)
                      }
                    }
                  }
                }}
                fullWidth
              />
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading
                ? isEditMode
                  ? 'Updating...'
                  : scheduleNow
                  ? 'Scheduling...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Job'
                : scheduleNow
                ? 'Schedule Job'
                : 'Create Job'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/jobs')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Card */}
      {!isEditMode && (
        <>
          {activeTab === 'contract' && contracts.length === 0 && (
            <Card className="p-4 mt-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">No Active Contracts</h3>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                You need to create a cleaning contract first before you can schedule contract-based jobs.
                Switch to "One-Off Job" tab to schedule standalone jobs.
              </div>
            </Card>
          )}

          {activeTab === 'oneoff' && (properties.length === 0 || services.length === 0) && (
            <Card className="p-4 mt-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">Missing Data?</h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {properties.length === 0 && <div>• No properties found - add properties in the Properties page</div>}
                {services.length === 0 && <div>• No services found - services need to be created in the database</div>}
                {workers.length === 0 && <div>• No workers found - add workers in the Workers page</div>}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
