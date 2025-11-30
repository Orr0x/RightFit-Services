/**
 * Button Component
 * Core UI component for user actions
 *
 * @packageDocumentation
 */
import React from 'react';
import './Button.css';
/** Button visual variants */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
/** Button size variants */
export type ButtonSize = 'sm' | 'md' | 'lg';
/**
 * Props for the Button component
 * @public
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant of the button */
    variant?: ButtonVariant;
    /** Size of the button */
    size?: ButtonSize;
    /** Makes the button take full width of its container */
    fullWidth?: boolean;
    /** Shows loading spinner and disables interaction */
    loading?: boolean;
    /** Icon to display on the left side */
    leftIcon?: React.ReactNode;
    /** Icon to display on the right side */
    rightIcon?: React.ReactNode;
    /** Button label content */
    children: React.ReactNode;
}
/**
 * Button component for user interactions
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * ```
 *
 * @example
 * ```tsx
 * <Button variant="danger" loading>
 *   Deleting...
 * </Button>
 * ```
 *
 * @public
 */
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
