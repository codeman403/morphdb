"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedLinkCard from '@/components/docs/AnimatedLinkCard';
import { BookOpen, Zap, Shield } from 'lucide-react'; // Settings removed to fix unused import

export default function DocsHomePage() {
  const sections = [
    {
      icon: Zap,
      title: 'Get Started',
      description: 'Learn how to set up MorphDB and start migrating databases',
      href: '/docs/get-started/introduction',
      color: 'text-emerald-500',
    },
    {
      icon: BookOpen,
      title: 'Features',
      description: 'Explore our powerful features designed for safe migrations',
      href: '/docs/features/soft-delete',
      color: 'text-cyan-500',
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Learn about our security practices and compliance standards',
      href: '/docs/features/security',
      color: 'text-green-500',
    },
    /* 
    {
      icon: Settings,
      title: 'API Reference',
      description: 'Complete API documentation for developers',
      href: '/docs/api-reference/endpoints',
      color: 'text-orange-500',
    },
    */
  ];

  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Documentation</h1>
        <p className="text-zinc-400 text-lg">
          Everything you need to know about MorphDB and database migrations.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <AnimatedLinkCard
                href={section.href}
                title={section.title}
                description={section.description}
                Icon={Icon}
                iconColor={section.color}
              />
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-slate-900/50 backdrop-blur-md border border-emerald-500/10 p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-2">Quick Links</h2>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>
            <Link href="/docs/get-started/quick-start" className="text-emerald-400 hover:text-emerald-300 hover:underline">
              Quick Start Guide
            </Link>
          </li>
          <li>
            <Link href="/docs/troubleshooting/faq" className="text-emerald-400 hover:text-emerald-300 hover:underline">
              Frequently Asked Questions
            </Link>
          </li>
          <li>
            <Link href="/docs/changelog" className="text-emerald-400 hover:text-emerald-300 hover:underline">
              View Changelog
            </Link>
          </li>
          <li>
            <Link href="/support" className="text-emerald-400 hover:text-emerald-300 hover:underline">
              Get Help
            </Link>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
