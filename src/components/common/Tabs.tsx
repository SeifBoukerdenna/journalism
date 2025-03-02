// src/components/common/Tabs.tsx
import { ReactNode, useState } from 'react';

interface Tab {
    id: string;
    label: string;
    icon?: string;
    content: ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    defaultActiveTab?: string;
    onChange?: (tabId: string) => void;
    variant?: 'default' | 'pills' | 'underline';
}

const Tabs = ({ tabs, defaultActiveTab, onChange, variant = 'default' }: TabsProps) => {
    const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id || '');

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (onChange) {
            onChange(tabId);
        }
    };

    return (
        <div className="tabs-container">
            <div className={`tabs-header tabs-${variant}`}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.icon && <span className="material-icons tab-icon">{tab.icon}</span>}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            <div className="tabs-content">
                {tabs.find((tab) => tab.id === activeTab)?.content}
            </div>
        </div>
    );
};

export default Tabs;