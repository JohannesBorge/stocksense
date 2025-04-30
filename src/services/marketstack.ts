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

    // Get price from 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    console.log('Fetching price from 24 hours ago for symbol:', symbol);
    const historicalResponse = await fetch(
      `${BASE_URL}/intraday?access_key=${MARKETSTACK_API_KEY}&symbols=${symbol}&date_from=${twentyFourHoursAgo.toISOString().split('T')[0]}`
    );

    if (!historicalResponse.ok) {
      const errorText = await historicalResponse.text();
      console.error('Marketstack API error:', {
        status: historicalResponse.status,
        statusText: historicalResponse.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch historical data: ${historicalResponse.statusText}`);
    }

    const historicalData = await historicalResponse.json() as MarketstackResponse;
    const historicalPrice = historicalData.data[0]?.close || currentPrice;
    console.log('Historical price:', historicalPrice);

    // Calculate change and change percent
    const change = currentPrice - historicalPrice;
    const changePercent = (change / historicalPrice) * 100;

    return {
      symbol,
      price: currentPrice,
      change,
      changePercent,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
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

    // Get prices from 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const historicalResponse = await fetch(
      `${BASE_URL}/intraday?access_key=${MARKETSTACK_API_KEY}&symbols=${symbols.join(',')}&date_from=${twentyFourHoursAgo.toISOString().split('T')[0]}`
    );

    if (!historicalResponse.ok) {
      throw new Error(`Failed to fetch historical batch data: ${historicalResponse.statusText}`);
    }

    const historicalData = await historicalResponse.json() as MarketstackResponse;

    // Map the data to our format
    return currentData.data.map((current) => {
      const historical = historicalData.data.find((p) => p.symbol === current.symbol);
      if (!historical) {
        throw new Error(`No historical data found for symbol: ${current.symbol}`);
      }
      const change = current.close - historical.close;
      const changePercent = (change / historical.close) * 100;

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