import React from 'react';
import './Badge.css';
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';
export interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}
export declare const Badge: React.FC<BadgeProps>;
