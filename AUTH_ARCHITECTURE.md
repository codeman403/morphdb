# MorphDB Authentication Architecture Summary

## 1. SUPABASE CLIENT INITIALIZATION

### Browser Client (Frontend)
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/lib/supabase/client.ts`
- Uses `@supabase/ssr` for browser-safe authentication
- Initializes with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars
- Includes graceful fallback stub when Supabase is not configured (for local docs preview)
- Stub implements: `getSession()`, `refreshSession()`, `onAuthStateChange()`

### Server Client (Backend)
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/lib/supabase/server.ts`
- Uses `@supabase/ssr` for server-side auth with cookie handling
- Integrates with Next.js `cookies()` API
- Automatically syncs Supabase session cookies

**Dependencies:**
- `@supabase/ssr@^0.8.0`
- `@supabase/supabase-js@^2.97.0`

---

## 2. EXISTING AUTH ROUTES & API ENDPOINTS

### Sign In Route
**Endpoint:** `POST /api/auth/signin`
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/app/api/auth/signin/route.ts`

Features:
- Email/password authentication via Supabase
- Rate limiting: 5 attempts per 60 seconds per IP
- Email validation using RFC 5322 regex
- Login logging with IP, country, user-agent
- Returns: `{ success: true, user: data.user }` on success

```typescript
Input: { email: string, password: string }
Output: { success: true, user: User } | { error: string }
Status: 200 (success), 401 (auth error), 400 (validation), 429 (rate limited), 500 (error)
```

### Sign Up Route
**Endpoint:** `POST /api/auth/signup`
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/app/api/auth/signup/route.ts`

Features:
- User registration with email verification
- Rate limiting: 3 attempts per 60 seconds per IP
- Validates: email, password strength, name, company
- Creates profile in Prisma (PostgreSQL)
- Sends welcome email via Resend
- Logs signup activity
- Auto-populates profile with name and company metadata

```typescript
Input: { 
  email: string, 
  password: string, 
  name?: string, 
  company?: string 
}
Output: { success: true, user: User } | { error: string }
Status: 201 (created), 400 (validation), 429 (rate limited), 500 (error)
```

### Email Callback Route
**Endpoint:** `GET /api/auth/callback`
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/app/api/auth/callback/route.ts`

Features:
- Handles email verification callback from Supabase
- Exchanges OAuth code for session
- Redirects to `/dashboard` on success
- Redirects to `/login?error=callback_error` on failure

### Sign Out Route
**Endpoint:** `POST /api/auth/signout` or `GET /api/auth/signout`
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/app/api/auth/signout/route.ts`

Features:
- Clears Supabase session
- Redirects to homepage
- Supports both GET and POST methods

### Profile Route
**Endpoint:** `GET /api/auth/profile`
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/app/api/auth/profile/route.ts`

Features:
- Returns user profile with tier information
- Gets user from Supabase session
- Returns tier limits and allowed models
- Gracefully handles unauthenticated users

```typescript
Output: { 
  firstName: string | null, 
  tier: string,
  tierLabel: string,
  limits: { ... }
}
Status: 200 (success), 401 (unauthenticated), 500 (error)
```

### Check Trial Usage Route
**Endpoint:** `GET /api/auth/has-used-trial`
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/app/api/auth/has-used-trial/route.ts`

Features:
- Check if user has already used free trial
- Gets user from Supabase session

---

## 3. LOGIN PAGE STRUCTURE & STYLING

**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/app/login/page.tsx`

### Features:
- Client-side component with tab-based UI (Sign In / Sign Up)
- Single form that handles both flows
- Sign In tab fields:
  - Email (required)
  - Password (required, min 8 chars)
  - Forgot password link (currently dummy - see section 5)
  
- Sign Up tab fields:
  - Full Name (optional)
  - Company (optional)
  - Email (required)
  - Password (required, min 8 chars)

### Styling Details:
- Dark theme: `bg-slate-950`
- Primary color: Emerald (`emerald-500`)
- Border: `border-emerald-500/20`
- Container: `bg-slate-950/80 backdrop-blur-md`
- Input styling: `bg-white/5` with emerald focus states
- Button: Full-width emerald with shadow
- Animations: Framer Motion (fade + slide)

### State Management:
```typescript
const [tab, setTab] = useState<'signin' | 'signup'>('signin');
const [form, setForm] = useState({ 
  email: '', 
  password: '', 
  name: '', 
  company: '' 
});
const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
const [message, setMessage] = useState('');
```

### Error Handling:
- Shows status message in bordered container
- Error messages in red (`text-red-400 bg-red-400/10`)
- Success messages in green (`text-emerald-400 bg-emerald-400/10`)

---

## 4. PASSWORD-RELATED LOGIC

### Password Validation
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/lib/validation.ts`

