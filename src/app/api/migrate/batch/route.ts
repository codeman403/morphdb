import { NextRequest, NextResponse } from 'next/server';
import { translateSql, SourceDialect, TargetDialect, AIModel } from '@/lib/ai/migrate';
import { parseSqlFile } from '@/lib/ai/parser';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { getUserTier } from '@/lib/tier';
import { checkQuota, incrementUsage } from '@/lib/usage';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 500_000;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = rateLimit(`migrate-batch:${ip}`, 5, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required for batch migration.' }, { status: 401 });
    }

    const tierLimits = await getUserTier(user.id);

    const quota = await checkQuota(user.id, tierLimits.tier);
    if (!quota.ok) {
      return NextResponse.json({ error: quota.error }, { status: 403 });
    }

    const formData = await req.formData();
    const sourceDialect = formData.get('sourceDialect') as SourceDialect | null;
    const targetDialect = formData.get('targetDialect') as TargetDialect | null;
    const model = formData.get('model') as AIModel | null;
    const files = formData.getAll('files') as File[];
    const rawSql = formData.get('sql') as string | null;

    if (!sourceDialect || !targetDialect) {
      return NextResponse.json({ error: 'Source and target dialects are required.' }, { status: 400 });
    }

    const validModels: AIModel[] = ['gpt-4o-mini', 'claude-haiku', 'claude-sonnet'];
    if (model && !validModels.includes(model)) {
      return NextResponse.json(
        { error: 'Invalid model selected.' },
        { status: 400 },
      );
    }

    if (model && !tierLimits.allowedModels.includes(model)) {
      return NextResponse.json(
        { error: `Model "${model}" not available on ${tierLimits.tier} plan. Upgrade to Pro for all models.` },
        { status: 403 }
      );
    }

    if (files.length > tierLimits.filesPerBatch) {
      return NextResponse.json(
        { error: `${tierLimits.tier === 'free' ? 'Free' : tierLimits.tier} plan allows up to ${tierLimits.filesPerBatch} files per batch. Upgrade for more.` },
        { status: 400 }
      );
    }

    let allStatements: { fileName: string; sql: string; name: string; type: string }[] = [];

    if (rawSql && rawSql.trim()) {
      const parsed = parseSqlFile(rawSql);
      allStatements = parsed.map(s => ({ fileName: 'input.sql', sql: s.sql, name: s.name, type: s.type }));
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File ${file.name} exceeds 500KB limit.` }, { status: 400 });
      }
      let content: string;
      try {
        content = await file.text();
      } catch {
        return NextResponse.json({ error: `Failed to read file ${file.name}.` }, { status: 400 });
      }
      const parsed = parseSqlFile(content);
      allStatements.push(...parsed.map(s => ({
        fileName: file.name,
        sql: s.sql,
        name: s.name,
        type: s.type,
      })));
    }

    if (allStatements.length === 0) {
      return NextResponse.json({ error: 'No SQL statements found.' }, { status: 400 });
    }

    const maxStatements = tierLimits.filesPerBatch === Infinity ? 500 : tierLimits.filesPerBatch * 5;
    if (allStatements.length > maxStatements) {
      return NextResponse.json({
        error: `Your ${tierLimits.tier} plan supports up to ${maxStatements} statements per batch. Found ${allStatements.length}. Upgrade for more.`,
      }, { status: 400 });
    }

    const results: {
      fileName: string;
      name: string;
      type: string;
      originalSql: string;
      translatedSql: string;
      changes: string[];
      warnings: string[];
      tokensUsed: number;
      durationMs: number;
      status: 'success' | 'error';
      error?: string;
    }[] = [];
    const batchSize = 3;

    for (let i = 0; i < allStatements.length; i += batchSize) {
      const batch = allStatements.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (stmt) => {
          try {
            const result = await translateSql(stmt.sql, sourceDialect, targetDialect, model ?? undefined);
            return {
              fileName: stmt.fileName,
              name: stmt.name,
              type: stmt.type,
              originalSql: stmt.sql,
              translatedSql: result.translatedSql,
              changes: result.changes,
              warnings: result.warnings,
              tokensUsed: result.tokensUsed,
              durationMs: result.durationMs,
              status: 'success' as const,
            };
          } catch (e) {
            return {
              fileName: stmt.fileName,
              name: stmt.name,
              type: stmt.type,
              originalSql: stmt.sql,
              translatedSql: '',
              changes: [],
              warnings: [],
              tokensUsed: 0,
              durationMs: 0,
              status: 'error' as const,
              error: e instanceof Error ? e.message : 'Translation failed',
            };
          }
        })
      );
      results.push(...batchResults);
    }

    const totalTokens = results.reduce((a, r) => a + r.tokensUsed, 0);
    const totalDuration = results.reduce((a, r) => a + r.durationMs, 0);
    const successCount = results.filter(r => r.status === 'success').length;

    try {
      await prisma.migrationBatch.create({
        data: {
          userId: user.id,
          sourceDialect,
          targetDialect,
          model: model ?? 'gpt-4o-mini',
          totalStatements: results.length,
          successCount,
          failedCount: results.length - successCount,
          totalTokens,
          totalDurationMs: totalDuration,
          results: {
            create: results.map(r => ({
              fileName: r.fileName,
              statementName: r.name,
              statementType: r.type,
              originalSql: r.originalSql,
              translatedSql: r.translatedSql || null,
              changes: r.changes,
              warnings: r.warnings,
              tokensUsed: r.tokensUsed,
              durationMs: r.durationMs,
              status: r.status,
              error: r.status === 'error' ? (r as { error?: string }).error ?? null : null,
            })),
          },
        },
      });
    } catch (e) {
      console.error('[Migration History Save Error]', e);
    }

    await incrementUsage(user.id, successCount, totalTokens);

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: results.length - successCount,
        totalTokens,
        totalDuration,
      },
    });
  } catch (e) {
    console.error('[Batch Migrate Error]', e);
    return NextResponse.json({ error: 'Batch migration failed.' }, { status: 500 });
  }
}
