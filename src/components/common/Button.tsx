// src/components/common/Button.tsx
import { ReactNode, MouseEvent } from 'react';

interface ButtonProps {
    children: ReactNode;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
    size?: 'small' | 'medium' | 'large';
    icon?: string;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
}

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    icon,
    className = '',
    disabled = false,
    type = 'button',
    fullWidth = false
}: ButtonProps) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span className="material-icons btn-icon">{icon}</span>}
            <span>{children}</span>
        </button>
    );
};

export default Button;