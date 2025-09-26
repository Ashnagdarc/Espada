import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { CartProvider } from '@/contexts/CartContext'
import { LocaleProvider } from '@/contexts/LocaleContext'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Espada - Modern Fashion Store',
  description: 'Discover premium fashion collections with minimalist design and sustainable quality.',
  keywords: ['fashion', 'clothing', 'sustainable', 'premium', 'minimalist'],
  authors: [{ name: 'Espada' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LocaleProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}