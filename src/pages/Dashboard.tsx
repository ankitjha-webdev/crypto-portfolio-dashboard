import React, { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchCoins, selectCryptoLoading, selectCryptoError, selectAllCoins, selectLastUpdated, selectFilteredCoins, retryLastFailedAction } from '../store/slices/cryptoSlice';
import { CryptoTable, FilterControls } from '../components/dashboard';
import { SearchBar, LoadingSpinner, ErrorBoundary, ErrorDisplay } from '../components/common';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectCryptoLoading);
  const error = useAppSelector(selectCryptoError);
  const coins = useAppSelector(selectAllCoins);
  const filteredCoins = useAppSelector(selectFilteredCoins);
  const lastUpdated = useAppSelector(selectLastUpdated);

  useEffect(() => {
    dispatch(fetchCoins(50));
  }, [dispatch]);

  const formatLastUpdated = useCallback((timestamp: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  }, []);

  const handleRefresh = useCallback(() => {
    dispatch(fetchCoins(50));
  }, [dispatch]);

  const handleRetry = useCallback(() => {
    dispatch(retryLastFailedAction());
  }, [dispatch]);

  const formattedLastUpdated = useMemo(() => formatLastUpdated(lastUpdated), [formatLastUpdated, lastUpdated]);

  if (loading && coins.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <LoadingSpinner
          size="lg"
          text="Loading..."
          centered
          className="min-h-[400px]"
        />
      </div>
    );
  }

  if (error && coins.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="max-w-md w-full">
            <ErrorDisplay
              error={error}
              onRetry={handleRefresh}
              size="large"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Crypto Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track cryptocurrency prices and market trends
          </p>
        </div>

        <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4">
          <div className="text-xs xs:text-sm text-gray-500 dark:text-gray-400 order-2 xs:order-1">
            <span className="inline">Last updated: </span>
            <span className="font-medium">{formattedLastUpdated}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md order-1 xs:order-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span className="inline">Refreshing...</span>
                {/* <span className="xs:hidden">Loading</span> */}
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="inline">Refresh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 animate-fade-in">
          <ErrorDisplay
            error={error}
            onRetry={handleRetry}
            size="medium"
          />
        </div>
      )}

      {/* Search and Filter Controls */}
      <ErrorBoundary fallback={
        <div className="mb-6">
          <ErrorDisplay
            error="Failed to load search and filter controls"
            size="small"
          />
        </div>
      }>
        <div className="mb-6 space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <SearchBar placeholder="Search cryptocurrencies..." />
            </div>
          </div>
          <FilterControls />
        </div>
      </ErrorBoundary>

      {/* Crypto Table */}
      <ErrorBoundary fallback={
        <ErrorDisplay
          error="Failed to load cryptocurrency table"
          onRetry={handleRefresh}
          size="large"
        />
      }>
        <div className="animate-fade-in">
          <CryptoTable filteredCoins={filteredCoins} />
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default Dashboard;
