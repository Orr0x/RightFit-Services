import { useState, useEffect } from 'react'
import { Button, Card, Spinner, useToast, Badge } from './ui'
import { useNavigate } from 'react-router-dom'
import { propertyCalendarsAPI, type PropertyCalendar } from '../lib/api'
import AddIcon from '@mui/icons-material/Add'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

interface PropertyGuestCalendarProps {
  propertyId: string
}

interface CalendarFormData {
  guest_checkout_datetime: string
  next_guest_checkin_datetime: string
  notes: string
}

export function PropertyGuestCalendar({ propertyId }: PropertyGuestCalendarProps) {
  const [entries, setEntries] = useState<PropertyCalendar[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PropertyCalendar | null>(null)
  const [formData, setFormData] = useState<CalendarFormData>({
    guest_checkout_datetime: '',
    next_guest_checkin_datetime: '',
    notes: '',
  })
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadEntries()
  }, [propertyId])

  const loadEntries = async () => {
    try {
      setLoading(true)
      const data = await propertyCalendarsAPI.list({
        property_id: propertyId,
        include_completed: false,
      })
      setEntries(data)
    } catch (err: any) {
      console.error('Failed to load calendar entries:', err)
      toast.error('Failed to load guest calendar')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate dates
    const checkout = new Date(formData.guest_checkout_datetime)
    const checkin = new Date(formData.next_guest_checkin_datetime)

    if (checkin <= checkout) {
      toast.error('Check-in time must be after checkout time')
      return
    }

    // Convert datetime-local format to ISO format for API
    const payload = {
      guest_checkout_datetime: checkout.toISOString(),
      next_guest_checkin_datetime: checkin.toISOString(),
      notes: formData.notes,
    }

    try {
      if (editingEntry) {
        await propertyCalendarsAPI.update(editingEntry.id, payload)
        toast.success('Guest turnover updated')
      } else {
        await propertyCalendarsAPI.create({
          property_id: propertyId,
          ...payload,
        })
        toast.success('Guest turnover added')
      }

      setShowForm(false)
      setEditingEntry(null)
      setFormData({
        guest_checkout_datetime: '',
        next_guest_checkin_datetime: '',
        notes: '',
      })
      loadEntries()
    } catch (err: any) {
      console.error('Submit error:', err)
      toast.error(err.response?.data?.error || 'Failed to save guest turnover')
    }
  }

  const handleEdit = (entry: PropertyCalendar) => {
    setEditingEntry(entry)
    // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
    const formatForInput = (isoString: string) => {
      const date = new Date(isoString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    setFormData({
      guest_checkout_datetime: formatForInput(entry.guest_checkout_datetime),
      next_guest_checkin_datetime: formatForInput(entry.next_guest_checkin_datetime),
      notes: entry.notes || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this guest turnover entry?')) return

    try {
      await propertyCalendarsAPI.delete(id)
      toast.success('Guest turnover deleted')
      loadEntries()
    } catch (err: any) {
      console.error('Delete error:', err)
      toast.error('Failed to delete guest turnover')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingEntry(null)
    setFormData({
      guest_checkout_datetime: '',
      next_guest_checkin_datetime: '',
      notes: '',
    })
  }

  const calculateDuration = (entry: PropertyCalendar) => {
    const start = new Date(entry.clean_window_start)
    const end = new Date(entry.clean_window_end)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return hours.toFixed(1)
  }

  const isSameDayTurnover = (entry: PropertyCalendar) => {
    const checkout = new Date(entry.guest_checkout_datetime)
    const checkin = new Date(entry.next_guest_checkin_datetime)
    return checkout.toDateString() === checkin.toDateString()
  }

  if (loading) {
    return (
      <Card className="p-6 mb-6">
        <div className="flex justify-center">
          <Spinner />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarMonthIcon /> Guest Turnover Schedule
        </h2>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <AddIcon style={{ fontSize: '18px', marginRight: '4px' }} />
            Add Turnover
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded">
          <h3 className="font-semibold mb-4">
            {editingEntry ? 'Edit Guest Turnover' : 'Add Guest Turnover'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Guest Checkout Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.guest_checkout_datetime}
                onChange={(e) =>
                  setFormData({ ...formData, guest_checkout_datetime: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Next Guest Check-in Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.next_guest_checkin_datetime}
                onChange={(e) =>
                  setFormData({ ...formData, next_guest_checkin_datetime: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any special instructions or notes for this turnover..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">{editingEntry ? 'Update' : 'Add'} Turnover</Button>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CalendarMonthIcon style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.5 }} />
          <p>No upcoming guest turnovers scheduled</p>
          <p className="text-sm mt-2">Add guest checkout/checkin times to schedule cleaning windows</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const checkoutDate = new Date(entry.guest_checkout_datetime)
            const checkinDate = new Date(entry.next_guest_checkin_datetime)
            const cleaningWindow = calculateDuration(entry)
            const isSameDay = isSameDayTurnover(entry)

            return (
              <div
                key={entry.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isSameDay && (
                        <Badge color="orange">Same-Day Turnover</Badge>
                      )}
                      {entry.cleaning_job_id && (
                        <Badge
                          color="green"
                          onClick={() => navigate(`/jobs/${entry.cleaning_job_id}`)}
                          className="cursor-pointer"
                        >
                          Job Scheduled
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Guest Checkout
                        </div>
                        <div className="text-gray-900 dark:text-gray-100">
                          {checkoutDate.toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {checkoutDate.toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Next Guest Check-in
                        </div>
                        <div className="text-gray-900 dark:text-gray-100">
                          {checkinDate.toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {checkinDate.toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          Cleaning Window: {cleaningWindow} hours
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          (Must finish 2 hours before check-in)
                        </span>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                        Note: {entry.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Edit"
                    >
                      <EditIcon style={{ fontSize: '18px' }} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                      title="Delete"
                    >
                      <DeleteIcon style={{ fontSize: '18px' }} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
