// src/components/common/LoadingScreen.tsx
import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <h1>Content Studio</h1>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
                <p>Loading your workspace from the cloud...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;