import { StockData } from '@/types/stock';

interface CompanyOverview {
  name: string;
  description: string;
  sector: string;
  industry: string;
}

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    const response = await fetch(`/api/stock?symbol=${symbol}&type=quote`);

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

export const fetchCompanyOverview = async (symbol: string): Promise<CompanyOverview> => {
  try {
    const response = await fetch(`/api/stock?symbol=${symbol}&type=overview`);

    if (!response.ok) {
      throw new Error('Failed to fetch company overview');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching company overview:', error);
    throw error;
  }
}; 