import { prisma } from '@/lib/prisma';

export type UserTier = 'free' | 'pro' | 'design_partner' | 'enterprise';

export interface TierLimits {
  tier: UserTier;
  batchesPerMonth: number;
  filesPerBatch: number;
  translationsPerMonth: number;
  maxChars: number;
  allowedModels: string[];
  features: string[];
}

const TIER_CONFIG: Record<UserTier, Omit<TierLimits, 'tier'>> = {
  free: {
    batchesPerMonth: 5,
    filesPerBatch: 10,
    translationsPerMonth: 50,
    maxChars: 10_000,
    allowedModels: ['gpt-4o-mini'],
    features: ['community_discord'],
  },
  pro: {
    batchesPerMonth: 50,
    filesPerBatch: 50,
    translationsPerMonth: 500,
    maxChars: 10_000,
    allowedModels: ['gpt-4o-mini', 'claude-haiku', 'claude-sonnet'],
    features: ['file_upload', 'zip_download', 'priority_email', 'all_models'],
  },
  design_partner: {
    batchesPerMonth: Infinity,
    filesPerBatch: Infinity,
    translationsPerMonth: Infinity,
    maxChars: 10_000,
    allowedModels: ['gpt-4o-mini', 'claude-haiku', 'claude-sonnet'],
    features: ['file_upload', 'zip_download', 'all_models', 'dbt_generation', 'dedicated_slack', 'logic_guarantee'],
  },
  enterprise: {
    batchesPerMonth: Infinity,
    filesPerBatch: Infinity,
    translationsPerMonth: Infinity,
    maxChars: 10_000,
    allowedModels: ['gpt-4o-mini', 'claude-haiku', 'claude-sonnet'],
    features: ['file_upload', 'zip_download', 'all_models', 'dbt_generation', 'vpc', 'soc2', 'sla'],
  },
};

export function getTierLimits(tier: UserTier): TierLimits {
  return { tier, ...TIER_CONFIG[tier] };
}

export async function getUserTier(userId: string): Promise<TierLimits> {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    const isOnTrial = sub?.trialEndsAt && new Date(sub.trialEndsAt) > new Date();
    const tier = (isOnTrial ? 'pro' : (sub?.status === 'active' ? sub.plan : 'free')) as UserTier;
    return getTierLimits(tier);
  } catch {
    return getTierLimits('free');
  }
}

export function getTierLabel(tier: UserTier): string {
  const labels: Record<UserTier, string> = {
    free: 'Free',
    pro: 'Pro',
    design_partner: 'Design Partner',
    enterprise: 'Enterprise',
  };
  return labels[tier];
}

export async function getTrialStatus(userId: string): Promise<{ isOnTrial: boolean; daysRemaining: number }> {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (sub?.trialEndsAt && new Date(sub.trialEndsAt) > new Date()) {
      const now = new Date();
      const trialEnd = new Date(sub.trialEndsAt);
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { isOnTrial: true, daysRemaining: Math.max(0, daysRemaining) };
    }
    return { isOnTrial: false, daysRemaining: 0 };
  } catch {
    return { isOnTrial: false, daysRemaining: 0 };
  }
}

export async function hasUsedTrial(userId: string): Promise<boolean> {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    return !!sub?.trialTakenAt;
  } catch {
    return false;
  }
}
