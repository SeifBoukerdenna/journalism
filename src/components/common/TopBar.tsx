// src/components/common/TopBar.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import SearchBar from './SearchBar';

// Import the enhanced search styles
import '../../styles/enhanced-search.css';

interface TopBarProps {
    toggleMobileNav: () => void;
    toggleSidebarCollapse: () => void;
    isSidebarCollapsed: boolean;
}

const TopBar = ({ }: TopBarProps) => {
    const navigate = useNavigate();
    const { theme, setTheme } = useAppContext();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Handle clicks outside dropdowns
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

    return (
        <header className="topbar">
            <div className="topbar-left">
                <SearchBar />
            </div>

            <div className="topbar-actions">
                {/* Theme toggle button */}
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

                {/* Notifications dropdown */}
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

                {/* User profile menu */}
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