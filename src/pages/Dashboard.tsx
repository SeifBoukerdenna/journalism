// src/pages/Dashboard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import { useAppContext } from '../contexts/AppContext';

import '../styles/dashboard.css';

const Dashboard = () => {
    const { contentPlans } = useAppContext();
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
    const navigate = useNavigate();

    // Filter content plans by status
    const upcomingVideos = contentPlans.filter(plan => {
        return plan.status !== 'published' && plan.scheduledDate !== undefined;
    }).sort((a, b) => {
        // Sort by date, most recent first
        return new Date(b.scheduledDate!).getTime() - new Date(a.scheduledDate!).getTime();
    }).slice(0, 3);

    const recentlyPublished = contentPlans.filter(plan => {
        return plan.status === 'published';
    }).sort((a, b) => {
        // Sort by date, most recent first
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }).slice(0, 3);

    // Analytics data (mock data for demo)
    const analyticsData = {
        week: {
            views: 12540,
            subscribers: 245,
            engagement: 8.7,
            topPerforming: 'Electoral Reform Explained'
        },
        month: {
            views: 52340,
            subscribers: 876,
            engagement: 9.2,
            topPerforming: 'Climate Policy Debate'
        },
        year: {
            views: 623400,
            subscribers: 10234,
            engagement: 8.9,
            topPerforming: 'Voting Rights Explained'
        }
    };

    const currentAnalytics = analyticsData[timeRange];

    // Format numbers with commas
    const formatNumber = (num: number) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Get the status label and color for content plans
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

    // Format date to display in a readable format
    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Handle quick actions
    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'contentPlan':
                navigate('/planner', { state: { openContentModal: true } });
                break;
            case 'researchNote':
                navigate('/research', { state: { openNoteModal: true } });
                break;
            case 'script':
                navigate('/script', { state: { openScriptModal: true } });
                break;
            default:
                break;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="dashboard-actions">
                    <Button
                        variant="primary"
                        icon="add"
                        onClick={() => handleQuickAction('contentPlan')}
                    >
                        New Content
                    </Button>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-main">
                    {/* Analytics Overview */}
                    <Card
                        title="Analytics Overview"
                        className="analytics-card"
                        footer={
                            <div className="time-range-selector">
                                <button
                                    className={`btn-text ${timeRange === 'week' ? 'active' : ''}`}
                                    onClick={() => setTimeRange('week')}
                                >
                                    This Week
                                </button>
                                <button
                                    className={`btn-text ${timeRange === 'month' ? 'active' : ''}`}
                                    onClick={() => setTimeRange('month')}
                                >
                                    This Month
                                </button>
                                <button
                                    className={`btn-text ${timeRange === 'year' ? 'active' : ''}`}
                                    onClick={() => setTimeRange('year')}
                                >
                                    This Year
                                </button>
                            </div>
                        }
                    >
                        <div className="analytics-grid">
                            <div className="analytics-item">
                                <div className="analytics-value">{formatNumber(currentAnalytics.views)}</div>
                                <div className="analytics-label">Views</div>
                                <div className="analytics-trend up">
                                    <span className="material-icons">trending_up</span>
                                    <span>12%</span>
                                </div>
                            </div>

                            <div className="analytics-item">
                                <div className="analytics-value">{formatNumber(currentAnalytics.subscribers)}</div>
                                <div className="analytics-label">New Subscribers</div>
                                <div className="analytics-trend up">
                                    <span className="material-icons">trending_up</span>
                                    <span>8%</span>
                                </div>
                            </div>

                            <div className="analytics-item">
                                <div className="analytics-value">{currentAnalytics.engagement}%</div>
                                <div className="analytics-label">Engagement Rate</div>
                                <div className="analytics-trend down">
                                    <span className="material-icons">trending_down</span>
                                    <span>2%</span>
                                </div>
                            </div>
                        </div>

                        <div className="analytics-highlights">
                            <h4>Highlights</h4>
                            <ul>
                                <li>
                                    <span className="highlight-icon">🏆</span>
                                    <span>Top performing video: <strong>{currentAnalytics.topPerforming}</strong></span>
                                </li>
                                <li>
                                    <span className="highlight-icon">📊</span>
                                    <span>Most engaged demographic: <strong>25-34 year olds</strong></span>
                                </li>
                                <li>
                                    <span className="highlight-icon">🚀</span>
                                    <span>Best publishing time: <strong>Tuesdays at 6 PM</strong></span>
                                </li>
                            </ul>
                        </div>
                    </Card>

                    {/* Content Overview */}
                    <Card title="Content Overview">
                        <Tabs
                            tabs={[
                                {
                                    id: 'upcoming',
                                    label: 'Upcoming',
                                    icon: 'upcoming',
                                    content: (
                                        <div className="content-list">
                                            {upcomingVideos.length > 0 ? (
                                                upcomingVideos.map((video) => (
                                                    <div key={video.id} className="content-item">
                                                        <div className="content-info">
                                                            <h4>{video.title}</h4>
                                                            <p>{video.description}</p>
                                                            <div className="content-meta">
                                                                <span className={`status-badge ${getStatusInfo(video.status).color}`}>
                                                                    {getStatusInfo(video.status).label}
                                                                </span>
                                                                {video.scheduledDate && (
                                                                    <span className="date-badge">
                                                                        <span className="material-icons">event</span>
                                                                        {formatDate(video.scheduledDate)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="content-actions">
                                                            <button
                                                                className="btn-icon"
                                                                aria-label="Edit"
                                                                onClick={() => navigate('/planner', { state: { editContentId: video.id } })}
                                                            >
                                                                <span className="material-icons">edit</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="empty-content">
                                                    <p>No upcoming videos scheduled.</p>
                                                    <Button
                                                        variant="outline"
                                                        size="small"
                                                        icon="add"
                                                        onClick={() => handleQuickAction('contentPlan')}
                                                    >
                                                        Schedule a video
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    id: 'published',
                                    label: 'Published',
                                    icon: 'publish',
                                    content: (
                                        <div className="content-list">
                                            {recentlyPublished.length > 0 ? (
                                                recentlyPublished.map((video) => (
                                                    <div key={video.id} className="content-item">
                                                        <div className="content-info">
                                                            <h4>{video.title}</h4>
                                                            <p>{video.description}</p>
                                                            <div className="content-meta">
                                                                <span className="date-badge">
                                                                    <span className="material-icons">calendar_today</span>
                                                                    {formatDate(video.updatedAt)}
                                                                </span>
                                                                <span className="views-badge">
                                                                    <span className="material-icons">visibility</span>
                                                                    {Math.floor(Math.random() * 10000)} views
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="content-actions">
                                                            <button className="btn-icon" aria-label="View analytics">
                                                                <span className="material-icons">analytics</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="empty-content">
                                                    <p>No published videos yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </div>

                <div className="dashboard-sidebar">
                    {/* Recent Activity */}
                    <Card
                        title="Recent Activity"
                        actionIcon="more_horiz"
                        onAction={() => {/* Open more options */ }}
                    >
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <span className="material-icons">edit_note</span>
                                </div>
                                <div className="activity-content">
                                    <p>Updated script for <strong>Electoral Reform</strong></p>
                                    <span className="activity-time">2 hours ago</span>
                                </div>
                            </div>

                            <div className="activity-item">
                                <div className="activity-icon">
                                    <span className="material-icons">bookmark_added</span>
                                </div>
                                <div className="activity-content">
                                    <p>Added new research notes on <strong>Climate Policy</strong></p>
                                    <span className="activity-time">Yesterday</span>
                                </div>
                            </div>

                            <div className="activity-item">
                                <div className="activity-icon">
                                    <span className="material-icons">publish</span>
                                </div>
                                <div className="activity-content">
                                    <p>Published <strong>Voting Rights Explained</strong></p>
                                    <span className="activity-time">2 days ago</span>
                                </div>
                            </div>
                        </div>

                        <button className="btn-text btn-full">View all activity</button>
                    </Card>

                    {/* Topic Statistics */}
                    <Card title="Topic Distribution">
                        <div className="topic-stats">
                            <div className="chart-placeholder">
                                <div className="pie-chart">
                                    {/* Mock pie chart for visualization */}
                                    <div className="pie-segment segment-1"></div>
                                    <div className="pie-segment segment-2"></div>
                                    <div className="pie-segment segment-3"></div>
                                    <div className="pie-segment segment-4"></div>
                                </div>
                            </div>

                            <div className="topic-legend">
                                <div className="legend-item">
                                    <span className="legend-color color-1"></span>
                                    <span className="legend-label">Politics</span>
                                    <span className="legend-value">42%</span>
                                </div>

                                <div className="legend-item">
                                    <span className="legend-color color-2"></span>
                                    <span className="legend-label">Climate</span>
                                    <span className="legend-value">28%</span>
                                </div>

                                <div className="legend-item">
                                    <span className="legend-color color-3"></span>
                                    <span className="legend-label">Social Issues</span>
                                    <span className="legend-value">18%</span>
                                </div>

                                <div className="legend-item">
                                    <span className="legend-color color-4"></span>
                                    <span className="legend-label">Other</span>
                                    <span className="legend-value">12%</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card title="Quick Actions">
                        <div className="quick-actions">
                            <Button
                                variant="outline"
                                icon="add_task"
                                className="action-btn"
                                fullWidth
                                onClick={() => handleQuickAction('contentPlan')}
                            >
                                New Content Plan
                            </Button>

                            <Button
                                variant="outline"
                                icon="note_add"
                                className="action-btn"
                                fullWidth
                                onClick={() => handleQuickAction('researchNote')}
                            >
                                Add Research Note
                            </Button>

                            <Button
                                variant="outline"
                                icon="edit_note"
                                className="action-btn"
                                fullWidth
                                onClick={() => handleQuickAction('script')}
                            >
                                Create Script
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;