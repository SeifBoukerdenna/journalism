// src/components/common/ConfirmationDialog.tsx
import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to continue?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
}) => {
    let iconName = 'help';
    let iconColor = 'var(--primary-color)';

    switch (type) {
        case 'warning':
            iconName = 'warning';
            iconColor = 'var(--warning-color)';
            break;
        case 'danger':
            iconName = 'error';
            iconColor = 'var(--danger-color)';
            break;
        case 'info':
            iconName = 'info';
            iconColor = 'var(--primary-color)';
            break;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="small"
            actions={
                <>
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={type === 'danger' ? 'danger' : 'primary'}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            <div className="confirmation-dialog">
                <div
                    className="confirmation-icon"
                    style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
                >
                    <span className="material-icons">{iconName}</span>
                </div>
                <p className="confirmation-message">{message}</p>
            </div>
        </Modal>
    );
};

export default ConfirmationDialog;