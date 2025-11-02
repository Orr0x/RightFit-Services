import React from 'react'
import './StatsCard.css'

/**
 * Stats Card Component
 * US-UX-4: Dashboard Home Screen Redesign
 */

export interface StatsCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  color?: 'primary' | 'success' | 'warning' | 'error'
  loading?: boolean
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  loading = false,
}) => {
  const isPositiveTrend = trend && trend.value >= 0

  if (loading) {
    return (
      <div className="stats-card">
        <div className="skeleton skeleton-animate" style={{ height: 20, width: '60%', marginBottom: 12 }} />
        <div className="skeleton skeleton-animate" style={{ height: 36, width: '40%' }} />
      </div>
    )
  }

  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-card-header">
        <h3 className="stats-card-title">{title}</h3>
        {icon && <div className="stats-card-icon">{icon}</div>}
      </div>

      <div className="stats-card-value">{value}</div>

      {trend && (
        <div className={`stats-card-trend ${isPositiveTrend ? 'stats-card-trend-up' : 'stats-card-trend-down'}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            {isPositiveTrend ? (
              <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M8 4V12M8 12L12 8M8 12L4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  )
}

StatsCard.displayName = 'StatsCard'
