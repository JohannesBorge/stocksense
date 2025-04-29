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
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
          <p className="text-sm text-gray-500">{companyName}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">${price.toFixed(2)}</p>
          <div className="flex items-center justify-end">
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900">Latest News</h4>
        <ul className="mt-2 space-y-2">
          {news.map((item, index) => (
            <li key={index} className="text-sm">
              <p className="text-gray-900">{item.title}</p>
              <p className="text-gray-500">
                {item.source} • {format(new Date(item.date), 'MMM d, yyyy')}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">Sentiment:</span>
          <span
            className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
              sentiment === 'positive'
                ? 'bg-green-100 text-green-800'
                : sentiment === 'negative'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900">AI Insight</h4>
        <p className="mt-1 text-sm text-gray-600">{aiInsight}</p>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Analysis generated on {format(new Date(date), 'MMM d, yyyy')}
      </div>
    </div>
  );
} 