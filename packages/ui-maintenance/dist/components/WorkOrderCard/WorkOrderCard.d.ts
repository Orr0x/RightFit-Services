import React from 'react';
import type { WorkOrder } from '../../types/work-order';
import './WorkOrderCard.css';
export interface WorkOrderCardProps {
    workOrder: WorkOrder;
    onClick?: (workOrder: WorkOrder) => void;
    className?: string;
}
export declare const WorkOrderCard: React.ForwardRefExoticComponent<WorkOrderCardProps & React.RefAttributes<HTMLDivElement>>;
