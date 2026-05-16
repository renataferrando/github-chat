import type { Metadata } from 'next'
import { inter, jetbrainsMono, fraunces } from '@/src/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'GitHub Profile Chat',
  description: 'Chat with a GitHub profile powered by AI reasoning traces.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
