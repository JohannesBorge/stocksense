const MARKETSTACK_API_KEY = process.env.NEXT_PUBLIC_MARKETSTACK_API_KEY;
const BASE_URL = 'https://api.marketstack.com/v1';

interface MarketstackResponse {
  data: Array<{
    symbol: string;
    close: number;
    date: string;
  }>;
}

export interface MarketstackStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export async function fetchStockData(symbol: string): Promise<MarketstackStockData> {
  if (!MARKETSTACK_API_KEY) {
    throw new Error('Marketstack API key is not configured');
  }

  try {
    console.log('Fetching current price for symbol:', symbol);
    // Get current price
    const currentResponse = await fetch(
      `${BASE_URL}/intraday/latest?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}`
    );

    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();
      console.error('Marketstack API error:', {
        status: currentResponse.status,
        statusText: currentResponse.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch stock data: ${currentResponse.statusText}`);
    }

    const currentData = await currentResponse.json() as MarketstackResponse;

    if (!currentData.data || currentData.data.length === 0) {
      throw new Error(`No data available for symbol: ${symbol}`);
    }

    const currentPrice = currentData.data[0].close;
    console.log('Current price:', currentPrice);

    // Get previous day's price for change calculation
    console.log('Fetching previous day price for symbol:', symbol);
    const previousResponse = await fetch(
      `${BASE_URL}/eod/latest?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}`
    );

    if (!previousResponse.ok) {
      const errorText = await previousResponse.text();
      console.error('Marketstack API error:', {
        status: previousResponse.status,
        statusText: previousResponse.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch previous day data: ${previousResponse.statusText}`);
    }

    const previousData = await previousResponse.json() as MarketstackResponse;
    const previousPrice = previousData.data[0].close;
    console.log('Previous price:', previousPrice);

    // Calculate change and change percent
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;

    return {
      symbol,
      price: currentPrice,
      change,
      changePercent,
      lastUpdated: currentData.data[0].date
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch stock data: ${error.message}`);
    }
    throw error;
  }
}

export async function fetchBatchStockData(symbols: string[]): Promise<MarketstackStockData[]> {
  if (!MARKETSTACK_API_KEY) {
    throw new Error('Marketstack API key is not configured');
  }

  try {
    // Get current prices for all symbols
    const currentResponse = await fetch(
      `${BASE_URL}/intraday/latest?access_key=${MARKETSTACK_API_KEY}&symbols=${symbols.join(',')}`
    );

    if (!currentResponse.ok) {
      throw new Error(`Failed to fetch batch stock data: ${currentResponse.statusText}`);
    }

    const currentData = await currentResponse.json() as MarketstackResponse;

    if (!currentData.data || currentData.data.length === 0) {
      throw new Error('No data available for the requested symbols');
    }

    // Get previous day's prices
    const previousResponse = await fetch(
      `${BASE_URL}/eod/latest?access_key=${MARKETSTACK_API_KEY}&symbols=${symbols.join(',')}`
    );

    if (!previousResponse.ok) {
      throw new Error(`Failed to fetch previous day batch data: ${previousResponse.statusText}`);
    }

    const previousData = await previousResponse.json() as MarketstackResponse;

    // Map the data to our format
    return currentData.data.map((current) => {
      const previous = previousData.data.find((p) => p.symbol === current.symbol);
      if (!previous) {
        throw new Error(`No previous data found for symbol: ${current.symbol}`);
      }
      const change = current.close - previous.close;
      const changePercent = (change / previous.close) * 100;

      return {
        symbol: current.symbol,
        price: current.close,
        change,
        changePercent,
        lastUpdated: current.date
      };
    });
  } catch (error) {
    console.error('Error fetching batch stock data:', error);
    throw error;
  }
} 