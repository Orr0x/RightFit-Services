import { useState, useEffect } from 'react'
import { globalActivityAPI, type GlobalActivityEntry } from '../lib/api'
import { Card } from '@rightfit/ui-core'

interface GlobalActivityTimelineProps {
  limit?: number
}

export function GlobalActivityTimeline({ limit = 50 }: GlobalActivityTimelineProps) {
  const [activity, setActivity] = useState<GlobalActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'PROPERTY' | 'JOB' | 'WORKER'>('ALL')

  useEffect(() => {
    loadActivity()
  }, [filter, limit])

  const loadActivity = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await globalActivityAPI.list({
        limit,
        activity_type: filter === 'ALL' ? undefined : filter,
      })
      setActivity(data)
    } catch (err: any) {
      console.error('Error loading global activity:', err)
      setError('Failed to load activity feed')
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
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActivityIcon = (entry: GlobalActivityEntry) => {
    if (entry.activity_type === 'PROPERTY') {
      switch (entry.event_type) {
        case 'PROPERTY_CREATED': return '🏠'
        case 'PROPERTY_UPDATED': return '✏️'
        case 'CLEANING_JOB_SCHEDULED': return '📅'
        case 'CLEANING_JOB_STARTED': return '🧹'
        case 'CLEANING_JOB_COMPLETED': return '✅'
        case 'MAINTENANCE_JOB_CREATED': return '🔧'
        case 'MAINTENANCE_JOB_COMPLETED': return '✔️'
        default: return '🏠'
      }
    } else if (entry.activity_type === 'JOB') {
      switch (entry.event_type) {
        case 'CREATED': return '✨'
        case 'WORKER_ASSIGNED': return '👤'
        case 'WORKER_CHANGED': return '🔁'
        case 'STATUS_CHANGED': return '🔄'
        case 'STARTED': return '▶️'
        case 'COMPLETED': return '✅'
        case 'PHOTO_ADDED': return '📷'
        case 'MAINTENANCE_ISSUE_CREATED': return '🔧'
        default: return '📋'
      }
    } else { // WORKER
      switch (entry.event_type) {
        case 'WORKER_CREATED': return '✨'
        case 'JOB_ASSIGNED': return '📋'
        case 'JOB_STARTED': return '▶️'
        case 'JOB_COMPLETED': return '✅'
        case 'CERTIFICATE_UPLOADED': return '📜'
        case 'RATING_RECEIVED': return '⭐'
        case 'MILESTONE_REACHED': return '🏆'
        default: return '👤'
      }
    }
  }

  const getActivityColor = (entry: GlobalActivityEntry) => {
    if (entry.activity_type === 'PROPERTY') {
      return '#8b5cf6' // purple
    } else if (entry.activity_type === 'JOB') {
      switch (entry.event_type) {
        case 'CREATED': return '#10b981' // green
        case 'COMPLETED': return '#10b981'
        case 'STARTED': return '#f59e0b' // amber
        case 'MAINTENANCE_ISSUE_CREATED': return '#f97316' // orange
        default: return '#3b82f6' // blue
      }
    } else { // WORKER
      switch (entry.event_type) {
        case 'JOB_COMPLETED': return '#10b981'
        case 'JOB_STARTED': return '#f59e0b'
        case 'MILESTONE_REACHED': return '#10b981'
        default: return '#3b82f6'
      }
    }
  }

  const getActivityBadgeColor = (type: GlobalActivityEntry['activity_type']) => {
    switch (type) {
      case 'PROPERTY': return '#8b5cf6'
      case 'JOB': return '#3b82f6'
      case 'WORKER': return '#10b981'
    }
  }

  const getActivityLink = (entry: GlobalActivityEntry) => {
    if (entry.job_id) {
      return `http://localhost:5173/jobs/${entry.job_id}`
    } else if (entry.property_id) {
      return `http://localhost:5173/properties/${entry.property_id}`
    } else if (entry.worker_id) {
      return `http://localhost:5173/workers/${entry.worker_id}`
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
          Loading activity...
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

  if (activity.length === 0) {
    return (
      <Card>
        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
          No recent activity
        </div>
      </Card>
    )
  }

  const displayedActivity = expanded ? activity : activity.slice(0, 10)
  const hasMore = activity.length > 10

  return (
    <Card>
      <div style={{ padding: '24px' }}>
        {/* Header with filters */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Recent Activity
          </h3>

          {/* Filter buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['ALL', 'PROPERTY', 'JOB', 'WORKER'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: '500',
                  backgroundColor: filter === f ? '#3b82f6' : 'transparent',
                  color: filter === f ? '#fff' : '#6b7280',
                  border: '1px solid',
                  borderColor: filter === f ? '#3b82f6' : '#e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (filter !== f) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== f) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {f}
              </button>
            ))}
          </div>
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
            {displayedActivity.map((entry) => {
              const link = getActivityLink(entry)
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
                      border: `3px solid ${getActivityColor(entry)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {getActivityIcon(entry)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {/* Activity type badge */}
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#fff',
                        backgroundColor: getActivityBadgeColor(entry.activity_type),
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}>
                        {entry.activity_type}
                      </span>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#111827',
                      marginBottom: '4px',
                    }}>
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: getActivityColor(entry),
                            textDecoration: 'none',
                            borderBottom: `1px dashed ${getActivityColor(entry)}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderBottom = `1px solid ${getActivityColor(entry)}`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderBottom = `1px dashed ${getActivityColor(entry)}`
                          }}
                        >
                          {entry.description} →
                        </a>
                      ) : (
                        entry.description
                      )}
                    </div>

                    {/* Entity info */}
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                      {entry.property_name && (
                        <span>🏠 {entry.property_name}</span>
                      )}
                      {entry.worker_name && (
                        <span>👤 {entry.worker_name}</span>
                      )}
                    </div>
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
              {expanded ? 'Show less' : `Show ${activity.length - 10} more`}
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
