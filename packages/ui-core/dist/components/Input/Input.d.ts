/**
 * Input Component
 * Form input with validation and accessibility features
 *
 * @packageDocumentation
 */
import React from 'react';
import './Input.css';
/** Input size variants */
export type InputSize = 'sm' | 'md' | 'lg';
/** Input visual variants */
export type InputVariant = 'default' | 'filled' | 'flushed';
/**
 * Props for the Input component
 * @public
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Input label text */
    label?: string;
    /** Error message to display */
    error?: string;
    /** Helper text below input */
    helperText?: string;
    /** Size variant */
    size?: InputSize;
    /** Visual variant */
    variant?: InputVariant;
    /** Icon to display on the left */
    leftIcon?: React.ReactNode;
    /** Icon to display on the right */
    rightIcon?: React.ReactNode;
    /** Full width */
    fullWidth?: boolean;
    /** Optional suffix text (e.g., "USD", "%") */
    suffix?: string;
    /** Optional prefix text (e.g., "$", "#") */
    prefix?: string;
    /** Show required asterisk */
    showRequired?: boolean;
}
/**
 * Input component for form fields
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter email"
 *   required
 * />
 * ```
 *
 * @public
 */
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
