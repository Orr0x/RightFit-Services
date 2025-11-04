import { useState, useEffect } from 'react'
import { workersAPI, type WorkerHistoryEntry } from '../lib/api'
import { Card } from './ui'

const SERVICE_PROVIDER_ID = '8aeb5932-907c-41b3-a2bc-05b27ed0dc87'

interface WorkerHistoryTimelineProps {
  workerId: string
}

export function WorkerHistoryTimeline({ workerId }: WorkerHistoryTimelineProps) {
  const [history, setHistory] = useState<WorkerHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [workerId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await workersAPI.getHistory(workerId, SERVICE_PROVIDER_ID)
      setHistory(data)
    } catch (err: any) {
      console.error('Error loading worker history:', err)
      setError('Failed to load worker history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getChangeIcon = (changeType: WorkerHistoryEntry['change_type']) => {
    switch (changeType) {
      // Profile events
      case 'WORKER_CREATED':
        return '✨'
      case 'PROFILE_UPDATED':
        return '👤'
      case 'PHOTO_UPLOADED':
        return '📷'
      case 'CONTACT_INFO_UPDATED':
        return '📞'
      case 'RATE_CHANGED':
        return '💰'
      case 'STATUS_CHANGED':
        return '🔄'

      // Job events
      case 'JOB_ASSIGNED':
        return '📋'
      case 'JOB_REASSIGNED':
        return '🔁'
      case 'JOB_UNASSIGNED':
        return '❌'
      case 'JOB_STARTED':
        return '▶️'
      case 'JOB_COMPLETED':
        return '✅'
      case 'JOB_CANCELLED':
        return '🚫'

      // Certificate events
      case 'CERTIFICATE_UPLOADED':
        return '📜'
      case 'CERTIFICATE_RENEWED':
        return '🔄'
      case 'CERTIFICATE_EXPIRING':
        return '⚠️'
      case 'CERTIFICATE_EXPIRED':
        return '❗'
      case 'CERTIFICATE_REMOVED':
        return '🗑️'

      // Availability events
      case 'AVAILABILITY_UPDATED':
        return '📅'
      case 'TIME_OFF_REQUESTED':
        return '🏖️'
      case 'TIME_OFF_APPROVED':
        return '✓'
      case 'TIME_OFF_DECLINED':
        return '✗'

      // Performance events
      case 'RATING_RECEIVED':
        return '⭐'
      case 'MILESTONE_REACHED':
        return '🏆'
      case 'COMPLAINT_FILED':
        return '⚠️'
      case 'COMMENDATION_RECEIVED':
        return '🌟'

      // Other events
      case 'NOTE_ADDED':
        return '📝'
      case 'EMERGENCY_CONTACT_UPDATED':
        return '🚨'

      default:
        return '📝'
    }
  }

  const getChangeColor = (changeType: WorkerHistoryEntry['change_type']) => {
    switch (changeType) {
      // Profile events - blue
      case 'WORKER_CREATED':
        return '#10b981' // green
      case 'PROFILE_UPDATED':
      case 'PHOTO_UPLOADED':
      case 'CONTACT_INFO_UPDATED':
        return '#3b82f6' // blue
      case 'RATE_CHANGED':
        return '#10b981' // green
      case 'STATUS_CHANGED':
        return '#8b5cf6' // purple

      // Job events
      case 'JOB_ASSIGNED':
      case 'JOB_REASSIGNED':
        return '#3b82f6' // blue
      case 'JOB_UNASSIGNED':
      case 'JOB_CANCELLED':
        return '#ef4444' // red
      case 'JOB_STARTED':
        return '#f59e0b' // amber
      case 'JOB_COMPLETED':
        return '#10b981' // green

      // Certificate events
      case 'CERTIFICATE_UPLOADED':
      case 'CERTIFICATE_RENEWED':
        return '#10b981' // green
      case 'CERTIFICATE_EXPIRING':
        return '#f59e0b' // amber
      case 'CERTIFICATE_EXPIRED':
        return '#ef4444' // red
      case 'CERTIFICATE_REMOVED':
        return '#6b7280' // gray

      // Availability events
      case 'AVAILABILITY_UPDATED':
        return '#3b82f6' // blue
      case 'TIME_OFF_REQUESTED':
        return '#f59e0b' // amber
      case 'TIME_OFF_APPROVED':
        return '#10b981' // green
      case 'TIME_OFF_DECLINED':
        return '#ef4444' // red

      // Performance events
      case 'RATING_RECEIVED':
      case 'MILESTONE_REACHED':
      case 'COMMENDATION_RECEIVED':
        return '#10b981' // green
      case 'COMPLAINT_FILED':
        return '#ef4444' // red

      // Other events
      case 'NOTE_ADDED':
        return '#6b7280' // gray
      case 'EMERGENCY_CONTACT_UPDATED':
        return '#f59e0b' // amber

      default:
        return '#6b7280' // gray
    }
  }

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
          Loading history...
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div style={{ padding: '24px', textAlign: 'center', color: '#ef4444' }}>
          {error}
        </div>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
          No history available
        </div>
      </Card>
    )
  }

  const displayedHistory = expanded ? history : history.slice(0, 5)
  const hasMore = history.length > 5

  return (
    <Card>
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Worker History
          </h3>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {history.length} {history.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: '15px',
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: '#e5e7eb',
          }} />

          {/* Timeline entries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {displayedHistory.map((entry, index) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  position: 'relative',
                  paddingLeft: '0',
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    border: `3px solid ${getChangeColor(entry.change_type)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {getChangeIcon(entry.change_type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingTop: '2px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827',
                    marginBottom: '2px',
                  }}>
                    {/* Make job-related events clickable */}
                    {(entry.change_type.includes('JOB') && entry.metadata?.job_id) ? (
                      <a
                        href={
                          entry.metadata?.job_type === 'CLEANING'
                            ? `http://localhost:5173/jobs/${entry.metadata.job_id}`
                            : `http://localhost:5174/maintenance/jobs/${entry.metadata.job_id}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: getChangeColor(entry.change_type),
                          textDecoration: 'none',
                          borderBottom: `1px dashed ${getChangeColor(entry.change_type)}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderBottom = `1px solid ${getChangeColor(entry.change_type)}`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderBottom = `1px dashed ${getChangeColor(entry.change_type)}`
                        }}
                      >
                        {entry.description || entry.change_type.replace(/_/g, ' ').toLowerCase()} →
                      </a>
                    ) : (
                      entry.description || entry.change_type.replace(/_/g, ' ').toLowerCase()
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {formatDate(entry.changed_at)}
                  </div>
                  {(entry.old_value || entry.new_value) && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#4b5563',
                    }}>
                      {entry.old_value && (
                        <div>
                          <span style={{ color: '#6b7280' }}>From:</span> {entry.old_value}
                        </div>
                      )}
                      {entry.new_value && (
                        <div>
                          <span style={{ color: '#6b7280' }}>To:</span> {entry.new_value}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Show metadata for certain events */}
                  {entry.metadata && entry.change_type === 'JOB_COMPLETED' && entry.metadata.duration_hours && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '13px',
                      color: '#6b7280',
                    }}>
                      Duration: {entry.metadata.duration_hours} hours
                    </div>
                  )}
                  {entry.metadata && (entry.change_type === 'RATING_RECEIVED' && entry.metadata.rating) && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '13px',
                      color: '#f59e0b',
                    }}>
                      Rating: {'⭐'.repeat(entry.metadata.rating)} ({entry.metadata.rating}/5)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show more/less button */}
        {hasMore && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#3b82f6',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {expanded ? 'Show less' : `Show ${history.length - 5} more`}
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
