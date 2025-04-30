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
    throw new Error('Polygon.io API key is not configured');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/v2/last/trade/${symbol}?apiKey=${POLYGON_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Get previous day's close for calculating change
    const previousCloseResponse = await fetch(
      `${BASE_URL}/v2/aggs/ticker/${symbol}/prev?apiKey=${POLYGON_API_KEY}`
    );
    
    if (!previousCloseResponse.ok) {
      throw new Error(`HTTP error! status: ${previousCloseResponse.status}`);
    }

    const previousData = await previousCloseResponse.json();
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
    throw error;
  }
}

export async function getCompanyInfo(symbol: string) {
  if (!POLYGON_API_KEY) {
    throw new Error('Polygon.io API key is not configured');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching company info from Polygon:', error);
    throw error;
  }
} 