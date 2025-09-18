import { NextResponse } from 'next/server';
import { getCrops } from '@/services/cropService';

export async function GET() {
  try {
    const crops = await getCrops();
    return NextResponse.json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    return NextResponse.json({ message: 'Error fetching crops' }, { status: 500 });
  }
}
