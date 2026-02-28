import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getUserTier } from '@/lib/tier';
import { sendEmail, getTrialStartedEmailHTML } from '@/lib/email';

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

    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      const existingSub = await tx.subscription.findUnique({ where: { userId: user.id } });
      
      if (existingSub?.trialTakenAt) {
        // One-time trial: if a trial was ever taken, do not allow another, even if expired.
        throw new Error('TRIAL_ALREADY_TAKEN');
      }

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

      return await tx.subscription.upsert({
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
    });

    // Send trial-started email (fire-and-forget)
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    const userName = profile?.name || user.email?.split('@')[0] || 'User';
    sendEmail({
      to: user.email!,
      subject: 'MorphDB: Your Pro Trial is Activated',
      html: getTrialStartedEmailHTML(userName),
    }).catch((e) => console.error('[Trial Email Error]', e));

    return NextResponse.json({ 
      success: true, 
      message: `You now have ${TRIAL_DAYS} days of Pro access!`,
      trialEndsAt: result.trialEndsAt?.toISOString()
    });
  } catch (e) {
    if ((e as Error).message === 'TRIAL_ALREADY_TAKEN') {
      return NextResponse.json(
        { error: 'You have already used your free trial. Please upgrade to Pro.' },
        { status: 400 },
      );
    }
    console.error('[Start Trial Error]', e);
    return NextResponse.json({ error: 'Failed to start trial.' }, { status: 500 });
  }
}
