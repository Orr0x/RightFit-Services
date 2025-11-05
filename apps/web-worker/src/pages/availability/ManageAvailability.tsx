import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, Plus, Trash2, Edit2, X, ArrowLeft } from 'lucide-react'
import Calendar from 'react-calendar'
import { format, isSameDay, parseISO } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'
import { WorkerAvailability } from '../../types'

export default function ManageAvailability() {
  const { worker } = useAuth()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availability, setAvailability] = useState<WorkerAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkerAvailability | null>(null)

  useEffect(() => {
    if (worker) {
      fetchAvailability()
    }
  }, [worker])

  const fetchAvailability = async () => {
    if (!worker) return

    setLoading(true)
    try {
      const token = localStorage.getItem('worker_token')
      const response = await fetch(
        `/api/worker-availability?worker_id=${worker.id}&status=BLOCKED`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAvailability(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const isDateBlocked = (date: Date) => {
    return availability.some(avail => {
      const start = parseISO(avail.start_date)
      const end = parseISO(avail.end_date)
      return date >= start && date <= end
    })
  }

  const tileClassName = ({ date }: { date: Date }) => {
    if (isDateBlocked(date)) {
      return 'blocked-date'
    }
    return null
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this blocked date?')) return

    try {
      const token = localStorage.getItem('worker_token')
      const response = await fetch(
        `/api/worker-availability/${id}?worker_id=${worker?.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        fetchAvailability()
      } else {
        alert('Failed to delete availability record')
      }
    } catch (error) {
      console.error('Error deleting availability:', error)
      alert('Failed to delete availability record')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7" />
            Manage Availability
          </h1>
          <p className="text-gray-600 mt-1">Block dates when you're unavailable</p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null)
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Block Dates
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading availability...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <Calendar
                value={selectedDate}
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value)
                  }
                }}
                tileClassName={tileClassName}
                className="custom-calendar border-0 w-full"
              />

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Legend:</p>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <span className="text-gray-600">Blocked / Unavailable</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-white border border-gray-300"></div>
                    <span className="text-gray-600">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blocked Dates List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4">
                Blocked Dates ({availability.length})
              </h3>

              {availability.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-2">No blocked dates</p>
                  <p className="text-xs text-gray-400">
                    Click "Block Dates" to add unavailable periods
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {availability
                    .sort((a, b) =>
                      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
                    )
                    .map(item => (
                      <div
                        key={item.id}
                        className="border border-red-200 bg-red-50 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {format(parseISO(item.start_date), 'MMM d, yyyy')}
                              {' - '}
                              {format(parseISO(item.end_date), 'MMM d, yyyy')}
                            </p>
                            {item.reason && (
                              <p className="text-xs text-gray-600 mt-1">{item.reason}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingItem(item)
                                setShowAddModal(true)
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <BlockDatesModal
          worker={worker}
          editingItem={editingItem}
          onClose={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
          onSuccess={() => {
            setShowAddModal(false)
            setEditingItem(null)
            fetchAvailability()
          }}
        />
      )}
    </div>
  )
}

interface BlockDatesModalProps {
  worker: any
  editingItem: WorkerAvailability | null
  onClose: () => void
  onSuccess: () => void
}

function BlockDatesModal({ worker, editingItem, onClose, onSuccess }: BlockDatesModalProps) {
  const [startDate, setStartDate] = useState(
    editingItem ? format(parseISO(editingItem.start_date), 'yyyy-MM-dd') : ''
  )
  const [endDate, setEndDate] = useState(
    editingItem ? format(parseISO(editingItem.end_date), 'yyyy-MM-dd') : ''
  )
  const [reason, setReason] = useState(editingItem?.reason || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate) {
      setError('Please select start and end dates')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('End date must be after start date')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const token = localStorage.getItem('worker_token')
      const url = editingItem
        ? `/api/worker-availability/${editingItem.id}`
        : '/api/worker-availability'

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          worker_id: worker.id,
          start_date: startDate,
          end_date: endDate,
          reason: reason || null,
          status: 'BLOCKED',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save blocked dates')
      }

      onSuccess()
    } catch (err) {
      console.error('Error saving blocked dates:', err)
      setError(err instanceof Error ? err.message : 'Failed to save blocked dates')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {editingItem ? 'Edit Blocked Dates' : 'Block Dates'}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Vacation, Personal leave, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                disabled={saving}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                editingItem ? 'Update' : 'Block Dates'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
