'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StockPriceChartProps {
  symbol: string;
}

interface HistoricalData {
  date: string;
  price: number;
}

type TimeRange = '1d' | '1w' | '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | '10y' | 'max';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: 'ytd', label: 'YTD' },
  { value: '1y', label: '1Y' },
  { value: '3y', label: '3Y' },
  { value: '5y', label: '5Y' },
  { value: '10y', label: '10Y' },
  { value: 'max', label: 'MAX' },
];

export default function StockPriceChart({ symbol }: StockPriceChartProps) {
  const [data, setData] = useState<HistoricalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1m');

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/stock?symbol=${symbol}&type=historical&range=${selectedRange}`);
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        const historicalData = await response.json();
        setData(historicalData);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError('Failed to load historical data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, selectedRange]);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>;
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center text-red-400">{error}</div>;
  }

  if (!data.length) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedRange(option.value)}
            className={`px-2 py-1 text-xs font-medium rounded ${
              selectedRange === option.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                if (selectedRange === '1d' || selectedRange === '1w') {
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                return date.toLocaleDateString();
              }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.375rem',
              }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: number) => [`$${value}`, 'Price']}
              labelFormatter={(label) => {
                const date = new Date(label);
                if (selectedRange === '1d' || selectedRange === '1w') {
                  return date.toLocaleString();
                }
                return date.toLocaleDateString();
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 