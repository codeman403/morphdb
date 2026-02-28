# MorphDB Codebase Bug Report
**Generated:** Sat Feb 28 2026
**Total Issues Found:** 26
**Critical Issues:** 2 | **High Issues:** 9 | **Medium Issues:** 7 | **Low Issues:** 8

---

## CRITICAL ISSUES 🔴

### 1. N+1 Query Problem in Stripe Webhook Handler
- **File:** `src/app/api/stripe/webhook/route.ts`
- **Lines:** 157-170
- **Category:** Database/Query Issues
- **Severity:** 🔴 CRITICAL
- **Impact:** Performance degradation - if a customer cancels a subscription with multiple records, the system will issue N+1 database queries

**Current Code:**
```typescript
const subscriptions = await prisma.subscription.findMany({
  where: { stripeSubscriptionId: stripeSub.id },
});
for (const sub of subscriptions) {
  const userProfile = await prisma.profile.findUnique({ where: { id: sub.userId } });
  // Process each subscription...
}
```

**Problem:** Each iteration queries the database again for the profile. If there are 10 subscriptions, this is 1 initial query + 10 profile queries = 11 total queries.

**Suggested Fix:**
```typescript
const subscriptions = await prisma.subscription.findMany({
  where: { stripeSubscriptionId: stripeSub.id },
});
// Batch load all profiles at once
const profileIds = subscriptions.map(s => s.userId);
const profiles = await prisma.profile.findMany({
  where: { id: { in: profileIds } },
});
const profileMap = new Map(profiles.map(p => [p.id, p]));

for (const sub of subscriptions) {
  const userProfile = profileMap.get(sub.userId);
  // Process each subscription...
}
```

---

### 2. Unpaginated Queries Without Limits in Admin Routes
- **File:** `src/app/api/admin/stats/route.ts`
- **Lines:** 42-68
- **Category:** Database/Query Issues
- **Severity:** 🔴 CRITICAL
- **Impact:** Can cause database to return massive datasets, memory exhaustion, and slow API responses

**Current Code:**
```typescript
const [waitlistCount, loginLogsCount, profilesCount] = await Promise.all([
  prisma.waitlistEntry.count(),
  prisma.loginLog.count(),
  prisma.profile.count(),
]);

// Later: findMany without hardcoded limit on client input
const waitlistEntries = await prisma.waitlistEntry.findMany({
  skip: waitlistOffset,
  take: waitlistLimit, // From user input!
});
```

**Problem:** The `take` parameter comes directly from URL query parameters without a maximum value check. A user could request `take=1000000` and force a massive query.

**Suggested Fix:**
```typescript
const MAX_LIMIT = 100;
const MAX_OFFSET = 10000;

const parsedLimit = Math.min(
  Math.max(1, parseInt(url.searchParams.get('limit') ?? '10', 10)),
  MAX_LIMIT
);
const parsedOffset = Math.min(
  Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10)),
  MAX_OFFSET
);

const waitlistEntries = await prisma.waitlistEntry.findMany({
  skip: parsedOffset,
  take: parsedLimit,
});
```

---

## HIGH SEVERITY ISSUES 🟠

### 3. Implicit 'any' Type in Demo Page Auth Callback
- **File:** `src/app/demo/page.tsx`
- **Line:** ~150
- **Category:** Type Safety Issues
- **Severity:** 🟠 HIGH
- **Impact:** Loss of type safety, potential runtime errors from incorrect property access

**Current Code:**
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (_event: any, session: any) => { // ❌ Implicit any
    // ...
  }
);
```

**Suggested Fix:**
```typescript
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (_event: AuthChangeEvent, session: Session | null) => {
    // ...
  }
);
```

---

### 4. Missing Type Safety in Supabase Client Stub
- **File:** `src/lib/supabase/client.ts`
- **Line:** 26
- **Category:** Type Safety Issues
- **Severity:** 🟠 HIGH
- **Impact:** Type checking bypassed when Supabase not configured

**Current Code:**
```typescript
return {
  auth: new SupabaseAuthStub(),
} as ReturnType<typeof createBrowserClient>; // ❌ Unsafe assertion
```

**Suggested Fix:**
```typescript
interface SupabaseClientStub {
  auth: typeof SupabaseAuthStub.prototype;
}

