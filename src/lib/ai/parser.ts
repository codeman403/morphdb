export interface ParsedStatement {
  index: number;
  type: 'CREATE_TABLE' | 'CREATE_VIEW' | 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALTER' | 'DROP' | 'PROCEDURE' | 'FUNCTION' | 'TRIGGER' | 'OTHER';
  name: string;
  sql: string;
}

const TYPE_PATTERNS: [RegExp, ParsedStatement['type']][] = [
  [/^\s*CREATE\s+(OR\s+REPLACE\s+)?TABLE/i, 'CREATE_TABLE'],
  [/^\s*CREATE\s+(OR\s+REPLACE\s+)?VIEW/i, 'CREATE_VIEW'],
  [/^\s*CREATE\s+(OR\s+REPLACE\s+)?PROC(EDURE)?/i, 'PROCEDURE'],
  [/^\s*CREATE\s+(OR\s+REPLACE\s+)?FUNCTION/i, 'FUNCTION'],
  [/^\s*CREATE\s+(OR\s+REPLACE\s+)?TRIGGER/i, 'TRIGGER'],
  [/^\s*ALTER/i, 'ALTER'],
  [/^\s*DROP/i, 'DROP'],
  [/^\s*INSERT/i, 'INSERT'],
  [/^\s*UPDATE/i, 'UPDATE'],
  [/^\s*DELETE/i, 'DELETE'],
  [/^\s*SELECT/i, 'SELECT'],
];

function detectType(sql: string): ParsedStatement['type'] {
  for (const [pattern, type] of TYPE_PATTERNS) {
    if (pattern.test(sql)) return type;
  }
  return 'OTHER';
}

function extractName(sql: string, type: ParsedStatement['type']): string {
  const namePatterns: Record<string, RegExp> = {
    CREATE_TABLE: /CREATE\s+(?:OR\s+REPLACE\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:\[?[\w.]+\]?\.)?\[?([\w]+)\]?/i,
    CREATE_VIEW: /CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(?:\[?[\w.]+\]?\.)?\[?([\w]+)\]?/i,
    PROCEDURE: /CREATE\s+(?:OR\s+REPLACE\s+)?PROC(?:EDURE)?\s+(?:\[?[\w.]+\]?\.)?\[?([\w]+)\]?/i,
    FUNCTION: /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:\[?[\w.]+\]?\.)?\[?([\w]+)\]?/i,
    TRIGGER: /CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER\s+(?:\[?[\w.]+\]?\.)?\[?([\w]+)\]?/i,
    ALTER: /ALTER\s+\w+\s+(?:\[?[\w.]+\]?\.)?\[?([\w]+)\]?/i,
    DROP: /DROP\s+\w+\s+(?:IF\s+EXISTS\s+)?(?:\[?[\w.]+\]?\.)?\[?([\w]+)\]?/i,
  };

  const pattern = namePatterns[type];
  if (pattern) {
    const match = sql.match(pattern);
    if (match?.[1]) return match[1];
  }
  return `statement_${type.toLowerCase()}`;
}

export function parseSqlFile(content: string): ParsedStatement[] {
  const statements: ParsedStatement[] = [];
  const raw = content
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  const parts = raw.split(/;\s*(?:\r?\n|$)/).map(s => s.trim()).filter(Boolean);

  for (let i = 0; i < parts.length; i++) {
    const sql = parts[i];
    if (sql.length < 3) continue;

    const type = detectType(sql);
    const baseName = extractName(sql, type);
    const name = baseName + (statements.some(s => s.name === baseName) ? `_${i + 1}` : '');

    statements.push({ index: i, type, name, sql: sql + ';' });
  }

  return statements;
}

export function getStatementSummary(statements: ParsedStatement[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const s of statements) {
    summary[s.type] = (summary[s.type] ?? 0) + 1;
  }
  return summary;
}
