/**
 * Keyboard Shortcuts Help Modal
 * US-UX-17: Keyboard Shortcuts
 */

import React from 'react'
import { Modal } from './Modal'
import { KeyboardShortcut, useKeyboardShortcutsHelp } from '../../hooks/useKeyboardShortcuts'
import './KeyboardShortcutsHelp.css'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: KeyboardShortcut[]
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
  shortcuts,
}) => {
  const { formatShortcut } = useKeyboardShortcutsHelp()

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    // Determine category
    let category = 'General'
    if (shortcut.description.includes('Navigate') || shortcut.description.includes('Go to')) {
      category = 'Navigation'
    } else if (shortcut.description.includes('Create') || shortcut.description.includes('new')) {
      category = 'Actions'
    }

    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="keyboard-shortcuts-help">
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <div key={category} className="shortcuts-category">
            <h3 className="shortcuts-category-title">{category}</h3>
            <div className="shortcuts-list">
              {categoryShortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <span className="shortcut-description">{shortcut.description}</span>
                  <kbd className="shortcut-keys">{formatShortcut(shortcut)}</kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp'
