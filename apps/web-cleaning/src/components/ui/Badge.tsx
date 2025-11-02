/**
 * Badge Component
 * Simple badge/tag component for status indicators
 */

import React from 'react'
import './Badge.css'

export type BadgeColor = 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps {
  color?: BadgeColor
  size?: BadgeSize
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  color = 'gray',
  size = 'md',
  children,
  className = '',
}) => {
  const classes = [
    'badge',
    `badge-${color}`,
    `badge-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes}>
      {children}
    </span>
  )
}
