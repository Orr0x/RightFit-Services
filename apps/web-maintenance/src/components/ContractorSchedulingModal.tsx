import { useState, useEffect } from 'react'
import { Modal, Button, Badge, Spinner } from '@rightfit/ui-core'
import { useToast } from './ui'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

interface ContractorSchedulingModalProps {
  jobId: string
  currentSchedule?: {
    date?: Date
    startTime?: string
    endTime?: string
  }
  onScheduled: () => void
  onCancel: () => void
}

interface Worker {
  id: string
  first_name: string
  last_name: string
  phone?: string
  hourly_rate?: number
  average_rating?: number
}

interface ExternalContractor {
  id: string
  company_name: string
  contact_name?: string
  phone?: string
  specialties?: string[]
  average_rating?: number
  preferred_contractor?: boolean
}

interface ContractorWithAvailability {
  id: string
  name: string
  type: 'internal' | 'external'
  isAvailable?: boolean
  conflicts?: any[]
  hourlyRate?: number
  averageRating?: number
  specialties?: string[]
  isPreferred?: boolean
  phone?: string
}

export default function ContractorSchedulingModal({
  jobId,
  currentSchedule,
  onScheduled,
  onCancel,
}: ContractorSchedulingModalProps) {
  const { user } = useAuth()
  const SERVICE_PROVIDER_ID = user?.service_provider_id
  const toast = useToast()

  // Form state
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = currentSchedule?.date ? new Date(currentSchedule.date) : new Date()
    date.setHours(0, 0, 0, 0)
    return date.toISOString().split('T')[0]
  })
  const [startTime, setStartTime] = useState(currentSchedule?.startTime || '09:00')
  const [endTime, setEndTime] = useState(currentSchedule?.endTime || '11:00')

  // Data state
  const [contractors, setContractors] = useState<ContractorWithAvailability[]>([])
  const [selectedContractor, setSelectedContractor] = useState<ContractorWithAvailability | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadContractors()
  }, [selectedDate, startTime, endTime])

  const loadContractors = async () => {
    setIsLoading(true)
    try {
      // Fetch internal workers (Worker table)
      const internalResponse = await api.get('/api/workers', {
        params: {
          service_provider_id: SERVICE_PROVIDER_ID,
          worker_type: 'MAINTENANCE',
          is_active: true,
        },
      })

      const internalContractors: Worker[] = internalResponse.data.data || []

      // Check availability for each internal contractor
      const internalWithAvailability = await Promise.all(
        internalContractors.map(async (contractor) => {
          let conflicts: any[] = []
          try {
            // Simple availability check - fetch jobs for this contractor on the selected date
            const jobsResponse = await api.get('/api/maintenance-jobs', {
              params: {
                service_provider_id: SERVICE_PROVIDER_ID,
                worker_id: contractor.id,
                from_date: selectedDate,
                to_date: selectedDate,
              },
            })

            const jobs = jobsResponse.data.data || []
            conflicts = jobs.filter((job: any) => {
              if (job.status !== 'SCHEDULED' && job.status !== 'IN_PROGRESS') {
                return false
              }
              if (!job.scheduled_start_time || !job.scheduled_end_time) {
                return false
              }
              return timeSlotsOverlap(
                startTime,
                endTime,
                job.scheduled_start_time,
                job.scheduled_end_time
              )
            })
          } catch (err) {
            console.error('Error checking availability:', err)
          }

          return {
            id: contractor.id,
            name: `${contractor.first_name} ${contractor.last_name}`,
            type: 'internal' as const,
            isAvailable: conflicts.length === 0,
            conflicts,
            hourlyRate: contractor.hourly_rate ? Number(contractor.hourly_rate) : undefined,
            averageRating: contractor.average_rating ? Number(contractor.average_rating) : undefined,
            phone: contractor.phone,
          }
        })
      )

      // Fetch external contractors
      let externalFormatted: ContractorWithAvailability[] = []
      try {
        const externalResponse = await api.get('/api/external-contractors', {
          params: {
            service_provider_id: SERVICE_PROVIDER_ID,
          },
        })

        const externalContractors: ExternalContractor[] = externalResponse.data.data || []

        externalFormatted = externalContractors.map(contractor => ({
          id: contractor.id,
          name: contractor.company_name,
          type: 'external' as const,
          specialties: contractor.specialties,
          averageRating: contractor.average_rating ? Number(contractor.average_rating) : undefined,
          isPreferred: contractor.preferred_contractor,
          phone: contractor.phone,
        }))
      } catch (err) {
        console.error('Error fetching external contractors:', err)
      }

      // Combine and sort (available internal first, then preferred external)
      const allContractors = [
        ...internalWithAvailability.sort((a, b) =>
          (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0)
        ),
        ...externalFormatted.sort((a, b) =>
          (b.isPreferred ? 1 : 0) - (a.isPreferred ? 1 : 0)
        ),
      ]

      setContractors(allContractors)
    } catch (err: any) {
      console.error('Error loading contractors:', err)
      toast.error('Failed to load contractors')
    } finally {
      setIsLoading(false)
    }
  }

  const timeSlotsOverlap = (
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean => {
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    const s1 = toMinutes(start1)
    const e1 = toMinutes(end1)
    const s2 = toMinutes(start2)
    const e2 = toMinutes(end2)

    return s1 < e2 && s2 < e1
  }

  const handleSchedule = async () => {
    if (!selectedContractor) {
      toast.error('Please select a worker')
      return
    }

    setIsSubmitting(true)

    try {
      const endpoint = selectedContractor.type === 'internal'
        ? `/api/maintenance-jobs/${jobId}/assign`
        : `/api/maintenance-jobs/${jobId}/assign-external`

      const body = {
        ...(selectedContractor.type === 'internal'
          ? { worker_id: selectedContractor.id }
          : { external_contractor_id: selectedContractor.id }
        ),
        scheduled_date: selectedDate,
        scheduled_start_time: startTime,
        scheduled_end_time: endTime,
        service_provider_id: SERVICE_PROVIDER_ID,
      }

      await api.put(endpoint, body)

      toast.success('Worker scheduled successfully')
      onScheduled()
    } catch (err: any) {
      console.error('Error scheduling worker:', err)
      console.error('Error response:', err.response?.data)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to schedule worker'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <Modal
      isOpen
      onClose={onCancel}
      title="Schedule & Assign Worker"
      size="lg"
    >
      <div className="space-y-6">
        {/* Date & Time Selection */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Schedule</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getTomorrow()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Start Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                End Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Worker/Contractor Selection */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Available Workers & Contractors ({contractors.length})
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : contractors.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No workers or contractors found
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {contractors.map((contractor) => (
                <div
                  key={contractor.id}
                  className={`
                    p-3 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedContractor?.id === contractor.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                    ${contractor.type === 'internal' && !contractor.isAvailable
                      ? 'opacity-60'
                      : ''
                    }
                  `}
                  onClick={() => setSelectedContractor(contractor)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {contractor.name}
                        </h4>

                        {contractor.type === 'external' ? (
                          <Badge variant="primary">External</Badge>
                        ) : contractor.isAvailable ? (
                          <Badge variant="success">Available</Badge>
                        ) : (
                          <Badge variant="error">Busy</Badge>
                        )}

                        {contractor.isPreferred && (
                          <Badge variant="warning">⭐ Preferred</Badge>
                        )}
                      </div>

                      <div className="flex gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                        {contractor.averageRating && (
                          <span>⭐ {contractor.averageRating.toFixed(1)}</span>
                        )}
                        {contractor.hourlyRate && (
                          <span>💷 £{contractor.hourlyRate}/hr</span>
                        )}
                        {contractor.phone && (
                          <span>📞 {contractor.phone}</span>
                        )}
                        {contractor.specialties && contractor.specialties.length > 0 && (
                          <span>🔧 {contractor.specialties.join(', ')}</span>
                        )}
                      </div>

                      {/* Show conflicts for internal contractors */}
                      {contractor.type === 'internal' &&
                       contractor.conflicts &&
                       contractor.conflicts.length > 0 && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
                          <div className="font-medium text-red-800 dark:text-red-200">
                            ⚠️ Conflicts:
                          </div>
                          {contractor.conflicts.map((conflict: any, idx: number) => (
                            <div key={idx} className="text-red-700 dark:text-red-300 ml-4">
                              • {conflict.scheduled_start_time} - {conflict.scheduled_end_time} at{' '}
                              {conflict.property?.property_name || 'Unknown property'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSchedule}
            disabled={!selectedContractor || isSubmitting}
            loading={isSubmitting}
            fullWidth
            variant="primary"
          >
            Schedule Worker
          </Button>
          <Button
            onClick={onCancel}
            disabled={isSubmitting}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
