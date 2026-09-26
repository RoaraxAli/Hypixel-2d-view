import { NextResponse } from 'next/server';
import { getCollectionsReference } from '@/lib/hypixelApi';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getCollectionsReference();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
