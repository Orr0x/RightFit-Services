/**
 * Card Component
 * Container component for displaying grouped content
 *
 * @packageDocumentation
 */
import React from 'react';
import './Card.css';
/** Card visual variants */
export type CardVariant = 'default' | 'outlined' | 'elevated' | 'ghost';
/** Card padding sizes */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
/**
 * Props for the Card component
 * @public
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Visual variant of the card */
    variant?: CardVariant;
    /** Padding size inside the card */
    padding?: CardPadding;
    /** Makes the card interactive with hover effects */
    hoverable?: boolean;
    /** Optional header content */
    header?: React.ReactNode;
    /** Optional footer content */
    footer?: React.ReactNode;
    /** Main content */
    children: React.ReactNode;
    /** Makes the card take full width */
    fullWidth?: boolean;
}
/**
 * Card component for displaying grouped content
 *
 * @example
 * ```tsx
 * <Card variant="elevated" header="Title">
 *   Card content goes here
 * </Card>
 * ```
 *
 * @public
 */
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
/**
 * Props for the CardHeader component
 * @public
 */
export interface CardHeaderProps {
    /** Title text or element */
    title: React.ReactNode;
    /** Optional subtitle text */
    subtitle?: React.ReactNode;
    /** Optional action buttons or elements */
    actions?: React.ReactNode;
    /** Optional icon element */
    icon?: React.ReactNode;
}
/**
 * Pre-styled header component for cards
 *
 * @example
 * ```tsx
 * <Card header={<CardHeader title="Card Title" subtitle="Subtitle" />}>
 *   Content
 * </Card>
 * ```
 *
 * @public
 */
export declare const CardHeader: React.FC<CardHeaderProps>;
/**
 * Props for the CardSection component
 * @public
 */
export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Section title */
    title?: string;
    /** Section content */
    children: React.ReactNode;
    /** Add divider line above section */
    divider?: boolean;
}
/**
 * Section component for organizing content within cards
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardSection title="Section 1">Content 1</CardSection>
 *   <CardSection title="Section 2" divider>Content 2</CardSection>
 * </Card>
 * ```
 *
 * @public
 */
export declare const CardSection: React.FC<CardSectionProps>;
