import { NextRequest, NextResponse } from 'next/server';
import { translateSql, SourceDialect, TargetDialect, AIModel } from '@/lib/ai/migrate';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { getUserTier } from '@/lib/tier';

const VALID_SOURCES: SourceDialect[] = ['sql_server', 'oracle', 'mysql', 'postgresql'];
const VALID_TARGETS: TargetDialect[] = ['snowflake_dbt', 'postgresql', 'bigquery', 'redshift'];

const DEMO_MAX_CHARS = 2_000;
const DEMO_RATE_LIMIT = 5;
const AUTH_RATE_LIMIT = 10;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const body = await req.json();
    const { sql, sourceDialect, targetDialect, model, mode } = body;

    const isDemo = mode === 'demo';

    const limit = isDemo ? DEMO_RATE_LIMIT : AUTH_RATE_LIMIT;
    const { ok } = await rateLimit(`migrate:${ip}`, limit, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a minute.' },
        { status: 429 }
      );
    }

    let tierLimits = null;
    if (!isDemo) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
      }
      tierLimits = await getUserTier(user.id);
    }

    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      return NextResponse.json({ error: 'SQL input is required.' }, { status: 400 });
    }

    const maxChars = isDemo ? DEMO_MAX_CHARS : (tierLimits?.maxChars ?? 10_000);
    if (sql.length > maxChars) {
      return NextResponse.json(
        { error: `SQL input too long (max ${maxChars.toLocaleString()} chars).${isDemo ? ' Sign up for higher limits.' : ''}` },
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
    let selectedModel: AIModel = 'gpt-4o-mini';
    if (isDemo) {
      selectedModel = 'gpt-4o-mini';
    } else if (tierLimits && validModels.includes(model)) {
      if (!tierLimits.allowedModels.includes(model)) {
        return NextResponse.json(
          { error: `Model "${model}" not available on ${tierLimits.tier} plan. Upgrade to Pro for all models.` },
          { status: 403 }
        );
      }
      selectedModel = model;
    }

    const result = await translateSql(sql, sourceDialect, targetDialect, selectedModel);
    return NextResponse.json({ ...result, tier: tierLimits?.tier ?? 'demo' });
  } catch (e) {
    console.error('[Migrate API Error]', e);
    const message = e instanceof Error ? e.message : 'Translation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
