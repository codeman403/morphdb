import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = rateLimit(`signup:${ip}`, 3, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a minute.' }, { status: 429 });
    }

    const { email, password, name, company } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, company } },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      await prisma.profile.upsert({
        where: { id: data.user.id },
        update: { name, company },
        create: { id: data.user.id, email, name, company },
      });
    }

    return NextResponse.json({ success: true, user: data.user }, { status: 201 });
  } catch (e) {
    console.error('[Signup Error]', e);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
