import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp, limit, startAfter } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';
    const days = parseInt(searchParams.get('days') || '30');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '30');

    // Calculate the date X days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Create the base query
    let q = query(
      collection(db, 'stocks'),
      where('listingDate', '>=', Timestamp.fromDate(cutoffDate)),
      orderBy('listingDate', 'desc')
    );

    // Execute the query
    const querySnapshot = await getDocs(q);
    let stocks = querySnapshot.docs.map(doc => ({
      symbol: doc.data().symbol,
      name: doc.data().name,
      sector: doc.data().sector,
      listingDate: doc.data().listingDate.toDate().toISOString(),
      price: doc.data().price,
      change: doc.data().change
    }));

    // Apply search filter if provided
    if (searchQuery) {
      stocks = stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery) ||
        stock.name.toLowerCase().includes(searchQuery)
      );
    }

    // Calculate pagination
    const total = stocks.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedStocks = stocks.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      stocks: paginatedStocks,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
} 