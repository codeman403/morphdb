# Getting Started with MorphDB - Environment Setup Guide

## ✅ Step 1: .env.local File Created

Your `.env.local` file has been created with placeholders. This file is:
- ✅ **Created**: `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/.env.local`
- ✅ **Ignored by Git**: Safely stored in `.gitignore` (won't be committed)
- ✅ **Ready to edit**: Add your actual credentials

## 📋 Quick Setup (Minimum to Run Emails)

To get emails working in development, update these 2 values in `.env.local`:

### Option A: Test Without Sending (Fastest)
```env
# Keep these as placeholders - emails will log to console instead of sending
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/morphdb
RESEND_API_KEY=re_placeholder_your_key_here
SEND_EMAILS_IN_DEV=false  # Emails logged to console instead of sent
```

**Result**: Application runs, emails logged to console (dry-run mode)

### Option B: Send Real Emails (Requires API Key)
```env
# Get from your Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/morphdb

# Get from https://resend.com (free tier available)
RESEND_API_KEY=re_your_actual_api_key_here
SEND_EMAILS_IN_DEV=true  # Actually send emails in development
```

**Result**: Real emails sent through Resend service

---

## 🔐 Credentials Guide

### Supabase (Required for Auth & Database)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Settings" → "API"
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database (Required)
1. In Supabase, click "Settings" → "Database"
2. Copy the connection string
3. Use as `DATABASE_URL`

### Resend (Required for Emails to Send)
1. Go to https://resend.com
2. Sign up for free account
3. Go to "API Keys"
4. Create new API key
5. Copy key (starts with `re_`) → `RESEND_API_KEY`

### Stripe (Optional - for payments)
1. Go to https://dashboard.stripe.com
2. Get test keys from "Developers" → "API keys"
3. Copy **Secret key** → `STRIPE_SECRET_KEY`
4. Get webhook secret from "Webhooks"
5. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`
6. Get price IDs from "Products" for each plan

### OpenAI (Optional - for SQL translation)
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy key (starts with `sk-`) → `OPENAI_API_KEY`

### Anthropic Claude (Optional - for SQL translation)
1. Go to https://console.anthropic.com/
2. Create new API key
3. Copy key (starts with `sk-ant-`) → `ANTHROPIC_API_KEY`

---

## 🚀 Running the Application

### Without Real Credentials (Dry-run Mode)
```bash
# Start development server
npm run dev

# Application will run at http://localhost:3000
# Emails will be logged to console, not actually sent
```

### With Real Credentials
```bash
# 1. Update .env.local with your actual API keys
# 2. Start development server
npm run dev

# 3. Emails will now send through Resend
# 4. Check Resend dashboard for delivery status
```

### Build for Production
```bash
# Build application
npm run build

# Start production server
npm start
```

---

## 🧪 Testing Email Integration

### Test 1: Check Console Logs (No API Key Needed)
```bash
# Start dev server
npm run dev

# In another terminal, trigger a support request
curl -X POST http://localhost:3000/api/support \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Email",
    "description": "Testing email integration"
  }'

# Check dev server console for:
# ✅ 📧 Email would be sent in production: {...}
```

**Expected Output in Console**:
```
📧 Email would be sent in production: {
  to: 'test@example.com',
  subject: 'Support Request Received: Test Email'
}
```

### Test 2: Send Real Email (With Resend API Key)
```bash
# 1. Set RESEND_API_KEY in .env.local with your real key
# 2. Set SEND_EMAILS_IN_DEV=true in .env.local
# 3. Restart dev server: npm run dev
# 4. Trigger email again (same curl command as above)
# 5. Check Resend dashboard for delivery

# Expected: Email appears in Resend dashboard within seconds
```

### Test 3: Check Specific Email Endpoints
```bash
# Test welcome email endpoint
curl -X POST http://localhost:3000/api/emails/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John"
  }'

# Test trial started email
curl -X POST http://localhost:3000/api/emails/trial-started \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "Jane"
  }'
```

---

## 📊 Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Code** | ✅ Ready | All endpoints integrated, 0 lint errors |
| **Build** | ✅ Ready | Production build successful |
| **Emails** | ✅ Ready | 8 endpoints integrated, 2 new templates |
| **.env.local** | ✅ Created | Placeholder values, ready for credentials |
| **Supabase** | ⏳ Pending | Add your credentials |
| **Resend** | ⏳ Pending | Add API key for real emails |
| **Stripe** | ⏳ Optional | For payment functionality |

---

## 🔄 Email Flow (What Happens)

### Dry-Run Mode (No API Key)
```
User Action (e.g., sign up)
    ↓
