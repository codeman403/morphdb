'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DataTableProps {
  columns: string[];
  rows: string[][];
  animationDelay?: number;
}

export default function DataTable({ columns, rows, animationDelay = 0 }: DataTableProps) {
  const [displayedRows, setDisplayedRows] = useState<string[][]>([]);

  useEffect(() => {
    // eslint-disable-next-line
    setDisplayedRows([]);
    const interval = setInterval(() => {
      setDisplayedRows((prev) => {
        if (prev.length < rows.length) {
          return [...prev, rows[prev.length]];
        }
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [rows]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.6 }}
      className="w-full border border-slate-700 rounded-lg bg-slate-900/50 overflow-hidden backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex border-b border-slate-700 bg-slate-950">
        {columns.map((col, idx) => (
          <motion.div
            key={col}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationDelay + idx * 0.1 }}
            className="flex-1 px-4 py-3 text-sm font-semibold text-cyan-400 border-r border-slate-700 last:border-r-0"
          >
            {col}
          </motion.div>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-700">
        {displayedRows.map((row, rowIdx) => (
          <motion.div
            key={rowIdx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex bg-slate-900/30 hover:bg-slate-900/60 transition-colors"
          >
            {row.map((cell, cellIdx) => (
              <div
                key={cellIdx}
                className="flex-1 px-4 py-3 text-sm text-slate-300 border-r border-slate-700 last:border-r-0 font-mono"
              >
                {cell}
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Loading indicator when rows are being added */}
      {displayedRows.length < rows.length && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400 bg-slate-950/50 border-t border-slate-700">
          <div className="flex gap-1">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-500"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, delay: 0.2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-blue-500"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, delay: 0.4, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-500"
            />
          </div>
          <span>Loading rows...</span>
        </div>
      )}
    </motion.div>
  );
}
