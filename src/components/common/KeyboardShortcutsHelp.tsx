// src/components/common/KeyboardShortcutsHelp.tsx
import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface KeyboardShortcut {
    key: string;
    description: string;
    category: string;
}

interface KeyboardShortcutsHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
    isOpen,
    onClose
}) => {
    const isMac = navigator.userAgent.indexOf('Mac') !== -1;
    const ctrlKey = isMac ? '⌘' : 'Ctrl';

    const shortcuts: KeyboardShortcut[] = [
        // Global shortcuts
        { key: `${ctrlKey} + K`, description: 'Open search', category: 'Global' },
        { key: `${ctrlKey} + /`, description: 'Open keyboard shortcuts', category: 'Global' },
        { key: `${ctrlKey} + ,`, description: 'Open settings', category: 'Global' },
        { key: 'Esc', description: 'Close modals and menus', category: 'Global' },

        // Script Editor shortcuts
        { key: `${ctrlKey} + S`, description: 'Save script', category: 'Script Editor' },
        { key: `${ctrlKey} + Enter`, description: 'Save and preview', category: 'Script Editor' },
        { key: `${ctrlKey} + B`, description: 'Bold text', category: 'Script Editor' },
        { key: `${ctrlKey} + I`, description: 'Italic text', category: 'Script Editor' },
        { key: `Tab`, description: 'Indent text', category: 'Script Editor' },
        { key: `Shift + Tab`, description: 'Outdent text', category: 'Script Editor' },

        // Content Planner shortcuts
        { key: 'N', description: 'New content', category: 'Content Planner' },
        { key: 'V', description: 'Change view mode', category: 'Content Planner' },
        { key: 'F', description: 'Filter content', category: 'Content Planner' },

        // Research Hub shortcuts
        { key: 'N', description: 'New topic', category: 'Research Hub' },
        { key: 'A', description: 'Add note', category: 'Research Hub' },
        { key: 'G', description: 'Toggle grid/list view', category: 'Research Hub' },
    ];

    // Group shortcuts by category
    const categories = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Keyboard Shortcuts"
            size="medium"
            actions={
                <Button variant="primary" onClick={onClose}>
                    Close
                </Button>
            }
        >
            <div className="keyboard-shortcuts-container">
                {Object.entries(categories).map(([category, categoryShortcuts]) => (
                    <div key={category} className="shortcuts-category">
                        <h3>{category}</h3>
                        <div className="shortcuts-list">
                            {categoryShortcuts.map((shortcut, index) => (
                                <div key={index} className="shortcut-item">
                                    <kbd className="shortcut-key">{shortcut.key}</kbd>
                                    <span className="shortcut-description">{shortcut.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="shortcuts-tip">
                    <div className="tip-icon">
                        <span className="material-icons">lightbulb</span>
                    </div>
                    <p>
                        Press <kbd>{ctrlKey} + /</kbd> at any time to show this shortcuts menu.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default KeyboardShortcutsHelp;