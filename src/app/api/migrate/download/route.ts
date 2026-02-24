import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function POST(req: NextRequest) {
  try {
    const { results, targetDialect } = await req.json();

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'No results to download.' }, { status: 400 });
    }

    if (results.length === 1) {
      const r = results[0];
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
    const folder = zip.folder(dialectFolder)!;

    const nameCount: Record<string, number> = {};
    for (const r of results) {
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
