import { NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }

    if (type === 'historical') {
      const response = await fetch(
        `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const data = await response.json();
      const timeSeriesData = data['Time Series (Daily)'];

      if (!timeSeriesData) {
        return NextResponse.json(
          { error: 'Invalid stock symbol' },
          { status: 400 }
        );
      }

      // Get the last 30 days of data
      const historicalData = Object.entries(timeSeriesData)
        .slice(0, 30)
        .map(([date, values]: [string, any]) => ({
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
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
} 