'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface DataFlowNode {
  id: string;
  label: string;
  color: 'cyan' | 'blue' | 'purple';
  icon?: React.ReactNode;
}

interface DataFlowProps {
  nodes: DataFlowNode[];
  animationDelay?: number;
}

const colorMap = {
  cyan: 'bg-cyan-500/20 border-cyan-500 text-cyan-300',
  blue: 'bg-blue-500/20 border-blue-500 text-blue-300',
  purple: 'bg-purple-500/20 border-purple-500 text-purple-300',
};

const glowMap = {
  cyan: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
  blue: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  purple: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
};

export default function DataFlow({ nodes, animationDelay = 0 }: DataFlowProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: animationDelay, duration: 0.6 }}
      className="w-full"
    >
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
        {nodes.map((node, idx) => (
          <div key={node.id} className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: animationDelay + idx * 0.15,
                duration: 0.5,
                type: 'spring',
                stiffness: 100,
              }}
              className="flex flex-col items-center gap-3 min-w-max"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-4 rounded-lg border-2 flex items-center gap-3 backdrop-blur-sm transition-all ${colorMap[node.color]} ${glowMap[node.color]} cursor-pointer`}
              >
                {node.icon && <span className="text-xl">{node.icon}</span>}
                <span className="font-semibold text-sm whitespace-nowrap">{node.label}</span>
              </motion.div>

              <div className="relative h-8 w-1 overflow-hidden">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, 20, 0] }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.3,
                      repeat: Infinity,
                    }}
                    className={`absolute w-1.5 h-1.5 rounded-full ${
                      node.color === 'cyan'
                        ? 'bg-cyan-500'
                        : node.color === 'blue'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {idx < nodes.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: animationDelay + idx * 0.15 + 0.1 }}
                className="text-slate-500 -mx-2"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Connection lines with animated flow */}
      <svg
        className="w-full h-12 -mt-4 overflow-visible pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.5)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.3)" />
          </linearGradient>
          <filter id="flow-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polyline
          points="0,24 100,24"
          stroke="url(#flow-gradient)"
          strokeWidth="2"
          fill="none"
          filter="url(#flow-glow)"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </motion.div>
  );
}
