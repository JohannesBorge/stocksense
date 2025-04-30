import { fetchStockData } from './polygon';

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

  private async updatePrices(symbols: string[]) {
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

      // Update prices for all symbols in batches of 10
      const batchSize = 10;
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        try {
          const batchData = await Promise.all(
            batch.map(symbol => fetchStockData(symbol))
          );
          
          batchData.forEach((data, index) => {
            const symbol = batch[index];
            this.cache.set(symbol, {
              price: Number(data.price),
              change: Number(data.change),
              changePercent: Number(data.changePercent),
              lastUpdated: new Date()
            });
          });
        } catch (error) {
          console.error(`Error updating batch prices:`, error);
        }
      }
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

    // Update prices immediately
    this.updatePrices(symbols);

    // Then update every 15 minutes
    this.updateInterval = setInterval(() => {
      this.updatePrices(symbols);
    }, 15 * 60 * 1000);
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const priceCache = PriceCache.getInstance(); 