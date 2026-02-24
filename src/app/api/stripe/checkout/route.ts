import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const PLANS: Record<string, { priceId: string; name: string }> = {
  design_partner: {
    priceId: process.env.STRIPE_DESIGN_PARTNER_PRICE_ID ?? '',
    name: 'Design Partner',
  },
};

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
  });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan = 'design_partner' } = await req.json();
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/#pricing`,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e) {
    console.error('[Stripe Checkout Error]', e);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}
