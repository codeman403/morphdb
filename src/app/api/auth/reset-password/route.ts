import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validatePassword } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const { password, code } = await req.json();

    if (!password || !code) {
      return NextResponse.json(
        { error: 'Password and reset code are required.' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] || 'Password does not meet requirements.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Exchange the reset code for a session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.session?.user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new password reset.' },
        { status: 401 }
      );
    }

    // Update the password using the authenticated session
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      console.error('[Password Update Error]', updateError);
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Password updated successfully.' },
      { status: 200 }
    );
  } catch (e) {
    console.error('[Reset Password Error]', e);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
