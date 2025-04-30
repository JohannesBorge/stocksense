'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StockAnalysis } from '@/types/stock';
import { fetchStockData } from '@/services/marketstack';
import { getCompanyInfo } from '@/services/company';
import { generateStockAnalysis } from '@/services/openai';
import { saveAnalysis } from '@/services/firebase';
import { createPortal } from 'react-dom';

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
      console.log('Starting analysis generation for symbol:', stockSymbol);
      
      // Fetch latest stock data and company overview
      console.log('Fetching stock data and company info...');
      const [latestStockData, companyOverview] = await Promise.all([
        fetchStockData(stockSymbol),
        getCompanyInfo(stockSymbol),
      ]);
      console.log('Stock data and company info fetched successfully');

      // Generate AI analysis
      console.log('Generating AI analysis...');
      const { sentiment, aiInsight, news } = await generateStockAnalysis(
        stockSymbol,
        latestStockData,
        companyOverview
      );
      console.log('AI analysis generated successfully');

      // Create the analysis object
      const analysis: StockAnalysis = {
        symbol: stockSymbol,
        companyName: companyOverview.name,
        price: latestStockData.price,
        change: latestStockData.change,
        changePercent: latestStockData.changePercent,
        news: news.map(item => ({
          title: item.title,
          url: `https://www.google.com/search?q=${encodeURIComponent(item.title)}`,
          publishedAt: item.date,
          source: item.source
        })),
        sentiment,
        aiInsight,
        date: new Date().toISOString().split('T')[0],
      };

      // Save to Firebase
      console.log('Saving analysis to Firebase...');
      await saveAnalysis(user.uid, analysis);
      console.log('Analysis saved successfully');

      // Update UI
      onSave(analysis);
      onClose();
    } catch (error) {
      console.error('Error in analysis generation:', error);
      let errorMessage = 'Failed to generate analysis';
      
      if (error instanceof Error) {
        if (error.message.includes('Marketstack API')) {
          errorMessage = 'Failed to fetch stock data. Please check if the symbol is correct and try again.';
        } else if (error.message.includes('OpenAI')) {
          errorMessage = 'Failed to generate AI analysis. Please try again in a few moments.';
        } else if (error.message.includes('Firebase')) {
          errorMessage = 'Failed to save analysis. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/20 flex items-center justify-center p-4 z-50">
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
    </div>,
    document.body
  );
} 