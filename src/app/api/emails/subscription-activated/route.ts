import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getSubscriptionActivatedEmailHTML } from '@/lib/email';

/**
 * POST /api/emails/subscription-activated
 * Trigger subscription activated email
 */
export async function POST(req: NextRequest) {
  try {
    const { email, firstName, planName = 'Pro' } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      subject: `Welcome to MorphDB ${planName} - Subscription Confirmed`,
      html: getSubscriptionActivatedEmailHTML(firstName, planName),
    });

    if (!result.success) {
      console.error('Failed to send subscription activated email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Error sending subscription activated email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
