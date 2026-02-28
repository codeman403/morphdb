import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';
import { anonymizeIpAddress, maskUserAgent } from '@/lib/pii-utils';
import { sendEmail, getTicketClosedEmailHTML } from '@/lib/email';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const ip = getClientIp(req.headers);

  const logContext = {
    timestamp: new Date().toISOString(),
    requestId,
    level: 'info',
    action: 'admin_close_ticket',
    ipAddress: anonymizeIpAddress(ip),
    userAgent: maskUserAgent(req.headers.get('user-agent') ?? undefined),
  };

  try {
    const { ok } = await rateLimit(`admin-close-ticket:${ip}`, 30, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      console.log(JSON.stringify({
        ...logContext,
        level: 'warn',
        action: 'admin_close_ticket_unauthorized',
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

    const { ticketId, sendNotification = true } = body as { ticketId?: string; sendNotification?: boolean };

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    // Get ticket details
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.status === 'closed') {
      return NextResponse.json({ error: 'Ticket is already closed' }, { status: 400 });
    }

    // Update ticket status
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'closed',
        updatedAt: new Date(),
      },
    });

    // Send closure notification email if enabled
    if (sendNotification && ticket.email) {
      const ticketName = ticket.name || ticket.email.split('@')[0] || 'there';
      
      const emailResult = await sendEmail({
         to: ticket.email,
         subject: `MorphDB Support Ticket Closed: ${ticket.subject}`,
         html: getTicketClosedEmailHTML(ticketName, ticket.id, ticket.subject),
       }).catch((e) => {
        console.error('[Close Ticket Email Error]', e);
        return { success: false, error: e };
      });

      if (!emailResult.success) {
        console.error('[Close Ticket Notification Error]', emailResult.error);
        // Don't fail the request, just log the error
      }
    }

    // Log audit trail
    await createAuditLog({
      action: 'close_support_ticket',
      userId: user.id,
      resourceType: 'support_ticket',
      resourceId: ticketId,
      changes: {
        before: { status: ticket.status },
        after: { status: updatedTicket.status },
        userEmail: ticket.email,
        sendNotification,
      },
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
    }).catch(() => {
      // Don't fail if audit log fails
    });

    console.log(JSON.stringify({
      ...logContext,
      level: 'info',
      action: 'admin_close_ticket_success',
      adminId: user.id,
      ticketId,
      userEmail: ticket.email,
      notificationSent: sendNotification,
      durationMs: Date.now() - startTime,
    }));

    return NextResponse.json({
      success: true,
      message: 'Ticket closed successfully',
      ticketId: updatedTicket.id,
      notificationSent: sendNotification,
    });
  } catch (e) {
    console.error('[Close Ticket Error]', {
      requestId,
      error: e instanceof Error ? e.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to close ticket' }, { status: 500 });
  }
}
