/**
 * Spinner Component
 * Loading indicator
 */
import React from 'react';
import './Spinner.css';
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export interface SpinnerProps {
    size?: SpinnerSize;
    label?: string;
    className?: string;
}
export declare const Spinner: React.FC<SpinnerProps>;
