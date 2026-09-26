import { NextResponse } from 'next/server';
import { API_KEY, rateLimitStatus } from '@/lib/hypixelApi';

export const dynamic = 'force-dynamic';

export async function GET() {
  const maskedKey = `${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`;
  return NextResponse.json({
    status: 'ONLINE',
    apiKeyMasked: maskedKey,
    apiKeyValid: true,
    rateLimit: rateLimitStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: Date.now()
  });
}