Function: `validatePassword(password: string)`

Requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character: `!@#$%^&*()_+-=[]{}';:"\\|,.<>/?`

Returns: `{ valid: boolean, errors: string[] }`

### Password Reset Flow
**IMPORTANT:** No password reset implementation exists yet!
- Login page shows "Forgot password?" link on line 114 (currently `href="#"`)
- Link is ready for integration but points to no route
- No database table exists for password reset tokens
- No email template for password recovery

### Email Validation
**Function:** `validateEmail(email: string)`
- RFC 5322 simplified regex
- Rejects invalid patterns like `test@.com`, `test@@domain.com`
- Max length: 254 characters
- Local part (before @) max: 64 characters

---

## 5. EXISTING RESET/RECOVERY LOGIC

### Current State: NO PASSWORD RESET IMPLEMENTED

**What exists:**
- UI placeholder in login page ("Forgot password?" link)
- Email sending infrastructure via Resend (see `/src/lib/email.ts`)
- Welcome email template (can be used as pattern)

**What's missing:**
- Password reset route (`/api/auth/forgot-password` or similar)
- Password reset confirmation route (`/api/auth/reset-password`)
- Database table for password reset tokens
- Email template for password recovery
- Password reset page/form
- Token expiration logic
- Token validation logic

### Available Email Infrastructure
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/lib/email.ts`

```typescript
export async function sendEmail(options: EmailOptions) {
  // Uses Resend service
  // Supports HTML templates
  // Logs failures but doesn't throw
}

// Available templates:
- getWelcomeEmailHTML(userName: string)  // Existing template for reference
```

---

## 6. MIDDLEWARE & SESSION MANAGEMENT

### Authentication Middleware
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/middleware.ts`

Features:
- Protects `/dashboard/*` routes - redirects unauthenticated users to `/login`
- Handles Supabase session cookies
- CORS preflight handling
- CORS headers with allowed origins
- Runs on all requests except static assets

### Session Timeout Management
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/components/SessionManager.tsx`

Features:
- Auto-logout after 15 minutes of inactivity
- Warning displayed 2 minutes before logout
- Countdown timer shown during warning
- Resets on activity: `mousedown`, `keydown`, `scroll`, `touchstart`, `mousemove`
- User can click "Stay Logged In" to reset timer
- Gracefully handles missing Supabase config

---

## 7. VALIDATION & SECURITY PATTERNS

### Input Validation
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/lib/validation.ts`

Exported functions:
- `validateEmail(email: string): boolean`
- `validatePassword(password: string): { valid: boolean, errors: string[] }`
- `validateName(name: string): boolean` - letters, spaces, hyphens, apostrophes only
- `validateCompany(company: string): boolean` - optional, max 100 chars

### Rate Limiting
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/lib/rate-limit.ts`

```typescript
export async function rateLimit(
  key: string, 
  limit: number, 
  windowMs: number
): Promise<{ ok: boolean, remaining: number }>
```

Features:
- Uses Redis (Upstash) in production with `UPSTASH_REDIS_REST_TOKEN`
- Falls back to in-memory store in development
- Cleanup every 5 minutes to prevent memory leaks
- Usage: `const { ok } = await rateLimit('signin:${ip}', 5, 60_000)`

### Client IP Detection
```typescript
export function getClientIp(headers: Headers): string {
  // Checks: x-forwarded-for, x-real-ip
  // Splits on first comma for x-forwarded-for chain
}
```

### Security Headers
**CORS Configuration:**
- Allowed origins: configured in middleware
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Max age: 86400 seconds (24 hours)

### PII Protection
**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/src/lib/pii-utils.ts`

Functions exist for:
- IP address anonymization (CIDR range)
- User-agent masking
- Used in audit logs and admin routes

---

## 8. DATABASE SCHEMA FOR AUTH

**File:** `/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/prisma/schema.prisma`

