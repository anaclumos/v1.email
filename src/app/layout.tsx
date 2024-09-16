import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/nav-bar'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'v1.email',
  description: 'Create Email Templates',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
        <Analytics />
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  )
}
