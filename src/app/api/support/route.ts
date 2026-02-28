import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { anonymizeIpAddress, maskUserAgent } from '@/lib/pii-utils';
import { sendEmail, getSupportTicketEmailHTML, getAdminSupportNotificationEmailHTML } from '@/lib/email';

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const ip = getClientIp(req.headers)

  const logContext = {
    timestamp: new Date().toISOString(),
    requestId,
    level: 'info',
    action: 'support_ticket_create',
    ipAddress: anonymizeIpAddress(ip),
    userAgent: maskUserAgent(req.headers.get('user-agent') ?? undefined),
  }

  try {
    const { ok } = await rateLimit(`support:${ip}`, 5, 60_000);
    if (!ok) {
      console.log(JSON.stringify({
        ...logContext,
        level: 'warn',
        action: 'support_ticket_rate_limit',
      }))
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }
    const { name, email, subject, description } = body as { name?: string; email?: string; subject?: string; description?: string };

    if (!name || !email || !subject || !description) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user?.id ?? null,
        name,
        email,
        subject,
        description,
        status: 'open',
        priority: 'medium',
      },
    });

     // Send confirmation email to user (fire-and-forget)
     sendEmail({
       to: email,
       subject: `MorphDB Support Request Received: ${subject}`,
       html: getSupportTicketEmailHTML(name, ticket.id, subject),
     }).catch((e) => console.error('[Support Email Error]', e));

     // Send admin notification email (fire-and-forget)
     const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0]?.trim();
     if (adminEmail) {
       sendEmail({
         to: adminEmail,
         subject: `MorphDB: New Support Ticket - ${subject}`,
         html: getAdminSupportNotificationEmailHTML(ticket.id, subject, email),
       }).catch((e) => console.error('[Admin Notification Email Error]', e));
     }

    // Structured logging for support ticket
    console.log(JSON.stringify({
      ...logContext,
      level: 'info',
      action: 'support_ticket_created',
      ticketId: ticket.id,
      subject,
      fromUser: user?.id ? true : false,
      durationMs: Date.now() - startTime,
    }))

    return NextResponse.json({ success: true, message: 'Support request submitted successfully.' });
  } catch (e) {
    console.error('[Support Ticket Error]', {
      requestId,
      error: e instanceof Error ? e.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to submit support request.' }, { status: 500 });
  }
}
