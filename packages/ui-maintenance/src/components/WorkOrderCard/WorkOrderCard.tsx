import React from 'react';
import { Card, Badge } from '@rightfit/ui-core';
import type { WorkOrder } from '../../types/work-order';
import { formatWorkOrderStatus, getWorkOrderStatusVariant } from '../../utils/status-helpers';
import './WorkOrderCard.css';

export interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onClick?: (workOrder: WorkOrder) => void;
  className?: string;
}

export const WorkOrderCard = React.forwardRef<HTMLDivElement, WorkOrderCardProps>(
  ({ workOrder, onClick, className = '' }, ref) => {
    const statusVariant = getWorkOrderStatusVariant(workOrder.status);

    return (
      <Card
        ref={ref}
        className={`rf-work-order-card ${className}`}
        onClick={onClick ? () => onClick(workOrder) : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="rf-work-order-card__header">
          <div>
            <h3 className="rf-work-order-card__title">{workOrder.title}</h3>
            <p className="rf-work-order-card__number">#{workOrder.order_number}</p>
          </div>
          <Badge variant={statusVariant}>{formatWorkOrderStatus(workOrder.status)}</Badge>
        </div>

        <p className="rf-work-order-card__property">{workOrder.property.address}</p>

        <div className="rf-work-order-card__details">
          {workOrder.assigned_technician && (
            <div className="rf-work-order-card__detail">
              <span className="rf-work-order-card__label">Technician:</span>
              <span className="rf-work-order-card__value">
                {workOrder.assigned_technician.first_name} {workOrder.assigned_technician.last_name}
              </span>
            </div>
          )}
          {workOrder.due_date && (
            <div className="rf-work-order-card__detail">
              <span className="rf-work-order-card__label">Due:</span>
              <span className="rf-work-order-card__value">
                {new Date(workOrder.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {workOrder.total_cost !== undefined && (
            <div className="rf-work-order-card__detail">
              <span className="rf-work-order-card__label">Total Cost:</span>
              <span className="rf-work-order-card__value">${workOrder.total_cost.toFixed(2)}</span>
            </div>
          )}
        </div>
      </Card>
    );
  }
);

WorkOrderCard.displayName = 'WorkOrderCard';
