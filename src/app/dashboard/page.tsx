'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import StockCard from '@/components/StockCard';
import AnalysisModal from '@/components/AnalysisModal';
import ChatBox from '@/components/ChatBox';
import { StockAnalysis } from '@/types/stock';
import { getUserAnalyses, updateAnalysis, deleteAnalysis } from '@/services/firebase';
import { priceCache } from '@/services/priceCache';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stocks, setStocks] = useState<StockAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadAnalyses = async () => {
      if (user) {
        try {
          setIsLoading(true);
          setError(null);
          const analyses = await getUserAnalyses(user.uid);
          setStocks(analyses);
          
          // Start price updates for all stocks
          const symbols = analyses.map(stock => stock.symbol);
          priceCache.startUpdates(symbols);
        } catch (err) {
          console.error('Error loading analyses:', err);
          setError('Failed to load stock analyses. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAnalyses();

    // Cleanup price updates when component unmounts
    return () => {
      priceCache.stopUpdates();
    };
  }, [user]);

  // Update prices from cache
  useEffect(() => {
    if (!stocks.length) return;

    const updatePrices = async () => {
      try {
        const updatedStocks = await Promise.all(
          stocks.map(async (stock) => {
            const cachedData = await priceCache.getPrice(stock.symbol);
            if (cachedData) {
              return {
                ...stock,
                price: cachedData.price,
                change: cachedData.change,
                changePercent: cachedData.changePercent,
                date: cachedData.lastUpdated.toISOString().split('T')[0],
              };
            }
              return stock;
          })
        );

        setStocks(updatedStocks);
      } catch (error) {
        console.error('Error updating prices from cache:', error);
      }
    };

    // Update prices every 30 minutes from cache
    const interval = setInterval(updatePrices, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [stocks]);

  const handleUpdateAnalysis = async (updatedAnalysis: StockAnalysis) => {
    if (!user) return;

    try {
      await updateAnalysis(user.uid, updatedAnalysis);
      setStocks(prevStocks =>
        prevStocks.map(stock =>
          stock.symbol === updatedAnalysis.symbol ? updatedAnalysis : stock
        )
      );
    } catch (error) {
      console.error('Error updating analysis:', error);
      setError('Failed to update analysis. Please try again.');
    }
  };

  const handleDeleteAnalysis = async (symbol: string) => {
    if (!user) return;

    try {
      // Optimistically update the UI
      setStocks(prevStocks => prevStocks.filter(stock => stock.symbol !== symbol));
      
      // Then perform the actual deletion
      await deleteAnalysis(user.uid, symbol);
    } catch (error) {
      console.error('Error deleting analysis:', error);
      setError('Failed to delete analysis. Please try again.');
      
      // Revert the UI state if deletion fails
      try {
        const analyses = await getUserAnalyses(user.uid);
        setStocks(analyses);
      } catch (revertError) {
        console.error('Error reverting state:', revertError);
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment = !selectedSentiment || stock.sentiment === selectedSentiment;
    return matchesSearch && matchesSentiment;
  });

  const handleNewAnalysis = (analysis: StockAnalysis) => {
    setStocks((prevStocks) => [analysis, ...prevStocks]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-white">Stock Analysis Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
            >
              New Analysis
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-500/10 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-400">Error</h3>
                <div className="mt-2 text-sm text-red-400">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border-0 bg-gray-900 px-4 py-2 text-white shadow-sm ring-1 ring-inset ring-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSentiment(null)}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                selectedSentiment === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSentiment('positive')}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                selectedSentiment === 'positive'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              Positive
            </button>
            <button
              onClick={() => setSelectedSentiment('neutral')}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                selectedSentiment === 'neutral'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              Neutral
            </button>
            <button
              onClick={() => setSelectedSentiment('negative')}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                selectedSentiment === 'negative'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              Negative
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              {...stock}
              onUpdate={handleUpdateAnalysis}
              onDelete={handleDeleteAnalysis}
            />
          ))}
        </div>

        {!error && filteredStocks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No stocks found matching your criteria.</p>
          </div>
        )}

        <AnalysisModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleNewAnalysis}
        />

        <ChatBox />
      </div>
    </Layout>
  );
} 