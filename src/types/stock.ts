export interface NewsItem {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface PDFFile {
  name: string;
  url: string;
  uploadedAt: string;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated?: string;
}

export interface StockAnalysis {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  date: string;
  news: NewsItem[];
  sentiment: 'positive' | 'neutral' | 'negative';
  aiInsight: string;
  pdfFiles?: PDFFile[];
} 