import { useState } from 'react'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'

export interface ChecklistItem {
  id: string
  label: string
  section?: string
  completed: boolean
  order_index?: number
}

interface JobChecklistProps {
  jobId: string
  items: ChecklistItem[]
  onUpdate?: (items: ChecklistItem[]) => void
  readOnly?: boolean
}

export default function JobChecklist({
  jobId,
  items: initialItems,
  onUpdate,
  readOnly = false
}: JobChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [updating, setUpdating] = useState<string | null>(null)

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const toggleItem = async (itemId: string) => {
    if (readOnly) return

    const item = items.find(i => i.id === itemId)
    if (!item) return

    setUpdating(itemId)

    try {
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')

      const response = await fetch(
        `/api/cleaning-jobs/${jobId}/checklist/${itemId}?service_provider_id=${serviceProviderId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completed: !item.completed,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update checklist item')
      }

      // Update local state
      const updatedItems = items.map(i =>
        i.id === itemId ? { ...i, completed: !i.completed } : i
      )
      setItems(updatedItems)

      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedItems)
      }
    } catch (error) {
      console.error('Error updating checklist item:', error)
      alert('Failed to update checklist item. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Checklist</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No checklist items for this job</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header with Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Checklist
          </h3>
          <span className="text-sm font-medium text-gray-600">
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              progressPercent === 100
                ? 'bg-green-600'
                : progressPercent > 0
                ? 'bg-blue-600'
                : 'bg-gray-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {progressPercent === 100
            ? 'All tasks completed!'
            : `${progressPercent.toFixed(0)}% complete`}
        </p>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {(() => {
          // Group items by section
          const sections: { [key: string]: ChecklistItem[] } = {}
          const sortedItems = items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

          sortedItems.forEach((item) => {
            const sectionName = item.section || 'General'
            if (!sections[sectionName]) {
              sections[sectionName] = []
            }
            sections[sectionName].push(item)
          })

          return Object.entries(sections).map(([sectionName, sectionItems]) => (
            <div key={sectionName}>
              {/* Section Header */}
              <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                {sectionName}
              </h4>

              {/* Section Items */}
              <div className="space-y-2">
                {sectionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      readOnly
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                    } ${item.completed ? 'bg-green-50 border-green-200' : ''} ${
                      updating === item.id ? 'opacity-50' : ''
                    }`}
                    onClick={() => !readOnly && toggleItem(item.id)}
                  >
                    {/* Checkbox Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Task Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          item.completed
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900 font-medium'
                        }`}
                      >
                        {item.label}
                      </p>
                    </div>

                    {/* Loading Indicator */}
                    {updating === item.id && (
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        })()}
      </div>

      {/* Completion Message */}
      {progressPercent === 100 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">
              All checklist items completed!
            </p>
          </div>
        </div>
      )}

      {/* Read-only Notice */}
      {readOnly && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Checklist is view-only
          </p>
        </div>
      )}
    </div>
  )
}
