# MorphDB Authentication Documentation Index

This directory contains comprehensive documentation about the authentication system in the MorphDB project.

## Documentation Files

### 1. **AUTH_ARCHITECTURE.md** (Comprehensive Reference)
**File size:** 21 KB | **Read time:** 15-20 minutes

Complete deep-dive into the authentication system including:
- Supabase client initialization (browser & server)
- All existing auth routes and endpoints with detailed specifications
- Login page structure and styling details
- Password validation requirements
- Session management and middleware
- Database schema for authentication
- Recommended patterns for creating new routes
- Environment variables required
- Step-by-step guide for implementing password reset

**Best for:** Understanding the complete system architecture and planning new features

---

### 2. **AUTH_QUICK_REFERENCE.md** (Quick Lookup)
**File size:** 5 KB | **Read time:** 5 minutes

Quick reference guide with:
- File location index (table format)
- Key authentication flow diagram
- Common tasks and code snippets
- Password requirements
- Rate limits table
- HTTP status codes
- Session management settings
- Testing commands (curl examples)
- Common error messages and solutions

**Best for:** Quick lookups while coding, common tasks, and troubleshooting

---

### 3. **AUTH_ARCHITECTURE_DIAGRAM.md** (Visual Reference)
**File size:** 22 KB | **Read time:** 10 minutes

Visual ASCII diagrams showing:
- System architecture overview
- Session flow and middleware
- Data flow from sign-up to authenticated user
- Database schema relationships
- Authentication state machine
- Validation pipeline
- Protected routes access control

**Best for:** Understanding data flow, system interactions, and visual learners

---

## Key Findings Summary

### What's Currently Implemented
✓ Email/password authentication (Supabase)
✓ User registration with email verification
✓ Session management (15-min timeout)
✓ Rate limiting (per IP address)
✓ Input validation (email, password, name, company)
✓ Login logging (IP, country, user-agent)
✓ Profile management
✓ Admin audit logging
✓ Welcome email notifications
✓ Email service integration (Resend)

### What's NOT Implemented
✗ Password reset / "Forgot password" functionality
  - Login page has placeholder link ("Forgot password?" → "#")
  - No database table for reset tokens
  - No email template for recovery
  - No reset confirmation page

### Critical Files to Know

| File | Purpose | Language |
|------|---------|----------|
| `src/lib/supabase/client.ts` | Browser-side Supabase auth | TypeScript |
| `src/lib/supabase/server.ts` | Server-side Supabase auth | TypeScript |
| `src/app/login/page.tsx` | Login/signup UI component | React/TSX |
| `src/app/api/auth/signin/route.ts` | Sign in endpoint | TypeScript |
| `src/app/api/auth/signup/route.ts` | Sign up endpoint | TypeScript |
| `src/app/api/auth/callback/route.ts` | Email verification callback | TypeScript |
| `src/lib/validation.ts` | Input validation functions | TypeScript |
| `src/lib/rate-limit.ts` | Rate limiting logic | TypeScript |
| `src/lib/email.ts` | Email sending service | TypeScript |
| `middleware.ts` | Route protection middleware | TypeScript |
| `src/components/SessionManager.tsx` | Session timeout management | React/TSX |
| `prisma/schema.prisma` | Database schema definition | Prisma |

---

## Quick Navigation

### I want to...

**Understand how authentication works**
→ Start with AUTH_ARCHITECTURE_DIAGRAM.md, then read AUTH_ARCHITECTURE.md sections 1-6

**Create a new auth-protected API route**
→ See AUTH_QUICK_REFERENCE.md "Adding a New Auth-Protected Route" or AUTH_ARCHITECTURE.md section 9

**Implement password reset functionality**
→ Read AUTH_ARCHITECTURE.md sections 5 and 10

**Debug authentication issues**
→ Refer to AUTH_QUICK_REFERENCE.md "Common Error Messages" section

**Understand the database schema**
→ See AUTH_ARCHITECTURE.md section 8 or AUTH_ARCHITECTURE_DIAGRAM.md "Database Schema Relationship"

**Learn about security patterns**
→ Read AUTH_ARCHITECTURE.md section 7 "Validation & Security Patterns"

**Review session management**
→ See AUTH_ARCHITECTURE.md section 6 and AUTH_ARCHITECTURE_DIAGRAM.md "Session Flow"

---

## Directory Structure Reference

