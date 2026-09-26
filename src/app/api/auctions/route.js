import { NextResponse } from 'next/server';
import { getAuctions } from '@/lib/hypixelApi';
import { formatMinecraftText } from '@/lib/nbtParser';
import { formatCoins } from '@/lib/skyblockUtils';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0', 10) || 0;
    const binOnly = searchParams.get('bin') === 'true';
    const category = searchParams.get('category') || 'all';
    const tier = searchParams.get('tier') || 'all';
    const query = (searchParams.get('query') || '').trim().toLowerCase();
    const sort = searchParams.get('sort') || 'ending_soon';

    const data = await getAuctions(page);
    let auctions = data.auctions || [];

    // Filter
    if (binOnly) {
      auctions = auctions.filter(a => a.bin);
    }
    if (category !== 'all') {
      auctions = auctions.filter(a => a.category?.toLowerCase() === category.toLowerCase());
    }
    if (tier !== 'all') {
      auctions = auctions.filter(a => a.tier?.toLowerCase() === tier.toLowerCase());
    }
    if (query) {
      auctions = auctions.filter(a =>
        a.item_name?.toLowerCase().includes(query) ||
        a.item_lore?.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sort === 'price_asc') {
      auctions.sort((a, b) => (a.bin ? a.starting_bid : (a.highest_bid_amount || a.starting_bid)) - (b.bin ? b.starting_bid : (b.highest_bid_amount || b.starting_bid)));
    } else if (sort === 'price_desc') {
      auctions.sort((a, b) => (b.bin ? b.starting_bid : (b.highest_bid_amount || b.starting_bid)) - (a.bin ? a.starting_bid : (a.highest_bid_amount || a.starting_bid)));
    } else if (sort === 'ending_soon') {
      auctions.sort((a, b) => a.end - b.end);
    }

    const formatted = auctions.map(a => {
      const price = a.bin ? a.starting_bid : (a.highest_bid_amount || a.starting_bid);
      return {
        uuid: a.uuid,
        itemName: a.item_name,
        formattedName: formatMinecraftText(a.item_name),
        tier: a.tier || 'COMMON',
        category: a.category,
        bin: Boolean(a.bin),
        price,
        formattedPrice: formatCoins(price),
        bidsCount: a.bids?.length || 0,
        auctioneer: a.auctioneer,
        start: a.start,
        end: a.end,
        loreHtml: a.item_lore ? a.item_lore.split('\n').map(l => formatMinecraftText(l)) : []
      };
    });

    return NextResponse.json({
      success: true,
      page: data.page,
      totalPages: data.totalPages,
      totalAuctions: data.totalAuctions,
      count: formatted.length,
      auctions: formatted
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
