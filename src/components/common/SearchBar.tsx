// src/components/common/SearchBar.tsx
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';

const SearchBar = () => {
    const { searchQuery, setSearchQuery } = useAppContext();
    const [isActive, setIsActive] = useState<boolean>(searchQuery ? true : false);
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery) {
            console.log('Searching for:', searchQuery);
            // Implement additional search logic if needed

            // On mobile, we may want to blur the input after submission
            if (window.innerWidth <= 768) {
                inputRef.current?.blur();
            }
        }
    };

    // Focus input when activated
    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();

            // On mobile, scroll to make sure the search input is visible
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }, [isActive]);

    // Handle outside click to deactivate search when empty
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                formRef.current &&
                !formRef.current.contains(e.target as Node) &&
                !searchQuery
            ) {
                setIsActive(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchQuery]);

    // Handle escape key to clear search or close search
    useEffect(() => {
        const handleEscKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (searchQuery) {
                    setSearchQuery('');
                } else if (isActive) {
                    setIsActive(false);
                    inputRef.current?.blur();
                }
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [searchQuery, isActive, setSearchQuery]);

    return (
        <div className="search-container">
            <form
                ref={formRef}
                onSubmit={handleSearchSubmit}
                className={`search-form ${isActive ? 'active' : ''}`}
            >
                {isActive ? (
                    <>
                        <span className="search-icon-left">
                            <span className="material-icons">search</span>
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            className="search-input"
                            placeholder="Search topics, content, notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={(e) => {
                                // Only deactivate if clicked outside and empty
                                if (!searchQuery && !formRef.current?.contains(e.relatedTarget as Node)) {
                                    setIsActive(false);
                                }
                            }}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="search-clear"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        )}
                    </>
                ) : (
                    <button
                        type="button"
                        className="search-toggle"
                        onClick={() => setIsActive(true)}
                        aria-label="Search"
                    >
                        <span className="material-icons">search</span>
                        <span className="search-label">Search</span>
                    </button>
                )}
            </form>
        </div>
    );
};

export default SearchBar;