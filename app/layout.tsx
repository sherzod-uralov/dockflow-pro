import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { MantineProviderWrapper } from "@/providers/mantine-provider";
import { ColorSchemeScript } from "@mantine/core";
import "./globals.css";
import "@/styles/onboarding.css";
import ReactQueryProvider from "@/context/react-query.provider";

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
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <NuqsAdapter>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              forcedTheme="light"
              disableTransitionOnChange
            >
              <MantineProviderWrapper>
                <Suspense fallback={null}>
                  {children}
                </Suspense>
              </MantineProviderWrapper>
            </ThemeProvider>
          </ReactQueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
