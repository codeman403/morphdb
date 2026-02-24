import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getUserTier, getTierLabel } from '@/lib/tier';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ firstName: null, tier: 'free', tierLabel: 'Free' }, { status: 401 });
    }
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    const tierLimits = await getUserTier(user.id);
    const firstName = profile?.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? null;
    return NextResponse.json({
      firstName,
      tier: tierLimits.tier,
      tierLabel: getTierLabel(tierLimits.tier),
      limits: {
        batchesPerMonth: tierLimits.batchesPerMonth === Infinity ? 'Unlimited' : tierLimits.batchesPerMonth,
        filesPerBatch: tierLimits.filesPerBatch === Infinity ? 'Unlimited' : tierLimits.filesPerBatch,
        translationsPerMonth: tierLimits.translationsPerMonth === Infinity ? 'Unlimited' : tierLimits.translationsPerMonth,
        allowedModels: tierLimits.allowedModels,
      },
    });
  } catch {
    return NextResponse.json({ firstName: null, tier: 'free', tierLabel: 'Free' }, { status: 500 });
  }
}
