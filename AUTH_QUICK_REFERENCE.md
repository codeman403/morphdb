# MorphDB Authentication - Quick Reference Guide

## File Locations

| Component | Path |
|-----------|------|
| **Supabase Client (Browser)** | `src/lib/supabase/client.ts` |
| **Supabase Client (Server)** | `src/lib/supabase/server.ts` |
| **Login Page** | `src/app/login/page.tsx` |
| **Sign In API** | `src/app/api/auth/signin/route.ts` |
| **Sign Up API** | `src/app/api/auth/signup/route.ts` |
| **Email Callback** | `src/app/api/auth/callback/route.ts` |
| **Sign Out API** | `src/app/api/auth/signout/route.ts` |
| **Profile API** | `src/app/api/auth/profile/route.ts` |
| **Validation Functions** | `src/lib/validation.ts` |
| **Rate Limiting** | `src/lib/rate-limit.ts` |
| **Email Service** | `src/lib/email.ts` |
| **Session Manager** | `src/components/SessionManager.tsx` |
| **Middleware** | `middleware.ts` |
| **Database Schema** | `prisma/schema.prisma` |

## Key Authentication Flow

```
User Login Page (src/app/login/page.tsx)
    ↓
    POST /api/auth/signin or /api/auth/signup
    ↓
    Supabase Auth API (email/password)
    ↓
    Create LoginLog entry in Prisma
    ↓
    Return session to frontend
    ↓
    Router redirects to /dashboard
    ↓
    Middleware verifies session via SessionManager
```

## Common Tasks

### Adding a New Auth-Protected Route
1. Create route in `/src/app/api/auth/`
2. Import `createClient` from `@/lib/supabase/server`
3. Get user: `const { data: { user } } = await supabase.auth.getUser()`
4. Check if user exists (return 401 if not)
5. Proceed with logic

### Validating Input
```typescript
import { validateEmail, validatePassword, validateName } from '@/lib/validation';

if (!validateEmail(email)) {
  return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
}
```

### Rate Limiting
```typescript
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const ip = getClientIp(req.headers);
const { ok } = await rateLimit(`action:${ip}`, 5, 60_000); // 5 per min
if (!ok) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
```

### Sending Emails
```typescript
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: user.email,
  subject: 'Your Subject',
  html: '<p>Email content</p>'
});
```

### Accessing Database
```typescript
import { prisma } from '@/lib/prisma';

const profile = await prisma.profile.findUnique({
  where: { id: user.id }
});
```

## Password Requirements
- Minimum 8 characters
- 1 uppercase letter (A-Z)
- 1 lowercase letter (a-z)
- 1 number (0-9)
- 1 special character (!@#$%^&*()_+-=[]{}';:"\\|,.<>/)

## Rate Limits
| Endpoint | Limit | Window |
|----------|-------|--------|
| Sign In | 5 attempts | 60 seconds per IP |
| Sign Up | 3 attempts | 60 seconds per IP |
| Admin Routes | 10 attempts | 60 seconds per IP |

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=
ADMIN_EMAILS=admin@example.com
```

## HTTP Status Codes Used
| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Sign in successful |
| 201 | Created | New account created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Invalid credentials or missing auth |
| 403 | Forbidden | Admin route, not admin user |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

## Session Management
- **Session Timeout**: 15 minutes of inactivity
- **Warning Duration**: 2 minutes before logout
- **Auto-logout**: Yes, after warning countdown
- **Activity Events**: mousedown, keydown, scroll, touchstart, mousemove

## Database Tables Related to Auth
- `profiles` - User profile info
- `login_logs` - Login history
- `subscriptions` - Trial & payment info
- `audit_logs` - Admin action history

## Important Notes
- **NO password reset implemented yet** - "Forgot password?" link is placeholder
- User profiles are automatically created during signup
- Login logs track IP, country, user-agent
- All endpoints use rate limiting
- CORS is configured in middleware
- Session cookies are managed via Supabase SSR

## Testing Authentication
```bash
# Test sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234","name":"Test User"}'

# Test sign in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

## Common Error Messages
| Message | Cause | Fix |
|---------|-------|-----|
| "Email and password are required" | Missing field | Provide both fields |
| "A valid email address is required" | Invalid email format | Use valid email |
| "Password must be at least 8 characters" | Weak password | Use 8+ chars |
| "Too many attempts. Please wait" | Rate limited | Wait 60 seconds |
| "Unauthorized" | No session | Sign in first |
| "Email rate limit exceeded" | Resend limit hit | Wait before retrying |