```
/Users/abu/Learning/Vibe_Coding_Bootcamp/hackathon-proj/
├── src/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          ← Browser auth
│   │   │   └── server.ts          ← Server auth
│   │   ├── validation.ts          ← Input validators
│   │   ├── rate-limit.ts          ← Rate limiting
│   │   ├── email.ts               ← Email service
│   │   └── prisma.ts              ← DB client
│   ├── components/
│   │   └── SessionManager.tsx     ← Session timeout
│   └── app/
│       ├── login/
│       │   └── page.tsx           ← Login/signup UI
│       ├── dashboard/
│       │   └── page.tsx           ← Protected route
│       └── api/auth/
│           ├── signin/
│           │   └── route.ts
│           ├── signup/
│           │   └── route.ts
│           ├── callback/
│           │   └── route.ts
│           ├── signout/
│           │   └── route.ts
│           └── profile/
│               └── route.ts
├── prisma/
│   └── schema.prisma              ← Database schema
├── middleware.ts                  ← Auth middleware
└── AUTH_*.md                      ← This documentation
```

---

## Authentication Endpoints

| Method | Endpoint | Public | Rate Limited | Description |
|--------|----------|--------|--------------|-------------|
| POST | `/api/auth/signin` | Yes | 5/60s | Sign in with email/password |
| POST | `/api/auth/signup` | Yes | 3/60s | Register new account |
| GET | `/api/auth/callback` | Yes | No | Email verification callback |
| POST/GET | `/api/auth/signout` | Auth only | No | Logout user |
| GET | `/api/auth/profile` | Auth only | No | Get user profile & tier |
| GET | `/api/auth/has-used-trial` | Auth only | No | Check trial usage |

---

## Database Models

### profiles
- Linked to Supabase auth.users by UUID
- Stores: email, name, company, avatar_url
- Created automatically during signup

### login_logs
- Tracks login attempts with IP, country, user-agent
- Created on every signin/signup
- Indexed by userId and createdAt

### subscriptions
- Tracks user's subscription status
- Stores: plan, stripe info, trial dates
- One per user (unique userId)

### audit_logs
- Records admin actions (grant_pro, reset_usage, etc.)
- Includes anonymized IP and masked user-agent
- Auto-cleanup after 90 days

---

## Security Features

1. **Password Hashing**
   - Managed by Supabase (bcrypt)
   - Never stored in plaintext

2. **Rate Limiting**
   - Per-IP rate limiting on auth endpoints
   - Redis (production) or in-memory (development)

3. **Input Validation**
   - Email: RFC 5322 regex
   - Password: Min 8 chars, uppercase, lowercase, number, special char
   - All other fields: length & character restrictions

4. **Session Management**
   - 15-minute inactivity timeout
   - 2-minute warning before logout
   - Automatic logout on timeout

5. **CORS Protection**
   - Configured origins in middleware
   - Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

6. **Audit Logging**
   - All admin actions logged
   - IP addresses anonymized
   - User-agents masked
   - 90-day retention

---

## Environment Setup

### Required Variables
```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
RESEND_API_KEY=<your-resend-api-key>
ADMIN_EMAILS=admin@example.com
```

### Optional Variables
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
UPSTASH_REDIS_REST_TOKEN=<for-production-rate-limiting>
REDIS_URL=<for-production-rate-limiting>
SEND_EMAILS_IN_DEV=true  # Set to test emails in development
```

---

## Common Development Tasks

### Testing Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecureP@ss1",
    "name": "Test User",
    "company": "Test Co"
  }'
```

### Testing Sign In
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecureP@ss1"
  }'
```

### Running Prisma Migrations
```bash
npx prisma migrate dev
npx prisma db push
```

### Checking Database
```bash
npx prisma studio  # Open Prisma Studio UI
```

---

## Links & References

- **Supabase Documentation**: https://supabase.com/docs/guides/auth
- **@supabase/ssr**: https://github.com/supabase/ssr
- **Prisma ORM**: https://www.prisma.io/docs/
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **Resend Email Service**: https://resend.com/docs

---

## Notes for Implementation

### For Password Reset Feature
1. Create `PasswordResetToken` model in prisma/schema.prisma
2. Create `/api/auth/forgot-password` endpoint
3. Create `/api/auth/reset-password` endpoint
4. Create password reset email template in `src/lib/email.ts`
5. Create reset password page at `src/app/reset-password/page.tsx`
6. Update "Forgot password?" link in login page to point to new page
7. Follow existing patterns for validation, rate limiting, and error handling

### For New Auth Endpoints
1. Follow the basic route pattern shown in AUTH_ARCHITECTURE.md section 9
2. Always include rate limiting for public endpoints
3. Always include proper input validation
4. Use consistent error response format
5. Add to this documentation
6. Test with curl before deploying

---

## Support & Questions

For questions about authentication:
1. Check the relevant section in AUTH_ARCHITECTURE.md
2. Look up the specific file in AUTH_QUICK_REFERENCE.md
3. Review the visual flow in AUTH_ARCHITECTURE_DIAGRAM.md
4. Check the codebase files listed in the File Locations table

Last updated: February 28, 2026
