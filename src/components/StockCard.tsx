import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

interface StockCardProps {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  news: {
    title: string;
    source: string;
    date: string;
  }[];
  sentiment: 'positive' | 'negative' | 'neutral';
  aiInsight: string;
  date: string;
}

export default function StockCard({
  symbol,
  companyName,
  price,
  change,
  changePercent,
  news,
  sentiment,
  aiInsight,
  date,
}: StockCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{symbol}</h3>
          <p className="text-sm text-gray-400">{companyName}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">${price.toFixed(2)}</p>
          <div className="flex items-center justify-end">
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 text-green-400" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-white">Latest News</h4>
        <ul className="mt-2 space-y-2">
          {news.map((item, index) => (
            <li key={index} className="text-sm">
              <p className="text-gray-200">{item.title}</p>
              <p className="text-gray-400">
                {item.source} • {format(new Date(item.date), 'MMM d, yyyy')}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <div className="flex items-center">
          <span className="text-sm font-medium text-white">Sentiment:</span>
          <span
            className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
              sentiment === 'positive'
                ? 'bg-green-900 text-green-300'
                : sentiment === 'negative'
                ? 'bg-red-900 text-red-300'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-white">AI Insight</h4>
        <p className="mt-1 text-sm text-gray-300">{aiInsight}</p>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        Analysis generated on {format(new Date(date), 'MMM d, yyyy')}
      </div>
    </div>
  );
} 