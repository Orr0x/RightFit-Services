import { useState, useEffect } from 'react'
import { customerPropertiesAPI, type PropertyHistoryEntry } from '../lib/api'
import { Card } from '@rightfit/ui-core'

interface PropertyHistoryTimelineProps {
  propertyId: string
}

export function PropertyHistoryTimeline({ propertyId }: PropertyHistoryTimelineProps) {
  const [history, setHistory] = useState<PropertyHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [propertyId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await customerPropertiesAPI.getHistory(propertyId, 50)
      setHistory(data)
    } catch (err: any) {
      console.error('Error loading property history:', err)
      setError('Failed to load property history')
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

  const getChangeIcon = (changeType: PropertyHistoryEntry['change_type']) => {
    switch (changeType) {
      // Property events
      case 'PROPERTY_CREATED':
        return '🏠'
      case 'PROPERTY_UPDATED':
      case 'ACCESS_INSTRUCTIONS_UPDATED':
        return '✏️'
      case 'STATUS_CHANGED':
        return '🔄'

      // Cleaning events
      case 'CLEANING_JOB_SCHEDULED':
        return '🗓️'
      case 'CLEANING_JOB_STARTED':
        return '🧹'
      case 'CLEANING_JOB_COMPLETED':
        return '✅'
      case 'CLEANING_JOB_CANCELLED':
        return '❌'

      // Maintenance events
      case 'MAINTENANCE_JOB_CREATED':
      case 'MAINTENANCE_JOB_SCHEDULED':
        return '🔧'
      case 'MAINTENANCE_JOB_COMPLETED':
        return '✅'
      case 'MAINTENANCE_JOB_CANCELLED':
        return '❌'

      // Contract events
      case 'CONTRACT_CREATED':
        return '📄'
      case 'CONTRACT_RENEWED':
        return '🔄'
      case 'CONTRACT_UPDATED':
        return '✏️'
      case 'CONTRACT_CANCELLED':
        return '❌'

      // Certificate events
      case 'CERTIFICATE_UPLOADED':
      case 'CERTIFICATE_RENEWED':
        return '📜'
      case 'CERTIFICATE_EXPIRING_SOON':
        return '⚠️'
      case 'CERTIFICATE_EXPIRED':
        return '❌'

      // Other events
      case 'PHOTO_UPLOADED':
        return '📷'
      case 'TENANT_MOVED_IN':
        return '🏡'
      case 'TENANT_MOVED_OUT':
        return '📦'
      case 'WORK_ORDER_CREATED':
        return '🛠️'
      case 'WORK_ORDER_COMPLETED':
        return '✅'

      default:
        return '📝'
    }
  }

  const getChangeColor = (changeType: PropertyHistoryEntry['change_type']) => {
    switch (changeType) {
      // Property events
      case 'PROPERTY_CREATED':
        return '#10b981' // green
      case 'PROPERTY_UPDATED':
      case 'ACCESS_INSTRUCTIONS_UPDATED':
        return '#6b7280' // gray
      case 'STATUS_CHANGED':
        return '#8b5cf6' // purple

      // Cleaning events
      case 'CLEANING_JOB_SCHEDULED':
        return '#3b82f6' // blue
      case 'CLEANING_JOB_STARTED':
        return '#06b6d4' // cyan
      case 'CLEANING_JOB_COMPLETED':
        return '#10b981' // green
      case 'CLEANING_JOB_CANCELLED':
        return '#ef4444' // red

      // Maintenance events
      case 'MAINTENANCE_JOB_CREATED':
      case 'MAINTENANCE_JOB_SCHEDULED':
        return '#f97316' // orange
      case 'MAINTENANCE_JOB_COMPLETED':
        return '#10b981' // green
      case 'MAINTENANCE_JOB_CANCELLED':
        return '#ef4444' // red

      // Contract events
      case 'CONTRACT_CREATED':
      case 'CONTRACT_RENEWED':
        return '#8b5cf6' // purple
      case 'CONTRACT_UPDATED':
        return '#6b7280' // gray
      case 'CONTRACT_CANCELLED':
        return '#ef4444' // red

      // Certificate events
      case 'CERTIFICATE_UPLOADED':
      case 'CERTIFICATE_RENEWED':
        return '#3b82f6' // blue
      case 'CERTIFICATE_EXPIRING_SOON':
        return '#f59e0b' // amber/yellow
      case 'CERTIFICATE_EXPIRED':
        return '#ef4444' // red

      // Other events
      case 'PHOTO_UPLOADED':
        return '#06b6d4' // cyan
      case 'TENANT_MOVED_IN':
        return '#10b981' // green
      case 'TENANT_MOVED_OUT':
        return '#6b7280' // gray
      case 'WORK_ORDER_CREATED':
        return '#f97316' // orange
      case 'WORK_ORDER_COMPLETED':
        return '#10b981' // green

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

  const displayedHistory = expanded ? history : history.slice(0, 10)
  const hasMore = history.length > 10

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
            Activity Timeline
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
            {displayedHistory.map((entry) => {
              const isClickable =
                (entry.change_type.startsWith('CLEANING_JOB_') && entry.metadata?.cleaning_job_id) ||
                (entry.change_type.startsWith('MAINTENANCE_JOB_') && entry.metadata?.maintenance_job_id)

              return (
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
                      {isClickable ? (
                        <a
                          href={
                            entry.change_type.startsWith('CLEANING_JOB_')
                              ? `/cleaning/jobs/${entry.metadata?.cleaning_job_id}`
                              : `/maintenance/jobs/${entry.metadata?.maintenance_job_id}`
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
                  </div>
                </div>
              )
            })}
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
              {expanded ? 'Show less' : `Show ${history.length - 10} more`}
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
