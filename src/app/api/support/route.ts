import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = rateLimit(`support:${ip}`, 5, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { name, email, subject, description } = body;

    if (!name || !email || !subject || !description) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    await prisma.$connect();

    await prisma.$executeRaw`
      INSERT INTO support_tickets (user_id, name, email, subject, description, status, priority, created_at, updated_at)
      VALUES (
        ${user?.id ?? null},
        ${name},
        ${email},
        ${subject},
        ${description},
        'open',
        'medium',
        NOW(),
        NOW()
      )
    `;

    console.log(`[Support Ticket] New ticket from ${email}: ${subject}`);

    return NextResponse.json({ success: true, message: 'Support request submitted successfully.' });
  } catch (e) {
    console.error('[Support Ticket Error]', e);
    return NextResponse.json({ error: 'Failed to submit support request.' }, { status: 500 });
  }
}
