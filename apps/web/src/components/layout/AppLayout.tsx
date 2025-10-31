import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, SearchBar, ProfileMenu, type NavItem, type SearchResult } from '../navigation'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import './AppLayout.css'

/**
 * Main Application Layout
 * Includes Sidebar, SearchBar, ProfileMenu, and main content area
 */

export interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Navigation items
  const navItems: NavItem[] = [
    {
      id: 'properties',
      label: 'Properties',
      path: '/properties',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 9l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'work-orders',
      label: 'Work Orders',
      path: '/work-orders',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M14.5 2h-9A1.5 1.5 0 0 0 4 3.5v13A1.5 1.5 0 0 0 5.5 18h9a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 14.5 2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 6h6M7 10h6M7 14h3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'tenants',
      label: 'Tenants',
      path: '/tenants',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 16c-4 0-6 2-6 2v1h12v-1s-2-2-6-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'contractors',
      label: 'Contractors',
      path: '/contractors',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M16 2L8 10M16 2l-4 12-2-6-6-2 12-4zM8 10L2 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'financial',
      label: 'Financial',
      path: '/financial',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2v16M6 6h8M6 14h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="10"
            cy="10"
            r="7"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: 'certificates',
      label: 'Certificates',
      path: '/certificates',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 6h4M8 10h4M8 14h2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ]

  // Profile menu items
  const profileMenuItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 10c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => {
        // Navigate to profile page when implemented
        console.log('Profile clicked')
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.4 10a1.4 1.4 0 0 0 .3 1.5l.05.05a1.7 1.7 0 0 1 0 2.4 1.7 1.7 0 0 1-2.4 0l-.05-.05a1.4 1.4 0 0 0-1.5-.3 1.4 1.4 0 0 0-.8 1.3V15a1.7 1.7 0 1 1-3.4 0v-.1a1.4 1.4 0 0 0-.9-1.3 1.4 1.4 0 0 0-1.5.3l-.05.05a1.7 1.7 0 1 1-2.4-2.4l.05-.05a1.4 1.4 0 0 0 .3-1.5 1.4 1.4 0 0 0-1.3-.8H1a1.7 1.7 0 1 1 0-3.4h.1a1.4 1.4 0 0 0 1.3-.9 1.4 1.4 0 0 0-.3-1.5l-.05-.05a1.7 1.7 0 0 1 2.4-2.4l.05.05a1.4 1.4 0 0 0 1.5.3h.1a1.4 1.4 0 0 0 .8-1.3V1a1.7 1.7 0 1 1 3.4 0v.1a1.4 1.4 0 0 0 .8 1.3 1.4 1.4 0 0 0 1.5-.3l.05-.05a1.7 1.7 0 1 1 2.4 2.4l-.05.05a1.4 1.4 0 0 0-.3 1.5v.1a1.4 1.4 0 0 0 1.3.8H15a1.7 1.7 0 1 1 0 3.4h-.1a1.4 1.4 0 0 0-1.3.9z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => {
        console.log('Settings clicked')
      },
      divider: true,
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => {
        logout()
        navigate('/login')
      },
      danger: true,
    },
  ]

  // Handle search
  const handleSearch = (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)

    // Simulate search - in a real app, this would be an API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Properties',
          subtitle: 'View and manage all properties',
          category: 'Page',
          path: '/properties',
        },
        {
          id: '2',
          title: 'Work Orders',
          subtitle: 'Track and manage work orders',
          category: 'Page',
          path: '/work-orders',
        },
        {
          id: '3',
          title: 'Tenants',
          subtitle: 'Manage tenant information',
          category: 'Page',
          path: '/tenants',
        },
      ].filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.subtitle?.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults(mockResults)
      setSearchLoading(false)
    }, 300)
  }

  const handleSearchSelect = (result: SearchResult) => {
    if (result.path) {
      navigate(result.path)
    }
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="app-layout">
      <Sidebar
        items={navItems}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        logo={
          <div className="app-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
              <path
                d="M8 12L16 8L24 12V20L16 24L8 20V12Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
              </defs>
            </svg>
            {!sidebarCollapsed && <span className="app-logo-text">RightFit</span>}
          </div>
        }
      />

      <div className={`app-main ${sidebarCollapsed ? 'app-main-expanded' : ''}`}>
        <header className="app-header">
          <div className="app-header-search">
            <SearchBar
              placeholder="Search properties, work orders, tenants..."
              onSearch={handleSearch}
              onSelect={handleSearchSelect}
              results={searchResults}
              loading={searchLoading}
              shortcut=""
            />
          </div>

          <div className="app-header-actions">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Menu */}
            <ProfileMenu
              user={{
                name: user.email.split('@')[0],
                email: user.email,
                role: user.role,
              }}
              menuItems={profileMenuItems}
            />
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}

AppLayout.displayName = 'AppLayout'
