import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

const MARKETSTACK_API_KEY = process.env.NEXT_PUBLIC_MARKETSTACK_API_KEY;
const BASE_URL = 'https://api.marketstack.com/v1';

interface MarketstackIPO {
  symbol: string;
  name: string;
  sector: string;
  listing_date: string;
  price: number;
}

interface MarketstackResponse {
  data: MarketstackIPO[];
}

export async function fetchAndStoreIPOs() {
  if (!MARKETSTACK_API_KEY) {
    throw new Error('Marketstack API key is not configured');
  }

  try {
    // Fetch IPOs from Marketstack
    const response = await fetch(
      `${BASE_URL}/ipos?access_key=${MARKETSTACK_API_KEY}&limit=100`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch IPO data: ${response.statusText}`);
    }

    const data = await response.json() as MarketstackResponse;
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No IPO data available');
    }

    // Store IPOs in Firestore
    const stocksRef = collection(db, 'stocks');
    
    for (const ipo of data.data) {
      // Check if IPO already exists
      const q = query(stocksRef, where('symbol', '==', ipo.symbol));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Calculate price change (you might want to adjust this based on your needs)
        const priceChange = 0; // Initial change is 0
        
        await addDoc(stocksRef, {
          symbol: ipo.symbol,
          name: ipo.name,
          sector: ipo.sector || 'Unknown',
          listingDate: Timestamp.fromDate(new Date(ipo.listing_date)),
          price: ipo.price,
          change: priceChange,
          createdAt: Timestamp.now()
        });
      }
    }

    console.log('Successfully fetched and stored IPO data');
  } catch (error) {
    console.error('Error fetching and storing IPOs:', error);
    throw error;
  }
} 