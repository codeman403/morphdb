import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasUsedTrial } from '@/lib/tier';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ hasUsedTrial: false });
    }

    const used = await hasUsedTrial(user.id);
    return NextResponse.json({ hasUsedTrial: used });
  } catch (e) {
    return NextResponse.json({ hasUsedTrial: false });
  }
}
