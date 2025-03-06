// src/components/common/SearchBar.tsx
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';

const SearchBar = () => {
    const { searchQuery, setSearchQuery } = useAppContext();
    const [isActive, setIsActive] = useState<boolean>(searchQuery ? true : false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery) {
            console.log('Searching for:', searchQuery);
            // Implement additional search logic if needed
        }
    };

    // Focus input when activated
    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isActive]);

    // Handle outside click to deactivate search when empty
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target as Node) &&
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

    return (
        <div className="search-container">
            <form onSubmit={handleSearchSubmit} className={`search-form ${isActive ? 'active' : ''}`}>
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
                            onBlur={() => {
                                if (!searchQuery) setIsActive(false);
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