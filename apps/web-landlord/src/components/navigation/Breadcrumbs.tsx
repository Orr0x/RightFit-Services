import React from 'react'
import { Link } from 'react-router-dom'
import './Breadcrumbs.css'

/**
 * Breadcrumbs Component
 * US-UX-3: Redesign Navigation
 */

export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: React.ReactNode
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  maxItems?: number
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator,
  maxItems = 5,
}) => {
  const defaultSeparator = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  // Collapse items if too many
  const displayItems = React.useMemo(() => {
    if (items.length <= maxItems) return items

    const firstItem = items[0]
    const lastItems = items.slice(-(maxItems - 2))
    return [firstItem, { label: '...', path: undefined }, ...lastItems]
  }, [items, maxItems])

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumbs-list">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const isEllipsis = item.label === '...'

          return (
            <li key={index} className="breadcrumbs-item">
              {isEllipsis ? (
                <span className="breadcrumbs-ellipsis">{item.label}</span>
              ) : item.path && !isLast ? (
                <Link to={item.path} className="breadcrumbs-link">
                  {item.icon && <span className="breadcrumbs-icon">{item.icon}</span>}
                  <span className="breadcrumbs-label">{item.label}</span>
                </Link>
              ) : (
                <span className="breadcrumbs-current" aria-current="page">
                  {item.icon && <span className="breadcrumbs-icon">{item.icon}</span>}
                  <span className="breadcrumbs-label">{item.label}</span>
                </span>
              )}

              {!isLast && (
                <span className="breadcrumbs-separator" aria-hidden="true">
                  {separator || defaultSeparator}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

Breadcrumbs.displayName = 'Breadcrumbs'
