import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getSupportTicketEmailHTML, getAdminSupportNotificationEmailHTML } from '@/lib/email';

/**
 * POST /api/emails/support-ticket
 * Trigger support ticket confirmation email to user and notification to admin
 */
export async function POST(req: NextRequest) {
  try {
    const { email, firstName, ticketId, subject, adminEmail } = await req.json();

    if (!email || !ticketId || !subject) {
      return NextResponse.json(
        { error: 'Email, ticketId, and subject are required' },
        { status: 400 }
      );
    }

    // Send confirmation email to user
    const userEmailResult = await sendEmail({
      to: email,
      subject: `Support Ticket Received - MorphDB #${ticketId}`,
      html: getSupportTicketEmailHTML(firstName, ticketId, subject),
    });

    if (!userEmailResult.success) {
      console.error('Failed to send support ticket email:', userEmailResult.error);
    }

    // Send notification to admin if adminEmail is provided
    if (adminEmail) {
      const adminEmailResult = await sendEmail({
        to: adminEmail,
        subject: `New Support Ticket - ${subject}`,
        html: getAdminSupportNotificationEmailHTML(ticketId, subject, email),
      });

      if (!adminEmailResult.success) {
        console.error('Failed to send admin notification:', adminEmailResult.error);
      }
    }

    // Return success if at least user email was sent
    if (!userEmailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send confirmation email', details: userEmailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userEmailId: userEmailResult.messageId,
    });
  } catch (error) {
    console.error('Error sending support ticket email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
