import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ firstName: null }, { status: 401 });
    }
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    const firstName = profile?.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? null;
    return NextResponse.json({ firstName });
  } catch {
    return NextResponse.json({ firstName: null }, { status: 500 });
  }
}
