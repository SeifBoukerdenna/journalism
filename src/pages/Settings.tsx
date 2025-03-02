// src/pages/Settings.tsx
import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import Modal from '../components/common/Modal';

const Settings = () => {
    const { theme, setTheme } = useAppContext();

    // Modal states
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    // Import file state
    const [importFile, setImportFile] = useState<File | null>(null);

    // Export data as JSON file
    const exportData = () => {
        const appData = {
            topics: JSON.parse(localStorage.getItem('topics') || '[]'),
            researchNotes: JSON.parse(localStorage.getItem('researchNotes') || '[]'),
            contentPlans: JSON.parse(localStorage.getItem('contentPlans') || '[]'),
            scripts: JSON.parse(localStorage.getItem('scripts') || '[]')
        };

        const dataStr = JSON.stringify(appData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `content-studio-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExportModalOpen(false);
    };

    // Import data from JSON file
    const importData = () => {
        if (!importFile) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);

                // Validate data structure
                if (data.topics && Array.isArray(data.topics)) {
                    localStorage.setItem('topics', JSON.stringify(data.topics));
                }

                if (data.researchNotes && Array.isArray(data.researchNotes)) {
                    localStorage.setItem('researchNotes', JSON.stringify(data.researchNotes));
                }

                if (data.contentPlans && Array.isArray(data.contentPlans)) {
                    localStorage.setItem('contentPlans', JSON.stringify(data.contentPlans));
                }

                if (data.scripts && Array.isArray(data.scripts)) {
                    localStorage.setItem('scripts', JSON.stringify(data.scripts));
                }

                // Force page reload to update data
                window.location.reload();
            } catch (error) {
                console.error('Error parsing import file:', error);
                alert('Error importing data. Please make sure the file is a valid JSON backup.');
            }
        };

        reader.readAsText(importFile);
        setIsImportModalOpen(false);
    };

    // Reset all data
    const resetData = () => {
        localStorage.removeItem('topics');
        localStorage.removeItem('researchNotes');
        localStorage.removeItem('contentPlans');
        localStorage.removeItem('scripts');

        // Force page reload to update data
        window.location.reload();
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Configure your application preferences</p>
            </div>

            <div className="settings-content">
                <Tabs
                    tabs={[
                        {
                            id: 'general',
                            label: 'General',
                            icon: 'settings',
                            content: (
                                <div className="settings-section">
                                    <Card title="Appearance">
                                        <div className="settings-option">
                                            <label htmlFor="theme-setting">Theme</label>
                                            <div className="theme-toggle">
                                                <button
                                                    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                                    onClick={() => setTheme('light')}
                                                >
                                                    <span className="material-icons">light_mode</span>
                                                    <span>Light</span>
                                                </button>
                                                <button
                                                    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                                    onClick={() => setTheme('dark')}
                                                >
                                                    <span className="material-icons">dark_mode</span>
                                                    <span>Dark</span>
                                                </button>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card title="Profile Information">
                                        <div className="profile-form">
                                            <div className="form-group">
                                                <label htmlFor="channel-name">Channel Name</label>
                                                <input
                                                    type="text"
                                                    id="channel-name"
                                                    placeholder="Enter your channel name"
                                                    defaultValue="My Political Channel"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="channel-description">Channel Description</label>
                                                <textarea
                                                    id="channel-description"
                                                    placeholder="Enter a brief description of your channel"
                                                    defaultValue="A channel about political and social commentary in the USA."
                                                    rows={3}
                                                />
                                            </div>

                                            <Button
                                                variant="primary"
                                                onClick={() => {/* Save profile info */ }}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            ),
                        },
                        {
                            id: 'data',
                            label: 'Data Management',
                            icon: 'storage',
                            content: (
                                <div className="settings-section">
                                    <Card title="Backup and Restore">
                                        <div className="settings-option">
                                            <div className="option-description">
                                                <h3>Export Data</h3>
                                                <p>
                                                    Save all your research topics, notes, content plans, and scripts as a JSON file.
                                                    You can use this file to restore your data later or transfer to another device.
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                icon="download"
                                                onClick={() => setIsExportModalOpen(true)}
                                            >
                                                Export Data
                                            </Button>
                                        </div>

                                        <div className="settings-divider" />

                                        <div className="settings-option">
                                            <div className="option-description">
                                                <h3>Import Data</h3>
                                                <p>
                                                    Restore your data from a previously exported JSON file.
                                                    This will replace all current data with the imported data.
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                icon="upload"
                                                onClick={() => setIsImportModalOpen(true)}
                                            >
                                                Import Data
                                            </Button>
                                        </div>

                                        <div className="settings-divider" />

                                        <div className="settings-option">
                                            <div className="option-description">
                                                <h3>Reset All Data</h3>
                                                <p>
                                                    Delete all your data and start fresh.
                                                    This action cannot be undone, so make sure to export your data first if needed.
                                                </p>
                                            </div>
                                            <Button
                                                variant="danger"
                                                icon="delete_forever"
                                                onClick={() => setIsResetModalOpen(true)}
                                            >
                                                Reset Data
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            ),
                        },
                        {
                            id: 'preferences',
                            label: 'Preferences',
                            icon: 'tune',
                            content: (
                                <div className="settings-section">
                                    <Card title="Content Preferences">
                                        <div className="settings-option">
                                            <label htmlFor="default-status">Default Content Status</label>
                                            <select id="default-status" defaultValue="idea">
                                                <option value="idea">Idea</option>
                                                <option value="planning">Planning</option>
                                                <option value="research">Research</option>
                                                <option value="scripting">Scripting</option>
                                            </select>
                                        </div>

                                        <div className="settings-option">
                                            <label>Publishing Reminders</label>
                                            <div className="checkbox-group">
                                                <div className="checkbox-option">
                                                    <input type="checkbox" id="remind-1-day" defaultChecked />
                                                    <label htmlFor="remind-1-day">1 day before scheduled date</label>
                                                </div>
                                                <div className="checkbox-option">
                                                    <input type="checkbox" id="remind-3-days" defaultChecked />
                                                    <label htmlFor="remind-3-days">3 days before scheduled date</label>
                                                </div>
                                                <div className="checkbox-option">
                                                    <input type="checkbox" id="remind-7-days" />
                                                    <label htmlFor="remind-7-days">7 days before scheduled date</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="settings-option">
                                            <label htmlFor="word-count-goal">Word Count Goal (per video)</label>
                                            <input
                                                type="number"
                                                id="word-count-goal"
                                                defaultValue="1500"
                                                min="100"
                                                step="100"
                                            />
                                        </div>

                                        <Button
                                            variant="primary"
                                            onClick={() => {/* Save preferences */ }}
                                        >
                                            Save Preferences
                                        </Button>
                                    </Card>

                                    <Card title="Script Editor Preferences">
                                        <div className="settings-option">
                                            <label htmlFor="auto-save">Auto-Save Interval (seconds)</label>
                                            <input
                                                type="number"
                                                id="auto-save"
                                                defaultValue="30"
                                                min="10"
                                                max="300"
                                            />
                                        </div>

                                        <div className="settings-option">
                                            <label>Editor Features</label>
                                            <div className="checkbox-group">
                                                <div className="checkbox-option">
                                                    <input type="checkbox" id="spell-check" defaultChecked />
                                                    <label htmlFor="spell-check">Spell checking</label>
                                                </div>
                                                <div className="checkbox-option">
                                                    <input type="checkbox" id="auto-complete" defaultChecked />
                                                    <label htmlFor="auto-complete">Auto-complete</label>
                                                </div>
                                                <div className="checkbox-option">
                                                    <input type="checkbox" id="word-count" defaultChecked />
                                                    <label htmlFor="word-count">Show word count</label>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="primary"
                                            onClick={() => {/* Save editor preferences */ }}
                                        >
                                            Save Preferences
                                        </Button>
                                    </Card>
                                </div>
                            ),
                        },
                        {
                            id: 'social',
                            label: 'Social Integration',
                            icon: 'share',
                            content: (
                                <div className="settings-section">
                                    <Card title="YouTube Integration">
                                        <div className="connection-status not-connected">
                                            <div className="status-icon">
                                                <span className="material-icons">link_off</span>
                                            </div>
                                            <div className="status-info">
                                                <h3>Not Connected</h3>
                                                <p>Connect your YouTube account to enable direct publishing and analytics integration.</p>
                                            </div>
                                            <Button
                                                variant="primary"
                                                icon="link"
                                                onClick={() => {/* Open YouTube auth */ }}
                                            >
                                                Connect Account
                                            </Button>
                                        </div>
                                    </Card>

                                    <Card title="Twitter/X Integration">
                                        <div className="connection-status not-connected">
                                            <div className="status-icon">
                                                <span className="material-icons">link_off</span>
                                            </div>
                                            <div className="status-info">
                                                <h3>Not Connected</h3>
                                                <p>Connect your Twitter/X account to share your content automatically.</p>
                                            </div>
                                            <Button
                                                variant="primary"
                                                icon="link"
                                                onClick={() => {/* Open Twitter auth */ }}
                                            >
                                                Connect Account
                                            </Button>
                                        </div>
                                    </Card>

                                    <Card title="Other Platforms">
                                        <div className="platform-list">
                                            <div className="platform-item">
                                                <span className="platform-icon">
                                                    <span className="material-icons">podcasts</span>
                                                </span>
                                                <span className="platform-name">Spotify</span>
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={() => {/* Open Spotify auth */ }}
                                                >
                                                    Connect
                                                </Button>
                                            </div>

                                            <div className="platform-item">
                                                <span className="platform-icon">
                                                    <span className="material-icons">rss_feed</span>
                                                </span>
                                                <span className="platform-name">RSS Feed</span>
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={() => {/* Configure RSS */ }}
                                                >
                                                    Configure
                                                </Button>
                                            </div>

                                            <div className="platform-item">
                                                <span className="platform-icon">
                                                    <span className="material-icons">article</span>
                                                </span>
                                                <span className="platform-name">Medium</span>
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={() => {/* Open Medium auth */ }}
                                                >
                                                    Connect
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ),
                        },
                        {
                            id: 'about',
                            label: 'About',
                            icon: 'info',
                            content: (
                                <div className="settings-section">
                                    <Card title="About Content Studio">
                                        <div className="about-content">
                                            <div className="app-info">
                                                <h2>Content Studio</h2>
                                                <p className="app-version">Version 1.0.0</p>
                                                <p className="app-description">
                                                    A comprehensive tool for political and social content creators.
                                                    Plan, research, script, and manage your video content in one place.
                                                </p>
                                            </div>

                                            <div className="app-features">
                                                <h3>Features</h3>
                                                <ul>
                                                    <li>Research Hub for organizing topics and notes</li>
                                                    <li>Content Planner with Kanban and Calendar views</li>
                                                    <li>Script Editor with section management</li>
                                                    <li>Real-time word count and duration estimation</li>
                                                    <li>Data backup and restore</li>
                                                </ul>
                                            </div>

                                            <div className="credits">
                                                <h3>Created with ❤️ for your channel</h3>
                                                <p>Built using React, TypeScript, and Vite</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>

            {/* Export Data Modal */}
            <Modal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                title="Export Data"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setIsExportModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={exportData}
                        >
                            Export
                        </Button>
                    </>
                }
            >
                <div className="modal-content">
                    <p>
                        You're about to export all your data, including:
                    </p>
                    <ul>
                        <li>Research topics and notes</li>
                        <li>Content plans and schedules</li>
                        <li>Scripts and sections</li>
                    </ul>
                    <p>
                        The data will be saved as a JSON file that you can use for backup or transfer to another device.
                    </p>
                </div>
            </Modal>

            {/* Import Data Modal */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Import Data"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setIsImportModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={importData}
                            disabled={!importFile}
                        >
                            Import
                        </Button>
                    </>
                }
            >
                <div className="modal-content">
                    <p>
                        Importing data will replace all your current data. Make sure to backup your current data first if needed.
                    </p>
                    <div className="import-file-input">
                        <label htmlFor="import-file">Select Backup File (JSON)</label>
                        <input
                            type="file"
                            id="import-file"
                            accept=".json"
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        />
                    </div>
                    {importFile && (
                        <div className="file-selected">
                            <span className="material-icons">check_circle</span>
                            <span>File selected: {importFile.name}</span>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Reset Data Modal */}
            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Reset All Data"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setIsResetModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={resetData}
                        >
                            Reset All Data
                        </Button>
                    </>
                }
            >
                <div className="modal-content danger-modal">
                    <div className="warning-icon">
                        <span className="material-icons">warning</span>
                    </div>
                    <h3>Warning: This action cannot be undone</h3>
                    <p>
                        You are about to delete all your data, including:
                    </p>
                    <ul>
                        <li>All research topics and notes</li>
                        <li>All content plans and schedules</li>
                        <li>All scripts and script sections</li>
                    </ul>
                    <p className="warning-text">
                        We recommend exporting your data before proceeding with the reset.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;