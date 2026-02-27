import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getTrialStartedEmailHTML } from '@/lib/email';

/**
 * POST /api/emails/trial-started
 * Trigger trial started email
 */
export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      subject: 'Your Free 3-Day Trial is Active - MorphDB',
      html: getTrialStartedEmailHTML(firstName),
    });

    if (!result.success) {
      console.error('Failed to send trial started email:', result.error);
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
    console.error('Error sending trial started email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
