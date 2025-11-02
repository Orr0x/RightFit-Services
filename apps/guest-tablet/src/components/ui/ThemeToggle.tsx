import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import './ThemeToggle.css'

/**
 * Theme Toggle Button
 * STORY-005: Dark Mode Support
 */

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Currently ${theme} mode. Click to toggle.`}
    >
      {theme === 'light' ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 3v1m0 12v1m7-7h-1M4 10H3m13.66-3.66l-.71.71M5.05 14.95l-.71.71m11.32 0l-.71-.71M5.05 5.05l-.71-.71M13 10a3 3 0 11-6 0 3 3 0 016 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M17 11.5A6.5 6.5 0 1 1 8.5 3c.164 0 .327.007.488.02A5.5 5.5 0 0 0 14.5 14c1.414 0 2.714-.534 3.693-1.412.046-.327.07-.662.07-1.003L17 11.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

export default ThemeToggle
