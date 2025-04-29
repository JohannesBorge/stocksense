'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import StockCard from '@/components/StockCard';

const exampleStocks = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    price: 175.04,
    change: 2.34,
    changePercent: 1.35,
    news: [
      {
        title: 'Apple announces new AI features for iOS 18',
        source: 'TechCrunch',
        date: '2024-03-15',
      },
      {
        title: 'Apple stock hits new high after strong Q1 earnings',
        source: 'Bloomberg',
        date: '2024-03-14',
      },
    ],
    sentiment: 'positive' as const,
    aiInsight: 'Apple shows strong momentum with recent product announcements and earnings. The company\'s focus on AI integration could drive future growth.',
    date: '2024-03-15',
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    price: 415.32,
    change: -1.25,
    changePercent: -0.30,
    news: [
      {
        title: 'Microsoft expands Azure cloud services in Europe',
        source: 'Reuters',
        date: '2024-03-15',
      },
      {
        title: 'Microsoft partners with OpenAI for new AI initiatives',
        source: 'The Verge',
        date: '2024-03-14',
      },
    ],
    sentiment: 'neutral' as const,
    aiInsight: 'Microsoft maintains strong position in cloud and AI markets. Recent partnerships and expansions show continued growth potential.',
    date: '2024-03-15',
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    price: 142.56,
    change: -3.45,
    changePercent: -2.36,
    news: [
      {
        title: 'Google faces new antitrust lawsuit',
        source: 'Wall Street Journal',
        date: '2024-03-15',
      },
      {
        title: 'Google announces new AI model Gemini 2.0',
        source: 'TechCrunch',
        date: '2024-03-14',
      },
    ],
    sentiment: 'negative' as const,
    aiInsight: 'While Google continues to innovate in AI, regulatory challenges and market competition may impact short-term performance.',
    date: '2024-03-15',
  },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
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

  const filteredStocks = exampleStocks.filter((stock) => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment = !selectedSentiment || stock.sentiment === selectedSentiment;
    return matchesSearch && matchesSentiment;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-white">Stock Analysis Dashboard</h1>
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            New Analysis
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border-0 bg-gray-800 px-4 py-2 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSentiment(null)}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                selectedSentiment === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSentiment('positive')}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                selectedSentiment === 'positive'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Positive
            </button>
            <button
              onClick={() => setSelectedSentiment('neutral')}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                selectedSentiment === 'neutral'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Neutral
            </button>
            <button
              onClick={() => setSelectedSentiment('negative')}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                selectedSentiment === 'negative'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Negative
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStocks.map((stock) => (
            <StockCard key={stock.symbol} {...stock} />
          ))}
        </div>

        {filteredStocks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No stocks found matching your criteria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
} 