import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { results, targetDialect } = body as { results?: any[]; targetDialect?: string };

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'No results to download.' }, { status: 400 });
    }

    if (results.length === 1) {
      const r = results[0] as { name?: string; translatedSql?: string };
      if (!r.name || !r.translatedSql) {
        return NextResponse.json({ error: 'Invalid result payload.' }, { status: 400 });
      }
      const fileName = `${r.name}_translated.sql`;
      return new NextResponse(r.translatedSql, {
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    const zip = new JSZip();
    const dialectFolder = targetDialect ?? 'translated';
    const folder = zip.folder(dialectFolder);
    if (!folder) {
      return NextResponse.json({ error: 'Failed to initialize archive.' }, { status: 500 });
    }

    const nameCount: Record<string, number> = {};
    for (const r of results as { name?: string; status?: string; translatedSql?: string; type?: string; changes?: unknown[]; tokensUsed?: number }[]) {
      if (!r.name) continue;
      if (r.status !== 'success' || !r.translatedSql) continue;
      const count = (nameCount[r.name] ?? 0) + 1;
      nameCount[r.name] = count;
      const fileName = count > 1 ? `${r.name}_${count}.sql` : `${r.name}.sql`;
      folder.file(fileName, r.translatedSql);
    }

    let summary = `-- MorphDB Batch Translation Summary\n`;
    summary += `-- Target: ${targetDialect}\n`;
    summary += `-- Files: ${results.length}\n`;
    summary += `-- Successful: ${results.filter((r: { status: string }) => r.status === 'success').length}\n\n`;
    for (const r of results) {
      summary += `-- ${r.name} (${r.type}): ${r.status}`;
      if (r.status === 'success') summary += ` [${r.changes?.length ?? 0} changes, ${r.tokensUsed} tokens]`;
      summary += `\n`;
    }
    folder.file('_summary.sql', summary);

    const zipBase64 = await zip.generateAsync({ type: 'base64' });
    const zipBytes = Buffer.from(zipBase64, 'base64');

    return new Response(zipBytes, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="morphdb_${dialectFolder}_${Date.now()}.zip"`,
      },
    });
  } catch (e) {
    console.error('[Download Error]', e);
    return NextResponse.json({ error: 'Failed to generate download.' }, { status: 500 });
  }
}