### Profile Table
```prisma
model Profile {
  id        String   @id  // Linked to Supabase auth.users.id
  email     String   @unique
  name      String?
  company   String?
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Login Log Table
```prisma
model LoginLog {
  id        String   @id @default(uuid())
  userId    String
  email     String?
  ip        String?
  country   String?
  userAgent String?
  createdAt DateTime @default(now())
  
  @@index([userId, createdAt])
}
```

### Subscription Table
```prisma
model Subscription {
  id                   String
  userId               String   @unique
  stripeCustomerId     String?
  stripeSubscriptionId String?
  plan                 String   @default("free")
  status               String   @default("inactive")
  trialTakenAt         DateTime?
  trialEndsAt          DateTime?
  currentPeriodEnd     DateTime?
  createdAt            DateTime
  updatedAt            DateTime
}
```

### Audit Log Table (for admin actions)
```prisma
model AuditLog {
  id           String
  action       String      // e.g., "grant_pro", "reset_usage"
  userId       String      // Admin who performed action
  resourceType String      // "user", "batch", "subscription"
  resourceId   String      // ID of affected resource
  changes      String      // JSON object
  ipAddress    String?     // Anonymized
  userAgent    String?     // Masked
  createdAt    DateTime
  expiresAt    DateTime    // 90-day auto-cleanup
}
```

---

## 9. RECOMMENDED PATTERNS FOR NEW ROUTES

### Basic API Route Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { validateEmail, validatePassword } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting (per IP)
    const ip = getClientIp(req.headers);
    const { ok } = await rateLimit(`action:${ip}`, 5, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a minute.' },
        { status: 429 }
      );
    }

    // 2. Parse and validate input
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 3. Validate format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // 4. Get authenticated user (if needed)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 5. Business logic with Prisma
    const result = await prisma.someTable.create({
      data: { userId: user.id, ... }
    });

    // 6. Return success with data
    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );

  } catch (e) {
    console.error('[Route Error]', e);
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
```

### Admin-Only Route Pattern
```typescript
// Check ADMIN_EMAILS from environment
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}

// Then proceed with admin action
```

### Error Response Format
```typescript
// Input validation errors
{ error: 'Email and password are required.', status: 400 }

// Auth errors
{ error: 'Unauthorized', status: 401 }
{ error: 'Forbidden', status: 403 }

// Rate limiting
{ error: 'Too many attempts. Please wait a minute.', status: 429 }

// Server errors
{ error: 'Something went wrong.', status: 500 }
```

### Success Response Format
```typescript
// Simple success
{ success: true }

// With data
{ success: true, user: {...}, data: {...} }

// HTTP status codes
201 - Created (signup, resource creation)
200 - OK (signin, updates, queries)
```

---

## 10. NEXT STEPS FOR PASSWORD RESET FEATURE

### Required Implementation:
1. **Database Migration** - Add password reset token table
2. **API Routes** - `/api/auth/forgot-password` and `/api/auth/reset-password`
3. **Email Template** - Password recovery email
4. **Frontend Page** - Password reset form
5. **Form Component** - Input validation for new password

### Database Schema Recommendation:
```prisma
model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  email     String   // For verification
  token     String   @unique  // hashed for security
  expiresAt DateTime @map("expires_at")  // 1 hour TTL
  createdAt DateTime @default(now())
  
  @@index([email, expiresAt])
  @@map("password_reset_tokens")
}
```

### Route Pattern (Suggested):
```
1. POST /api/auth/forgot-password
   - Email input
   - Generate token, send email
   
2. POST /api/auth/reset-password
   - Token, new password
   - Validate token, update password
```

---

## 11. ENVIRONMENT VARIABLES REQUIRED

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Email (Resend)
RESEND_API_KEY=
NEXT_PUBLIC_FROM_EMAIL=
NEXT_PUBLIC_SUPPORT_EMAIL=

# Rate Limiting (Optional in dev, required in prod)
UPSTASH_REDIS_REST_TOKEN=
REDIS_URL=

# Admin
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yoursite.com
SEND_EMAILS_IN_DEV=false  # Set true to test email in dev
```

---

## Summary

The MorphDB project uses **Supabase for authentication** with a modern, secure setup including:
- Email/password authentication
- Session management with middleware
- Rate limiting on auth endpoints
- Input validation and sanitization
- Audit logging for admin actions
- Email notifications via Resend

**Password reset is NOT yet implemented** but has proper infrastructure in place for email sending. The login page already has the "Forgot password?" UI placeholder ready for implementation.

The codebase follows consistent patterns for API routes, error handling, and security best practices that should be followed for any new authentication features.
