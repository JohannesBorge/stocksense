import { NextResponse } from 'next/server';

// Marketstack API integration for stock data
const MARKETSTACK_API_KEY = process.env.NEXT_PUBLIC_MARKETSTACK_API_KEY;
const BASE_URL = 'https://api.marketstack.com/v2';

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

export async function GET(request: Request) {
  try {
    if (!MARKETSTACK_API_KEY) {
      console.error('Marketstack API key is not configured');
      return NextResponse.json(
        { 
          error: 'API configuration error',
          details: 'Marketstack API key is not configured. Please check your environment variables.'
        },
        { status: 500 }
      );
    }

    // Validate API key format
    if (!/^[a-zA-Z0-9]{32}$/.test(MARKETSTACK_API_KEY)) {
      console.error('Invalid Marketstack API key format');
      return NextResponse.json(
        { 
          error: 'API configuration error',
          details: 'Invalid Marketstack API key format. Please check your API key.'
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }

    // Format dates in YYYY-MM-DD format
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 1); // Get last day's data

    const fromDate = from.toISOString().split('T')[0];
    const toDate = to.toISOString().split('T')[0];

    // Marketstack requires symbols to be uppercase
    const formattedSymbol = symbol.toUpperCase();

    // Build the URL with proper encoding
    const params = new URLSearchParams({
      access_key: MARKETSTACK_API_KEY,
      symbols: formattedSymbol,
      date_from: fromDate,
      date_to: toDate,
      limit: '1'
    });

    const response = await fetch(
      `${BASE_URL}/eod?${params.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Marketstack API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: response.url,
        params: Object.fromEntries(params)
      });
      return NextResponse.json(
        { error: `Failed to fetch stock data: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json() as MarketstackCurrentResponse;

    if (data.error) {
      console.error('Marketstack API returned error:', data.error);
      return NextResponse.json(
        { error: `Marketstack API error: ${data.error.message}` },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
} 