import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: 'pro',
        status: 'active',
        trialEndsAt: null,
      },
      create: {
        userId,
        plan: 'pro',
        status: 'active',
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[Grant Pro Error]', e);
    return NextResponse.json({ error: 'Failed to grant Pro' }, { status: 500 });
  }
}
