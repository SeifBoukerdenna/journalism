// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/common/Sidebar';
import TopBar from './components/common/TopBar';
import Dashboard from './pages/Dashboard';
import ResearchHub from './pages/ResearchHub';
import ContentPlanner from './pages/ContentPlanner';
import ScriptEditor from './pages/ScriptEditor';
import Settings from './pages/Settings';
import KeyboardShortcutsHelp from './components/common/KeyboardShortcutsHelp';
import { useAppContext } from './contexts/AppContext';
import { showSuccessToast } from './utils/toastService';

// Import CSS files
import './App.css';
import './styles/enhanced-script-editor.css';
import './styles/content-planner.css';
import './styles/topbar.css';

function App() {
  const { theme, isLoading } = useAppContext();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Simulate app loading after Firebase data is loaded
  useEffect(() => {
    if (!isLoading) {
      // Show welcome toast after loading
      setTimeout(() => {
        setIsAppLoaded(true);
        setTimeout(() => {
          showSuccessToast('Your workspace is ready', {
            title: 'Welcome back!',
            duration: 3000
          });
        }, 1000);
      }, 500);
    }
  }, [isLoading]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Show keyboard shortcuts help dialog (Ctrl + /)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsHelpOpen(true);
      }

      // Other global shortcuts could be added here
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Close mobile nav when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create toast container for notifications
  useEffect(() => {
    // Check if toast container exists, create if not
    if (!document.getElementById('toast-container')) {
      const toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    return () => {
      const container = document.getElementById('toast-container');
      if (container) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // Handle errors
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Application error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (hasError) {
    return (
      <div className={`error-container ${theme}`}>
        <div className="error-content">
          <div className="error-icon">
            <span className="material-icons">error</span>
          </div>
          <h1>Something went wrong</h1>
          <p>We're sorry, but there was an error loading the application.</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !isAppLoaded) {
    return (
      <div className={`loading-screen ${theme}`}>
        <div className="loading-content">
          <h1>Content Studio</h1>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>{isLoading ? 'Loading data from the cloud...' : 'Preparing your workspace...'}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`app-container ${theme}`}>
        <Sidebar
          isMobileOpen={isMobileNavOpen}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={toggleSidebarCollapse}
          toggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        />

        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <TopBar
            toggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
            toggleSidebarCollapse={toggleSidebarCollapse}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          <div className="page-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/research" element={<ResearchHub />} />
              <Route path="/planner" element={<ContentPlanner />} />
              <Route path="/script" element={<ScriptEditor />} />
              <Route path="/settings" element={<Settings />} />

              {/* Fallback route for 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>

        {/* Mobile menu toggle button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-icons">
            {isMobileNavOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Keyboard shortcuts help dialog */}
        <KeyboardShortcutsHelp
          isOpen={isShortcutsHelpOpen}
          onClose={() => setIsShortcutsHelpOpen(false)}
        />
      </div>
    </Router>
  );
}

export default App;