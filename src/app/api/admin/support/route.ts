import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sendEmail, getTicketStatusUpdateEmailHTML } from '@/lib/email';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = await rateLimit(`admin-support:${ip}`, 20, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ tickets });
  } catch (e) {
    console.error('[Admin Support Tickets Error]', e);
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = await rateLimit(`admin-support:${ip}`, 20, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }
    const { id, status } = body as { id?: string; status?: string };

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required.' }, { status: 400 });
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: { status },
    });

    // Send status update email to customer (fire-and-forget)
    const userProfile = updatedTicket.userId 
      ? await prisma.profile.findUnique({ where: { id: updatedTicket.userId } })
      : null;
    
    const userName = userProfile?.name || updatedTicket.name;
    sendEmail({
      to: updatedTicket.email,
      subject: `Support Ticket Update: ${status.replace('_', ' ').toUpperCase()}`,
      html: getTicketStatusUpdateEmailHTML(userName, id, status),
    }).catch((e) => console.error('[Ticket Status Update Email Error]', e));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[Admin Support Ticket Update Error]', e);
    return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 });
  }
}
