import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionManager from "@/components/SessionManager";
import { Toaster } from "sonner";
import CookieConsent from "@/components/ui/CookieConsent";
import { PostHogProvider } from "@/components/PostHogProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://morphdb.io";

export const metadata: Metadata = {
  title: {
    default: "MorphDB | AI Co-Pilot for Database Migrations",
    template: "%s | MorphDB",
  },
  description: "Legacy schemas in. Modern data stacks out. Automatically translate decades-old Oracle and SQL Server logic into clean, native dbt models.",
  keywords: [
    "database migration",
    "Oracle to dbt",
    "SQL Server migration",
    "legacy database conversion",
    "dbt models",
    "data transformation",
    "AI database tool",
    "schema migration",
    "data stack modernization",
  ],
  authors: [{ name: "MorphDB" }],
  creator: "MorphDB",
  publisher: "MorphDB",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "MorphDB",
    title: "MorphDB | AI Co-Pilot for Database Migrations",
    description: "Legacy schemas in. Modern data stacks out. Automatically translate decades-old Oracle and SQL Server logic into clean, native dbt models.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MorphDB - AI-Powered Database Migration Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MorphDB | AI Co-Pilot for Database Migrations",
    description: "Legacy schemas in. Modern data stacks out. Automatically translate decades-old Oracle and SQL Server logic into clean, native dbt models.",
    images: ["/og-image.png"],
    creator: "@morphdb",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have the verification codes
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "MorphDB",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
        },
        sameAs: [
          // Add social media links when available
          // "https://twitter.com/morphdb",
          // "https://linkedin.com/company/morphdb",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "MorphDB",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        name: "MorphDB",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description: "AI-powered database migration tool that translates legacy Oracle and SQL Server schemas into clean, native dbt models.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free tier available with Pro plans for advanced features",
        },
        featureList: [
          "Oracle to dbt migration",
          "SQL Server to dbt migration",
          "AI-powered schema translation",
          "Batch processing",
          "Migration history tracking",
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <Toaster position="top-right" richColors theme="dark" />
          <SessionManager />
          {children}
          <CookieConsent />
        </PostHogProvider>
      </body>
    </html>
  );
}
