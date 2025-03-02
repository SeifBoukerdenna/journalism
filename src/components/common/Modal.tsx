// src/components/common/Modal.tsx
import { ReactNode, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actions?: ReactNode;
    size?: 'small' | 'medium' | 'large' | 'full';
}

const Modal = ({ isOpen, onClose, title, children, actions, size = 'medium' }: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-backdrop">
            <div className={`modal modal-${size}`} ref={modalRef}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button
                        className="btn-icon modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
                {actions && (
                    <div className="modal-footer">
                        {actions}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;