import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getUserTier } from '@/lib/tier';

const TRIAL_DAYS = 3;

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentTier = await getUserTier(user.id);
    if (currentTier.tier !== 'free') {
      return NextResponse.json({ error: 'Trial only available for free users.' }, { status: 400 });
    }

    const existingSub = await prisma.subscription.findUnique({ where: { userId: user.id } });
    if (existingSub?.trialTakenAt) {
      // One-time trial: if a trial was ever taken, do not allow another, even if expired.
      return NextResponse.json(
        { error: 'You have already used your free trial. Please upgrade to Pro.' },
        { status: 400 },
      );
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: 'pro',
        status: 'trialing',
        trialEndsAt: trialEndDate,
        trialTakenAt: new Date(),
      },
      create: {
        userId: user.id,
        plan: 'pro',
        status: 'trialing',
        trialEndsAt: trialEndDate,
        trialTakenAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `You now have ${TRIAL_DAYS} days of Pro access!`,
      trialEndsAt: trialEndDate.toISOString()
    });
  } catch (e) {
    console.error('[Start Trial Error]', e);
    return NextResponse.json({ error: 'Failed to start trial.' }, { status: 500 });
  }
}
