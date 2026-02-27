import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = await rateLimit(`admin-reset-usage:${ip}`, 10, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }
    const { userId } = body as { userId?: string };

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (userId) {
      await prisma.monthlyUsage.upsert({
        where: { userId_yearMonth: { userId, yearMonth } },
        update: {
          batchCount: 0,
          translationCount: 0,
          tokenCount: 0,
        },
        create: {
          userId,
          yearMonth,
          batchCount: 0,
          translationCount: 0,
          tokenCount: 0,
        },
      });
      return NextResponse.json({ success: true, message: 'User usage reset successfully.' });
    } else {
      await prisma.monthlyUsage.updateMany({
        where: { yearMonth },
        data: {
          batchCount: 0,
          translationCount: 0,
          tokenCount: 0,
        },
      });
      return NextResponse.json({ success: true, message: 'All users usage reset successfully.' });
    }
  } catch (e) {
    console.error('[Admin Reset Usage Error]', e);
    return NextResponse.json({ error: 'Failed to reset usage.' }, { status: 500 });
  }
}
