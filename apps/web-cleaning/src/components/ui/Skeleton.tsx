import React from 'react'
import './Skeleton.css'

/**
 * Skeleton Component
 * US-UX-2: Component Library
 *
 * Skeleton screens for content placeholders during loading
 */

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded'

export interface SkeletonProps {
  /** Variant type */
  variant?: SkeletonVariant
  /** Width (CSS value or number in px) */
  width?: string | number
  /** Height (CSS value or number in px) */
  height?: string | number
  /** Animation enabled */
  animate?: boolean
  /** Additional CSS classes */
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animate = true,
  className,
}) => {
  const style: React.CSSProperties = {}

  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width
  }

  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height
  }

  const skeletonClasses = [
    'skeleton',
    `skeleton-${variant}`,
    animate && 'skeleton-animate',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={skeletonClasses} style={style} aria-hidden="true" />
}

Skeleton.displayName = 'Skeleton'

/**
 * SkeletonText Component
 * Multiple text lines with optional title
 */

export interface SkeletonTextProps {
  /** Number of lines */
  lines?: number
  /** Show title line */
  showTitle?: boolean
  /** Spacing between lines */
  spacing?: 'sm' | 'md' | 'lg'
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  showTitle = false,
  spacing = 'md',
}) => {
  return (
    <div className={`skeleton-text skeleton-text-spacing-${spacing}`}>
      {showTitle && <Skeleton variant="text" width="60%" height={24} />}
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : '100%'}
          height={16}
        />
      ))}
    </div>
  )
}

SkeletonText.displayName = 'SkeletonText'

/**
 * SkeletonCard Component
 * Pre-configured skeleton for card layouts
 */

export interface SkeletonCardProps {
  /** Show avatar/icon */
  showAvatar?: boolean
  /** Show action buttons */
  showActions?: boolean
  /** Number of text lines */
  lines?: number
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = false,
  showActions = false,
  lines = 3,
}) => {
  return (
    <div className="skeleton-card">
      {/* Header */}
      <div className="skeleton-card-header">
        {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
        <div className="skeleton-card-header-text">
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
        {showActions && (
          <div className="skeleton-card-actions">
            <Skeleton variant="circular" width={32} height={32} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="skeleton-card-body">
        <SkeletonText lines={lines} />
      </div>

      {/* Footer */}
      {showActions && (
        <div className="skeleton-card-footer">
          <Skeleton variant="rounded" width={80} height={36} />
          <Skeleton variant="rounded" width={80} height={36} />
        </div>
      )}
    </div>
  )
}

SkeletonCard.displayName = 'SkeletonCard'

/**
 * SkeletonTable Component
 * Skeleton for table layouts
 */

export interface SkeletonTableProps {
  /** Number of rows */
  rows?: number
  /** Number of columns */
  columns?: number
  /** Show header row */
  showHeader?: boolean
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
}) => {
  return (
    <div className="skeleton-table">
      {showHeader && (
        <div className="skeleton-table-header">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" height={20} />
          ))}
        </div>
      )}
      <div className="skeleton-table-body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="skeleton-table-row">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" height={16} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

SkeletonTable.displayName = 'SkeletonTable'
