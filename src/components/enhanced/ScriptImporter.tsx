// src/components/enhanced/ScriptImporter.tsx
import React, { useState, useRef } from 'react';
import { showSuccessToast, showErrorToast } from '../../utils/toastService';
import { processDocumentIntoSections, extractDocumentMetadata } from '../../utils/documentUtils';
import Button from '../common/Button';
import Modal from '../common/Modal';
import * as pdfjs from 'pdfjs-dist';
import { extractPdfContent } from '../../utils/pdfUtils';
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';


// Define a common interface for imported sections
export interface ImportedSection {
    title: string;
    content: string;
    duration?: number;
}

interface ScriptImporterProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (scriptData: { title: string; sections: ImportedSection[] }) => void;
}

const ScriptImporter: React.FC<ScriptImporterProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [progress, setProgress] = useState<string | null>(null);
    const [importOptions, setImportOptions] = useState({
        splitBySections: true,
        detectionMethod: 'headings' as 'headings' | 'paragraphs',
        cleanFormatting: true,
        importAsNewScript: true,
    });


    // Then set the worker location:
    if (typeof window !== 'undefined' && 'pdfjsWorker' in window === false) {
        // @ts-ignore
        window.pdfjsWorker = pdfjsWorker;
    }


    pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';


    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection through the file input
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    // Validate and set the selected file
    const validateAndSetFile = (selectedFile: File) => {
        // Check file extension
        const extension = selectedFile.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['docx', 'pdf', 'txt', 'md', 'rtf'];

        if (!extension || !allowedExtensions.includes(extension)) {
            showErrorToast(`Unsupported file format: .${extension}. Please upload a DOCX, PDF, TXT, MD, or RTF file.`);
            return;
        }

        // Check file size (limit to 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            showErrorToast('File is too large. Please upload files smaller than 10MB.');
            return;
        }

        setFile(selectedFile);
    };

    // Handle drag and drop events
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = () => {
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Main import function
    const handleImport = async () => {
        if (!file) {
            showErrorToast('Please select a file first');
            return;
        }

        setIsLoading(true);
        setProgress('Reading file...');

        try {
            const extension = file.name.split('.').pop()?.toLowerCase();
            let content = '';
            let documentTitle = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension

            // Read the file based on its type
            if (extension === 'docx') {
                setProgress('Processing DOCX document...');
                content = await importDocx(file);
            } if (extension === 'pdf') {
                setProgress('Processing PDF document...');
                try {
                    await importPdf(file);
                    // Note: We don't need to continue processing since importPdf handles everything
                    return; // Early return
                } catch (error) {
                    // Error is already handled in importPdf
                    setIsLoading(false);
                    return; // Early return on error
                }
            } else {
                // Plain text files (txt, md, etc.)
                setProgress('Reading text file...');
                content = await file.text();
            }

            setProgress('Analyzing document structure...');

            // Try to extract metadata from the content
            const metadata = extractDocumentMetadata(content);
            if (metadata.title) {
                documentTitle = metadata.title;
            }

            // Process the content into sections
            const sections = processDocumentIntoSections(content, {
                splitBySections: importOptions.splitBySections,
                detectionMethod: importOptions.detectionMethod,
                cleanFormatting: importOptions.cleanFormatting,
                documentTitle
            });

            setProgress('Preparing script...');

            // Send the processed sections to the parent component
            onImport({
                title: documentTitle,
                sections
            });

            showSuccessToast('Script imported successfully');
            onClose();
        } catch (error) {
            console.error('Import error:', error);
            showErrorToast('Failed to import script. Please check the file format and try again.');
        } finally {
            setIsLoading(false);
            setProgress(null);
        }
    };

    // Import DOCX using mammoth.js
    const importDocx = async (file: File): Promise<string> => {
        try {
            // In a real implementation, we'd use mammoth.js
            // For now, we'll just read it as text for demonstration
            const text = await file.text();
            return text;

            // With mammoth.js properly integrated:
            /*
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value;
            */
        } catch (error) {
            console.error('DOCX import error:', error);
            throw new Error('Failed to process DOCX file');
        }
    };

    // PDF import function
    const importPdf = async (file: File): Promise<string> => {
        try {
            // Use the advanced PDF extraction function
            const result = await extractPdfContent(
                file,
                {
                    detectHeadings: true,
                    detectFontChanges: true,
                    cleanWhitespace: true,
                    combinePages: true
                },
                (_, message) => {
                    // Update progress in the UI
                    setProgress(message);
                }
            );

            // Return the processed document directly
            // Note: We're bypassing the normal text processing since extractPdfContent
            // already gives us structured sections
            onImport({
                title: result.title,
                sections: result.sections
            });

            // Show success message
            showSuccessToast('PDF imported successfully');

            // Close the import modal
            onClose();

            // Return dummy content since we've already processed everything
            return '';
        } catch (error: any) {
            console.error('PDF import error:', error);
            showErrorToast(`PDF import failed: ${error.message}`);
            throw error;
        }
    };


    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Import Script"
            size="medium"
            actions={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleImport}
                        disabled={!file || isLoading}
                    >
                        {isLoading ? 'Importing...' : 'Import'}
                    </Button>
                </>
            }
        >
            <div className="script-importer">
                <p className="importer-description">
                    Import a script from a document file to automatically populate the script editor.
                </p>

                <div
                    className={`drop-area ${isDragActive ? 'active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        accept=".docx,.pdf,.txt,.md,.rtf"
                        style={{ display: 'none' }}
                    />

                    <span className="material-icons drop-icon">
                        upload_file
                    </span>

                    <h3>Drag & drop a file here</h3>
                    <p>or click to browse files</p>
                    <p className="file-types">
                        Supports DOCX, PDF, TXT, MD, and RTF files up to 10MB
                    </p>
                </div>

                {file && (
                    <div className="file-info">
                        <span className="material-icons file-icon">
                            {file.name.endsWith('.docx') ? 'description' :
                                file.name.endsWith('.pdf') ? 'picture_as_pdf' : 'text_snippet'}
                        </span>

                        <div className="file-details">
                            <div className="file-name">{file.name}</div>
                            <div className="file-size">{formatFileSize(file.size)}</div>
                        </div>

                        <Button
                            variant="outline"
                            size="small"
                            onClick={() => setFile(null)}
                            icon="close"
                        >
                            Remove
                        </Button>
                    </div>
                )}

                <div className="import-options">
                    <h4>Import Options</h4>

                    <div className="option-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={importOptions.splitBySections}
                                onChange={(e) => setImportOptions({ ...importOptions, splitBySections: e.target.checked })}
                            />
                            <span>Split into multiple script sections</span>
                        </label>

                        {importOptions.splitBySections && (
                            <div className="detection-options">
                                <div className="option">
                                    <input
                                        type="radio"
                                        id="headings"
                                        name="detectionMethod"
                                        checked={importOptions.detectionMethod === 'headings'}
                                        onChange={() => setImportOptions({ ...importOptions, detectionMethod: 'headings' })}
                                    />
                                    <label htmlFor="headings">
                                        Detect sections by headings
                                    </label>
                                </div>

                                <div className="option">
                                    <input
                                        type="radio"
                                        id="paragraphs"
                                        name="detectionMethod"
                                        checked={importOptions.detectionMethod === 'paragraphs'}
                                        onChange={() => setImportOptions({ ...importOptions, detectionMethod: 'paragraphs' })}
                                    />
                                    <label htmlFor="paragraphs">
                                        Detect sections by paragraph breaks
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="option-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={importOptions.cleanFormatting}
                                onChange={(e) => setImportOptions({ ...importOptions, cleanFormatting: e.target.checked })}
                            />
                            <span>Clean up formatting (recommended)</span>
                        </label>
                    </div>

                    <div className="option-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={importOptions.importAsNewScript}
                                onChange={(e) => setImportOptions({ ...importOptions, importAsNewScript: e.target.checked })}
                            />
                            <span>Import as a new script</span>
                        </label>
                        <div className="option-description">
                            If unchecked, content will be imported into the current script if one is selected
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="import-progress">
                        <div className="spinner"></div>
                        <p>{progress || 'Processing your document...'}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ScriptImporter