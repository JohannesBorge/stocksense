'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StockAnalysis } from '@/types/stock';
import { fetchStockData } from '@/services/marketstack';
import { getCompanyInfo } from '@/services/company';
import { generateStockAnalysis } from '@/services/ai';
import { saveAnalysis } from '@/services/firebase';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (analysis: StockAnalysis) => void;
}

export default function AnalysisModal({ isOpen, onClose, onSave }: AnalysisModalProps) {
  const { user } = useAuth();
  const [stockSymbol, setStockSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('You must be logged in to generate analysis');
      return;
    }

    if (!stockSymbol) {
      setErrorMessage('Please enter a stock symbol');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Fetch latest stock data and company overview
      const [latestStockData, companyOverview] = await Promise.all([
        fetchStockData(stockSymbol),
        getCompanyInfo(stockSymbol),
      ]);

      // Generate AI analysis
      const { sentiment, aiInsight, news } = await generateStockAnalysis(
        stockSymbol,
        latestStockData,
        companyOverview
      );

      // Create the analysis object
      const analysis: StockAnalysis = {
        symbol: stockSymbol,
        companyName: companyOverview.name,
        price: latestStockData.price,
        change: latestStockData.change,
        changePercent: latestStockData.changePercent,
        news,
        sentiment,
        aiInsight,
        date: new Date().toISOString().split('T')[0],
      };

      // Save to Firebase
      await saveAnalysis(user.uid, analysis);

      // Update UI
      onSave(analysis);
      onClose();
    } catch (error) {
      console.error('Error generating analysis:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">New Stock Analysis</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-300">
              Stock Symbol
            </label>
            <input
              type="text"
              id="symbol"
              value={stockSymbol}
              onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
              className="mt-1 block w-full rounded-md border-0 bg-gray-700 px-3 py-2 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              placeholder="e.g., AAPL"
              disabled={isLoading}
            />
          </div>

          {errorMessage && (
            <div className="text-red-400 text-sm">{errorMessage}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Analysis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 