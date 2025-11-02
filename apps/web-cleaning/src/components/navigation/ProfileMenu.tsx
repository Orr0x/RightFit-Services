import React from 'react'
import './ProfileMenu.css'

/**
 * Profile Menu Component
 * US-UX-3: Redesign Navigation
 */

export interface ProfileMenuProps {
  user: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  menuItems: Array<{
    id: string
    label: string
    icon?: React.ReactNode
    onClick: () => void
    danger?: boolean
    divider?: boolean
  }>
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, menuItems }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const handleItemClick = (onClick: () => void) => {
    onClick()
    setIsOpen(false)
  }

  return (
    <div ref={menuRef} className="profile-menu">
      <button
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span className="profile-avatar-initials">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </span>
          )}
        </div>
        <div className="profile-info">
          <div className="profile-name">{user.name}</div>
          {user.role && <div className="profile-role">{user.role}</div>}
        </div>
        <svg
          className="profile-chevron"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-name">{user.name}</div>
            <div className="profile-dropdown-email">{user.email}</div>
          </div>

          <ul className="profile-dropdown-menu">
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                {item.divider && <li className="profile-dropdown-divider" />}
                <li>
                  <button
                    className={`profile-dropdown-item ${item.danger ? 'profile-dropdown-item-danger' : ''}`}
                    onClick={() => handleItemClick(item.onClick)}
                  >
                    {item.icon && <span className="profile-dropdown-icon">{item.icon}</span>}
                    <span className="profile-dropdown-label">{item.label}</span>
                  </button>
                </li>
              </React.Fragment>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

ProfileMenu.displayName = 'ProfileMenu'
