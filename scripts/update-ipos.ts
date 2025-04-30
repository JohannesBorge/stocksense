import { fetchAndStoreIPOs } from '@/services/ipos';

async function main() {
  try {
    console.log('Starting IPO data update...');
    await fetchAndStoreIPOs();
    console.log('IPO data update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating IPO data:', error);
    process.exit(1);
  }
}

main(); 