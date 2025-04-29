export interface NewsItem {
  title: string;
  source: string;
  date: string;
}

export interface StockData {
  symbol: string;
  price: number;
  change: string;
  changePercent: string;
}

export interface StockAnalysis {
  symbol: string;
  companyName: string;
  price: number;
  change: string;
  changePercent: string;
  news: NewsItem[];
  sentiment: 'positive' | 'neutral' | 'negative';
  aiInsight: string;
  date: string;
} 