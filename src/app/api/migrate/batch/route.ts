import { NextRequest, NextResponse } from 'next/server';
import { translateSql, SourceDialect, TargetDialect } from '@/lib/ai/migrate';
import { parseSqlFile } from '@/lib/ai/parser';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const MAX_STATEMENTS = 50;
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

    const formData = await req.formData();
    const sourceDialect = formData.get('sourceDialect') as SourceDialect;
    const targetDialect = formData.get('targetDialect') as TargetDialect;
    const files = formData.getAll('files') as File[];
    const rawSql = formData.get('sql') as string | null;

    if (!sourceDialect || !targetDialect) {
      return NextResponse.json({ error: 'Source and target dialects are required.' }, { status: 400 });
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
      const content = await file.text();
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

    if (allStatements.length > MAX_STATEMENTS) {
      return NextResponse.json({
        error: `Developer Beta supports up to ${MAX_STATEMENTS} statements. Found ${allStatements.length}.`,
      }, { status: 400 });
    }

    const results = [];
    const batchSize = 3;

    for (let i = 0; i < allStatements.length; i += batchSize) {
      const batch = allStatements.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (stmt) => {
          try {
            const result = await translateSql(stmt.sql, sourceDialect, targetDialect);
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
