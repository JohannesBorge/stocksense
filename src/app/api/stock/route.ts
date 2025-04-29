import { NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

interface TimeSeriesData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

type TimeRange = '1d' | '1w' | '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | '10y' | 'max';

function getTimeSeriesFunction(range: TimeRange): string {
  switch (range) {
    case '1d':
      return 'TIME_SERIES_INTRADAY&interval=5min';
    case '1w':
      return 'TIME_SERIES_INTRADAY&interval=15min';
    case '1m':
    case '3m':
    case '6m':
      return 'TIME_SERIES_DAILY';
    case 'ytd':
    case '1y':
    case '3y':
    case '5y':
    case '10y':
    case 'max':
      return 'TIME_SERIES_DAILY_ADJUSTED';
    default:
      return 'TIME_SERIES_DAILY';
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
      const timeSeriesFunction = getTimeSeriesFunction(range);
      const response = await fetch(
        `${BASE_URL}?function=${timeSeriesFunction}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const data = await response.json();

      // Check for API rate limit
      if (data.Note && data.Note.includes('API call frequency')) {
        return NextResponse.json(
          { error: 'API rate limit reached. Please try again in a minute.' },
          { status: 429 }
        );
      }

      // Check for invalid symbol
      if (data.Error) {
        return NextResponse.json(
          { error: 'Invalid stock symbol' },
          { status: 400 }
        );
      }

      const timeSeriesKey = timeSeriesFunction.includes('INTRADAY')
        ? `Time Series (5min)`
        : timeSeriesFunction.includes('ADJUSTED')
        ? 'Time Series (Daily)'
        : 'Time Series (Daily)';
      
      const timeSeriesData = data[timeSeriesKey] as Record<string, TimeSeriesData>;

      if (!timeSeriesData) {
        return NextResponse.json(
          { error: 'No data available for this time range' },
          { status: 404 }
        );
      }

      const dataLimit = getDataLimit(range);
      const historicalData = Object.entries(timeSeriesData)
        .slice(0, dataLimit)
        .map(([date, values]) => ({
          date,
          price: parseFloat(values['4. close']),
        }))
        .reverse();

      return NextResponse.json(historicalData);
    }

    const endpoint = type === 'overview' ? 'OVERVIEW' : 'GLOBAL_QUOTE';
    const response = await fetch(
      `${BASE_URL}?function=${endpoint}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();

    // Check for API rate limit
    if (data.Note && data.Note.includes('API call frequency')) {
      return NextResponse.json(
        { error: 'API rate limit reached. Please try again in a minute.' },
        { status: 429 }
      );
    }

    if (type === 'overview') {
      return NextResponse.json({
        name: data.Name,
        description: data.Description,
        sector: data.Sector,
        industry: data.Industry,
      });
    } else {
      const quote = data['Global Quote'];
      if (!quote) {
        return NextResponse.json(
          { error: 'Invalid stock symbol' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        symbol,
        price: parseFloat(quote['05. price']),
        change: quote['09. change'],
        changePercent: quote['10. change percent'].replace('%', ''),
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