/**
 * Tabs Component
 * US-UX-2: Component Library
 *
 * Reusable tabs component for switching between different views
 */

import React, { useState } from 'react'
import './Tabs.css'

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    if (tabs.find(t => t.id === tabId)?.disabled) return
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  return (
    <div className={`tabs ${className}`}>
      <div className="tabs-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-disabled={tab.disabled}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''} ${
              tab.disabled ? 'tab-disabled' : ''
            }`}
            onClick={() => handleTabChange(tab.id)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export interface TabPanelProps {
  tabId: string
  activeTab: string
  children: React.ReactNode
  className?: string
}

export const TabPanel: React.FC<TabPanelProps> = ({
  tabId,
  activeTab,
  children,
  className = '',
}) => {
  if (tabId !== activeTab) return null

  return (
    <div
      role="tabpanel"
      className={`tab-panel ${className}`}
      aria-labelledby={tabId}
    >
      {children}
    </div>
  )
}
