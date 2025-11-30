import React from 'react';
import './Radio.css';
export type RadioSize = 'sm' | 'md' | 'lg';
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: RadioSize;
}
export declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
