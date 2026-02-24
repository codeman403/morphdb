import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = rateLimit(`signin:${ip}`, 5, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a minute.' }, { status: 429 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const country = req.headers.get('x-vercel-ip-country') ?? null;
    const userAgent = req.headers.get('user-agent') ?? null;

    prisma.loginLog.create({
      data: {
        userId: data.user.id,
        email: data.user.email,
        ip,
        country,
        userAgent,
      },
    }).catch((e) => console.error('[Login Log Error]', e));

    return NextResponse.json({ success: true, user: data.user }, { status: 200 });
  } catch (e) {
    console.error('[Signin Error]', e);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
