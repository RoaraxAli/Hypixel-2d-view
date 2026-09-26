import { NextResponse } from 'next/server';
import { getBingoResources, getPlayerBingo } from '@/lib/hypixelApi';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');

    const [resources, personal] = await Promise.all([
      getBingoResources(),
      uuid ? getPlayerBingo(uuid) : null
    ]);

    return NextResponse.json({
      success: true,
      event: {
        id: resources.id,
        name: resources.name,
        start: resources.start,
        end: resources.end,
        modifier: resources.modifier,
        goals: resources.goals || []
      },
      personal: personal?.events || null
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
