import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const origin = req.nextUrl.origin;
  return NextResponse.redirect(new URL('/', origin), { status: 302 });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const origin = req.nextUrl.origin;
  return NextResponse.redirect(new URL('/', origin), { status: 302 });
}