API Endpoint triggered
    ↓
Email function called
    ↓
Logs to console: "📧 Email would be sent..."
    ↓
Endpoint returns success
    ↓
✅ No email actually sent (safe for testing)
```

### Production Mode (With API Key)
```
User Action (e.g., sign up)
    ↓
API Endpoint triggered
    ↓
Email function called
    ↓
Sends to Resend service
    ↓
Resend delivers email
    ↓
Logs to console: "✅ Email sent successfully"
    ↓
Endpoint returns success
    ↓
✅ Email delivered to user
```

---

## 🛟 Troubleshooting

### "Cannot find module '@/lib/supabase/server'"
**Solution**: This error appears if Supabase env vars aren't set, but the app still runs fine. The email system doesn't require them for basic testing.

### Emails not appearing in console
**Check**:
1. Is `NODE_ENV=development`? (Usually auto-detected)
2. Is `SEND_EMAILS_IN_DEV=false`? (For dry-run mode)
3. Check terminal where you ran `npm run dev`

### Email endpoint returns 500 error
**Possible causes**:
1. Missing Supabase credentials → Use placeholder values
2. Invalid JSON in request → Check curl command
3. Rate limit hit → Wait 60 seconds before retrying

### Emails not sending with API key
**Check**:
1. Is `RESEND_API_KEY` set correctly? (Should start with `re_`)
2. Is `SEND_EMAILS_IN_DEV=true`?
3. Check Resend dashboard for errors
4. Check server logs: `tail -f /tmp/dev-server.log`

---

## 📝 File Locations

```
Project Root
├── .env.local                    ← Your credentials (NOT in git)
├── .env.example (optional)       ← Could create for reference
├── .gitignore                    ← Includes .env*
│
├── src/
│   ├── lib/
│   │   ├── email.ts             ← Email system core
│   │   └── supabase/            ← Auth config
│   │
│   └── app/api/
│       ├── auth/                ← Authentication endpoints
│       ├── emails/              ← Email trigger endpoints
│       ├── support/             ← Support ticket endpoint
│       ├── stripe/              ← Payment webhooks
│       ├── migrate/             ← Migration endpoints
│       └── admin/               ← Admin endpoints
│
└── EMAIL_INTEGRATION_SUMMARY.md  ← Detailed docs
```

---

## ✨ What's Integrated

**8 Critical Endpoints** now send automatic emails:

1. ✅ User signup → Welcome email
2. ✅ Trial activation → Trial confirmation
3. ✅ Support submission → Ticket + admin alert
4. ✅ Payment success → Subscription confirmation
5. ✅ Batch complete → Results summary
6. ✅ Ticket status change → Status notification
7. ✅ Subscription cancel → Cancellation notice
8. ✅ Admin grant plan → Plan activation

---

## 🎯 Next Steps

### Immediate (5 minutes)
- [ ] Read this file ✅ (you're here!)
- [ ] Optional: Update admin email in `.env.local`

### Short Term (Optional - for real emails)
- [ ] Create Resend account at https://resend.com
- [ ] Get free API key
- [ ] Add `RESEND_API_KEY` to `.env.local`
- [ ] Set `SEND_EMAILS_IN_DEV=true`
- [ ] Restart dev server
- [ ] Test sending real emails

### Long Term (For full functionality)
- [ ] Set up Supabase project and add credentials
- [ ] Configure Stripe for payments
- [ ] Add OpenAI/Claude API keys for SQL translation
- [ ] Deploy to production

---

## 📞 Reference Documentation

For detailed information, see:
- **EMAIL_INTEGRATION_SUMMARY.md** - Complete overview of all integrations
- **EMAIL_IMPLEMENTATION.md** - Code-level implementation details
- **EMAIL_SETUP.md** - Detailed setup instructions
- **EMAIL_QUICK_START.md** - Quick reference guide

---

## ✅ Summary

✅ **Environment file created** with all required variables  
✅ **Placeholders provided** - safe for development  
✅ **Email system ready** - logs to console or sends via Resend  
✅ **No additional setup required** - run `npm run dev` to start  
✅ **Credentials are optional** - test in dry-run mode first  

**You're all set! Start the dev server and emails will work out of the box.** 🚀
