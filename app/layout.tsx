import type { Metadata, Viewport } from "next";
import localFont from 'next/font/local';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { Toaster } from "sonner";
import { Suspense } from "react";
import "./globals.css";

const gilroy = localFont({
  src: [
    { path: '../font/Gilroy-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../font/Gilroy-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../font/Gilroy-Semibold.woff2', weight: '600', style: 'normal' },
    { path: '../font/Gilroy-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../font/Gilroy-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-gilroy',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
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
      <head>
        {/* Preload critical fonts for better performance */}
        <link
          rel="preload"
          href="/font/Gilroy-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/font/Gilroy-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/font/Gilroy-Semibold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className={`${gilroy.variable} font-sans antialiased`}>
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
                <SupabaseAuthProvider>
                  {children}
                  <Toaster 
                    position="top-right"
                    richColors
                    closeButton
                    theme="system"
                    expand={true}
                    visibleToasts={5}
                  />
                </SupabaseAuthProvider>
              </Suspense>
            </CartProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
