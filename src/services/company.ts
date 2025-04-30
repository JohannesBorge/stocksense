export interface CompanyInfo {
  name: string;
  description: string;
  sector: string;
  industry: string;
}

export async function getCompanyInfo(symbol: string): Promise<CompanyInfo> {
  // For now, return mock data
  // TODO: Implement actual company info fetching
  return {
    name: `${symbol} Company`,
    description: 'A leading company in its industry',
    sector: 'Technology',
    industry: 'Software'
  };
} 