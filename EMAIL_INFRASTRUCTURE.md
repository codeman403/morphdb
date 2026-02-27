# MorphDB Email Infrastructure Analysis

**Date**: February 27, 2026
**Analysis Scope**: Email notification capabilities and infrastructure for MorphDB SaaS platform

---

## Executive Summary

**Current Status**: MorphDB has **NO email infrastructure** currently implemented. There are no email service integrations, no email templates, no notification systems, and no environment variables related to email services.

**What Needs to be Added**:
- Email service provider integration (Resend, SendGrid, or similar)
- Email templates for key user journeys
- Email notification triggers in critical API endpoints
- Environment variable configuration
- Database schema updates (optional: for email preferences)

---

## Current Infrastructure Overview

### Database Schema

The Prisma schema includes user and subscription models with email fields:

```
Profile Model:
- email (String, unique)
- name (String, optional)
- company (String, optional)

Subscription Model:
- userId (String, unique)
- plan (String): "free" | "pro" | "design_partner" | "enterprise"
- status (String): "active" | "inactive" | "trialing" | "canceled"
- trialTakenAt (DateTime, optional)
- trialEndsAt (DateTime, optional)
- currentPeriodEnd (DateTime, optional)
- stripeSubscriptionId (String, optional)

SupportTicket Model:
- name (String)
- email (String)
- subject (String)
- description (String)
- status (String): "open" | "in_progress" | "resolved" | "closed"
- priority (String): "low" | "medium" | "high"
- userId (String, optional)

WaitlistEntry Model:
- email (String, unique)
- name (String, optional)
- company (String, optional)
```

**Key Observation**: All models that need email notifications already have email fields. No schema changes required.

---

## Identified Email Notification Triggers

Based on API endpoint analysis, the following endpoints are critical for email notifications:

### 1. Authentication & User Management

**Endpoint**: `POST /api/auth/signup`
**Current Behavior**: Creates Profile, logs login attempt
**Email Notifications Needed**:
- Welcome email with app overview
- Email verification confirmation (if needed)
- Setup instructions / onboarding guide

**Endpoint**: `POST /api/auth/signin`
**Current Behavior**: Logs login activity
**Email Notifications Needed**:
- Optional: Suspicious login alerts (new device/location)
- Optional: Monthly activity summary

### 2. Trial & Subscription Management

**Endpoint**: `POST /api/trial`
**Current Behavior**: Activates 3-day free Pro trial, sets `trialTakenAt` and `trialEndsAt`
**Email Notifications Needed**:
- Trial activation confirmation
- Trial expiration warning (day before expiry)
- Trial expiration notification (after expiry, revert to free)

**Endpoint**: `POST /api/stripe/checkout`
**Current Behavior**: Creates Stripe checkout session
**Email Notifications Needed**:
- Checkout link confirmation
- Optional: Abandoned checkout reminder (after 24 hours)

**Endpoint**: `POST /api/stripe/webhook` - `checkout.session.completed`
**Current Behavior**: Activates paid subscription
**Email Notifications Needed**:
- Welcome to [Plan Name] email
- Subscription details & next billing date
- Billing receipt

**Endpoint**: `POST /api/stripe/webhook` - `customer.subscription.updated`
**Current Behavior**: Updates subscription status
**Email Notifications Needed**:
- Subscription change notification
- Plan upgrade/downgrade confirmation
- New plan features overview

**Endpoint**: `POST /api/stripe/webhook` - `customer.subscription.deleted`
**Current Behavior**: Marks subscription as canceled
**Email Notifications Needed**:
- Cancellation confirmation
- Churn survey / win-back offer
- Refund confirmation (if applicable)

### 3. Migration & Translation

**Endpoint**: `POST /api/migrate/batch`
**Current Behavior**: Processes batch migration, stores results
**Email Notifications Needed**:
- Batch processing completion notification
- Failed translations alert
- Summary with success/failure counts and download link

**Endpoint**: `POST /api/migrate/batch/[batchId]/cancel`
**Current Behavior**: Cancels in-progress batch
**Email Notifications Needed**:
- Batch cancellation confirmation

### 4. Support & Admin

**Endpoint**: `POST /api/support`
**Current Behavior**: Creates support ticket in database
**Email Notifications Needed**:
- Ticket creation confirmation (to user)
- New support ticket alert (to admin)
- Support SLA/response time expectations

**Endpoint**: `PATCH /api/admin/support`
**Current Behavior**: Updates ticket status
**Email Notifications Needed**:
- Ticket status change notification (to user)
- Resolution confirmation

**Endpoint**: `POST /api/admin/grant-pro`
**Current Behavior**: Grants plan access to user
**Email Notifications Needed**:
- Plan access granted notification
- New plan features guide
- Getting started instructions

