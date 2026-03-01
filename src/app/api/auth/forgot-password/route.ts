import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { validateEmail } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = await rateLimit(`forgot-password:${ip}`, 3, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a minute.' },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Use Supabase's built-in password reset functionality
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      console.error('[Password Reset Error]', error);
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Password reset email sent successfully.' },
      { status: 200 }
    );
  } catch (e) {
    console.error('[Forgot Password Error]', e);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
