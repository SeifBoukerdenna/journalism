// src/contexts/AppContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as firebaseService from '../firebase/firebaseService';
// import { initializeFirebaseData } from '../firebase/initializeFirebaseData';
import { showSuccessToast, showErrorToast } from '../utils/toastService';

interface Topic {
    id: string;
    title: string;
    description?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    isFavorite?: boolean;
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

interface ScriptSection {
    id: string;
    title: string;
    content: string;
    notes?: string;
    duration?: number;
}

interface Script {
    id: string;
    contentPlanId: string;
    title: string;
    sections: ScriptSection[];
    createdAt: Date;
    updatedAt: Date;
}

interface AppContextType {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    topics: Topic[];
    addTopic: (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
    updateTopic: (id: string, topic: Partial<Topic>) => Promise<void>;
    deleteTopic: (id: string) => Promise<void>;
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateResearchNote: (id: string, note: Partial<ResearchNote>) => Promise<void>;
    deleteResearchNote: (id: string) => Promise<void>;
    contentPlans: ContentPlan[];
    addContentPlan: (plan: Omit<ContentPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateContentPlan: (id: string, plan: Partial<ContentPlan>) => Promise<void>;
    deleteContentPlan: (id: string) => Promise<void>;
    scripts: Script[];
    addScript: (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Script>;
    updateScript: (id: string, script: Partial<Script>, options?: { showToast?: boolean }) => Promise<void>;
    deleteScript: (id: string) => Promise<void>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isLoading: boolean;
    // Favorites functionality
    favoriteTopics: string[];
    addToFavorites: (id: string) => void;
    removeFromFavorites: (id: string) => void;
    toggleFavorite: (id: string) => void;
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
    const [isLoading, setIsLoading] = useState(true);

    // Favorites state - both localStorage and Firebase
    const [favoriteTopics, setFavoriteTopics] = useState<string[]>(() => {
        const savedFavorites = localStorage.getItem('favoriteTopics');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });

    // Save theme to localStorage and Firebase
    useEffect(() => {
        localStorage.setItem('theme', theme);
        // Save theme preference to Firebase
        firebaseService.saveUserSettings({ theme })
            .catch(error => console.error('Error saving theme preference:', error));
    }, [theme]);

    // Save favorites to localStorage and Firebase when they change
    useEffect(() => {
        localStorage.setItem('favoriteTopics', JSON.stringify(favoriteTopics));
        // Save favorites to Firebase
        firebaseService.saveFavoriteTopics(favoriteTopics)
            .catch(error => console.error('Error saving favorites to Firebase:', error));
    }, [favoriteTopics]);

    // Load data from Firebase on initial load
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Initialize Firebase with sample data if collections are empty
                // await initializeFirebaseData();

                // Load user settings first
                const settings = await firebaseService.getUserSettings();
                if (settings) {
                    // Apply theme preference if available
                    if (settings.theme) {
                        setTheme(settings.theme);
                    }

                    // Load favorite topics from settings
                    if (settings.favoriteTopics) {
                        setFavoriteTopics(settings.favoriteTopics);
                    }
                }

                // Load all data in parallel
                const [topicsData, notesData, plansData, scriptsData] = await Promise.all([
                    firebaseService.getTopics(),
                    firebaseService.getResearchNotes(),
                    firebaseService.getContentPlans(),
                    firebaseService.getScripts()
                ]);

                // Mark topics that are favorites
                const enhancedTopics = topicsData.map(topic => ({
                    ...topic,
                    isFavorite: favoriteTopics.includes(topic.id)
                }));

                setTopics(enhancedTopics as Topic[]);
                setResearchNotes(notesData as ResearchNote[]);
                setContentPlans(plansData as ContentPlan[]);
                setScripts(scriptsData as Script[]);
            } catch (error) {
                console.error('Error loading data from Firebase:', error);
                showErrorToast('Failed to load data from the database');

                // Fall back to localStorage
                try {
                    const savedTopics = localStorage.getItem('topics');
                    const savedNotes = localStorage.getItem('researchNotes');
                    const savedPlans = localStorage.getItem('contentPlans');
                    const savedScripts = localStorage.getItem('scripts');

                    if (savedTopics) {
                        const parsedTopics = JSON.parse(savedTopics);
                        // Mark topics that are favorites
                        const enhancedTopics = parsedTopics.map((topic: any) => ({
                            ...topic,
                            isFavorite: favoriteTopics.includes(topic.id)
                        }));
                        setTopics(enhancedTopics);
                    }
                    if (savedNotes) setResearchNotes(JSON.parse(savedNotes));
                    if (savedPlans) setContentPlans(JSON.parse(savedPlans));
                    if (savedScripts) setScripts(JSON.parse(savedScripts));

                    showSuccessToast('Loaded data from local storage instead');
                } catch (localStorageError) {
                    console.error('Local storage fallback failed:', localStorageError);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Functions for topics CRUD operations
    const addTopic = async (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newTopic = await firebaseService.addTopic(topic) as Topic;
            setTopics(prev => [newTopic, ...prev]);
            showSuccessToast('Topic created successfully');
            return newTopic;
        } catch (error) {
            console.error('Error adding topic:', error);
            showErrorToast('Failed to create topic');
            throw error;
        }
    };

    const updateTopic = async (id: string, topic: Partial<Topic>) => {
        try {
            await firebaseService.updateTopic(id, topic);
            setTopics(prev =>
                prev.map(t => t.id === id ? { ...t, ...topic, updatedAt: new Date() } : t)
            );
            showSuccessToast('Topic updated successfully');
        } catch (error) {
            console.error('Error updating topic:', error);
            showErrorToast('Failed to update topic');
            throw error;
        }
    };

    const deleteTopic = async (id: string) => {
        try {
            await firebaseService.deleteTopic(id);

            // Also delete related research notes
            const relatedNotes = researchNotes.filter(note => note.topicId === id);
            for (const note of relatedNotes) {
                await firebaseService.deleteResearchNote(note.id);
            }

            setTopics(prev => prev.filter(t => t.id !== id));
            setResearchNotes(prev => prev.filter(note => note.topicId !== id));

            // Also remove from favorites if it's there
            if (favoriteTopics.includes(id)) {
                setFavoriteTopics(prev => prev.filter(topicId => topicId !== id));
            }

            showSuccessToast('Topic deleted successfully');
        } catch (error) {
            console.error('Error deleting topic:', error);
            showErrorToast('Failed to delete topic');
            throw error;
        }
    };

    // Functions for research notes CRUD operations
    const addResearchNote = async (note: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newNote = await firebaseService.addResearchNote(note) as ResearchNote;
            setResearchNotes(prev => [newNote, ...prev]);
            showSuccessToast('Research note added successfully');
        } catch (error) {
            console.error('Error adding research note:', error);
            showErrorToast('Failed to add research note');
            throw error;
        }
    };

    const updateResearchNote = async (id: string, note: Partial<ResearchNote>) => {
        try {
            await firebaseService.updateResearchNote(id, note);
            setResearchNotes(prev =>
                prev.map(n => n.id === id ? { ...n, ...note, updatedAt: new Date() } : n)
            );
            showSuccessToast('Research note updated successfully');
        } catch (error) {
            console.error('Error updating research note:', error);
            showErrorToast('Failed to update research note');
            throw error;
        }
    };

    const deleteResearchNote = async (id: string) => {
        try {
            await firebaseService.deleteResearchNote(id);
            setResearchNotes(prev => prev.filter(n => n.id !== id));
            showSuccessToast('Research note deleted successfully');
        } catch (error) {
            console.error('Error deleting research note:', error);
            showErrorToast('Failed to delete research note');
            throw error;
        }
    };

    // Functions for content plans CRUD operations
    const addContentPlan = async (plan: Omit<ContentPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newPlan = await firebaseService.addContentPlan(plan) as ContentPlan;
            setContentPlans(prev => [newPlan, ...prev]);
            showSuccessToast('Content plan created successfully');
        } catch (error) {
            console.error('Error adding content plan:', error);
            showErrorToast('Failed to create content plan');
            throw error;
        }
    };

    const updateContentPlan = async (id: string, plan: Partial<ContentPlan>) => {
        try {
            await firebaseService.updateContentPlan(id, plan);
            setContentPlans(prev =>
                prev.map(p => p.id === id ? { ...p, ...plan, updatedAt: new Date() } : p)
            );
            showSuccessToast('Content plan updated successfully');
        } catch (error) {
            console.error('Error updating content plan:', error);
            showErrorToast('Failed to update content plan');
            throw error;
        }
    };

    const deleteContentPlan = async (id: string) => {
        try {
            await firebaseService.deleteContentPlan(id);
            setContentPlans(prev => prev.filter(p => p.id !== id));
            showSuccessToast('Content plan deleted successfully');
        } catch (error) {
            console.error('Error deleting content plan:', error);
            showErrorToast('Failed to delete content plan');
            throw error;
        }
    };

    // Functions for scripts CRUD operations
    const addScript = async (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newScript = await firebaseService.addScript(script) as Script;
            setScripts(prev => [newScript, ...prev]);
            showSuccessToast('Script created successfully');
            return newScript;
        } catch (error) {
            console.error('Error adding script:', error);
            showErrorToast('Failed to create script');
            throw error;
        }
    };

