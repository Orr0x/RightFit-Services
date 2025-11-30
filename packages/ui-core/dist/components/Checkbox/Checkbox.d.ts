import React from 'react';
import './Checkbox.css';
export type CheckboxSize = 'sm' | 'md' | 'lg';
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: CheckboxSize;
    indeterminate?: boolean;
}
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
