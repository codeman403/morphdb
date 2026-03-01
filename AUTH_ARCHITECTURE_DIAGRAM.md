# MorphDB Authentication Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (Browser)                              │
│                                                                               │
│  ┌────────────────────┐                                                      │
│  │   Login Page       │  (src/app/login/page.tsx)                           │
│  │  - Sign In Form    │  Uses Tailwind CSS + Framer Motion                  │
│  │  - Sign Up Form    │  Dark theme (emerald accent)                        │
│  │  - Forgot Password │  Client-side state management                       │
│  └────────────────────┘                                                      │
│           │                                                                   │
│           │ User submits                                                     │
│           ↓                                                                   │
│  ┌────────────────────┐                                                      │
│  │  Supabase Client   │  (src/lib/supabase/client.ts)                       │
│  │  @supabase/ssr     │  Uses NEXT_PUBLIC_SUPABASE_URL                      │
│  │  Session + Auth    │  Uses NEXT_PUBLIC_SUPABASE_ANON_KEY                 │
│  └────────────────────┘                                                      │
│           │                                                                   │
└───────────┼───────────────────────────────────────────────────────────────────┘
            │ POST /api/auth/signin or /api/auth/signup
            ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Backend API Routes                                  │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  POST /api/auth/signin                                               │   │
│  │  - Rate limit check (5/min per IP)                                  │   │
│  │  - Validate email & password format                                 │   │
│  │  - Call Supabase auth.signInWithPassword()                          │   │
│  │  - Create LoginLog entry                                            │   │
│  │  - Return { success: true, user: {...} }                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  POST /api/auth/signup                                               │   │
│  │  - Rate limit check (3/min per IP)                                  │   │
│  │  - Validate all inputs (email, password, name, company)             │   │
│  │  - Call Supabase auth.signUp()                                      │   │
│  │  - Create Profile record in Prisma                                  │   │
│  │  - Send welcome email via Resend                                    │   │
│  │  - Create LoginLog entry                                            │   │
│  │  - Return { success: true, user: {...} }                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  GET /api/auth/callback                                              │   │
│  │  - Receive code from Supabase email verification                    │   │
│  │  - Exchange code for session                                         │   │
│  │  - Redirect to /dashboard or /login?error=callback_error            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  POST/GET /api/auth/signout                                          │   │
│  │  - Call supabase.auth.signOut()                                      │   │
│  │  - Redirect to homepage                                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  GET /api/auth/profile                                               │   │
│  │  - Get authenticated user from Supabase                              │   │
│  │  - Fetch user profile & tier info                                    │   │
│  │  - Return user data with limits                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────┬───────────────────────────────────────────────────────────────────┘
            │
            ├─────────────────────────┬──────────────────────────┐
            ↓                         ↓                          ↓
   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
   │  Supabase Auth   │    │  PostgreSQL DB   │    │  Email Service   │
   │  (Cloud)         │    │  (Prisma)        │    │  (Resend)        │
   │                  │    │                  │    │                  │
   │ - Users table    │    │ - profiles       │    │ - sendEmail()    │
   │ - Sessions       │    │ - login_logs     │    │ - Templates      │
   │ - Verification   │    │ - subscriptions  │    │ - Welcome email  │
   │                  │    │ - audit_logs     │    │ - Password reset │
   │                  │    │ - monthly_usage  │    │   (placeholder)  │
   └──────────────────┘    └──────────────────┘    └──────────────────┘
```

## Session Flow & Middleware

```
┌─────────────────┐
│  User Request   │
│  to /dashboard  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│  Middleware (middleware.ts)             │
│                                         │
│  1. Create Supabase server client      │
│  2. Get session from cookies           │
│  3. Check if authenticated              │
└────────┬────────────────────────────────┘
         │
    ┌────┴────┐
    │          │
    NO        YES
    │          │
    ↓          ↓
Redirect    Continue
to /login   to /dashboard
    │          │
    │          ↓
    │    ┌──────────────────────────┐
    │    │  SessionManager          │
    │    │  (src/components/)       │
    │    │                          │
    │    │ - Monitor activity       │
    │    │ - 15 min timeout         │
    │    │ - 2 min warning          │
    │    │ - Logout on timeout      │
    │    └──────────────────────────┘
    │
    └──→ Public Pages OK
```

## Data Flow: Sign Up to Authenticated User

```
Step 1: User fills form
   ↓
┌──────────────────────────────────────────┐
│ Form Data:                               │
│ - email: "user@company.com"              │
│ - password: "SecureP@ss123"              │
│ - name: "Jane Smith"                     │
│ - company: "Acme Corp"                   │
└──────────────┬───────────────────────────┘
               ↓
Step 2: POST /api/auth/signup
   ↓
┌──────────────────────────────────────────┐
│ 1. Rate limit check                      │
│ 2. Validate all inputs                   │
│ 3. Hash password (Supabase)              │
│ 4. Create auth.users entry               │
└──────────────┬───────────────────────────┘
               ↓
Step 3: Create supporting records
   ↓
   ├──→ profiles table (Prisma)
   │    - id (user UUID)
   │    - email
   │    - name
   │    - company
   │
   ├──→ login_logs table (Prisma)
   │    - userId
   │    - email
   │    - ip
   │    - country (from headers)
   │    - userAgent
   │
   └──→ Send welcome email (Resend)
        - Email address
        - User's first name
        - Welcome message
               ↓
Step 4: Return response + send verification email
   ↓
   - User gets: { success: true, user: {...} }
   - Supabase sends email verification link
               ↓
Step 5: User clicks email verification link
   ↓
   - GET /api/auth/callback?code=XXXXX
               ↓
Step 6: Session created, user authenticated
   ↓
   - Cookies stored
   - Redirected to /dashboard
               ↓
