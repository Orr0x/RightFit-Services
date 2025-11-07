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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Close mobile menu on navigation
  const handleNavigation = () => {
    setMobileMenuOpen(false)
  }

  // Navigation items - Cleaning Services
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Dashboard">
          <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'jobs',
      label: 'Cleaning Jobs',
      path: '/jobs',
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Cleaning Jobs">
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
      id: 'properties',
      label: 'Properties',
      path: '/properties',
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Properties">
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
      id: 'customers',
      label: 'Customers',
      path: '/customers',
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Customers">
          <path
            d="M17 19v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="10"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'workers',
      label: 'Workers',
      path: '/workers',
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Workers">
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
      id: 'contracts',
      label: 'Contracts',
      path: '/contracts',
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Contracts">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 10h2M9 14h2M7 6h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'invoices',
      label: 'Invoices',
      path: '/invoices',
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Invoices">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8l4-4V4a2 2 0 0 0-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 14v4l4-4h-4zM8 6h4M8 10h4M8 14h2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'quotes',
      label: 'Quotes',
      path: '/quotes',
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Quotes">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 7h6M7 11h6M7 15h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="15"
            cy="15"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      path: '/calendar',
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Calendar">
          <rect
            x="3"
            y="4"
            width="14"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 8h14M7 2v4M13 2v4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'checklist-templates',
      label: 'Checklists',
      path: '/checklist-templates',
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Checklist Templates">
          <path
            d="M9 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 2v5h5M7 10h2M7 14h2M11 10h2M11 14h2"
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
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Financial">
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
      onClick: handleNavigation,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Certificates">
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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Profile">
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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Settings">
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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Logout">
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
          title: 'Dashboard',
          subtitle: 'Overview of cleaning activities',
          category: 'Page',
          path: '/dashboard',
        },
        {
          id: '2',
          title: 'Cleaning Jobs',
          subtitle: 'View and manage cleaning jobs',
          category: 'Page',
          path: '/jobs',
        },
        {
          id: '3',
          title: 'Properties',
          subtitle: 'Customer properties assigned to you',
          category: 'Page',
          path: '/properties',
        },
        {
          id: '4',
          title: 'Customers',
          subtitle: 'Manage customer information and contracts',
          category: 'Page',
          path: '/customers',
        },
        {
          id: '5',
          title: 'Workers',
          subtitle: 'Manage your cleaning team',
          category: 'Page',
          path: '/workers',
        },
        {
          id: '6',
          title: 'Contracts',
          subtitle: 'View and manage cleaning contracts',
          category: 'Page',
          path: '/contracts',
        },
        {
          id: '7',
          title: 'Invoices',
          subtitle: 'Manage customer invoices and payments',
          category: 'Page',
          path: '/invoices',
        },
        {
          id: '8',
          title: 'Quotes',
          subtitle: 'Create and manage customer quotes',
          category: 'Page',
          path: '/quotes',
        },
        {
          id: '9',
          title: 'Calendar',
          subtitle: 'Schedule and view property bookings',
          category: 'Page',
          path: '/calendar',
        },
        {
          id: '10',
          title: 'Checklists',
          subtitle: 'Manage checklist templates for jobs and contracts',
          category: 'Page',
          path: '/checklist-templates',
        },
        {
          id: '11',
          title: 'Financial',
          subtitle: 'Job history and earnings',
          category: 'Page',
          path: '/financial',
        },
        {
          id: '12',
          title: 'Certificates',
          subtitle: 'Certifications and compliance',
          category: 'Page',
          path: '/certificates',
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
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="app-layout-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - desktop persistent, mobile overlay */}
      <div className={`app-sidebar-wrapper ${mobileMenuOpen ? 'app-sidebar-mobile-open' : ''}`}>
        <Sidebar
          items={navItems}
          collapsed={sidebarCollapsed}
          onToggle={() => {
            setSidebarCollapsed(!sidebarCollapsed)
            setMobileMenuOpen(false)
          }}
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
      </div>

      <div className={`app-main ${sidebarCollapsed ? 'app-main-expanded' : ''}`}>
        <header className="app-header">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            className="app-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="app-header-search">
            <SearchBar
              placeholder="Search jobs, properties, workers..."
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
