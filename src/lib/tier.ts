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
    
    // Priority 1: If subscription is active or trialing (paid), use the plan
    if (sub?.status === 'active' || sub?.status === 'trialing') {
      // If they have a paid plan (not just trial), use that plan
      if (sub.plan && sub.plan !== 'free' && sub.plan !== 'pro' && sub.plan !== 'trialing') {
        const tier = sub.plan as UserTier;
        return getTierLimits(tier);
      }
      // If plan is 'pro' or 'trialing', check if they have a stripe subscription (paid)
      if (sub.stripeSubscriptionId) {
        return getTierLimits('pro');
      }
    }
    
    // Priority 2: If on trial and no active subscription, use trial
    const isOnTrial = sub?.trialEndsAt && new Date(sub.trialEndsAt) > new Date();
    if (isOnTrial) {
      return getTierLimits('pro');
    }
    
    // Priority 3: Default to free
    return getTierLimits('free');
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

export async function getUserTierLabel(userId: string): Promise<string> {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    
    // If subscription is active (either via Stripe or manual admin grant)
    if (sub?.status === 'active') {
      if (sub.plan === 'design_partner') return 'Design Partner';
      if (sub.plan === 'enterprise') return 'Enterprise';
      return 'Pro';
    }
    
    // If on trial (trialEndsAt is set and in the future)
    const isOnTrial = sub?.trialEndsAt && new Date(sub.trialEndsAt) > new Date();
    if (isOnTrial) {
      return 'Pro Trial';
    }
    
    return 'Free';
  } catch {
    return 'Free';
  }
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
