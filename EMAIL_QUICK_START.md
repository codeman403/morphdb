# Email Feature - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Get API Key (2 min)
1. Go to https://resend.com
2. Sign up (free)
3. Copy your API key

### Step 2: Add to .env.local (1 min)
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Step 3: Start Sending (1 min)
```bash
# Test the welcome email endpoint
curl -X POST http://localhost:3000/api/emails/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"John"}'
```

✅ Done! Emails are ready to use.

---

## 📧 Available Email Types

| Email Type | Endpoint | When to Send |
|---|---|---|
| **Welcome** | `POST /api/emails/welcome` | After user signs up |
| **Trial Started** | `POST /api/emails/trial-started` | When trial begins |
| **Trial Expiring** | `POST /api/emails/trial-expiring` | 24h before expiration |
| **Subscription** | `POST /api/emails/subscription-activated` | After payment succeeds |
| **Support Ticket** | `POST /api/emails/support-ticket` | User submits ticket |
| **Batch Complete** | `POST /api/emails/batch-completion` | Migration finishes |

---

## 💻 Usage Examples

### Send Welcome Email
```typescript
import { sendEmail, getWelcomeEmailHTML } from '@/lib/email';

const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to MorphDB',
  html: getWelcomeEmailHTML('John'),
});
```

### Send Support Ticket Email
```typescript
import { sendEmail, getSupportTicketEmailHTML } from '@/lib/email';

const result = await sendEmail({
  to: 'user@example.com',
  subject: `Support Ticket #${ticketId}`,
  html: getSupportTicketEmailHTML('John', ticketId, 'Subject'),
});
```

### Send Batch Completion Email
```typescript
import { sendEmail, getBatchCompletionEmailHTML } from '@/lib/email';

const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Batch Migration Complete',
  html: getBatchCompletionEmailHTML('John', batchId, 45, 5),
});
```

---

## 🧪 Testing

### Development (Default - Dry Run)
```
📧 Email would be sent in production: {
  to: user@example.com,
  subject: Welcome to MorphDB
}
```

### Enable Real Emails in Dev
```env
SEND_EMAILS_IN_DEV=true
```

### Test Endpoints
```bash
# Test all endpoints with:
./test-emails.sh
```

---

## 📁 Files Added

```
src/lib/email.ts                          (280 lines) - Core email utility
src/app/api/emails/welcome/route.ts       (30 lines)
src/app/api/emails/trial-started/route.ts (30 lines)
src/app/api/emails/trial-expiring/route.ts (30 lines)
src/app/api/emails/subscription-activated/route.ts (30 lines)
src/app/api/emails/support-ticket/route.ts (45 lines)
src/app/api/emails/batch-completion/route.ts (35 lines)
```

---

## ✅ Checklist

- ✅ Resend integration ready
- ✅ 6 professional email templates
- ✅ 5 API endpoints created
- ✅ Error handling & logging
- ✅ Development-safe (dry-run mode)
- ✅ Production builds successfully
- ✅ Zero new dependencies conflicts
- ✅ Full type safety (TypeScript)

---

## 📚 Documentation

- **Complete Guide**: `EMAIL_IMPLEMENTATION.md`
- **Setup Instructions**: `EMAIL_SETUP.md`
- **Code**: `src/lib/email.ts`

---

## 🎯 Next Steps

1. **Get Resend API Key**: https://resend.com
2. **Add to `.env.local`**: Copy-paste the key
3. **Integrate into endpoints**: Use examples above
4. **Test**: `curl` the endpoints
5. **Monitor**: Check Resend dashboard

---

## 💡 Tips

- **Don't fail on email errors**: Email failures shouldn't crash your user flows
- **Log everything**: Use `console.error()` for debugging
- **Use custom sender**: Update `NEXT_PUBLIC_FROM_EMAIL` for your domain
- **Test in dev**: Set `SEND_EMAILS_IN_DEV=true` to see real emails
- **Monitor delivery**: Check Resend dashboard regularly

---

## 🆘 Common Issues

**Q: Emails not sending?**
A: Check `RESEND_API_KEY` is set and valid

**Q: Getting to spam?**
A: Verify your domain in Resend settings

**Q: Want to customize templates?**
A: Edit functions in `src/lib/email.ts`

---

## Support

- Resend Docs: https://resend.com/docs
- MorphDB Support: /support
- Questions: support@morphdb.ai
