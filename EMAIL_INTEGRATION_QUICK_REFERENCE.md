# MorphDB Email Integration - Quick Reference Guide

## Email Trigger Flow Map

```
USER FLOW                          API ENDPOINT                EMAIL TRIGGER
═════════════════════════════════════════════════════════════════════════════

Signup                             /api/auth/signup           → Welcome Email
                                   ↓
Browse Features                    
                                   ↓
Join Free Trial                    /api/trial                 → Trial Activation
                                   ↓ (after 2 days)           
(1 day before expiry)             [Scheduler Job]            → Trial Warning Email
                                   ↓ (after 3 days)
                                   [Scheduler Job]            → Trial Expired Email
                                   ↓
Upgrade to Plan                    /api/stripe/checkout       → Checkout Created
                                   ↓
Complete Payment                   /api/stripe/webhook        → Subscription Activated
                                   (checkout.session.completed)  (Welcome to Pro!)
                                   ↓
Change Plan / Cancel               /api/stripe/webhook        → Subscription Updated
                                   (customer.subscription.*)   or Canceled Email
                                   ↓
Submit Support Ticket              /api/support               → Ticket Confirmation (user)
                                   ↓                          → New Ticket Alert (admin)
Admin Updates Ticket               /api/admin/support [PATCH] → Status Update Email
                                   ↓
Perform Batch Migration            /api/migrate/batch         → Completion Email
```

---

## Priority 1 Emails (Critical) - Revenue & Retention

### 1. Welcome Email
**File**: `src/lib/email/templates/welcome.tsx`
**Trigger**: `/api/auth/signup` (success)
**Data**:
```typescript
{
  userName: string
  userEmail: string
  siteUrl: string
  firstBatchUrl: string
}
```

### 2. Trial Activation Email
**File**: `src/lib/email/templates/trial-start.tsx`
**Trigger**: `/api/trial` (success)
**Data**:
```typescript
{
  userName: string
  userEmail: string
  trialEndsAt: Date
  daysRemaining: number
  upgradeUrl: string
}
```

### 3. Trial Warning Email (1 day before)
**File**: `src/lib/email/templates/trial-warning.tsx`
**Trigger**: Scheduler job (24 hours before trialEndsAt)
**Data**:
```typescript
{
  userName: string
  userEmail: string
  hoursRemaining: number
  upgradeUrl: string
  pricingUrl: string
}
```

### 4. Trial Expired Email
**File**: `src/lib/email/templates/trial-expired.tsx`
**Trigger**: Scheduler job (after trialEndsAt)
**Data**:
```typescript
{
  userName: string
  userEmail: string
  revertedTier: "free"
  upgradeUrl: string
  specialOfferCode?: string
}
```

### 5. Subscription Activated Email
**File**: `src/lib/email/templates/subscription-activated.tsx`
**Trigger**: `/api/stripe/webhook` (checkout.session.completed)
**Data**:
```typescript
{
  userName: string
  userEmail: string
  planName: string // "Pro" | "Design Partner" | "Enterprise"
  features: string[]
  nextBillingDate: Date
  invoiceUrl: string
  dashboardUrl: string
}
```

### 6. Subscription Updated Email
**File**: `src/lib/email/templates/subscription-updated.tsx`
**Trigger**: `/api/stripe/webhook` (customer.subscription.updated)
**Data**:
```typescript
{
  userName: string
  userEmail: string
  oldPlan: string
  newPlan: string
  newFeatures: string[]
  effectiveDate: Date
}
```

### 7. Subscription Canceled Email
**File**: `src/lib/email/templates/subscription-canceled.tsx`
**Trigger**: `/api/stripe/webhook` (customer.subscription.deleted)
**Data**:
```typescript
{
  userName: string
  userEmail: string
  cancelDate: Date
  refundAmount?: number
  winBackOfferUrl?: string
  feedbackUrl: string
}
```

---

## Priority 2 Emails (Important) - User Experience

### 8. Support Ticket Confirmation
**File**: `src/lib/email/templates/support-confirmation.tsx`
**Trigger**: `/api/support` (success)
**Recipients**: User who submitted ticket
**Data**:
```typescript
{
  ticketId: string
  ticketSubject: string
  userEmail: string
  expectedResponseTime: string // "24 hours"
  trackingUrl: string
}
```