export function createClient(): SupabaseClientStub {
  return {
    auth: new SupabaseAuthStub(),
  };
}
```

---

### 5. Dangerous Type Assertions in Form Validation
- **File:** `src/lib/form-validation.ts`
- **Category:** Type Safety Issues
- **Severity:** 🟠 HIGH
- **Impact:** Runtime errors from type assertion before validation

**Problem:** Values are cast to type with `as T` before validation completes, allowing invalid types through.

**Suggested Fix:** Validate before asserting, or use type guards:
```typescript
function validateAndCast<T>(value: unknown, validator: (v: unknown) => boolean): T {
  if (!validator(value)) {
    throw new Error('Validation failed');
  }
  return value as T;
}
```

---

### 6. Silent Error Swallowing in Idempotency Key Deletion
- **File:** `src/lib/idempotency.ts`
- **Line:** 22
- **Category:** Error Handling Issues
- **Severity:** 🟠 HIGH
- **Impact:** Database errors hidden, makes debugging production issues difficult

**Current Code:**
```typescript
await prisma.idempotencyKey.delete({ where: { key } }).catch(() => {}); // ❌ Silent failure
```

**Suggested Fix:**
```typescript
await prisma.idempotencyKey.delete({ where: { key } }).catch((e) => {
  console.warn('[Idempotency] Failed to delete expired key:', {
    key,
    error: e instanceof Error ? e.message : String(e),
  });
  // In production: send to error tracking service
});
```

---

### 7. Silent Error Swallowing in Profile Fetch
- **File:** `src/app/dashboard/migrate/page.tsx`
- **Line:** ~280
- **Category:** Error Handling Issues
- **Severity:** 🟠 HIGH
- **Impact:** Users won't know if profile fetch failed, feature may silently break

**Current Code:**
```typescript
.catch(() => {}); // ❌ No error handling
```

**Suggested Fix:**
```typescript
.catch((e) => {
  console.error('[Profile Fetch Error]', e);
  setError('Failed to load profile. Please refresh the page.');
});
```

---

### 8. Missing Authentication Check on Support Ticket Endpoint
- **File:** `src/app/api/support/route.ts`
- **Category:** Security Issues
- **Severity:** 🟠 HIGH
- **Impact:** Anyone can spam support tickets; only IP-based rate limiting

**Problem:** Endpoint allows unauthenticated requests with no per-user rate limiting.

**Current Rate Limiting:**
```typescript
const { ok } = await rateLimit(`support:${ip}`, 3, 60_000); // Only per IP
```

**Suggested Fix:**
```typescript
const { ok } = await rateLimit(
  `support:${email || ip}:${ip}`, // Per email + IP combo
  3,
  3600_000 // 3 per hour
);
```

---

### 9. Unsafe JSON.parse Without Error Handling
- **File:** `src/lib/idempotency.ts`
- **Line:** 15
- **Category:** Error Handling Issues
- **Severity:** 🟠 HIGH
- **Impact:** Corrupted cached responses can crash API handlers

**Current Code:**
```typescript
response: JSON.parse(existing.response), // ❌ Can throw
```

**Suggested Fix:**
```typescript
try {
  const parsedResponse = JSON.parse(existing.response);
  return { found: true, response: parsedResponse, status: existing.status };
} catch (e) {
  console.error('[Idempotency] Corrupted cached response:', { key, error: e });
  // Treat as cache miss and re-execute
  return { found: false };
}
```

---

### 10. Missing Environment Variable Validation at Startup
- **File:** `src/app/api/stripe/checkout/route.ts`
- **Lines:** 7-8, 17, 30
- **Category:** Environment Variable Issues
- **Severity:** 🟠 HIGH
- **Impact:** Application crashes at runtime when env vars missing

**Current Code:**
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
}); // ❌ Non-null assertion without validation
```

