// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Topic {
    id: string;
    title: string;
    description?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface ResearchNote {
    id: string;
    topicId: string;
    title: string;
    content: string;
    sources: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface ContentPlan {
    id: string;
    title: string;
    description: string;
    scheduledDate?: Date;
    topics: string[];
    status: 'idea' | 'planning' | 'research' | 'scripting' | 'recording' | 'editing' | 'published';
    createdAt: Date;
    updatedAt: Date;
}

interface Script {
    id: string;
    contentPlanId: string;
    title: string;
    sections: ScriptSection[];
    createdAt: Date;
    updatedAt: Date;
}

interface ScriptSection {
    id: string;
    title: string;
    content: string;
    notes?: string;
    duration?: number;
}

interface AppContextType {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    topics: Topic[];
    addTopic: (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateTopic: (id: string, topic: Partial<Topic>) => void;
    deleteTopic: (id: string) => void;
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateResearchNote: (id: string, note: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;
    contentPlans: ContentPlan[];
    addContentPlan: (plan: Omit<ContentPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateContentPlan: (id: string, plan: Partial<ContentPlan>) => void;
    deleteContentPlan: (id: string) => void;
    scripts: Script[];
    addScript: (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateScript: (id: string, script: Partial<Script>) => void;
    deleteScript: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme as 'light' | 'dark') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });
    const [topics, setTopics] = useState<Topic[]>([]);
    const [researchNotes, setResearchNotes] = useState<ResearchNote[]>([]);
    const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
    const [scripts, setScripts] = useState<Script[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Load data from localStorage on initial load
    useEffect(() => {
        try {
            const savedTopics = localStorage.getItem('topics');
            const savedNotes = localStorage.getItem('researchNotes');
            const savedPlans = localStorage.getItem('contentPlans');
            const savedScripts = localStorage.getItem('scripts');

            if (savedTopics) setTopics(JSON.parse(savedTopics));
            if (savedNotes) setResearchNotes(JSON.parse(savedNotes));
            if (savedPlans) setContentPlans(JSON.parse(savedPlans));
            if (savedScripts) setScripts(JSON.parse(savedScripts));
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('theme', theme);
        localStorage.setItem('topics', JSON.stringify(topics));
        localStorage.setItem('researchNotes', JSON.stringify(researchNotes));
        localStorage.setItem('contentPlans', JSON.stringify(contentPlans));
        localStorage.setItem('scripts', JSON.stringify(scripts));
    }, [theme, topics, researchNotes, contentPlans, scripts]);

    // Helper functions for CRUD operations
    const addTopic = (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newTopic: Topic = {
            ...topic,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setTopics(prev => [...prev, newTopic]);
    };

    const updateTopic = (id: string, topic: Partial<Topic>) => {
        setTopics(prev =>
            prev.map(t => t.id === id ? { ...t, ...topic, updatedAt: new Date() } : t)
        );
    };

    const deleteTopic = (id: string) => {
        setTopics(prev => prev.filter(t => t.id !== id));
    };

    const addResearchNote = (note: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newNote: ResearchNote = {
            ...note,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setResearchNotes(prev => [...prev, newNote]);
    };

    const updateResearchNote = (id: string, note: Partial<ResearchNote>) => {
        setResearchNotes(prev =>
            prev.map(n => n.id === id ? { ...n, ...note, updatedAt: new Date() } : n)
        );
    };

    const deleteResearchNote = (id: string) => {
        setResearchNotes(prev => prev.filter(n => n.id !== id));
    };

    const addContentPlan = (plan: Omit<ContentPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newPlan: ContentPlan = {
            ...plan,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setContentPlans(prev => [...prev, newPlan]);
    };

    const updateContentPlan = (id: string, plan: Partial<ContentPlan>) => {
        setContentPlans(prev =>
            prev.map(p => p.id === id ? { ...p, ...plan, updatedAt: new Date() } : p)
        );
    };

    const deleteContentPlan = (id: string) => {
        setContentPlans(prev => prev.filter(p => p.id !== id));
    };

    const addScript = (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newScript: Script = {
            ...script,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setScripts(prev => [...prev, newScript]);
    };

    const updateScript = (id: string, script: Partial<Script>) => {
        setScripts(prev =>
            prev.map(s => s.id === id ? { ...s, ...script, updatedAt: new Date() } : s)
        );
    };

    const deleteScript = (id: string) => {
        setScripts(prev => prev.filter(s => s.id !== id));
    };

    const value = {
        theme,
        setTheme,
        topics,
        addTopic,
        updateTopic,
        deleteTopic,
        researchNotes,
        addResearchNote,
        updateResearchNote,
        deleteResearchNote,
        contentPlans,
        addContentPlan,
        updateContentPlan,
        deleteContentPlan,
        scripts,
        addScript,
        updateScript,
        deleteScript,
        searchQuery,
        setSearchQuery
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};