### 5. Waitlist Management

**Endpoint**: `POST /api/waitlist`
**Current Behavior**: Creates waitlist entry
**Email Notifications Needed**:
- Waitlist confirmation
- Periodic updates about product progress
- Early access invitation (when ready)

---

## Current Environment Variables

**Email-Related**: NONE

**Existing Environment Variables Used**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_DESIGN_PARTNER_PRICE_ID`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAILS` (comma-separated list of admin email addresses)

**Email Environment Variables to Add**:
- `EMAIL_PROVIDER_API_KEY` (Resend, SendGrid, etc.)
- `EMAIL_FROM_ADDRESS` (e.g., "noreply@morphdb.com")
- `EMAIL_FROM_NAME` (e.g., "MorphDB")
- `ADMIN_EMAIL` (primary admin email for alerts)
- Optional: `EMAIL_TEMPLATE_DIR` (if using file-based templates)

---

## API Endpoint Structure Analysis

### Authentication Routes
```
/api/auth/
  ├── signup/route.ts       (Create user, login log)
  ├── signin/route.ts       (Login, login log)
  ├── signout/route.ts      (Logout)
  ├── profile/route.ts      (Get user tier info)
  ├── callback/route.ts     (OAuth callback)
  └── has-used-trial/route.ts (Check trial usage)
```

### Subscription Routes
```
/api/
  ├── trial/route.ts        (Start 3-day trial)
  └── stripe/
      ├── checkout/route.ts (Create checkout session)
      └── webhook/route.ts  (Handle Stripe events)
```

### Migration Routes
```
/api/migrate/
  ├── route.ts              (Single translation)
  ├── batch/route.ts        (Batch processing)
  ├── batch/[batchId]/cancel/route.ts
  ├── download/route.ts     (Download results)
  └── history/[batchId]/route.ts
```

### Admin Routes
```
/api/admin/
  ├── stats/route.ts        (System stats)
  ├── support/route.ts      (Support tickets CRUD)
  ├── grant-pro/route.ts    (Grant plan access)
  └── reset-usage/route.ts  (Reset monthly usage)
```

### Support & Marketing
```
/api/
  ├── support/route.ts      (Create support ticket)
  └── waitlist/route.ts     (Join waitlist)
```

---

## Key Architectural Patterns

### 1. Rate Limiting
All API endpoints use rate limiting:
```typescript
const { ok } = await rateLimit(`key:${ip}`, maxAttempts, windowMs);
```

**Pattern to Follow**: Email service calls should also be rate-limited to prevent accidental spam or API abuse.

### 2. Authentication Pattern
All protected endpoints check Supabase session:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

**Pattern to Follow**: Use the same session context to determine user email for notification sending.

### 3. Admin Authorization
Admin endpoints verify against env variable list:
```typescript
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);
```

**Pattern to Follow**: Similar pattern for email provider authorization.

### 4. Logging Pattern
Structured JSON logging is used throughout:
```typescript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  requestId,
  level: 'info',
  action: 'event_name',
  ...context
}));
```

**Pattern to Follow**: Log email send attempts and failures similarly.

### 5. Error Handling
Graceful error handling with console logging:
```typescript
try {
  // operation
} catch (e) {
  console.error('[Context Error]', e);
  return NextResponse.json({ error: 'message' }, { status: 500 });
}
```

**Pattern to Follow**: Email failures should not break core operations.

---

## Tier-Based Feature Access

Current Tier Structure (from `/lib/tier.ts`):

```
Free Tier:
- 5 batches/month
- 10 files/batch
- 50 translations/month
- GPT-4o-mini only
- Features: community_discord

Pro Tier:
- 50 batches/month
- 50 files/batch
- 500 translations/month
- All models available
- Features: file_upload, zip_download, priority_email, all_models

Design Partner:
- Unlimited batches/month
- Unlimited files/batch
- Unlimited translations/month
- All models available
- Features: file_upload, zip_download, all_models, dbt_generation, dedicated_slack, logic_guarantee

Enterprise:
- Unlimited batches/month
- Unlimited files/batch
- Unlimited translations/month
- All models available
- Features: file_upload, zip_download, all_models, dbt_generation, vpc, soc2, sla
```

**Note**: "priority_email" is mentioned as a Pro tier feature, suggesting email support was planned but not implemented.

---

## Recommended Email Triggers by Priority

### Priority 1 (Critical - Revenue/Retention Impacting)

1. **Welcome Email** (on signup)
   - Trigger: `/api/auth/signup` success
   - User: New user
   - Content: Product overview, getting started guide, first steps

2. **Trial Activation Confirmation** (on trial start)
   - Trigger: `/api/trial` success
   - User: Trial user
   - Content: Trial features, duration, expiration date, how to upgrade

