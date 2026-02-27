import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getTrialExpiringEmailHTML } from '@/lib/email';

/**
 * POST /api/emails/trial-expiring
 * Trigger trial expiring warning email
 */
export async function POST(req: NextRequest) {
  try {
    const { email, firstName, hoursRemaining = 24 } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      subject: 'Your MorphDB Trial Expires Soon - Limited Time Offer Inside',
      html: getTrialExpiringEmailHTML(firstName, hoursRemaining),
    });

    if (!result.success) {
      console.error('Failed to send trial expiring email:', result.error);
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
    console.error('Error sending trial expiring email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
