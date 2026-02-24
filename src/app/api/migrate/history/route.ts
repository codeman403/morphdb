import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const batches = await prisma.migrationBatch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        sourceDialect: true,
        targetDialect: true,
        model: true,
        totalStatements: true,
        successCount: true,
        failedCount: true,
        totalTokens: true,
        totalDurationMs: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ batches });
  } catch (e) {
    console.error('[History Error]', e);
    return NextResponse.json({ error: 'Failed to load history.' }, { status: 500 });
  }
}
