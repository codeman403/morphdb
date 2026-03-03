import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionManager from "@/components/SessionManager";
import { Toaster } from "sonner";
import CookieConsent from "@/components/ui/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MorphDB | AI Co-Pilot for Database Migrations",
  description: "Legacy schemas in. Modern data stacks out. Automatically translate decades-old Oracle and SQL Server logic into clean, native dbt models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" richColors theme="dark" />
        <SessionManager />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
