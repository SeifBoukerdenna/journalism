// src/pages/ScriptEditor.tsx
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import Tabs from '../components/common/Tabs';

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
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
    const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const [scriptStats, setScriptStats] = useState({
        wordCount: 0,
        characterCount: 0,
        estimatedDuration: '0:00'
    });

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

    // Get the current script if one is selected
    const currentScript = currentScriptId
        ? scripts.find(s => s.id === currentScriptId)
        : null;

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

    // Handle form submission
    const handleScriptSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedScriptId) {
            updateScript(selectedScriptId, scriptFormData);
        } else {
            const newScript = addScript(scriptFormData);
            // Set the new script as the current script
            setCurrentScriptId(newScript.id);
        }

        setIsScriptModalOpen(false);
        setSelectedScriptId(null);
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

    // Function to save changes to the current script
    const saveCurrentScript = () => {
        if (currentScriptId && currentScript) {
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
        }
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

    // Function to calculate total duration of the script
    const calculateTotalDuration = (sections: typeof scriptFormData.sections) => {
        const totalSeconds = sections.reduce((total, section) => total + (section.duration || 0), 0);
        return formatDuration(totalSeconds);
    };

    // Open script edit modal
    const openEditScript = (scriptId: string) => {
        setSelectedScriptId(scriptId);
        setIsScriptModalOpen(true);
    };

    // Function to handle opening a script for editing
    const openScript = (scriptId: string) => {
        setCurrentScriptId(scriptId);
        setActiveSectionIndex(0);

        // If opening a different script, save the current one first
        if (currentScriptId && currentScriptId !== scriptId) {
            saveCurrentScript();
        }
    };

    // Function to create a new script
    const createNewScript = () => {
        // Save the current script first
        if (currentScriptId) {
            saveCurrentScript();
        }

        setSelectedScriptId(null);
        setIsScriptModalOpen(true);
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

                                <div className="section-editor">
                                    <div className="section-header">
                                        <div className="section-title-container">
                                            <input
                                                type="text"
                                                className="section-title-input"
                                                value={currentScript.sections[activeSectionIndex]?.title || ''}
                                                onChange={(e) => {
                                                    updateScript(currentScriptId, {
                                                        ...currentScript,
                                                        sections: currentScript.sections.map((section, index) =>
                                                            index === activeSectionIndex
                                                                ? { ...section, title: e.target.value }
                                                                : section
                                                        )
                                                    });
                                                }}
                                                placeholder="Section Title"
                                            />
                                            <div className="section-actions">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => {
                                                        if (currentScript.sections.length <= 1) return;

                                                        const newSections = [...currentScript.sections];
                                                        newSections.splice(activeSectionIndex, 1);

                                                        updateScript(currentScriptId, {
                                                            ...currentScript,
                                                            sections: newSections
                                                        });

                                                        // Adjust active section index
                                                        if (activeSectionIndex >= newSections.length) {
                                                            setActiveSectionIndex(newSections.length - 1);
                                                        }
                                                    }}
                                                    disabled={currentScript.sections.length <= 1}
                                                    aria-label="Delete section"
                                                >
                                                    <span className="material-icons">delete</span>
                                                </button>

                                                <button
                                                    className="btn-icon"
                                                    onClick={() => {
                                                        const newSections = [...currentScript.sections];

                                                        if (activeSectionIndex > 0) {
                                                            [newSections[activeSectionIndex], newSections[activeSectionIndex - 1]] =
                                                                [newSections[activeSectionIndex - 1], newSections[activeSectionIndex]];

                                                            updateScript(currentScriptId, {
                                                                ...currentScript,
                                                                sections: newSections
                                                            });

                                                            setActiveSectionIndex(activeSectionIndex - 1);
                                                        }
                                                    }}
                                                    disabled={activeSectionIndex <= 0}
                                                    aria-label="Move section up"
                                                >
                                                    <span className="material-icons">arrow_upward</span>
                                                </button>

                                                <button
                                                    className="btn-icon"
                                                    onClick={() => {
                                                        const newSections = [...currentScript.sections];

                                                        if (activeSectionIndex < newSections.length - 1) {
                                                            [newSections[activeSectionIndex], newSections[activeSectionIndex + 1]] =
                                                                [newSections[activeSectionIndex + 1], newSections[activeSectionIndex]];

                                                            updateScript(currentScriptId, {
                                                                ...currentScript,
                                                                sections: newSections
                                                            });

                                                            setActiveSectionIndex(activeSectionIndex + 1);
                                                        }
                                                    }}
                                                    disabled={activeSectionIndex >= currentScript.sections.length - 1}
                                                    aria-label="Move section down"
                                                >
                                                    <span className="material-icons">arrow_downward</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="editor-tabs">
                                        <Tabs
                                            tabs={[
                                                {
                                                    id: 'script',
                                                    label: 'Script',
                                                    icon: 'description',
                                                    content: (
                                                        <div className="script-textarea-container">
                                                            <textarea
                                                                id={`section-content-${activeSectionIndex}`}
                                                                className="script-textarea"
                                                                value={currentScript.sections[activeSectionIndex]?.content || ''}
                                                                onChange={(e) => {
                                                                    const newContent = e.target.value;
                                                                    updateScript(currentScriptId, {
                                                                        ...currentScript,
                                                                        sections: currentScript.sections.map((section, index) =>
                                                                            index === activeSectionIndex
                                                                                ? { ...section, content: newContent }
                                                                                : section
                                                                        )
                                                                    });
                                                                    calculateSectionStats(newContent, currentScript.sections[activeSectionIndex].id);
                                                                }}
                                                                placeholder="Write your script here..."
                                                            />
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    id: 'notes',
                                                    label: 'Notes',
                                                    icon: 'sticky_note_2',
                                                    content: (
                                                        <div className="notes-textarea-container">
                                                            <textarea
                                                                id={`section-notes-${activeSectionIndex}`}
                                                                className="notes-textarea"
                                                                value={currentScript.sections[activeSectionIndex]?.notes || ''}
                                                                onChange={(e) => {
                                                                    updateScript(currentScriptId, {
                                                                        ...currentScript,
                                                                        sections: currentScript.sections.map((section, index) =>
                                                                            index === activeSectionIndex
                                                                                ? { ...section, notes: e.target.value }
                                                                                : section
                                                                        )
                                                                    });
                                                                }}
                                                                placeholder="Add additional notes, camera directions, or visual cues here..."
                                                            />
                                                        </div>
                                                    ),
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
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
                    setIsScriptModalOpen(false);
                    setSelectedScriptId(null);
                }}
                title={selectedScriptId ? "Edit Script Details" : "New Script"}
                size="large"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsScriptModalOpen(false);
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
        </div>
    );
};

export default ScriptEditor;