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
import './App.css'; // Main app styles
import './enhanced-styles.css'; // Enhanced styles


function App() {
  const { theme } = useAppContext();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  // Simulate app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoaded(true);
      // Show welcome toast after loading
      setTimeout(() => {
        showSuccessToast('Your workspace is ready', {
          title: 'Welcome back!',
          duration: 3000
        });
      }, 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  if (hasError) {
    return (
      <div className="error-container">
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

  if (!isAppLoaded) {
    return (
      <div className={`loading-screen ${theme}`}>
        <div className="loading-content">
          <h1>Content Studio</h1>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`app-container ${theme}`}>
        <Sidebar
          isMobileOpen={isMobileNavOpen}
          toggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        />

        <div className="main-content">
          <TopBar
            toggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
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

        {/* Toast notifications container */}
        <div id="toast-container" className="toast-container"></div>
      </div>
    </Router>
  );
}

export default App;