3. **Trial Expiration Warning** (1 day before expiry)
   - Trigger: Scheduled job/cron (24 hours before trialEndsAt)
   - User: Active trial users
   - Content: Upgrade options, pricing, special offer

4. **Trial Expired Notification** (after expiry)
   - Trigger: Scheduled job/cron (after trialEndsAt)
   - User: Expired trial users
   - Content: Revert to free tier, upgrade path, incentive

5. **Subscription Activated** (checkout.session.completed)
   - Trigger: `/api/stripe/webhook` 
   - User: New paid subscriber
   - Content: Welcome to [Plan], features overview, next billing date, receipt

6. **Subscription Changed** (customer.subscription.updated)
   - Trigger: `/api/stripe/webhook`
   - User: Subscriber
   - Content: Plan change confirmation, new features/limits, effective date

7. **Subscription Canceled** (customer.subscription.deleted)
   - Trigger: `/api/stripe/webhook`
   - User: Canceled subscriber
   - Content: Cancellation confirmed, reversion to free tier, win-back offer

### Priority 2 (Important - User Experience)

8. **Support Ticket Confirmation** (on ticket creation)
   - Trigger: `/api/support` success
   - User: Support requester
   - Content: Ticket ID, expected response time, tracking link

9. **Support Ticket Status Update** (on ticket status change)
   - Trigger: `/api/admin/support` PATCH success
   - User: Support requester
   - Content: New status, update message, resolution details

10. **Batch Completion Notification** (after batch processing)
    - Trigger: `/api/migrate/batch` completion
    - User: Batch creator
    - Content: Success/failure counts, download link, summary stats

11. **Admin Alert: New Support Ticket** (on ticket creation)
    - Trigger: `/api/support` success
    - User: Admin email list
    - Content: Ticket details, user info, priority

### Priority 3 (Nice to Have - Engagement)

12. **Plan Granted Notification** (after admin grant)
    - Trigger: `/api/admin/grant-pro` success
    - User: Granted user
    - Content: New plan benefits, features unlocked, getting started

13. **Waitlist Confirmation** (on waitlist join)
    - Trigger: `/api/waitlist` success
    - User: Waitlist entrant
    - Content: Position on waitlist (if available), updates cadence, invite signal

14. **Suspicious Login Alert** (on new device/location)
    - Trigger: Optional - `/api/auth/signin` 
    - User: Logging in user
    - Content: Login location, device, confirmation needed action

---

## Database Models Ready for Email

All required models already exist with email fields:

```typescript
// Profile has email for user communications
Profile {
  email: String @unique
}

// Subscription has user reference for plan change emails
Subscription {
  userId: String @unique
  plan: String
  status: String
  trialEndsAt: DateTime?
  currentPeriodEnd: DateTime?
}

// SupportTicket has email for ticket status updates
SupportTicket {
  email: String
  userId: String?
  status: String
}

// WaitlistEntry has email for waitlist updates
WaitlistEntry {
  email: String @unique
}
```

