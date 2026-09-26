import { NextResponse } from 'next/server';
import { getBazaar } from '@/lib/hypixelApi';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { productId } = params;
    const data = await getBazaar();
    const product = data.products?.[productId.toUpperCase()];

    if (!product) {
      return NextResponse.json(
        { error: `Product '${productId}' not found in Bazaar.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