### 9. Admin Alert - New Support Ticket
**File**: `src/lib/email/templates/admin-alert.tsx`
**Trigger**: `/api/support` (success)
**Recipients**: ADMIN_EMAILS env var
**Data**:
```typescript
{
  ticketId: string
  ticketSubject: string
  userEmail: string
  userName: string
  priority: string
  adminDashboardUrl: string
}
```

### 10. Support Ticket Status Update
**File**: `src/lib/email/templates/support-update.tsx`
**Trigger**: `/api/admin/support` (PATCH, status change)
**Recipients**: User who submitted ticket
**Data**:
```typescript
{
  ticketId: string
  ticketSubject: string
  oldStatus: string
  newStatus: string
  updateMessage: string
  trackingUrl: string
}
```

### 11. Batch Completion Email
**File**: `src/lib/email/templates/batch-completion.tsx`
**Trigger**: `/api/migrate/batch` (completion)
**Data**:
```typescript
{
  userName: string
  userEmail: string
  batchId: string
  totalStatements: number
  successCount: number
  failedCount: number
  downloadUrl: string
  duration: string
}
```

---

## Priority 3 Emails (Nice to Have) - Engagement

### 12. Plan Access Granted
**File**: `src/lib/email/templates/plan-granted.tsx`
**Trigger**: `/api/admin/grant-pro` (success)
**Data**:
```typescript
{
  userName: string
  userEmail: string
  grantedPlan: string
  newFeatures: string[]
  onboardingUrl: string
}
```

### 13. Waitlist Confirmation
**File**: `src/lib/email/templates/waitlist-confirmation.tsx`
**Trigger**: `/api/waitlist` (success)
**Data**:
```typescript
{
  userEmail: string
  waitlistPosition?: number
  updateFrequency: string // "weekly"
  checkStatusUrl: string
}
```

---

## Environment Variables Required

Add to `.env.local`:

```bash
# Email Service Provider
EMAIL_PROVIDER_API_KEY=your_api_key_here
EMAIL_FROM_ADDRESS=noreply@morphdb.com
EMAIL_FROM_NAME=MorphDB

# Admin Notifications
ADMIN_EMAIL=admin@morphdb.com

# URLs for Email Links
NEXT_PUBLIC_SITE_URL=https://morphdb.vercel.app
NEXT_PUBLIC_DASHBOARD_URL=https://morphdb.vercel.app/dashboard
NEXT_PUBLIC_SUPPORT_URL=https://morphdb.vercel.app/support

# Optional: Email Template Directory
EMAIL_TEMPLATE_DIR=src/lib/email/templates
```

---

## Code Integration Points

### 1. Signup Endpoint
**File**: `src/app/api/auth/signup/route.ts`

```typescript
// Add after profile creation
if (data.user) {
  await sendEmail({
    to: data.user.email!,
    template: 'welcome',
    data: {
      userName: name || data.user.email!.split('@')[0],
      userEmail: data.user.email!,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    }
  }).catch(e => console.error('[Email Error]', e));
}
```

### 2. Trial Activation Endpoint
**File**: `src/app/api/trial/route.ts`

```typescript
// Add after subscription creation
const trialEndDate = new Date();
trialEndDate.setDate(trialEndDate.getDate() + 3);

await sendEmail({
  to: user.email!,
  template: 'trial-start',
  data: {
    userName: profile?.name || user.email!.split('@')[0],
    userEmail: user.email!,
    trialEndsAt: trialEndDate,
    daysRemaining: 3,
    upgradeUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
  }
}).catch(e => console.error('[Email Error]', e));
```

### 3. Stripe Webhook - Subscription Activated
**File**: `src/app/api/stripe/webhook/route.ts`

