'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { StockData, StockAnalysis } from '@/types/stock';
import { fetchStockData, fetchCompanyOverview } from '@/services/alphaVantage';
import { generateStockAnalysis } from '@/services/openai';
import { saveAnalysis } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (analysis: StockAnalysis) => void;
}

export default function AnalysisModal({ isOpen, onClose, onSave }: AnalysisModalProps) {
  const { user } = useAuth();
  const [stockSymbol, setStockSymbol] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (stockSymbol) {
      const fetchData = async () => {
        try {
          const data = await fetchStockData(stockSymbol);
          setStockData(data);
        } catch {
          setErrorMessage('Failed to fetch stock data');
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [stockSymbol]);

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage('You must be logged in to generate analysis');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Fetch latest stock data and company overview
      const [latestStockData, companyOverview] = await Promise.all([
        fetchStockData(stockSymbol),
        fetchCompanyOverview(stockSymbol),
      ]);

      // Generate AI analysis
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stockSymbol,
          stockData: latestStockData,
          companyOverview,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate analysis');
      }

      const { sentiment, aiInsight, news } = await response.json();

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
      console.error('Error in handleSubmit:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-gray-800 text-gray-400 hover:text-gray-300 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-white">
                      New Stock Analysis
                    </Dialog.Title>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="stock-symbol" className="block text-sm font-medium text-white">
                          Stock Symbol
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="stock-symbol"
                            id="stock-symbol"
                            value={stockSymbol}
                            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                            className="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g., AAPL"
                          />
                        </div>
                      </div>

                      {stockData && (
                        <div className="rounded-md bg-gray-700 p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-white">{stockSymbol}</p>
                              <p className="text-2xl font-semibold text-white">${stockData.price.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${parseFloat(stockData.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {stockData.change} ({stockData.changePercent}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {errorMessage && (
                        <div className="text-sm text-red-400">
                          {errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                    onClick={handleSubmit}
                    disabled={isLoading || !stockSymbol}
                  >
                    {isLoading ? 'Generating Analysis...' : 'Generate Analysis'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 