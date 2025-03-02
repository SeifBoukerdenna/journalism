// src/components/common/Sidebar.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

interface SidebarProps {
    isMobileOpen: boolean;
    toggleMobileNav: () => void;
}

const Sidebar = ({ isMobileOpen, toggleMobileNav }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { contentPlans, theme, setTheme } = useAppContext();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Count upcoming videos (scheduled in the next 7 days)
    const upcomingVideos = contentPlans.filter(plan => {
        if (!plan.scheduledDate) return false;
        const scheduleDate = new Date(plan.scheduledDate);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        return scheduleDate >= today && scheduleDate <= nextWeek;
    }).length;

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: 'dashboard' },
        { path: '/research', label: 'Research Hub', icon: 'search' },
        { path: '/planner', label: 'Content Planner', icon: 'calendar_month', badge: upcomingVideos > 0 ? upcomingVideos : undefined },
        { path: '/script', label: 'Script Editor', icon: 'edit_note' },
        { path: '/settings', label: 'Settings', icon: 'settings' }
    ];

    // Close mobile sidebar when route changes
    useEffect(() => {
        if (isMobileOpen) {
            toggleMobileNav();
        }
    }, [location.pathname]);

    // Add event listener for screen resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleCreateContent = () => {
        // Navigate to content planner and open the modal
        navigate('/planner', { state: { openContentModal: true } });
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <>
            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={toggleMobileNav}
                />
            )}

            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    {!isCollapsed && <h2>Content Studio</h2>}
                    <button
                        className="sidebar-collapse-btn"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <span className="material-icons">
                            {isCollapsed ? 'chevron_right' : 'chevron_left'}
                        </span>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path} className={isActive ? 'active' : ''}>
                                    <Link to={item.path} title={isCollapsed ? item.label : undefined}>
                                        <span className="material-icons">{item.icon}</span>
                                        {!isCollapsed && (
                                            <>
                                                <span className="menu-label">{item.label}</span>
                                                {item.badge && <span className="badge">{item.badge}</span>}
                                            </>
                                        )}
                                        {isCollapsed && item.badge && <span className="badge mini">{item.badge}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button
                        className={`btn-create ${isCollapsed ? 'mini' : ''}`}
                        onClick={handleCreateContent}
                        title={isCollapsed ? "New Content" : undefined}
                    >
                        <span className="material-icons">add</span>
                        {!isCollapsed && <span>New Content</span>}
                    </button>
                </div>

                {!isCollapsed && (
                    <div className="sidebar-theme-toggle" onClick={toggleTheme}>
                        <span className="material-icons">
                            {theme === 'light' ? 'dark_mode' : 'light_mode'}
                        </span>
                        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;