```typescript
case 'checkout.session.completed': {
  const session = event.data.object as Stripe.Checkout.Session;
  // ... existing code ...
  
  // Add email send
  const userProfile = await prisma.profile.findUnique({
    where: { id: userId }
  });
  
  await sendEmail({
    to: userProfile?.email || session.customer_email!,
    template: 'subscription-activated',
    data: {
      userName: userProfile?.name || 'User',
      userEmail: userProfile?.email || session.customer_email!,
      planName: plan === 'pro' ? 'Pro' : 'Design Partner',
      nextBillingDate: new Date(periodEnd * 1000),
    }
  }).catch(e => console.error('[Email Error]', e));
}
```

### 4. Support Ticket Creation
**File**: `src/app/api/support/route.ts`

```typescript
// Add after ticket creation
await sendEmail({
  to: email,
  template: 'support-confirmation',
  data: {
    ticketId: ticket.id,
    ticketSubject: subject,
    userEmail: email,
    expectedResponseTime: '24 hours',
    trackingUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/support/ticket/${ticket.id}`,
  }
}).catch(e => console.error('[Email Error]', e));

// Admin alert
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
for (const adminEmail of adminEmails) {
  await sendEmail({
    to: adminEmail.trim(),
    template: 'admin-alert',
    data: {
      ticketId: ticket.id,
      ticketSubject: subject,
      userEmail: email,
      adminDashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/admin/support`,
    }
  }).catch(e => console.error('[Admin Email Error]', e));
}
```

---

## Email Service Client Implementation

**File**: `src/lib/email/client.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.EMAIL_PROVIDER_API_KEY!);

export async function sendEmail({
  to,
  template,
  data,
}: {
  to: string;
  template: string;
  data: Record<string, any>;
}) {
  try {
    // Import template dynamically
    const TemplateComponent = (await import(
      `./templates/${template}`
    )).default;

    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject: getEmailSubject(template, data),
      react: <TemplateComponent {...data} />,
    });

    // Log email send
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      action: 'email_sent',
      template,
      recipient: to,
      status: 'success',
      messageId: result.id,
    }));

    return result;
  } catch (error) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      action: 'email_failed',
      template,
      recipient: to,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
    throw error;
  }
}

function getEmailSubject(template: string, data: Record<string, any>): string {
  const subjects: Record<string, string> = {
    'welcome': 'Welcome to MorphDB - Your AI SQL Migration Co-Pilot',
    'trial-start': `Your ${data.daysRemaining}-Day Pro Trial Starts Now!`,
    'trial-warning': 'Your MorphDB Trial Expires in 24 Hours',
    'trial-expired': 'Your Trial Has Ended - Upgrade to Pro',
    'subscription-activated': `Welcome to ${data.planName}!`,
    'subscription-updated': `Your Plan Has Been Updated`,
    'subscription-canceled': 'We're Sorry to See You Go',
    'support-confirmation': `Support Ticket #${data.ticketId} Created`,
    'support-update': `Update: Support Ticket #${data.ticketId}`,
    'batch-completion': 'Your Migration Batch is Ready',
    'plan-granted': `You've Been Granted ${data.grantedPlan} Access!`,
    'waitlist-confirmation': 'You're on the MorphDB Waitlist',
    'admin-alert': `New Support Ticket: ${data.ticketSubject}`,
  };
  
  return subjects[template] || 'MorphDB';
}
```

---

## Background Jobs for Trial Expiration

**File**: `src/lib/jobs/trial-expiration.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/client';

export async function sendTrialExpirationWarnings() {
  try {
    // Find trials expiring in 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const expiringTrials = await prisma.subscription.findMany({
      where: {
        status: 'trialing',
        trialEndsAt: {
          gte: now,
          lte: tomorrow,
        },
      },
    });

    for (const trial of expiringTrials) {
      const profile = await prisma.profile.findUnique({
        where: { id: trial.userId },
      });

      if (profile?.email) {
        await sendEmail({
          to: profile.email,
          template: 'trial-warning',
          data: {
            userName: profile.name || profile.email.split('@')[0],
            userEmail: profile.email,
            hoursRemaining: 24,
            upgradeUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
          },
        }).catch(e => console.error('[Trial Warning Email Error]', e));
      }
    }

    console.log(`Sent ${expiringTrials.length} trial warning emails`);
  } catch (error) {
    console.error('[Trial Expiration Warning Job Error]', error);
  }
}

