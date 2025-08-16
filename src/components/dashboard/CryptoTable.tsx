import React, { memo, useCallback, useState } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { selectAllCoins, selectCryptoLoading, selectCryptoRefreshing } from '../../store/slices/cryptoSlice';
import { toggleSort } from '../../store/slices/uiSlice';
import { formatCurrency, formatPercentage, formatLargeNumber } from '../../utils/formatters';
import { SkeletonCryptoTable } from '../common';
import ChartModal from '../charts/ChartModal';

interface CryptoTableProps {
    filteredCoins?: any[];
}

const CryptoTable: React.FC<CryptoTableProps> = memo(({ filteredCoins }) => {
    const dispatch = useAppDispatch();
    const allCoins = useAppSelector(selectAllCoins);
    const loading = useAppSelector(selectCryptoLoading);
    const refreshing = useAppSelector(selectCryptoRefreshing);
    const sortConfig = useAppSelector(state => state.ui.sortConfig);
    
    const [chartModal, setChartModal] = useState<{
        isOpen: boolean;
        coinId: string;
        coinName: string;
        coinSymbol: string;
    }>({
        isOpen: false,
        coinId: '',
        coinName: '',
        coinSymbol: '',
    });

    const coins = filteredCoins || allCoins;

    const handleSort = useCallback((key: string) => {
        dispatch(toggleSort(key));
    }, [dispatch]);

    const handleOpenChart = useCallback((coin: any) => {
        setChartModal({
            isOpen: true,
            coinId: coin.id,
            coinName: coin.name,
            coinSymbol: coin.symbol,
        });
    }, []);

    const handleCloseChart = useCallback(() => {
        setChartModal({
            isOpen: false,
            coinId: '',
            coinName: '',
            coinSymbol: '',
        });
    }, []);

    const getSortIcon = useCallback((key: string) => {
        if (sortConfig.key !== key) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }

        return sortConfig.direction === 'asc' ? (
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4V20m0-16l-4 4m4-4l4 4" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m0 16l-4-4m4 4l4-4" />
            </svg>
        );
    }, [sortConfig]);

    const renderTableHeader = () => (
        <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                        onClick={() => handleSort('market_cap_rank')}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
                    >
                        <span>Rank</span>
                        {getSortIcon('market_cap_rank')}
                    </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
                    >
                        <span>Name</span>
                        {getSortIcon('name')}
                    </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                        onClick={() => handleSort('symbol')}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
                    >
                        <span>Symbol</span>
                        {getSortIcon('symbol')}
                    </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                        onClick={() => handleSort('current_price')}
                        className="flex items-center justify-end space-x-1 hover:text-gray-700 dark:hover:text-gray-100 transition-colors w-full"
                    >
                        <span>Price</span>
                        {getSortIcon('current_price')}
                    </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                        onClick={() => handleSort('price_change_percentage_24h')}
                        className="flex items-center justify-end space-x-1 hover:text-gray-700 dark:hover:text-gray-100 transition-colors w-full"
                    >
                        <span>24h Change</span>
                        {getSortIcon('price_change_percentage_24h')}
                    </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                        onClick={() => handleSort('market_cap')}
                        className="flex items-center justify-end space-x-1 hover:text-gray-700 dark:hover:text-gray-100 transition-colors w-full"
                    >
                        <span>Market Cap</span>
                        {getSortIcon('market_cap')}
                    </button>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                </th>
            </tr>
        </thead>
    );

    const renderCoinRow = useCallback((coin: any, index: number) => {
        const priceChangeClass = coin.price_change_percentage_24h >= 0
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400';

        return (
            <tr
                key={coin.id}
                className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                    } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
            >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{coin.market_cap_rank}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                            <img
                                className="h-8 w-8 rounded-full"
                                src={coin.image}
                                alt={coin.name}
                                loading="lazy"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-coin.svg';
                                }}
                            />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {coin.name}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 uppercase font-medium">
                    {coin.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                    {formatCurrency(coin.current_price)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${priceChangeClass}`}>
                    <div className="flex items-center justify-end">
                        {coin.price_change_percentage_24h >= 0 ? (
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {formatPercentage(coin.price_change_percentage_24h)}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                    {formatLargeNumber(coin.market_cap)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                        onClick={() => handleOpenChart(coin)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="View Price Chart"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </button>
                </td>
            </tr>
        );
    }, []);

    if (loading && coins.length === 0) {
        return <SkeletonCryptoTable />;
    }

    if (coins.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No data available</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        No cryptocurrency data matches your current filters.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {refreshing && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 sm:px-6 py-3">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-sm text-blue-800 dark:text-blue-200">Updating prices...</span>
                    </div>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    {renderTableHeader()}
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {coins.map((coin, index) => renderCoinRow(coin, index))}
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {coins.map((coin) => (
                        <div key={coin.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <img
                                            className="h-10 w-10 rounded-full"
                                            src={coin.image}
                                            alt={coin.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-coin.svg';
                                            }}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {coin.name}
                                            </p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                #{coin.market_cap_rank}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                                            {coin.symbol}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(coin.current_price)}
                                    </p>
                                    <div className={`flex items-center justify-end text-sm font-medium ${coin.price_change_percentage_24h >= 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {coin.price_change_percentage_24h >= 0 ? (
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {formatPercentage(coin.price_change_percentage_24h)}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Market Cap</span>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatLargeNumber(coin.market_cap)}
                                    </p>
                                </div>
                                <div className="xs:text-right">
                                    <span className="text-gray-500 dark:text-gray-400">24h Volume</span>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatLargeNumber(coin.total_volume || 0)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={() => handleOpenChart(coin)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    View Chart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {coins.length} {coins.length === 1 ? 'cryptocurrency' : 'cryptocurrencies'}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Chart Modal */}
        <ChartModal
            isOpen={chartModal.isOpen}
            onClose={handleCloseChart}
            coinId={chartModal.coinId}
            coinName={chartModal.coinName}
            coinSymbol={chartModal.coinSymbol}
        />
        </>
    );
});

CryptoTable.displayName = 'CryptoTable';

export default CryptoTable;