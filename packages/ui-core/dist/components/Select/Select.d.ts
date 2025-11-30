import React from 'react';
import './Select.css';
export type SelectSize = 'sm' | 'md' | 'lg';
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: SelectSize;
    fullWidth?: boolean;
    options?: SelectOption[];
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
