import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';
import { anonymizeIpAddress, maskUserAgent } from '@/lib/pii-utils';
import { sendEmail, getWelcomeEmailHTML } from '@/lib/email';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const ip = getClientIp(req.headers);

  const logContext = {
    timestamp: new Date().toISOString(),
    requestId,
    level: 'info',
    action: 'admin_send_welcome_email',
    ipAddress: anonymizeIpAddress(ip),
    userAgent: maskUserAgent(req.headers.get('user-agent') ?? undefined),
  };

  try {
    const { ok } = await rateLimit(`admin-send-email:${ip}`, 20, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      console.log(JSON.stringify({
        ...logContext,
        level: 'warn',
        action: 'admin_send_email_unauthorized',
        userEmail: user?.email,
      }));
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { userId } = body as { userId?: string };

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user profile
    const userProfile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!userProfile || !userProfile.email) {
      return NextResponse.json({ error: 'User not found or no email on file' }, { status: 404 });
    }

    // Send welcome email
    const emailResult = await sendEmail({
      to: userProfile.email,
      subject: 'Welcome to MorphDB! 🎉',
      html: getWelcomeEmailHTML(userProfile.name ?? undefined),
    });

    if (!emailResult.success) {
      console.error('[Send Welcome Email Error]', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    // Log audit trail
    await createAuditLog({
      action: 'send_welcome_email',
      userId: user.id,
      resourceType: 'email',
      resourceId: userId,
      changes: {
        targetUserId: userId,
        targetEmail: userProfile.email,
        messageId: emailResult.messageId,
      },
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
    }).catch(() => {
      // Don't fail if audit log fails
    });

    console.log(JSON.stringify({
      ...logContext,
      level: 'info',
      action: 'admin_send_welcome_email_success',
      adminId: user.id,
      targetUserId: userId,
      targetEmail: userProfile.email,
      messageId: emailResult.messageId,
      durationMs: Date.now() - startTime,
    }));

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      email: userProfile.email,
      messageId: emailResult.messageId,
    });
  } catch (e) {
    console.error('[Send Welcome Email Error]', {
      requestId,
      error: e instanceof Error ? e.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
}
