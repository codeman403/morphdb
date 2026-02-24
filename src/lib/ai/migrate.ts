import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type SourceDialect = 'sql_server' | 'oracle' | 'mysql' | 'postgresql';
export type TargetDialect = 'snowflake_dbt' | 'postgresql' | 'bigquery' | 'redshift';
export type AIProvider = 'openai' | 'anthropic';
export type AIModel = 'gpt-4o-mini' | 'claude-haiku' | 'claude-sonnet';

interface MigrationResult {
  translatedSql: string;
  changes: string[];
  warnings: string[];
  tokensUsed: number;
  durationMs: number;
  model: string;
}

const MODEL_MAP: Record<AIModel, { provider: AIProvider; model: string }> = {
  'gpt-4o-mini': { provider: 'openai', model: 'gpt-4o-mini' },
  'claude-haiku': { provider: 'anthropic', model: 'claude-haiku-4-20250414' },
  'claude-sonnet': { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
};

const DIALECT_LABELS: Record<string, string> = {
  sql_server: 'SQL Server (T-SQL)',
  oracle: 'Oracle (PL/SQL)',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  snowflake_dbt: 'Snowflake with dbt Jinja syntax',
  bigquery: 'Google BigQuery',
  redshift: 'Amazon Redshift',
};

function buildSystemPrompt(source: string, target: string): string {
  return `You are MorphDB, an expert database migration AI. Your job is to translate SQL code from ${DIALECT_LABELS[source] ?? source} to ${DIALECT_LABELS[target] ?? target}.

Rules:
1. Translate ALL dialect-specific syntax accurately (functions, types, keywords, conventions).
2. Convert naming from PascalCase/brackets to snake_case where appropriate for the target.
3. If target is "snowflake_dbt", use dbt Jinja syntax: {{ source('schema', 'table') }} for source tables, {{ ref('model') }} for references.
4. Preserve business logic exactly — never add, remove, or alter filtering/aggregation/joins.
5. Add brief SQL comments only where a non-obvious transformation was made.
6. Output ONLY the translated SQL — no explanations, no markdown fences.

After the SQL, on a new line starting with "---CHANGES---", list each transformation made as a bullet point.
After changes, on a new line starting with "---WARNINGS---", list any potential issues or things to verify (empty if none).`;
}

function parseResponse(raw: string): { sql: string; changes: string[]; warnings: string[] } {
  const changesIdx = raw.indexOf('---CHANGES---');
  const warningsIdx = raw.indexOf('---WARNINGS---');

  let sql = raw;
  let changesBlock = '';
  let warningsBlock = '';

  if (changesIdx !== -1) {
    sql = raw.substring(0, changesIdx).trim();
    if (warningsIdx !== -1) {
      changesBlock = raw.substring(changesIdx + 13, warningsIdx).trim();
      warningsBlock = raw.substring(warningsIdx + 14).trim();
    } else {
      changesBlock = raw.substring(changesIdx + 13).trim();
    }
  }

  const parseBullets = (block: string) =>
    block.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

  return {
    sql: sql.replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim(),
    changes: parseBullets(changesBlock),
    warnings: parseBullets(warningsBlock),
  };
}

function getDefaultModel(): AIModel {
  if (process.env.ANTHROPIC_API_KEY) return 'claude-haiku';
  if (process.env.OPENAI_API_KEY) return 'gpt-4o-mini';
  throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.');
}

async function callOpenAI(systemPrompt: string, userContent: string, modelId: string): Promise<{ raw: string; tokens: number }> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const completion = await openai.chat.completions.create({
    model: modelId,
    temperature: 0.1,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  });
  return {
    raw: completion.choices[0]?.message?.content ?? '',
    tokens: completion.usage?.total_tokens ?? 0,
  };
}

async function callAnthropic(systemPrompt: string, userContent: string, modelId: string): Promise<{ raw: string; tokens: number }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const message = await anthropic.messages.create({
    model: modelId,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });
  const textBlock = message.content.find(b => b.type === 'text');
  return {
    raw: textBlock?.text ?? '',
    tokens: (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0),
  };
}

export async function translateSql(
  sourceSql: string,
  sourceDialect: SourceDialect,
  targetDialect: TargetDialect,
  preferredModel?: AIModel,
): Promise<MigrationResult> {
  const aiModel = preferredModel ?? getDefaultModel();
  const { provider, model } = MODEL_MAP[aiModel];

  if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const systemPrompt = buildSystemPrompt(sourceDialect, targetDialect);
  const start = Date.now();

  const { raw, tokens } = provider === 'anthropic'
    ? await callAnthropic(systemPrompt, sourceSql, model)
    : await callOpenAI(systemPrompt, sourceSql, model);

  const durationMs = Date.now() - start;
  const { sql, changes, warnings } = parseResponse(raw);

  return {
    translatedSql: sql,
    changes,
    warnings,
    tokensUsed: tokens,
    durationMs,
    model: aiModel,
  };
}
