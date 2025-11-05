import { useState, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import BusinessIcon from '@mui/icons-material/Business'
import { api } from '../../lib/api'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useToast } from '../ui/Toast'
import { Spinner } from '../ui/Spinner'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { Modal } from '../ui/Modal'

interface ContractDetailsModalProps {
  contract: {
    id: string
    customer_id: string
    contract_type: 'FLAT_MONTHLY' | 'PER_PROPERTY'
    contract_start_date: string
    contract_end_date?: string
    monthly_fee: number
    billing_day: number
    status: string
    notes?: string
    customer: {
      business_name: string
      contact_name: string
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
  onClose: () => void
  onUpdate: () => void
}

interface Property {
  id: string
  property_name: string
  address: string
}

export function ContractDetailsModal({ contract, onClose, onUpdate }: ContractDetailsModalProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [propertyFee, setPropertyFee] = useState('')
  const [adding, setAdding] = useState(false)
  const [monthlyFee, setMonthlyFee] = useState<number | null>(null)
  const [loadingFee, setLoadingFee] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (contract.status === 'ACTIVE' || contract.status === 'PAUSED') {
      fetchAvailableProperties()
      fetchMonthlyFee()
    }
  }, [])

  const fetchAvailableProperties = async () => {
    try {
      setLoadingProperties(true)
      const response = await api.get(`/api/customer-properties`, {
        params: { customer_id: contract.customer_id },
      })
      setProperties(response.data.data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoadingProperties(false)
    }
  }

  const fetchMonthlyFee = async () => {
    try {
      setLoadingFee(true)
      const response = await api.get(`/api/cleaning-contracts/${contract.id}/monthly-fee`)
      setMonthlyFee(response.data.data.monthly_fee)
    } catch (error) {
      console.error('Error fetching monthly fee:', error)
    } finally {
      setLoadingFee(false)
    }
  }

  const handleAddProperty = async () => {
    if (!selectedPropertyId) {
      toast.error('Please select a property', 'Validation Error')
      return
    }

    if (contract.contract_type === 'PER_PROPERTY' && (!propertyFee || Number(propertyFee) <= 0)) {
      toast.error('Please enter a valid property fee', 'Validation Error')
      return
    }

    try {
      setAdding(true)

      const payload: any = {
        property_id: selectedPropertyId,
      }

      if (contract.contract_type === 'PER_PROPERTY') {
        payload.property_monthly_fee = Number(propertyFee)
      }

      await api.post(`/api/cleaning-contracts/${contract.id}/properties`, payload)

      toast.success('Property added to contract', 'Success')

      setShowAddProperty(false)
      setSelectedPropertyId('')
      setPropertyFee('')
      onUpdate()
      fetchMonthlyFee()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add property', 'Error')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to remove this property from the contract?')) {
      return
    }

    try {
      await api.delete(`/api/cleaning-contracts/${contract.id}/properties/${propertyId}`)

      toast.success('Property removed from contract', 'Success')

      onUpdate()
      fetchMonthlyFee()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove property', 'Error')
    }
  }

  const handleUpdatePropertyFee = async (propertyId: string, newFee: string) => {
    if (!newFee || Number(newFee) <= 0) {
      toast.error('Please enter a valid fee', 'Validation Error')
      return
    }

    try {
      await api.put(`/api/cleaning-contracts/${contract.id}/properties/${propertyId}/fee`, {
        property_monthly_fee: Number(newFee),
      })

      toast.success('Property fee updated', 'Success')

      onUpdate()
      fetchMonthlyFee()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update fee', 'Error')
    }
  }

  const activeProperties = contract.property_contracts?.filter((p) => p.is_active) || []
  const availableProperties = properties.filter(
    (p) => !activeProperties.some((ap) => ap.property_id === p.id)
  )

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <div>
          <div className="text-xl font-semibold">Contract Details</div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {contract.customer.business_name}
          </p>
        </div>
      }
      size="lg"
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-6">
          {/* Contract Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Contract Type</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {contract.contract_type === 'FLAT_MONTHLY' ? 'Flat Monthly' : 'Per Property'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <Badge variant={contract.status === 'ACTIVE' ? 'success' : 'default'}>
                {contract.status}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Base Monthly Fee</p>
              <p className="font-medium text-gray-900 dark:text-white">
                £{Number(contract.monthly_fee).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {contract.contract_type === 'PER_PROPERTY' ? 'Calculated' : 'Total'} Monthly Fee
              </p>
              {loadingFee ? (
                <Spinner size="small" />
              ) : (
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  £{monthlyFee !== null ? monthlyFee.toFixed(2) : 'N/A'}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Billing Day</p>
              <p className="font-medium text-gray-900 dark:text-white">Day {contract.billing_day}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(contract.contract_start_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {contract.notes && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{contract.notes}</p>
            </div>
          )}

          {/* Properties Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contract Properties ({activeProperties.length})
              </h3>
              {(contract.status === 'ACTIVE' || contract.status === 'PAUSED') && (
                <Button size="small" onClick={() => setShowAddProperty(!showAddProperty)}>
                  <AddIcon sx={{ fontSize: 18, mr: 1 }} />
                  Add Property
                </Button>
              )}
            </div>

            {/* Add Property Form */}
            {showAddProperty && (
              <Card className="p-4 mb-4">
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
                    <Button onClick={handleAddProperty} size="small" disabled={adding}>
                      {adding ? <Spinner size="small" /> : 'Add'}
                    </Button>
                    <Button variant="outline" size="small" onClick={() => setShowAddProperty(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Properties List */}
            {activeProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BusinessIcon sx={{ fontSize: 48, mx: 'auto', mb: 2, opacity: 0.5 }} />
                <p>No properties assigned to this contract yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeProperties.map((propertyContract) => (
                  <Card key={propertyContract.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {propertyContract.property.property_name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {propertyContract.property.address}
                        </p>
                        {contract.contract_type === 'PER_PROPERTY' && (
                          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Monthly Fee: £
                            {Number(propertyContract.property_monthly_fee || 0).toFixed(2)}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {contract.status === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleRemoveProperty(propertyContract.property_id)}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
    </Modal>
  )
}
