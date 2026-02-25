# MorphDB Route Tree

## Public Pages

```
/                           # Landing page
/login                      # Authentication
/waitlist                   # Early access signup
/demo                       # Live translation demo
/support                    # Support ticket form
```

## Protected Pages (Require Auth)

```
/dashboard                  # User dashboard
/dashboard/migrate          # Batch migration tool
/dashboard/history          # Migration history
/dashboard/admin            # Admin panel (admin only)
```

## API Routes

### Authentication (`/api/auth`)
```
/api/auth/signin            # POST - User sign in
/api/auth/signup            # POST - User registration
/api/auth/signout           # POST - User sign out
/api/auth/profile           # GET/PUT - User profile
/api/auth/has-used-trial    # GET - Check trial status
```

### Database Migration (`/api/migrate`)
```
/api/migrate                # POST - Single SQL translation
/api/migrate/batch          # POST - Batch translation
/api/migrate/history       # GET - List migration history
/api/migrate/history/[batchId]  # GET - Get batch details
/api/migrate/download      # POST - Download translated SQL
```

### Payments - Stripe (`/api/stripe`)
```
/api/stripe/checkout       # POST - Create checkout session
/api/stripe/webhook        # POST - Stripe webhook handler
```

### Trial Management (`/api/trial`)
```
/api/trial                 # POST - Activate free trial
```

### Support (`/api/support`)
```
/api/support               # POST - Submit support ticket
```

### Admin (`/api/admin`)
```
/api/admin/stats           # GET - Platform statistics
/api/admin/reset-usage     # POST - Reset user usage
/api/admin/grant-pro        # POST - Grant Pro access
/api/admin/support         # GET - List support tickets
```

### Waitlist (`/api/waitlist`)
```
/api/waitlist              # POST - Join waitlist
```

## Middleware

```
middleware.ts              # Auth protection for /dashboard routes
```

## Database Models

- **Profile** - User metadata
- **Subscription** - Plan status, trial tracking, Stripe integration
- **MigrationBatch** - Translation batch records
- **MigrationResult** - Individual statement translations
- **MonthlyUsage** - Usage tracking per month
- **LoginLog** - Authentication audit trail
- **WaitlistEntry** - Pre-launch leads
- **SupportTicket** - Support inquiries with status tracking
