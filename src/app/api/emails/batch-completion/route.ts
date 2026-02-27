import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getBatchCompletionEmailHTML } from '@/lib/email';

/**
 * POST /api/emails/batch-completion
 * Trigger batch migration completion email
 */
export async function POST(req: NextRequest) {
  try {
    const { email, firstName, batchId, successCount, failureCount } = await req.json();

    if (!email || !batchId || typeof successCount !== 'number' || typeof failureCount !== 'number') {
      return NextResponse.json(
        { error: 'Email, batchId, successCount, and failureCount are required' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: `Your Batch Migration is Complete - MorphDB`,
      html: getBatchCompletionEmailHTML(firstName, batchId, successCount, failureCount),
    });

    if (!result.success) {
      console.error('Failed to send batch completion email:', result.error);
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
    console.error('Error sending batch completion email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
