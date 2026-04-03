import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'slidenerds',
  description: 'Presentations powered by LLMs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
