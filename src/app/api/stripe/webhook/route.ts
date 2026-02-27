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
    // Check for duplicate event processing (idempotency)
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    });

    if (existingEvent) {
      console.log('[Stripe Webhook] Duplicate event detected, skipping:', event.id);
      return NextResponse.json({ received: true });
    }

    // Record event as processing
    const webhookRecord = await prisma.webhookEvent.create({
      data: {
        eventId: event.id,
        eventType: event.type,
        processed: false,
      },
    });

    let processError: string | null = null;

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan;

          if (!userId) {
            processError = 'Missing userId in metadata';
            console.error('[Stripe Webhook] ' + processError);
            break;
          }

          if (!plan || !['pro', 'design_partner', 'enterprise'].includes(plan)) {
            processError = `Invalid plan in metadata: ${plan}`;
            console.error('[Stripe Webhook] ' + processError);
            break;
          }

          console.log('[Stripe Webhook] Checkout completed:', { userId, plan, subscription: session.subscription });

          if (userId && session.subscription) {
            const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);
            const periodEnd = typeof (stripeSub as any).current_period_end === 'number'
              ? (stripeSub as any).current_period_end
              : ((stripeSub as any) as { current_period_end?: number }).current_period_end;
            if (!periodEnd) {
              processError = `Missing current_period_end on subscription: ${stripeSub.id}`;
              console.error('[Stripe Webhook] ' + processError);
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
    } catch (innerErr) {
      processError = innerErr instanceof Error ? innerErr.message : String(innerErr);
      console.error('[Stripe Webhook] Processing error:', innerErr);
      
      // Update webhook record with error
      await prisma.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          error: processError,
          processed: false,
        },
      });
      
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }

    // Mark event as successfully processed
    await prisma.webhookEvent.update({
      where: { id: webhookRecord.id },
      data: {
        processed: !processError,
        ...(processError ? { error: processError } : {}),
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Stripe Webhook] Database error:', err);
    
    // Try to record the database error
    try {
      await prisma.webhookEvent.create({
        data: {
          eventId: event.id,
          eventType: event.type,
          processed: false,
          error: `Database error: ${errorMsg}`,
        },
      });
    } catch (dbErr) {
      console.error('[Stripe Webhook] Failed to record error in database:', dbErr);
    }
    
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
