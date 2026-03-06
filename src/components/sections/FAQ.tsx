'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'What databases does MorphDB support?',
    answer: 'MorphDB currently supports migrations from Oracle, SQL Server, MySQL, and PostgreSQL to modern cloud data warehouses including Snowflake, BigQuery, and Redshift. We also generate clean dbt models that work with any dbt-compatible platform.',
  },
  {
    question: 'How accurate is the AI translation?',
    answer: 'Our deterministic AI engine achieves high accuracy by parsing legacy syntax into an intermediate AST (Abstract Syntax Tree) and reconstructing it with logic preservation. However, we always recommend reviewing the output and testing thoroughly before deploying to production.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. MorphDB processes only your SQL code and schema definitions - never your actual data. All processing happens over encrypted connections, and we do not store your SQL code after the migration is complete. See our Privacy Policy for more details.',
  },
  {
    question: 'What\'s included in the free tier?',
    answer: 'The free tier includes up to 50 migrations per month with a 10,000 character limit per file. You can migrate individual files and access our GPT-4o Mini model. For batch processing, larger files, and access to more powerful models, check out our Pro plans.',
  },
  {
    question: 'Can I migrate stored procedures and complex logic?',
    answer: 'Yes! MorphDB is specifically designed to handle complex legacy SQL including stored procedures, functions, triggers, and intricate business logic. Our AI understands vendor-specific syntax and translates it to equivalent modern SQL patterns.',
  },
  {
    question: 'How long does a migration take?',
    answer: 'Most individual file migrations complete in seconds. Batch processing of multiple files typically takes 1-5 minutes depending on complexity and file count. Enterprise migrations with thousands of objects can be scheduled for off-peak processing.',
  },
  {
    question: 'Do you offer enterprise solutions?',
    answer: 'Yes, we offer enterprise plans with dedicated support, custom SLAs, on-premise deployment options, and bulk pricing. Contact our sales team to discuss your specific requirements.',
  },
  {
    question: 'What if the translation isn\'t perfect?',
    answer: 'While our AI produces high-quality translations, some complex vendor-specific features may require manual review. We provide detailed comments in the output highlighting any areas that need attention, and our Pro plans include priority support for troubleshooting.',
  },
];

function FAQItem({ question, answer, isOpen, onToggle, index }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-emerald-500/20 rounded-2xl overflow-hidden bg-slate-950/50 backdrop-blur-sm"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-white font-medium pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-emerald-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-5 text-zinc-400 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // FAQ Schema for SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="faq" className="relative py-24 overflow-visible">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-6"
          >
            <HelpCircle className="w-4 h-4" />
            Common Questions
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Frequently Asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Questions
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            Everything you need to know about MorphDB and database migrations.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              index={index}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-zinc-400 mb-4">Still have questions?</p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}
