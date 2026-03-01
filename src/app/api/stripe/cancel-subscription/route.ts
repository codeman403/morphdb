import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, getSubscriptionCancelledEmailHTML } from '@/lib/email';

type StripeSubscriptionWithPeriod = Stripe.Subscription & { current_period_end?: number };

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason, feedback } = await req.json();

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
    });

    // Cancel subscription at period end (so user can use until end of billing cycle)
    const cancelledSub = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    const sub = cancelledSub as StripeSubscriptionWithPeriod;
    const periodEnd = typeof sub.current_period_end === 'number' ? sub.current_period_end : Math.floor(Date.now() / 1000);

    // Log the cancellation in audit log
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // Auto-cleanup after 90 days

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'subscription_cancelled',
        resourceType: 'subscription',
        resourceId: subscription.id,
        changes: JSON.stringify({
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          plan: subscription.plan,
          reason: reason || 'User initiated cancellation',
          feedback: feedback || null,
          cancelledAt: new Date().toISOString(),
          effectiveDate: new Date(periodEnd * 1000).toISOString(),
        }),
        expiresAt,
      },
    });

    // Send cancellation email
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    const effectiveDate = new Date(periodEnd * 1000)
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: 'MorphDB Subscription Cancellation Confirmed',
        html: getSubscriptionCancelledEmailHTML(profile.name, effectiveDate),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription cancelled successfully',
        effectiveDate,
        cancelledAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cancel Subscription Error]', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription. Please try again.' },
      { status: 500 }
    );
  }
}
