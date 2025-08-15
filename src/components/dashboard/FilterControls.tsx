import React, { memo, useCallback } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { 
  setMarketCapFilter, 
  setPriceChangeFilter, 
  clearFilters 
} from '../../store/slices/uiSlice';

interface FilterControlsProps {
  className?: string;
}

const FilterControls: React.FC<FilterControlsProps> = memo(({ className = "" }) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.ui.filters);

  const handleMarketCapFilter = useCallback((filter: 'all' | 'top10' | 'top50') => {
    dispatch(setMarketCapFilter(filter));
  }, [dispatch]);

  const handlePriceChangeFilter = useCallback((filter: 'all' | 'positive' | 'negative') => {
    dispatch(setPriceChangeFilter(filter));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const hasActiveFilters = filters.marketCapFilter !== 'all' || filters.priceChangeFilter !== 'all';

  const FilterButton: React.FC<{
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    variant?: 'default' | 'positive' | 'negative';
  }> = ({ active, onClick, children, variant = 'default' }) => {
    const baseClasses = "px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800";
    
    let variantClasses = "";
    if (variant === 'positive') {
      variantClasses = active 
        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20";
    } else if (variant === 'negative') {
      variantClasses = active 
        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20";
    } else {
      variantClasses = active 
        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700"
        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600";
    }

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-start lg:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
          {/* Market Cap Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Market Cap
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filters.marketCapFilter === 'all'}
                onClick={() => handleMarketCapFilter('all')}
              >
                All
              </FilterButton>
              <FilterButton
                active={filters.marketCapFilter === 'top10'}
                onClick={() => handleMarketCapFilter('top10')}
              >
                Top 10
              </FilterButton>
              <FilterButton
                active={filters.marketCapFilter === 'top50'}
                onClick={() => handleMarketCapFilter('top50')}
              >
                Top 50
              </FilterButton>
            </div>
          </div>

          {/* Price Change Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              24h Change
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filters.priceChangeFilter === 'all'}
                onClick={() => handlePriceChangeFilter('all')}
              >
                All
              </FilterButton>
              <FilterButton
                active={filters.priceChangeFilter === 'positive'}
                onClick={() => handlePriceChangeFilter('positive')}
                variant="positive"
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden xs:inline">Positive</span>
                  <span className="xs:hidden">+</span>
                </div>
              </FilterButton>
              <FilterButton
                active={filters.priceChangeFilter === 'negative'}
                onClick={() => handlePriceChangeFilter('negative')}
                variant="negative"
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden xs:inline">Negative</span>
                  <span className="xs:hidden">-</span>
                </div>
              </FilterButton>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-start lg:justify-end">
            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active:</span>
            {filters.marketCapFilter !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                {filters.marketCapFilter === 'top10' ? 'Top 10' : 'Top 50'} by Market Cap
              </span>
            )}
            {filters.priceChangeFilter !== 'all' && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                filters.priceChangeFilter === 'positive' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
              }`}>
                {filters.priceChangeFilter === 'positive' ? 'Positive' : 'Negative'} 24h Change
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

FilterControls.displayName = 'FilterControls';

export default FilterControls;