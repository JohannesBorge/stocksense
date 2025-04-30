import { NextResponse } from 'next/server';
import { fetchAndStoreIPOs } from '@/services/ipos';

export async function POST(request: Request) {
  try {
    await fetchAndStoreIPOs();
    return NextResponse.json({ message: 'IPO data updated successfully' });
  } catch (error) {
    console.error('Error updating IPO data:', error);
    return NextResponse.json(
      { error: 'Failed to update IPO data' },
      { status: 500 }
    );
  }
} 