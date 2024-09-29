import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/nav-bar'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: 'v1.email',
  description: 'Create Email Templates',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={cn('min-h-screen bg-background font-sans antialiased')}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-screen flex-col">
              <NavBar />
              {children}
            </div>
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </body>
      </html>
    </>
  )
}
