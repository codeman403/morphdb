import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const LAST_ACTIVITY_COOKIE = 'morphdb_last_activity';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const origin = req.nextUrl.origin;
  const response = NextResponse.redirect(new URL('/', origin), { status: 302 });
  // Clear the last activity cookie on logout
  response.cookies.delete(LAST_ACTIVITY_COOKIE);
  return response;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const origin = req.nextUrl.origin;
  const response = NextResponse.redirect(new URL('/', origin), { status: 302 });
  // Clear the last activity cookie on logout
  response.cookies.delete(LAST_ACTIVITY_COOKIE);
  return response;
}
