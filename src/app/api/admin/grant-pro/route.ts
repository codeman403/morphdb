import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';
import { anonymizeIpAddress, maskUserAgent } from '@/lib/pii-utils';
import { sendEmail, getSubscriptionActivatedEmailHTML } from '@/lib/email';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
const VALID_PLANS = ['free', 'pro', 'design_partner', 'enterprise'];

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const ip = getClientIp(req.headers)

  const logContext = {
    timestamp: new Date().toISOString(),
    requestId,
    level: 'info',
    action: 'admin_grant_plan',
    ipAddress: anonymizeIpAddress(ip),
    userAgent: maskUserAgent(req.headers.get('user-agent') ?? undefined),
  }

  try {
    const { ok } = await rateLimit(`admin-grant-pro:${ip}`, 10, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      console.log(JSON.stringify({
        ...logContext,
        level: 'warn',
        action: 'admin_grant_plan_unauthorized',
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

    const { userId, plan = 'pro' } = body as { userId?: string; plan?: string };

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get the before state for audit trail
    const before = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (plan === 'free') {
      // Revoke access - reset to free
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          plan: 'free',
          status: 'inactive',
          trialEndsAt: null,
          trialTakenAt: null,
          stripeSubscriptionId: null,
          stripeCustomerId: null,
        },
        create: {
          userId,
          plan: 'free',
          status: 'inactive',
        },
      });
    } else {
      // Grant paid plan access
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          plan,
          status: 'active',
          trialEndsAt: null,
        },
        create: {
          userId,
          plan,
          status: 'active',
        },
      });
    }

    // Get the after state for audit trail
    const after = await prisma.subscription.findUnique({
      where: { userId },
    })

    // Log audit trail
    await createAuditLog({
      action: 'grant_plan',
      userId: user.id,
      resourceType: 'subscription',
      resourceId: after?.id || userId,
      changes: {
        before: before ? { plan: before.plan, status: before.status } : null,
        after: after ? { plan: after.plan, status: after.status } : null,
        targetUserId: userId,
      },
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
    })

    console.log(JSON.stringify({
      ...logContext,
      level: 'info',
      action: 'admin_grant_plan_success',
      adminId: user.id,
      targetUserId: userId,
      newPlan: plan,
      durationMs: Date.now() - startTime,
    }))

    // Send plan activation email if granting a paid plan (fire-and-forget)
    if (plan !== 'free') {
      const userProfile = await prisma.profile.findUnique({ where: { id: userId } });
      const userName = userProfile?.name || userProfile?.email?.split('@')[0] || 'User';
      const planNames: Record<string, string> = {
        'pro': 'Pro',
        'design_partner': 'Design Partner',
        'enterprise': 'Enterprise',
      };
      if (userProfile?.email) {
        sendEmail({
          to: userProfile.email,
          subject: `Your ${planNames[plan] || plan} Plan is Now Active`,
          html: getSubscriptionActivatedEmailHTML(userName, planNames[plan] || plan),
        }).catch((e) => console.error('[Plan Grant Email Error]', e));
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[Grant Pro Error]', {
      requestId,
      error: e instanceof Error ? e.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}
