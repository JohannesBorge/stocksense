import { fetchBatchStockData } from './marketstack';

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

class PriceCache {
  private static instance: PriceCache;
  private cache: Map<string, PriceData> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private isUpdating: boolean = false;

  private constructor() {}

  static getInstance(): PriceCache {
    if (!PriceCache.instance) {
      PriceCache.instance = new PriceCache();
    }
    return PriceCache.instance;
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    const cachedData = this.cache.get(symbol);
    if (!cachedData) {
      return null;
    }
    return cachedData;
  }

  private async updatePrices() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      // Check if market is open (9:30 AM - 4:00 PM ET, Monday-Friday)
      const now = new Date();
      const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const day = etTime.getDay();
      const hour = etTime.getHours();
      const minute = etTime.getMinutes();
      
      const isMarketOpen = 
        day >= 1 && day <= 5 && // Monday to Friday
        ((hour === 9 && minute >= 30) || hour > 9) && // After 9:30 AM
        (hour < 16 || (hour === 16 && minute === 0)); // Before 4:00 PM

      if (!isMarketOpen) {
        console.log('Market is closed, skipping price update');
        return;
      }

      const symbols = Array.from(this.cache.keys());
      console.log(`Updating prices for ${symbols.length} symbols`);

      // Increase batch size to reduce number of API calls
      const BATCH_SIZE = 50; // Increased from 10 to 50

      // Process symbols in larger batches
      for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
        const batch = symbols.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(symbols.length / BATCH_SIZE)}`);
        
        const batchData = await fetchBatchStockData(batch);
        
        // Update cache with new data
        for (const data of batchData) {
          this.cache.set(data.symbol, {
            ...data,
            lastUpdated: new Date()
          });
        }
        
        // Add a small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('Price update completed');
    } catch (error) {
      console.error('Error updating prices:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  startUpdates(symbols: string[]) {
    // Clear any existing interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Add symbols to cache if they don't exist
    for (const symbol of symbols) {
      if (!this.cache.has(symbol)) {
        this.cache.set(symbol, {
          price: 0,
          change: 0,
          changePercent: 0,
          lastUpdated: new Date()
        });
      }
    }

    // Update prices immediately
    this.updatePrices();

    // Then update every 30 minutes
    this.updateInterval = setInterval(() => {
      this.updatePrices();
    }, 30 * 60 * 1000);
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const priceCache = PriceCache.getInstance(); 