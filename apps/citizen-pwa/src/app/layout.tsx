import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import SolanaWalletProvider from '@/components/SolanaWalletProvider'
import PWAStatus from '@/components/PWAStatus'
import SessionStatus from '@/components/SessionStatus'

export const metadata: Metadata = {
  title: 'Gujarat LandChain - Citizen Portal',
  description: 'Secure, transparent land registry powered by blockchain technology',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gujarat LandChain',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Gujarat LandChain',
    title: 'Gujarat LandChain - Citizen Portal',
    description: 'Secure, transparent land registry powered by blockchain technology',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1E40AF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <SolanaWalletProvider>
          <div className="flex flex-col min-h-screen">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-gray-900">
                      Gujarat LandChain
                    </h1>
                  </div>
                  <SessionStatus variant="dropdown" showCountdown={true} showUserInfo={true} />
                </div>
              </div>
            </header>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <PWAStatus />
          </div>
        </SolanaWalletProvider>
      </body>
    </html>
  )
}
