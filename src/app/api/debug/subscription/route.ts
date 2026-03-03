import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const subscription = await prisma.subscription.findUnique({ 
      where: { userId: user.id } 
    });
    
    const now = new Date();
    const trialEnd = subscription?.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
    
    return NextResponse.json({
      subscription: subscription ? {
        id: subscription.id,
        userId: subscription.userId,
        plan: subscription.plan,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt?.toISOString(),
        trialTakenAt: subscription.trialTakenAt?.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
      } : null,
      debug: {
        serverNow: now.toISOString(),
        serverNowTimestamp: now.getTime(),
        trialEndTimestamp: trialEnd?.getTime() ?? null,
        isTrialEndInFuture: trialEnd ? trialEnd > now : null,
        diffMs: trialEnd ? trialEnd.getTime() - now.getTime() : null,
        diffDays: trialEnd ? (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) : null,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
