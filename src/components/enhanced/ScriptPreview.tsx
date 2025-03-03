// src/components/enhanced/ScriptPreview.tsx
import { useState } from 'react';
import Button from '../common/Button';
import { showSuccessToast, showErrorToast } from '../../utils/toastService';

const ScriptPreview = ({ script, onClose }: { script: any, onClose: any }) => {
    const [previewMode, setPreviewMode] = useState('markdown');
    const [isExporting, setIsExporting] = useState(false);

    // Generate markdown from script sections
    const generateMarkdown = () => {
        if (!script || !script.sections) return '';

        let markdown = `# ${script.title}\n\n`;

        script.sections.forEach((section: { title: any; content: any; notes: string; }) => {
            markdown += `## ${section.title}\n\n${section.content}\n\n`;
            if (section.notes && section.notes.trim()) {
                markdown += `> **Notes:** ${section.notes}\n\n`;
            }
        });

        return markdown;
    };

    // Function to calculate total duration of the script
    const calculateTotalDuration = () => {
        if (!script || !script.sections) return '0:00';

        const totalSeconds = script.sections.reduce((total: any, section: { duration: any; }) => {
            return total + (section.duration || 0);
        }, 0);

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Function to count words in the script
    const countWords = () => {
        if (!script || !script.sections) return 0;

        return script.sections.reduce((total: any, section: { content: { trim: () => { (): any; new(): any; split: { (arg0: RegExp): { (): any; new(): any; filter: { (arg0: BooleanConstructor): { (): any; new(): any; length: any; }; new(): any; }; }; new(): any; }; }; }; }) => {
            const sectionWords = section.content.trim().split(/\s+/).filter(Boolean).length;
            return total + sectionWords;
        }, 0);
    };

    // Export functions
    const exportAsDocx = () => {
        setIsExporting(true);

        try {
            // Create a proper Word document content
            const content = generateMarkdown();

            // In a real implementation using libraries, we would format this better
            // For this demo, we're creating a simple HTML document that Word can open
            const htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${script.title}</title>
          <!-- Word specific styling -->
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            body { font-family: Calibri, Arial, sans-serif; }
            h1 { font-size: 24pt; }
            h2 { font-size: 18pt; margin-top: 24pt; }
            p { font-size: 12pt; line-height: 1.5; }
            .note { background-color: #f0f0f0; padding: 10pt; margin: 10pt 0; }
            .direction { font-style: italic; color: #555555; margin: 8pt 0; }
          </style>
        </head>
        <body>
          <h1>${script.title}</h1>
          ${content
                    .replace(/^# .*$/gm, '') // Remove the title as we've already added it
                    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                    .replace(/\[Camera: (.*?)\]/g, '<p class="direction"><strong>Camera:</strong> $1</p>')
                    .replace(/\[Action: (.*?)\]/g, '<p class="direction"><strong>Action:</strong> $1</p>')
                    .replace(/\[Graphics: (.*?)\]/g, '<p class="direction"><strong>Graphics:</strong> $1</p>')
                    .replace(/\[Transition: (.*?)\]/g, '<p class="direction"><strong>Transition:</strong> $1</p>')
                    .replace(/^> \*\*Notes:\*\* (.*$)/gm, '<div class="note"><strong>Notes:</strong> $1</div>')
                    .split(/\n\n/)
                    .map(paragraph => paragraph.trim() ? `<p>${paragraph}</p>` : '')
                    .join('')
                }
        </body>
        </html>
      `;

            // Create a downloadable link with proper MIME type
            const blob = new Blob([htmlContent], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${script.title.replace(/\s+/g, '-').toLowerCase()}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showSuccessToast('Script exported to DOC successfully!');
            setIsExporting(false);
        } catch (error) {
            showErrorToast('Failed to export script to DOC');
            setIsExporting(false);
            console.error('Export error:', error);
        }
    };

    const exportAsPdf = () => {
        setIsExporting(true);

        try {
            // Create a proper PDF-ready HTML document
            const content = generateMarkdown();

            // Create PDF-ready HTML
            const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${script.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { font-size: 24pt; text-align: center; margin-bottom: 30px; }
            h2 { font-size: 18pt; margin-top: 24pt; border-bottom: 1px solid #cccccc; padding-bottom: 5px; }
            p { font-size: 12pt; line-height: 1.5; }
            .note { background-color: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .direction { font-style: italic; color: #555555; margin: 8px 0; }
            .camera-direction { border-left: 3px solid #3b82f6; padding-left: 10px; }
            .action-direction { border-left: 3px solid #ef4444; padding-left: 10px; }
            .graphics-direction { border-left: 3px solid #10b981; padding-left: 10px; }
            .transition-direction { border-left: 3px solid #8b5cf6; padding-left: 10px; }
          </style>
        </head>
        <body>
          <h1>${script.title}</h1>
          ${content
                    .replace(/^# .*$/gm, '') // Remove the title as we've already added it
                    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                    .replace(/\[Camera: (.*?)\]/g, '<p class="direction camera-direction"><strong>Camera:</strong> $1</p>')
                    .replace(/\[Action: (.*?)\]/g, '<p class="direction action-direction"><strong>Action:</strong> $1</p>')
                    .replace(/\[Graphics: (.*?)\]/g, '<p class="direction graphics-direction"><strong>Graphics:</strong> $1</p>')
                    .replace(/\[Transition: (.*?)\]/g, '<p class="direction transition-direction"><strong>Transition:</strong> $1</p>')
                    .replace(/^> \*\*Notes:\*\* (.*$)/gm, '<div class="note"><strong>Notes:</strong> $1</div>')
                    .split(/\n\n/)
                    .map(paragraph => paragraph.trim() ? `<p>${paragraph}</p>` : '')
                    .join('')
                }
        </body>
        </html>
      `;

            // For a proper PDF conversion, in a real application we would use html2pdf.js or a server-side solution
            // For this demo, we'll use the print to PDF functionality of the browser

            // Create a new window with our content
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showErrorToast('Please allow pop-ups to export as PDF');
                setIsExporting(false);
                return;
            }

            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Give time for resources to load then print
            setTimeout(() => {
                printWindow.print();
                printWindow.close();

                showSuccessToast('HTML version opened. Use your browser\'s print function to save as PDF');
                setIsExporting(false);
            }, 500);

        } catch (error) {
            showErrorToast('Failed to export script to PDF');
            setIsExporting(false);
            console.error('Export error:', error);
        }
    };

    const copyToClipboard = () => {
        try {
            navigator.clipboard.writeText(generateMarkdown());
            showSuccessToast('Script copied to clipboard in Markdown format');
        } catch (error) {
            showErrorToast('Failed to copy to clipboard');
            console.error('Clipboard error:', error);
        }
    };

    const markdown = generateMarkdown();

    if (!script) {
        return (
            <div className="script-preview-container">
                <div className="preview-content empty-state">
                    <span className="material-icons empty-state-icon">description</span>
                    <h3 className="empty-state-title">No script selected</h3>
                    <p className="empty-state-description">Please select a script to preview.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="script-preview-container">
            <div className="preview-header">
                <div className="preview-info">
                    <h2 className="preview-title">{script.title}</h2>
                    <div className="script-statistics">
                        <div className="stat-item">
                            <span className="material-icons">text_fields</span>
                            <span>Words: {countWords()}</span>
                        </div>
                        <div className="stat-item">
                            <span className="material-icons">schedule</span>
                            <span>Estimated Time: {calculateTotalDuration()}</span>
                        </div>
                        <div className="stat-item">
                            <span className="material-icons">segment</span>
                            <span>Sections: {script.sections.length}</span>
                        </div>
                    </div>
                </div>
                <div className="preview-tabs">
                    <button
                        className={`preview-tab ${previewMode === 'markdown' ? 'active' : ''}`}
                        onClick={() => setPreviewMode('markdown')}
                    >
                        Markdown
                    </button>
                    <button
                        className={`preview-tab ${previewMode === 'rendered' ? 'active' : ''}`}
                        onClick={() => setPreviewMode('rendered')}
                    >
                        Rendered
                    </button>
                </div>
            </div>

            <div className="preview-content">
                {previewMode === 'markdown' ? (
                    <pre className="markdown-preview">
                        {markdown}
                    </pre>
                ) : (
                    <div className="rendered-preview" dangerouslySetInnerHTML={{
                        __html: markdown
                            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                            .replace(/^> \*\*Notes:\*\* (.*$)/gm, '<div class="note-block"><strong>Notes:</strong> $1</div>')
                            .replace(/\n\n/g, '<br/><br/>')
                            .replace(/\[Camera: (.*?)\]/g, '<div class="direction-block camera-direction"><span class="material-icons">videocam</span> <strong>Camera:</strong> $1</div>')
                            .replace(/\[Action: (.*?)\]/g, '<div class="direction-block action-direction"><span class="material-icons">directions_run</span> <strong>Action:</strong> $1</div>')
                            .replace(/\[Graphics: (.*?)\]/g, '<div class="direction-block graphics-direction"><span class="material-icons">insert_photo</span> <strong>Graphics:</strong> $1</div>')
                            .replace(/\[Transition: (.*?)\]/g, '<div class="direction-block transition-direction"><span class="material-icons">animation</span> <strong>Transition:</strong> $1</div>')
                    }} />
                )}
            </div>

            <div className="preview-footer">
                <div className="preview-primary-actions">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        icon="close"
                    >
                        Close Preview
                    </Button>
                    <Button
                        variant="outline"
                        onClick={copyToClipboard}
                        icon="content_copy"
                    >
                        Copy to Clipboard
                    </Button>
                </div>
                <div className="preview-export-actions">
                    <Button
                        variant="outline"
                        onClick={exportAsDocx}
                        disabled={isExporting}
                        icon="description"
                    >
                        {isExporting ? 'Exporting...' : 'Export as DOCX'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={exportAsPdf}
                        disabled={isExporting}
                        icon="picture_as_pdf"
                    >
                        {isExporting ? 'Exporting...' : 'Export as PDF'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ScriptPreview;