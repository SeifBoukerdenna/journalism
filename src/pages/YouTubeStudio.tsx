// src/pages/YouTubeStudio.tsx
import { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useModal } from '../hooks/useModal';
import { useAppContext } from '../contexts/AppContext';
import { showSuccessToast, showErrorToast } from '../utils/toastService';
import '../styles/youtube-studio.css';

// Types for YouTube data
interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnailUrl: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    status: 'public' | 'private' | 'unlisted';
    duration: string;
}

interface YouTubeComment {
    id: string;
    authorName: string;
    authorProfileImageUrl: string;
    text: string;
    likeCount: number;
    publishedAt: string;
    videoId: string;
    isReply: boolean;
    parentId?: string;
}

interface YouTubeAnalytics {
    views: {
        today: number;
        week: number;
        month: number;
        year: number; // Added year data
        total: number;
        trend: number;
    };
    watchTime: {
        today: number;
        week: number;
        month: number;
        total: number;
        year: number;
        trend: number;
    };
    subscribers: {
        today: number;
        week: number;
        month: number;
        year: number;
        total: number;
        trend: number;
    };
    engagement: {
        likes: number;
        comments: number;
        shares: number;
        rate: number;
        trend: number;
    };
    topVideos: {
        id: string;
        title: string;
        views: number;
        watchTime: number;
    }[];
    demographics: {
        ageGroups: { label: string; value: number }[];
        genders: { label: string; value: number }[];
        countries: { label: string; value: number }[];
    };
}

