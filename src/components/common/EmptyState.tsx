// src/components/common/EmptyState.tsx
import { ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    children?: ReactNode;
}

const EmptyState = ({ title, description, icon = 'info', action, children }: EmptyStateProps) => {
    return (
        <div className="empty-state">
            <span className="material-icons empty-state-icon">{icon}</span>
            <h3 className="empty-state-title">{title}</h3>
            {description && <p className="empty-state-description">{description}</p>}
            {children}
            {action && (
                <Button variant="primary" onClick={action.onClick} icon="add">
                    {action.label}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
