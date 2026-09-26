import { NextResponse } from 'next/server';
import { getElection } from '@/lib/hypixelApi';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getElection();
    
    let totalVotes = 0;
    const candidates = data.current?.candidates || [];
    for (const c of candidates) {
      totalVotes += (c.votes || 0);
    }

    const candidatesWithPercent = candidates.map(c => ({
      name: c.name,
      votes: c.votes || 0,
      formattedVotes: (c.votes || 0).toLocaleString(),
      percentage: totalVotes > 0 ? parseFloat(((c.votes / totalVotes) * 100).toFixed(1)) : 0,
      perks: c.perks || []
    })).sort((a, b) => b.votes - a.votes);

    return NextResponse.json({
      success: true,
      lastUpdated: data.lastUpdated,
      mayor: data.mayor || null,
      electionActive: Boolean(data.current),
      currentElection: {
        year: data.current?.year || null,
        totalVotes,
        formattedTotalVotes: totalVotes.toLocaleString(),
        candidates: candidatesWithPercent
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
