import { NextResponse } from 'next/server';
import { cache } from '@/services/cache';

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io';

interface HistoricalDataPoint {
  date: string;
  price: number;
}

interface PolygonAggregateResult {
  t: number;  // timestamp
  o: number;  // open
  h: number;  // high
  l: number;  // low
  c: number;  // close
  v: number;  // volume
  n: number;  // number of trades
}

interface PolygonAggregateResponse {
  results: PolygonAggregateResult[];
  status: string;
  request_id: string;
  count: number;
}

type TimeRange = '1d' | '1w' | '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | '10y' | 'max';

function getMultiplier(range: TimeRange): number {
  switch (range) {
    case '1d':
      return 5; // 5 minutes
    case '1w':
      return 15; // 15 minutes
    case '1m':
    case '3m':
    case '6m':
    case 'ytd':
    case '1y':
    case '3y':
    case '5y':
    case '10y':
    case 'max':
      return 1; // 1 day
    default:
      return 1;
  }
}

function getTimespan(range: TimeRange): string {
  switch (range) {
    case '1d':
    case '1w':
      return 'minute';
    case '1m':
    case '3m':
    case '6m':
    case 'ytd':
    case '1y':
    case '3y':
    case '5y':
    case '10y':
    case 'max':
      return 'day';
    default:
      return 'day';
  }
}

function getDataLimit(range: TimeRange): number {
  switch (range) {
    case '1d':
      return 78; // 13 hours * 6 (5min intervals)
    case '1w':
      return 40; // 5 days * 8 (15min intervals)
    case '1m':
      return 30;
    case '3m':
      return 90;
    case '6m':
      return 180;
    case 'ytd':
      return 365;
    case '1y':
      return 365;
    case '3y':
      return 1095;
    case '5y':
      return 1825;
    case '10y':
      return 3650;
    case 'max':
      return 3650; // Maximum available data
    default:
      return 30;
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

      const multiplier = getMultiplier(range);
      const timespan = getTimespan(range);
      const limit = getDataLimit(range);

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
          from.setFullYear(from.getFullYear() - 20); // Polygon.io typically has 20 years of data
          break;
      }

      const response = await fetch(
        `${BASE_URL}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from.toISOString().split('T')[0]}/${to.toISOString().split('T')[0]}?limit=${limit}&apiKey=${POLYGON_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const data = await response.json() as PolygonAggregateResponse;

      if (!data.results || data.results.length === 0) {
        return NextResponse.json(
          { error: 'No data available for this time range' },
          { status: 404 }
        );
      }

      const historicalData = data.results.map((result: PolygonAggregateResult) => ({
        date: new Date(result.t).toISOString().split('T')[0],
        price: result.c, // Closing price
      }));

      // Cache the data
      cache.set(cacheKey, historicalData, getCacheTTL(range));

      return NextResponse.json(historicalData);
    }

    if (type === 'overview') {
      const response = await fetch(
        `${BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch company overview');
      }

      const data = await response.json();

      return NextResponse.json({
        name: data.results.name,
        description: data.results.description,
        sector: data.results.sector,
        industry: data.results.industry,
      });
    } else {
      const response = await fetch(
        `${BASE_URL}/v2/last/trade/${symbol}?apiKey=${POLYGON_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();

      // Get previous day's close for calculating change
      const previousCloseResponse = await fetch(
        `${BASE_URL}/v2/aggs/ticker/${symbol}/prev?apiKey=${POLYGON_API_KEY}`
      );

      if (!previousCloseResponse.ok) {
        throw new Error('Failed to fetch previous close');
      }

      const previousData = await previousCloseResponse.json();
      const previousClose = previousData.results[0].c;
      const currentPrice = data.results.p;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return NextResponse.json({
        symbol,
        price: currentPrice,
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2),
      });
    }
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data. Please try again later.' },
      { status: 500 }
    );
  }
} 