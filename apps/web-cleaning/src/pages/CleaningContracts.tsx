import { useState, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DescriptionIcon from '@mui/icons-material/Description'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CancelIcon from '@mui/icons-material/Cancel'
import { api } from '../lib/api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../contexts/AuthContext'
import { CreateContractModal } from '../components/contracts/CreateContractModal'
import { ContractDetailsModal } from '../components/contracts/ContractDetailsModal'

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
  const [contracts, setContracts] = useState<CleaningContract[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedContract, setSelectedContract] = useState<CleaningContract | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED'>('ALL')
  const toast = useToast()

  useEffect(() => {
    fetchContracts()
  }, [statusFilter])

  const fetchContracts = async () => {
    if (!user) return

    try {
      setLoading(true)
      const params: any = {
        service_provider_id: user.tenant_id,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cleaning Contracts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage monthly cleaning contracts and property assignments
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <AddIcon sx={{ fontSize: 20, mr: 1 }} />
          New Contract
        </Button>
      </div>

      {/* Filters */}
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
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {contract.customer.business_name}
                    </h3>
                    <Badge variant={getStatusBadgeColor(contract.status)}>
                      {contract.status}
                    </Badge>
                    <Badge variant="default">{getContractTypeLabel(contract.contract_type)}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Contact</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contract.customer.contact_name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">{contract.customer.email}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Monthly Fee</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        £{Number(contract.monthly_fee).toFixed(2)}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Billed on day {contract.billing_day}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Start Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(contract.contract_start_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Properties</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contract.property_contracts?.filter((p) => p.is_active).length || 0} active
                      </p>
                    </div>
                  </div>

                  {contract.notes && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{contract.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setSelectedContract(contract)}
                  >
                    <DescriptionIcon sx={{ fontSize: 18, mr: 1 }} />
                    Details
                  </Button>

                  {contract.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handlePauseContract(contract.id)}
                    >
                      <PauseIcon sx={{ fontSize: 18 }} />
                    </Button>
                  )}

                  {contract.status === 'PAUSED' && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleResumeContract(contract.id)}
                    >
                      <PlayArrowIcon sx={{ fontSize: 18 }} />
                    </Button>
                  )}

                  {contract.status !== 'CANCELLED' && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleCancelContract(contract.id)}
                    >
                      <CancelIcon sx={{ fontSize: 18 }} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateModal && (
        <CreateContractModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchContracts()
          }}
        />
      )}

      {/* Contract Details Modal */}
      {selectedContract && (
        <ContractDetailsModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onUpdate={fetchContracts}
        />
      )}
    </div>
  )
}
