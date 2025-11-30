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
export declare const Toast: React.FC<ToastProps>;
export declare const ToastContainer: React.FC<ToastContainerProps>;
