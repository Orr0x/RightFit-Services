import React from 'react';
import { Card, Badge } from '@rightfit/ui-core';
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
export const PropertyCard = React.forwardRef<HTMLDivElement, PropertyCardProps>(
  ({ property, onClick, showOwner = true, className = '' }, ref) => {
    const handleClick = () => {
      if (onClick) {
        onClick(property);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick(property);
      }
    };

    return (
      <Card
        ref={ref}
        className={`rf-property-card ${className}`}
        onClick={onClick ? handleClick : undefined}
        onKeyDown={onClick ? handleKeyDown : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Property at ${property.address}`}
      >
        <div className="rf-property-card__header">
          <h3 className="rf-property-card__address">{property.address}</h3>
          <Badge variant={property.is_active ? 'success' : 'default'}>
            {property.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="rf-property-card__details">
          <div className="rf-property-card__detail">
            <span className="rf-property-card__label">Type:</span>
            <span className="rf-property-card__value">{property.property_type}</span>
          </div>

          {property.bedrooms !== undefined && (
            <div className="rf-property-card__detail">
              <span className="rf-property-card__label">Bedrooms:</span>
              <span className="rf-property-card__value">{property.bedrooms}</span>
            </div>
          )}

          {property.bathrooms !== undefined && (
            <div className="rf-property-card__detail">
              <span className="rf-property-card__label">Bathrooms:</span>
              <span className="rf-property-card__value">{property.bathrooms}</span>
            </div>
          )}

          {showOwner && property.landlord && (
            <div className="rf-property-card__detail">
              <span className="rf-property-card__label">Owner:</span>
              <span className="rf-property-card__value">
                {property.landlord.first_name} {property.landlord.last_name}
              </span>
            </div>
          )}
        </div>

        {property.special_instructions && (
          <div className="rf-property-card__instructions">
            <span className="rf-property-card__label">Instructions:</span>
            <p className="rf-property-card__instructions-text">
              {property.special_instructions}
            </p>
          </div>
        )}
      </Card>
    );
  }
);

PropertyCard.displayName = 'PropertyCard';
