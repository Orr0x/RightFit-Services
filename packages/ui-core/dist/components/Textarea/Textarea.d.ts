import React from 'react';
import './Textarea.css';
export type TextareaSize = 'sm' | 'md' | 'lg';
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: TextareaSize;
    fullWidth?: boolean;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
