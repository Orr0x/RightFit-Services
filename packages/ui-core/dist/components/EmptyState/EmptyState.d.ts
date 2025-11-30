import React from 'react';
import './EmptyState.css';
export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}
export declare const EmptyState: React.FC<EmptyStateProps>;
