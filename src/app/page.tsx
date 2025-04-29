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

export default function Home() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Stock Analysis Dashboard</h1>
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            New Analysis
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exampleStocks.map((stock) => (
            <StockCard key={stock.symbol} {...stock} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
