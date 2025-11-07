import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import DescriptionIcon from '@mui/icons-material/Description'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CancelIcon from '@mui/icons-material/Cancel'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import { api } from '../lib/api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../contexts/AuthContext'
import './CleaningContracts.css'

interface CleaningContract {
  id: string
  customer_id: string
  contract_type: 'FLAT_MONTHLY' | 'PER_PROPERTY'
  contract_start_date: string
  contract_end_date?: string
  monthly_fee: number
  billing_day: number
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
  notes?: string
  created_at: string
  customer: {
    id: string
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

export default function CleaningContracts() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contracts, setContracts] = useState<CleaningContract[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const toast = useToast()

  useEffect(() => {
    fetchContracts()
  }, [statusFilter])

  const fetchContracts = async () => {
    if (!user || !user.service_provider_id) return

    try {
      setLoading(true)
      const params: any = {
        service_provider_id: user.service_provider_id,
      }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter
      }

      const response = await api.get('/api/cleaning-contracts', { params })
      setContracts(response.data.data || [])
    } catch (error: any) {
      console.error('Error fetching contracts:', error)
      toast.error(error.response?.data?.error || 'Failed to load contracts', 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handlePauseContract = async (contractId: string) => {
    try {
      await api.put(`/api/cleaning-contracts/${contractId}/pause`)
      toast.success('Contract paused successfully', 'Success')
      fetchContracts()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to pause contract', 'Error')
    }
  }

  const handleResumeContract = async (contractId: string) => {
    try {
      await api.put(`/api/cleaning-contracts/${contractId}/resume`)
      toast.success('Contract resumed successfully', 'Success')
      fetchContracts()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resume contract', 'Error')
    }
  }

  const handleCancelContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to cancel this contract? This action cannot be undone.')) {
      return
    }

    try {
      await api.put(`/api/cleaning-contracts/${contractId}/cancel`)
      toast.success('Contract cancelled successfully', 'Success')
      fetchContracts()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel contract', 'Error')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'PAUSED':
        return 'warning'
      case 'CANCELLED':
        return 'error'
      default:
        return 'default'
    }
  }

  const getContractTypeLabel = (type: string) => {
    return type === 'FLAT_MONTHLY' ? 'Flat Monthly' : 'Per Property'
  }

  // Calculate statistics
  const stats = {
    totalActive: contracts.filter((c) => c.status === 'ACTIVE').length,
    totalPaused: contracts.filter((c) => c.status === 'PAUSED').length,
    totalCancelled: contracts.filter((c) => c.status === 'CANCELLED').length,
    totalMonthlyRevenue: contracts
      .filter((c) => c.status === 'ACTIVE')
      .reduce((sum, c) => sum + Number(c.monthly_fee), 0),
    flatMonthlyCount: contracts.filter((c) => c.contract_type === 'FLAT_MONTHLY').length,
    perPropertyCount: contracts.filter((c) => c.contract_type === 'PER_PROPERTY').length,
    totalProperties: contracts.reduce(
      (sum, c) => sum + (c.property_contracts?.filter((p) => p.is_active).length || 0),
      0
    ),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    )
  }

  return (
    <div className="cleaning-contracts-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cleaning Contracts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage monthly cleaning contracts and property assignments
          </p>
        </div>
        <Button onClick={() => navigate('/contracts/new')}>
          <AddIcon sx={{ fontSize: 20, mr: 1 }} />
          New Contract
        </Button>
      </div>

      {/* Stats Dashboard */}
      <div className="contracts-stats">
        {/* Active Contracts */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Contracts</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                {stats.totalActive}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
              <DescriptionIcon className="text-green-700 dark:text-green-300" />
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            {stats.totalPaused} paused, {stats.totalCancelled} cancelled
          </p>
        </Card>

        {/* Monthly Revenue */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Monthly Revenue</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                £{stats.totalMonthlyRevenue.toFixed(0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">From active contracts only</p>
        </Card>

        {/* Contract Types */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Contract Types</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  <span className="font-bold">{stats.flatMonthlyCount}</span> Flat Monthly
                </p>
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  <span className="font-bold">{stats.perPropertyCount}</span> Per Property
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </Card>

        {/* Total Properties */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Active Properties</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                {stats.totalProperties}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
            Across all contracts
          </p>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['ALL', 'ACTIVE', 'PAUSED', 'CANCELLED'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'outline'}
              size="small"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'ALL' ? 'All Contracts' : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {/* Grid/List Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="List view"
          >
            <ViewListIcon />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="Grid view"
          >
            <ViewModuleIcon />
          </button>
        </div>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <EmptyState
          icon={DescriptionIcon}
          title="No contracts found"
          description={
            statusFilter === 'ALL'
              ? 'Get started by creating your first cleaning contract'
              : `No ${statusFilter.toLowerCase()} contracts found`
          }
          action={
            statusFilter === 'ALL' ? (
              <Button onClick={() => setShowCreateModal(true)}>
                <AddIcon sx={{ fontSize: 20, mr: 1 }} />
                Create Contract
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={viewMode === 'grid' ? 'contracts-list-grid' : 'contracts-list-view'}>
          {contracts.map((contract) => (
            <Card
              key={contract.id}
              className={`p-6 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                contract.status === 'ACTIVE'
                  ? 'border-l-4 border-l-green-500'
                  : contract.status === 'PAUSED'
                    ? 'border-l-4 border-l-yellow-500'
                    : 'border-l-4 border-l-gray-400 opacity-75'
              }`}
              onClick={() => navigate(`/contracts/${contract.id}`)}
            >
              {/* Header with customer name and badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {contract.customer.business_name}
                </h3>
                <Badge variant={getStatusBadgeColor(contract.status)} className="text-xs px-2 py-1">
                  {contract.status}
                </Badge>
                <Badge variant="default" className="text-xs px-2 py-1">
                  {getContractTypeLabel(contract.contract_type)}
                </Badge>
              </div>

              {/* Compact Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Monthly Fee */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Monthly Fee
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    £{Number(contract.monthly_fee).toFixed(2)}
                  </p>
                </div>

                {/* Properties */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Properties
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {contract.property_contracts?.filter((p) => p.is_active).length || 0}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
