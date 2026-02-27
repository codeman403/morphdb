"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import React from 'react';

interface Props {
  href: string;
  title: string;
  description: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor?: string;
}

export default function AnimatedLinkCard({ href, title, description, Icon, iconColor = 'text-blue-400' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.28 }}
    >
      <Link href={href} className="group block p-6 rounded-2xl border border-white/10 hover:bg-white/5 hover:scale-[1.01] transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            {Icon ? <Icon className={`w-6 h-6 ${iconColor}`} /> : null}
          </div>
          <svg className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </Link>
    </motion.div>
  );
}
