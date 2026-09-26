import { NextResponse } from 'next/server';
import { getNews } from '@/lib/hypixelApi';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getNews();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
