/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ContentPlanner.tsx
import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { useModal } from '../hooks/useModal';
import { showSuccessToast, showErrorToast } from '../utils/toastService';

interface ContentFormData {
    title: string;
    description: string;
    scheduledDate?: string;
    topics: string[];
    status: 'idea' | 'planning' | 'research' | 'scripting' | 'recording' | 'editing' | 'published';
}

const ContentPlanner = () => {
    const {
        contentPlans,
        topics,
        addContentPlan,
        updateContentPlan,
        deleteContentPlan,
        searchQuery
    } = useAppContext();

    // State for modals and content management
    const {
        isOpen: isContentModalOpen,
        openModal: openContentModal,
        closeModal: closeContentModal
    } = useModal(false);
    const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'kanban' | 'list'>('kanban');

    // Form data for content plan
    const [contentFormData, setContentFormData] = useState<ContentFormData>({
        title: '',
        description: '',
        scheduledDate: '',
        topics: [],
        status: 'idea'
    });

    // Reset form data when modal closes
    useEffect(() => {
        if (!isContentModalOpen) {
            setContentFormData({
                title: '',
                description: '',
                scheduledDate: '',
                topics: [],
                status: 'idea'
            });
        }
    }, [isContentModalOpen]);

    // Load content data when editing
    useEffect(() => {
        if (selectedContentId && isContentModalOpen) {
            const content = contentPlans.find(c => c.id === selectedContentId);
            if (content) {
                const scheduledDateString = content.scheduledDate
                    ? new Date(content.scheduledDate).toISOString().split('T')[0]
                    : '';

                setContentFormData({
                    title: content.title,
                    description: content.description,
                    scheduledDate: scheduledDateString,
                    topics: [...content.topics],
                    status: content.status
                });
            }
        }
    }, [selectedContentId, isContentModalOpen, contentPlans]);

    // Filtered content plans based on search query
    const filteredContentPlans = contentPlans.filter(plan => {
        if (!searchQuery) return true;
        return (
            plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plan.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    // Group content plans by status for Kanban view
    const contentByStatus = {
        idea: filteredContentPlans.filter(plan => plan.status === 'idea'),
        planning: filteredContentPlans.filter(plan => plan.status === 'planning'),
        research: filteredContentPlans.filter(plan => plan.status === 'research'),
        scripting: filteredContentPlans.filter(plan => plan.status === 'scripting'),
        recording: filteredContentPlans.filter(plan => plan.status === 'recording'),
        editing: filteredContentPlans.filter(plan => plan.status === 'editing'),
        published: filteredContentPlans.filter(plan => plan.status === 'published')
    };

    // Sort content plans by scheduled date for calendar/list view
    const sortedContentPlans = [...filteredContentPlans].sort((a, b) => {
        // Put items without scheduled date at the end
        if (!a.scheduledDate && !b.scheduledDate) return 0;
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;

        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });

    // Group content plans by month and week for calendar view
    const groupedByMonth = sortedContentPlans.reduce((acc, plan) => {
        if (!plan.scheduledDate) return acc;

        const date = new Date(plan.scheduledDate);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }

        acc[monthYear].push(plan);
        return acc;
    }, {} as Record<string, typeof contentPlans>);

    // Handle form submission
    const handleContentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const formattedData = {
                ...contentFormData,
                scheduledDate: contentFormData.scheduledDate
                    ? new Date(contentFormData.scheduledDate)
                    : undefined
            };

            if (selectedContentId) {
                updateContentPlan(selectedContentId, formattedData);
                showSuccessToast('Content plan updated successfully');
            } else {
                addContentPlan(formattedData);
                showSuccessToast('Content plan created successfully');
            }

            closeContentModal();
            setSelectedContentId(null);
        } catch (error) {
            showErrorToast('Error saving content plan');
            console.error('Error saving content plan:', error);
        }
    };

    // Function to handle topic selection in the content form
    const handleTopicToggle = (topicId: string) => {
        if (contentFormData.topics.includes(topicId)) {
            setContentFormData({
                ...contentFormData,
                topics: contentFormData.topics.filter(id => id !== topicId)
            });
        } else {
            setContentFormData({
                ...contentFormData,
                topics: [...contentFormData.topics, topicId]
            });
        }
    };

    // Open edit modal for content
    const openEditContent = (contentId: string) => {
        setSelectedContentId(contentId);
        openContentModal();
    };

    // Function to move content between status columns in Kanban view
    const moveContent = (contentId: string, newStatus: ContentFormData['status']) => {
        try {
            updateContentPlan(contentId, { status: newStatus });
            showSuccessToast(`Content moved to ${getStatusInfo(newStatus).label}`);
        } catch (error) {
            showErrorToast('Error moving content');
            console.error('Error moving content:', error);
        }
    };

    // Confirm delete content plan
    const confirmDeleteContentPlan = (id: string) => {
        if (window.confirm('Are you sure you want to delete this content plan?')) {
            try {
                deleteContentPlan(id);
                showSuccessToast('Content plan deleted');
            } catch (error) {
                showErrorToast('Error deleting content plan');
                console.error('Error deleting content plan:', error);
            }
        }
    };

    // Format date for display
    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get status info (label and color)
    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { label: string, color: string }> = {
            'idea': { label: 'Idea', color: 'status-gray' },
            'planning': { label: 'Planning', color: 'status-blue' },
            'research': { label: 'Research', color: 'status-purple' },
            'scripting': { label: 'Scripting', color: 'status-orange' },
            'recording': { label: 'Recording', color: 'status-yellow' },
            'editing': { label: 'Editing', color: 'status-teal' },
            'published': { label: 'Published', color: 'status-green' }
        };

        return statusMap[status] || { label: status, color: 'status-gray' };
    };

    return (
        <div className="content-planner-container">
            <div className="planner-header">
                <div className="planner-title">
                    <h1>Content Planner</h1>
                    <p>Plan, schedule, and track your content creation process</p>
                </div>

                <div className="planner-actions">
                    <div className="view-toggle">
                        <button
                            className={`btn-icon ${viewMode === 'calendar' ? 'active' : ''}`}
                            onClick={() => setViewMode('calendar')}
                            aria-label="Calendar view"
                        >
                            <span className="material-icons">calendar_month</span>
                        </button>
                        <button
                            className={`btn-icon ${viewMode === 'kanban' ? 'active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                            aria-label="Kanban view"
                        >
                            <span className="material-icons">view_kanban</span>
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
                        variant="primary"
                        icon="add"
                        onClick={() => {
                            setSelectedContentId(null);
                            openContentModal();
                        }}
                    >
                        New Content
                    </Button>
                </div>
            </div>

            {/* Content Planner Views */}
            <div className="planner-content">
                {/* Kanban View */}
                {viewMode === 'kanban' && (
                    <div className="kanban-view">
                        <div className="kanban-container">
                            {Object.entries(contentByStatus).map(([status, plans]) => (
                                <div key={status} className="kanban-column">
                                    <div className={`kanban-header ${getStatusInfo(status).color}`}>
                                        <h3>{getStatusInfo(status).label}</h3>
                                        <span className="item-count">{plans.length}</span>
                                    </div>

                                    <div className="kanban-items">
                                        {plans.length > 0 ? (
                                            plans.map(plan => (
                                                <div key={plan.id} className="kanban-item">
                                                    <div className="item-header">
                                                        <h4>{plan.title}</h4>
                                                        <div className="item-actions">
                                                            <button
                                                                className="btn-icon"
                                                                onClick={() => openEditContent(plan.id)}
                                                                aria-label="Edit content"
                                                            >
                                                                <span className="material-icons">edit</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="item-description">
                                                        {plan.description.length > 100
                                                            ? `${plan.description.substring(0, 100)}...`
                                                            : plan.description}
                                                    </p>

                                                    {plan.scheduledDate && (
                                                        <div className="item-date">
                                                            <span className="material-icons">event</span>
                                                            <span>{formatDate(plan.scheduledDate)}</span>
                                                        </div>
                                                    )}

                                                    {plan.topics.length > 0 && (
                                                        <div className="item-topics">
                                                            {plan.topics.slice(0, 2).map(topicId => {
                                                                const topic = topics.find(t => t.id === topicId);
                                                                return topic ? (
                                                                    <span key={topicId} className="topic-badge">
                                                                        {topic.title}
                                                                    </span>
                                                                ) : null;
                                                            })}
                                                            {plan.topics.length > 2 && (
                                                                <span className="more-topics">+{plan.topics.length - 2}</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="item-actions-row">
                                                        {status !== 'idea' && (
                                                            <button
                                                                className="btn-icon"
                                                                onClick={() => {
                                                                    const statusOrder = ['idea', 'planning', 'research', 'scripting', 'recording', 'editing', 'published'];
                                                                    const currentIndex = statusOrder.indexOf(status as any);
                                                                    if (currentIndex > 0) {
                                                                        moveContent(plan.id, statusOrder[currentIndex - 1] as any);
                                                                    }
                                                                }}
                                                                aria-label="Move backward"
                                                            >
                                                                <span className="material-icons">arrow_back</span>
                                                            </button>
                                                        )}

                                                        {status !== 'published' && (
                                                            <button
                                                                className="btn-icon"
                                                                onClick={() => {
                                                                    const statusOrder = ['idea', 'planning', 'research', 'scripting', 'recording', 'editing', 'published'];
                                                                    const currentIndex = statusOrder.indexOf(status as any);
                                                                    if (currentIndex < statusOrder.length - 1) {
                                                                        moveContent(plan.id, statusOrder[currentIndex + 1] as any);
                                                                    }
                                                                }}
                                                                aria-label="Move forward"
                                                            >
                                                                <span className="material-icons">arrow_forward</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-kanban">
                                                <p>No content items</p>
                                            </div>
                                        )}

                                        {status === 'idea' && (
                                            <button
                                                className="add-kanban-item"
                                                onClick={() => {
                                                    setContentFormData({
                                                        ...contentFormData,
                                                        status: 'idea'
                                                    });
                                                    openContentModal();
                                                }}
                                            >
                                                <span className="material-icons">add</span>
                                                <span>Add Item</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <div className="calendar-view">
                        {Object.keys(groupedByMonth).length > 0 ? (
                            Object.entries(groupedByMonth).map(([monthYear, plans]) => (
                                <Card key={monthYear} title={monthYear} className="month-card">
                                    <div className="month-items">
                                        {plans.map(plan => (
                                            <div key={plan.id} className="calendar-item">
                                                <div className="item-date">
                                                    {plan.scheduledDate && (
                                                        <div className="date-circle">
                                                            <span className="date-day">
                                                                {new Date(plan.scheduledDate).getDate()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="item-content">
                                                    <div className="item-header">
                                                        <h4>{plan.title}</h4>
                                                        <span className={`status-badge ${getStatusInfo(plan.status).color}`}>
                                                            {getStatusInfo(plan.status).label}
                                                        </span>
                                                    </div>

                                                    <p className="item-description">
                                                        {plan.description.length > 120
                                                            ? `${plan.description.substring(0, 120)}...`
                                                            : plan.description}
                                                    </p>

                                                    {plan.topics.length > 0 && (
                                                        <div className="item-topics">
                                                            {plan.topics.slice(0, 3).map(topicId => {
                                                                const topic = topics.find(t => t.id === topicId);
                                                                return topic ? (
                                                                    <span key={topicId} className="topic-badge">
                                                                        {topic.title}
                                                                    </span>
                                                                ) : null;
                                                            })}
                                                            {plan.topics.length > 3 && (
                                                                <span className="more-topics">+{plan.topics.length - 3}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="item-actions">
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => openEditContent(plan.id)}
                                                        aria-label="Edit content"
                                                    >
                                                        <span className="material-icons">edit</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <EmptyState
                                title="No scheduled content"
                                description="Schedule your content to see it in the calendar view."
                                icon="calendar_month"
                                action={{
                                    label: "New Content",
                                    onClick: () => openContentModal()
                                }}
                            />
                        )}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <Card title="Content List">
                        {sortedContentPlans.length > 0 ? (
                            <div className="content-list-view">
                                <table className="content-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Status</th>
                                            <th>Scheduled Date</th>
                                            <th>Topics</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedContentPlans.map(plan => (
                                            <tr key={plan.id}>
                                                <td className="title-cell">
                                                    <div className="content-title">{plan.title}</div>
                                                    <div className="content-description">{
                                                        plan.description.length > 60
                                                            ? `${plan.description.substring(0, 60)}...`
                                                            : plan.description
                                                    }</div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${getStatusInfo(plan.status).color}`}>
                                                        {getStatusInfo(plan.status).label}
                                                    </span>
                                                </td>
                                                <td>
                                                    {plan.scheduledDate ? formatDate(plan.scheduledDate) : '-'}
                                                </td>
                                                <td>
                                                    <div className="table-topics">
                                                        {plan.topics.slice(0, 2).map(topicId => {
                                                            const topic = topics.find(t => t.id === topicId);
                                                            return topic ? (
                                                                <span key={topicId} className="topic-badge">
                                                                    {topic.title}
                                                                </span>
                                                            ) : null;
                                                        })}
                                                        {plan.topics.length > 2 && (
                                                            <span className="more-topics">+{plan.topics.length - 2}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => openEditContent(plan.id)}
                                                            aria-label="Edit content"
                                                        >
                                                            <span className="material-icons">edit</span>
                                                        </button>
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => confirmDeleteContentPlan(plan.id)}
                                                            aria-label="Delete content"
                                                        >
                                                            <span className="material-icons">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState
                                title="No content plans found"
                                description="Create your first content plan to get started."
                                icon="video_library"
                                action={{
                                    label: "New Content",
                                    onClick: () => openContentModal()
                                }}
                            />
                        )}
                    </Card>
                )}
            </div>

            {/* New/Edit Content Modal */}
            <Modal
                isOpen={isContentModalOpen}
                onClose={() => {
                    closeContentModal();
                    setSelectedContentId(null);
                }}
                title={selectedContentId ? "Edit Content Plan" : "New Content Plan"}
                size="large"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                closeContentModal();
                                setSelectedContentId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleContentSubmit}
                            disabled={!contentFormData.title}
                        >
                            {selectedContentId ? "Update" : "Create"}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleContentSubmit} className="content-form">
                    <div className="form-group">
                        <label htmlFor="content-title">Title</label>
                        <input
                            type="text"
                            id="content-title"
                            value={contentFormData.title}
                            onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                            placeholder="Enter content title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content-description">Description</label>
                        <textarea
                            id="content-description"
                            value={contentFormData.description}
                            onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                            placeholder="Enter content description"
                            rows={4}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="content-status">Status</label>
                            <select
                                id="content-status"
                                value={contentFormData.status}
                                onChange={(e) => setContentFormData({
                                    ...contentFormData,
                                    status: e.target.value as ContentFormData['status']
                                })}
                                required
                            >
                                <option value="idea">Idea</option>
                                <option value="planning">Planning</option>
                                <option value="research">Research</option>
                                <option value="scripting">Scripting</option>
                                <option value="recording">Recording</option>
                                <option value="editing">Editing</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="content-date">Scheduled Date</label>
                            <input
                                type="date"
                                id="content-date"
                                value={contentFormData.scheduledDate || ''}
                                onChange={(e) => setContentFormData({ ...contentFormData, scheduledDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Related Topics</label>
                        <div className="topics-selection">
                            {topics.length > 0 ? (
                                topics.map(topic => (
                                    <div key={topic.id} className="topic-checkbox">
                                        <input
                                            type="checkbox"
                                            id={`topic-${topic.id}`}
                                            checked={contentFormData.topics.includes(topic.id)}
                                            onChange={() => handleTopicToggle(topic.id)}
                                        />
                                        <label htmlFor={`topic-${topic.id}`}>{topic.title}</label>
                                    </div>
                                ))
                            ) : (
                                <p className="form-hint">
                                    No topics available. You can create topics in the Research Hub.
                                </p>
                            )}
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ContentPlanner;