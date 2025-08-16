import React from 'react';
import PriceChart from './PriceChart';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinId: string;
  coinName: string;
  coinSymbol: string;
}

const ChartModal: React.FC<ChartModalProps> = ({ 
  isOpen, 
  onClose, 
  coinId, 
  coinName, 
  coinSymbol 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {coinName} ({coinSymbol.toUpperCase()}) Price Chart
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chart Content */}
        <div className="p-6">
          <PriceChart 
            coinId={coinId} 
            height={400}
            showTimeframeSelector={true}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ChartModal;