**Suggested Fix:** Create env validation module:
```typescript
// lib/env.ts
export function validateEnv() {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PRO_PRICE_ID',
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

---

### 11. Unhandled Stripe Error Not Fully Logged
- **File:** `src/app/api/stripe/webhook/route.ts`
- **Lines:** 210-222
- **Category:** Error Handling Issues
- **Severity:** 🟠 HIGH
- **Impact:** Production errors with incomplete information

**Problem:** Database errors in webhook don't include full context.

**Suggested Fix:**
```typescript
catch (dbError) {
  console.error('[Webhook DB Error]', {
    eventId: event.id,
    eventType: event.type,
    error: dbError instanceof Error ? dbError.message : String(dbError),
    stack: dbError instanceof Error ? dbError.stack : undefined,
  });
  
  // Store failed webhook for retry
  await prisma.webhookEvent.create({
    data: {
      eventId: event.id,
      eventType: event.type,
      processed: false,
      error: dbError instanceof Error ? dbError.message : 'Unknown error',
    },
  });
}
```

---

## MEDIUM SEVERITY ISSUES 🟡

### 12. Missing Error Handling for Async Fetch in SessionManager
- **File:** `src/components/SessionManager.tsx`
- **Line:** 34
- **Category:** Error Handling Issues
- **Severity:** 🟡 MEDIUM
- **Impact:** Silent sign-out failures; users think they're logged out but aren't

**Current Code:**
```typescript
await fetch('/api/auth/signout', { method: 'POST' }); // ❌ No error handling
```

**Suggested Fix:**
```typescript
try {
  const response = await fetch('/api/auth/signout', { method: 'POST' });
  if (!response.ok) {
    console.error('[Sign Out] Server returned error:', response.status);
  }
} catch (e) {
  console.error('[Sign Out] Failed:', e);
  // Could optionally show user a toast notification
}
```

---

### 13. Type Assertion Without Validation in Admin Routes
- **File:** `src/app/api/admin/reset-usage/route.ts`
- **Line:** 49
- **Category:** Type Safety Issues
- **Severity:** 🟡 MEDIUM
- **Impact:** Invalid data can be processed as valid

**Current Code:**
```typescript
const { userId } = body as { userId?: string }; // ❌ No validation
```

**Suggested Fix:**
```typescript
const parsed = JSON.parse(body);
if (typeof parsed.userId !== 'string') {
  return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
}
const { userId } = parsed;
```

---

### 14. Fire-and-Forget Promises Without Retry Logic
- **File:** Multiple files
- **Examples:** 
  - `src/app/api/auth/signup/route.ts` (line 96-100) - Welcome email
  - `src/app/api/stripe/webhook/route.ts` (line 124-128) - Trial email
  - `src/app/api/support/route.ts` (~120) - Support confirmation
- **Category:** Error Handling Issues
- **Severity:** 🟡 MEDIUM
- **Impact:** Failed emails not retried; users miss important notifications

**Problem:** Email sending failures are only logged, not queued for retry.

**Suggested Fix:** Implement email queue:
```typescript
// src/lib/email-queue.ts
export async function queueEmail(options: EmailOptions, retries = 3) {
  const result = await sendEmail(options);
  if (!result.success && retries > 0) {
    // Queue for retry after delay
    setTimeout(() => queueEmail(options, retries - 1), 60000); // Retry in 1 min
  }
}
```

---

### 15. Missing Input Validation for Numeric Parameters
- **File:** `src/app/api/admin/stats/route.ts`
- **Lines:** 25-27
- **Category:** Security Issues
- **Severity:** 🟡 MEDIUM
- **Impact:** DoS attack vector; attacker requests huge offset causing slow queries

**Current Code:**
```typescript
const waitlistOffset = Math.max(0, parseInt(url.searchParams.get('waitlistOffset') ?? '0', 10));
// No maximum check!
```

**Suggested Fix:** (See Critical Issue #2 above)

---

### 16. Hardcoded Production Fallback in Email Templates
- **File:** `src/lib/email.ts`
- **Multiple lines** (98, 151, 200, etc.)
- **Category:** Environment Variable Issues
- **Severity:** 🟡 MEDIUM
- **Impact:** Emails link to wrong domain if deployed elsewhere

**Current Code:**
```typescript
href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/dashboard"
```

**Problem:** If deployed to different domain, emails link to morphdb.ai

**Suggested Fix:**
```typescript
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL is required for email templates');
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
```

---

### 17. Incomplete Error Logging in Audit Trails
- **File:** `src/lib/audit.ts`
- **Category:** Error Handling Issues
- **Severity:** 🟡 MEDIUM
- **Impact:** Failed audits don't get logged, losing compliance trail

**Problem:** Audit log creation failures are caught but not retried or escalated.

**Suggested Fix:**
```typescript
const result = await prisma.auditLog.create({...}).catch(e => {
  // Log to stderr for monitoring systems to catch
  console.error('[CRITICAL] Audit log creation failed:', e);
  // In production: send alert to ops team
});
```

---

### 18. Missing Pagination Limit Documentation
- **File:** `src/app/api/admin/stats/route.ts`
- **Category:** Environment Variable Issues
- **Severity:** 🟡 MEDIUM
- **Impact:** Admin can accidentally cause performance issues

**Suggested Fix:** Add constants at top:
```typescript
const ADMIN_CONFIG = {
  MAX_PAGE_SIZE: 100,
  MAX_OFFSET: 10000,
  DEFAULT_PAGE_SIZE: 10,
};
```

---

### 19. Race Condition in Session Timeout
- **File:** `src/components/SessionManager.tsx`
- **Lines:** 64-110
- **Category:** State and Mutation Issues
- **Severity:** 🟡 MEDIUM
- **Impact:** Multiple timers could fire simultaneously, causing logout race condition

**Problem:** `setupTimers` and `resetTimers` called from multiple places, could create duplicate timeouts.

**Suggested Fix:**
```typescript
useEffect(() => {
  if (!session) return;

  // Single cleanup function clears all timers
  const cleanup = () => {
    warningTimerRef.current && clearTimeout(warningTimerRef.current);
    logoutTimerRef.current && clearTimeout(logoutTimerRef.current);
  };

  cleanup(); // Clear existing timers
  setupTimers(); // Set new timers
  return cleanup; // Clean up on unmount
}, [session]);
```

---

## LOW SEVERITY ISSUES 🟢

### 20. Empty Catch Blocks Without Logging
- **File:** `src/components/docs/CodeBlock.tsx`
- **Line:** 23-25
- **Category:** Error Handling Issues
- **Severity:** 🟢 LOW
- **Impact:** Silent failures in non-critical operations

**Current Code:**
```typescript
} catch {
  // ignore
}
```

**Suggested Fix:**
```typescript
} catch (e) {
  console.debug('Clipboard operation failed:', e instanceof Error ? e.message : 'Unknown');
}
```

---

### 21. Console Error Usage for Non-Critical Events
- **File:** Multiple files
- **Examples:**
  - `src/lib/audit.ts` - Audit log errors
  - `src/lib/usage.ts` - Usage tracking errors
  - `src/lib/email.ts` - Email failures
- **Category:** Error Handling Issues
- **Severity:** 🟢 LOW
- **Impact:** Error tracking systems flooded with operational errors

**Problem:** Normal operational failures logged at `console.error` level.

**Suggested Fix:** Use appropriate log levels:
```typescript
console.warn('[Usage Tracking] Failed but continuing:', e); // Non-critical
console.error('[Critical Path] Unexpected error:', e); // Only for critical
```

---

### 22. TODO Comment for Schema Mismatch
- **File:** `src/app/dashboard/page.tsx`
- **Line:** 35-36
- **Category:** Database/Query Issues
- **Severity:** 🟢 LOW
- **Impact:** Known broken feature (already noted in sign-in fix)

**Current Code:**
```typescript
// TODO: Fix migrationBatch query - schema mismatch
Promise.resolve([]),
```

**Status:** Already addressed in earlier commit `e0318f0`.

---

### 23. Inconsistent Error Response Format
- **File:** Multiple API routes
- **Category:** Error Handling Issues
- **Severity:** 🟢 LOW
- **Impact:** API clients need custom error handling for each endpoint

**Problem:** Some endpoints return `{ error: string }`, others may vary.

**Suggested Fix:** Create standard error response:
```typescript
interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Use everywhere:
return NextResponse.json(
  {
    error: 'Description',
    code: 'SPECIFIC_ERROR_CODE',
  },
  { status: 400 }
);
```

---

### 24. Missing Rate Limiting on Download Endpoint
- **File:** `src/app/api/migrate/download/route.ts`
- **Category:** Security Issues
- **Severity:** 🟢 LOW
- **Impact:** Potential abuse of download endpoint

**Suggested Fix:**
```typescript
const { ok } = await rateLimit(`download:${userId}`, 30, 3600_000); // 30 per hour
if (!ok) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

