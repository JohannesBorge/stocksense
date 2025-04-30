import { NextResponse } from 'next/server';
import { cache } from '@/services/cache';

const MARKETSTACK_API_KEY = process.env.NEXT_PUBLIC_MARKETSTACK_API_KEY;
const BASE_URL = 'https://api.marketstack.com/v1';

interface HistoricalDataPoint {
  date: string;
  price: number;
}

interface MarketstackHistoricalResponse {
  data: Array<{
    date: string;
    close: number;
  }>;
  pagination?: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface MarketstackCurrentResponse {
  data: Array<{
    date: string;
    close: number;
    high: number;
    low: number;
    open: number;
    volume: number;
  }>;
  error?: {
    code: string;
    message: string;
  };
}

type TimeRange = '1d' | '1w' | '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | '10y' | 'max';

function getInterval(range: TimeRange): string {
  switch (range) {
    case '1d':
      return '5min';
    case '1w':
      return '15min';
    case '1m':
    case '3m':
    case '6m':
    case 'ytd':
    case '1y':
    case '3y':
    case '5y':
    case '10y':
    case 'max':
      return '1day';
    default:
      return '1day';
  }
}

function getCacheTTL(range: TimeRange): number {
  switch (range) {
    case '1d':
      return 5 * 60 * 1000; // 5 minutes
    case '1w':
      return 15 * 60 * 1000; // 15 minutes
    case '1m':
      return 30 * 60 * 1000; // 30 minutes
    case '3m':
    case '6m':
      return 60 * 60 * 1000; // 1 hour
    case 'ytd':
    case '1y':
    case '3y':
    case '5y':
    case '10y':
    case 'max':
      return 24 * 60 * 60 * 1000; // 24 hours
    default:
      return 5 * 60 * 1000; // 5 minutes
  }
}

export async function GET(request: Request) {
  try {
    if (!MARKETSTACK_API_KEY) {
      console.error('Marketstack API key is not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type');
    const range = (searchParams.get('range') || '1m') as TimeRange;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }

    if (type === 'historical') {
      // Check cache first
      const cacheKey = `historical_${symbol}_${range}`;
      const cachedData = cache.get<HistoricalDataPoint[]>(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }

      const interval = getInterval(range);

      // Calculate the from/to dates
      const to = new Date();
      const from = new Date();
      switch (range) {
        case '1d':
          from.setDate(from.getDate() - 1);
          break;
        case '1w':
          from.setDate(from.getDate() - 7);
          break;
        case '1m':
          from.setMonth(from.getMonth() - 1);
          break;
        case '3m':
          from.setMonth(from.getMonth() - 3);
          break;
        case '6m':
          from.setMonth(from.getMonth() - 6);
          break;
        case 'ytd':
          from.setMonth(0);
          from.setDate(1);
          break;
        case '1y':
          from.setFullYear(from.getFullYear() - 1);
          break;
        case '3y':
          from.setFullYear(from.getFullYear() - 3);
          break;
        case '5y':
          from.setFullYear(from.getFullYear() - 5);
          break;
        case '10y':
          from.setFullYear(from.getFullYear() - 10);
          break;
        case 'max':
          from.setFullYear(from.getFullYear() - 20);
          break;
      }

      console.log('Fetching historical data:', {
        symbol,
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
        interval
      });

      const response = await fetch(
        `${BASE_URL}/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&date_from=${from.toISOString().split('T')[0]}&date_to=${to.toISOString().split('T')[0]}&interval=${interval}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Marketstack API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return NextResponse.json(
          { error: `Failed to fetch historical data: ${response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json() as MarketstackHistoricalResponse;

      if (data.error) {
        console.error('Marketstack API returned error:', data.error);
        return NextResponse.json(
          { error: `Marketstack API error: ${data.error.message}` },
          { status: 400 }
        );
      }

      if (!data.data || data.data.length === 0) {
        return NextResponse.json(
          { error: 'No historical data available for this time range' },
          { status: 404 }
        );
      }

      // Transform the data to our format
      const historicalData: HistoricalDataPoint[] = data.data.map(item => ({
        date: item.date,
        price: item.close
      }));

      // Cache the data
      cache.set(cacheKey, historicalData, getCacheTTL(range));

      return NextResponse.json(historicalData);
    }

    if (type === 'overview') {
      // For overview, we'll get the latest data point
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 1); // Get last day's data

      const response = await fetch(
        `${BASE_URL}/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&date_from=${from.toISOString().split('T')[0]}&date_to=${to.toISOString().split('T')[0]}&limit=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stock overview');
      }

      const data = await response.json() as MarketstackCurrentResponse;
      if (!data.data || data.data.length === 0) {
        return NextResponse.json(
          { error: 'No data available for this symbol' },
          { status: 404 }
        );
      }

      const latestData = data.data[0];
      return NextResponse.json({
        symbol,
        price: latestData.close,
        change: 0, // Marketstack doesn't provide change directly
        changePercent: 0, // Marketstack doesn't provide change percent directly
        high: latestData.high,
        low: latestData.low,
        volume: latestData.volume,
        lastUpdated: latestData.date
      });
    }

    // Default to current price
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 1); // Get last day's data

    const response = await fetch(
      `${BASE_URL}/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&date_from=${from.toISOString().split('T')[0]}&date_to=${to.toISOString().split('T')[0]}&limit=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch current price');
    }

    const data = await response.json() as MarketstackCurrentResponse;
    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { error: 'No data available for this symbol' },
        { status: 404 }
      );
    }

    const latestData = data.data[0];
    return NextResponse.json({
      symbol,
      price: latestData.close,
      change: 0, // Marketstack doesn't provide change directly
      changePercent: 0, // Marketstack doesn't provide change percent directly
      lastUpdated: latestData.date
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
} 