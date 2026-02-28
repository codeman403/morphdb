'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SchemaTable {
  name: string;
  fields: string[];
  color: string;
}

interface SchemaVisualizationProps {
  tables: SchemaTable[];
  animationDelay?: number;
}

export default function SchemaVisualization({ tables, animationDelay = 0 }: SchemaVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawConnections();
    };

    const drawConnections = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
      ctx.lineWidth = 1;

      // Draw simple grid pattern
      const gridSize = 40;
      for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw connecting lines between tables
      if (tables.length > 1) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < tables.length - 1; i++) {
          const x1 = ((i + 0.5) * canvas.width) / tables.length;
          const y1 = canvas.height / 3;
          const x2 = ((i + 1.5) * canvas.width) / tables.length;
          const y2 = (canvas.height * 2) / 3;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(canvas.width / 2, canvas.height / 2, x2, y2);
          ctx.stroke();
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [tables]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.6 }}
      className="w-full h-80 bg-slate-900/30 border border-slate-700 rounded-lg overflow-hidden relative"
    >
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Schema tables */}
      <div className="relative z-10 h-full flex items-end justify-around pb-8 px-4">
        {tables.map((table, idx) => (
          <motion.div
            key={table.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: animationDelay + idx * 0.2,
              duration: 0.5,
            }}
            whileHover={{ scale: 1.05 }}
            className={`flex flex-col gap-1 p-3 rounded-lg border-2 ${table.color} backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg`}
          >
            <div className="font-bold text-sm">{table.name}</div>
            <div className="space-y-1">
              {table.fields.map((field, fieldIdx) => (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: animationDelay + idx * 0.2 + fieldIdx * 0.05,
                  }}
                  className="text-xs opacity-75 font-mono"
                >
                  • {field}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          className="absolute w-1 h-1 bg-cyan-500 rounded-full pointer-events-none"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
        />
      ))}
    </motion.div>
  );
}
