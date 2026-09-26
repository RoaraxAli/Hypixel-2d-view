import { NextResponse } from 'next/server';
import { getEndedAuctions } from '@/lib/hypixelApi';
import { parseNbtItems } from '@/lib/nbtParser';
import { formatCoins } from '@/lib/skyblockUtils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getEndedAuctions();
    const rawAuctions = data.auctions || [];

    const formatted = await Promise.all(
      rawAuctions.slice(0, 60).map(async a => {
        let parsedItem = null;
        if (a.item_bytes) {
          const items = await parseNbtItems(a.item_bytes);
          parsedItem = items[0] || null;
        }

        return {
          auctionId: a.auction_id,
          seller: a.seller,
          buyer: a.buyer,
          timestamp: a.timestamp,
          price: a.price,
          formattedPrice: formatCoins(a.price),
          bin: Boolean(a.bin),
          item: parsedItem
        };
      })
    );

    return NextResponse.json({
      success: true,
      lastUpdated: data.lastUpdated,
      count: formatted.length,
      auctions: formatted
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
