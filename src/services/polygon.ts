const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io';

export interface PolygonStockData {
  symbol: string;
  price: number;
  change: string;
  changePercent: string;
  timestamp: number;
}

export async function fetchStockData(symbol: string): Promise<PolygonStockData> {
  if (!POLYGON_API_KEY) {
    throw new Error('Polygon.io API key is not configured. Please check your environment variables.');
  }

  try {
    // First, check if the symbol exists
    const tickerResponse = await fetch(
      `${BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
    );

    if (!tickerResponse.ok) {
      if (tickerResponse.status === 404) {
        throw new Error(`Invalid stock symbol: ${symbol}`);
      }
      throw new Error(`Failed to validate stock symbol: ${tickerResponse.statusText}`);
    }

    const tickerData = await tickerResponse.json();
    if (!tickerData.results) {
      throw new Error(`Invalid stock symbol: ${symbol}`);
    }

    // Get the latest trade
    const response = await fetch(
      `${BASE_URL}/v2/last/trade/${symbol}?apiKey=${POLYGON_API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit reached. Please try again in a minute.');
      }
      throw new Error(`Failed to fetch latest trade: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.results) {
      throw new Error(`No trading data available for ${symbol}`);
    }
    
    // Get previous day's close for calculating change
    const previousCloseResponse = await fetch(
      `${BASE_URL}/v2/aggs/ticker/${symbol}/prev?apiKey=${POLYGON_API_KEY}`
    );
    
    if (!previousCloseResponse.ok) {
      if (previousCloseResponse.status === 429) {
        throw new Error('API rate limit reached. Please try again in a minute.');
      }
      throw new Error(`Failed to fetch previous close: ${previousCloseResponse.statusText}`);
    }

    const previousData = await previousCloseResponse.json();
    if (!previousData.results || previousData.results.length === 0) {
      throw new Error(`No previous trading data available for ${symbol}`);
    }

    const previousClose = previousData.results[0].c;
    const currentPrice = data.results.p;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol,
      price: currentPrice,
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      timestamp: data.results.t
    };
  } catch (error) {
    console.error('Error fetching stock data from Polygon:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch stock data. Please try again later.');
  }
}

export async function getCompanyInfo(symbol: string) {
  if (!POLYGON_API_KEY) {
    throw new Error('Polygon.io API key is not configured. Please check your environment variables.');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Invalid stock symbol: ${symbol}`);
      }
      if (response.status === 429) {
        throw new Error('API rate limit reached. Please try again in a minute.');
      }
      throw new Error(`Failed to fetch company info: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.results) {
      throw new Error(`No company information available for ${symbol}`);
    }
    return data.results;
  } catch (error) {
    console.error('Error fetching company info from Polygon:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch company information. Please try again later.');
  }
} 