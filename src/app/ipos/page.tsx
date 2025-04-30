'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Layout from '@/components/Layout';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  listingDate: string;
  price: number;
  change: number;
}

const sectors = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Consumer Cyclical',
  'Communication Services',
  'Industrials',
  'Energy',
  'Real Estate',
  'Consumer Defensive',
  'Basic Materials',
  'Utilities'
];

export default function IPOsPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [days, setDays] = useState('30');

  const fetchIPOs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSector) params.append('sector', selectedSector);
      params.append('days', days);
      
      const response = await fetch(`/api/ipos?${params.toString()}`);
      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error('Error fetching IPOs:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSector, days]);

  useEffect(() => {
    fetchIPOs();
  }, [fetchIPOs]);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">New Listings</h1>
          <div className="flex gap-4">
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sectors</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={days}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDays(e.target.value)}
              className="w-[100px]"
              placeholder="Days"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <Card key={stock.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{stock.symbol}</span>
                    <Badge variant={stock.change >= 0 ? "success" : "destructive"}>
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{stock.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Listed: {format(new Date(stock.listingDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sector: {stock.sector}
                    </p>
                    <p className="text-lg font-semibold">
                      ${stock.price.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 