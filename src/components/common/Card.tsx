// src/components/common/Card.tsx
import { ReactNode } from 'react';

interface CardProps {
    title?: string;
    children: ReactNode;
    className?: string;
    footer?: ReactNode;
    onAction?: () => void;
    actionIcon?: string;
    actionLabel?: string;
}

const Card = ({
    title,
    children,
    className = '',
    footer,
    onAction,
    actionIcon = 'more_vert',
    actionLabel = 'More options'
}: CardProps) => {
    return (
        <div className={`card ${className}`}>
            {title && (
                <div className="card-header">
                    <h3 className="card-title">{title}</h3>
                    {onAction && (
                        <button
                            className="btn-icon"
                            onClick={onAction}
                            aria-label={actionLabel}
                        >
                            <span className="material-icons">{actionIcon}</span>
                        </button>
                    )}
                </div>
            )}
            <div className="card-content">
                {children}
            </div>
            {footer && (
                <div className="card-footer">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;