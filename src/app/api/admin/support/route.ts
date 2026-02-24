import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const tickets = await prisma.$queryRaw`
      SELECT 
        id,
        user_id as "userId",
        name,
        email,
        subject,
        description,
        status,
        priority,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM support_tickets
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json({ tickets });
  } catch (e) {
    console.error('[Admin Support Tickets Error]', e);
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required.' }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE support_tickets
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[Admin Support Ticket Update Error]', e);
    return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 });
  }
}
