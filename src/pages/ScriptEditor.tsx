// src/pages/ScriptEditor.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import useUnsavedChanges from '../hooks/useUnsavedChanges';
import { useModal } from '../hooks/useModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { showSuccessToast, showErrorToast } from '../utils/toastService';
import EnhancedScriptEditor from '../components/enhanced/EnhancedScriptEditor';

// Import the script editor styles
import '../styles/enhanced-script-editor.css';

interface ScriptFormData {
    title: string;
    contentPlanId: string;
    sections: {
        id: string;
        title: string;
        content: string;
        notes?: string;
        duration?: number;
    }[];
}

const ScriptEditor = () => {
    const {
        scripts,
        contentPlans,
        addScript,
        updateScript,
        searchQuery
    } = useAppContext();

    // Reference for the timer in word count calculation
    const timerRef = useRef<number | null>(null);

    // State for script management
    const {
        isOpen: isScriptModalOpen,
        openModal: openScriptModal,
        closeModal: closeScriptModal
    } = useModal(false);
    const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
    const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const [scriptStats, setScriptStats] = useState({
        wordCount: 0,
        characterCount: 0,
        estimatedDuration: '0:00'
    });

    // Unsaved changes tracking
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const {
        handleNavigation,
        confirmNavigation,
        cancelNavigation,
        showConfirmation,
        destination
    } = useUnsavedChanges(hasUnsavedChanges);

    // Auto-save functionality
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const autoSaveTimerRef = useRef<number | null>(null);

    // Script form data
    const [scriptFormData, setScriptFormData] = useState<ScriptFormData>({
        title: '',
        contentPlanId: '',
        sections: [{
            id: crypto.randomUUID(),
            title: 'Introduction',
            content: '',
            notes: '',
            duration: 0
        }]
    });

    // Get the current script if one is selected
    const currentScript = currentScriptId
        ? scripts.find(s => s.id === currentScriptId)
        : null;

    // Function to save changes to the current script
    const saveCurrentScript = useCallback(() => {
        if (currentScriptId && currentScript) {
            try {
                updateScript(currentScriptId, {
                    ...currentScript,
                    sections: currentScript.sections.map((section, index) => {
                        const textareaElement = document.getElementById(`section-content-${index}`) as HTMLTextAreaElement;
                        const notesElement = document.getElementById(`section-notes-${index}`) as HTMLTextAreaElement;

                        return {
                            ...section,
                            content: textareaElement ? textareaElement.value : section.content,
                            notes: notesElement ? notesElement.value : section.notes || ''
                        };
                    })
                });
                setHasUnsavedChanges(false);
                setLastSaved(new Date());
                showSuccessToast('Script saved successfully');
            } catch (error) {
                showErrorToast('Error saving script');
                console.error('Error saving script:', error);
            }
        }
    }, [currentScript, currentScriptId, updateScript]);

    // Filtered scripts based on search query
    const filteredScripts = scripts.filter(script => {
        if (!searchQuery) return true;
        return (
            script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            script.sections.some(section =>
                section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                section.content.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    });

    // Filtered content plans for the dropdown (only show content plans that don't have a script)
    const availableContentPlans = contentPlans.filter(plan => {
        // If we're editing an existing script, include its content plan in the options
        if (selectedScriptId) {
            const script = scripts.find(s => s.id === selectedScriptId);
            if (script && script.contentPlanId === plan.id) {
                return true;
            }
        }

        // Filter out content plans that already have a script
        return !scripts.some(s => s.contentPlanId === plan.id);
    });

    // Reset form data when modal closes
    useEffect(() => {
        if (!isScriptModalOpen) {
            setScriptFormData({
                title: '',
                contentPlanId: '',
                sections: [{
                    id: crypto.randomUUID(),
                    title: 'Introduction',
                    content: '',
                    notes: '',
                    duration: 0
                }]
            });
        }
    }, [isScriptModalOpen]);

    // Load script data when editing
    useEffect(() => {
        if (selectedScriptId && isScriptModalOpen) {
            const script = scripts.find(s => s.id === selectedScriptId);
            if (script) {
                setScriptFormData({
                    title: script.title,
                    contentPlanId: script.contentPlanId,
                    sections: script.sections.map(section => ({
                        ...section,
                        duration: section.duration || 0
                    }))
                });
            }
        }
    }, [selectedScriptId, isScriptModalOpen, scripts]);

    // Calculate script statistics when the current script or active section changes
    useEffect(() => {
        if (currentScript) {
            const allContent = currentScript.sections.map(s => s.content).join(' ');

            // Count words and characters
            const words = allContent.trim().split(/\s+/).filter(Boolean).length;
            const characters = allContent.replace(/\s+/g, '').length;

            // Calculate estimated duration (assuming ~130 words per minute for speech)
            const durationMinutes = words / 130;
            const minutes = Math.floor(durationMinutes);
            const seconds = Math.floor((durationMinutes - minutes) * 60);

            setScriptStats({
                wordCount: words,
                characterCount: characters,
                estimatedDuration: `${minutes}:${seconds.toString().padStart(2, '0')}`
            });
        }
    }, [currentScript, activeSectionIndex]);

    // Effect to detect changes for unsaved changes tracking
    useEffect(() => {
        if (currentScriptId && currentScript) {
            // Compare with the original script to detect changes
            const originalScript = scripts.find(s => s.id === currentScriptId);
            if (originalScript) {
                const sectionsChanged = JSON.stringify(currentScript.sections) !== JSON.stringify(originalScript.sections);
                setHasUnsavedChanges(sectionsChanged);
            }
        } else {
            setHasUnsavedChanges(false);
        }
    }, [currentScript, currentScriptId, scripts]);

    // Setup auto-save functionality
    useEffect(() => {
        if (autoSaveEnabled && hasUnsavedChanges && currentScriptId) {
            // Clear any existing timer
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }

            // Set new timer to auto-save after 30 seconds of inactivity
            autoSaveTimerRef.current = window.setTimeout(() => {
                saveCurrentScript();
                setLastSaved(new Date());
            }, 30000); // 30 seconds
        }

        // Clean up on unmount
        return () => {
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [hasUnsavedChanges, currentScriptId, autoSaveEnabled, saveCurrentScript]);

    // Handle navigation after confirmation
    useEffect(() => {
        if (!showConfirmation && destination && destination.startsWith('#')) {
            const scriptId = destination.substring(1);
            setCurrentScriptId(scriptId);
            setActiveSectionIndex(0);
            setHasUnsavedChanges(false);
        }
    }, [showConfirmation, destination]);

    // Handle form submission
    const handleScriptSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (selectedScriptId) {
                updateScript(selectedScriptId, scriptFormData);
                showSuccessToast('Script updated successfully');
            } else {
                // Store the returned script and check if it exists before accessing the id
                const newScript = addScript(scriptFormData);
                if (newScript && newScript.id) {
                    setCurrentScriptId(newScript.id);
                    showSuccessToast('Script created successfully');
                }
            }

            closeScriptModal();
            setSelectedScriptId(null);
        } catch (error) {
            showErrorToast('Error saving script');
            console.error('Error saving script:', error);
        }
    };

    // Function to add a new section to the script
    const addSection = () => {
        setScriptFormData({
            ...scriptFormData,
            sections: [
                ...scriptFormData.sections,
                {
                    id: crypto.randomUUID(),
                    title: `Section ${scriptFormData.sections.length + 1}`,
                    content: '',
                    notes: '',
                    duration: 0
                }
            ]
        });
    };

    // Function to remove a section from the script
    const removeSection = (sectionId: string) => {
        if (scriptFormData.sections.length <= 1) {
            return; // Don't remove the last section
        }

        setScriptFormData({
            ...scriptFormData,
            sections: scriptFormData.sections.filter(section => section.id !== sectionId)
        });
    };

    // Function to update a section field
    const updateSectionField = (sectionId: string, field: keyof typeof scriptFormData.sections[0], value: string | number) => {
        setScriptFormData({
            ...scriptFormData,
            sections: scriptFormData.sections.map(section =>
                section.id === sectionId ? { ...section, [field]: value } : section
            )
        });
    };

    // Function to reorder sections
    const moveSection = (sectionId: string, direction: 'up' | 'down') => {
        const sectionIndex = scriptFormData.sections.findIndex(section => section.id === sectionId);
        if (sectionIndex === -1) return;

        const newSections = [...scriptFormData.sections];

        if (direction === 'up' && sectionIndex > 0) {
            // Swap with the previous section
            [newSections[sectionIndex], newSections[sectionIndex - 1]] =
                [newSections[sectionIndex - 1], newSections[sectionIndex]];
        } else if (direction === 'down' && sectionIndex < newSections.length - 1) {
            // Swap with the next section
            [newSections[sectionIndex], newSections[sectionIndex + 1]] =
                [newSections[sectionIndex + 1], newSections[sectionIndex]];
        }

        setScriptFormData({
            ...scriptFormData,
            sections: newSections
        });
    };

    // Function to calculate word count and update estimated duration for a section
    const calculateSectionStats = (content: string, sectionId: string) => {
        // Clear previous timer
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
        }

        // Set a new timer to calculate after typing stops
        timerRef.current = window.setTimeout(() => {
            const words = content.trim().split(/\s+/).filter(Boolean).length;
            // Assume 130 words per minute
            const durationMinutes = words / 130;
            const durationSeconds = Math.round(durationMinutes * 60);

            if (currentScriptId && currentScript) {
                updateScript(currentScriptId, {
                    ...currentScript,
                    sections: currentScript.sections.map(section =>
                        section.id === sectionId
                            ? { ...section, content, duration: durationSeconds }
                            : section
                    )
                });
            }
        }, 500);
    };

    // Function to format duration (seconds to MM:SS)
    const formatDuration = (seconds: number = 0) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Helper function to format the last saved time
    const formatLastSaved = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);

        if (diffMinutes < 1) {
            return 'just now';
        } else if (diffMinutes === 1) {
            return '1 minute ago';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minutes ago`;
        } else {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    // Function to calculate total duration of the script
    const calculateTotalDuration = (sections: typeof scriptFormData.sections) => {
        const totalSeconds = sections.reduce((total, section) => total + (section.duration || 0), 0);
        return formatDuration(totalSeconds);
    };

    // Open script edit modal
    const openEditScript = (scriptId: string) => {
        setSelectedScriptId(scriptId);
        openScriptModal();
    };

    // Function to handle opening a script for editing
    const openScript = (scriptId: string) => {
        if (hasUnsavedChanges && currentScriptId !== scriptId) {
            handleNavigation(`#${scriptId}`); // Using a hash to store the destination within the same page
            return;
        }

        setCurrentScriptId(scriptId);
        setActiveSectionIndex(0);
    };

    // Function to create a new script
    const createNewScript = () => {
        // Save the current script first
        if (currentScriptId && hasUnsavedChanges) {
            saveCurrentScript();
        }

        setSelectedScriptId(null);
        openScriptModal();
    };

    // Handle section content update
    const handleSectionContentUpdate = (content: string) => {
        if (!currentScriptId || !currentScript) return;

        updateScript(currentScriptId, {
            ...currentScript,
            sections: currentScript.sections.map((section, index) =>
                index === activeSectionIndex
                    ? { ...section, content }
                    : section
            )
        });
    };

    // Handle section title update
    const handleSectionTitleUpdate = (title: string) => {
        if (!currentScriptId || !currentScript) return;

        updateScript(currentScriptId, {
            ...currentScript,
            sections: currentScript.sections.map((section, index) =>
                index === activeSectionIndex
                    ? { ...section, title }
                    : section
            )
        });
    };

    return (
        <div className="script-editor-container">
            <div className="script-header">
                <div className="script-title">
                    <h1>Script Editor</h1>
                    <p>Create and edit scripts for your videos</p>
                </div>

                <div className="script-actions">
                    <Button
                        variant="primary"
                        icon="add"
                        onClick={createNewScript}
                    >
                        New Script
                    </Button>
                </div>
            </div>

            <div className="script-content">
                <div className="scripts-sidebar">
                    <Card title="My Scripts">
                        <div className="scripts-list">
                            {filteredScripts.length > 0 ? (
                                filteredScripts.map(script => (
                                    <div
                                        key={script.id}
                                        className={`script-item ${currentScriptId === script.id ? 'active' : ''}`}
                                        onClick={() => openScript(script.id)}
                                    >
                                        <div className="script-info">
                                            <h3>{script.title}</h3>
                                            <div className="script-meta">
                                                <span className="section-count">
                                                    <span className="material-icons">segment</span>
                                                    {script.sections.length} sections
                                                </span>
                                                <span className="duration">
                                                    <span className="material-icons">schedule</span>
                                                    {calculateTotalDuration(script.sections)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="script-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditScript(script.id);
                                                }}
                                                aria-label="Edit script details"
                                            >
                                                <span className="material-icons">edit</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState
                                    title="No scripts found"
                                    description="Create your first script to get started."
                                    icon="description"
                                    action={{
                                        label: "New Script",
                                        onClick: createNewScript
                                    }}
                                />
                            )}
                        </div>
                    </Card>
                </div>

                <div className="editor-container">
                    {currentScript ? (
                        <div className="script-editor">
                            <div className="editor-header">
                                <div className="editor-title-area">
                                    <h2>{currentScript.title}</h2>
                                    <div className="script-statistics">
                                        <div className="stat-item">
                                            <span className="material-icons">text_fields</span>
                                            <span>Words: {scriptStats.wordCount}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="material-icons">schedule</span>
                                            <span>Estimated Time: {scriptStats.estimatedDuration}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="material-icons">segment</span>
                                            <span>Sections: {currentScript.sections.length}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="editor-controls">
                                    <div className="auto-save-toggle">
                                        <input
                                            type="checkbox"
                                            id="auto-save"
                                            checked={autoSaveEnabled}
                                            onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
                                        />
                                        <label htmlFor="auto-save">Auto-save</label>
                                    </div>
                                    {lastSaved && (
                                        <span className="save-status">
                                            <span className="saved">Last saved: {formatLastSaved(lastSaved)}</span>
                                        </span>
                                    )}
                                    <Button
                                        variant="primary"
                                        onClick={saveCurrentScript}
                                        disabled={!hasUnsavedChanges}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>

                            <div className="editor-body">
                                <div className="sections-tabs">
                                    <div className="tabs-scroll">
                                        {currentScript.sections.map((section, index) => (
                                            <button
                                                key={section.id}
                                                className={`section-tab ${index === activeSectionIndex ? 'active' : ''}`}
                                                onClick={() => setActiveSectionIndex(index)}
                                            >
                                                <span>{section.title}</span>
                                                {section.duration ? (
                                                    <span className="section-duration">{formatDuration(section.duration)}</span>
                                                ) : null}
                                            </button>
                                        ))}
                                        <button
                                            className="add-section-tab"
                                            onClick={() => {
                                                saveCurrentScript();
                                                if (!currentScriptId) return;
                                                updateScript(currentScriptId, {
                                                    ...currentScript,
                                                    sections: [
                                                        ...currentScript.sections,
                                                        {
                                                            id: crypto.randomUUID(),
                                                            title: `Section ${currentScript.sections.length + 1}`,
                                                            content: '',
                                                            notes: ''
                                                        }
                                                    ]
                                                });

                                                // Focus on the new section
                                                setActiveSectionIndex(currentScript.sections.length);
                                            }}
                                        >
                                            <span className="material-icons">add</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Enhanced Script Editor Component */}
                                {currentScript.sections[activeSectionIndex] && (
                                    <EnhancedScriptEditor
                                        section={currentScript.sections[activeSectionIndex]}
                                        activeSectionIndex={activeSectionIndex}
                                        onChange={handleSectionContentUpdate}
                                        onTitleChange={handleSectionTitleUpdate}
                                        onCalculateDuration={calculateSectionStats}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <EmptyState
                                title="No Script Selected"
                                description="Select a script from the sidebar or create a new one to get started."
                                icon="description"
                                action={{
                                    label: "New Script",
                                    onClick: createNewScript
                                }}
                            />
                        </Card>
                    )}
                </div>
            </div>

            {/* New/Edit Script Modal */}
            <Modal
                isOpen={isScriptModalOpen}
                onClose={() => {
                    closeScriptModal();
                    setSelectedScriptId(null);
                }}
                title={selectedScriptId ? "Edit Script Details" : "New Script"}
                size="large"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                closeScriptModal();
                                setSelectedScriptId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleScriptSubmit}
                            disabled={!scriptFormData.title}
                        >
                            {selectedScriptId ? "Update" : "Create"}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleScriptSubmit} className="script-form">
                    <div className="form-group">
                        <label htmlFor="script-title">Title</label>
                        <input
                            type="text"
                            id="script-title"
                            value={scriptFormData.title}
                            onChange={(e) => setScriptFormData({ ...scriptFormData, title: e.target.value })}
                            placeholder="Enter script title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="script-content-plan">Content Plan (Optional)</label>
                        <select
                            id="script-content-plan"
                            value={scriptFormData.contentPlanId}
                            onChange={(e) => setScriptFormData({ ...scriptFormData, contentPlanId: e.target.value })}
                        >
                            <option value="">No Content Plan</option>
                            {availableContentPlans.map(plan => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.title}
                                </option>
                            ))}
                        </select>
                        <small className="form-hint">
                            Link this script to a content plan to organize your work.
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Initial Sections</label>
                        <div className="script-sections">
                            {scriptFormData.sections.map((section, index) => (
                                <div key={section.id} className="section-item">
                                    <div className="section-header">
                                        <h4>Section {index + 1}</h4>
                                        <div className="section-actions">
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                onClick={() => moveSection(section.id, 'up')}
                                                disabled={index === 0}
                                                aria-label="Move section up"
                                            >
                                                <span className="material-icons">arrow_upward</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                onClick={() => moveSection(section.id, 'down')}
                                                disabled={index === scriptFormData.sections.length - 1}
                                                aria-label="Move section down"
                                            >
                                                <span className="material-icons">arrow_downward</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                onClick={() => removeSection(section.id)}
                                                disabled={scriptFormData.sections.length <= 1}
                                                aria-label="Remove section"
                                            >
                                                <span className="material-icons">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="section-inputs">
                                        <input
                                            type="text"
                                            value={section.title}
                                            onChange={(e) => updateSectionField(section.id, 'title', e.target.value)}
                                            placeholder="Section Title"
                                            required
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                className="btn-text section-add-btn"
                                onClick={addSection}
                            >
                                <span className="material-icons">add_circle</span>
                                <span>Add Section</span>
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Unsaved Changes Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showConfirmation}
                onClose={cancelNavigation}
                onConfirm={confirmNavigation}
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to leave without saving?"
                confirmText="Leave"
                cancelText="Stay"
                type="warning"
            />
        </div>
    );
};

export default ScriptEditor;