import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Spinner, Badge, Input, Select } from '@rightfit/ui-core';
import { useToast, Tabs, TabPanel } from '../components/ui';
import {
  api,
  cleaningContractsAPI,
  checklistTemplatesAPI,
  cleaningQuotesAPI,
  cleaningInvoicesAPI,
  customerPropertiesAPI,
  type ChecklistTemplate,
  type CleaningQuote,
  type CleaningInvoice
} from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BusinessIcon from '@mui/icons-material/Business'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CancelIcon from '@mui/icons-material/Cancel'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DownloadIcon from '@mui/icons-material/Download'
import DescriptionIcon from '@mui/icons-material/Description'
import ImageIcon from '@mui/icons-material/Image'
import './ContractDetails.css'
import './Quotes.css'

const SERVICE_PROVIDER_ID = 'sp-cleaning-test'

interface CleaningContract {
  id: string
  contract_number?: string
  customer_id: string
  contract_type: 'FLAT_MONTHLY' | 'PER_PROPERTY'
  contract_start_date: string
  contract_end_date?: string
  monthly_fee: number
  billing_day: number
  status: string
  notes?: string
  customer_address_line1?: string
  customer_address_line2?: string
  customer_city?: string
  customer_postcode?: string
  customer_country?: string
  customer: {
    business_name: string
    contact_name: string
    email: string
    phone: string
  }
  property_contracts?: Array<{
    id: string
    property_id: string
    property_monthly_fee?: number
    is_active: boolean
    property: {
      id: string
      property_name: string
      address: string
    }
  }>
}

interface Property {
  id: string
  property_name: string
  address: string
}

interface ContractFile {
  id: string
  contract_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  description?: string
  uploaded_by?: string
  created_at: string
}