---

### 25. Missing Dependency Array Validation
- **File:** `src/components/SessionManager.tsx`
- **Line:** 64-120
- **Category:** State and Mutation Issues
- **Severity:** 🟢 LOW
- **Impact:** Potential stale closures in callbacks

**Note:** This is generally handled correctly but worth noting for future refactoring to ensure all function dependencies are included.

---

### 26. Potential Memory Leak in Event Listeners
- **File:** `src/components/SessionManager.tsx`
- **Lines:** 30-40
- **Category:** Memory Leak Issues
- **Severity:** 🟢 LOW
- **Impact:** Memory leak if component remounts without proper cleanup

**Current Code:**
```typescript
useEffect(() => {
  // ... setup code ...
  return () => {
    // Cleanup
  };
}, []); // ✓ Correct cleanup
```

**Status:** Actually looks okay, but verify `supabase.auth.onAuthStateChange` subscription is properly unsubscribed.

---

## ISSUE SUMMARY BY CATEGORY

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| **Type Safety** | 0 | 3 | 1 | 0 |
| **Error Handling** | 0 | 4 | 3 | 5 |
| **Database/Query** | 2 | 1 | 1 | 1 |
| **Security** | 0 | 1 | 1 | 1 |
| **Env Variables** | 0 | 1 | 2 | 0 |
| **State/Mutations** | 0 | 0 | 1 | 1 |
| **Memory/Cleanup** | 0 | 0 | 0 | 1 |
| **TOTAL** | **2** | **9** | **7** | **8** |

