import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getWelcomeEmailHTML } from '@/lib/email';

/**
 * POST /api/emails/welcome
 * Trigger welcome email for a user
 */
export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      subject: 'Welcome to MorphDB - Your AI Database Migration Co-Pilot',
      html: getWelcomeEmailHTML(firstName),
    });

    if (!result.success) {
      console.error('Failed to send welcome email:', result.error);
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
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
