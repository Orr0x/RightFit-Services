import React from 'react'
import './ActivityFeed.css'

/**
 * Activity Feed Component
 * US-UX-4: Dashboard Home Screen Redesign
 */

export interface ActivityItem {
  id: string
  type: 'created' | 'updated' | 'completed' | 'commented' | 'assigned'
  user: {
    name: string
    avatar?: string
  }
  title: string
  description?: string
  timestamp: string
  icon?: React.ReactNode
}

export interface ActivityFeedProps {
  items: ActivityItem[]
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items,
  loading = false,
  onLoadMore,
  hasMore = false,
}) => {
  if (loading) {
    return (
      <div className="activity-feed">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="activity-item">
            <div className="skeleton skeleton-circular skeleton-animate" style={{ width: 40, height: 40 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-animate" style={{ height: 16, width: '80%', marginBottom: 8 }} />
              <div className="skeleton skeleton-animate" style={{ height: 14, width: '60%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="activity-feed">
      {items.map((item) => (
        <div key={item.id} className={`activity-item activity-item-${item.type}`}>
          <div className="activity-avatar">
            {item.user.avatar ? (
              <img src={item.user.avatar} alt={item.user.name} />
            ) : (
              <span className="activity-avatar-initials">
                {item.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="activity-content">
            <div className="activity-title">
              <strong>{item.user.name}</strong> {item.title}
            </div>
            {item.description && <div className="activity-description">{item.description}</div>}
            <div className="activity-timestamp">{item.timestamp}</div>
          </div>

          {item.icon && <div className="activity-icon">{item.icon}</div>}
        </div>
      ))}

      {hasMore && onLoadMore && (
        <button className="activity-load-more" onClick={onLoadMore}>
          Load more
        </button>
      )}
    </div>
  )
}

ActivityFeed.displayName = 'ActivityFeed'
