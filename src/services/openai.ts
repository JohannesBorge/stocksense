import { StockData } from '@/types/stock';

interface CompanyOverview {
  name: string;
  description: string;
  sector: string;
  industry: string;
}

export const generateStockAnalysis = async (
  symbol: string,
  stockData: StockData,
  companyOverview: CompanyOverview
): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  aiInsight: string;
  news: Array<{ title: string; source: string; date: string }>;
}> => {
  try {
    const response = await fetch('/api/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol,
        stockData,
        companyOverview,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate analysis');
    }

    const data = await response.json();
    return {
      sentiment: data.sentiment,
      aiInsight: data.aiInsight,
      news: data.news,
    };
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw error;
  }
}; 