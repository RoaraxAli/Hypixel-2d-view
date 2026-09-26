import { NextResponse } from 'next/server';
import { getBazaar } from '@/lib/hypixelApi';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getBazaar();
    const rawProducts = data.products || {};

    const products = Object.values(rawProducts).map(p => {
      const q = p.quick_status || {};
      const buyPrice = q.buyPrice || 0;
      const sellPrice = q.sellPrice || 0;
      const spread = buyPrice - sellPrice;
      const marginPercent = sellPrice > 0 ? (spread / sellPrice) * 100 : 0;
      const weeklyVolume = (q.buyMovingWeek || 0) + (q.sellMovingWeek || 0);

      // Clean title from ID (e.g. ENCHANTED_CARROT_ON_A_STICK -> Enchanted Carrot On A Stick)
      const cleanName = p.product_id
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());

      return {
        id: p.product_id,
        name: cleanName,
        buyPrice,
        sellPrice,
        spread,
        marginPercent: parseFloat(marginPercent.toFixed(1)),
        buyVolume: q.buyVolume || 0,
        sellVolume: q.sellVolume || 0,
        buyOrders: q.buyOrders || 0,
        sellOrders: q.sellOrders || 0,
        weeklyVolume,
        topBuyOrder: p.buy_summary?.[0] || null,
        topSellOffer: p.sell_summary?.[0] || null
      };
    });

    return NextResponse.json({
      success: true,
      lastUpdated: data.lastUpdated,
      totalProducts: products.length,
      products
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
