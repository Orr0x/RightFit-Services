import React from 'react';
import type { Issue } from '../../types/issue';
import './IssueCard.css';
export interface IssueCardProps {
    issue: Issue;
    onClick?: (issue: Issue) => void;
    showPhotos?: boolean;
    className?: string;
}
export declare const IssueCard: React.ForwardRefExoticComponent<IssueCardProps & React.RefAttributes<HTMLDivElement>>;
