import React from 'react';
import './Modal.css';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    footer?: React.ReactNode;
    size?: ModalSize;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    children: React.ReactNode;
    className?: string;
}
export declare const Modal: React.FC<ModalProps>;
