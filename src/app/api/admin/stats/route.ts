import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = await rateLimit(`admin-stats:${ip}`, 20, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse pagination parameters
    const url = new URL(req.url);
    const waitlistOffset = Math.max(0, parseInt(url.searchParams.get('waitlistOffset') ?? '0', 10));
    const loginsOffset = Math.max(0, parseInt(url.searchParams.get('loginsOffset') ?? '0', 10));
    const signupsOffset = Math.max(0, parseInt(url.searchParams.get('signupsOffset') ?? '0', 10));
    
    const LIMIT = 50;

    const [
      waitlistCount,
      waitlistEntries,
      waitlistEntriesTotal,
      loginLogs,
      loginsTotal,
      subscriptionStats,
      recentSignups,
      signupsTotal,
      supportTickets,
    ] = await Promise.all([
      prisma.waitlistEntry.count(),
      prisma.waitlistEntry.findMany({
        orderBy: { createdAt: 'desc' },
        skip: waitlistOffset,
        take: LIMIT,
      }),
      prisma.waitlistEntry.count(),
      prisma.loginLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: loginsOffset,
        take: LIMIT,
      }),
      prisma.loginLog.count(),
      prisma.subscription.groupBy({
        by: ['plan'],
        _count: { plan: true },
      }),
      prisma.profile.findMany({
        orderBy: { createdAt: 'desc' },
        skip: signupsOffset,
        take: LIMIT,
      }),
      prisma.profile.count(),
      prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      waitlist: { 
        count: waitlistCount, 
        entries: waitlistEntries,
        total: waitlistEntriesTotal,
        offset: waitlistOffset,
        limit: LIMIT,
        hasMore: waitlistOffset + LIMIT < waitlistEntriesTotal,
      },
      logins: {
        entries: loginLogs,
        total: loginsTotal,
        offset: loginsOffset,
        limit: LIMIT,
        hasMore: loginsOffset + LIMIT < loginsTotal,
      },
      subscriptions: subscriptionStats,
      recentSignups: {
        entries: recentSignups,
        total: signupsTotal,
        offset: signupsOffset,
        limit: LIMIT,
        hasMore: signupsOffset + LIMIT < signupsTotal,
      },
      supportTickets,
    });
  } catch (e) {
    console.error('[Admin Stats Error]', e);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
