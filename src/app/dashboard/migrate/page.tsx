'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';
import {
  Database, Upload, FileText, Zap, Loader2, CheckCircle2,
  AlertTriangle, Download, ArrowLeft, ArrowRight, Copy, Check,
  X, Trash2, User, LogOut, Settings,
} from 'lucide-react';
import { toast } from 'sonner';

type SourceDialect = 'sql_server' | 'oracle' | 'mysql' | 'postgresql';
type TargetDialect = 'snowflake_dbt' | 'postgresql' | 'bigquery' | 'redshift';

interface TranslationResult {
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
}

interface BatchResponse {
  results: TranslationResult[];
  summary: {
    total: number;
    success: number;
    failed: number;
    totalTokens: number;
    totalDuration: number;
  };
}

const SOURCE_DIALECTS = [
  { value: 'sql_server', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
];

const TARGET_DIALECTS = [
  { value: 'snowflake_dbt', label: 'Snowflake (dbt)' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'redshift', label: 'Redshift' },
];

const TYPE_COLORS: Record<string, string> = {
  CREATE_TABLE: 'text-cyan-400 bg-blue-500/10 border-blue-500/20',
  CREATE_VIEW: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  SELECT: 'text-green-400 bg-green-500/10 border-green-500/20',
  PROCEDURE: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  FUNCTION: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  TRIGGER: 'text-red-400 bg-red-500/10 border-red-500/20',
  OTHER: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
};

const ALL_DIALECTS: Record<string, string> = {
  sql_server: 'SQL Server',
  oracle: 'Oracle',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  snowflake_dbt: 'Snowflake (dbt)',
  bigquery: 'BigQuery',
  redshift: 'Redshift',
};

function getDialectLabel(dialect: string): string {
  return ALL_DIALECTS[dialect] ?? dialect;
}

export default function MigratePage() {
  const [sourceDialect, setSourceDialect] = useState<SourceDialect>('sql_server');
  const [targetDialect, setTargetDialect] = useState<TargetDialect>('snowflake_dbt');
  const [files, setFiles] = useState<File[]>([]);
  const [pastedSql, setPastedSql] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [response, setResponse] = useState<BatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState(0);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState('gpt-4o-mini');
  const [isDragging, setIsDragging] = useState(false);
  const [profile, setProfile] = useState<{ firstName?: string, tier?: string, tierLabel?: string, limits?: { batchesPerDay?: number; statementsPerBatch?: number; filesPerBatch?: number } } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then(r => r.json())
      .then(d => setProfile(d))
      .catch(() => {});
  }, []);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const sqlFiles = Array.from(newFiles).filter(f =>
      f.name.endsWith('.sql') || f.name.endsWith('.txt') || f.type === 'text/plain'
    );
    setFiles(prev => [...prev, ...sqlFiles]);
    setResponse(null);
    setError(null);
  }, []);

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleTranslate = async () => {
    if (!files.length && !pastedSql.trim()) return;

    setIsProcessing(true);
    setProgress(0);
    setResponse(null);
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 8, 90));
    }, 500);

    try {
      const formData = new FormData();
      formData.append('sourceDialect', sourceDialect);
      formData.append('targetDialect', targetDialect);
      formData.append('model', model);
      if (pastedSql.trim()) formData.append('sql', pastedSql);
      files.forEach(f => formData.append('files', f));

      const res = await fetch('/api/migrate/batch', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Batch migration failed');
        throw new Error(data.error || 'Batch migration failed');
      }

      setProgress(100);
      setResponse(data);
      setSelectedResult(0);
      toast.success(`Translated ${data.summary.success}/${data.summary.total} statements successfully`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!response) return;
    try {
      const res = await fetch('/api/migrate/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: response.results, targetDialect }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') ?? 'morphdb_translated.zip';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (e) {
      toast.error('Download failed');
      console.error('Download failed', e);
    }
  };

  const handleCopy = async () => {
    if (!response) return;
    const r = response.results[selectedResult];
    if (r) {
      await navigator.clipboard.writeText(r.translatedSql);
      setCopied(true);
      toast.success('SQL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasInput = files.length > 0 || pastedSql.trim().length > 0;
  const current = response?.results[selectedResult];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <span className="font-bold text-lg tracking-tight hidden sm:inline hover:text-emerald-400 transition-colors">MorphDB</span>
              <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
                Developer Beta
              </span>
              {profile?.tierLabel && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium">
                  {profile.tierLabel}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline text-xs text-zinc-500">
              Up to {profile?.limits?.filesPerBatch || 10} files/batch
            </span>
            {profile?.firstName && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
                <User className="w-4 h-4" />
                {profile.firstName}
              </div>
            )}
            <Link href="/dashboard/settings" className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-white border border-emerald-500/20 rounded-full hover:bg-slate-900/50 transition-colors" title="Settings">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-white border border-emerald-500/20 rounded-full hover:bg-slate-900/50 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      <PageBackground variant="intense" className="flex-grow pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {!response ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Batch Migration</h1>
              <p className="text-zinc-400">Upload SQL files or paste SQL, pick dialects, and translate everything at once.</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">From</span>
                <select value={sourceDialect} onChange={(e) => setSourceDialect(e.target.value as SourceDialect)}
                  className="bg-slate-900/50 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                  {SOURCE_DIALECTS.map(d => <option key={d.value} value={d.value} className="bg-zinc-900">{d.label}</option>)}
                </select>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-600 self-center" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">To</span>
                <select value={targetDialect} onChange={(e) => setTargetDialect(e.target.value as TargetDialect)}
                  className="bg-slate-900/50 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                  {TARGET_DIALECTS.map(d => <option key={d.value} value={d.value} className="bg-zinc-900">{d.label}</option>)}
                </select>
              </div>
              <div className="w-px h-6 bg-white/10 self-center mx-1" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">AI Model</span>
                {profile?.tier === 'free' ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-zinc-400 cursor-not-allowed select-none">
                      GPT-4o Mini
                    </div>
                    <Link href="/#pricing" className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors whitespace-nowrap">
                      <Zap className="w-3 h-3" /> Upgrade for other AI models
                    </Link>
                  </div>
                ) : (
                  <select value={model} onChange={(e) => setModel(e.target.value)}
                    className="bg-slate-900/50 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50">
                    <option value="gpt-4o-mini" className="bg-zinc-900">GPT-4o Mini</option>
                    <option value="claude-haiku" className="bg-zinc-900">Claude Haiku</option>
                    <option value="claude-sonnet" className="bg-zinc-900">Claude Sonnet</option>
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-emerald-500/20 hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".sql,.txt" multiple className="hidden"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragging ? 'text-cyan-400' : 'text-zinc-600'}`} />
                <p className="text-sm text-zinc-300 mb-1">Drop .sql files here or click to browse</p>
                <p className="text-xs text-zinc-600">Supports .sql and .txt files • Max 500KB each</p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/20 bg-white/[0.02]">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs text-zinc-500 font-mono">paste SQL directly</span>
                  <span className="ml-auto text-xs text-zinc-600">{pastedSql.length.toLocaleString()} chars</span>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-0 bottom-0 w-12 bg-white/[0.02] border-r border-emerald-500/20 flex flex-col items-center py-4 text-xs font-mono text-zinc-600 select-none">
                    {Array.from({ length: Math.max(10, pastedSql.split('\n').length) }).map((_, i) => (
                      <span key={i} className="leading-relaxed">{i + 1}</span>
                    ))}
                  </div>
                  <textarea
                    value={pastedSql}
                    onChange={(e) => { setPastedSql(e.target.value); setResponse(null); setError(null); }}
                    placeholder="Paste SQL with multiple statements here...&#10;&#10;CREATE TABLE users (&#10;  id INT PRIMARY KEY,&#10;  name VARCHAR(50)&#10;);"
                    className="w-full pl-16 pr-4 py-4 text-sm font-mono text-emerald-300/90 leading-relaxed bg-transparent resize-none focus:outline-none min-h-[250px] placeholder:text-zinc-700"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Uploaded Files ({files.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-emerald-500/20 rounded-lg text-sm">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-zinc-300">{f.name}</span>
                      <span className="text-xs text-zinc-600">({(f.size / 1024).toFixed(1)}KB)</span>
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-zinc-600 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-start gap-3 p-4 mb-6 bg-red-500/5 border border-red-500/10 rounded-xl text-red-400"
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {isProcessing && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="text-sm text-zinc-400">Translating... {Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button onClick={handleTranslate} disabled={isProcessing || !hasInput}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-lg"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><Zap className="w-5 h-5" /> Translate All</>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Translation Results</h1>
                <p className="text-zinc-400">
                  {getDialectLabel(sourceDialect)} → {getDialectLabel(targetDialect)} •{' '}
                  {response.summary.success}/{response.summary.total} statements translated •{' '}
                  {(response.summary.totalDuration / 1000).toFixed(1)}s total •{' '}
                  {response.summary.totalTokens.toLocaleString()} tokens
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download {response.results.length > 1 ? 'ZIP' : 'SQL'}
                </button>
                <button onClick={() => { setResponse(null); setProgress(0); }}
                  className="flex items-center gap-2 px-5 py-2.5 text-zinc-400 border border-emerald-500/20 rounded-xl hover:bg-slate-900/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> New Batch
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{response.summary.success}</div>
                <div className="text-xs text-zinc-500 mt-1">Successful</div>
              </div>
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{response.summary.failed}</div>
                <div className="text-xs text-zinc-500 mt-1">Failed</div>
              </div>
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{response.summary.totalTokens.toLocaleString()}</div>
                <div className="text-xs text-zinc-500 mt-1">Tokens Used</div>
              </div>
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">{(response.summary.totalDuration / 1000).toFixed(1)}s</div>
                <div className="text-xs text-zinc-500 mt-1">Total Time</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-emerald-500/20 text-sm font-medium text-zinc-400">
                  Statements ({response.results.length})
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {response.results.map((r, i) => (
                    <button key={i} onClick={() => setSelectedResult(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-emerald-500/10 transition-colors ${
                        selectedResult === i ? 'bg-white/10' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div className="min-w-0">
                        <div className="text-sm text-zinc-200 truncate">{r.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_COLORS[r.type] ?? TYPE_COLORS.OTHER}`}>
                            {r.type}
                          </span>
                          <span className="text-[10px] text-zinc-600">{r.fileName}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {current && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold">{current.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLORS[current.type] ?? TYPE_COLORS.OTHER}`}>
                      {current.type}
                    </span>
                    {current.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    <button onClick={handleCopy} className="ml-auto flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 border-b border-emerald-500/20 bg-white/[0.02] text-xs text-zinc-500 font-mono">
                        Original ({current.fileName})
                      </div>
                      <pre className="p-4 text-xs font-mono text-red-400/80 leading-relaxed overflow-auto max-h-[400px] whitespace-pre">
                        {current.originalSql}
                      </pre>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 border-b border-emerald-500/20 bg-blue-500/[0.05] text-xs text-cyan-400 font-mono">
                        Translated
                      </div>
                      {current.status === 'success' ? (
                        <pre className="p-4 text-xs font-mono text-green-400/80 leading-relaxed overflow-auto max-h-[400px] whitespace-pre">
                          {current.translatedSql}
                        </pre>
                      ) : (
                        <div className="p-4 text-sm text-red-400 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          {current.error ?? 'Translation failed'}
                        </div>
                      )}
                    </div>
                  </div>

                  {current.status === 'success' && (current.changes.length > 0 || current.warnings.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {current.changes.length > 0 && (
                        <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4">
                          <h3 className="text-xs font-medium text-cyan-400 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {current.changes.length} Transformations
                          </h3>
                          <ul className="space-y-1">
                            {current.changes.map((c, i) => (
                              <li key={i} className="text-xs text-zinc-400">• {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {current.warnings.length > 0 && (
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                          <h3 className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> {current.warnings.length} Warnings
                          </h3>
                          <ul className="space-y-1">
                            {current.warnings.map((w, i) => (
                              <li key={i} className="text-xs text-zinc-400">• {w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      </PageBackground>
    </div>
  );
}
