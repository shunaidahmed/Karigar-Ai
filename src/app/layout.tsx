import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { BottomNav } from '@/components/layout/BottomNav'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Karigar.ai — Har Karigar, Ek Click Dur',
  description: 'AI Service Orchestrator for Pakistan\'s Informal Economy',
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#059669',
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <AuthProvider>
          <main className="pb-16 max-w-lg mx-auto px-4">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