const YouTubeStudio = () => {
    // App context for theme and other shared data
    const { theme } = useAppContext();

    // State for API authentication
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // State for videos and comments
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const [comments, setComments] = useState<YouTubeComment[]>([]);
    const [filteredComments, setFilteredComments] = useState<YouTubeComment[]>([]);
    const [commentFilter, setCommentFilter] = useState<'all' | 'needsResponse' | 'questionOnly'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Analytics data
    const [analytics, setAnalytics] = useState<YouTubeAnalytics | null>(null);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

    // Modal states
    const { isOpen: isApiKeyModalOpen, openModal: openApiKeyModal, closeModal: closeApiKeyModal } = useModal(false);
    const { isOpen: isUploadModalOpen, openModal: openUploadModal, closeModal: closeUploadModal } = useModal(false);
    const { isOpen: isVideoDetailsModalOpen, openModal: openVideoDetailsModal, closeModal: closeVideoDetailsModal } = useModal(false);
    const { isOpen: isConfirmDeleteModalOpen, openModal: openConfirmDeleteModal, closeModal: closeConfirmDeleteModal } = useModal(false);

    // Upload form data
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        tags: '',
        visibility: 'private',
        scheduledPublishTime: '',
        thumbnail: null as File | null,
        videoFile: null as File | null,
    });

    // Video deletion state
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

    // Update/edit video form
    const [editVideoForm, setEditVideoForm] = useState({
        id: '',
        title: '',
        description: '',
        tags: '',
        visibility: 'private' as 'public' | 'private' | 'unlisted',
        thumbnail: null as File | null,
    });

    // Check for API key on component mount
    useEffect(() => {
        // Try to get API key from local storage
        const savedApiKey = localStorage.getItem('youtubeApiKey');
        if (savedApiKey) {
            setApiKey(savedApiKey);
            setIsAuthenticated(true);
            fetchData(savedApiKey);
        } else {
            setIsLoading(false);
            openApiKeyModal();
        }
    }, []);

    // Fetch all data when authenticated
    const fetchData = async (key: string) => {
        setIsLoading(true);
        try {
            // In a real implementation, these would be actual API calls
            // For now, we'll simulate with mock data

            // Mock videos data
            await fetchVideos(key);

            // Mock analytics data
            await fetchAnalytics(key);

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            showErrorToast('Failed to load YouTube data. Please check your API key.');
            setIsLoading(false);
        }
    };

    // Fetch videos (mock implementation)
    const fetchVideos = async (key: string) => {
        // This would be a real API call in production
        // For demo purposes, we'll use mock data

        setTimeout(() => {
            const mockVideos: YouTubeVideo[] = [
                {
                    id: 'vid1',
                    title: 'Electoral Reform Explained',
                    description: 'A detailed explanation of electoral reform concepts and their impact on democracy.',
                    publishedAt: '2023-10-15T14:00:00Z',
                    thumbnailUrl: 'https://via.placeholder.com/480x360?text=Electoral+Reform',
                    viewCount: 12500,
                    likeCount: 850,
                    commentCount: 124,
                    status: 'public',
                    duration: '14:22',
                },
                {
                    id: 'vid2',
                    title: 'Climate Policy Debate',
                    description: 'Analyzing various climate policy approaches and their potential effectiveness.',
                    publishedAt: '2023-09-28T10:30:00Z',
                    thumbnailUrl: 'https://via.placeholder.com/480x360?text=Climate+Policy',
                    viewCount: 8600,
                    likeCount: 720,
                    commentCount: 93,
                    status: 'public',
                    duration: '18:05',
                },
                {
                    id: 'vid3',
                    title: 'Voting Rights Explained',
                    description: 'The history and modern challenges of voting rights in democratic systems.',
                    publishedAt: '2023-08-12T15:45:00Z',
                    thumbnailUrl: 'https://via.placeholder.com/480x360?text=Voting+Rights',
                    viewCount: 24700,
                    likeCount: 1890,
                    commentCount: 276,
                    status: 'public',
                    duration: '21:37',
                },
                {
                    id: 'vid4',
                    title: 'Economic Recovery Strategies',
                    description: 'Examining approaches to economic recovery after major downturns.',
                    publishedAt: '2023-07-05T09:15:00Z',
                    thumbnailUrl: 'https://via.placeholder.com/480x360?text=Economic+Recovery',
                    viewCount: 7300,
                    likeCount: 540,
                    commentCount: 68,
                    status: 'public',
                    duration: '16:48',
                },
                {
                    id: 'vid5',
                    title: 'Healthcare Systems Compared',
                    description: 'A comparative analysis of healthcare systems around the world.',
                    publishedAt: '2023-11-02T11:20:00Z',
                    thumbnailUrl: 'https://via.placeholder.com/480x360?text=Healthcare',
                    viewCount: 5200,
                    likeCount: 430,
                    commentCount: 52,
                    status: 'unlisted',
                    duration: '25:10',
                },
            ];

            setVideos(mockVideos);
        }, 800);
    };

    // Fetch analytics (mock implementation)
    const fetchAnalytics = async (key: string) => {
        // This would be a real API call in production
        setTimeout(() => {
            const mockAnalytics: YouTubeAnalytics = {
                views: {
                    today: 1250,
                    week: 8640,
                    month: 32500,
                    year: 187430, // Added year data
                    total: 187430,
                    trend: 12,
                },
                watchTime: {
                    today: 18900, // in seconds
                    week: 128400,
                    month: 542300,
                    year: 3245000, // Added year data
                    total: 3245000,
                    trend: 8,
                },
                subscribers: {
                    today: 24,
                    week: 165,
                    month: 720,
                    year: 8500, // Added year data
                    total: 12450,
                    trend: 15,
                },
                engagement: {
                    likes: 3450,
                    comments: 487,
                    shares: 1230,
                    rate: 4.8,
                    trend: 5,
                },
                topVideos: [
                    {
                        id: 'vid3',
                        title: 'Voting Rights Explained',
                        views: 24700,
                        watchTime: 457200,
                    },
                    {
                        id: 'vid1',
                        title: 'Electoral Reform Explained',
                        views: 12500,
                        watchTime: 231000,
                    },
                    {
                        id: 'vid2',
                        title: 'Climate Policy Debate',
                        views: 8600,
                        watchTime: 176400,
                    },
                ],
                demographics: {
                    ageGroups: [
                        { label: '18-24', value: 22 },
                        { label: '25-34', value: 38 },
                        { label: '35-44', value: 24 },
                        { label: '45-54', value: 10 },
                        { label: '55+', value: 6 },
                    ],
                    genders: [
                        { label: 'Male', value: 58 },
                        { label: 'Female', value: 40 },
                        { label: 'Other', value: 2 },
                    ],
                    countries: [
                        { label: 'United States', value: 42 },
                        { label: 'United Kingdom', value: 14 },
                        { label: 'Canada', value: 12 },
                        { label: 'Australia', value: 8 },
                        { label: 'Germany', value: 6 },
                        { label: 'Others', value: 18 },
                    ],
                },
            };

            setAnalytics(mockAnalytics);
        }, 1000);
    };

    // Fetch comments for a specific video (mock implementation)
    const fetchComments = async (videoId: string) => {
        setIsLoading(true);

        // This would be a real API call in production
        setTimeout(() => {
            const mockComments: YouTubeComment[] = [
                {
                    id: 'comment1',
                    authorName: 'Political Observer',
                    authorProfileImageUrl: 'https://via.placeholder.com/48',
                    text: 'This was a great explanation of the electoral reform process. I particularly appreciated the historical context you provided.',
                    likeCount: 24,
                    publishedAt: '2023-10-15T18:23:00Z',
                    videoId: videoId,
                    isReply: false,
                },
                {
                    id: 'comment2',
                    authorName: 'Democracy Advocate',
                    authorProfileImageUrl: 'https://via.placeholder.com/48',
                    text: 'Could you explain more about ranked-choice voting in a future video? I\'m still confused about how the counting works.',
                    likeCount: 15,
                    publishedAt: '2023-10-16T09:14:00Z',
                    videoId: videoId,
                    isReply: false,
                },
                {
                    id: 'comment2-reply1',
                    authorName: 'Your Channel',
                    authorProfileImageUrl: 'https://via.placeholder.com/48',
                    text: 'Great suggestion! I actually have a video on ranked-choice voting planned for next month. Stay tuned!',
                    likeCount: 8,
                    publishedAt: '2023-10-16T10:22:00Z',
                    videoId: videoId,
                    isReply: true,
                    parentId: 'comment2',
                },
                {
                    id: 'comment3',
                    authorName: 'Policy Wonk',
                    authorProfileImageUrl: 'https://via.placeholder.com/48',
                    text: 'I think you missed some important points about proportional representation systems used in European countries.',
                    likeCount: 3,
                    publishedAt: '2023-10-17T14:05:00Z',
                    videoId: videoId,
                    isReply: false,
                },
                {
                    id: 'comment4',
                    authorName: 'First-Time Voter',
                    authorProfileImageUrl: 'https://via.placeholder.com/48',
                    text: 'This was really helpful! I\'m voting for the first time next year and trying to understand these systems.',
                    likeCount: 42,
                    publishedAt: '2023-10-18T17:37:00Z',
                    videoId: videoId,
                    isReply: false,
                },
                {
                    id: 'comment5',
                    authorName: 'Curious Citizen',
                    authorProfileImageUrl: 'https://via.placeholder.com/48',
                    text: 'What\'s your opinion on mandatory voting laws? Should we implement something like Australia has?',
                    likeCount: 7,
                    publishedAt: '2023-10-19T08:44:00Z',
                    videoId: videoId,
                    isReply: false,
                },
            ];

            setComments(mockComments);
            setFilteredComments(mockComments);
            setIsLoading(false);
        }, 600);
    };

    // Handle API key submission
    const handleApiKeySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!apiKey.trim()) {
            showErrorToast('Please enter a valid API key');
            return;
        }

        setIsConfiguring(true);

        // Simulate API validation
        setTimeout(() => {
            // In a real implementation, we would validate the API key here
            localStorage.setItem('youtubeApiKey', apiKey);
            setIsAuthenticated(true);
            closeApiKeyModal();
            fetchData(apiKey);
            setIsConfiguring(false);
            showSuccessToast('YouTube API successfully configured');
        }, 1500);
    };

    // Handle upload form submission
    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!uploadForm.title || !uploadForm.videoFile) {
            showErrorToast('Please enter a title and select a video file');
            return;
        }

        // Simulate video upload
        setIsLoading(true);

        setTimeout(() => {
            // In a real implementation, this would be a YouTube API upload

            // Add new video to the list
            const newVideo: YouTubeVideo = {
                id: `vid${Math.floor(Math.random() * 10000)}`,
                title: uploadForm.title,
                description: uploadForm.description,
                publishedAt: uploadForm.scheduledPublishTime || new Date().toISOString(),
                thumbnailUrl: uploadForm.thumbnail
                    ? URL.createObjectURL(uploadForm.thumbnail)
                    : 'https://via.placeholder.com/480x360?text=New+Video',
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                status: uploadForm.visibility as 'public' | 'private' | 'unlisted',
                duration: '0:00', // This would be extracted from the video file
            };

            setVideos(prev => [newVideo, ...prev]);

            // Reset form
            setUploadForm({
                title: '',
                description: '',
                tags: '',
                visibility: 'private',
                scheduledPublishTime: '',
                thumbnail: null,
                videoFile: null,
            });

            closeUploadModal();
            setIsLoading(false);
            showSuccessToast('Video uploaded successfully');
        }, 3000);
    };

    // Handle video selection for details
    const handleVideoSelect = (video: YouTubeVideo) => {
        setSelectedVideo(video);
        openVideoDetailsModal();
        fetchComments(video.id);

        // Set up edit form data
        setEditVideoForm({
            id: video.id,
            title: video.title,
            description: video.description,
            tags: '', // In a real implementation, we would fetch tags
            visibility: video.status,
            thumbnail: null,
        });
    };

    // Handle video deletion
    const handleDeleteVideo = (videoId: string) => {
        setVideoToDelete(videoId);
        openConfirmDeleteModal();
    };

    // Confirm video deletion
    const confirmDeleteVideo = () => {
        if (!videoToDelete) return;

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Remove video from list
            setVideos(prev => prev.filter(v => v.id !== videoToDelete));

            // Close modals
            closeConfirmDeleteModal();
            if (selectedVideo && selectedVideo.id === videoToDelete) {
                closeVideoDetailsModal();
            }

            setVideoToDelete(null);
            setIsLoading(false);
            showSuccessToast('Video deleted successfully');
        }, 1500);
    };

    // Handle edit video form submission
    const handleEditVideoSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editVideoForm.title) {
            showErrorToast('Title is required');
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Update video in list
            setVideos(prev => prev.map(v => {
                if (v.id === editVideoForm.id) {
                    return {
                        ...v,
                        title: editVideoForm.title,
                        description: editVideoForm.description,
                        status: editVideoForm.visibility,
                        thumbnailUrl: editVideoForm.thumbnail
                            ? URL.createObjectURL(editVideoForm.thumbnail)
                            : v.thumbnailUrl,
                    };
                }
                return v;
            }));

            // Update selected video if open
            if (selectedVideo && selectedVideo.id === editVideoForm.id) {
                setSelectedVideo(prev => {
                    if (!prev) return null;

                    return {
                        ...prev,
                        title: editVideoForm.title,
                        description: editVideoForm.description,
                        status: editVideoForm.visibility,
                        thumbnailUrl: editVideoForm.thumbnail
                            ? URL.createObjectURL(editVideoForm.thumbnail)
                            : prev.thumbnailUrl,
                    };
                });
            }

            setIsLoading(false);
            showSuccessToast('Video updated successfully');
        }, 1500);
    };

    // Handle comment filtering
    const filterComments = (filter: 'all' | 'needsResponse' | 'questionOnly') => {
        setCommentFilter(filter);

        if (filter === 'all') {
            setFilteredComments(comments);
            return;
        }

        if (filter === 'needsResponse') {
            // Filter out comments that have replies from your channel
            const commentIds = new Set(comments.filter(c => c.isReply && c.authorName === 'Your Channel').map(c => c.parentId));
            setFilteredComments(comments.filter(c => !c.isReply && !commentIds.has(c.id)));
            return;
        }

        if (filter === 'questionOnly') {
            // Simple filter for comments that contain question marks
            setFilteredComments(comments.filter(c => !c.isReply && c.text.includes('?')));
            return;
        }
    };

    // Handle search in videos
    const handleVideoSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Filtered videos based on search
    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Format number for display (e.g., 1234 -> 1.2K)
    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Format duration from seconds to MM:SS or HH:MM:SS
    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    // Format watch time from seconds to hours
    const formatWatchTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        return `${hours} hrs`;
    };

    if (!isAuthenticated && !isApiKeyModalOpen) {
        return (
            <div className="youtube-studio-container">
                <EmptyState
                    title="YouTube Studio not configured"
                    description="You need to set up your YouTube API key to access YouTube Studio features."
                    icon="movie"
                    action={{
                        label: "Configure API",
                        onClick: openApiKeyModal
                    }}
                />
            </div>
        );
    }

    return (
        <div className="youtube-studio-container">
            <div className="studio-header">
                <div className="studio-title">
                    <h1>YouTube Studio</h1>
                    <p>Manage your YouTube content, analytics, and audience</p>
                </div>

                <div className="studio-actions">
                    <Button
                        variant="outline"
                        icon="settings"
                        onClick={openApiKeyModal}
                    >
                        API Settings
                    </Button>
                    <Button
                        variant="primary"
                        icon="cloud_upload"
                        onClick={openUploadModal}
                    >
                        Upload Video
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                    <p>Loading YouTube data...</p>
                </div>
            ) : (
                <Tabs
                    tabs={[
                        {
                            id: 'dashboard',
                            label: 'Dashboard',
                            icon: 'dashboard',
                            content: (
                                <div className="dashboard-tab-content">
                                    {analytics ? (
                                        <>
                                            <div className="analytics-header">
                                                <h2>Channel Performance</h2>
                                                <div className="time-range-selector">
                                                    <button
                                                        className={`btn-text ${timeRange === 'week' ? 'active' : ''}`}
                                                        onClick={() => setTimeRange('week')}
                                                    >
                                                        Last 7 Days
                                                    </button>
                                                    <button
                                                        className={`btn-text ${timeRange === 'month' ? 'active' : ''}`}
                                                        onClick={() => setTimeRange('month')}
                                                    >
                                                        Last 28 Days
                                                    </button>
                                                    <button
                                                        className={`btn-text ${timeRange === 'year' ? 'active' : ''}`}
                                                        onClick={() => setTimeRange('year')}
                                                    >
                                                        Last 365 Days
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="analytics-summary">
                                                <Card className="analytics-card">
                                                    <div className="analytics-card-header">
                                                        <h3>Views</h3>
                                                        <span className={`trend-indicator ${analytics.views.trend > 0 ? 'positive' : 'negative'}`}>
                                                            <span className="material-icons">
                                                                {analytics.views.trend > 0 ? 'trending_up' : 'trending_down'}
                                                            </span>
                                                            {Math.abs(analytics.views.trend)}%
                                                        </span>
                                                    </div>
                                                    <div className="analytics-value">{formatNumber(analytics.views[timeRange])}</div>
                                                    <div className="analytics-subtext">Total: {formatNumber(analytics.views.total)}</div>
                                                </Card>

                                                <Card className="analytics-card">
                                                    <div className="analytics-card-header">
                                                        <h3>Watch Time</h3>
                                                        <span className={`trend-indicator ${analytics.watchTime.trend > 0 ? 'positive' : 'negative'}`}>
                                                            <span className="material-icons">
                                                                {analytics.watchTime.trend > 0 ? 'trending_up' : 'trending_down'}
                                                            </span>
                                                            {Math.abs(analytics.watchTime.trend)}%
                                                        </span>
                                                    </div>
                                                    <div className="analytics-value">{formatWatchTime(analytics.watchTime[timeRange])}</div>
                                                    <div className="analytics-subtext">Total: {formatWatchTime(analytics.watchTime.total)}</div>
                                                </Card>

                                                <Card className="analytics-card">
                                                    <div className="analytics-card-header">
                                                        <h3>Subscribers</h3>
                                                        <span className={`trend-indicator ${analytics.subscribers.trend > 0 ? 'positive' : 'negative'}`}>
                                                            <span className="material-icons">
                                                                {analytics.subscribers.trend > 0 ? 'trending_up' : 'trending_down'}
                                                            </span>
                                                            {Math.abs(analytics.subscribers.trend)}%
                                                        </span>
                                                    </div>
                                                    <div className="analytics-value">+{formatNumber(analytics.subscribers[timeRange])}</div>
                                                    <div className="analytics-subtext">Total: {formatNumber(analytics.subscribers.total)}</div>
                                                </Card>

                                                <Card className="analytics-card">
                                                    <div className="analytics-card-header">
                                                        <h3>Engagement Rate</h3>
                                                        <span className={`trend-indicator ${analytics.engagement.trend > 0 ? 'positive' : 'negative'}`}>
                                                            <span className="material-icons">
                                                                {analytics.engagement.trend > 0 ? 'trending_up' : 'trending_down'}
                                                            </span>
                                                            {Math.abs(analytics.engagement.trend)}%
                                                        </span>
                                                    </div>
                                                    <div className="analytics-value">{analytics.engagement.rate}%</div>
                                                    <div className="analytics-subtext">
                                                        {formatNumber(analytics.engagement.likes)} likes • {formatNumber(analytics.engagement.comments)} comments
                                                    </div>
                                                </Card>
                                            </div>

                                            <div className="analytics-details">
                                                <Card title="Top Performing Videos">
                                                    <div className="top-videos-list">
                                                        {analytics.topVideos.map((video, index) => (
                                                            <div key={video.id} className="top-video-item">
                                                                <div className="top-video-rank">{index + 1}</div>
                                                                <div className="top-video-info">
                                                                    <h4>{video.title}</h4>
                                                                    <div className="top-video-stats">
                                                                        <span>{formatNumber(video.views)} views</span>
                                                                        <span>•</span>
                                                                        <span>{formatWatchTime(video.watchTime)} watch time</span>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="small"
                                                                    onClick={() => {
                                                                        const fullVideo = videos.find(v => v.id === video.id);
                                                                        if (fullVideo) {
                                                                            handleVideoSelect(fullVideo);
                                                                        }
                                                                    }}
                                                                >
                                                                    Details
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card>

                                                <Card title="Audience Demographics">
                                                    <div className="demographics-container">
                                                        <div className="demographic-section">
                                                            <h4>Age Groups</h4>
                                                            <div className="demographic-bars">
                                                                {analytics.demographics.ageGroups.map(group => (
                                                                    <div key={group.label} className="demographic-bar-item">
                                                                        <div className="demographic-label">{group.label}</div>
                                                                        <div className="demographic-bar-container">
                                                                            <div
                                                                                className="demographic-bar"
                                                                                style={{ width: `${group.value}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <div className="demographic-value">{group.value}%</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="demographic-section">
                                                            <h4>Gender</h4>
                                                            <div className="demographic-pie">
                                                                <div className="pie-chart-container">
                                                                    {/* Simplified pie chart visualization */}
                                                                    {analytics.demographics.genders.map((gender, index) => (
                                                                        <div
                                                                            key={gender.label}
                                                                            className={`pie-segment segment-${index + 1}`}
                                                                            style={{
                                                                                transform: `rotate(${index === 0 ? 0 : analytics.demographics.genders.slice(0, index).reduce((sum, g) => sum + g.value, 0) * 3.6}deg)`,
                                                                                backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#f97316',
                                                                                clipPath: `polygon(50% 50%, 50% 0, ${50 + gender.value / 2}% 0, ${50 + gender.value}% ${50 - gender.value / 2}%, ${50}% ${50}%)`,
                                                                            }}
                                                                        ></div>
                                                                    ))}
                                                                </div>
                                                                <div className="demographic-legend">
                                                                    {analytics.demographics.genders.map((gender, index) => (
                                                                        <div key={gender.label} className="legend-item">
                                                                            <div className={`legend-color color-${index + 1}`}></div>
                                                                            <div className="legend-label">{gender.label}</div>
                                                                            <div className="legend-value">{gender.value}%</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="demographic-section">
                                                            <h4>Top Geographies</h4>
                                                            <div className="demographic-table">
                                                                {analytics.demographics.countries.map(country => (
                                                                    <div key={country.label} className="geographic-item">
                                                                        <div className="country-name">{country.label}</div>
                                                                        <div className="country-bar-container">
                                                                            <div
                                                                                className="country-bar"
                                                                                style={{ width: `${country.value * 2}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <div className="country-value">{country.value}%</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        </>
                                    ) : (
                                        <EmptyState
                                            title="Analytics not available"
                                            description="We couldn't load your channel analytics. Please try again later."
                                            icon="analytics"
                                        />
                                    )}
                                </div>
                            ),
                        },
                        {
                            id: 'videos',
                            label: 'Content',
                            icon: 'video_library',
                            content: (
                                <div className="videos-tab-content">
                                    <div className="videos-controls">
                                        <div className="search-container">
                                            <input
                                                type="text"
                                                placeholder="Search videos..."
                                                value={searchQuery}
                                                onChange={handleVideoSearch}
                                                className="search-input"
                                            />
                                            <span className="material-icons search-icon">search</span>
                                        </div>
                                        <div className="view-filters">
                                            <select className="view-filter" defaultValue="newest">
                                                <option value="newest">Sort: Newest First</option>
                                                <option value="oldest">Sort: Oldest First</option>
                                                <option value="popular">Sort: Most Popular</option>
                                                <option value="a-z">Sort: Title A-Z</option>
                                            </select>
                                            <select className="view-filter" defaultValue="all">
                                                <option value="all">All Videos</option>
                                                <option value="public">Public</option>
                                                <option value="private">Private</option>
                                                <option value="unlisted">Unlisted</option>
                                            </select>
                                        </div>
                                    </div>

                                    {filteredVideos.length > 0 ? (
                                        <div className="videos-grid">
                                            {filteredVideos.map(video => (
                                                <div key={video.id} className="video-card">
                                                    <div className="video-thumbnail" onClick={() => handleVideoSelect(video)}>
                                                        <img src={video.thumbnailUrl} alt={video.title} />
                                                        <div className="video-duration">{video.duration}</div>
                                                    </div>
                                                    <div className="video-info">
                                                        <h3 className="video-title">{video.title}</h3>
                                                        <div className="video-meta">
                                                            <span className="video-views">{formatNumber(video.viewCount)} views</span>
                                                            <span className="video-date">{formatDate(video.publishedAt)}</span>
                                                        </div>
                                                        <div className="video-status">
                                                            <span className={`status-badge status-${video.status}`}>
                                                                {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="video-actions">
                                                        <button
                                                            className="btn-icon video-action"
                                                            onClick={() => handleVideoSelect(video)}
                                                            title="View Details"
                                                        >
                                                            <span className="material-icons">info</span>
                                                        </button>
                                                        <button
                                                            className="btn-icon video-action"
                                                            onClick={() => handleDeleteVideo(video.id)}
                                                            title="Delete Video"
                                                        >
                                                            <span className="material-icons">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            title="No videos found"
                                            description={searchQuery ? "No videos match your search criteria." : "You haven't uploaded any videos yet."}
                                            icon="videocam_off"
                                            action={
                                                searchQuery
                                                    ? undefined
                                                    : {
                                                        label: "Upload Video",
                                                        onClick: openUploadModal
                                                    }
                                            }
                                        />
                                    )}
                                </div>
                            ),
                        },
                        {
                            id: 'comments',
                            label: 'Comments',
                            icon: 'comment',
                            content: (
                                <div className="comments-tab-content">
                                    <div className="comments-filters">
                                        <Button
                                            variant={commentFilter === 'all' ? 'primary' : 'outline'}
                                            onClick={() => filterComments('all')}
                                        >
                                            All Comments
                                        </Button>
                                        <Button
                                            variant={commentFilter === 'needsResponse' ? 'primary' : 'outline'}
                                            onClick={() => filterComments('needsResponse')}
                                        >
                                            Needs Response
                                        </Button>
                                        <Button
                                            variant={commentFilter === 'questionOnly' ? 'primary' : 'outline'}
                                            onClick={() => filterComments('questionOnly')}
                                        >
                                            Questions
                                        </Button>
                                    </div>

                                    {selectedVideo ? (
                                        <div className="active-video-comments">
                                            <div className="active-video-header">
                                                <h3>Comments for: {selectedVideo.title}</h3>
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={() => setSelectedVideo(null)}
                                                >
                                                    Show All Videos
                                                </Button>
                                            </div>

                                            {filteredComments.length > 0 ? (
                                                <div className="comments-list">
                                                    {filteredComments.filter(c => !c.isReply).map(comment => (
                                                        <div key={comment.id} className="comment-item">
                                                            <div className="comment-avatar">
                                                                <img src={comment.authorProfileImageUrl} alt={comment.authorName} />
                                                            </div>
                                                            <div className="comment-content">
                                                                <div className="comment-header">
                                                                    <h4 className="comment-author">{comment.authorName}</h4>
                                                                    <span className="comment-date">{formatDate(comment.publishedAt)}</span>
                                                                </div>
                                                                <div className="comment-text">{comment.text}</div>
                                                                <div className="comment-meta">
                                                                    <span className="comment-likes">
                                                                        <span className="material-icons">thumb_up</span>
                                                                        {comment.likeCount}
                                                                    </span>
                                                                    <div className="comment-actions">
                                                                        <button className="btn-text comment-action">Reply</button>
                                                                        <button className="btn-text comment-action">Report</button>
                                                                    </div>
                                                                </div>

                                                                {/* Show replies */}
                                                                {comments.filter(c => c.isReply && c.parentId === comment.id).map(reply => (
                                                                    <div key={reply.id} className="comment-reply">
                                                                        <div className="comment-avatar">
                                                                            <img src={reply.authorProfileImageUrl} alt={reply.authorName} />
                                                                        </div>
                                                                        <div className="comment-content">
                                                                            <div className="comment-header">
                                                                                <h4 className="comment-author">{reply.authorName}</h4>
                                                                                <span className="comment-date">{formatDate(reply.publishedAt)}</span>
                                                                            </div>
                                                                            <div className="comment-text">{reply.text}</div>
                                                                            <div className="comment-meta">
                                                                                <span className="comment-likes">
                                                                                    <span className="material-icons">thumb_up</span>
                                                                                    {reply.likeCount}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState
                                                    title="No comments found"
                                                    description={
                                                        commentFilter === 'all'
                                                            ? "This video doesn't have any comments yet."
                                                            : commentFilter === 'needsResponse'
                                                                ? "All comments have been responded to."
                                                                : "No questions found in the comments."
                                                    }
                                                    icon="chat"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="video-comments-selection">
                                            <h3>Select a video to view its comments</h3>
                                            <div className="video-selection-grid">
                                                {videos.map(video => (
                                                    <div
                                                        key={video.id}
                                                        className="video-selection-card"
                                                        onClick={() => {
                                                            setSelectedVideo(video);
                                                            fetchComments(video.id);
                                                        }}
                                                    >
                                                        <div className="video-thumbnail">
                                                            <img src={video.thumbnailUrl} alt={video.title} />
                                                        </div>
                                                        <div className="video-selection-info">
                                                            <h4>{video.title}</h4>
                                                            <div className="video-selection-meta">
                                                                <span className="comment-count">
                                                                    <span className="material-icons">comment</span>
                                                                    {video.commentCount}
                                                                </span>
                                                                <span className="video-date">{formatDate(video.publishedAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ),
                        },
                        {
                            id: 'monetization',
                            label: 'Monetization',
                            icon: 'monetization_on',
                            content: (
                                <div className="monetization-tab-content">
                                    <Card title="Revenue Overview">
                                        <div className="revenue-overview">
                                            <div className="revenue-metrics">
                                                <div className="revenue-metric">
                                                    <h3>Estimated Revenue (Last 28 days)</h3>
                                                    <div className="revenue-value">$348.72</div>
                                                    <div className="revenue-trend positive">
                                                        <span className="material-icons">trending_up</span>
                                                        12.5% from previous period
                                                    </div>
                                                </div>
                                                <div className="revenue-metric">
                                                    <h3>RPM (Revenue per Mille)</h3>
                                                    <div className="revenue-value">$4.23</div>
                                                    <div className="revenue-trend positive">
                                                        <span className="material-icons">trending_up</span>
                                                        2.1% from previous period
                                                    </div>
                                                </div>
                                                <div className="revenue-metric">
                                                    <h3>Monetized Playbacks</h3>
                                                    <div className="revenue-value">82.5K</div>
                                                    <div className="revenue-trend positive">
                                                        <span className="material-icons">trending_up</span>
                                                        15.8% from previous period
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="revenue-chart">
                                                <h3>Monthly Revenue</h3>
                                                <div className="chart-placeholder">
                                                    <div className="chart-bars">
                                                        {[0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.9, 0.7, 0.6, 0.8, 0.9, 1.0].map((height, index) => (
                                                            <div key={index} className="chart-bar-column">
                                                                <div className="chart-bar" style={{ height: `${height * 100}%` }}></div>
                                                                <div className="chart-label">{new Date(2023, index).toLocaleString('default', { month: 'short' })}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="chart-y-axis">
                                                        <div className="y-axis-label">$500</div>
                                                        <div className="y-axis-label">$400</div>
                                                        <div className="y-axis-label">$300</div>
                                                        <div className="y-axis-label">$200</div>
                                                        <div className="y-axis-label">$100</div>
                                                        <div className="y-axis-label">$0</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <div className="monetization-options">
                                        <Card title="Ad Settings">
                                            <div className="ad-settings">
                                                <div className="setting-group">
                                                    <h4>Default Ad Formats</h4>
                                                    <div className="checkbox-options">
                                                        <label className="checkbox-option">
                                                            <input type="checkbox" checked onChange={() => { }} />
                                                            <span>Display ads</span>
                                                        </label>
                                                        <label className="checkbox-option">
                                                            <input type="checkbox" checked onChange={() => { }} />
                                                            <span>Overlay ads</span>
                                                        </label>
                                                        <label className="checkbox-option">
                                                            <input type="checkbox" checked onChange={() => { }} />
                                                            <span>Skippable video ads</span>
                                                        </label>
                                                        <label className="checkbox-option">
                                                            <input type="checkbox" checked onChange={() => { }} />
                                                            <span>Non-skippable video ads</span>
                                                        </label>
                                                    </div>
                                                    <Button variant="outline" size="small">
                                                        Update Ad Preferences
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card title="Monetization Status">
                                            <div className="monetization-status">
                                                <div className="status-item">
                                                    <div className="status-icon success">
                                                        <span className="material-icons">check_circle</span>
                                                    </div>
                                                    <div className="status-info">
                                                        <h4>Monetization enabled</h4>
                                                        <p>Your channel is eligible for monetization</p>
                                                    </div>
                                                </div>
                                                <div className="status-item">
                                                    <div className="status-icon success">
                                                        <span className="material-icons">check_circle</span>
                                                    </div>
                                                    <div className="status-info">
                                                        <h4>AdSense account linked</h4>
                                                        <p>Payments will be processed through your AdSense account</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline">
                                                    View Payment Settings
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            id: 'playlists',
                            label: 'Playlists',
                            icon: 'playlist_play',
                            content: (
                                <div className="playlists-tab-content">
                                    <div className="playlists-header">
                                        <Button
                                            variant="primary"
                                            icon="playlist_add"
                                            onClick={() => showSuccessToast('Playlist creation will be available soon!')}
                                        >
                                            Create Playlist
                                        </Button>
                                    </div>
                                    <div className="playlists-grid">
                                        <div className="playlist-card">
                                            <div className="playlist-thumbnail">
                                                <img src="https://via.placeholder.com/480x360?text=Electoral+Series" alt="Electoral Reform Series" />
                                                <div className="playlist-count">3 videos</div>
                                            </div>
                                            <div className="playlist-info">
                                                <h3 className="playlist-title">Electoral Reform Series</h3>
                                                <div className="playlist-visibility">
                                                    <span className="material-icons">public</span>
                                                    Public
                                                </div>
                                                <Button variant="outline" size="small">Manage</Button>
                                            </div>
                                        </div>
                                        <div className="playlist-card">
                                            <div className="playlist-thumbnail">
                                                <img src="https://via.placeholder.com/480x360?text=Climate+Series" alt="Climate Policy Series" />
                                                <div className="playlist-count">2 videos</div>
                                            </div>
                                            <div className="playlist-info">
                                                <h3 className="playlist-title">Climate Policy Series</h3>
                                                <div className="playlist-visibility">
                                                    <span className="material-icons">public</span>
                                                    Public
                                                </div>
                                                <Button variant="outline" size="small">Manage</Button>
                                            </div>
                                        </div>
                                        <div className="playlist-card">
                                            <div className="playlist-thumbnail">
                                                <img src="https://via.placeholder.com/480x360?text=Upcoming" alt="Upcoming Videos" />
                                                <div className="playlist-count">5 videos</div>
                                            </div>
                                            <div className="playlist-info">
                                                <h3 className="playlist-title">Upcoming Videos</h3>
                                                <div className="playlist-visibility">
                                                    <span className="material-icons">lock</span>
                                                    Private
                                                </div>
                                                <Button variant="outline" size="small">Manage</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ),
                        },
                    ]}
                />
            )}

            {/* API Key Configuration Modal */}
            <Modal
                isOpen={isApiKeyModalOpen}
                onClose={() => {
                    if (isAuthenticated) {
                        closeApiKeyModal();
                    }
                }}
                title="YouTube API Configuration"
                actions={
                    <Button
                        variant="primary"
                        onClick={handleApiKeySubmit}
                        disabled={isConfiguring}
                    >
                        {isConfiguring ? 'Configuring...' : 'Save API Key'}
                    </Button>
                }
            >
                <div className="api-key-form">
                    <p>Enter your YouTube Data API key to connect to YouTube Studio. You can get an API key from the <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer">Google Developer Console</a>.</p>

                    <div className="form-group">
                        <label htmlFor="api-key">YouTube API Key</label>
                        <input
                            type="text"
                            id="api-key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                            required
                        />
                    </div>

                    {isAuthenticated && (
                        <div className="current-config">
                            <h4>Current Configuration</h4>
                            <p>Your YouTube API is currently configured. Updating the key will replace the existing configuration.</p>
                        </div>
                    )}

                    <div className="api-instructions">
                        <h4>How to get a YouTube API Key:</h4>
                        <ol>
                            <li>Go to the <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer">Google Developer Console</a></li>
                            <li>Create a new project or select an existing one</li>
                            <li>Enable the YouTube Data API v3</li>
                            <li>Create credentials for an API key</li>
                            <li>Copy the API key and paste it here</li>
                        </ol>
                    </div>
                </div>
            </Modal>

            {/* Video Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={closeUploadModal}
                title="Upload Video"
                size="large"
                actions={
                    <>
                        <Button variant="outline" onClick={closeUploadModal}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUploadSubmit}
                            disabled={!uploadForm.title || !uploadForm.videoFile}
                        >
                            Upload
                        </Button>
                    </>
                }
            >
                <form className="upload-form">
                    <div className="upload-section">
                        <div className="upload-file-area">
                            <input
                                type="file"
                                id="video-file"
                                accept="video/*"
                                onChange={(e) => setUploadForm({
                                    ...uploadForm,
                                    videoFile: e.target.files ? e.target.files[0] : null
                                })}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="video-file" className="video-upload-label">
                                {uploadForm.videoFile ? (
                                    <div className="file-selected">
                                        <span className="material-icons">check_circle</span>
                                        <span>{uploadForm.videoFile.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="material-icons upload-icon">cloud_upload</span>
                                        <span>Click to select video file</span>
                                        <span className="upload-hint">MP4, MOV, AVI (max 10GB)</span>
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="upload-fields">
                            <div className="form-group">
                                <label htmlFor="video-title">Title (required)</label>
                                <input
                                    type="text"
                                    id="video-title"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    placeholder="Enter video title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="video-description">Description</label>
                                <textarea
                                    id="video-description"
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                    placeholder="Enter video description"
                                    rows={4}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="video-tags">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    id="video-tags"
                                    value={uploadForm.tags}
                                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                                    placeholder="politics, electoral reform, etc."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="upload-settings">
                        <div className="form-group">
                            <label htmlFor="video-visibility">Visibility</label>
                            <select
                                id="video-visibility"
                                value={uploadForm.visibility}
                                onChange={(e) => setUploadForm({ ...uploadForm, visibility: e.target.value })}
                            >
                                <option value="private">Private</option>
                                <option value="unlisted">Unlisted</option>
                                <option value="public">Public</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="video-schedule">Schedule (optional)</label>
                            <input
                                type="datetime-local"
                                id="video-schedule"
                                value={uploadForm.scheduledPublishTime}
                                onChange={(e) => setUploadForm({ ...uploadForm, scheduledPublishTime: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="video-thumbnail">Custom Thumbnail (optional)</label>
                            <input
                                type="file"
                                id="video-thumbnail"
                                accept="image/*"
                                onChange={(e) => setUploadForm({
                                    ...uploadForm,
                                    thumbnail: e.target.files ? e.target.files[0] : null
                                })}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="video-thumbnail" className="thumbnail-upload-label">
                                {uploadForm.thumbnail ? (
                                    <div className="thumbnail-preview">
                                        <img
                                            src={URL.createObjectURL(uploadForm.thumbnail)}
                                            alt="Thumbnail preview"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <span className="material-icons">add_photo_alternate</span>
                                        <span>Select thumbnail</span>
                                    </>
                                )}
                            </label>
                            <div className="thumbnail-hint">
                                For best results use an image at least 1280x720px (16:9 ratio)
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Video Details Modal */}
            <Modal
                isOpen={isVideoDetailsModalOpen}
                onClose={closeVideoDetailsModal}
                title={selectedVideo ? selectedVideo.title : 'Video Details'}
                size="large"
            >
                {selectedVideo && (
                    <div className="video-details">
                        <div className="video-details-header">
                            <div className="video-details-thumbnail">
                                <img src={selectedVideo.thumbnailUrl} alt={selectedVideo.title} />
                            </div>
                            <div className="video-details-info">
                                <div className="video-details-meta">
                                    <div className="meta-item">
                                        <span className="material-icons">visibility</span>
                                        <span>{formatNumber(selectedVideo.viewCount)} views</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="material-icons">thumb_up</span>
                                        <span>{formatNumber(selectedVideo.likeCount)} likes</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="material-icons">comment</span>
                                        <span>{formatNumber(selectedVideo.commentCount)} comments</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="material-icons">schedule</span>
                                        <span>{formatDate(selectedVideo.publishedAt)}</span>
                                    </div>
                                </div>
                                <div className="video-details-description">
                                    <h4>Description</h4>
                                    <p>{selectedVideo.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="video-details-tabs">
                            <Tabs
                                tabs={[
                                    {
                                        id: 'edit',
                                        label: 'Edit Details',
                                        content: (
                                            <div className="edit-video-form">
                                                <form onSubmit={handleEditVideoSubmit}>
                                                    <div className="form-group">
                                                        <label htmlFor="edit-title">Title</label>
                                                        <input
                                                            type="text"
                                                            id="edit-title"
                                                            value={editVideoForm.title}
                                                            onChange={(e) => setEditVideoForm({ ...editVideoForm, title: e.target.value })}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="edit-description">Description</label>
                                                        <textarea
                                                            id="edit-description"
                                                            value={editVideoForm.description}
                                                            onChange={(e) => setEditVideoForm({ ...editVideoForm, description: e.target.value })}
                                                            rows={5}
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="edit-tags">Tags (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            id="edit-tags"
                                                            value={editVideoForm.tags}
                                                            onChange={(e) => setEditVideoForm({ ...editVideoForm, tags: e.target.value })}
                                                            placeholder="politics, electoral reform, etc."
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="edit-visibility">Visibility</label>
                                                        <select
                                                            id="edit-visibility"
                                                            value={editVideoForm.visibility}
                                                            onChange={(e) => setEditVideoForm({
                                                                ...editVideoForm,
                                                                visibility: e.target.value as 'public' | 'private' | 'unlisted'
                                                            })}
                                                        >
                                                            <option value="private">Private</option>
                                                            <option value="unlisted">Unlisted</option>
                                                            <option value="public">Public</option>
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="edit-thumbnail">Replace Thumbnail (optional)</label>
                                                        <input
                                                            type="file"
                                                            id="edit-thumbnail"
                                                            accept="image/*"
                                                            onChange={(e) => setEditVideoForm({
                                                                ...editVideoForm,
                                                                thumbnail: e.target.files ? e.target.files[0] : null
                                                            })}
                                                            style={{ display: 'none' }}
                                                        />
                                                        <label htmlFor="edit-thumbnail" className="thumbnail-upload-label">
                                                            {editVideoForm.thumbnail ? (
                                                                <div className="thumbnail-preview">
                                                                    <img
                                                                        src={URL.createObjectURL(editVideoForm.thumbnail)}
                                                                        alt="Thumbnail preview"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <span className="material-icons">add_photo_alternate</span>
                                                                    <span>Select new thumbnail</span>
                                                                </>
                                                            )}
                                                        </label>
                                                    </div>

                                                    <div className="form-actions">
                                                        <Button variant="outline" onClick={closeVideoDetailsModal}>
                                                            Cancel
                                                        </Button>
                                                        <Button variant="primary" type="submit">
                                                            Save Changes
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        ),
                                    },
                                    {
                                        id: 'analytics',
                                        label: 'Analytics',
                                        content: (
                                            <div className="video-analytics">
                                                <div className="analytics-summary">
                                                    <Card className="analytics-card">
                                                        <div className="analytics-card-header">
                                                            <h3>Views</h3>
                                                        </div>
                                                        <div className="analytics-value">{formatNumber(selectedVideo.viewCount)}</div>
                                                        <div className="analytics-trend positive">
                                                            <span className="material-icons">trending_up</span>
                                                            12% from previous week
                                                        </div>
                                                    </Card>

                                                    <Card className="analytics-card">
                                                        <div className="analytics-card-header">
                                                            <h3>Watch Time</h3>
                                                        </div>
                                                        <div className="analytics-value">
                                                            {formatWatchTime(parseInt(selectedVideo.duration.split(':')[0]) * 60 + parseInt(selectedVideo.duration.split(':')[1]) * selectedVideo.viewCount)}
                                                        </div>
                                                        <div className="analytics-trend positive">
                                                            <span className="material-icons">trending_up</span>
                                                            8% from previous week
                                                        </div>
                                                    </Card>

                                                    <Card className="analytics-card">
                                                        <div className="analytics-card-header">
                                                            <h3>Avg. View Duration</h3>
                                                        </div>
                                                        <div className="analytics-value">3:45</div>
                                                        <div className="analytics-trend negative">
                                                            <span className="material-icons">trending_down</span>
                                                            2% from previous week
                                                        </div>
                                                    </Card>

                                                    <Card className="analytics-card">
                                                        <div className="analytics-card-header">
                                                            <h3>Engagement</h3>
                                                        </div>
                                                        <div className="analytics-value">4.2%</div>
                                                        <div className="analytics-trend positive">
                                                            <span className="material-icons">trending_up</span>
                                                            5% from previous week
                                                        </div>
                                                    </Card>
                                                </div>

                                                <Card title="Audience Retention">
                                                    <div className="audience-retention-chart">
                                                        <div className="chart-placeholder">
                                                            <div className="line-chart">
                                                                <svg viewBox="0 0 500 200" width="100%" height="200">
                                                                    <path
                                                                        d="M0,200 L0,100 C50,120 100,80 150,95 C200,110 250,60 300,50 C350,40 400,70 450,90 L500,140 L500,200 Z"
                                                                        fill="rgba(59, 130, 246, 0.1)"
                                                                        stroke="#3b82f6"
                                                                        strokeWidth="2"
                                                                    />
                                                                </svg>
                                                                <div className="chart-labels">
                                                                    <div className="chart-label">0%</div>
                                                                    <div className="chart-label">25%</div>
                                                                    <div className="chart-label">50%</div>
                                                                    <div className="chart-label">75%</div>
                                                                    <div className="chart-label">100%</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="retention-insight">
                                                            <div className="insight-icon">
                                                                <span className="material-icons">lightbulb</span>
                                                            </div>
                                                            <div className="insight-text">
                                                                <h4>Insight</h4>
                                                                <p>Viewers are dropping off around the 5-minute mark. Consider adding more engaging content or visual aids in that section.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>

                                                <div className="traffic-sources">
                                                    <Card title="Traffic Sources">
                                                        <div className="traffic-sources-list">
                                                            <div className="traffic-source-item">
                                                                <div className="source-name">YouTube search</div>
                                                                <div className="source-bar-container">
                                                                    <div className="source-bar" style={{ width: '60%' }}></div>
                                                                </div>
                                                                <div className="source-value">60%</div>
                                                            </div>
                                                            <div className="traffic-source-item">
                                                                <div className="source-name">External websites</div>
                                                                <div className="source-bar-container">
                                                                    <div className="source-bar" style={{ width: '15%' }}></div>
                                                                </div>
                                                                <div className="source-value">15%</div>
                                                            </div>
                                                            <div className="traffic-source-item">
                                                                <div className="source-name">Suggested videos</div>
                                                                <div className="source-bar-container">
                                                                    <div className="source-bar" style={{ width: '12%' }}></div>
                                                                </div>
                                                                <div className="source-value">12%</div>
                                                            </div>
                                                            <div className="traffic-source-item">
                                                                <div className="source-name">Browse features</div>
                                                                <div className="source-bar-container">
                                                                    <div className="source-bar" style={{ width: '8%' }}></div>
                                                                </div>
                                                                <div className="source-value">8%</div>
                                                            </div>
                                                            <div className="traffic-source-item">
                                                                <div className="source-name">Others</div>
                                                                <div className="source-bar-container">
                                                                    <div className="source-bar" style={{ width: '5%' }}></div>
                                                                </div>
                                                                <div className="source-value">5%</div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        id: 'comments-tab',
                                        label: 'Comments',
                                        content: (
                                            <div className="comments-section">
                                                {filteredComments.length > 0 ? (
                                                    <div className="comments-list">
                                                        {filteredComments.filter(c => !c.isReply).map(comment => (
                                                            <div key={comment.id} className="comment-item">
                                                                <div className="comment-avatar">
                                                                    <img src={comment.authorProfileImageUrl} alt={comment.authorName} />
                                                                </div>
                                                                <div className="comment-content">
                                                                    <div className="comment-header">
                                                                        <h4 className="comment-author">{comment.authorName}</h4>
                                                                        <span className="comment-date">{formatDate(comment.publishedAt)}</span>
                                                                    </div>
                                                                    <div className="comment-text">{comment.text}</div>
                                                                    <div className="comment-meta">
                                                                        <span className="comment-likes">
                                                                            <span className="material-icons">thumb_up</span>
                                                                            {comment.likeCount}
                                                                        </span>
                                                                        <div className="comment-actions">
                                                                            <button className="btn-text comment-action">Reply</button>
                                                                            <button className="btn-text comment-action">Report</button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Show replies */}
                                                                    {comments.filter(c => c.isReply && c.parentId === comment.id).map(reply => (
                                                                        <div key={reply.id} className="comment-reply">
                                                                            <div className="comment-avatar">
                                                                                <img src={reply.authorProfileImageUrl} alt={reply.authorName} />
                                                                            </div>
                                                                            <div className="comment-content">
                                                                                <div className="comment-header">
                                                                                    <h4 className="comment-author">{reply.authorName}</h4>
                                                                                    <span className="comment-date">{formatDate(reply.publishedAt)}</span>
                                                                                </div>
                                                                                <div className="comment-text">{reply.text}</div>
                                                                                <div className="comment-meta">
                                                                                    <span className="comment-likes">
                                                                                        <span className="material-icons">thumb_up</span>
                                                                                        {reply.likeCount}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}

                                                                    {/* Reply form */}
                                                                    <div className="reply-form">
                                                                        <textarea
                                                                            placeholder="Write a reply..."
                                                                            rows={1}
                                                                            className="reply-input"
                                                                        ></textarea>
                                                                        <div className="reply-actions">
                                                                            <Button variant="text" size="small">
                                                                                Cancel
                                                                            </Button>
                                                                            <Button variant="primary" size="small">
                                                                                Reply
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <EmptyState
                                                        title="No comments found"
                                                        description="This video doesn't have any comments yet."
                                                        icon="comment"
                                                    />
                                                )}
                                            </div>
                                        ),
                                    },
                                    {
                                        id: 'seo',
                                        label: 'SEO',
                                        content: (
                                            <div className="seo-tab">
                                                <div className="seo-overview">
                                                    <Card title="SEO Performance">
                                                        <div className="seo-score">
                                                            <div className="score-circle">
                                                                <svg viewBox="0 0 36 36">
                                                                    <path
                                                                        d="M18 2.0845
                                      a 15.9155 15.9155 0 0 1 0 31.831
                                      a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                        fill="none"
                                                                        stroke="#E6E6E6"
                                                                        strokeWidth="3"
                                                                    />
                                                                    <path
                                                                        d="M18 2.0845
                                      a 15.9155 15.9155 0 0 1 0 31.831
                                      a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                        fill="none"
                                                                        stroke="#3B82F6"
                                                                        strokeWidth="3"
                                                                        strokeDasharray="75, 100"
                                                                    />
                                                                </svg>
                                                                <div className="score-text">75</div>
                                                            </div>
                                                            <div className="score-info">
                                                                <h3>SEO Score</h3>
                                                                <p>Your video is performing well but has room for improvement.</p>
                                                            </div>
                                                        </div>

                                                        <div className="seo-checklist">
                                                            <h4>Optimization Checklist</h4>
                                                            <div className="checklist-item checked">
                                                                <span className="material-icons">check_circle</span>
                                                                <span>Title contains relevant keywords</span>
                                                            </div>
                                                            <div className="checklist-item checked">
                                                                <span className="material-icons">check_circle</span>
                                                                <span>Description is detailed (100+ words)</span>
                                                            </div>
                                                            <div className="checklist-item checked">
                                                                <span className="material-icons">check_circle</span>
                                                                <span>Tags are relevant and comprehensive</span>
                                                            </div>
                                                            <div className="checklist-item unchecked">
                                                                <span className="material-icons">radio_button_unchecked</span>
                                                                <span>Custom thumbnail could be more clickable</span>
                                                            </div>
                                                            <div className="checklist-item unchecked">
                                                                <span className="material-icons">radio_button_unchecked</span>
                                                                <span>Add timestamps in description</span>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </div>

                                                <Card title="Keyword Performance">
                                                    <div className="keyword-performance">
                                                        <div className="keyword-list">
                                                            <div className="keyword-item">
                                                                <div className="keyword-name">electoral reform</div>
                                                                <div className="keyword-rank">#4 in search</div>
                                                                <div className="keyword-impressions">5.2K impressions</div>
                                                            </div>
                                                            <div className="keyword-item">
                                                                <div className="keyword-name">voting systems explained</div>
                                                                <div className="keyword-rank">#12 in search</div>
                                                                <div className="keyword-impressions">2.8K impressions</div>
                                                            </div>
                                                            <div className="keyword-item">
                                                                <div className="keyword-name">proportional representation</div>
                                                                <div className="keyword-rank">#15 in search</div>
                                                                <div className="keyword-impressions">1.5K impressions</div>
                                                            </div>
                                                        </div>

                                                        <div className="keyword-suggestions">
                                                            <h4>Keyword Suggestions</h4>
                                                            <div className="suggestion-item">
                                                                <div className="suggestion-text">Add "electoral system comparison" to tags</div>
                                                                <div className="suggestion-value">2.5K monthly searches</div>
                                                                <Button variant="text" size="small">Add</Button>
                                                            </div>
                                                            <div className="suggestion-item">
                                                                <div className="suggestion-text">Add "voting reform debate" to tags</div>
                                                                <div className="suggestion-value">1.8K monthly searches</div>
                                                                <Button variant="text" size="small">Add</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal
                isOpen={isConfirmDeleteModalOpen}
                onClose={closeConfirmDeleteModal}
                title="Confirm Delete"
                actions={
                    <>
                        <Button variant="outline" onClick={closeConfirmDeleteModal}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDeleteVideo}>
                            Delete
                        </Button>
                    </>
                }
            >
                <div className="confirm-delete-content">
                    <div className="warning-icon">
                        <span className="material-icons">warning</span>
                    </div>
                    <p>Are you sure you want to delete this video? This action cannot be undone.</p>
                    {videoToDelete && (
                        <div className="video-to-delete">
                            <div className="video-delete-thumbnail">
                                <img
                                    src={videos.find(v => v.id === videoToDelete)?.thumbnailUrl}
                                    alt="Video thumbnail"
                                />
                            </div>
                            <div className="video-delete-info">
                                <h4>{videos.find(v => v.id === videoToDelete)?.title}</h4>
                                <p>{formatDate(videos.find(v => v.id === videoToDelete)?.publishedAt || '')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default YouTubeStudio;