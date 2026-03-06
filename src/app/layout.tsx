import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { I18nProvider } from '@/lib/i18n'
import './globals.css'

export const metadata: Metadata = {
  title: 'README Translator',
  description: 'Translate GitHub README files while preserving markdown structure',
  keywords: ['README', 'translator', 'GitHub', 'markdown', 'AI', 'LLM'],
  authors: [{ name: 'README Translator Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for faster loading when available */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Inter and JetBrains Mono fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="system">
          <I18nProvider defaultLocale="zh">
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
