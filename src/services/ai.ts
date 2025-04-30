import { MarketstackStockData } from './marketstack';
import { NewsItem } from '@/types/stock';
import { CompanyInfo } from './company';

interface AnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  aiInsight: string;
  news: NewsItem[];
}

export async function generateStockAnalysis(
  symbol: string,
  stockData: MarketstackStockData,
  companyInfo: CompanyInfo
): Promise<AnalysisResult> {
  try {
    const response = await fetch('/api/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol,
        stockData,
        companyOverview: {
          name: companyInfo.name,
          description: companyInfo.description,
          sector: companyInfo.sector,
          industry: companyInfo.industry,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Failed to generate analysis');
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
} 