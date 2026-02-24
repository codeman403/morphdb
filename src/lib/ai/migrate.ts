import OpenAI from 'openai';

export type SourceDialect = 'sql_server' | 'oracle' | 'mysql' | 'postgresql';
export type TargetDialect = 'snowflake_dbt' | 'postgresql' | 'bigquery' | 'redshift';

interface MigrationResult {
  translatedSql: string;
  changes: string[];
  warnings: string[];
  tokensUsed: number;
  durationMs: number;
}

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

export async function translateSql(
  sourceSql: string,
  sourceDialect: SourceDialect,
  targetDialect: TargetDialect,
): Promise<MigrationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const openai = new OpenAI({ apiKey });
  const start = Date.now();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: buildSystemPrompt(sourceDialect, targetDialect) },
      { role: 'user', content: sourceSql },
    ],
  });

  const durationMs = Date.now() - start;
  const raw = completion.choices[0]?.message?.content ?? '';
  const tokensUsed = completion.usage?.total_tokens ?? 0;
  const { sql, changes, warnings } = parseResponse(raw);

  return {
    translatedSql: sql,
    changes,
    warnings,
    tokensUsed,
    durationMs,
  };
}
