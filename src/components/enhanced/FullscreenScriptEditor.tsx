// src/components/enhanced/FullscreenScriptEditor.tsx

import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';

interface ScriptSection {
    id: string;
    title: string;
    content: string;
    notes?: string;
    duration?: number;
}

interface FullscreenScriptEditorProps {
    section: ScriptSection;
    onClose: () => void;
    onChange: (content: string) => void;
    onTitleChange: (title: string) => void;
    onCalculateDuration: (content: string, sectionId: string) => void;
    activeSectionIndex: number;
    allSections: ScriptSection[];
    onSectionChange: (index: number) => void;
}

const FullscreenScriptEditor: React.FC<FullscreenScriptEditorProps> = ({
    section,
    onClose,
    onChange,
    onTitleChange,
    onCalculateDuration,
    activeSectionIndex,
    allSections,
    onSectionChange
}) => {
    const [activeTab, setActiveTab] = useState<'script' | 'notes'>('script');
    const scriptTextareaRef = useRef<HTMLTextAreaElement>(null);
    const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [wordCount, setWordCount] = useState(0);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);

    // Effect to set body overflow to hidden
    useEffect(() => {
        document.body.classList.add('fullscreen-active');

        return () => {
            document.body.classList.remove('fullscreen-active');
        };
    }, []);

    // Effect to handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    // Focus textarea when mounted
    useEffect(() => {
        if (activeTab === 'script' && scriptTextareaRef.current) {
            setTimeout(() => {
                scriptTextareaRef.current?.focus();
            }, 100);
        } else if (activeTab === 'notes' && notesTextareaRef.current) {
            setTimeout(() => {
                notesTextareaRef.current?.focus();
            }, 100);
        }
    }, [activeTab]);

    // Calculate word count
    useEffect(() => {
        if (section.content) {
            const words = section.content.trim().split(/\s+/).filter(Boolean).length;
            setWordCount(words);
        } else {
            setWordCount(0);
        }
    }, [section.content]);

    const formatDuration = (seconds: number = 0) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Text formatting helpers
    const handleBoldClick = () => {
        if (!scriptTextareaRef.current) return;

        const textarea = scriptTextareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        if (selectedText) {
            const newText = `**${selectedText}**`;
            const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
            onChange(newContent);

            // Reset selection
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + 2, end + 2);
            }, 0);
        }

        setIsBold(!isBold);
    };

    const handleItalicClick = () => {
        if (!scriptTextareaRef.current) return;

        const textarea = scriptTextareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        if (selectedText) {
            const newText = `*${selectedText}*`;
            const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
            onChange(newContent);

            // Reset selection
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + 1, end + 1);
            }, 0);
        }

        setIsItalic(!isItalic);
    };

    const insertText = (template: string) => {
        if (!scriptTextareaRef.current) return;

        const textarea = scriptTextareaRef.current;
        const start = textarea.selectionStart;

        const newContent = textarea.value.substring(0, start) + template + textarea.value.substring(start);
        onChange(newContent);

        // Set cursor position after inserted text
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + template.length, start + template.length);
        }, 0);
    };

    // Function to handle note changes
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!section) return;

        // Create a copy of the section with updated notes
        const updatedSection = { ...section, notes: e.target.value };

        // We need to use the onChange function to update the section in the parent component
        // Since we're only updating notes, we pass the existing content
        onChange(section.content);

        // We also need to make sure the updated notes are saved to the parent component
        // This is typically handled in the parent's implementation of onChange
    };

    return (
        <div className="fullscreen-editor-overlay">
            <div className="fullscreen-editor-header">
                <div className="fullscreen-editor-title">
                    <input
                        type="text"
                        className="section-title-input"
                        value={section.title || ''}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Section Title"
                    />
                </div>
                <div className="fullscreen-editor-controls">
                    <Button
                        variant="primary"
                        onClick={onClose}
                        icon="fullscreen_exit"
                    >
                        Exit Fullscreen
                    </Button>
                </div>
            </div>

            <div className="fullscreen-editor-tabs">
                <div className="fullscreen-tabs-scroll">
                    {allSections.map((sect, index) => (
                        <button
                            key={sect.id}
                            className={`section-tab ${index === activeSectionIndex ? 'active' : ''}`}
                            onClick={() => onSectionChange(index)}
                        >
                            <span>{sect.title}</span>
                            {sect.duration ? (
                                <span className="section-duration">{formatDuration(sect.duration)}</span>
                            ) : null}
                        </button>
                    ))}
                </div>
            </div>

            <div className="fullscreen-editor-content">
                <div className="editor-toolbar">
                    <div className="toolbar-group">
                        <button
                            type="button"
                            className={`toolbar-btn ${isBold ? 'active' : ''}`}
                            onClick={handleBoldClick}
                            title="Bold"
                        >
                            <span className="material-icons">format_bold</span>
                        </button>
                        <button
                            type="button"
                            className={`toolbar-btn ${isItalic ? 'active' : ''}`}
                            onClick={handleItalicClick}
                            title="Italic"
                        >
                            <span className="material-icons">format_italic</span>
                        </button>
                    </div>

                    <div className="toolbar-group">
                        <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => insertText("[Camera: Close-up]\n")}
                            title="Camera Direction"
                        >
                            <span className="material-icons">videocam</span>
                        </button>
                        <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => insertText("[Action: ]\n")}
                            title="Action"
                        >
                            <span className="material-icons">directions_run</span>
                        </button>
                        <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => insertText("[Transition: Fade]\n")}
                            title="Transition"
                        >
                            <span className="material-icons">animation</span>
                        </button>
                    </div>

                    <div className="toolbar-group">
                        <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => {
                                const timestamp = new Date().toLocaleTimeString();
                                insertText(`[Note: ${timestamp}] `);
                            }}
                            title="Add Timestamp"
                        >
                            <span className="material-icons">access_time</span>
                        </button>
                        <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => insertText("[Graphics: ]\n")}
                            title="Graphics Note"
                        >
                            <span className="material-icons">insert_photo</span>
                        </button>
                    </div>

                    {/* Tab toggle buttons */}
                    <div className="toolbar-group" style={{ marginLeft: 'auto' }}>
                        <button
                            type="button"
                            className={`toolbar-btn ${activeTab === 'script' ? 'active' : ''}`}
                            onClick={() => setActiveTab('script')}
                            title="Script"
                        >
                            <span className="material-icons">description</span>
                        </button>
                        <button
                            type="button"
                            className={`toolbar-btn ${activeTab === 'notes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notes')}
                            title="Notes"
                        >
                            <span className="material-icons">sticky_note_2</span>
                        </button>
                    </div>
                </div>

                {activeTab === 'script' ? (
                    <div className="script-textarea-container">
                        <textarea
                            ref={scriptTextareaRef}
                            id={`fullscreen-content-${activeSectionIndex}`}
                            className="script-textarea"
                            value={section.content || ''}
                            onChange={(e) => {
                                const newContent = e.target.value;
                                onChange(newContent);
                                onCalculateDuration(newContent, section.id);
                            }}
                            placeholder="Write your script here... Use the toolbar above for formatting options."
                        />

                        <div className="word-count-indicator">
                            <span className="material-icons">text_fields</span>
                            <span>{wordCount} words</span>
                            <span className="section-duration-indicator">
                                <span className="material-icons">schedule</span>
                                <span>{formatDuration(section.duration)}</span>
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="notes-textarea-container">
                        <textarea
                            ref={notesTextareaRef}
                            id={`fullscreen-notes-${activeSectionIndex}`}
                            className="notes-textarea"
                            value={section.notes || ''}
                            onChange={handleNotesChange}
                            placeholder="Add additional notes, camera directions, or visual cues here..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FullscreenScriptEditor;