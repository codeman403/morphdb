import { prisma } from '@/lib/prisma';

export type UserTier = 'free' | 'pro' | 'design_partner' | 'enterprise';

// Helper to check if a trial has expired
function isTrialExpired(sub: { trialEndsAt?: Date | null; status?: string | null }): boolean {
  if (!sub.trialEndsAt || sub.status !== 'trialing') return false;
  return new Date(sub.trialEndsAt) <= new Date();
}

// Lazy update: when we detect an expired trial, update the database
async function updateExpiredTrialStatus(subscriptionId: string): Promise<void> {
  try {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'expired',
        plan: 'free',
      },
    });
    console.log('[Trial] Updated expired trial to free:', subscriptionId);
  } catch (error) {
    // Log but don't throw - this is a background cleanup operation
    console.error('Failed to update expired trial status:', error);
  }
}

// Exported function to clean up all expired trials - can be called from admin APIs or cron jobs
export async function cleanupExpiredTrials(): Promise<number> {
  try {
    const now = new Date();
    const result = await prisma.subscription.updateMany({
      where: {
        status: 'trialing',
        trialEndsAt: {
          lte: now,
        },
      },
      data: {
        status: 'expired',
        plan: 'free',
      },
    });
    if (result.count > 0) {
      console.log(`[Trial Cleanup] Updated ${result.count} expired trials`);
    }
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired trials:', error);
    return 0;
  }
}

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

// Internal helper to compute tier from subscription object
// Returns both the tier and whether the trial has expired (for lazy update)
function getTierFromSubscription(sub: Awaited<ReturnType<typeof prisma.subscription.findUnique>> | null): { tier: UserTier; shouldUpdateExpiredTrial: boolean } {
  // Priority 1: If subscription is active (paid), use the plan
  if (sub?.status === 'active') {
    if (sub.plan === 'design_partner') return { tier: 'design_partner', shouldUpdateExpiredTrial: false };
    if (sub.plan === 'enterprise') return { tier: 'enterprise', shouldUpdateExpiredTrial: false };
    if (sub.plan === 'pro') return { tier: 'pro', shouldUpdateExpiredTrial: false };
  }

  // Priority 2: If on trial (not expired), use Pro
  const isOnTrial = sub?.trialEndsAt && new Date(sub.trialEndsAt) > new Date();
  if (isOnTrial) {
    return { tier: 'pro', shouldUpdateExpiredTrial: false };
  }

  // Check if trial just expired and needs DB update
  const shouldUpdate = sub ? isTrialExpired(sub) : false;

  // Priority 3: Default to free
  return { tier: 'free', shouldUpdateExpiredTrial: shouldUpdate };
}

export async function getUserTier(userId: string, subscription?: Awaited<ReturnType<typeof prisma.subscription.findUnique>>): Promise<TierLimits> {
  try {
    const sub = subscription ?? await prisma.subscription.findUnique({ where: { userId } });
    const { tier, shouldUpdateExpiredTrial } = getTierFromSubscription(sub);
    
    // Lazy update: if trial expired, update DB in background (fire and forget)
    if (shouldUpdateExpiredTrial && sub?.id) {
      updateExpiredTrialStatus(sub.id);
    }
    
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

export async function getUserTierLabel(userId: string, subscription?: Awaited<ReturnType<typeof prisma.subscription.findUnique>>): Promise<string> {
  try {
    const sub = subscription ?? await prisma.subscription.findUnique({ where: { userId } });
    
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
    
    // Lazy update: if trial expired, update DB in background
    if (sub && isTrialExpired(sub)) {
      updateExpiredTrialStatus(sub.id);
    }
    
    return 'Free';
  } catch {
    return 'Free';
  }
}

export async function getTrialStatus(userId: string, subscription?: Awaited<ReturnType<typeof prisma.subscription.findUnique>>): Promise<{ isOnTrial: boolean; daysRemaining: number }> {
  try {
    const sub = subscription ?? await prisma.subscription.findUnique({ where: { userId } });
    if (sub?.trialEndsAt && new Date(sub.trialEndsAt) > new Date()) {
      const now = new Date();
      const trialEnd = new Date(sub.trialEndsAt);
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { isOnTrial: true, daysRemaining: Math.max(0, daysRemaining) };
    }
    
    // Lazy update: if trial expired, update DB in background
    if (sub && isTrialExpired(sub)) {
      updateExpiredTrialStatus(sub.id);
    }
    
    return { isOnTrial: false, daysRemaining: 0 };
  } catch {
    return { isOnTrial: false, daysRemaining: 0 };
  }
}

export async function hasUsedTrial(userId: string, subscription?: Awaited<ReturnType<typeof prisma.subscription.findUnique>>): Promise<boolean> {
  try {
    const sub = subscription ?? await prisma.subscription.findUnique({ where: { userId } });
    return !!sub?.trialTakenAt;
  } catch {
    return false;
  }
}
