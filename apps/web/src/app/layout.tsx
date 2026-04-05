import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemeSelector } from '@/components/layout/ThemeSelector'

export const metadata: Metadata = {
  title: {
    default: 'SlideNerds',
    template: '%s | SlideNerds',
  },
  description: 'Presentations built by AI, powered by code.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <ThemeSelector />
        </ThemeProvider>
      </body>
    </html>
  )
}
