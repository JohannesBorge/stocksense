'use client';

import { StockAnalysis } from '@/types/stock';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

interface StockCardProps extends StockAnalysis {}

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
  const isPositive = parseFloat(change) >= 0;
  const sentimentColors = {
    positive: 'bg-green-500/10 text-green-400',
    neutral: 'bg-yellow-500/10 text-yellow-400',
    negative: 'bg-red-500/10 text-red-400',
  };

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
              {change} ({changePercent}%)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sentimentColors[sentiment]}`}>
          {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-white">Latest News</h4>
        <ul className="mt-2 space-y-2">
          {news.map((item, index) => (
            <li key={index} className="text-sm text-gray-400">
              {item.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-white">AI Insight</h4>
        <p className="mt-1 text-sm text-gray-400">{aiInsight}</p>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Last updated: {date}
      </div>
    </div>
  );
} 