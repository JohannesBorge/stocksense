'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Layout from '@/components/Layout';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  listingDate: string;
  price: number;
  change: number;
}

export default function IPOsPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [days, setDays] = useState('30');
  const [page, setPage] = useState(1);
  const [totalStocks, setTotalStocks] = useState(0);
  const STOCKS_PER_PAGE = 30;

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('search', searchQuery);
      params.append('days', days);
      params.append('page', page.toString());
      params.append('limit', STOCKS_PER_PAGE.toString());
      
      const response = await fetch(`/api/stocks?${params.toString()}`);
      const data = await response.json();
      setStocks(data.stocks);
      setTotalStocks(data.total);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, days, page]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDays(e.target.value);
    setPage(1); // Reset to first page on new filter
  };

  const totalPages = Math.ceil(totalStocks / STOCKS_PER_PAGE);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Stock Listings</h1>
          <div className="flex gap-4">
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="w-[300px]"
              placeholder="Search by symbol or company name..."
            />
            <Input
              type="number"
              value={days}
              onChange={handleDaysChange}
              className="w-[100px]"
              placeholder="Days"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map((stock) => (
                <Card key={stock.symbol} className="hover:shadow-lg transition-shadow">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-white">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 