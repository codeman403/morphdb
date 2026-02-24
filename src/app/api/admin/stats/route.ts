import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [
      waitlistCount,
      waitlistEntries,
      loginLogs,
      subscriptionStats,
      recentSignups,
    ] = await Promise.all([
      prisma.waitlistEntry.count(),
      prisma.waitlistEntry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.loginLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.subscription.groupBy({
        by: ['plan'],
        _count: { plan: true },
      }),
      prisma.profile.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      waitlist: { count: waitlistCount, entries: waitlistEntries },
      logins: loginLogs,
      subscriptions: subscriptionStats,
      recentSignups,
    });
  } catch (e) {
    console.error('[Admin Stats Error]', e);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
