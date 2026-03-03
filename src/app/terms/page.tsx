'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';

export default function TermsOfService() {
  return (
    <div id="main-content" className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <PageBackground
        variant="intense"
        className="flex-grow px-6 py-24 pt-32 relative overflow-hidden"
      >
        <div className="w-full max-w-3xl mx-auto relative z-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-8 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-slate-950/80 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-8 md:p-12">
            <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
            <p className="text-zinc-400 mb-8">Last updated: March 2, 2026</p>

            <div className="space-y-8 text-zinc-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing or using MorphDB (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">2. Description of Service</h2>
                <p className="leading-relaxed">
                  MorphDB is a database migration tool that uses AI to translate SQL queries between different database dialects. The Service includes web-based tools for batch migration, syntax translation, and related features.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">3. User Accounts</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must notify us immediately of any unauthorized access</li>
                  <li>One person or entity may not maintain more than one free account</li>
                  <li>You must be at least 18 years old to use the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">4. Acceptable Use</h2>
                <p className="leading-relaxed mb-3">You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the Service for any illegal purpose or in violation of any laws</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                  <li>Resell, sublicense, or redistribute the Service without permission</li>
                  <li>Use automated systems to access the Service beyond normal API usage</li>
                  <li>Circumvent usage limits or billing mechanisms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">5. Subscription and Billing</h2>
                
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">5.1 Free Tier</h3>
                <p className="leading-relaxed mb-4">
                  The free tier includes limited usage as specified on our pricing page. Free tier features may change at any time.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400 mb-2">5.2 Paid Subscriptions</h3>
                <p className="leading-relaxed mb-4">
                  Paid subscriptions are billed in advance on a monthly or annual basis. You authorize us to charge your payment method on a recurring basis until you cancel.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400 mb-2">5.3 Trials</h3>
                <p className="leading-relaxed mb-4">
                  Free trials are limited to one per user. Abuse of trial offers may result in account termination.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400 mb-2">5.4 Refunds</h3>
                <p className="leading-relaxed">
                  Refunds are handled on a case-by-case basis. Contact support within 14 days of purchase to request a refund.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">6. Intellectual Property</h2>
                
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">6.1 Our Property</h3>
                <p className="leading-relaxed mb-4">
                  The Service, including its design, features, and content, is owned by MorphDB and protected by intellectual property laws. You may not copy, modify, or distribute any part of the Service without permission.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400 mb-2">6.2 Your Content</h3>
                <p className="leading-relaxed">
                  You retain ownership of SQL queries and data you submit. By using the Service, you grant us a limited license to process your content solely to provide the Service. We do not claim ownership of your content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">7. AI-Generated Output</h2>
                <p className="leading-relaxed mb-3">
                  The Service uses AI models to translate SQL queries. You acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>AI-generated translations may contain errors or inaccuracies</li>
                  <li>You are responsible for reviewing and testing all output before use in production</li>
                  <li>We do not guarantee the accuracy, completeness, or fitness of translations</li>
                  <li>You should maintain backups before running any translated migrations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">8. Limitation of Liability</h2>
                <p className="leading-relaxed mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The Service is provided &quot;AS IS&quot; without warranties of any kind</li>
                  <li>We are not liable for any indirect, incidental, special, or consequential damages</li>
                  <li>Our total liability shall not exceed the amount you paid us in the past 12 months</li>
                  <li>We are not responsible for data loss, corruption, or database damage resulting from translated queries</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">9. Indemnification</h2>
                <p className="leading-relaxed">
                  You agree to indemnify and hold harmless MorphDB and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">10. Service Availability</h2>
                <p className="leading-relaxed">
                  We strive to maintain high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time. We will provide reasonable notice for significant changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">11. Termination</h2>
                <p className="leading-relaxed">
                  We may suspend or terminate your account for violation of these Terms or for any other reason at our discretion. Upon termination, your right to use the Service ceases immediately. Sections 6, 8, 9, and 12 survive termination.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">12. Governing Law</h2>
                <p className="leading-relaxed">
                  These Terms shall be governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Delaware.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">13. Changes to Terms</h2>
                <p className="leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes via email or prominent notice on the Service. Continued use after changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">14. Contact</h2>
                <p className="leading-relaxed">
                  For questions about these Terms, visit our{' '}
                  <Link href="/support" className="text-emerald-400 hover:text-emerald-300 underline">
                    support page
                  </Link>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </PageBackground>

      <Footer />
    </div>
  );
}
