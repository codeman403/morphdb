import { NextRequest, NextResponse } from 'next/server';
import { translateSql, SourceDialect, TargetDialect, AIModel } from '@/lib/ai/migrate';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

const VALID_SOURCES: SourceDialect[] = ['sql_server', 'oracle', 'mysql', 'postgresql'];
const VALID_TARGETS: TargetDialect[] = ['snowflake_dbt', 'postgresql', 'bigquery', 'redshift'];

const DEMO_MAX_CHARS = 2_000;
const BETA_MAX_CHARS = 10_000;
const DEMO_RATE_LIMIT = 5;
const BETA_RATE_LIMIT = 10;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const body = await req.json();
    const { sql, sourceDialect, targetDialect, model, mode } = body;

    const isDemo = mode === 'demo';

    const limit = isDemo ? DEMO_RATE_LIMIT : BETA_RATE_LIMIT;
    const { ok } = rateLimit(`migrate:${ip}`, limit, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a minute.' },
        { status: 429 }
      );
    }

    if (!isDemo) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Sign in required for Developer Beta.' }, { status: 401 });
      }
    }

    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      return NextResponse.json({ error: 'SQL input is required.' }, { status: 400 });
    }

    const maxChars = isDemo ? DEMO_MAX_CHARS : BETA_MAX_CHARS;
    if (sql.length > maxChars) {
      return NextResponse.json(
        { error: `SQL input too long (max ${maxChars.toLocaleString()} chars).${isDemo ? ' Sign up for 10,000 char limit.' : ''}` },
        { status: 400 }
      );
    }

    if (!VALID_SOURCES.includes(sourceDialect)) {
      return NextResponse.json({ error: `Invalid source dialect. Use: ${VALID_SOURCES.join(', ')}` }, { status: 400 });
    }

    if (!VALID_TARGETS.includes(targetDialect)) {
      return NextResponse.json({ error: `Invalid target dialect. Use: ${VALID_TARGETS.join(', ')}` }, { status: 400 });
    }

    const validModels: AIModel[] = ['gpt-4o-mini', 'claude-haiku', 'claude-sonnet'];
    const selectedModel = isDemo ? 'gpt-4o-mini' : (validModels.includes(model) ? model : undefined);
    const result = await translateSql(sql, sourceDialect, targetDialect, selectedModel);

    return NextResponse.json(result);
  } catch (e) {
    console.error('[Migrate API Error]', e);
    const message = e instanceof Error ? e.message : 'Translation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
