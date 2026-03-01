# Changelog

All notable changes to the MorphDB project will be documented in this file.

## [Unreleased]

### Added
- **Subscription Cancellation Feature**: Users can now cancel their subscriptions from the Settings page with a modal confirmation dialog. Supports both Stripe and admin-granted subscriptions with proper email notifications and audit logging.
- **Settings/Subscription Management Page**: New authenticated page at `/dashboard/settings` for users to view their subscription tier, usage limits, and cancel their plan.
- **Non-SQL Input Detection**: AI now properly rejects non-SQL conversational inputs and displays them as warning errors outside the translation output window instead of rendering them as SQL code.

### Changed
- **Navigation**: Added Settings link to all authenticated navigation bars (main Navbar, dashboard, migrate, history, admin pages).
- **Upgrade to Pro Button**: Changed to navigate to pricing section (`/#pricing`) instead of attempting direct Stripe checkout.
- **Subscription Cancellation**: Stripe database status now properly updates to `canceled` when users cancel, preventing the cancel button from reappearing on subsequent visits.
- **Email Notifications**: Enhanced to support optional effective date parameter for subscription cancellations.

### Fixed
- Cancel subscription button showing again after cancellation (database status sync issue).
- Upgrade to Pro button redirecting to login instead of pricing/checkout.
- Non-SQL inputs displayed as failed translations inside the output window instead of as a warning message.
- Font size inconsistency across dashboard page navbars (added `text-lg` to MorphDB logos).

### Technical Details
- **Audit Logging**: All subscription cancellations logged with 90-day auto-cleanup.
- **Error Handling**: Improved error messages for checkout initialization and migration API.
- **Type Safety**: Updated TypeScript interfaces for subscription data and cancellation state.

## [Previous Versions]
See git history for earlier changes.
