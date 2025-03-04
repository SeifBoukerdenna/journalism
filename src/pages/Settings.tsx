// src/pages/Settings.tsx
import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import Modal from '../components/common/Modal';
import { useModals } from '../hooks/useModal';
import { showSuccessToast, showErrorToast } from '../utils/toastService';
import { collection, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/firebaseService';
import { initializeFirebaseData } from '../firebase/initializeFirebaseData';

const Settings = () => {
    const { theme, setTheme } = useAppContext();

    // Modal states using useModals hook
    const {
        isModalOpen,
        openModal,
        closeModal
    } = useModals();

    // Import file state
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    // Export data as JSON file
    const exportData = async () => {
        try {
            // Fetch all data from Firebase
            const [topics, researchNotes, contentPlans, scripts] = await Promise.all([
                getDocs(collection(db, COLLECTIONS.TOPICS)),
                getDocs(collection(db, COLLECTIONS.RESEARCH_NOTES)),
                getDocs(collection(db, COLLECTIONS.CONTENT_PLANS)),
                getDocs(collection(db, COLLECTIONS.SCRIPTS))
            ]);

            // Convert to arrays of data
            const appData = {
                topics: topics.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                researchNotes: researchNotes.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                contentPlans: contentPlans.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                scripts: scripts.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            };

            // Convert Firestore timestamps to ISO strings
            const processData = (obj: any) => {
                const result = { ...obj };
                Object.keys(result).forEach(key => {
                    // Check if it's a Firestore timestamp
                    if (result[key] && typeof result[key].toDate === 'function') {
                        result[key] = result[key].toDate().toISOString();
                    } else if (typeof result[key] === 'object' && result[key] !== null) {
                        // Process nested objects or arrays
                        result[key] = processData(result[key]);
                    }
                });
                return result;
            };

            const processedData = processData(appData);
            const dataStr = JSON.stringify(processedData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `content-studio-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            closeModal('export');
            showSuccessToast('Data successfully exported');
        } catch (error) {
            showErrorToast('Error exporting data');
            console.error('Error exporting data:', error);
        }
    };

    // Function to delete all documents in a collection
    const deleteCollection = async (collectionPath: string) => {
        const querySnapshot = await getDocs(collection(db, collectionPath));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    };

    // Reset all data in Firebase and reinitialize with sample data
    const resetData = async () => {
        setIsResetting(true);
        try {
            // Delete all documents from all collections
            await Promise.all([
                deleteCollection(COLLECTIONS.TOPICS),
                deleteCollection(COLLECTIONS.RESEARCH_NOTES),
                deleteCollection(COLLECTIONS.CONTENT_PLANS),
                deleteCollection(COLLECTIONS.SCRIPTS)
            ]);

            // Reinitialize with sample data
            await initializeFirebaseData();

            showSuccessToast('All data has been reset to defaults');
            // Force page reload to update data in the app
            window.location.reload();
        } catch (error) {
            showErrorToast('Error resetting data');
            console.error('Error resetting data:', error);
        } finally {
            setIsResetting(false);
            closeModal('reset');
        }
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
                                                onClick={() => {
                                                    showSuccessToast('Profile information saved');
                                                }}
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
                                                onClick={() => openModal('export')}
                                            >
                                                Export Data
                                            </Button>
                                        </div>

                                        <div className="settings-divider" />

                                        <div className="settings-option">
                                            <div className="option-description">
                                                <h3>Reset to Demo Data</h3>
                                                <p>
                                                    Reset all data to the default demo content.
                                                    This will delete all your current content and replace it with the sample data.
                                                    This action cannot be undone, so make sure to export your data first if needed.
                                                </p>
                                            </div>
                                            <Button
                                                variant="danger"
                                                icon="restart_alt"
                                                onClick={() => openModal('reset')}
                                            >
                                                Reset to Demo Data
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
                                            onClick={() => {
                                                showSuccessToast('Preferences saved');
                                            }}
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
                                            onClick={() => {
                                                showSuccessToast('Editor preferences saved');
                                            }}
                                        >
                                            Save Preferences
                                        </Button>
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
                                                    <li>Cloud storage with Firebase</li>
                                                    <li>Data backup and restore</li>
                                                </ul>
                                            </div>

                                            <div className="credits">
                                                <h3>Created with ❤️ for your channel</h3>
                                                <p>Built using React, TypeScript, Vite, and Firebase</p>
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
                isOpen={isModalOpen('export')}
                onClose={() => closeModal('export')}
                title="Export Data"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => closeModal('export')}
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
                        You're about to export all your data from Firebase, including:
                    </p>
                    <ul>
                        <li>Research topics and notes</li>
                        <li>Content plans and schedules</li>
                        <li>Scripts and sections</li>
                    </ul>
                    <p>
                        The data will be saved as a JSON file that you can use for backup purposes.
                    </p>
                </div>
            </Modal>

            {/* Reset Data Modal */}
            <Modal
                isOpen={isModalOpen('reset')}
                onClose={() => closeModal('reset')}
                title="Reset to Demo Data"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => closeModal('reset')}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={resetData}
                            disabled={isResetting}
                        >
                            {isResetting ? 'Resetting...' : 'Reset All Data'}
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
                        You are about to delete all your current data from Firebase and restore the default demo content, including:
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