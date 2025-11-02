import React from 'react'
import './SearchBar.css'

/**
 * Global Search Bar
 * US-UX-3: Redesign Navigation
 */

export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  category?: string
  path?: string
  icon?: React.ReactNode
}

export interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onSelect?: (result: SearchResult) => void
  results?: SearchResult[]
  loading?: boolean
  shortcut?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  onSelect,
  results = [],
  loading = false,
  shortcut = '⌘K',
}) => {
  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const searchRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Handle keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(0)
    setIsOpen(value.length > 0)
    onSearch?.(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div ref={searchRef} className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
        />

        {loading && (
          <span className="search-loading">
            <svg className="spinner" width="16" height="16" viewBox="0 0 16 16">
              <circle
                cx="8"
                cy="8"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="30 10"
              />
            </svg>
          </span>
        )}

        {!loading && shortcut && <span className="search-shortcut">{shortcut}</span>}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results">
          <ul className="search-results-list">
            {results.map((result, index) => (
              <li key={result.id}>
                <button
                  className={`search-result-item ${index === selectedIndex ? 'search-result-item-selected' : ''}`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {result.icon && <span className="search-result-icon">{result.icon}</span>}
                  <div className="search-result-content">
                    <div className="search-result-title">{result.title}</div>
                    {result.subtitle && (
                      <div className="search-result-subtitle">{result.subtitle}</div>
                    )}
                  </div>
                  {result.category && (
                    <span className="search-result-category">{result.category}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && query.length > 0 && results.length === 0 && !loading && (
        <div className="search-results">
          <div className="search-no-results">No results found</div>
        </div>
      )}
    </div>
  )
}

SearchBar.displayName = 'SearchBar'
