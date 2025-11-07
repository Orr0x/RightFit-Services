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
  tabs?: Tab[]
  defaultTab?: string
  activeTab?: string
  onChange?: (tabId: string) => void
  className?: string
  children?: React.ReactNode
}

export const Tabs: React.FC<TabsProps> = ({
  tabs: propTabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  className = '',
  children,
}) => {
  // Extract tabs from children if not provided as prop
  const tabs = React.useMemo(() => {
    if (propTabs) return propTabs

    // Extract tab information from TabPanel children
    const childrenArray = React.Children.toArray(children)
    return childrenArray
      .filter((child): child is React.ReactElement<TabPanelProps> =>
        React.isValidElement(child) && (child.type === TabPanel || (child.type as any)?.name === 'TabPanel')
      )
      .map((child) => ({
        id: child.props.tabId,
        label: child.props.label || child.props.tabId,
        disabled: child.props.disabled,
      }))
  }, [propTabs, children])

  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id || '')

  // Use controlled activeTab if provided, otherwise use internal state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const handleTabChange = (tabId: string) => {
    if (tabs.find(t => t.id === tabId)?.disabled) return
    setInternalActiveTab(tabId)
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
      {children}
    </div>
  )
}

export interface TabPanelProps {
  tabId: string
  label?: string
  activeTab: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
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
