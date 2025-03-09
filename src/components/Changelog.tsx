// src/components/Changelog.tsx
import React, { useState, useEffect } from 'react';
import changeLogData from '../data/changeLog.json'; // Adjust path as needed
import './Changelog.css';


interface ChangeLogEntry {
    version: string;
    date: string;
    changes: string[];
}

const Changelog: React.FC = () => {
    const [changelog, setChangelog] = useState<ChangeLogEntry[]>([]);

    useEffect(() => {
        // In a real app, you could fetch from an API or Firestore.
        // For now, we just load the static JSON.
        setChangelog(changeLogData as ChangeLogEntry[]);
    }, []);

    return (
        <div className="changelog-container">
            <h2>Changelog</h2>
            <p>Here’s a history of recent releases and updates made for you.</p>

            {changelog.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon material-icons">history</span>
                    <h3 className="empty-state-title">No Changelog Found</h3>
                    <p className="empty-state-description">
                        It looks like there aren't any recorded changes yet.
                    </p>
                </div>
            ) : (
                <ul className="changelog-list">
                    {changelog.map((entry, idx) => (
                        <li key={idx} className="changelog-item">
                            <div className="changelog-header">
                                <h3 className="changelog-version">Version {entry.version}</h3>
                                <span className="changelog-date">
                                    {/* Format date nicely if you like */}
                                    {new Date(entry.date).toLocaleDateString()}
                                </span>
                            </div>
                            <ul className="changelog-changes">
                                {entry.changes.map((change, cIdx) => (
                                    <li key={cIdx}>• {change}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Changelog;
