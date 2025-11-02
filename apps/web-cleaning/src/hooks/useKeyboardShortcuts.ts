/**
 * Keyboard Shortcuts Hook
 * US-UX-17: Keyboard Shortcuts (5 pts)
 *
 * Power user keyboard navigation
 */

import { useEffect, useCallback } from 'react'

export type KeyboardShortcut = {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcut(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey
        const metaMatch = shortcut.meta === undefined || shortcut.meta === event.metaKey
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()

        if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault()
          shortcut.callback()
          break
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Common keyboard shortcuts for the app
 */
export const createCommonShortcuts = (actions: {
  onSearch?: () => void
  onNewProperty?: () => void
  onNewWorkOrder?: () => void
  onSettings?: () => void
  onHelp?: () => void
  onSave?: () => void
  onCancel?: () => void
  onRefresh?: () => void
  onNavigateHome?: () => void
  onNavigateProperties?: () => void
  onNavigateWorkOrders?: () => void
  onNavigateContractors?: () => void
  onLogout?: () => void
}): KeyboardShortcut[] => {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

  return [
    // Search
    {
      key: 'k',
      [isMac ? 'meta' : 'ctrl']: true,
      callback: actions.onSearch || (() => {}),
      description: 'Open search',
    },
    // New Property
    {
      key: 'p',
      [isMac ? 'meta' : 'ctrl']: true,
      shift: true,
      callback: actions.onNewProperty || (() => {}),
      description: 'Create new property',
    },
    // New Work Order
    {
      key: 'w',
      [isMac ? 'meta' : 'ctrl']: true,
      shift: true,
      callback: actions.onNewWorkOrder || (() => {}),
      description: 'Create new work order',
    },
    // Settings
    {
      key: ',',
      [isMac ? 'meta' : 'ctrl']: true,
      callback: actions.onSettings || (() => {}),
      description: 'Open settings',
    },
    // Help
    {
      key: '?',
      shift: true,
      callback: actions.onHelp || (() => {}),
      description: 'Show help',
    },
    // Save
    {
      key: 's',
      [isMac ? 'meta' : 'ctrl']: true,
      callback: actions.onSave || (() => {}),
      description: 'Save',
    },
    // Cancel
    {
      key: 'Escape',
      callback: actions.onCancel || (() => {}),
      description: 'Cancel/Close',
    },
    // Refresh
    {
      key: 'r',
      [isMac ? 'meta' : 'ctrl']: true,
      callback: actions.onRefresh || (() => {}),
      description: 'Refresh',
    },
    // Navigation
    {
      key: 'h',
      alt: true,
      callback: actions.onNavigateHome || (() => {}),
      description: 'Go to Home',
    },
    {
      key: 'p',
      alt: true,
      callback: actions.onNavigateProperties || (() => {}),
      description: 'Go to Properties',
    },
    {
      key: 'w',
      alt: true,
      callback: actions.onNavigateWorkOrders || (() => {}),
      description: 'Go to Work Orders',
    },
    {
      key: 'c',
      alt: true,
      callback: actions.onNavigateContractors || (() => {}),
      description: 'Go to Contractors',
    },
    // Logout
    {
      key: 'l',
      [isMac ? 'meta' : 'ctrl']: true,
      shift: true,
      callback: actions.onLogout || (() => {}),
      description: 'Logout',
    },
  ].filter((shortcut) => shortcut.callback !== (() => {}))
}

/**
 * Hook for displaying keyboard shortcuts help
 */
export function useKeyboardShortcutsHelp() {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const keys: string[] = []

    if (shortcut.ctrl) keys.push('Ctrl')
    if (shortcut.meta) keys.push(isMac ? '⌘' : 'Win')
    if (shortcut.shift) keys.push('⇧')
    if (shortcut.alt) keys.push(isMac ? '⌥' : 'Alt')

    keys.push(shortcut.key.toUpperCase())

    return keys.join(' + ')
  }

  return { formatShortcut, isMac }
}
