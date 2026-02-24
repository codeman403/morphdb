import { prisma } from '@/lib/prisma';
import { getTierLimits, UserTier } from '@/lib/tier';

export function getYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function getMonthlyUsage(userId: string) {
  const yearMonth = getYearMonth();
  try {
    const usage = await prisma.monthlyUsage.findUnique({
      where: { userId_yearMonth: { userId, yearMonth } },
    });
    return usage ?? { batchCount: 0, translationCount: 0, tokenCount: 0 };
  } catch {
    return { batchCount: 0, translationCount: 0, tokenCount: 0 };
  }
}

export async function checkQuota(userId: string, tier: UserTier): Promise<{ ok: boolean; error?: string }> {
  const limits = getTierLimits(tier);
  const usage = await getMonthlyUsage(userId);

  if (limits.batchesPerMonth !== Infinity && usage.batchCount >= limits.batchesPerMonth) {
    return {
      ok: false,
      error: `Monthly batch limit reached (${limits.batchesPerMonth} batches used). Upgrade your plan for more.`,
    };
  }

  if (limits.translationsPerMonth !== Infinity && usage.translationCount >= limits.translationsPerMonth) {
    return {
      ok: false,
      error: `Monthly translation limit reached (${limits.translationsPerMonth} translations used). Upgrade your plan for more.`,
    };
  }

  return { ok: true };
}

export async function incrementUsage(userId: string, translations: number, tokens: number) {
  const yearMonth = getYearMonth();
  try {
    await prisma.monthlyUsage.upsert({
      where: { userId_yearMonth: { userId, yearMonth } },
      update: {
        batchCount: { increment: 1 },
        translationCount: { increment: translations },
        tokenCount: { increment: tokens },
      },
      create: {
        userId,
        yearMonth,
        batchCount: 1,
        translationCount: translations,
        tokenCount: tokens,
      },
    });
  } catch (e) {
    console.error('[Usage Increment Error]', e);
  }
}
