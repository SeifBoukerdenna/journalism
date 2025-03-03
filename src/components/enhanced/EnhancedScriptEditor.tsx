// src/components/enhanced/EnhancedScriptEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import Tabs from '../common/Tabs';
import '../../styles/enhanced-script-editor.css';

interface ScriptSection {
    id: string;
    title: string;
    content: string;
    notes?: string;
    duration?: number;
}

interface EnhancedScriptEditorProps {
    section: ScriptSection;
    activeSectionIndex: number;
    onChange: (content: string) => void;
    onTitleChange: (title: string) => void;
    onCalculateDuration: (content: string, sectionId: string) => void;
}

const EnhancedScriptEditor: React.FC<EnhancedScriptEditorProps> = ({
    section,
    activeSectionIndex,
    onChange,
    onTitleChange,
    onCalculateDuration
}) => {
    const [activeTab, setActiveTab] = useState<'script' | 'notes'>('script');
    const scriptTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [wordCount, setWordCount] = useState(0);
    const [characterCount, setCharacterCount] = useState(0);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);

    // Calculate word count and character count
    useEffect(() => {
        if (section.content) {
            const words = section.content.trim().split(/\s+/).filter(Boolean).length;
            const chars = section.content.length;
            setWordCount(words);
            setCharacterCount(chars);
        } else {
            setWordCount(0);
            setCharacterCount(0);
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

    return (
        <div className="section-editor">
            <div className="section-header">
                <div className="section-title-container">
                    <input
                        type="text"
                        className="section-title-input"
                        value={section.title || ''}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Section Title"
                    />
                </div>
            </div>

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
                                        ref={scriptTextareaRef}
                                        id={`section-content-${activeSectionIndex}`}
                                        className="script-textarea"
                                        value={section.content || ''}
                                        onChange={(e) => {
                                            const newContent = e.target.value;
                                            onChange(newContent);
                                            onCalculateDuration(newContent, section.id);
                                        }}
                                        placeholder="Write your script here... Use the toolbar above for formatting options."
                                        // Make textarea resizable
                                        style={{ resize: 'both' }}
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
                                        value={section.notes || ''}
                                        onChange={(e) => {
                                            const updatedSection = { ...section, notes: e.target.value };
                                            // Handle notes update via onChange
                                            onChange(section.content); // This triggers rerender but preserves content
                                        }}
                                        placeholder="Add additional notes, camera directions, or visual cues here..."
                                        // Make textarea resizable
                                        style={{ resize: 'both' }}
                                    />
                                </div>
                            ),
                        },
                    ]}
                    defaultActiveTab={activeTab}
                    onChange={(tabId) => setActiveTab(tabId as 'script' | 'notes')}
                />
            </div>
        </div>
    );
};

export default EnhancedScriptEditor;