**Optional Enhancement**: Add email preferences table
```typescript
model EmailPreference {
  id String @id @default(cuid())
  userId String @unique
  marketing Boolean @default(true)
  transactional Boolean @default(true)
  weekly_digest Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Existing Infrastructure That Supports Email

### 1. Structured Logging
The codebase uses structured JSON logging that can be leveraged to track email sends:

```typescript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  requestId,
  level: 'info',
  action: 'email_sent',
  emailType: 'welcome',
  recipient: user.email,
  status: 'success'
}));
```

### 2. Audit Trail System
The `/lib/audit.ts` module provides comprehensive audit logging:
- `createAuditLog()` - Can be used to log important email-related actions
- `logAuditEvent()` - Can track email delivery failures for admin review

### 3. Error Handling
Graceful error handling patterns mean email failures won't crash operations:
```typescript
try {
  await sendEmail(...)
} catch (e) {
  console.error('[Email Send Error]', e);
  // Don't throw - continue with main operation
}
```

### 4. Rate Limiting
The `/lib/rate-limit.ts` utility can throttle email sends:
```typescript
const { ok } = await rateLimit(`email:${userId}`, 10, 3600000);
```

### 5. Prisma ORM
Prisma provides easy access to user email data:
```typescript
const user = await prisma.profile.findUnique({ where: { id: userId } });
// user.email available for sending
```

---

## Recommended Email Service Provider Comparison

### Option 1: Resend (Recommended for MorphDB)
- **Pros**: 
  - React Email templates (matches Next.js stack)
  - Excellent TypeScript support
  - Simple, modern API
  - Free tier: 100/day
  - Developer-friendly
  
- **Cons**:
  - Smaller ecosystem
  - Less email verification tools

- **Integration Effort**: LOW (1-2 hours)
- **Cost**: $0-20/month at MorphDB scale

### Option 2: SendGrid
- **Pros**:
  - Industry standard
  - Advanced email analytics
  - Robust template system
  - Excellent deliverability
  - Enterprise features

- **Cons**:
  - Heavier API
  - More learning curve
  - Higher cost at scale

- **Integration Effort**: MEDIUM (3-4 hours)
- **Cost**: $0-100/month depending on volume

### Option 3: Postmark
- **Pros**:
  - Excellent transactional emails
  - Simple API
  - Great documentation
  - Good deliverability
  - Cost-effective

- **Cons**:
  - Less UI customization
  - Smaller template marketplace

- **Integration Effort**: LOW (1-2 hours)
- **Cost**: $0-100/month

**Recommendation**: **Resend** for alignment with Next.js/React stack and ease of integration.

---

## Implementation Checklist

### Phase 1: Setup (2-3 hours)
- [ ] Choose email service provider
- [ ] Set up account and API credentials
- [ ] Add environment variables
- [ ] Create email service utility module

### Phase 2: Templates (4-6 hours)
- [ ] Welcome email template
- [ ] Trial activation template
- [ ] Trial expiration warning template
- [ ] Trial expired template
- [ ] Subscription activated template
- [ ] Subscription updated template
- [ ] Subscription canceled template

### Phase 3: Integration (6-8 hours)
- [ ] Add email send to `/api/auth/signup`
- [ ] Add email send to `/api/trial`
- [ ] Add email send to `/api/stripe/webhook`
- [ ] Add email send to `/api/support`
- [ ] Add email send to `/api/admin/support` (PATCH)

### Phase 4: Background Jobs (4-6 hours)
- [ ] Implement trial expiration warning job
- [ ] Implement trial expiration notification job
- [ ] Set up cron or scheduled task runner

### Phase 5: Testing & Monitoring (3-4 hours)
- [ ] Test all email triggers in development
- [ ] Add email send logging
- [ ] Monitor delivery rates
- [ ] Set up error alerts

**Total Estimated Effort**: 20-30 hours

---

## File Structure for Implementation

Recommended new files to create:

```
src/lib/email/
├── client.ts           # Email service client initialization
├── templates/
│   ├── welcome.tsx     # React Email templates
│   ├── trial-start.tsx
│   ├── trial-warning.tsx
│   ├── trial-expired.tsx
│   ├── subscription-activated.tsx
│   ├── subscription-updated.tsx
│   ├── subscription-canceled.tsx
│   ├── support-confirmation.tsx
│   ├── support-update.tsx
│   └── admin-alert.tsx
└── send.ts             # Main send utility function

src/lib/jobs/
├── trial-expiration.ts # Background job for trial warnings
└── scheduler.ts        # Cron job setup

src/app/api/emails/
└── test/route.ts      # Optional: Email preview/test endpoint
```

---

## Security Considerations

1. **PII Protection**:
   - Email addresses are PII - ensure GDPR/CCPA compliance
   - Store email preferences for opt-out compliance
   - Use audit logging for all email sends

2. **Rate Limiting**:
   - Implement per-user email rate limits
   - Prevent accidental bulk sends
   - Monitor for email sending spikes

3. **Authentication**:
   - Verify user authentication before sending personalized emails
   - Use secure tokens for email verification links
   - Implement email validation on signup

4. **Data Sensitivity**:
   - Never include sensitive data in email bodies
   - Use secure links for account-specific information
   - Log but don't expose API keys in email templates

---

## Next Steps

1. **Immediate**: Secure buy-in on email service provider choice
2. **Week 1**: Set up email service account and integrate API key
3. **Week 1-2**: Create email templates based on Priority 1 triggers
4. **Week 2-3**: Integrate email sends into API endpoints
5. **Week 3-4**: Implement background jobs for scheduled emails
6. **Week 4**: Testing, monitoring, and production deployment

---

## Key Findings Summary

| Category | Finding | Status |
|----------|---------|--------|
| Email Service Integration | None implemented | NOT STARTED |
| Database Schema | All required fields present | READY |
| API Endpoints | 10+ endpoints identified for email | READY |
| Environment Variables | None configured for email | NOT STARTED |
| Templates | None created | NOT STARTED |
| Scheduled Jobs | No background job system | NOT STARTED |
| Rate Limiting | Infrastructure available | READY TO USE |
| Error Handling | Patterns established | READY TO USE |
| Logging | Structured logging in place | READY TO USE |

---

**Prepared by**: AI Code Analysis Agent
**Repository**: MorphDB Hackathon Project
**Status**: Ready for Implementation
