import { NextResponse } from 'next/server';
import { getMasterItems } from '@/lib/hypixelApi';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') || '').trim().toLowerCase();
    const tier = searchParams.get('tier') || 'all';
    const category = searchParams.get('category') || 'all';

    const data = await getMasterItems();
    const rawItems = data.items || [];

    let filtered = rawItems;
    if (query) {
      filtered = filtered.filter(i =>
        i.name?.toLowerCase().includes(query) ||
        i.id?.toLowerCase().includes(query)
      );
    }
    if (tier !== 'all') {
      filtered = filtered.filter(i => i.tier?.toLowerCase() === tier.toLowerCase());
    }
    if (category !== 'all') {
      filtered = filtered.filter(i => i.category?.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      totalCount: rawItems.length,
      filteredCount: filtered.length,
      items: filtered.slice(0, 100)
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
