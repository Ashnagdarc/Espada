import type { Metadata, Viewport } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Espada - Modern Fashion Store",
  description:
    "Discover premium fashion collections with minimalist design and sustainable quality.",
  keywords: ["fashion", "clothing", "sustainable", "premium", "minimalist"],
  authors: [{ name: "Espada" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}><StackProvider app={stackClientApp}><StackTheme>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LocaleProvider>
            <CartProvider>
              <Suspense fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                  </div>
                </div>
              }>
                <CustomerAuthProvider>
                  <ToastProvider>{children}</ToastProvider>
                </CustomerAuthProvider>
              </Suspense>
            </CartProvider>
          </LocaleProvider>
        </ThemeProvider>
      </StackTheme></StackProvider></body>
    </html>
  );
}
