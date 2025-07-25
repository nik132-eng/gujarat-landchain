import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import SolanaWalletProvider from '@/components/SolanaWalletProvider'
import PWAStatus from '@/components/PWAStatus'
import SessionStatus from '@/components/SessionStatus'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'Gujarat LandChain - Citizen Portal',
  description: 'Secure, transparent land registry powered by blockchain technology',
  manifest: '/manifest.json',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏠</text></svg>',
  },
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
          <ClientLayout>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
              <PWAStatus />
            </div>
          </ClientLayout>
        </SolanaWalletProvider>
      </body>
    </html>
  )
}
