import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
const VALID_PLANS = ['free', 'pro', 'design_partner', 'enterprise'];

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = await rateLimit(`admin-grant-pro:${ip}`, 10, 60_000);
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

    const { userId, plan = 'pro' } = body as { userId?: string; plan?: string };

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

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

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[Grant Pro Error]', e);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}
