"use client";

import React, { useState } from 'react';
import { Copy } from 'lucide-react';

export default function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      let text = '';
      if (typeof children === 'string') {
        text = children;
      } else if (React.isValidElement(children) && typeof children === 'object' && 'props' in children) {
        const props = (children as React.ReactElement<{ children?: string }>).props;
        if (props?.children) {
          text = String(props.children);
        }
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button onClick={handleCopy} className="absolute top-2 right-2 z-10 flex items-center gap-2 px-2 py-1 text-xs rounded bg-white/5 hover:bg-white/10 transition-colors">
        <Copy className="w-4 h-4 text-zinc-200" />
        <span className="text-zinc-200">{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <pre className="bg-[#0a0a0a]/80 text-zinc-100 p-4 rounded-lg overflow-x-auto">{children}</pre>
    </div>
  );
}
