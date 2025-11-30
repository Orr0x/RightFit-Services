import React from 'react';
import type { Property } from '../../types/property';
import './PropertyCard.css';
export interface PropertyCardProps {
    /** Property data */
    property: Property;
    /** Click handler */
    onClick?: (property: Property) => void;
    /** Show owner information */
    showOwner?: boolean;
    /** Custom class name */
    className?: string;
}
/**
 * PropertyCard displays property information including address, type, and status.
 * Uses the core Card component with cleaning-specific styling.
 */
export declare const PropertyCard: React.ForwardRefExoticComponent<PropertyCardProps & React.RefAttributes<HTMLDivElement>>;
