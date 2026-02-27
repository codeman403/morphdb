import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
  });
  
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] No signature header');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('[Stripe Webhook] Received event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan ?? 'pro';

        console.log('[Stripe Webhook] Checkout completed:', { userId, plan, subscription: session.subscription });

        if (userId && session.subscription) {
          const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);
          const periodEnd = typeof (stripeSub as any).current_period_end === 'number'
            ? (stripeSub as any).current_period_end
            : ((stripeSub as any) as { current_period_end?: number }).current_period_end;
          if (!periodEnd) {
            console.error('[Stripe Webhook] Missing current_period_end on subscription:', stripeSub.id);
            break;
          }
          
          const result = await prisma.subscription.upsert({
            where: { userId },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              plan,
              status: 'active',
              currentPeriodEnd: new Date(periodEnd * 1000),
            },
            create: {
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              plan,
              status: 'active',
              currentPeriodEnd: new Date(periodEnd * 1000),
            },
          });
          
          console.log('[Stripe Webhook] Subscription updated:', result);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const periodEnd = typeof (stripeSub as any).current_period_end === 'number'
          ? (stripeSub as any).current_period_end
          : ((stripeSub as any) as { current_period_end?: number }).current_period_end;
        
        console.log('[Stripe Webhook] Subscription updated:', { id: stripeSub.id, status: stripeSub.status });
        
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSub.id },
          data: {
            status: stripeSub.status,
            ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;
        
        console.log('[Stripe Webhook] Subscription deleted:', stripeSub.id);
        
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSub.id },
          data: {
            status: 'canceled',
          },
        });
        break;
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }
  } catch (err) {
    console.error('[Stripe Webhook] Processing error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