export async function completeExpiredTrials() {
  try {
    // Find expired trials
    const now = new Date();

    const expiredTrials = await prisma.subscription.findMany({
      where: {
        status: 'trialing',
        trialEndsAt: {
          lt: now,
        },
      },
    });

    for (const trial of expiredTrials) {
      const profile = await prisma.profile.findUnique({
        where: { id: trial.userId },
      });

      // Revert to free tier
      await prisma.subscription.update({
        where: { id: trial.id },
        data: {
          status: 'inactive',
          plan: 'free',
        },
      });

      if (profile?.email) {
        await sendEmail({
          to: profile.email,
          template: 'trial-expired',
          data: {
            userName: profile.name || profile.email.split('@')[0],
            userEmail: profile.email,
            upgradeUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`,
          },
        }).catch(e => console.error('[Trial Expired Email Error]', e));
      }
    }

    console.log(`Completed ${expiredTrials.length} expired trials`);
  } catch (error) {
    console.error('[Expired Trial Completion Job Error]', error);
  }
}
```

---

## Cron Job Setup (Using Vercel Cron)

**File**: `src/app/api/cron/trial-expiration/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  sendTrialExpirationWarnings,
  completeExpiredTrials,
} from '@/lib/jobs/trial-expiration';

export async function GET(req: NextRequest) {
  // Verify Vercel's cron signature
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sendTrialExpirationWarnings();
    await completeExpiredTrials();

    return NextResponse.json({
      success: true,
      message: 'Trial expiration jobs completed',
    });
  } catch (error) {
    console.error('[Cron Job Error]', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
```

**Add to `vercel.json`** (if exists, or create):

```json
{
  "crons": [
    {
      "path": "/api/cron/trial-expiration",
      "schedule": "0 10 * * *"
    }
  ]
}
```

---

## Testing Email Integration

**File**: `src/app/api/emails/test/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/client';

export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Test endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const { email, template } = await req.json();

    const result = await sendEmail({
      to: email,
      template,
      data: {
        userName: 'Test User',
        userEmail: email,
        trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        daysRemaining: 1,
        upgradeUrl: 'https://morphdb.com',
      },
    });

    return NextResponse.json({
      success: true,
      messageId: result.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

---

## Implementation Checklist

### Setup Phase
- [ ] Choose email provider (Resend recommended)
- [ ] Create account and get API key
- [ ] Add env variables
- [ ] Install email library (`npm install resend` for Resend)

### Development Phase
- [ ] Create email client (`src/lib/email/client.ts`)
- [ ] Create all email templates in `src/lib/email/templates/`
- [ ] Test email sending locally
- [ ] Create background jobs for trials
- [ ] Set up cron job configuration

### Integration Phase
- [ ] Add email send to signup endpoint
- [ ] Add email send to trial endpoint
- [ ] Add email send to Stripe webhook
- [ ] Add email send to support endpoint
- [ ] Add admin alerts for support tickets

### Testing Phase
- [ ] Test each email template
- [ ] Verify email deliverability
- [ ] Monitor email logs
- [ ] Test with real subscriber flows
- [ ] Check email rendering in different clients

### Deployment Phase
- [ ] Set env variables in production
- [ ] Deploy cron job configuration
- [ ] Monitor email delivery in production
- [ ] Set up email dashboard alerts
- [ ] Document email troubleshooting

---

## Monitoring & Observability

Add to logging:

```typescript
// After successful email send
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  action: 'email_sent',
  template: 'welcome',
  recipient: user.email,
  status: 'success',
  messageId: result.id,
  durationMs: Date.now() - startTime,
}));

// On email failure
console.error(JSON.stringify({
  timestamp: new Date().toISOString(),
  action: 'email_failed',
  template: 'welcome',
  recipient: user.email,
  error: error.message,
  errorCode: error.code,
  durationMs: Date.now() - startTime,
}));
```

---

## Related Documentation

- Full analysis: See `EMAIL_INFRASTRUCTURE.md`
- API endpoints: See `ARCHITECTURE.md`
- Database schema: See `prisma/schema.prisma`
- Environment setup: See `.env.example`

