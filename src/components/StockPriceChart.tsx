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

export default function StockPriceChart({ symbol }: StockPriceChartProps) {
  const [data, setData] = useState<HistoricalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/stock?symbol=${symbol}&type=historical`);
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
  }, [symbol]);

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
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
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
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
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
  );
} 