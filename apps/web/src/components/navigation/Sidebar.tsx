import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

/**
 * Sidebar Navigation
 * US-UX-3: Redesign Navigation
 */

export interface NavItem {
  id: string
  label: string
  path: string
  icon: React.ReactNode
  badge?: string | number
  children?: NavItem[]
}

export interface SidebarProps {
  items: NavItem[]
  collapsed?: boolean
  onToggle?: () => void
  logo?: React.ReactNode
  userMenu?: React.ReactNode
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onToggle,
  logo,
  userMenu,
}) => {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo */}
      {logo && <div className="sidebar-logo">{logo}</div>}

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {items.map((item) => (
            <li key={item.id} className="sidebar-menu-item">
              {item.children ? (
                <>
                  <button
                    className={`sidebar-link sidebar-link-expandable ${
                      expandedItems.includes(item.id) ? 'sidebar-link-expanded' : ''
                    }`}
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="sidebar-link-label">{item.label}</span>
                        <svg
                          className="sidebar-link-chevron"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M6 4L10 8L6 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                  {!collapsed && expandedItems.includes(item.id) && (
                    <ul className="sidebar-submenu">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            to={child.path}
                            className={`sidebar-sublink ${isActive(child.path) ? 'sidebar-sublink-active' : ''}`}
                          >
                            <span className="sidebar-sublink-icon">{child.icon}</span>
                            <span className="sidebar-sublink-label">{child.label}</span>
                            {child.badge && <span className="sidebar-badge">{child.badge}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="sidebar-link-label">{item.label}</span>
                      {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                    </>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Menu */}
      {userMenu && <div className="sidebar-footer">{userMenu}</div>}

      {/* Toggle Button */}
      {onToggle && (
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L10 10L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </aside>
  )
}

Sidebar.displayName = 'Sidebar'
