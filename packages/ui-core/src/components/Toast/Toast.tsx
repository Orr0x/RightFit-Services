import React from 'react';
import './Toast.css';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastProps {
  id?: string;
  variant?: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export interface ToastContainerProps {
  position?: ToastPosition;
  children: React.ReactNode;
}

export const Toast: React.FC<ToastProps> = ({
  variant = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  showCloseButton = true,
  className = '',
}) => {
  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const toastClasses = [
    'rf-toast',
    `rf-toast-${variant}`,
    className,
  ].filter(Boolean).join(' ');

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={toastClasses} role="alert" aria-live="polite">
      <div className="rf-toast-icon">{getIcon()}</div>
      <div className="rf-toast-content">
        {title && <div className="rf-toast-title">{title}</div>}
        <div className="rf-toast-message">{message}</div>
      </div>
      {showCloseButton && onClose && (
        <button
          type="button"
          className="rf-toast-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  children,
}) => {
  return (
    <div className={`rf-toast-container rf-toast-container-${position}`}>
      {children}
    </div>
  );
};

Toast.displayName = 'Toast';
ToastContainer.displayName = 'ToastContainer';
