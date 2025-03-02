// src/components/ContentPlanForm.tsx
import { useState } from 'react';
import Button from './common/Button';
import "ContentPlanForm.css";
interface ContentFormData {
    title: string;
    description: string;
    scheduledDate?: string;
    topics: string[];
    status: 'idea' | 'planning' | 'research' | 'scripting' | 'recording' | 'editing' | 'published';
}

interface Topic {
    id: string;
    title: string;
    tags: string[];
}

interface ContentPlanFormProps {
    initialData?: ContentFormData;
    topics: Topic[];
    onSubmit: (data: ContentFormData) => void;
    onCancel: () => void;
}

const ContentPlanForm = ({
    initialData,
    topics,
    onSubmit,
    onCancel
}: ContentPlanFormProps) => {
    const [formData, setFormData] = useState<ContentFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        scheduledDate: initialData?.scheduledDate || '',
        topics: initialData?.topics || [],
        status: initialData?.status || 'idea'
    });

    const isEditMode = !!initialData;

    // Function to handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Function to handle topic selection in the content form
    const handleTopicToggle = (topicId: string) => {
        if (formData.topics.includes(topicId)) {
            setFormData({
                ...formData,
                topics: formData.topics.filter(id => id !== topicId)
            });
        } else {
            setFormData({
                ...formData,
                topics: [...formData.topics, topicId]
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="content-plan-form">
            <div className="form-section">
                <h3 className="form-section-title">Basic Information</h3>

                <div className="form-group">
                    <label htmlFor="content-title">Title</label>
                    <input
                        type="text"
                        id="content-title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter content title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content-description">Description</label>
                    <textarea
                        id="content-description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter content description"
                        rows={4}
                    />
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section-title">Planning Details</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="content-status">Status</label>
                        <select
                            id="content-status"
                            value={formData.status}
                            onChange={(e) => setFormData({
                                ...formData,
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
                            value={formData.scheduledDate || ''}
                            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section-title">Related Topics</h3>

                <div className="form-group">
                    {topics.length > 0 ? (
                        <div className="topics-selection">
                            {topics.map(topic => (
                                <div key={topic.id} className="topic-checkbox">
                                    <input
                                        type="checkbox"
                                        id={`topic-${topic.id}`}
                                        checked={formData.topics.includes(topic.id)}
                                        onChange={() => handleTopicToggle(topic.id)}
                                    />
                                    <label htmlFor={`topic-${topic.id}`}>
                                        {topic.title}
                                        {topic.tags.length > 0 && (
                                            <span className="topic-tags">
                                                {topic.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="topic-tag">{tag}</span>
                                                ))}
                                            </span>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-topics-message">
                            <p className="form-hint">
                                No topics available. You can create topics in the Research Hub.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="form-actions">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    type="button"
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    disabled={!formData.title}
                >
                    {isEditMode ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
};

export default ContentPlanForm;