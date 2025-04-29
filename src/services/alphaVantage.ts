import { StockData } from '@/types/stock';

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote) {
      throw new Error('Invalid stock symbol');
    }

    return {
      symbol,
      price: parseFloat(quote['05. price']),
      change: quote['09. change'],
      changePercent: quote['10. change percent'].replace('%', ''),
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

export const fetchCompanyOverview = async (symbol: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch company overview');
    }

    const data = await response.json();
    return {
      name: data.Name,
      description: data.Description,
      sector: data.Sector,
      industry: data.Industry,
    };
  } catch (error) {
    console.error('Error fetching company overview:', error);
    throw error;
  }
}; 