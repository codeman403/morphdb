import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';
import { anonymizeIpAddress, maskUserAgent } from '@/lib/pii-utils';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const ip = getClientIp(req.headers)

  const logContext = {
    timestamp: new Date().toISOString(),
    requestId,
    level: 'info',
    action: 'admin_reset_usage',
    ipAddress: anonymizeIpAddress(ip),
    userAgent: maskUserAgent(req.headers.get('user-agent') ?? undefined),
  }

  try {
    const { ok } = await rateLimit(`admin-reset-usage:${ip}`, 10, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      console.log(JSON.stringify({
        ...logContext,
        level: 'warn',
        action: 'admin_reset_usage_unauthorized',
        userEmail: user?.email,
      }))
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
      // Get before state for audit trail
      const before = await prisma.monthlyUsage.findUnique({
        where: { userId_yearMonth: { userId, yearMonth } },
      })

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

      // Log audit trail
      await createAuditLog({
        action: 'reset_usage',
        userId: user.id,
        resourceType: 'usage',
        resourceId: userId,
        changes: {
          before: before ? {
            batchCount: before.batchCount,
            translationCount: before.translationCount,
            tokenCount: before.tokenCount,
          } : null,
          after: {
            batchCount: 0,
            translationCount: 0,
            tokenCount: 0,
          },
          yearMonth,
          targetUserId: userId,
        },
        ipAddress: ip,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })

      console.log(JSON.stringify({
        ...logContext,
        level: 'info',
        action: 'admin_reset_usage_success',
        adminId: user.id,
        targetUserId: userId,
        yearMonth,
        durationMs: Date.now() - startTime,
      }))

      return NextResponse.json({ success: true, message: 'User usage reset successfully.' });
    } else {
      // Get count of users being reset
      const usersAffected = await prisma.monthlyUsage.count({
        where: { yearMonth },
      })

      await prisma.monthlyUsage.updateMany({
        where: { yearMonth },
        data: {
          batchCount: 0,
          translationCount: 0,
          tokenCount: 0,
        },
      });

      // Log audit trail for batch reset
      await createAuditLog({
        action: 'reset_usage_batch',
        userId: user.id,
        resourceType: 'usage',
        resourceId: yearMonth,
        changes: {
          action: 'reset_all_users',
          yearMonth,
          usersAffected,
        },
        ipAddress: ip,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })

      console.log(JSON.stringify({
        ...logContext,
        level: 'info',
        action: 'admin_reset_usage_batch_success',
        adminId: user.id,
        yearMonth,
        usersAffected,
        durationMs: Date.now() - startTime,
      }))

      return NextResponse.json({ success: true, message: 'All users usage reset successfully.' });
    }
  } catch (e) {
    console.error('[Admin Reset Usage Error]', {
      requestId,
      error: e instanceof Error ? e.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to reset usage.' }, { status: 500 });
  }
}
