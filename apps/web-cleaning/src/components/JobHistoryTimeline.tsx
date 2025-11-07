import { useState, useEffect } from 'react'
import { cleaningJobsAPI, type JobHistoryEntry } from '../lib/api'
import { Card } from './ui'
import { useRequiredServiceProvider } from '../hooks/useServiceProvider'

interface JobHistoryTimelineProps {
  jobId: string
}

export function JobHistoryTimeline({ jobId }: JobHistoryTimelineProps) {
  const SERVICE_PROVIDER_ID = useRequiredServiceProvider()
  const [history, setHistory] = useState<JobHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [jobId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await cleaningJobsAPI.getHistory(jobId, SERVICE_PROVIDER_ID)
      setHistory(data)
    } catch (err: any) {
      console.error('Error loading job history:', err)
      setError('Failed to load job history')
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

  const getChangeIcon = (changeType: JobHistoryEntry['change_type']) => {
    switch (changeType) {
      case 'CREATED':
        return '✨'
      case 'WORKER_ASSIGNED':
      case 'WORKER_CHANGED':
        return '👤'
      case 'WORKER_UNASSIGNED':
        return '👤❌'
      case 'STATUS_CHANGED':
        return '🔄'
      case 'TIME_CHANGED':
        return '⏰'
      case 'DATE_CHANGED':
        return '📅'
      case 'PHOTO_ADDED':
        return '📷'
      case 'NOTES_UPDATED':
        return '📝'
      case 'PRICE_CHANGED':
        return '💰'
      case 'CHECKLIST_UPDATED':
        return '✅'
      case 'MAINTENANCE_ISSUE_CREATED':
        return '🔧'
      case 'DELETED':
        return '🗑️'
      default:
        return '📝'
    }
  }

  const getChangeColor = (changeType: JobHistoryEntry['change_type']) => {
    switch (changeType) {
      case 'CREATED':
        return '#10b981' // green
      case 'WORKER_ASSIGNED':
      case 'WORKER_CHANGED':
        return '#3b82f6' // blue
      case 'WORKER_UNASSIGNED':
        return '#ef4444' // red
      case 'STATUS_CHANGED':
        return '#8b5cf6' // purple
      case 'TIME_CHANGED':
      case 'DATE_CHANGED':
        return '#f59e0b' // amber
      case 'PHOTO_ADDED':
        return '#06b6d4' // cyan
      case 'PRICE_CHANGED':
        return '#10b981' // green
      case 'MAINTENANCE_ISSUE_CREATED':
        return '#f97316' // orange
      case 'DELETED':
        return '#ef4444' // red
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
            Change History
          </h3>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {history.length} {history.length === 1 ? 'change' : 'changes'}
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
                    {entry.change_type === 'MAINTENANCE_ISSUE_CREATED' && entry.metadata?.maintenance_job_id ? (
                      <a
                        href={`http://localhost:5174/maintenance/jobs/${entry.metadata.maintenance_job_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#f97316',
                          textDecoration: 'none',
                          borderBottom: '1px dashed #f97316',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderBottom = '1px solid #f97316'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderBottom = '1px dashed #f97316'
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
