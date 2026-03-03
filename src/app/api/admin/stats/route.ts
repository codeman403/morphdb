import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { cleanupExpiredTrials } from '@/lib/tier';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

// Pagination limits to prevent DoS attacks
const MAX_LIMIT = 100;
const MAX_OFFSET = 100_000;

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

    // Parse pagination parameters with limits to prevent DoS
    const url = new URL(req.url);
    const waitlistOffset = Math.min(MAX_OFFSET, Math.max(0, parseInt(url.searchParams.get('waitlistOffset') ?? '0', 10)));
    const loginsOffset = Math.min(MAX_OFFSET, Math.max(0, parseInt(url.searchParams.get('loginsOffset') ?? '0', 10)));
    const signupsOffset = Math.min(MAX_OFFSET, Math.max(0, parseInt(url.searchParams.get('signupsOffset') ?? '0', 10)));
    const subscriptionsOffset = Math.min(MAX_OFFSET, Math.max(0, parseInt(url.searchParams.get('subscriptionsOffset') ?? '0', 10)));
    
    const LIMIT = Math.min(MAX_LIMIT, 50);

    // Clean up any expired trials before fetching stats
    await cleanupExpiredTrials();

    const [
      waitlistCount,
      waitlistEntries,
      waitlistEntriesTotal,
      loginLogs,
      loginsTotal,
      recentSignups,
      signupsTotal,
      subscriptions,
      subscriptionsTotal,
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
      prisma.profile.findMany({
        orderBy: { createdAt: 'desc' },
        skip: signupsOffset,
        take: LIMIT,
      }),
      prisma.profile.count(),
      prisma.subscription.findMany({
        where: {
          NOT: { plan: 'free' },
        },
        orderBy: { createdAt: 'desc' },
        skip: subscriptionsOffset,
        take: LIMIT,
      }),
      prisma.subscription.count({
        where: {
          NOT: { plan: 'free' },
        },
      }),
      prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    // Fetch profiles for subscriptions
    const profileIds = subscriptions.map(s => s.userId);
    const profiles = await prisma.profile.findMany({
      where: { id: { in: profileIds } },
    });
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    // Combine subscription data with profiles
    const subscriptionsWithProfiles = subscriptions.map(sub => ({
      ...sub,
      profile: profileMap.get(sub.userId) || { id: sub.userId, email: '', name: null, company: null, avatarUrl: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    }));

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
      recentSignups: {
        entries: recentSignups,
        total: signupsTotal,
        offset: signupsOffset,
        limit: LIMIT,
        hasMore: signupsOffset + LIMIT < signupsTotal,
      },
      subscriptions: {
        entries: subscriptionsWithProfiles,
        total: subscriptionsTotal,
        offset: subscriptionsOffset,
        limit: LIMIT,
        hasMore: subscriptionsOffset + LIMIT < subscriptionsTotal,
      },
      supportTickets,
    });
  } catch (e) {
    console.error('[Admin Stats Error]', e);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