---

## RECOMMENDED FIX PRIORITY

### Phase 1: Immediate (Today)
1. ✅ **Critical Issue #1** - N+1 query in Stripe webhook
2. ✅ **Critical Issue #2** - Unpaginated queries without limits
3. ✅ **High Issue #9** - JSON.parse error handling

### Phase 2: Urgent (This Week)
4. **High Issue #3-5** - Type safety fixes (all in auth/validation)
5. **High Issue #6-7** - Silent error handling
6. **High Issue #8** - Support endpoint rate limiting
7. **High Issue #10** - Environment variable validation

### Phase 3: Important (Next Week)
8. **Medium Issue #12-19** - All medium severity items

### Phase 4: Nice-to-Have (Future)
9. **Low Issues #20-26** - All low severity items

---

## ACTION ITEMS FOR NEXT SESSION

- [ ] Fix N+1 query in Stripe webhook handler
- [ ] Add hardcoded pagination limits to admin routes
- [ ] Add JSON.parse error handling in idempotency module
- [ ] Fix type safety issues in auth callbacks
- [ ] Add silent error handling for profile fetches
- [ ] Add per-email rate limiting to support endpoint
- [ ] Create environment variable validation at startup
- [ ] Add error handling to session sign-out
- [ ] Standardize API error response format
- [ ] Add retry logic for email sending

---

**Next Steps:** Review this report, prioritize which issues to fix, and continue in next session.
