// Font instances for next/font/google.
// Imported by app/layout.tsx (to apply .variable classes to <html>)
// and by any component that needs the font class directly (e.g. Fraunces).

import { Inter, JetBrains_Mono, Fraunces } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
})

// Used only for: composer empty-state headline, chat empty-state.
export const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  style: ['italic'],
  weight: ['400'],
})
