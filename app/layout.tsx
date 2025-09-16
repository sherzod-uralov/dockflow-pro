import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/shared/theme-provider";
import "./globals.css";
import { Geist } from "next/font/google";
import ReactQueryProvider from "@/context/react-query.provider";
import { ClientToaster } from "@/components/shared/client-toast";

const satoshi = Geist({
  subsets: ["latin"],
  variable: "--font-satoshi",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "DockFlow Pro",
  description: "Professional File Management Dashboard",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${satoshi.variable}`}
      >
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={null}>
              {children}
              <ClientToaster />
            </Suspense>
          </ThemeProvider>
        </ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
