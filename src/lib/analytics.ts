import { posthog } from '@/components/PostHogProvider';

// ============================================
// Type-safe Analytics Events for MorphDB
// ============================================

// Event types for autocomplete and type safety
export type AnalyticsEvent =
  // Authentication events
  | 'signup_started'
  | 'signup_completed'
  | 'login_completed'
  | 'logout'
  | 'password_reset_requested'
  | 'password_reset_completed'
  // Trial & Subscription events
  | 'trial_started'
  | 'trial_converted'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  // Core product events
  | 'migration_started'
  | 'migration_completed'
  | 'migration_failed'
  | 'batch_migration_started'
  | 'batch_migration_completed'
  | 'batch_migration_cancelled'
  // Feature usage events
  | 'model_selected'
  | 'source_dialect_selected'
  | 'target_dialect_selected'
  | 'file_uploaded'
  | 'result_downloaded'
  | 'result_copied'
  // Engagement events
  | 'waitlist_joined'
  | 'support_ticket_submitted'
  | 'docs_viewed'
  | 'faq_expanded'
  | 'pricing_viewed'
  | 'cta_clicked';

// Event properties type map
interface EventProperties {
  // Auth
  signup_started: { method?: 'email' | 'google' | 'github' };
  signup_completed: { method?: 'email' | 'google' | 'github' };
  login_completed: { method?: 'email' | 'google' | 'github' };
  logout: Record<string, never>;
  password_reset_requested: Record<string, never>;
  password_reset_completed: Record<string, never>;
  
  // Trial & Subscription
  trial_started: { plan: string };
  trial_converted: { plan: string; trial_duration_days?: number };
  subscription_started: { plan: string; price?: number };
  subscription_cancelled: { plan: string; reason?: string };
  subscription_upgraded: { from_plan: string; to_plan: string };
  subscription_downgraded: { from_plan: string; to_plan: string };
  
  // Migrations
  migration_started: {
    source_dialect: string;
    target_dialect: string;
    model: string;
    input_length?: number;
  };
  migration_completed: {
    source_dialect: string;
    target_dialect: string;
    model: string;
    duration_ms?: number;
    output_length?: number;
  };
  migration_failed: {
    source_dialect: string;
    target_dialect: string;
    model: string;
    error_type?: string;
  };
  batch_migration_started: {
    file_count: number;
    source_dialect: string;
    target_dialect: string;
    model: string;
  };
  batch_migration_completed: {
    file_count: number;
    success_count: number;
    failure_count: number;
    duration_ms?: number;
  };
  batch_migration_cancelled: {
    file_count: number;
    completed_count: number;
  };
  
  // Feature usage
  model_selected: { model: string; previous_model?: string };
  source_dialect_selected: { dialect: string };
  target_dialect_selected: { dialect: string };
  file_uploaded: { file_count: number; total_size_bytes?: number };
  result_downloaded: { format: 'sql' | 'zip'; file_count?: number };
  result_copied: Record<string, never>;
  
  // Engagement
  waitlist_joined: { tier: string };
  support_ticket_submitted: { subject_category?: string };
  docs_viewed: { page: string };
  faq_expanded: { question_index: number };
  pricing_viewed: Record<string, never>;
  cta_clicked: { cta_name: string; location: string };
}

/**
 * Track an analytics event with type-safe properties
 */
export function trackEvent<E extends AnalyticsEvent>(
  event: E,
  properties?: E extends keyof EventProperties ? EventProperties[E] : Record<string, unknown>
) {
  if (typeof window === 'undefined') return;
  
  try {
    posthog.capture(event, properties);
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.warn('[Analytics] Failed to track event:', event, error);
  }
}

/**
 * Identify a user for analytics (call after login/signup)
 */
export function identifyUser(
  userId: string,
  traits?: {
    email?: string;
    name?: string;
    company?: string;
    plan?: string;
    created_at?: string;
  }
) {
  if (typeof window === 'undefined') return;
  
  try {
    posthog.identify(userId, traits);
  } catch (error) {
    console.warn('[Analytics] Failed to identify user:', error);
  }
}

/**
 * Reset user identity (call on logout)
 */
export function resetUser() {
  if (typeof window === 'undefined') return;
  
  try {
    posthog.reset();
  } catch (error) {
    console.warn('[Analytics] Failed to reset user:', error);
  }
}

/**
 * Set user properties without identifying
 */
export function setUserProperties(properties: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  
  try {
    posthog.people.set(properties);
  } catch (error) {
    console.warn('[Analytics] Failed to set user properties:', error);
  }
}

/**
 * Track a timed event (start)
 */
const eventTimers = new Map<string, number>();

export function startTimer(eventName: string) {
  eventTimers.set(eventName, Date.now());
}

/**
 * Track a timed event (end) - returns duration in ms
 */
export function endTimer(eventName: string): number | undefined {
  const startTime = eventTimers.get(eventName);
  if (!startTime) return undefined;
  
  const duration = Date.now() - startTime;
  eventTimers.delete(eventName);
  return duration;
}