    const updateScript = async (id: string, script: Partial<Script>, options?: { showToast?: boolean }) => {
        try {
            if (!id) return;
            await firebaseService.updateScript(id, script);
            setScripts(prev =>
                prev.map(s => s.id === id ? { ...s, ...script, updatedAt: new Date() } : s)
            );

            // Only show toast when explicitly requested (for significant changes)
            // or for manual saves, not during typing
            if (options?.showToast) {
                showSuccessToast('Script updated successfully');
            }
        } catch (error) {
            console.error('Error updating script:', error);
            // Only show error toast for major operations, not during typing
            if (options?.showToast) {
                showErrorToast('Failed to update script');
            }
            throw error;
        }
    };

    const deleteScript = async (id: string) => {
        try {
            await firebaseService.deleteScript(id);
            setScripts(prev => prev.filter(s => s.id !== id));
            showSuccessToast('Script deleted successfully');
        } catch (error) {
            console.error('Error deleting script:', error);
            showErrorToast('Failed to delete script');
            throw error;
        }
    };

    // Favorites management functions
    const addToFavorites = (id: string) => {
        if (!favoriteTopics.includes(id)) {
            const newFavorites = [...favoriteTopics, id];
            setFavoriteTopics(newFavorites);

            // Update the isFavorite property on the topic
            setTopics(prev =>
                prev.map(topic => topic.id === id ? { ...topic, isFavorite: true } : topic)
            );

            // Update in Firebase
            updateTopic(id, { isFavorite: true }).catch(error => {
                console.error("Error updating favorite status in database:", error);
            });

            showSuccessToast('Topic added to favorites');
        }
    };

    const removeFromFavorites = (id: string) => {
        const newFavorites = favoriteTopics.filter(topicId => topicId !== id);
        setFavoriteTopics(newFavorites);

        // Update the isFavorite property on the topic
        setTopics(prev =>
            prev.map(topic => topic.id === id ? { ...topic, isFavorite: false } : topic)
        );

        // Update in Firebase
        updateTopic(id, { isFavorite: false }).catch(error => {
            console.error("Error updating favorite status in database:", error);
        });

        showSuccessToast('Topic removed from favorites');
    };

    const toggleFavorite = (id: string) => {
        if (favoriteTopics.includes(id)) {
            removeFromFavorites(id);
        } else {
            addToFavorites(id);
        }
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
        setSearchQuery,
        isLoading,
        // Favorites functionality
        favoriteTopics,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};