# Email Configuration Guide for MorphDB

## Current Status
❌ **Resend API is in test/sandbox mode**
- Can only send to: `learnertech111@gmail.com`
- Cannot send to real user email addresses
- Signup still works, but welcome emails fail silently

## The Problem Explained

When users sign up with their own email address, the welcome email fails because:

1. **Resend Test Mode Limitation**: Free Resend accounts are in sandbox mode
2. **Sandbox Restriction**: Can ONLY send emails to your verified email (`learnertech111@gmail.com`)
3. **User Impact**: New users don't receive welcome emails with their auth confirmation

### Error Message in Logs
```
❌ Email send failed: {
  message: 'You can only send testing emails to your own email address 
           (learnertech111@gmail.com). To send emails to other recipients, 
           please verify a domain at resend.com/domains, and change the `from` 
           address to an email using this domain.'
}
```

## Solutions (in order of recommendation)

### ✅ Solution 1: Upgrade Resend Account (RECOMMENDED)
**Best for production use**

1. Go to https://resend.com/pricing
2. Upgrade to a paid plan ($20/month starter)
3. Go to https://resend.com/domains
4. Verify your domain (`morphdb.ai`)
5. Update `.env.local`:
   ```
   NEXT_PUBLIC_FROM_EMAIL=noreply@morphdb.ai
   ```
6. Restart dev server
7. Test signup - welcome emails will now work!

**Benefits:**
- ✅ Users receive welcome emails immediately
- ✅ Professional sender address
- ✅ Full email capabilities unlocked
- ✅ Production-ready

**Cost:** $20-200/month depending on volume

---

### ✅ Solution 2: Use SendGrid Instead (FREE ALTERNATIVE)
**Good for development/testing**

1. Sign up for free at https://sendgrid.com
2. Verify sender email in SendGrid dashboard
3. Get API key from Settings > API Keys
4. Update `src/lib/email.ts` to use SendGrid instead of Resend:

```typescript
import sgMail from '@sendgrid/mail';

export async function sendEmail(options: EmailOptions) {
  try {
    if (process.env.NODE_ENV === 'development' && process.env.SEND_EMAILS_IN_DEV !== 'true') {
      console.log('📧 Email would be sent:', { to: options.to, subject: options.subject });
      return { success: true, isDryRun: true };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    
    const msg = {
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@morphdb.ai',
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || SUPPORT_EMAIL,
    };

    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully:', response[0].headers['x-message-id']);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

5. Update `.env.local`:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_FROM_EMAIL=your_verified_email@domain.com
   ```

6. Install SendGrid:
   ```bash
   npm install @sendgrid/mail
   ```

**Benefits:**
- ✅ Free tier: 100 emails/day
- ✅ No domain verification needed
- ✅ Immediate testing with any email
- ✅ Good for development

**Cost:** Free tier available, then $19.95-399/month

---

### ✅ Solution 3: Use Mailgun (FREE ALTERNATIVE)
**Similar to SendGrid**

1. Sign up at https://mailgun.com
2. Free tier: 100 emails/day
3. Get API key and configure domain
4. Update `src/lib/email.ts` to use Mailgun

---

## Temporary Workaround (Current Implementation)
**For development without email sending**

The signup endpoint now handles email failures gracefully:
- ✅ Signup succeeds even if email fails
- ✅ Failures are logged for debugging
- ✅ No user-facing errors

To test currently:
1. Use `learnertech111@gmail.com` to receive welcome emails
2. OR ignore welcome emails and test other features

---

## Testing Email Setup

After implementing a solution, test with:

```bash
# Sign up with a valid email address (different from verified email)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User",
    "company": "Test Company"
  }'
```

Check logs for:
```
✅ Email sent successfully: <message-id>
```

---

## Environment Variables Reference

### Current (Test Mode)
```env
RESEND_API_KEY=re_UA25K1WP_P6hto52UqdJJTVroFjEyMgbd
SEND_EMAILS_IN_DEV=true
NEXT_PUBLIC_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_SUPPORT_EMAIL=onboarding@resend.dev
```

### After Upgrading Resend
```env
RESEND_API_KEY=re_[production_key]
NEXT_PUBLIC_FROM_EMAIL=noreply@morphdb.ai
NEXT_PUBLIC_SUPPORT_EMAIL=support@morphdb.ai
```

### With SendGrid
```env
SENDGRID_API_KEY=SG.[your_api_key]
SENDGRID_FROM_EMAIL=noreply@morphdb.ai
NEXT_PUBLIC_SUPPORT_EMAIL=support@morphdb.ai
```

---

## Related Code Files

- `src/lib/email.ts` - Email sending implementation
- `src/app/api/auth/signup/route.ts` - Signup endpoint (sends welcome email)
- `.env.local` - Email configuration

## Next Steps

1. **For Development:** Use SendGrid free tier or keep current workaround
2. **For Production:** Upgrade Resend account with domain verification
3. **For Testing:** Use `learnertech111@gmail.com` with current setup

---

**Status:** Waiting for email service upgrade to enable real user onboarding emails
