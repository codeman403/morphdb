'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
            <p className="text-zinc-400 mb-8">Last updated: March 2, 2026</p>

            <div className="space-y-8 text-zinc-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
                <p className="leading-relaxed">
                  MorphDB (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the MorphDB website and service. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">2. Information We Collect</h2>
                
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">2.1 Account Information</h3>
                <p className="leading-relaxed mb-4">
                  When you create an account, we collect your email address, name, and optionally your company name. This information is used to provide our service, communicate with you, and comply with legal obligations.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400 mb-2">2.2 Usage Data</h3>
                <p className="leading-relaxed mb-2">We automatically collect information about how you use our service:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                  <li>Migration batches and metadata (not the actual SQL content)</li>
                  <li>Token usage and API calls</li>
                  <li>IP address and browser information</li>
                  <li>Login times and general location</li>
                </ul>

                <h3 className="text-lg font-semibold text-emerald-400 mb-2">2.3 Payment Information</h3>
                <p className="leading-relaxed">
                  Payments are processed by Stripe. We do not store credit card details. We only retain Stripe customer IDs and subscription status.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">3. How We Use Your Data</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>To provide and maintain our service</li>
                  <li>To process transactions and send related information</li>
                  <li>To send technical notices and support messages</li>
                  <li>To respond to your comments and questions</li>
                  <li>To analyze usage and improve our service</li>
                  <li>To detect, prevent, and address technical issues</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">4. Data Security</h2>
                <p className="leading-relaxed mb-2">
                  We implement industry-standard security measures including:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>SSL/TLS encryption for all data in transit</li>
                  <li>Database encryption at rest</li>
                  <li>Secure authentication via Supabase</li>
                  <li>Strict access controls and security headers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">5. Data Retention</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Account data:</strong> Retained while your account is active; deleted within 30 days of account deletion</li>
                  <li><strong className="text-white">Migration history:</strong> Retained for 12 months</li>
                  <li><strong className="text-white">Login logs:</strong> Retained for 90 days</li>
                  <li><strong className="text-white">Billing records:</strong> Retained for 7 years for legal compliance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">6. Third-Party Services</h2>
                <p className="leading-relaxed mb-2">We use the following third-party services:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong className="text-white">Supabase:</strong> Authentication and database</li>
                  <li><strong className="text-white">Stripe:</strong> Payment processing</li>
                  <li><strong className="text-white">OpenAI/Anthropic:</strong> AI APIs for SQL translation</li>
                  <li><strong className="text-white">Vercel:</strong> Hosting and CDN</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">7. Your Rights</h2>
                <p className="leading-relaxed mb-2">You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of marketing communications</li>
                </ul>
                <p className="leading-relaxed">
                  To exercise these rights, visit our{' '}
                  <Link href="/support" className="text-emerald-400 hover:text-emerald-300 underline">
                    support page
                  </Link>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">8. Cookies</h2>
                <p className="leading-relaxed">
                  We use essential cookies for authentication and security. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">9. GDPR & CCPA</h2>
                <p className="leading-relaxed mb-3">
                  <strong className="text-white">For EU users (GDPR):</strong> You have rights including access, rectification, erasure, and data portability under the General Data Protection Regulation.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">For California users (CCPA):</strong> You have the right to know, delete, and opt-out of the sale of your personal information. We do not sell personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">10. Changes to This Policy</h2>
                <p className="leading-relaxed">
                  We may update this policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the &quot;last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">11. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have questions about this privacy policy, visit our{' '}
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
