// src/pages/ResearchHub.tsx
import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { useModal } from '../hooks/useModal';
import { showErrorToast } from '../utils/toastService';
import * as firebaseService from '../firebase/firebaseService';

interface TopicFormData {
    title: string;
    description: string;
    tags: string[];
    isFavorite?: boolean;
}

interface ResearchNoteFormData {
    title: string;
    content: string;
    topicId: string;
    sources: string[];
}

const ResearchHub = () => {
    const {
        topics,
        researchNotes,
        addTopic,
        updateTopic,
        deleteTopic,
        addResearchNote,
        updateResearchNote,
        deleteResearchNote,
        searchQuery,
        favoriteTopics,
        addToFavorites,
        removeFromFavorites
    } = useAppContext();

    // State for modals
    const {
        isOpen: isTopicModalOpen,
        openModal: openTopicModal,
        closeModal: closeTopicModal
    } = useModal(false);

    const {
        isOpen: isNoteModalOpen,
        openModal: openNoteModal,
        closeModal: closeNoteModal
    } = useModal(false);

    // State for deletion confirmation
    const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
    const [showTopicDeleteConfirm, setShowTopicDeleteConfirm] = useState(false);
    const [showNoteDeleteConfirm, setShowNoteDeleteConfirm] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isSaving, setIsSaving] = useState(false);

    // Form data
    const [topicFormData, setTopicFormData] = useState<TopicFormData>({
        title: '',
        description: '',
        tags: [],
        isFavorite: false
    });

    const [noteFormData, setNoteFormData] = useState<ResearchNoteFormData>({
        title: '',
        content: '',
        topicId: '',
        sources: ['']
    });

    // Get filtered topics based on current filter
    const getFilteredTopics = () => {
        let filtered = topics;

        // First apply search query filter
        if (searchQuery) {
            filtered = filtered.filter(topic => {
                return (
                    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (topic.description && topic.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                );
            });
        }

        // Then apply selected filter
        if (activeFilter === 'favorite') {
            filtered = filtered.filter(topic => favoriteTopics.includes(topic.id));
        } else if (activeFilter === 'recent') {
            // Sort by updatedAt in descending order and take the top 5
            return [...filtered].sort((a, b) => {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }).slice(0, 5);
        }

        return filtered;
    };

    const filteredTopics = getFilteredTopics();

    // Filtered notes based on selected topic and search query
    const filteredNotes = researchNotes.filter(note => {
        const matchesSearch = !searchQuery ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTopic = !selectedTopic || note.topicId === selectedTopic;

        return matchesSearch && matchesTopic;
    });

    // Toggle a topic as favorite
    const toggleFavorite = async (topicId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the topic selection

        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        try {
            if (favoriteTopics.includes(topicId)) {
                // Update in Firebase first
                await firebaseService.updateTopic(topicId, { isFavorite: false });
                // Then update local state
                removeFromFavorites(topicId);
            } else {
                // Update in Firebase first
                await firebaseService.updateTopic(topicId, { isFavorite: true });
                // Then update local state
                addToFavorites(topicId);
            }
        } catch (error) {
            console.error("Error updating favorite status in database:", error);
            showErrorToast("Failed to update favorite status");
        }
    };

    // Reset form data when modals close
    useEffect(() => {
        if (!isTopicModalOpen) {
            setTopicFormData({
                title: '',
                description: '',
                tags: [],
                isFavorite: false
            });
        }
    }, [isTopicModalOpen]);

    useEffect(() => {
        if (!isNoteModalOpen) {
            setNoteFormData({
                title: '',
                content: '',
                topicId: selectedTopic || '',
                sources: ['']
            });
        }
    }, [isNoteModalOpen, selectedTopic]);

    // Load topic or note data when editing
    useEffect(() => {
        if (selectedTopic && isTopicModalOpen) {
            const topic = topics.find(t => t.id === selectedTopic);
            if (topic) {
                setTopicFormData({
                    title: topic.title,
                    description: topic.description || '',
                    tags: [...topic.tags],
                    isFavorite: favoriteTopics.includes(topic.id)
                });
            }
        }
    }, [selectedTopic, isTopicModalOpen, topics, favoriteTopics]);

    useEffect(() => {
        if (selectedNote && isNoteModalOpen) {
            const note = researchNotes.find(n => n.id === selectedNote);
            if (note) {
                setNoteFormData({
                    title: note.title,
                    content: note.content,
                    topicId: note.topicId,
                    sources: note.sources.length ? [...note.sources] : ['']
                });
            }
        }
    }, [selectedNote, isNoteModalOpen, researchNotes]);

    // Handle form submissions
    const handleTopicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (selectedTopic) {
                // Update in Firebase first
                await updateTopic(selectedTopic, topicFormData);

                // Handle favorite status separately for better synchronization
                if (topicFormData.isFavorite && !favoriteTopics.includes(selectedTopic)) {
                    addToFavorites(selectedTopic);
                    await firebaseService.saveFavoriteTopics([...favoriteTopics, selectedTopic]);
                } else if (!topicFormData.isFavorite && favoriteTopics.includes(selectedTopic)) {
                    removeFromFavorites(selectedTopic);
                    await firebaseService.saveFavoriteTopics(favoriteTopics.filter(id => id !== selectedTopic));
                }
            } else {
                // Create new topic in Firebase
                const newTopic = await addTopic({
                    ...topicFormData,
                    tags: topicFormData.tags
                });

                // If the new topic should be a favorite, update favorites in Firebase
                if (topicFormData.isFavorite && newTopic && newTopic.id) {
                    addToFavorites(newTopic.id);
                    await firebaseService.saveFavoriteTopics([...favoriteTopics, newTopic.id]);
                }
            }

            closeTopicModal();
            setSelectedTopic(null);
        } catch (error) {
            showErrorToast('Error saving topic');
            console.error('Error saving topic:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const cleanedSources = noteFormData.sources.filter(source => source.trim() !== '');

            if (selectedNote) {
                // Update in Firebase
                await updateResearchNote(selectedNote, {
                    ...noteFormData,
                    sources: cleanedSources
                });
            } else {
                // Create in Firebase
                await addResearchNote({
                    ...noteFormData,
                    sources: cleanedSources
                });
            }

            closeNoteModal();
            setSelectedNote(null);
        } catch (error) {
            showErrorToast('Error saving research note');
            console.error('Error saving research note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Function to handle tag input in the topic form
    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const inputValue = (e.target as HTMLInputElement).value.trim();
            if (inputValue && !topicFormData.tags.includes(inputValue)) {
                setTopicFormData({
                    ...topicFormData,
                    tags: [...topicFormData.tags, inputValue]
                });
                (e.target as HTMLInputElement).value = '';
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTopicFormData({
            ...topicFormData,
            tags: topicFormData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    // Function to add a new source input field
    const addSourceField = () => {
        setNoteFormData({
            ...noteFormData,
            sources: [...noteFormData.sources, '']
        });
    };

    // Function to update a source input value
    const updateSourceField = (index: number, value: string) => {
        const updatedSources = [...noteFormData.sources];
        updatedSources[index] = value;
        setNoteFormData({
            ...noteFormData,
            sources: updatedSources
        });
    };

    // Function to remove a source input field
    const removeSourceField = (index: number) => {
        if (noteFormData.sources.length > 1) {
            const updatedSources = [...noteFormData.sources];
            updatedSources.splice(index, 1);
            setNoteFormData({
                ...noteFormData,
                sources: updatedSources
            });
        }
    };

    // Open edit modal for a topic
    const openEditTopic = (topicId: string) => {
        setSelectedTopic(topicId);
        openTopicModal();
    };

    // Open edit modal for a note
    const openEditNote = (noteId: string) => {
        setSelectedNote(noteId);
        openNoteModal();
    };

    // Show delete confirmation dialog for topic
    const promptDeleteTopic = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTopicToDelete(id);
        setShowTopicDeleteConfirm(true);
    };

    // Show delete confirmation dialog for note
    const promptDeleteNote = (id: string) => {
        setNoteToDelete(id);
        setShowNoteDeleteConfirm(true);
    };

    // Handle actual topic deletion after confirmation
    const handleDeleteTopic = async () => {
        if (!topicToDelete) return;

        try {
            // Delete topic from Firebase and related notes
            await deleteTopic(topicToDelete);

            // If the deleted topic was selected, clear selection
            if (selectedTopic === topicToDelete) {
                setSelectedTopic(null);
            }

            setShowTopicDeleteConfirm(false);
            setTopicToDelete(null);
        } catch (error) {
            showErrorToast('Error deleting topic');
            console.error('Error deleting topic:', error);
        }
    };

    // Handle actual note deletion after confirmation
    const handleDeleteNote = async () => {
        if (!noteToDelete) return;

        try {
            // Delete note from Firebase
            await deleteResearchNote(noteToDelete);
            setShowNoteDeleteConfirm(false);
            setNoteToDelete(null);
        } catch (error) {
            showErrorToast('Error deleting note');
            console.error('Error deleting note:', error);
        }
    };

    // Format date to display in a readable format
    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="research-hub-container">
            <div className="research-header">
                <div className="research-title">
                    <h1>Research Hub</h1>
                    <p>Organize and manage your research materials</p>
                </div>

                <div className="research-actions">
                    <div className="view-toggle">
                        <button
                            className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid view"
                        >
                            <span className="material-icons">grid_view</span>
                        </button>
                        <button
                            className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            aria-label="List view"
                        >
                            <span className="material-icons">view_list</span>
                        </button>
                    </div>

                    <Button
                        variant="outline"
                        icon="bookmark_add"
                        onClick={() => {
                            setSelectedNote(null);
                            openNoteModal();
                        }}
                    >
                        Add Note
                    </Button>

                    <Button
                        variant="primary"
                        icon="add"
                        onClick={() => {
                            setSelectedTopic(null);
                            openTopicModal();
                        }}
                    >
                        New Topic
                    </Button>
                </div>
            </div>

            <div className="research-content">
                <div className="topics-sidebar">
                    <Card title="Topics">
                        <div className="topics-filter">
                            <button
                                className={`topic-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveFilter('all');
                                    setSelectedTopic(null);
                                }}
                            >
                                All Topics
                            </button>
                            <button
                                className={`topic-filter-btn ${activeFilter === 'recent' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveFilter('recent');
                                    setSelectedTopic(null);
                                }}
                            >
                                Recent
                            </button>
                            <button
                                className={`topic-filter-btn ${activeFilter === 'favorite' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveFilter('favorite');
                                    setSelectedTopic(null);
                                }}
                            >
                                Favorites
                            </button>
                        </div>

                        <div className="topics-list">
                            {filteredTopics.length > 0 ? (
                                filteredTopics.map(topic => (
                                    <div
                                        key={topic.id}
                                        className={`topic-item ${selectedTopic === topic.id ? 'active' : ''}`}
                                        onClick={() => setSelectedTopic(topic.id)}
                                    >
                                        <div className="topic-info">
                                            <h3>{topic.title}</h3>
                                            <div className="topic-tags">
                                                {topic.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="topic-tag">{tag}</span>
                                                ))}
                                                {topic.tags.length > 3 && <span className="more-tags">+{topic.tags.length - 3}</span>}
                                            </div>
                                        </div>
                                        <div className="topic-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => toggleFavorite(topic.id, e)}
                                                aria-label={favoriteTopics.includes(topic.id) ? "Remove from favorites" : "Add to favorites"}
                                            >
                                                <span className={`material-icons topic-favorite-icon ${favoriteTopics.includes(topic.id) ? 'topic-favorite-star active' : ''}`}>
                                                    {favoriteTopics.includes(topic.id) ? 'star' : 'star_border'}
                                                </span>
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditTopic(topic.id);
                                                }}
                                                aria-label="Edit topic"
                                            >
                                                <span className="material-icons">edit</span>
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => promptDeleteTopic(topic.id, e)}
                                                aria-label="Delete topic"
                                            >
                                                <span className="material-icons">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState
                                    title={activeFilter === 'favorite' ? "No favorite topics" :
                                        activeFilter === 'recent' ? "No recent topics" :
                                            "No topics found"}
                                    description={activeFilter === 'favorite' ? "Star topics to add them to your favorites." :
                                        activeFilter === 'recent' ? "Recently updated topics will appear here." :
                                            "Create your first research topic to get started."}
                                    icon={activeFilter === 'favorite' ? "star_border" :
                                        activeFilter === 'recent' ? "history" :
                                            "topic"}
                                    action={{
                                        label: "New Topic",
                                        onClick: () => openTopicModal()
                                    }}
                                />
                            )}
                        </div>
                    </Card>
                </div>

                <div className="notes-container">
                    <Card
                        title={selectedTopic
                            ? topics.find(t => t.id === selectedTopic)?.title || 'Research Notes'
                            : activeFilter === 'favorite' ? 'Favorite Topics Notes' :
                                activeFilter === 'recent' ? 'Recent Topics Notes' :
                                    'All Research Notes'
                        }
                        actionIcon={selectedTopic ? 'edit' : undefined}
                        onAction={selectedTopic ? () => openEditTopic(selectedTopic) : undefined}
                    >
                        {filteredNotes.length > 0 ? (
                            <div className={`notes-grid ${viewMode}`}>
                                {filteredNotes.map(note => (
                                    <div key={note.id} className="note-card">
                                        <div className="note-header">
                                            <h3>{note.title}</h3>
                                            <div className="note-actions">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => openEditNote(note.id)}
                                                    aria-label="Edit note"
                                                >
                                                    <span className="material-icons">edit</span>
                                                </button>
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => promptDeleteNote(note.id)}
                                                    aria-label="Delete note"
                                                >
                                                    <span className="material-icons">delete</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="note-content">
                                            <p>{note.content.length > 200
                                                ? `${note.content.substring(0, 200)}...`
                                                : note.content}
                                            </p>
                                        </div>

                                        <div className="note-footer">
                                            <div className="note-topic">
                                                {topics.find(t => t.id === note.topicId)?.title}
                                            </div>
                                            <div className="note-date">
                                                {formatDate(note.updatedAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No notes found"
                                description={selectedTopic
                                    ? "Add your first note to this topic."
                                    : "Start by adding research notes to your topics."
                                }
                                icon="note_add"
                                action={{
                                    label: "Add Note",
                                    onClick: () => openNoteModal()
                                }}
                            />
                        )}
                    </Card>
                </div>
            </div>

            {/* New/Edit Topic Modal */}
            <Modal
                isOpen={isTopicModalOpen}
                onClose={() => {
                    closeTopicModal();
                    setSelectedTopic(null);
                }}
                title={selectedTopic ? "Edit Topic" : "New Research Topic"}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                closeTopicModal();
                                setSelectedTopic(null);
                            }}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleTopicSubmit}
                            disabled={!topicFormData.title || isSaving}
                        >
                            {isSaving ? "Saving..." : selectedTopic ? "Update" : "Create"}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleTopicSubmit} className="topic-form">
                    <div className="form-group">
                        <label htmlFor="topic-title">Title</label>
                        <input
                            type="text"
                            id="topic-title"
                            value={topicFormData.title}
                            onChange={(e) => setTopicFormData({ ...topicFormData, title: e.target.value })}
                            placeholder="Enter topic title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="topic-description">Description</label>
                        <textarea
                            id="topic-description"
                            value={topicFormData.description}
                            onChange={(e) => setTopicFormData({ ...topicFormData, description: e.target.value })}
                            placeholder="Enter topic description"
                            rows={4}
                        />
                    </div>

                    <div className="form-group">
                        <div className="checkbox-option">
                            <input
                                type="checkbox"
                                id="topic-favorite"
                                checked={topicFormData.isFavorite}
                                onChange={(e) => setTopicFormData({ ...topicFormData, isFavorite: e.target.checked })}
                            />
                            <label htmlFor="topic-favorite">Mark as favorite</label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="topic-tags">Tags</label>
                        <div className="tags-input-container">
                            <div className="tags-list">
                                {topicFormData.tags.map(tag => (
                                    <div key={tag} className="tag-item">
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            aria-label="Remove tag"
                                        >
                                            <span className="material-icons">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <input
                                type="text"
                                id="topic-tags"
                                placeholder="Add tags (press Enter or comma)"
                                onKeyDown={handleTagInput}
                            />
                        </div>
                        <small>Press Enter or comma to add a tag</small>
                    </div>
                </form>
            </Modal>

            {/* New/Edit Note Modal */}
            <Modal
                isOpen={isNoteModalOpen}
                onClose={() => {
                    closeNoteModal();
                    setSelectedNote(null);
                }}
                title={selectedNote ? "Edit Research Note" : "New Research Note"}
                size="large"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                closeNoteModal();
                                setSelectedNote(null);
                            }}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleNoteSubmit}
                            disabled={!noteFormData.title || !noteFormData.topicId || isSaving}
                        >
                            {isSaving ? "Saving..." : selectedNote ? "Update" : "Save"}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleNoteSubmit} className="note-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="note-title">Title</label>
                            <input
                                type="text"
                                id="note-title"
                                value={noteFormData.title}
                                onChange={(e) => setNoteFormData({ ...noteFormData, title: e.target.value })}
                                placeholder="Enter note title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="note-topic">Topic</label>
                            <select
                                id="note-topic"
                                value={noteFormData.topicId}
                                onChange={(e) => setNoteFormData({ ...noteFormData, topicId: e.target.value })}
                                required
                            >
                                <option value="">Select a topic</option>
                                {topics.map(topic => (
                                    <option key={topic.id} value={topic.id}>
                                        {topic.title}
                                    </option>
                                ))}
                            </select>
                            {topics.length === 0 && (
                                <small className="form-hint">
                                    No topics available.
                                    <button
                                        type="button"
                                        className="btn-link"
                                        onClick={() => {
                                            closeNoteModal();
                                            openTopicModal();
                                        }}
                                    >
                                        Create a topic first
                                    </button>
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="note-content">Content</label>
                        <textarea
                            id="note-content"
                            value={noteFormData.content}
                            onChange={(e) => setNoteFormData({ ...noteFormData, content: e.target.value })}
                            placeholder="Enter your research notes here..."
                            rows={10}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Sources</label>
                        <div className="sources-list">
                            {noteFormData.sources.map((source, index) => (
                                <div key={index} className="source-input-group">
                                    <input
                                        type="text"
                                        value={source}
                                        onChange={(e) => updateSourceField(index, e.target.value)}
                                        placeholder="Enter source URL or reference"
                                    />
                                    <div className="source-actions">
                                        <button
                                            type="button"
                                            className="btn-icon"
                                            onClick={() => removeSourceField(index)}
                                            disabled={noteFormData.sources.length <= 1}
                                            aria-label="Remove source"
                                        >
                                            <span className="material-icons">remove_circle</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                className="btn-text source-add-btn"
                                onClick={addSourceField}
                            >
                                <span className="material-icons">add_circle</span>
                                <span>Add Source</span>
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Delete Topic Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showTopicDeleteConfirm}
                onClose={() => {
                    setShowTopicDeleteConfirm(false);
                    setTopicToDelete(null);
                }}
                onConfirm={handleDeleteTopic}
                title="Delete Topic"
                message="Are you sure you want to delete this topic? All related notes will also be deleted. This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* Delete Note Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showNoteDeleteConfirm}
                onClose={() => {
                    setShowNoteDeleteConfirm(false);
                    setNoteToDelete(null);
                }}
                onConfirm={handleDeleteNote}
                title="Delete Research Note"
                message="Are you sure you want to delete this research note? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default ResearchHub;