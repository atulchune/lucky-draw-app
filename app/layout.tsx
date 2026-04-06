import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Lucky Draw Contests - Random Position Assignment',
  description: 'Create exciting lucky draw contests with random position assignments. Perfect for team events, competitions, and fair winner selection.',
  generator: 'v0.app',
  keywords: ['lucky draw', 'random selection', 'contests', 'team events', 'position assignment'],
  openGraph: {
    title: 'Lucky Draw Contests',
    description: 'Create exciting lucky draw contests with random position assignments',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-slate-800 bg-slate-50">
        <Navbar />
        {children}
        <BottomNav />
        <Analytics />
      </body>
    </html>
  )
}