AUTHENTICATED USER
```

## Database Schema Relationship

```
Supabase (Cloud)           PostgreSQL (Prisma)
─────────────────          ──────────────────

auth.users                 profiles
   │                          │
   ├─ id (UUID)              ├─ id (FK → auth.users)
   ├─ email                  ├─ email
   ├─ encrypted_pass         ├─ name
   ├─ email_confirmed_at     ├─ company
   └─ created_at             └─ avatar_url

                           login_logs
                              │
                              ├─ userId (FK)
                              ├─ email
                              ├─ ip
                              ├─ country
                              └─ userAgent

                           subscriptions
                              │
                              ├─ userId (FK, UNIQUE)
                              ├─ plan
                              ├─ status
                              ├─ trialTakenAt
                              ├─ trialEndsAt
                              └─ stripeSubscriptionId

                           monthly_usage
                              │
                              ├─ userId (FK)
                              ├─ yearMonth
                              ├─ batchCount
                              ├─ translationCount
                              └─ tokenCount

                           audit_logs
                              │
                              ├─ userId (who performed action)
                              ├─ resourceType
                              ├─ resourceId
                              ├─ changes (JSON)
                              └─ ipAddress (anonymized)
```

## Authentication State Machine

```
                      START
                        │
                        ↓
            ┌───────────────────────┐
            │   Unauthenticated     │
            │   Can view: /         │
            │            /login     │
            └───────────────────────┘
                   ↑           │
                   │           │ User submits form
                   │           ↓
            Cannot│  ┌───────────────────────┐
            enter │  │  Validating Input     │
            dash  │  │  - Format checks      │
            board │  │  - Rate limit check   │
                   │  └───────────────────────┘
                   │           │
                   │           ↓
                   │  ┌───────────────────────┐
                   │  │ Supabase Auth Call    │
                   │  │ - signInWithPassword  │
                   │  │ - signUp              │
                   │  └───────────────────────┘
                   │           │
         Error┌────┴───┐       │
              │        │       │ Success
              ↓        │       ↓
       ┌────────────┐  │  ┌─────────────────────┐
       │  Auth      │  │  │  Session Created    │
       │  Failed    │  │  │  - Cookie set       │
       │  Message   │  │  │  - User object set  │
       │  shown     │  │  └─────────────────────┘
       └────────────┘  │           │
              │        │           ↓
              │        │  ┌─────────────────────┐
              │        │  │  Authenticated      │
              │        │  │  Can view: /login   │
              │        │  │             /dash   │
              │        │  └─────────────────────┘
              │        │           │
              │        │           │ 15 min
              │        │           │ inactivity
              │        │           ↓
              │        │  ┌─────────────────────┐
              │        │  │  Warning Dialog     │
              │        │  │  "Logout in 2 min"  │
              │        │  └─────────────────────┘
              │        │           │
              │        │      Stay│Logout
              │        │     login│
              │        │           │
              └────────┼───────────┴──→ Return to Unauthenticated
                       │                 (via signOut)
                       │
                       └──────────→ Return here on error
```

## Validation Pipeline

```
Raw Input
   ↓
┌────────────────────────────────────────┐
│ Input Validation Layer                 │
│                                        │
│ 1. Email Validation                    │
│    - RFC 5322 regex pattern            │
│    - No ..@, .@, @., @.com patterns    │
│    - Max 254 chars, local max 64       │
│                                        │
│ 2. Password Validation (signup only)   │
│    - Min 8 characters                  │
│    - 1 uppercase                       │
│    - 1 lowercase                       │
│    - 1 number                          │
│    - 1 special char                    │
│                                        │
│ 3. Name Validation                     │
│    - Letters, spaces, hyphens, quotes  │
│    - 2-100 characters                  │
│                                        │
│ 4. Company Validation                  │
│    - Optional field                    │
│    - Max 100 characters                │
└────────────────────────────────────────┘
         │
    Pass│Fail
         │ │
         │ └──→ Return 400 error
         │      with validation message
         ↓
┌────────────────────────────────────────┐
│ Rate Limiting Check                    │
│                                        │
│ By IP Address:                         │
│ - signin: 5 per 60 sec                 │
│ - signup: 3 per 60 sec                 │
│                                        │
│ Uses: Redis (prod) or in-memory (dev)  │
└────────────────────────────────────────┘
         │
    Pass│Fail
         │ │
         │ └──→ Return 429 rate limited
         │
         ↓
┌────────────────────────────────────────┐
│ Supabase Auth Processing               │
│                                        │
│ - Encrypt password (bcrypt)            │
│ - Create user record                   │
│ - Send verification email              │
│ - Return session                       │
└────────────────────────────────────────┘
         │
    Pass│Fail
         │ │
         │ └──→ Return 400/401 auth error
         │
         ↓
AUTHENTICATED / REGISTERED
```

## Protected Routes Access Control

```
Request to /dashboard/*
        ↓
   Check Authentication
   (middleware.ts)
        ↓
    ┌───┴───┐
    │       │
  Valid   Invalid
    │       │
    ↓       ↓
 ALLOW  REDIRECT
        to /login

Routes Protected:
- /dashboard/*  (all dashboard routes)

Routes Public:
- /            (homepage)
- /login       (login page)
- /docs/*      (documentation)
- /support     (support page)
- /waitlist    (waitlist form)

API Routes:
- /api/auth/signin         (public, rate limited)
- /api/auth/signup         (public, rate limited)
- /api/auth/callback       (public)
- /api/auth/signout        (authenticated)
- /api/auth/profile        (authenticated)
- /api/auth/has-used-trial (authenticated)
- /api/admin/*             (admin only, checked in route)
```

