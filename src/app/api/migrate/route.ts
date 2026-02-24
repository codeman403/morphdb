import { NextRequest, NextResponse } from 'next/server';
import { translateSql, SourceDialect, TargetDialect } from '@/lib/ai/migrate';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const VALID_SOURCES: SourceDialect[] = ['sql_server', 'oracle', 'mysql', 'postgresql'];
const VALID_TARGETS: TargetDialect[] = ['snowflake_dbt', 'postgresql', 'bigquery', 'redshift'];

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { ok } = rateLimit(`migrate:${ip}`, 10, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { sql, sourceDialect, targetDialect } = body;

    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      return NextResponse.json({ error: 'SQL input is required.' }, { status: 400 });
    }

    if (sql.length > 10_000) {
      return NextResponse.json({ error: 'SQL input too long (max 10,000 chars).' }, { status: 400 });
    }

    if (!VALID_SOURCES.includes(sourceDialect)) {
      return NextResponse.json({ error: `Invalid source dialect. Use: ${VALID_SOURCES.join(', ')}` }, { status: 400 });
    }

    if (!VALID_TARGETS.includes(targetDialect)) {
      return NextResponse.json({ error: `Invalid target dialect. Use: ${VALID_TARGETS.join(', ')}` }, { status: 400 });
    }

    const result = await translateSql(sql, sourceDialect, targetDialect);

    return NextResponse.json(result);
  } catch (e) {
    console.error('[Migrate API Error]', e);
    const message = e instanceof Error ? e.message : 'Translation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
