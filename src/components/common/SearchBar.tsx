import React, { memo, useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setSearchQuery, clearSearch } from '../../store/slices/uiSlice';
import { selectCryptoSearching, selectCryptoError } from '../../store/slices/cryptoSlice';
import { useToast } from './ToastContainer';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = memo(({ 
  placeholder = "Search cryptocurrencies...", 
  className = "" 
}) => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(state => state.ui.searchQuery);
  const isSearching = useAppSelector(selectCryptoSearching);
  const searchError = useAppSelector(selectCryptoError);
  const { showError } = useToast();
  const [localValue, setLocalValue] = useState(searchQuery);

  const DEBOUNCE_DELAY = 300; // milliseconds

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localValue !== searchQuery) {
        try {
          dispatch(setSearchQuery(localValue));
        } catch (error) {
          console.error('Search error:', error);
          showError('Search Error', 'Failed to perform search. Please try again.');
        }
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [localValue, searchQuery, dispatch, showError]);

  useEffect(() => {
    if (searchError && typeof searchError === 'object' && (searchError as any).isSearchError) {
      showError('Search Failed', (searchError as any).message);
    }
  }, [searchError, showError]);

  useEffect(() => {
    if (searchQuery !== localValue) {
      setLocalValue(searchQuery);
    }
  }, [searchQuery]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    dispatch(clearSearch());
  }, [dispatch]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400 dark:text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md"
          autoComplete="off"
          spellCheck="false"
        />
        
        {localValue && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={handleClear}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
              aria-label="Clear search"
            >
              <svg 
                className="h-4 w-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Search status indicator */}
      {(localValue !== searchQuery && localValue.length > 0) || isSearching ? (
        <div className="absolute top-full left-0 mt-2 z-10">
          <div className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {isSearching ? 'Searching...' : 'Typing...'}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;