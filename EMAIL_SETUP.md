# Email Feature Setup Guide

## Quick Start

### 1. Get a Resend API Key

1. Visit https://resend.com (free tier available)
2. Sign up for an account
3. Go to API Keys section
4. Generate a new API key
5. Copy the key

### 2. Add Environment Variables

Add these to your `.env.local` file:

```env
# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email Configuration
NEXT_PUBLIC_FROM_EMAIL=noreply@morphdb.ai
NEXT_PUBLIC_SUPPORT_EMAIL=support@morphdb.ai

# Optional: Send emails during development (default: false)
SEND_EMAILS_IN_DEV=false
```

### 3. Verify Your Domain (For Production)

1. In Resend dashboard, add your custom domain
2. Follow DNS verification steps
3. Use your verified domain in `NEXT_PUBLIC_FROM_EMAIL`

---

## Available Email Endpoints

### Welcome Email
**POST** `/api/emails/welcome`

```json
{
  "email": "user@example.com",
  "firstName": "John"
}
```

### Trial Started
**POST** `/api/emails/trial-started`

```json
{
  "email": "user@example.com",
  "firstName": "John"
}
```

### Trial Expiring Warning
**POST** `/api/emails/trial-expiring`

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "hoursRemaining": 24
}
```

### Subscription Activated
**POST** `/api/emails/subscription-activated`

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "planName": "Pro"
}
```

### Support Ticket Confirmation
**POST** `/api/emails/support-ticket`

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "ticketId": "TKT-12345",
  "subject": "Login issue",
  "adminEmail": "admin@morphdb.ai"
}
```

### Batch Migration Completion
**POST** `/api/emails/batch-completion`

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "batchId": "batch-xyz",
  "successCount": 45,
  "failureCount": 5
}
```

---

## Integration Examples

### Send Welcome Email After User Signs Up

In `/src/app/api/auth/signup/route.ts`:

```typescript
import { sendEmail, getWelcomeEmailHTML } from '@/lib/email';

// After user creation
const result = await sendEmail({
  to: email,
  subject: 'Welcome to MorphDB - Your AI Database Migration Co-Pilot',
  html: getWelcomeEmailHTML(firstName),
});

if (!result.success) {
  console.error('Failed to send welcome email:', result.error);
}
```

### Send Trial Started Email

In `/src/app/api/trial/route.ts`:

```typescript
import { sendEmail, getTrialStartedEmailHTML } from '@/lib/email';

// After trial is activated
const result = await sendEmail({
  to: user.email,
  subject: 'Your Free 3-Day Trial is Active - MorphDB',
  html: getTrialStartedEmailHTML(user.firstName),
});
```

### Send Support Ticket Email

In `/src/app/api/support/route.ts`:

```typescript
import { sendEmail, getSupportTicketEmailHTML } from '@/lib/email';

// After support ticket is created
const result = await sendEmail({
  to: email,
  subject: `Support Ticket Received - MorphDB #${ticketId}`,
  html: getSupportTicketEmailHTML(firstName, ticketId, subject),
});
```

### Send Subscription Confirmation

In Stripe webhook handler:

```typescript
import { sendEmail, getSubscriptionActivatedEmailHTML } from '@/lib/email';

// After successful payment
const result = await sendEmail({
  to: customer.email,
  subject: `Welcome to MorphDB ${planName} - Subscription Confirmed`,
  html: getSubscriptionActivatedEmailHTML(customer.name, planName),
});
```

---

## Testing Emails

### Development Mode
By default, emails are NOT sent in development. Instead, they're logged to console:

```
📧 Email would be sent in production: {
  to: user@example.com,
  subject: Welcome to MorphDB
}
```

### Enable Test Emails in Development
Set `SEND_EMAILS_IN_DEV=true` in `.env.local` to actually send emails during development.

### Test in Production
Resend free tier includes:
- 100 emails per day
- Full functionality
- Perfect for testing

---

## Email Features

### Automatic Features
- ✅ Reply-To set to support email
- ✅ Professional HTML templates
- ✅ Responsive design
- ✅ Error handling & logging
- ✅ Dry-run mode for development

### Template Variables
All templates support:
- User's first name (with fallback to "there")
- Dynamic content (plan names, trial hours, batch stats)
- Links to dashboard, docs, support

---

## Email Architecture

```
┌─────────────────┐
│  User Action    │
│  (signup, etc)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Endpoint   │
│  (auth, stripe) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Email Service  │
│  (/api/emails/) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Resend API     │
│  (resend.com)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Inbox     │
└─────────────────┘
```

---

## Troubleshooting

### Emails not sending
1. Check RESEND_API_KEY is set correctly
2. Verify email address is valid
3. Check server logs for errors
4. Test with `curl` command below

### Test with curl
```bash
curl -X POST http://localhost:3000/api/emails/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test"
  }'
```

### Email ends up in spam
1. Verify domain in Resend
2. Add DKIM/SPF records
3. Use professional email address (no generic names)

---

## Next Steps

1. Get Resend API key: https://resend.com
2. Add `.env.local` variables
3. Test email endpoints with curl
4. Integrate into existing API routes
5. Monitor emails in Resend dashboard

---

## Support

For issues with:
- **Resend**: https://resend.com/docs
- **MorphDB**: /support endpoint or support@morphdb.ai
