import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ batchId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { batchId } = await params;

    const batch = await prisma.migrationBatch.findUnique({
      where: { id: batchId },
      include: { results: true },
    });

    if (!batch || batch.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ batch });
  } catch (e) {
    console.error('[Batch Detail Error]', e);
    return NextResponse.json({ error: 'Failed to load batch.' }, { status: 500 });
  }
}
