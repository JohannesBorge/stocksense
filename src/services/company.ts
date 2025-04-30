const MARKETSTACK_API_KEY = process.env.NEXT_PUBLIC_MARKETSTACK_API_KEY;
const BASE_URL = 'https://api.marketstack.com/v1';

export interface CompanyInfo {
  name: string;
  description: string;
  sector: string;
  industry: string;
}

export async function getCompanyInfo(symbol: string): Promise<CompanyInfo> {
  if (!MARKETSTACK_API_KEY) {
    throw new Error('Marketstack API key is not configured');
  }

  try {
    // Get company info from the ticker endpoint
    const response = await fetch(
      `${BASE_URL}/tickers/${symbol}?access_key=${MARKETSTACK_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch company info: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.name) {
      throw new Error(`No company info available for symbol: ${symbol}`);
    }

    return {
      name: data.name,
      description: data.description || 'No description available',
      sector: data.sector || 'Unknown',
      industry: data.industry || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching company info:', error);
    throw error;
  }
} 