export default function ContractDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const [contract, setContract] = useState<CleaningContract | null>(null)
  const [loading, setLoading] = useState(true)
  const [monthlyFee, setMonthlyFee] = useState<number | null>(null)
  const [loadingFee, setLoadingFee] = useState(false)

  // Add property state
  const [properties, setProperties] = useState<Property[]>([])
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [propertyFee, setPropertyFee] = useState('')
  const [adding, setAdding] = useState(false)

  // Edit notes state
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [editedNotes, setEditedNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Edit contract details state
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [editedDetails, setEditedDetails] = useState({
    contract_number: '',
    customer_address_line1: '',
    customer_address_line2: '',
    customer_city: '',
    customer_postcode: '',
    customer_country: '',
  })
  const [savingDetails, setSavingDetails] = useState(false)

  // File management state
  const [files, setFiles] = useState<ContractFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileDescription, setFileDescription] = useState('')

  // Tab and linked data state
  const [activeTab, setActiveTab] = useState('details')
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([])
  const [quotes, setQuotes] = useState<CleaningQuote[]>([])
  const [invoices, setInvoices] = useState<CleaningInvoice[]>([])
  const [loadingLinkedData, setLoadingLinkedData] = useState(false)

  // Checklist management state
  const [availableChecklists, setAvailableChecklists] = useState<ChecklistTemplate[]>([])
  const [linkedChecklistIds, setLinkedChecklistIds] = useState<string[]>([])
  const [showAddChecklist, setShowAddChecklist] = useState(false)
  const [selectedChecklistId, setSelectedChecklistId] = useState('')
  const [addingChecklist, setAddingChecklist] = useState(false)

  useEffect(() => {
    if (id && user) {
      fetchContract()
      fetchFiles()
    }
  }, [id, user])

  // Load linked data when tab changes
  useEffect(() => {
    if (id && activeTab !== 'details') {
      loadLinkedData()
    }
  }, [id, activeTab])

  const fetchContract = async () => {
    if (!user || !id) return

    try {
      setLoading(true)
      const contractData = await cleaningContractsAPI.get(id)
      setContract(contractData)

      if (contractData.status === 'ACTIVE' || contractData.status === 'PAUSED') {
        fetchAvailableProperties(contractData.customer_id)
        fetchMonthlyFee()
      }
    } catch (error: any) {
      toast.error('Failed to load contract details')
      console.error('Error fetching contract:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyFee = async () => {
    if (!id) return

    try {
      setLoadingFee(true)
      const fee = await cleaningContractsAPI.calculateMonthlyFee(id)
      setMonthlyFee(fee)
    } catch (error) {
      console.error('Error fetching monthly fee:', error)
    } finally {
      setLoadingFee(false)
    }
  }

  const fetchAvailableProperties = async (customerId: string) => {
    try {
      const response = await customerPropertiesAPI.list({
        customer_id: customerId,
        service_provider_id: SERVICE_PROVIDER_ID
      })
      setProperties(response.data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const loadLinkedData = async () => {
    if (!id) return

    try {
      setLoadingLinkedData(true)

      // Load checklists
      if (activeTab === 'checklists') {
        // Use the service provider ID (there's only one in the database)
        const SERVICE_PROVIDER_ID = 'sp-cleaning-test'
        const checklistsData = await checklistTemplatesAPI.list(SERVICE_PROVIDER_ID)
        const allChecklists = checklistsData || []
        setAvailableChecklists(allChecklists)

        // Load linked checklist IDs from localStorage (temporary solution)
        const storedLinks = localStorage.getItem(`contract_${id}_checklists`)
        const linkedIds = storedLinks ? JSON.parse(storedLinks) : []
        setLinkedChecklistIds(linkedIds)

        // Filter to show only linked checklists
        const linked = allChecklists.filter(c => linkedIds.includes(c.id))
        setChecklists(linked)
      }

      // Load quotes
      if (activeTab === 'quotes') {
        const quotesData = await cleaningQuotesAPI.list({ customer_id: contract?.customer_id })
        setQuotes(quotesData || [])
      }

      // Load invoices
      if (activeTab === 'invoices') {
        const invoicesData = await cleaningInvoicesAPI.list({ customer_id: contract?.customer_id })
        setInvoices(invoicesData || [])
      }
    } catch (error) {
      console.error('Failed to load linked data:', error)
    } finally {
      setLoadingLinkedData(false)
    }
  }

  const handleAddChecklist = async () => {
    if (!id || !selectedChecklistId) {
      toast.error('Please select a checklist template')
      return
    }

    try {
      setAddingChecklist(true)

      // Add to linked checklists
      const newLinkedIds = [...linkedChecklistIds, selectedChecklistId]
      setLinkedChecklistIds(newLinkedIds)

      // Save to localStorage (temporary solution)
      localStorage.setItem(`contract_${id}_checklists`, JSON.stringify(newLinkedIds))

      // Update displayed checklists
      const newChecklist = availableChecklists.find(c => c.id === selectedChecklistId)
      if (newChecklist) {
        setChecklists([...checklists, newChecklist])
      }

      toast.success('Checklist template added to contract')
      setShowAddChecklist(false)
      setSelectedChecklistId('')
    } catch (error: any) {
      toast.error('Failed to add checklist template')
    } finally {
      setAddingChecklist(false)
    }
  }

  const handleRemoveChecklist = async (checklistId: string) => {
    if (!id) return
    if (!confirm('Are you sure you want to remove this checklist template from the contract?')) {
      return
    }

    try {
      // Remove from linked checklists
      const newLinkedIds = linkedChecklistIds.filter(id => id !== checklistId)
      setLinkedChecklistIds(newLinkedIds)

      // Save to localStorage (temporary solution)
      localStorage.setItem(`contract_${id}_checklists`, JSON.stringify(newLinkedIds))

      // Update displayed checklists
      setChecklists(checklists.filter(c => c.id !== checklistId))

      toast.success('Checklist template removed from contract')
    } catch (error: any) {
      toast.error('Failed to remove checklist template')
    }
  }

  const handleAddProperty = async () => {
    if (!id) return
    if (!selectedPropertyId) {
      toast.error('Please select a property')
      return
    }

    if (contract?.contract_type === 'PER_PROPERTY' && (!propertyFee || Number(propertyFee) <= 0)) {
      toast.error('Please enter a valid property fee')
      return
    }

    try {
      setAdding(true)

      const payload: { property_id: string; property_monthly_fee?: number } = {
        property_id: selectedPropertyId,
      }

      if (contract?.contract_type === 'PER_PROPERTY') {
        payload.property_monthly_fee = Number(propertyFee)
      }

      await cleaningContractsAPI.linkProperty(id, payload)

      toast.success('Property added to contract')

      setShowAddProperty(false)
      setSelectedPropertyId('')
      setPropertyFee('')
      fetchContract()
      fetchMonthlyFee()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add property')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveProperty = async (propertyId: string) => {
    if (!id) return
    if (!confirm('Are you sure you want to remove this property from the contract?')) {
      return
    }

    try {
      await cleaningContractsAPI.unlinkProperty(id, propertyId)

      toast.success('Property removed from contract')

      fetchContract()
      fetchMonthlyFee()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove property')
    }
  }

  const handlePauseContract = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to pause this contract?')) return

    try {
      await cleaningContractsAPI.pause(id)
      toast.success('Contract paused')
      fetchContract()
    } catch (error: any) {
      toast.error('Failed to pause contract')
    }
  }

  const handleResumeContract = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to resume this contract?')) return

    try {
      await cleaningContractsAPI.resume(id)
      toast.success('Contract resumed')
      fetchContract()
    } catch (error: any) {
      toast.error('Failed to resume contract')
    }
  }

  const handleCancelContract = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to cancel this contract? This action cannot be undone.')) return

    try {
      await cleaningContractsAPI.cancel(id)
      toast.success('Contract cancelled')
      fetchContract()
    } catch (error: any) {
      toast.error('Failed to cancel contract')
    }
  }

  const handleEditNotes = () => {
    setEditedNotes(contract?.notes || '')
    setIsEditingNotes(true)
  }

  const handleSaveNotes = async () => {
    if (!id) return

    try {
      setSavingNotes(true)
      await api.put(`/api/cleaning-contracts/${id}`, {
        notes: editedNotes,
      })
      toast.success('Notes updated successfully')
      setIsEditingNotes(false)
      fetchContract()
    } catch (error: any) {
      toast.error('Failed to update notes')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleCancelEditNotes = () => {
    setIsEditingNotes(false)
    setEditedNotes('')
  }

  const handleEditDetails = () => {
    setEditedDetails({
      contract_number: contract?.contract_number || '',
      customer_address_line1: contract?.customer_address_line1 || '',
      customer_address_line2: contract?.customer_address_line2 || '',
      customer_city: contract?.customer_city || '',
      customer_postcode: contract?.customer_postcode || '',
      customer_country: contract?.customer_country || '',
    })
    setIsEditingDetails(true)
  }

  const handleSaveDetails = async () => {
    if (!id) return

    try {
      setSavingDetails(true)
      await api.put(`/api/cleaning-contracts/${id}`, {
        contract_number: editedDetails.contract_number || null,
        customer_address_line1: editedDetails.customer_address_line1 || null,
        customer_address_line2: editedDetails.customer_address_line2 || null,
        customer_city: editedDetails.customer_city || null,
        customer_postcode: editedDetails.customer_postcode || null,
        customer_country: editedDetails.customer_country || null,
      })
      toast.success('Contract details updated successfully')
      setIsEditingDetails(false)
      fetchContract()
    } catch (error: any) {
      toast.error('Failed to update contract details')
    } finally {
      setSavingDetails(false)
    }
  }

  const handleCancelEditDetails = () => {
    setIsEditingDetails(false)
  }

  const fetchFiles = async () => {
    if (!id) return

    try {
      setLoadingFiles(true)
      const response = await api.get(`/api/cleaning-contracts/${id}/files`)
      setFiles(response.data.data || [])
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleFileUpload = async () => {
    if (!id || !selectedFile) return

    try {
      setUploadingFile(true)

      const formData = new FormData()
      formData.append('file', selectedFile)
      if (fileDescription) {
        formData.append('description', fileDescription)
      }

      await api.post(`/api/cleaning-contracts/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('File uploaded successfully')
      setSelectedFile(null)
      setFileDescription('')
      fetchFiles()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload file')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleFileDelete = async (fileId: string, fileName: string) => {
    if (!id) return
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return

    try {
      await api.delete(`/api/cleaning-contracts/${id}/files/${fileId}`)
      toast.success('File deleted successfully')
      fetchFiles()
    } catch (error: any) {
      toast.error('Failed to delete file')
    }
  }

  const handleFileDownload = async (fileId: string, fileName: string) => {
    if (!id) return

    try {
      const response = await api.get(`/api/cleaning-contracts/${id}/files/${fileId}/download`, {
        responseType: 'blob',
      })

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      toast.error('Failed to download file')
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon sx={{ fontSize: 40, color: '#10b981' }} />
    }
    return <DescriptionIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contract Not Found</h1>
          <Button onClick={() => navigate('/contracts')}>
            <ArrowBackIcon sx={{ mr: 1 }} />
            Back to Contracts
          </Button>
        </div>
      </div>
    )
  }

  const activeProperties = contract.property_contracts?.filter((p) => p.is_active) || []
  const availableProperties = properties.filter(
    (p) => !activeProperties.some((ap) => ap.property_id === p.id)
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'PAUSED': return 'warning'
      case 'CANCELLED': return 'default'
      default: return 'default'
    }
  }

  const getContractTypeLabel = (type: string) => {
    return type === 'FLAT_MONTHLY' ? 'Flat Monthly' : 'Per Property'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/contracts')}>
            <ArrowBackIcon />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{contract.customer.business_name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Contract Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {contract.status !== 'CANCELLED' && !isEditingDetails && (
            <Button variant="outline" onClick={handleEditDetails}>
              <EditIcon sx={{ fontSize: 18, mr: 1 }} />
              Edit Details
            </Button>
          )}
          {contract.status === 'ACTIVE' && (
            <Button variant="outline" onClick={handlePauseContract}>
              <PauseIcon sx={{ fontSize: 18, mr: 1 }} />
              Pause Contract
            </Button>
          )}
          {contract.status === 'PAUSED' && (
            <Button variant="outline" onClick={handleResumeContract}>
              <PlayArrowIcon sx={{ fontSize: 18, mr: 1 }} />
              Resume Contract
            </Button>
          )}
          {contract.status !== 'CANCELLED' && (
            <Button variant="outline" onClick={handleCancelContract} className="text-red-600 hover:bg-red-50">
              <CancelIcon sx={{ fontSize: 18, mr: 1 }} />
              Cancel Contract
            </Button>
          )}
        </div>
      </div>

      {/* Edit Details Form */}
      {isEditingDetails && (
        <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">Edit Contract Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contract Number
              </label>
              <Input
                type="text"
                value={editedDetails.contract_number}
                onChange={(e) => setEditedDetails({ ...editedDetails, contract_number: e.target.value })}
                placeholder="e.g., CT-2025-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer Address
              </label>
              <div className="space-y-3">
                <Input
                  type="text"
                  value={editedDetails.customer_address_line1}
                  onChange={(e) => setEditedDetails({ ...editedDetails, customer_address_line1: e.target.value })}
                  placeholder="Address Line 1"
                />
                <Input
                  type="text"
                  value={editedDetails.customer_address_line2}
                  onChange={(e) => setEditedDetails({ ...editedDetails, customer_address_line2: e.target.value })}
                  placeholder="Address Line 2"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    value={editedDetails.customer_city}
                    onChange={(e) => setEditedDetails({ ...editedDetails, customer_city: e.target.value })}
                    placeholder="City"
                  />
                  <Input
                    type="text"
                    value={editedDetails.customer_postcode}
                    onChange={(e) => setEditedDetails({ ...editedDetails, customer_postcode: e.target.value })}
                    placeholder="Postcode"
                  />
                </div>
                <Input
                  type="text"
                  value={editedDetails.customer_country}
                  onChange={(e) => setEditedDetails({ ...editedDetails, customer_country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveDetails} disabled={savingDetails}>
                {savingDetails ? <Spinner size="small" /> : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleCancelEditDetails}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <TabPanel tabId="details" label="Contract Details" activeTab={activeTab}>
          {/* Contract Info - Individual Cards */}
          <div className="contract-info-grid">
        {/* Status Card */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📊</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Status</p>
              <Badge variant={getStatusBadgeColor(contract.status)} className="text-xs px-2 py-1 font-semibold">
                {contract.status}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Contract Type Card */}
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📝</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">Contract Type</p>
              <p className="text-lg font-extrabold text-purple-900 dark:text-purple-100">
                {getContractTypeLabel(contract.contract_type)}
              </p>
            </div>
          </div>
        </Card>

        {/* Base Monthly Fee Card */}
        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">💷</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">Base Monthly Fee</p>
              <p className="text-2xl font-extrabold text-green-900 dark:text-green-100">
                £{Number(contract.monthly_fee).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {/* Total Monthly Fee Card */}
        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-200 dark:bg-emerald-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">💰</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">
                {contract.contract_type === 'PER_PROPERTY' ? 'Calculated' : 'Total'} Fee
              </p>
              {loadingFee ? (
                <Spinner size="small" />
              ) : (
                <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">
                  £{monthlyFee !== null ? monthlyFee.toFixed(2) : 'N/A'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Billing Day Card */}
        <Card className="p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-200 dark:bg-yellow-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📅</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wide mb-1">Billing Day</p>
              <p className="text-2xl font-extrabold text-yellow-900 dark:text-yellow-100">
                Day {contract.billing_day}
              </p>
            </div>
          </div>
        </Card>

        {/* Start Date Card */}
        <Card className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-200 dark:bg-indigo-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🚀</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">Start Date</p>
              <p className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100">
                {new Date(contract.contract_start_date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* End Date Card */}
        {contract.contract_end_date && (
          <Card className="p-5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-200 dark:bg-red-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⏱️</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wide mb-1">End Date</p>
                <p className="text-lg font-extrabold text-red-900 dark:text-red-100">
                  {new Date(contract.contract_end_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Active Properties Card */}
        <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-200 dark:bg-orange-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🏠</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">Properties</p>
              <p className="text-3xl font-extrabold text-orange-900 dark:text-orange-100">
                {activeProperties.length}
              </p>
            </div>
          </div>
        </Card>

        {/* Contract Number Card */}
        {contract.contract_number && (
          <Card className="p-5 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-pink-200 dark:bg-pink-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🔖</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wide mb-1">Contract Number</p>
                <p className="text-lg font-extrabold text-pink-900 dark:text-pink-100">
                  {contract.contract_number}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Notes Card */}
      <Card className="p-5 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📝</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Notes</p>
              {!isEditingNotes && contract.status !== 'CANCELLED' && (
                <Button variant="outline" size="small" onClick={handleEditNotes}>
                  <EditIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Edit
                </Button>
              )}
            </div>
            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add notes about this contract..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveNotes} disabled={savingNotes}>
                    {savingNotes ? <Spinner size="small" /> : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEditNotes}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {contract.notes || 'No notes added yet'}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Customer Info - Individual Cards */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">👤</span>
        Customer Information
      </h2>
      <div className="customer-info-grid">
        {/* Contact Name Card */}
        <Card className="p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-cyan-200 dark:bg-cyan-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">👨‍💼</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide mb-1">Contact Name</p>
              <p className="text-lg font-extrabold text-cyan-900 dark:text-cyan-100">
                {contract.customer.contact_name}
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
                {contract.customer.email}
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
                {contract.customer.phone}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Address */}
      {(contract.customer_address_line1 || contract.customer_city || contract.customer_postcode) && (
        <>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 mt-6">
            <span className="text-2xl">📍</span>
            Customer Address
          </h2>
          <Card className="p-5 mb-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🏢</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Address</p>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 space-y-1">
                  {contract.customer_address_line1 && <p>{contract.customer_address_line1}</p>}
                  {contract.customer_address_line2 && <p>{contract.customer_address_line2}</p>}
                  {contract.customer_city && <p>{contract.customer_city}</p>}
                  {contract.customer_postcode && <p className="font-bold">{contract.customer_postcode}</p>}
                  {contract.customer_country && <p>{contract.customer_country}</p>}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
        </TabPanel>

        <TabPanel tabId="properties" label="Properties" activeTab={activeTab}>
          {/* Properties Section */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                Contract Properties ({activeProperties.length})
              </h2>
              {(contract.status === 'ACTIVE' || contract.status === 'PAUSED') && (
                <Button size="small" onClick={() => setShowAddProperty(!showAddProperty)}>
                  <AddIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  Add Property
                </Button>
              )}
            </div>

            {/* Add Property Form */}
            {showAddProperty && (
              <Card className="p-4 mb-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="text-lg">➕</span>
                  Add Property to Contract
                </h3>
                <div className="space-y-3">
                  <Select
                    placeholder="Select a property..."
                    options={availableProperties.map((property) => ({
                      value: property.id,
                      label: `${property.property_name} - ${property.address}`,
                    }))}
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                  />

                  {contract.contract_type === 'PER_PROPERTY' && (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={propertyFee}
                      onChange={(e) => setPropertyFee(e.target.value)}
                      placeholder="Monthly fee for this property"
                    />
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleAddProperty} disabled={adding}>
                      {adding ? <Spinner size="small" /> : 'Add Property'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddProperty(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Properties Grid */}
            {activeProperties.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BusinessIcon sx={{ fontSize: 64, mx: 'auto', mb: 2, opacity: 0.5 }} />
                <p className="text-lg font-medium">No properties assigned to this contract yet</p>
                <p className="text-sm mt-2">Add properties to start managing cleaning schedules</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeProperties.map((propertyContract) => (
                  <Card
                    key={propertyContract.id}
                    className="p-4 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {propertyContract.property.property_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {propertyContract.property.address}
                        </p>
                      </div>
                      {contract.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleRemoveProperty(propertyContract.property_id)}
                          className="ml-2 text-red-600 hover:bg-red-50"
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </Button>
                      )}
                    </div>

                    {contract.contract_type === 'PER_PROPERTY' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Fee</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          £{Number(propertyContract.property_monthly_fee || 0).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabPanel>

        <TabPanel tabId="files" label="Files" activeTab={activeTab}>
          {/* Files Section */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">📎</span>
                Contract Files ({files.length})
              </h2>
            </div>

            {/* File Upload Section */}
            {contract.status !== 'CANCELLED' && (
              <Card className="p-4 mb-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="text-lg">📤</span>
                  Upload New File
                </h3>
                <div className="space-y-3">
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      className="hidden"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" size="small" as="span">
                        <AttachFileIcon sx={{ fontSize: 18, mr: 0.5 }} />
                        Choose File
                      </Button>
                    </label>
                    {selectedFile && (
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </span>
                    )}
                  </div>

                  {selectedFile && (
                    <>
                      <Input
                        type="text"
                        value={fileDescription}
                        onChange={(e) => setFileDescription(e.target.value)}
                        placeholder="Optional: Add a description for this file"
                      />

                      <div className="flex gap-2">
                        <Button onClick={handleFileUpload} disabled={uploadingFile}>
                          {uploadingFile ? <Spinner size="small" /> : 'Upload File'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedFile(null)
                            setFileDescription('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supported formats: Images (jpg, png, gif, webp) and Documents (pdf, doc, docx, xls, xlsx, txt). Max size: 10MB
                  </p>
                </div>
              </Card>
            )}

            {/* Files List */}
            {loadingFiles ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AttachFileIcon sx={{ fontSize: 64, mx: 'auto', mb: 2, opacity: 0.5 }} />
                <p className="text-lg font-medium">No files uploaded yet</p>
                <p className="text-sm mt-2">Upload documents and images related to this contract</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <Card
                    key={file.id}
                    className="p-4 hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">{getFileIcon(file.file_type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white break-words">
                          {file.file_name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString('en-GB')}
                        </p>
                        {file.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                            {file.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleFileDownload(file.id, file.file_name)}
                      >
                        <DownloadIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        Download
                      </Button>
                      {contract.status !== 'CANCELLED' && (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleFileDelete(file.id, file.file_name)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabPanel>

        <TabPanel tabId="checklists" label="Checklists" activeTab={activeTab}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Linked Checklist Templates ({checklists.length})</h2>
              <div className="flex gap-2">
                <Button size="small" onClick={() => setShowAddChecklist(!showAddChecklist)}>
                  <AddIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  Add Checklist
                </Button>
                <Button variant="outline" size="small" onClick={() => navigate('/checklist-templates')}>
                  View All Templates
                </Button>
              </div>
            </div>

            {/* Add Checklist Form */}
            {showAddChecklist && (
              <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="text-lg">➕</span>
                  Add Checklist Template to Contract
                </h3>
                <div className="space-y-3">
                  <Select
                    placeholder="Select a checklist template..."
                    options={availableChecklists
                      .filter(c => !linkedChecklistIds.includes(c.id))
                      .map((checklist) => ({
                        value: checklist.id,
                        label: `${checklist.template_name} - ${checklist.property_type}`,
                      }))}
                    value={selectedChecklistId}
                    onChange={(e) => setSelectedChecklistId(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <Button onClick={handleAddChecklist} disabled={addingChecklist}>
                      {addingChecklist ? <Spinner size="small" /> : 'Add Checklist'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddChecklist(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {loadingLinkedData ? (
              <Card className="p-12 text-center">
                <Spinner size="lg" />
                <p className="text-gray-600 mt-3">Loading checklists...</p>
              </Card>
            ) : checklists.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Linked Checklists</h3>
                <p className="text-gray-600 mb-6">No checklist templates linked to this contract yet</p>
                <Button onClick={() => setShowAddChecklist(true)}>
                  <AddIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  Add Checklist Template
                </Button>
              </Card>
            ) : (
              <div className="quotes-grid">
                {checklists.map((checklist) => (
                  <Card key={checklist.id} className="quote-card">
                    <div className="quote-card-header">
                      <div>
                        <h3 className="quote-number">{checklist.template_name}</h3>
                        <p className="quote-customer">{checklist.property_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {checklist.is_active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Active</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">Inactive</span>
                        )}
                        {contract?.status !== 'CANCELLED' && (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleRemoveChecklist(checklist.id)}
                            className="ml-2 text-red-600 hover:bg-red-50"
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="quote-details">
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{checklist.estimated_duration_minutes} min</span>
                      </div>
                      <div className="quote-detail-item">
                        <span className="text-gray-600">Sections:</span>
                        <span className="font-medium">{Array.isArray(checklist.sections) ? checklist.sections.length : 0}</span>
                      </div>
                    </div>
                    <div className="quote-footer mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => navigate('/checklist-templates')}
                        fullWidth
                      >
                        View Template Details
                      </Button>
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
              <Button onClick={() => navigate(`/quotes/new?customer_id=${contract?.customer_id}`)}>+ Create Quote</Button>
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
                <Button onClick={() => navigate(`/quotes/new?customer_id=${contract?.customer_id}`)}>+ Create Quote</Button>
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

        <TabPanel tabId="invoices" label="Invoices" activeTab={activeTab}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Invoices</h2>
              <Button onClick={() => navigate(`/invoices/new?customer_id=${contract?.customer_id}`)}>+ Create Invoice</Button>
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
                <Button onClick={() => navigate(`/invoices/new?customer_id=${contract?.customer_id}`)}>+ Create Invoice</Button>
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
      </Tabs>
    </div>
  )
}
