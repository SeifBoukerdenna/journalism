// src/components/common/TopBar.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

interface TopBarProps {
    toggleMobileNav: () => void;
    toggleSidebarCollapse: () => void;
    isSidebarCollapsed: boolean;
}

const TopBar = ({ toggleMobileNav, toggleSidebarCollapse, isSidebarCollapsed }: TopBarProps) => {
    const navigate = useNavigate();
    const { theme, setTheme, searchQuery, setSearchQuery } = useAppContext();
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Handle click outside notifications
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle search activation
    useEffect(() => {
        if (isSearchActive && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchActive]);

    // Handle search submission
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery) {
            // Trigger search across the app
            console.log('Searching for:', searchQuery);
            // You can navigate to a search results page or handle it within the current context
        }
    };

    // Recently viewed or created content (mock data)
    const recentItems = [
        { id: '1', title: 'Electoral Reform', type: 'script', path: '/script' },
        { id: '2', title: 'Climate Policy Research', type: 'research', path: '/research' },
        { id: '3', title: 'Voting Rights', type: 'content', path: '/planner' },
    ];

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button
                    className="mobile-sidebar-toggle"
                    onClick={toggleMobileNav}
                    aria-label="Toggle menu"
                >
                    <span className="material-icons">menu</span>
                </button>

                <button
                    className="sidebar-toggle-btn"
                    onClick={toggleSidebarCollapse}
                    aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <span className="material-icons">
                        {isSidebarCollapsed ? 'menu_open' : 'menu'}
                    </span>
                </button>

                <div className="search-container">
                    <form onSubmit={handleSearchSubmit}>
                        {isSearchActive ? (
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="search-input"
                                placeholder="Search topics, content, notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onBlur={() => {
                                    if (!searchQuery) setIsSearchActive(false);
                                }}
                            />
                        ) : (
                            <button
                                type="button"
                                className="btn-icon search-toggle"
                                onClick={() => setIsSearchActive(true)}
                                aria-label="Search"
                            >
                                <span className="material-icons">search</span>
                                <span className="search-label">Search</span>
                            </button>
                        )}
                    </form>
                </div>

                <div className="quick-nav">
                    {recentItems.map(item => (
                        <button
                            key={item.id}
                            className="quick-nav-item"
                            onClick={() => navigate(item.path)}
                        >
                            <span className="material-icons">
                                {item.type === 'script' ? 'description' :
                                    item.type === 'research' ? 'book' : 'video_library'}
                            </span>
                            <span>{item.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="topbar-actions">
                <button
                    className="btn-icon with-text"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    <span className="material-icons">
                        {theme === 'light' ? 'dark_mode' : 'light_mode'}
                    </span>
                    <span className="btn-text">
                        {theme === 'light' ? 'Dark' : 'Light'}
                    </span>
                </button>

                <div className="notifications-dropdown" ref={notificationRef}>
                    <button
                        className="btn-icon"
                        onClick={() => {
                            setIsNotificationsOpen(!isNotificationsOpen);
                            setIsUserMenuOpen(false);
                        }}
                        aria-label="Notifications"
                    >
                        <span className="material-icons">notifications</span>
                        <span className="notification-indicator"></span>
                    </button>

                    {isNotificationsOpen && (
                        <div className="notifications-panel">
                            <div className="notifications-header">
                                <h3>Notifications</h3>
                                <button className="btn-text">Mark all as read</button>
                            </div>
                            <div className="notifications-list">
                                <div className="notification-item unread">
                                    <span className="material-icons notification-icon">schedule</span>
                                    <div className="notification-content">
                                        <p>Reminder: Video "Electoral Reform" scheduled for tomorrow</p>
                                        <span className="notification-time">2 hours ago</span>
                                    </div>
                                    <button className="btn-icon notification-action">
                                        <span className="material-icons">more_vert</span>
                                    </button>
                                </div>
                                <div className="notification-item">
                                    <span className="material-icons notification-icon">trending_up</span>
                                    <div className="notification-content">
                                        <p>Your video "Climate Policy" reached 1,000 views!</p>
                                        <span className="notification-time">Yesterday</span>
                                    </div>
                                    <button className="btn-icon notification-action">
                                        <span className="material-icons">more_vert</span>
                                    </button>
                                </div>
                                <div className="notification-item">
                                    <span className="material-icons notification-icon">comment</span>
                                    <div className="notification-content">
                                        <p>New comment on "Voting Rights Explained"</p>
                                        <span className="notification-time">2 days ago</span>
                                    </div>
                                    <button className="btn-icon notification-action">
                                        <span className="material-icons">more_vert</span>
                                    </button>
                                </div>
                            </div>
                            <div className="notifications-footer">
                                <button className="btn-text">View all notifications</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="profile-menu" ref={userMenuRef}>
                    <button
                        className="profile-button"
                        onClick={() => {
                            setIsUserMenuOpen(!isUserMenuOpen);
                            setIsNotificationsOpen(false);
                        }}
                    >
                        <div className="profile-avatar">YC</div>
                    </button>

                    {isUserMenuOpen && (
                        <div className="user-menu">
                            <div className="user-menu-header">
                                <div className="user-info">
                                    <div className="profile-avatar large">YC</div>
                                    <div>
                                        <h4>Your Channel</h4>
                                        <p>Political Analysis</p>
                                    </div>
                                </div>
                            </div>
                            <div className="user-menu-items">
                                <button className="user-menu-item" onClick={() => navigate('/settings')}>
                                    <span className="material-icons">person</span>
                                    <span>Profile</span>
                                </button>
                                <button className="user-menu-item" onClick={() => navigate('/settings')}>
                                    <span className="material-icons">settings</span>
                                    <span>Settings</span>
                                </button>
                                <button className="user-menu-item">
                                    <span className="material-icons">help</span>
                                    <span>Help & Support</span>
                                </button>
                                <button className="user-menu-item">
                                    <span className="material-icons">logout</span>
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;