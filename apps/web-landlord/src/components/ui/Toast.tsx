import React from 'react'
import { createPortal } from 'react-dom'
import './Toast.css'

/**
 * Toast Component
 * US-UX-2: Component Library
 *
 * Toast notifications for temporary user feedback
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface Toast {
  id: string
  type: ToastType
  message: React.ReactNode
  title?: string
  duration?: number
  dismissible?: boolean
}

export interface ToastProps extends Toast {
  onDismiss: (id: string) => void
  position: ToastPosition
}

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  switch (type) {
    case 'success':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M16.6667 5L7.50004 14.1667L3.33337 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'error':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M15 5L5 15M5 5L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'warning':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 6.66667V10M10 13.3333H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'info':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 13.3333V10M10 6.66667H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

export const ToastItem: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  dismissible = true,
  onDismiss,
}) => {
  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite">
      <div className="toast-icon">
        <ToastIcon type={type} />
      </div>

      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>

      {dismissible && (
        <button
          type="button"
          className="toast-close"
          onClick={() => onDismiss(id)}
          aria-label="Dismiss notification"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

/**
 * Toast Container
 * Renders all active toasts in a specific position
 */

interface ToastContainerProps {
  toasts: Toast[]
  position: ToastPosition
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, position, onDismiss }) => {
  if (toasts.length === 0) return null

  const containerContent = (
    <div className={`toast-container toast-container-${position}`}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} position={position} onDismiss={onDismiss} />
      ))}
    </div>
  )

  return createPortal(containerContent, document.body)
}

/**
 * Toast Context and Provider
 */

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  success: (message: React.ReactNode, title?: string, duration?: number) => string
  error: (message: React.ReactNode, title?: string, duration?: number) => string
  warning: (message: React.ReactNode, title?: string, duration?: number) => string
  info: (message: React.ReactNode, title?: string, duration?: number) => string
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export interface ToastProviderProps {
  children: React.ReactNode
  position?: ToastPosition
  defaultDuration?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  defaultDuration = 5000,
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = React.useCallback(
    (toast: Omit<Toast, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const duration = toast.duration ?? defaultDuration

      setToasts((prev) => [...prev, { ...toast, id }])

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }

      return id
    },
    [defaultDuration, removeToast]
  )

  const success = React.useCallback(
    (message: React.ReactNode, title?: string, duration?: number) => {
      return addToast({ type: 'success', message, title, duration })
    },
    [addToast]
  )

  const error = React.useCallback(
    (message: React.ReactNode, title?: string, duration?: number) => {
      return addToast({ type: 'error', message, title, duration })
    },
    [addToast]
  )

  const warning = React.useCallback(
    (message: React.ReactNode, title?: string, duration?: number) => {
      return addToast({ type: 'warning', message, title, duration })
    },
    [addToast]
  )

  const info = React.useCallback(
    (message: React.ReactNode, title?: string, duration?: number) => {
      return addToast({ type: 'info', message, title, duration })
    },
    [addToast]
  )

  const value = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
    }),
    [toasts, addToast, removeToast, success, error, warning, info]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * useToast Hook
 * Access toast functions from any component
 */

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
